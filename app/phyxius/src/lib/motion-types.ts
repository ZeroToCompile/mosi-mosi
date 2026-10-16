export const MOTION_FORMATS = [
  "BP",
  "Asian",
  "WSDC",
  "Public Forum",
] as const;
export type MotionFormat = (typeof MOTION_FORMATS)[number];

export const MOTION_DIFFICULTIES = ["Novice", "Open", "Advanced"] as const;
export type MotionDifficulty = (typeof MOTION_DIFFICULTIES)[number];

export type MotionCatalogueItem = {
  id: string;
  text: string;
  format: MotionFormat;
  themeId: string;
  theme: string;
  difficulty: MotionDifficulty;
  year: number;
  tournament: string | null;
  tags: string[];
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
};

/** Shape used by the public Motion Bank list UI. */
export type Motion = {
  id: string;
  text: string;
  format: MotionFormat;
  theme: string;
  difficulty: MotionDifficulty;
  year: number;
  tournament: string | null;
  tags: string[];
};

export type MotionInput = {
  text: string;
  format: MotionFormat;
  themeId: string;
  difficulty: MotionDifficulty;
  year: number;
  tournament: string | null;
  tagIds: string[];
};

export type MotionActionResult =
  | { ok: true; item?: MotionCatalogueItem }
  | { ok: false; error: string };

export function toMotionListItem(item: MotionCatalogueItem): Motion {
  return {
    id: item.id,
    text: item.text,
    format: item.format,
    theme: item.theme,
    difficulty: item.difficulty,
    year: item.year,
    tournament: item.tournament,
    tags: item.tags,
  };
}
