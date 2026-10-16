/** Debate formats stored on the motion row. */
export const MOTION_FORMATS = ['BP', 'Asian', 'WSDC', 'Public Forum'] as const;
export type MotionFormat = (typeof MOTION_FORMATS)[number];

/** Levels stored on the motion row. Called "level" in the Motion Bank UI. */
export const MOTION_DIFFICULTIES = ['Novice', 'Open', 'Advanced'] as const;
export type MotionDifficulty = (typeof MOTION_DIFFICULTIES)[number];

/** Sort keys used by `motion_bank.search`. */
export const MOTION_SORTS = ['newest', 'oldest', 'az'] as const;
export type MotionSort = (typeof MOTION_SORTS)[number];

/**
 * One row in `motion_bank.motions`.
 * Theme and tags are foreign keys. Tournament is a detached name label for now.
 */
export type Motion = {
  id: string;
  text: string;
  format: MotionFormat;
  themeId: string;
  difficulty: MotionDifficulty;
  year: number;
  tournament: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MotionRow = {
  id: string;
  text: string;
  format: MotionFormat;
  theme_id: string;
  difficulty: MotionDifficulty;
  year: number;
  tournament: string | null;
  created_at: Date;
  updated_at: Date;
};

/**
 * One row of `motion_bank.catalogue` / `motion_bank.search`.
 * Theme and tag names are joined; tournament stays a plain label.
 */
export type MotionCatalogue = {
  id: string;
  text: string;
  format: MotionFormat;
  themeId: string;
  theme: string;
  difficulty: MotionDifficulty;
  year: number;
  tournament: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type MotionCatalogueRow = {
  id: string;
  text: string;
  format: MotionFormat;
  theme_id: string;
  theme: string;
  difficulty: MotionDifficulty;
  year: number;
  tournament: string | null;
  tags: string[];
  created_at: Date;
  updated_at: Date;
};

/** Arguments for `SELECT * FROM motion_bank.search($1, $2, $3, $4, $5)`. Theme is the theme name. */
export type MotionSearchParams = {
  query?: string | null;
  format?: MotionFormat | null;
  theme?: string | null;
  difficulty?: MotionDifficulty | null;
  sort?: MotionSort | null;
};

export function toMotion(row: MotionRow): Motion {
  return {
    id: row.id,
    text: row.text,
    format: row.format,
    themeId: row.theme_id,
    difficulty: row.difficulty,
    year: row.year,
    tournament: row.tournament,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toMotionCatalogue(row: MotionCatalogueRow): MotionCatalogue {
  return {
    id: row.id,
    text: row.text,
    format: row.format,
    themeId: row.theme_id,
    theme: row.theme,
    difficulty: row.difficulty,
    year: row.year,
    tournament: row.tournament,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
