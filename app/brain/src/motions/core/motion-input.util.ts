import {
  MOTION_DIFFICULTIES,
  MOTION_FORMATS,
  type MotionDifficulty,
  type MotionFormat,
} from './entities/motion.entity';
import { isUuid, normalizeLookupName } from './lookup.util';

export type MotionInput = {
  text: string;
  format: MotionFormat;
  themeId: string;
  difficulty: MotionDifficulty;
  year: number;
  tournament: string | null;
  tagIds: string[];
};

export function parseMotionInput(body: unknown): MotionInput {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Request body is required');
  }

  const raw = body as Record<string, unknown>;
  const text = normalizeLookupName(raw.text);
  if (!text) {
    throw new Error('Motion text is required');
  }
  if (text.length > 2000) {
    throw new Error('Motion text must be 2000 characters or fewer');
  }

  if (
    typeof raw.format !== 'string' ||
    !(MOTION_FORMATS as readonly string[]).includes(raw.format)
  ) {
    throw new Error(`Format must be one of: ${MOTION_FORMATS.join(', ')}`);
  }

  if (typeof raw.themeId !== 'string' || !isUuid(raw.themeId)) {
    throw new Error('A valid theme is required');
  }

  if (
    typeof raw.difficulty !== 'string' ||
    !(MOTION_DIFFICULTIES as readonly string[]).includes(raw.difficulty)
  ) {
    throw new Error(
      `Difficulty must be one of: ${MOTION_DIFFICULTIES.join(', ')}`,
    );
  }

  const year =
    typeof raw.year === 'number'
      ? raw.year
      : typeof raw.year === 'string'
        ? Number(raw.year)
        : NaN;
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new Error('Year must be an integer between 1900 and 2100');
  }

  let tournament: string | null = null;
  if (raw.tournament != null && raw.tournament !== '') {
    if (typeof raw.tournament !== 'string') {
      throw new Error('Tournament must be text');
    }
    tournament = raw.tournament.trim();
    if (!tournament) {
      tournament = null;
    } else if (tournament.length > 200) {
      throw new Error('Tournament must be 200 characters or fewer');
    }
  }

  const tagIds = normalizeTagIds(raw.tagIds);

  return {
    text,
    format: raw.format as MotionFormat,
    themeId: raw.themeId,
    difficulty: raw.difficulty as MotionDifficulty,
    year,
    tournament,
    tagIds,
  };
}

function normalizeTagIds(raw: unknown): string[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) {
    throw new Error('tagIds must be an array of tag ids');
  }

  const ids: string[] = [];
  const seen = new Set<string>();
  for (const entry of raw) {
    if (typeof entry !== 'string' || !isUuid(entry)) {
      throw new Error('tagIds must contain valid tag ids');
    }
    if (seen.has(entry)) continue;
    seen.add(entry);
    ids.push(entry);
  }
  return ids;
}

export { isUuid };
