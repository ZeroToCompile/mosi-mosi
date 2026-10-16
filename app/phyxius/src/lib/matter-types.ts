export const MATTER_KINDS = [
  "Fact",
  "Statistic",
  "Example",
  "Definition",
  "Framing",
  "Rebuttal",
  "Quote",
] as const;

export type MatterKind = (typeof MATTER_KINDS)[number];

export const MATTER_THEMES = [
  "Society",
  "IR",
  "Tech",
  "Economy",
  "Ethics",
  "Politics",
] as const;

export type MatterTheme = (typeof MATTER_THEMES)[number];

export type MatterNote = {
  id: string;
  title: string;
  body: string;
  kind: MatterKind;
  theme: MatterTheme;
  tags: string[];
  source: string | null;
  highlighted: boolean;
  createdAt: string;
};

export type KeywordOfTheDay = {
  term: string;
  gloss: string;
};

export const KEYWORDS_OF_THE_DAY: KeywordOfTheDay[] = [
  {
    term: "Burden",
    gloss:
      "Who has to prove the motion is the better world. In most rooms that is the proposition, and the proof has to beat the status quo — not merely describe a problem.",
  },
  {
    term: "Fiat",
    gloss:
      "The room grants that the motion happens. Spend the speech on the world after it, not on whether parliament would find the votes.",
  },
  {
    term: "Clash",
    gloss:
      "The point the two benches actually disagree on. Without it you get two speeches that never touch.",
  },
  {
    term: "Weighing",
    gloss:
      "How you tell the judge which impact wins: how likely, how large, how soon, and who bears it.",
  },
  {
    term: "Mechanism",
    gloss:
      "The steps between the motion and the outcome. “It would be better” is a wish. A mechanism names who acts, and why they would.",
  },
  {
    term: "Stakeholder",
    gloss:
      "A person the motion changes. Name them, then say what is different about their Tuesday.",
  },
  {
    term: "Principle",
    gloss:
      "A rule you claim should decide the round even when the consequences are mixed. Say the rule, then say why this motion is the case it governs.",
  },
  {
    term: "Counterfactual",
    gloss:
      "The world you compare against. If you never say what happens without the motion, you have not made a comparative claim.",
  },
  {
    term: "Link",
    gloss:
      "The chain from the motion to the harm or the benefit. A missing link is where the other bench will attack.",
  },
  {
    term: "Framing",
    gloss:
      "The question you want the debate to answer. Win the frame and the other side’s facts are about the wrong thing.",
  },
];

