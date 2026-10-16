/** Debate formats a tournament can run. */
export const TOURNAMENT_FORMATS = [
  'BP',
  'Asian',
  'WSDC',
  'Public Forum',
] as const;
export type TournamentFormat = (typeof TOURNAMENT_FORMATS)[number];

/**
 * One row in `tournaments.tournaments`.
 *
 * Detached for now: CAP / tabber / debater lists and institution are free text.
 * Foreign keys (people, institutions, motions) can be wired later.
 */
export type Tournament = {
  id: string;
  name: string;
  dateStart: string;
  dateEnd: string;
  format: TournamentFormat;
  capList: string[];
  tabberList: string[];
  debaterList: string[];
  organizer: string;
  institution: string;
  createdAt: Date;
  updatedAt: Date;
};

/** Snake-case row returned by `pg` before it is mapped to {@link Tournament}. */
export type TournamentRow = {
  id: string;
  name: string;
  date_start: string;
  date_end: string;
  format: TournamentFormat;
  cap_list: string[];
  tabber_list: string[];
  debater_list: string[];
  organizer: string;
  institution: string;
  created_at: Date;
  updated_at: Date;
};

export function toTournament(row: TournamentRow): Tournament {
  return {
    id: row.id,
    name: row.name,
    dateStart: row.date_start,
    dateEnd: row.date_end,
    format: row.format,
    capList: row.cap_list,
    tabberList: row.tabber_list,
    debaterList: row.debater_list,
    organizer: row.organizer,
    institution: row.institution,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
