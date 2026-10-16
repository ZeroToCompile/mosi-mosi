/** Difficulties stored on the matter row. */
export const MATTER_DIFFICULTIES = [
  'Beginner',
  'Intermediate',
  'Expert',
] as const;
export type MatterDifficulty = (typeof MATTER_DIFFICULTIES)[number];

/**
 * One row in `matter_bank.matters`.
 */
export type Matter = {
  id: string;
  title: string;
  slug: string;
  description: string;
  summary: string;
  coverImageUrl: string;
  difficulty: MatterDifficulty;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MatterRow = {
  id: string;
  title: string;
  content: string;
  description: string;
  created_at: Date;
  updated_at: Date;
};
