import {
  MATTER_KINDS,
  MATTER_THEMES,
  SEED_MATTERS,
  type MatterNote,
} from "@/lib/matter-types";

const STORAGE_KEY = "mosimosi.matter.v1";

type MatterStore = {
  created: MatterNote[];
  highlights: Record<string, boolean>;
};

function isMatterNote(value: unknown): value is MatterNote {
  if (!value || typeof value !== "object") return false;
  const note = value as MatterNote;
  return (
    typeof note.id === "string" &&
    typeof note.title === "string" &&
    typeof note.body === "string" &&
    MATTER_KINDS.includes(note.kind) &&
    MATTER_THEMES.includes(note.theme) &&
    Array.isArray(note.tags) &&
    note.tags.every((tag) => typeof tag === "string") &&
    (note.source === null || typeof note.source === "string") &&
    typeof note.highlighted === "boolean" &&
    typeof note.createdAt === "string"
  );
}

function readStore(): MatterStore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<MatterStore>;
    if (!parsed || !Array.isArray(parsed.created)) return null;
    const created = parsed.created.filter(isMatterNote);
    const highlights: Record<string, boolean> = {};
    if (parsed.highlights && typeof parsed.highlights === "object") {
      for (const [id, value] of Object.entries(parsed.highlights)) {
        if (typeof value === "boolean") highlights[id] = value;
      }
    }
    return { created, highlights };
  } catch {
    return null;
  }
}

export function loadMatterNotes(): MatterNote[] {
  const store = readStore();
  if (!store) return SEED_MATTERS;

  const seeded = SEED_MATTERS.map((note) =>
    store.highlights[note.id] === undefined
      ? note
      : { ...note, highlighted: store.highlights[note.id] },
  );

  const seedIds = new Set(SEED_MATTERS.map((note) => note.id));
  const created = store.created.filter((note) => !seedIds.has(note.id));
  return [...created, ...seeded];
}

export function saveMatterNotes(notes: MatterNote[]) {
  if (typeof window === "undefined") return;
  const seedById = new Map(SEED_MATTERS.map((note) => [note.id, note]));
  const highlights: Record<string, boolean> = {};
  const created: MatterNote[] = [];

  for (const note of notes) {
    const seed = seedById.get(note.id);
    if (!seed) {
      created.push(note);
      continue;
    }
    if (note.highlighted !== seed.highlighted) {
      highlights[note.id] = note.highlighted;
    }
  }

  const payload: MatterStore = { created, highlights };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}