export const SEED_MATTERS: MatterNote[] = [
  {
    id: "seed-poverty",
    title: "Extreme poverty fell before the pandemic",
    body: "The share of people in extreme poverty fell from about 38% in 1990 to under 10% in the years before COVID-19. Use it when a bench claims growth never reaches the poorest — then say what the motion does to that trend. The burden is to show the policy beats this path, not merely that poverty still exists.",
    kind: "Fact",
    theme: "Economy",
    tags: ["development", "burden"],
    source: "World Bank",
    highlighted: true,
    createdAt: "2026-10-14",
  },
  {
    id: "seed-warming",
    title: "About 1.1°C is already in the record",
    body: "IPCC AR6 finds global surface temperature in 2011–2020 was about 1.1°C above 1850–1900. The weighing move is timeframe: harms already in the system, versus the decades a new plant or a new model takes to arrive.",
    kind: "Fact",
    theme: "Tech",
    tags: ["climate", "weighing"],
    source: "IPCC AR6",
    highlighted: false,
    createdAt: "2026-09-02",
  },
  {
    id: "seed-life",
    title: "Life expectancy more than doubled",
    body: "Global life expectancy rose from about 32 years at the start of the twentieth century to more than 70 today. It is the cleanest statistic for “the long trend is not misery,” and it still leaves room to say who was left out.",
    kind: "Statistic",
    theme: "Society",
    tags: ["development", "progress"],
    source: "Our World in Data",
    highlighted: false,
    createdAt: "2026-08-18",
  },
  {
    id: "seed-mental",
    title: "One in eight people live with a mental disorder",
    body: "WHO’s 2022 report puts the figure at roughly one in eight people. Name the stakeholder — a worker, a student, a person on a platform — when the motion touches care or attention. The number is the scale. The mechanism is what changes for that person.",
    kind: "Statistic",
    theme: "Society",
    tags: ["health", "stakeholder"],
    source: "WHO, World mental health report 2022",
    highlighted: false,
    createdAt: "2026-07-21",
  },
  {
    id: "seed-prisons",
    title: "More than 11 million people are imprisoned",
    body: "The World Prison Brief counts more than 11 million people in penal institutions. Magnitude matters in a restorative-justice case: even a policy aimed at non-violent offences sits inside a system this large.",
    kind: "Statistic",
    theme: "Society",
    tags: ["justice", "magnitude"],
    source: "World Prison Brief",
    highlighted: true,
    createdAt: "2026-10-02",
  },
  {
    id: "seed-kerala",
    title: "Kerala is the development-without-waiting example",
    body: "Benches reach for Kerala when they want literacy and public health without claiming a country must get rich first. Keep the mechanism narrow: primary care, school enrolment, and political priority. “The Kerala model” is not itself an argument.",
    kind: "Example",
    theme: "Society",
    tags: ["health", "education", "mechanism"],
    source: null,
    highlighted: false,
    createdAt: "2026-06-11",
  },
  {
    id: "seed-australia-vote",
    title: "Australia has compelled federal voting since 1924",
    body: "Compulsory voting is not a hypothetical. Australia has required it at federal elections since 1924. Fiat gets you the law. This example is for what turnout looks like after a century of it, including the fine and the informal ballot.",
    kind: "Example",
    theme: "Politics",
    tags: ["democracy", "fiat"],
    source: null,
    highlighted: false,
    createdAt: "2026-05-04",
  },
  {
    id: "seed-precaution",
    title: "Precautionary principle",
    body: "Act to avoid a serious, hard-to-reverse harm even when the science is incomplete. It is not “ban anything uncertain.” A tight version names the harm, why waiting destroys the option, and which reversible step you are refusing.",
    kind: "Definition",
    theme: "Ethics",
    tags: ["risk", "principle"],
    source: null,
    highlighted: false,
    createdAt: "2026-04-16",
  },
  {
    id: "seed-mill",
    title: "The harm principle",
    body: "“The only purpose for which power can be rightfully exercised over any member of a civilized community, against his will, is to prevent harm to others.” Use the line to frame a liberty case, then do the work the quotation does not do: say what counts as harm in this motion.",
    kind: "Quote",
    theme: "Ethics",
    tags: ["speech", "principle", "liberty"],
    source: "J.S. Mill, On Liberty (1859)",
    highlighted: true,
    createdAt: "2026-03-09",
  },
  {
    id: "seed-rights-frame",
    title: "Win the question before the numbers",
    body: "If the motion trades a right for a gain, say so in the first minute. A framing line: this debate is about whether a right can be priced, not about which policy has the larger spreadsheet. Consequences still matter. They answer the question you set.",
    kind: "Framing",
    theme: "Ethics",
    tags: ["framing", "rights", "weighing"],
    source: null,
    highlighted: false,
    createdAt: "2026-10-16",
  },
  {
    id: "seed-slope",
    title: "How to answer a slippery slope",
    body: "A slope is only an argument if each step is likely. Ask for the link: who takes the next step, why they would, and what stops them. “This could lead to” is not a mechanism. Offer the bright line the motion actually draws.",
    kind: "Rebuttal",
    theme: "Politics",
    tags: ["rebuttal", "mechanism", "link"],
    source: null,
    highlighted: false,
    createdAt: "2026-10-13",
  },
  {
    id: "seed-gig",
    title: "Gig work is a mechanism fight",
    body: "The stakeholder is the worker who cannot see next week’s hours. Proposition needs a mechanism from the platform’s incentives to insecure pay. Opposition needs a mechanism from flexibility to people who could not take a shift job. Do not stop at the labels.",
    kind: "Framing",
    theme: "Economy",
    tags: ["labour", "mechanism", "stakeholder"],
    source: null,
    highlighted: false,
    createdAt: "2026-10-15",
  },
  {
    id: "seed-sportswashing",
    title: "The stadium is the soft-power mechanism",
    body: "Hosting is the example when a state buys a spotlight — Beijing, Sochi, Qatar. The link is not that sport is pleasant. It is cameras, sponsors, and a calendar that makes a government behave as a host. If you cannot say what is being bought, you do not have a link.",
    kind: "Example",
    theme: "IR",
    tags: ["sport", "soft power", "link"],
    source: null,
    highlighted: false,
    createdAt: "2026-09-20",
  },
  {
    id: "seed-secrecy",
    title: "Secrecy is not a safety case",
    body: "Against opening public AI models, the other bench will say secrecy prevents misuse. The counterfactual is not a locked box: weights leak, and closed labs still ship. Ask what audit, liability, or a narrower release does that a mood of secrecy does not.",
    kind: "Rebuttal",
    theme: "Tech",
    tags: ["ai", "rebuttal", "counterfactual"],
    source: null,
    highlighted: false,
    createdAt: "2026-10-12",
  },
  {
    id: "seed-self-determination",
    title: "Self-determination is a people, not a mood",
    body: "Here it means a people with a sustained political identity choosing their own state arrangements. It is not any region that is unhappy. Define the people, the repression or the democratic ask, and what happens to those who voted no.",
    kind: "Definition",
    theme: "IR",
    tags: ["secession", "definition", "principle"],
    source: null,
    highlighted: false,
    createdAt: "2026-08-01",
  },
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-");
  const monthIndex = Number(month) - 1;
  const label = MONTHS[monthIndex] ?? month;
  return `${Number(day)} ${label} ${year}`;
}

export function shiftDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return todayKey(date);
}

export function indexForDate(dateKey: string, length: number) {
  if (length <= 0) return 0;
  let hash = 0;
  for (const char of dateKey) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash % length;
}

export function keywordForDate(dateKey: string) {
  return KEYWORDS_OF_THE_DAY[
    indexForDate(dateKey, KEYWORDS_OF_THE_DAY.length)
  ];
}

export function countThisWeek(notes: MatterNote[], today: string) {
  const start = shiftDateKey(today, -6);
  return notes.filter((note) => {
    const day = note.createdAt.slice(0, 10);
    return day >= start && day <= today;
  }).length;
}
