import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  toTournament,
  type Tournament,
  type TournamentRow,
} from './core/entities/tournament.entity';
import {
  formatPgDate,
  isUuid,
  parseTournamentInput,
  type TournamentInput,
} from './core/parse.util';

@Injectable()
export class TournamentsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<Tournament[]> {
    const result = await this.db.query<TournamentRow>(
      `SELECT
         id,
         name,
         date_start,
         date_end,
         format,
         cap_list,
         tabber_list,
         debater_list,
         organizer,
         institution,
         created_at,
         updated_at
       FROM tournaments.tournaments
       ORDER BY date_start DESC, name ASC`,
    );

    return result.rows.map((row) => this.mapRow(row));
  }

  async findOne(id: string): Promise<Tournament> {
    this.assertId(id);

    const result = await this.db.query<TournamentRow>(
      `SELECT
         id,
         name,
         date_start,
         date_end,
         format,
         cap_list,
         tabber_list,
         debater_list,
         organizer,
         institution,
         created_at,
         updated_at
       FROM tournaments.tournaments
       WHERE id = $1`,
      [id],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Tournament not found');
    }

    return this.mapRow(row);
  }

  async create(body: unknown): Promise<Tournament> {
    const input = this.parseBody(body);

    try {
      const result = await this.db.query<TournamentRow>(
        `INSERT INTO tournaments.tournaments (
           name,
           date_start,
           date_end,
           format,
           cap_list,
           tabber_list,
           debater_list,
           organizer,
           institution
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING
           id,
           name,
           date_start,
           date_end,
           format,
           cap_list,
           tabber_list,
           debater_list,
           organizer,
           institution,
           created_at,
           updated_at`,
        this.toParams(input),
      );

      return this.mapRow(result.rows[0]);
    } catch (error) {
      this.rethrowUnique(error);
    }
  }

  async update(id: string, body: unknown): Promise<Tournament> {
    this.assertId(id);
    const input = this.parseBody(body);

    try {
      const result = await this.db.query<TournamentRow>(
        `UPDATE tournaments.tournaments
         SET
           name = $2,
           date_start = $3,
           date_end = $4,
           format = $5,
           cap_list = $6,
           tabber_list = $7,
           debater_list = $8,
           organizer = $9,
           institution = $10
         WHERE id = $1
         RETURNING
           id,
           name,
           date_start,
           date_end,
           format,
           cap_list,
           tabber_list,
           debater_list,
           organizer,
           institution,
           created_at,
           updated_at`,
        [id, ...this.toParams(input)],
      );

      if (!result.rows[0]) {
        throw new NotFoundException('Tournament not found');
      }

      return this.mapRow(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.rethrowUnique(error);
    }
  }

  async remove(id: string): Promise<void> {
    this.assertId(id);

    const result = await this.db.query(
      `DELETE FROM tournaments.tournaments WHERE id = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Tournament not found');
    }
  }

  private mapRow(row: TournamentRow): Tournament {
    return toTournament({
      ...row,
      date_start: formatPgDate(row.date_start),
      date_end: formatPgDate(row.date_end),
    });
  }

  private parseBody(body: unknown): TournamentInput {
    try {
      return parseTournamentInput(body);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Invalid tournament payload';
      throw new BadRequestException(message);
    }
  }

  private toParams(input: TournamentInput): unknown[] {
    return [
      input.name,
      input.dateStart,
      input.dateEnd,
      input.format,
      input.capList,
      input.tabberList,
      input.debaterList,
      input.organizer,
      input.institution,
    ];
  }

  private assertId(id: string) {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid tournament id');
    }
  }

  private rethrowUnique(error: unknown): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === '23505'
    ) {
      throw new ConflictException('A tournament with that name already exists');
    }
    throw error;
  }
}
