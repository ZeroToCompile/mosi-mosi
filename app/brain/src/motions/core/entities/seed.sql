-- Sample Motion Bank rows. Same sixteen motions as the web mock catalogue.
-- Run after schema.sql. Safe to re-run: existing motion text is left in place,
-- and theme / tag links are filled in for those rows.

BEGIN;

CREATE TEMP TABLE motion_seed (
  text text PRIMARY KEY,
  format motion_bank.motion_format NOT NULL,
  theme text NOT NULL,
  difficulty motion_bank.motion_difficulty NOT NULL,
  year smallint NOT NULL,
  tournament text,
  tags text[] NOT NULL
) ON COMMIT DROP;

INSERT INTO motion_seed (text, format, theme, difficulty, year, tournament, tags)
VALUES
  (
    'This House would ban private schools.',
    'BP',
    'Society',
    'Open',
    2024,
    'WUDC',
    ARRAY['education', 'equality']
  ),
  (
    'This House believes that liberal democracies should refuse to host major sporting events in authoritarian states.',
    'BP',
    'IR',
    'Advanced',
    2023,
    'EUDC',
    ARRAY['sport', 'soft power']
  ),
  (
    'THW require social media platforms to algorithmically promote opposing political viewpoints.',
    'Asian',
    'Tech',
    'Open',
    2025,
    'Australs',
    ARRAY['speech', 'platforms']
  ),
  (
    'This House regrets the rise of gig economy platforms.',
    'BP',
    'Economy',
    'Novice',
    2022,
    NULL,
    ARRAY['labour', 'markets']
  ),
  (
    'THBT the international community should recognize a right to secession for ethnic minorities under sustained repression.',
    'WSDC',
    'IR',
    'Advanced',
    2024,
    'WSDC',
    ARRAY['self-determination', 'minorities']
  ),
  (
    'This House would abolish intellectual property rights for life-saving medicines.',
    'BP',
    'Ethics',
    'Open',
    2021,
    'Oxford IV',
    ARRAY['health', 'IP']
  ),
  (
    'THW prioritize nuclear energy over renewables in the green transition.',
    'Public Forum',
    'Tech',
    'Open',
    2025,
    NULL,
    ARRAY['climate', 'energy']
  ),
  (
    'This House prefers a world without political parties.',
    'BP',
    'Politics',
    'Advanced',
    2020,
    'Cambridge IV',
    ARRAY['democracy', 'institutions']
  ),
  (
    'THBT developing countries should reject foreign aid that comes with governance conditions.',
    'Asian',
    'IR',
    'Open',
    2023,
    'UADC',
    ARRAY['aid', 'sovereignty']
  ),
  (
    'This House would make voting compulsory.',
    'BP',
    'Politics',
    'Novice',
    2024,
    NULL,
    ARRAY['elections', 'civic duty']
  ),
  (
    'THW ban targeted advertising.',
    'WSDC',
    'Tech',
    'Novice',
    2022,
    'WSDC',
    ARRAY['privacy', 'ads']
  ),
  (
    'This House regrets the cultural dominance of English.',
    'BP',
    'Society',
    'Open',
    2021,
    'Manchester IV',
    ARRAY['language', 'culture']
  ),
  (
    'THBT central banks should target employment over inflation.',
    'Asian',
    'Economy',
    'Advanced',
    2025,
    NULL,
    ARRAY['monetary policy', 'jobs']
  ),
  (
    'This House would allow athletes to use performance-enhancing drugs.',
    'Public Forum',
    'Ethics',
    'Open',
    2023,
    NULL,
    ARRAY['sport', 'fairness']
  ),
  (
    'THW require tech companies to open-source models used in public-facing AI products.',
    'BP',
    'Tech',
    'Advanced',
    2025,
    'Harvard IV',
    ARRAY['AI', 'transparency']
  ),
  (
    'This House believes that restorative justice should replace incarceration for non-violent offences.',
    'WSDC',
    'Society',
    'Open',
    2024,
    NULL,
    ARRAY['criminal justice', 'punishment']
  );

INSERT INTO motion_bank.themes (name)
SELECT DISTINCT theme
FROM motion_seed
ON CONFLICT (name) DO NOTHING;

INSERT INTO motion_bank.tags (name)
SELECT DISTINCT tag
FROM motion_seed
CROSS JOIN LATERAL unnest(tags) AS tag
ON CONFLICT (name) DO NOTHING;

INSERT INTO motion_bank.motions (text, format, theme_id, difficulty, year, tournament)
SELECT s.text, s.format, th.id, s.difficulty, s.year, s.tournament
FROM motion_seed AS s
JOIN motion_bank.themes AS th ON th.name = s.theme
WHERE NOT EXISTS (
  SELECT 1
  FROM motion_bank.motions AS m
  WHERE m.text = s.text
);

INSERT INTO motion_bank.motion_tags (motion_id, tag_id)
SELECT m.id, t.id
FROM motion_seed AS s
JOIN motion_bank.motions AS m ON m.text = s.text
CROSS JOIN LATERAL unnest(s.tags) AS tag_name
JOIN motion_bank.tags AS t ON t.name = tag_name
ON CONFLICT DO NOTHING;

COMMIT;
