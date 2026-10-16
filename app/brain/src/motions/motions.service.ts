import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../database/database.service';
import {
  toMotionCatalogue,
  type MotionCatalogue,
  type MotionCatalogueRow,
  type MotionDifficulty,
  type MotionFormat,
} from './core/entities/motion.entity';
import {
  isUuid,
  parseMotionInput,
  type MotionInput,
} from './core/motion-input.util';

type CatalogueQueryRow = MotionCatalogueRow & {
  tag_ids: string[];
};

export type MotionCatalogueItem = MotionCatalogue & {
  tagIds: string[];
};

@Injectable()
export class MotionsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(filters?: {
    query?: string | null;
    format?: string | null;
    theme?: string | null;
    difficulty?: string | null;
    sort?: string | null;
  }): Promise<MotionCatalogueItem[]> {
    const sort = filters?.sort || 'newest';
    const params: unknown[] = [];
    const where: string[] = [];

    if (filters?.format) {
      params.push(filters.format);
      where.push(`c.format = $${params.length}::motion_bank.motion_format`);
    }
    if (filters?.theme) {
      params.push(filters.theme.trim());
      where.push(`c.theme = $${params.length}`);
    }
    if (filters?.difficulty) {
      params.push(filters.difficulty);
      where.push(
        `c.difficulty = $${params.length}::motion_bank.motion_difficulty`,
      );
    }
    if (filters?.query && filters.query.trim()) {
      const pattern = `%${filters.query
        .trim()
        .replace(/\\/g, '\\\\')
        .replace(/%/g, '\\%')
        .replace(/_/g, '\\_')}%`;
      params.push(pattern);
      const p = `$${params.length}`;
      where.push(`(
        c.text ILIKE ${p} ESCAPE '\\'
        OR c.format::text ILIKE ${p} ESCAPE '\\'
        OR c.theme ILIKE ${p} ESCAPE '\\'
        OR c.difficulty::text ILIKE ${p} ESCAPE '\\'
        OR c.tournament ILIKE ${p} ESCAPE '\\'
        OR EXISTS (
          SELECT 1 FROM unnest(c.tags) AS tag WHERE tag ILIKE ${p} ESCAPE '\\'
        )
      )`);
    }

    const orderBy =
      sort === 'az'
        ? 'c.text ASC, c.id ASC'
        : sort === 'oldest'
          ? 'c.year ASC, c.id ASC'
          : 'c.year DESC, c.id ASC';

    const result = await this.db.query<CatalogueQueryRow>(
      `${this.catalogueSelect()}
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY ${orderBy}`,
      params,
    );

    return result.rows.map((row) => this.mapRow(row));
  }

  async findOne(id: string): Promise<MotionCatalogueItem> {
    this.assertId(id);

    const result = await this.db.query<CatalogueQueryRow>(
      `${this.catalogueSelect()}
       WHERE c.id = $1`,
      [id],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Motion not found');
    }

    return this.mapRow(row);
  }

  async create(body: unknown): Promise<MotionCatalogueItem> {
    const input = this.parseBody(body);
    await this.assertThemeExists(input.themeId);
    await this.assertTagsExist(input.tagIds);

    const client = await this.db.client.connect();
    try {
      await client.query('BEGIN');
      const inserted = await client.query<{ id: string }>(
        `INSERT INTO motion_bank.motions (
           text, format, theme_id, difficulty, year, tournament
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          input.text,
          input.format,
          input.themeId,
          input.difficulty,
          input.year,
          input.tournament,
        ],
      );
      const id = inserted.rows[0].id;
      await this.replaceTags(client, id, input.tagIds);
      await client.query('COMMIT');
      return this.findOne(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id: string, body: unknown): Promise<MotionCatalogueItem> {
    this.assertId(id);
    const input = this.parseBody(body);
    await this.assertThemeExists(input.themeId);
    await this.assertTagsExist(input.tagIds);

    const client = await this.db.client.connect();
    try {
      await client.query('BEGIN');
      const updated = await client.query(
        `UPDATE motion_bank.motions
         SET
           text = $2,
           format = $3,
           theme_id = $4,
           difficulty = $5,
           year = $6,
           tournament = $7
         WHERE id = $1`,
        [
          id,
          input.text,
          input.format,
          input.themeId,
          input.difficulty,
          input.year,
          input.tournament,
        ],
      );

      if (updated.rowCount === 0) {
        throw new NotFoundException('Motion not found');
      }

      await this.replaceTags(client, id, input.tagIds);
      await client.query('COMMIT');
      return this.findOne(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async remove(id: string): Promise<void> {
    this.assertId(id);
    const result = await this.db.query(
      `DELETE FROM motion_bank.motions WHERE id = $1`,
      [id],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('Motion not found');
    }
  }

  private catalogueSelect() {
    return `SELECT
       c.id,
       c.text,
       c.format,
       c.theme_id,
       c.theme,
       c.difficulty,
       c.year,
       c.tournament,
       c.tags,
       c.created_at,
       c.updated_at,
       COALESCE(
         (
           SELECT array_agg(mt.tag_id ORDER BY t.name)
           FROM motion_bank.motion_tags AS mt
           JOIN motion_bank.tags AS t ON t.id = mt.tag_id
           WHERE mt.motion_id = c.id
         ),
         '{}'::uuid[]
       ) AS tag_ids
     FROM motion_bank.catalogue AS c`;
  }

  private async replaceTags(
    client: PoolClient,
    motionId: string,
    tagIds: string[],
  ) {
    await client.query(
      `DELETE FROM motion_bank.motion_tags WHERE motion_id = $1`,
      [motionId],
    );

    for (const tagId of tagIds) {
      await client.query(
        `INSERT INTO motion_bank.motion_tags (motion_id, tag_id)
         VALUES ($1, $2)`,
        [motionId, tagId],
      );
    }
  }

  private async assertThemeExists(themeId: string) {
    const result = await this.db.query(
      `SELECT 1 FROM motion_bank.themes WHERE id = $1`,
      [themeId],
    );
    if (result.rowCount === 0) {
      throw new BadRequestException('Theme not found');
    }
  }

  private async assertTagsExist(tagIds: string[]) {
    if (tagIds.length === 0) return;
    const result = await this.db.query<{ id: string }>(
      `SELECT id FROM motion_bank.tags WHERE id = ANY($1::uuid[])`,
      [tagIds],
    );
    if (result.rowCount !== tagIds.length) {
      throw new BadRequestException('One or more tags were not found');
    }
  }

  private mapRow(row: CatalogueQueryRow): MotionCatalogueItem {
    const catalogue = toMotionCatalogue({
      id: row.id,
      text: row.text,
      format: row.format as MotionFormat,
      theme_id: row.theme_id,
      theme: row.theme,
      difficulty: row.difficulty as MotionDifficulty,
      year: Number(row.year),
      tournament: row.tournament,
      tags: row.tags ?? [],
      created_at: row.created_at,
      updated_at: row.updated_at,
    });

    return {
      ...catalogue,
      tagIds: (row.tag_ids ?? []).map(String),
    };
  }

  private parseBody(body: unknown): MotionInput {
    try {
      return parseMotionInput(body);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Invalid motion payload';
      throw new BadRequestException(message);
    }
  }

  private assertId(id: string) {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid motion id');
    }
  }
}
