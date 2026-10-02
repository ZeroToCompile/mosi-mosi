export type MotionFormat = "BP" | "Asian" | "WSDC" | "Public Forum";
export type MotionDifficulty = "Novice" | "Open" | "Advanced";
export type MotionTheme =
  | "Politics"
  | "Economy"
  | "Society"
  | "Tech"
  | "IR"
  | "Ethics";

export type Motion = {
  id: string;
  text: string;
  format: MotionFormat;
  theme: MotionTheme;
  difficulty: MotionDifficulty;
  year: number;
  tournament?: string;
  tags: string[];
};

export const MOTION_FORMATS: MotionFormat[] = [
  "BP",
  "Asian",
  "WSDC",
  "Public Forum",
];

export const MOTION_THEMES: MotionTheme[] = [
  "Politics",
  "Economy",
  "Society",
  "Tech",
  "IR",
  "Ethics",
];

export const MOTION_DIFFICULTIES: MotionDifficulty[] = [
  "Novice",
  "Open",
  "Advanced",
];

export const MOCK_MOTIONS: Motion[] = [
  {
    id: "m-01",
    text: "This House would ban private schools.",
    format: "BP",
    theme: "Society",
    difficulty: "Open",
    year: 2024,
    tournament: "WUDC",
    tags: ["education", "equality"],
  },
  {
    id: "m-02",
    text: "This House believes that liberal democracies should refuse to host major sporting events in authoritarian states.",
    format: "BP",
    theme: "IR",
    difficulty: "Advanced",
    year: 2023,
    tournament: "EUDC",
    tags: ["sport", "soft power"],
  },
  {
    id: "m-03",
    text: "THW require social media platforms to algorithmically promote opposing political viewpoints.",
    format: "Asian",
    theme: "Tech",
    difficulty: "Open",
    year: 2025,
    tournament: "Australs",
    tags: ["speech", "platforms"],
  },
  {
    id: "m-04",
    text: "This House regrets the rise of gig economy platforms.",
    format: "BP",
    theme: "Economy",
    difficulty: "Novice",
    year: 2022,
    tags: ["labour", "markets"],
  },
  {
    id: "m-05",
    text: "THBT the international community should recognize a right to secession for ethnic minorities under sustained repression.",
    format: "WSDC",
    theme: "IR",
    difficulty: "Advanced",
    year: 2024,
    tournament: "WSDC",
    tags: ["self-determination", "minorities"],
  },
  {
    id: "m-06",
    text: "This House would abolish intellectual property rights for life-saving medicines.",
    format: "BP",
    theme: "Ethics",
    difficulty: "Open",
    year: 2021,
    tournament: "Oxford IV",
    tags: ["health", "IP"],
  },
  {
    id: "m-07",
    text: "THW prioritize nuclear energy over renewables in the green transition.",
    format: "Public Forum",
    theme: "Tech",
    difficulty: "Open",
    year: 2025,
    tags: ["climate", "energy"],
  },
  {
    id: "m-08",
    text: "This House prefers a world without political parties.",
    format: "BP",
    theme: "Politics",
    difficulty: "Advanced",
    year: 2020,
    tournament: "Cambridge IV",
    tags: ["democracy", "institutions"],
  },
  {
    id: "m-09",
    text: "THBT developing countries should reject foreign aid that comes with governance conditions.",
    format: "Asian",
    theme: "IR",
    difficulty: "Open",
    year: 2023,
    tournament: "UADC",
    tags: ["aid", "sovereignty"],
  },
  {
    id: "m-10",
    text: "This House would make voting compulsory.",
    format: "BP",
    theme: "Politics",
    difficulty: "Novice",
    year: 2024,
    tags: ["elections", "civic duty"],
  },
  {
    id: "m-11",
    text: "THW ban targeted advertising.",
    format: "WSDC",
    theme: "Tech",
    difficulty: "Novice",
    year: 2022,
    tournament: "WSDC",
    tags: ["privacy", "ads"],
  },
  {
    id: "m-12",
    text: "This House regrets the cultural dominance of English.",
    format: "BP",
    theme: "Society",
    difficulty: "Open",
    year: 2021,
    tournament: "Manchester IV",
    tags: ["language", "culture"],
  },
  {
    id: "m-13",
    text: "THBT central banks should target employment over inflation.",
    format: "Asian",
    theme: "Economy",
    difficulty: "Advanced",
    year: 2025,
    tags: ["monetary policy", "jobs"],
  },
  {
    id: "m-14",
    text: "This House would allow athletes to use performance-enhancing drugs.",
    format: "Public Forum",
    theme: "Ethics",
    difficulty: "Open",
    year: 2023,
    tags: ["sport", "fairness"],
  },
  {
    id: "m-15",
    text: "THW require tech companies to open-source models used in public-facing AI products.",
    format: "BP",
    theme: "Tech",
    difficulty: "Advanced",
    year: 2025,
    tournament: "Harvard IV",
    tags: ["AI", "transparency"],
  },
  {
    id: "m-16",
    text: "This House believes that restorative justice should replace incarceration for non-violent offences.",
    format: "WSDC",
    theme: "Society",
    difficulty: "Open",
    year: 2024,
    tags: ["criminal justice", "punishment"],
  },
];
