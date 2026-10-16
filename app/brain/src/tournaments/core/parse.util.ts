import {
  TOURNAMENT_FORMATS,
  type TournamentFormat,
} from './entities/tournament.entity';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

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

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function normalizeRequiredText(
  raw: unknown,
  label: string,
  maxLength = 200,
): string {
  if (typeof raw !== 'string') {
    throw new Error(`${label} is required`);
  }
  const value = raw.trim();
  if (!value) {
    throw new Error(`${label} is required`);
  }
  if (value.length > maxLength) {
    throw new Error(`${label} must be ${maxLength} characters or fewer`);
  }
  return value;
}

export function normalizeDate(raw: unknown, label: string): string {
  if (typeof raw !== 'string' || !DATE_RE.test(raw.trim())) {
    throw new Error(`${label} must be a date in YYYY-MM-DD format`);
  }
  const value = raw.trim();
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(`${label} must be a valid calendar date`);
  }
  return value;
}

export function normalizeFormat(raw: unknown): TournamentFormat {
  if (
    typeof raw !== 'string' ||
    !(TOURNAMENT_FORMATS as readonly string[]).includes(raw)
  ) {
    throw new Error(`Format must be one of: ${TOURNAMENT_FORMATS.join(', ')}`);
  }
  return raw as TournamentFormat;
}

export function normalizeNameList(raw: unknown, label: string): string[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) {
    throw new Error(`${label} must be an array of names`);
  }

  const names: string[] = [];
  for (const entry of raw) {
    if (typeof entry !== 'string') {
      throw new Error(`${label} must contain only text names`);
    }
    const name = entry.trim();
    if (!name) {
      throw new Error(`${label} entries cannot be blank`);
    }
    if (name.length > 120) {
      throw new Error(`${label} entries must be 120 characters or fewer`);
    }
    names.push(name);
  }
  return names;
}

export function parseTournamentInput(body: unknown): TournamentInput {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Request body is required');
  }

  const raw = body as Record<string, unknown>;
  const name = normalizeRequiredText(raw.name, 'Name');
  const dateStart = normalizeDate(raw.dateStart, 'Start date');
  const dateEnd = normalizeDate(raw.dateEnd, 'End date');
  if (dateEnd < dateStart) {
    throw new Error('End date must be on or after the start date');
  }

  return {
    name,
    dateStart,
    dateEnd,
    format: normalizeFormat(raw.format),
    capList: normalizeNameList(raw.capList, 'CAP list'),
    tabberList: normalizeNameList(raw.tabberList, 'Tabber list'),
    debaterList: normalizeNameList(raw.debaterList, 'Debater list'),
    organizer: normalizeRequiredText(raw.organizer, 'Organizer'),
    institution: normalizeRequiredText(raw.institution, 'Institution'),
  };
}

export function formatPgDate(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}
