import { SEED_MATTERS, type MatterNote } from "@/lib/matter-types";

export const LABEL_KINDS = ["topic", "group", "collection", "tag"] as const;

export type LabelKind = (typeof LABEL_KINDS)[number];

export type ArticleLabels = {
  topic: string[];
  group: string[];
  collection: string[];
  tag: string[];
};

export type ArticleLabel = {
  kind: LabelKind;
  name: string;
};

const LABEL_HEADING: Record<LabelKind, string> = {
  topic: "Topics",
  group: "Groups",
  collection: "Collections",
  tag: "Tags",
};

export function labelHeading(kind: LabelKind) {
  return LABEL_HEADING[kind];
}

/**
 * Filing is many-to-many. An article is not inside a topic;
 * it carries topics, groups, collections, and tags at once.
 */
const MEMBERSHIP: Record<string, Partial<ArticleLabels>> = {
  "seed-poverty": {
    topic: ["Economy", "Society"],
    group: ["Open cases"],
    collection: ["Development"],
  },
  "seed-warming": {
    topic: ["Tech", "Ethics"],
    group: ["Open cases"],
    collection: ["Climate"],
  },
  "seed-life": {
    topic: ["Society"],
    group: ["Open cases"],
    collection: ["Development", "Care"],
  },
  "seed-mental": {
    topic: ["Society"],
    group: ["Open cases"],
    collection: ["Care"],
  },
  "seed-prisons": {
    topic: ["Society", "Ethics"],
    group: ["Open cases"],
    collection: ["Justice"],
  },
  "seed-kerala": {
    topic: ["Society"],
    group: ["Examples"],
    collection: ["Development", "Care"],
  },
  "seed-australia-vote": {
    topic: ["Politics"],
    group: ["Examples"],
    collection: ["Democracy"],
  },
  "seed-precaution": {
    topic: ["Ethics", "Tech"],
    group: ["Lines to reuse"],
    collection: ["Climate"],
  },
  "seed-mill": {
    topic: ["Ethics"],
    group: ["Lines to reuse"],
    collection: ["Liberty"],
  },
  "seed-rights-frame": {
    topic: ["Ethics"],
    group: ["Lines to reuse", "Mechanism drills"],
    collection: ["Liberty"],
  },
  "seed-slope": {
    topic: ["Politics"],
    group: ["Mechanism drills"],
    collection: ["Democracy"],
  },
  "seed-gig": {
    topic: ["Economy"],
    group: ["Mechanism drills"],
    collection: ["Labour"],
  },
  "seed-sportswashing": {
    topic: ["IR"],
    group: ["Examples"],
    collection: ["Soft power"],
  },
  "seed-secrecy": {
    topic: ["Tech", "Ethics"],
    group: ["Mechanism drills"],
    collection: ["Models"],
  },
  "seed-self-determination": {
    topic: ["IR", "Politics"],
    group: ["Lines to reuse"],
    collection: ["Soft power"],
  },
};

export function articleLabels(note: MatterNote): ArticleLabels {
  const extra = MEMBERSHIP[note.id];
  const topics = extra?.topic?.length ? extra.topic : [note.theme];
  return {
    topic: topics,
    group: extra?.group ?? [],
    collection: extra?.collection ?? [],
    tag: note.tags,
  };
}

export function articleLabelList(note: MatterNote): ArticleLabel[] {
  const labels = articleLabels(note);
  return LABEL_KINDS.flatMap((kind) =>
    labels[kind].map((name) => ({ kind, name })),
  );
}

export function sameLabel(a: ArticleLabel, b: ArticleLabel) {
  return a.kind === b.kind && a.name === b.name;
}

export function carries(note: MatterNote, label: ArticleLabel) {
  return articleLabels(note)[label.kind].includes(label.name);
}

export type LabelCount = ArticleLabel & { count: number };

export function labelCounts(notes: MatterNote[]): Record<LabelKind, LabelCount[]> {
  const buckets = Object.fromEntries(
    LABEL_KINDS.map((kind) => [kind, new Map<string, number>()]),
  ) as Record<LabelKind, Map<string, number>>;

  for (const note of notes) {
    const labels = articleLabels(note);
    for (const kind of LABEL_KINDS) {
      for (const name of labels[kind]) {
        buckets[kind].set(name, (buckets[kind].get(name) ?? 0) + 1);
      }
    }
  }

  return Object.fromEntries(
    LABEL_KINDS.map((kind) => [
      kind,
      [...buckets[kind].entries()]
        .map(([name, count]) => ({ kind, name, count }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    ]),
  ) as Record<LabelKind, LabelCount[]>;
}

export function browseArticles() {
  return SEED_MATTERS;
}
