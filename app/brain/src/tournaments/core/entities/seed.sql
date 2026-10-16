-- Sample tournament registry rows. Safe to re-run: existing names are left alone.

BEGIN;

CREATE TEMP TABLE tournament_seed (
  name text PRIMARY KEY,
  date_start date NOT NULL,
  date_end date NOT NULL,
  format tournaments.tournament_format NOT NULL,
  cap_list text[] NOT NULL,
  tabber_list text[] NOT NULL,
  debater_list text[] NOT NULL,
  organizer text NOT NULL,
  institution text NOT NULL
) ON COMMIT DROP;

INSERT INTO tournament_seed (
  name,
  date_start,
  date_end,
  format,
  cap_list,
  tabber_list,
  debater_list,
  organizer,
  institution
)
VALUES
  (
    'WUDC',
    '2024-12-27',
    '2025-01-04',
    'BP',
    ARRAY['Alex Rivera', 'Mei Chen'],
    ARRAY['Jordan Lee'],
    ARRAY['Sam Okonkwo', 'Priya Nair'],
    'WUDC Organizing Committee',
    'University of Manila'
  ),
  (
    'EUDC',
    '2023-08-05',
    '2023-08-12',
    'BP',
    ARRAY['Elena Petrov'],
    ARRAY['Tomáš Novák', 'Inès Moreau'],
    ARRAY['Lukas Weber'],
    'EUDC Council',
    'Central European University'
  ),
  (
    'Australs',
    '2025-07-07',
    '2025-07-14',
    'Asian',
    ARRAY['Hannah Park'],
    ARRAY['Chris Tan'],
    ARRAY['Aisha Rahman', 'Noah Blake'],
    'Australs Host Committee',
    'University of Melbourne'
  ),
  (
    'WSDC',
    '2024-07-14',
    '2024-07-24',
    'WSDC',
    ARRAY['Sofia Alvarez'],
    ARRAY['Kenji Mori'],
    ARRAY['Amelia Croft'],
    'World Schools Debating Championships',
    'International School of Bangkok'
  ),
  (
    'Oxford IV',
    '2021-11-12',
    '2021-11-14',
    'BP',
    ARRAY['James Caldwell'],
    ARRAY['Ruth Patel'],
    ARRAY['Daniel Cho'],
    'Oxford Union Debating Society',
    'University of Oxford'
  ),
  (
    'Cambridge IV',
    '2020-11-13',
    '2020-11-15',
    'BP',
    ARRAY['Claire Hughes'],
    ARRAY['Owen Marsh'],
    ARRAY['Fatima Yusuf'],
    'Cambridge Union Society',
    'University of Cambridge'
  ),
  (
    'UADC',
    '2023-05-20',
    '2023-05-27',
    'Asian',
    ARRAY['Ravi Menon'],
    ARRAY['Siti Aziz'],
    ARRAY['Jin Park', 'Maya Cruz'],
    'UADC Organizing Committee',
    'Ateneo de Manila University'
  ),
  (
    'Manchester IV',
    '2021-03-05',
    '2021-03-07',
    'BP',
    ARRAY['Ben Foster'],
    ARRAY['Nina Shah'],
    ARRAY['Leo Grant'],
    'Manchester Debating Union',
    'University of Manchester'
  ),
  (
    'Harvard IV',
    '2025-02-14',
    '2025-02-16',
    'BP',
    ARRAY['Grace Kim'],
    ARRAY['Marcus Holt'],
    ARRAY['Ivy Chen', 'Omar Haddad'],
    'Harvard Debate Council',
    'Harvard University'
  );

INSERT INTO tournaments.tournaments (
  name,
  date_start,
  date_end,
  format,
  cap_list,
  tabber_list,
  debater_list,
  organizer,
  institution
)
SELECT
  s.name,
  s.date_start,
  s.date_end,
  s.format,
  s.cap_list,
  s.tabber_list,
  s.debater_list,
  s.organizer,
  s.institution
FROM tournament_seed AS s
WHERE NOT EXISTS (
  SELECT 1
  FROM tournaments.tournaments AS t
  WHERE t.name = s.name
);

COMMIT;
