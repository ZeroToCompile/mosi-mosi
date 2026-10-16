-- Tournament registry template schema.
--
-- Detached for now: people lists and institution are free text / text[].
-- Wire foreign keys later when person and institution tables exist.
--
-- Apply once against the mosi database:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f app/brain/src/tournaments/core/entities/schema.sql
--
-- Optional sample rows:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f app/brain/src/tournaments/core/entities/seed.sql

BEGIN;

CREATE SCHEMA IF NOT EXISTS tournaments;

COMMENT ON SCHEMA tournaments IS
  'Tournament registry: events, staff lists, and host institution (detached).';

CREATE TYPE tournaments.tournament_format AS ENUM (
  'BP',
  'Asian',
  'WSDC',
  'Public Forum'
);

-- CHECK cannot use subqueries; validate list entries through this helper.
CREATE OR REPLACE FUNCTION tournaments.text_array_entries_ok(entries text[])
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM unnest(COALESCE(entries, '{}'::text[])) AS entry
    WHERE entry IS NULL OR entry <> btrim(entry) OR btrim(entry) = ''
  );
$$;

CREATE TABLE tournaments.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date_start date NOT NULL,
  date_end date NOT NULL,
  format tournaments.tournament_format NOT NULL,
  cap_list text[] NOT NULL DEFAULT '{}'::text[],
  tabber_list text[] NOT NULL DEFAULT '{}'::text[],
  debater_list text[] NOT NULL DEFAULT '{}'::text[],
  organizer text NOT NULL,
  institution text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tournaments_name_not_blank CHECK (char_length(btrim(name)) > 0),
  CONSTRAINT tournaments_name_trimmed CHECK (name = btrim(name)),
  CONSTRAINT tournaments_name_unique UNIQUE (name),
  CONSTRAINT tournaments_dates_ordered CHECK (date_end >= date_start),
  CONSTRAINT tournaments_organizer_not_blank CHECK (char_length(btrim(organizer)) > 0),
  CONSTRAINT tournaments_organizer_trimmed CHECK (organizer = btrim(organizer)),
  CONSTRAINT tournaments_institution_not_blank CHECK (char_length(btrim(institution)) > 0),
  CONSTRAINT tournaments_institution_trimmed CHECK (institution = btrim(institution)),
  CONSTRAINT tournaments_cap_list_ok CHECK (tournaments.text_array_entries_ok(cap_list)),
  CONSTRAINT tournaments_tabber_list_ok CHECK (tournaments.text_array_entries_ok(tabber_list)),
  CONSTRAINT tournaments_debater_list_ok CHECK (tournaments.text_array_entries_ok(debater_list))
);

COMMENT ON TABLE tournaments.tournaments IS
  'One debate tournament. CAP / tabber / debater lists and institution are detached text for now.';
COMMENT ON COLUMN tournaments.tournaments.cap_list IS
  'Chief Adjudicator Panel names. Free text until a person FK exists.';
COMMENT ON COLUMN tournaments.tournaments.tabber_list IS
  'Tabulation team names. Free text until a person FK exists.';
COMMENT ON COLUMN tournaments.tournaments.debater_list IS
  'Registered debater names. Free text until a person FK exists.';
COMMENT ON COLUMN tournaments.tournaments.organizer IS
  'Organizing body or contact as free text.';
COMMENT ON COLUMN tournaments.tournaments.institution IS
  'Host institution as free text until an institution FK exists.';

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX tournaments_date_start_idx
  ON tournaments.tournaments (date_start DESC, id);

CREATE INDEX tournaments_format_idx
  ON tournaments.tournaments (format, date_start DESC);

CREATE INDEX tournaments_name_trgm_idx
  ON tournaments.tournaments USING gin (name gin_trgm_ops);

CREATE INDEX tournaments_institution_trgm_idx
  ON tournaments.tournaments USING gin (institution gin_trgm_ops);

CREATE INDEX tournaments_cap_list_gin_idx
  ON tournaments.tournaments USING gin (cap_list);

CREATE INDEX tournaments_tabber_list_gin_idx
  ON tournaments.tournaments USING gin (tabber_list);

CREATE INDEX tournaments_debater_list_gin_idx
  ON tournaments.tournaments USING gin (debater_list);

CREATE OR REPLACE FUNCTION tournaments.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tournaments_set_updated_at
  BEFORE UPDATE ON tournaments.tournaments
  FOR EACH ROW
  EXECUTE FUNCTION tournaments.set_updated_at();

COMMIT;
