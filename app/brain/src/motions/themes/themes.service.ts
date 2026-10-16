import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { isUuid, normalizeLookupName } from '../core/lookup.util';
import type { Theme } from '../core/entities/theme.entity';

export type ThemeWithUsage = Theme & { usageCount: number };

type ThemeUsageRow = {
  id: string;
  name: string;
  usage_count: number;
};

@Injectable()
export class ThemesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<ThemeWithUsage[]> {
    const result = await this.db.query<ThemeUsageRow>(
      `SELECT
         th.id,
         th.name,
         COUNT(m.id)::int AS usage_count
       FROM motion_bank.themes AS th
       LEFT JOIN motion_bank.motions AS m ON m.theme_id = th.id
       GROUP BY th.id
       ORDER BY th.name ASC`,
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      usageCount: row.usage_count,
    }));
  }

  async findOne(id: string): Promise<ThemeWithUsage> {
    this.assertId(id);

    const result = await this.db.query<ThemeUsageRow>(
      `SELECT
         th.id,
         th.name,
         COUNT(m.id)::int AS usage_count
       FROM motion_bank.themes AS th
       LEFT JOIN motion_bank.motions AS m ON m.theme_id = th.id
       WHERE th.id = $1
       GROUP BY th.id`,
      [id],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Theme not found');
    }

    return {
      id: row.id,
      name: row.name,
      usageCount: row.usage_count,
    };
  }

  async create(rawName: unknown): Promise<ThemeWithUsage> {
    const name = this.requireName(rawName);

    try {
      const result = await this.db.query<{ id: string; name: string }>(
        `INSERT INTO motion_bank.themes (name)
         VALUES ($1)
         RETURNING id, name`,
        [name],
      );

      return { ...result.rows[0], usageCount: 0 };
    } catch (error) {
      this.rethrowUnique(error, 'A theme with that name already exists');
    }
  }

  async update(id: string, rawName: unknown): Promise<ThemeWithUsage> {
    this.assertId(id);
    const name = this.requireName(rawName);

    try {
      const result = await this.db.query<{ id: string; name: string }>(
        `UPDATE motion_bank.themes
         SET name = $2
         WHERE id = $1
         RETURNING id, name`,
        [id, name],
      );

      if (!result.rows[0]) {
        throw new NotFoundException('Theme not found');
      }

      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.rethrowUnique(error, 'A theme with that name already exists');
    }
  }

  async remove(id: string): Promise<void> {
    this.assertId(id);

    const usage = await this.db.query<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM motion_bank.motions
       WHERE theme_id = $1`,
      [id],
    );

    if ((usage.rows[0]?.count ?? 0) > 0) {
      throw new ConflictException(
        'Theme is used by one or more motions and cannot be deleted',
      );
    }

    const result = await this.db.query(
      `DELETE FROM motion_bank.themes WHERE id = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Theme not found');
    }
  }

  private assertId(id: string) {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid theme id');
    }
  }

  private requireName(raw: unknown): string {
    const name = normalizeLookupName(raw);
    if (!name) {
      throw new BadRequestException('Name is required');
    }
    if (name.length > 120) {
      throw new BadRequestException('Name must be 120 characters or fewer');
    }
    return name;
  }

  private rethrowUnique(error: unknown, message: string): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === '23505'
    ) {
      throw new ConflictException(message);
    }
    throw error;
  }
}
