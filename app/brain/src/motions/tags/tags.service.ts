import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { isUuid, normalizeLookupName } from '../core/lookup.util';
import type { Tag } from '../core/entities/tag.entity';

export type TagWithUsage = Tag & { usageCount: number };

type TagUsageRow = {
  id: string;
  name: string;
  usage_count: number;
};

@Injectable()
export class TagsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<TagWithUsage[]> {
    const result = await this.db.query<TagUsageRow>(
      `SELECT
         t.id,
         t.name,
         COUNT(mt.motion_id)::int AS usage_count
       FROM motion_bank.tags AS t
       LEFT JOIN motion_bank.motion_tags AS mt ON mt.tag_id = t.id
       GROUP BY t.id
       ORDER BY t.name ASC`,
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      usageCount: row.usage_count,
    }));
  }

  async findOne(id: string): Promise<TagWithUsage> {
    this.assertId(id);

    const result = await this.db.query<TagUsageRow>(
      `SELECT
         t.id,
         t.name,
         COUNT(mt.motion_id)::int AS usage_count
       FROM motion_bank.tags AS t
       LEFT JOIN motion_bank.motion_tags AS mt ON mt.tag_id = t.id
       WHERE t.id = $1
       GROUP BY t.id`,
      [id],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Tag not found');
    }

    return {
      id: row.id,
      name: row.name,
      usageCount: row.usage_count,
    };
  }

  async create(rawName: unknown): Promise<TagWithUsage> {
    const name = this.requireName(rawName);

    try {
      const result = await this.db.query<{ id: string; name: string }>(
        `INSERT INTO motion_bank.tags (name)
         VALUES ($1)
         RETURNING id, name`,
        [name],
      );

      return { ...result.rows[0], usageCount: 0 };
    } catch (error) {
      this.rethrowUnique(error, 'A tag with that name already exists');
    }
  }

  async update(id: string, rawName: unknown): Promise<TagWithUsage> {
    this.assertId(id);
    const name = this.requireName(rawName);

    try {
      const result = await this.db.query<{ id: string; name: string }>(
        `UPDATE motion_bank.tags
         SET name = $2
         WHERE id = $1
         RETURNING id, name`,
        [id, name],
      );

      if (!result.rows[0]) {
        throw new NotFoundException('Tag not found');
      }

      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.rethrowUnique(error, 'A tag with that name already exists');
    }
  }

  async remove(id: string): Promise<void> {
    this.assertId(id);

    const result = await this.db.query(
      `DELETE FROM motion_bank.tags WHERE id = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Tag not found');
    }
  }

  private assertId(id: string) {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid tag id');
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
