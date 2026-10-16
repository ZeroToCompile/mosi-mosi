export const TOURNAMENT_FORMATS = [
  "BP",
  "Asian",
  "WSDC",
  "Public Forum",
] as const;

export type TournamentFormat = (typeof TOURNAMENT_FORMATS)[number];

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
  createdAt: string;
  updatedAt: string;
};

export type TournamentInput = {
  name: string;
  dateStart: string;
  dateEnd: string;
  format: TournamentFormat;
  capList: string[];
  tabberList: string[];
  debaterList: string[];
  organizer: string;
  institution: string;
};

export type TournamentActionResult =
  | { ok: true; item?: Tournament }
  | { ok: false; error: string };
