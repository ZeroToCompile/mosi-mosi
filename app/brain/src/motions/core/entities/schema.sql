-- Motion Bank template schema.
--
-- Motions store format, level, year, and an optional tournament name label.
-- Theme and tags are lookup tables. The full tournament registry lives in the
-- separate `tournaments` schema and stays detached from this catalogue for now.
--
-- Apply once against the mosi database:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f app/brain/src/motions/core/entities/schema.sql
--
-- Optional sample rows (the current mock catalogue):
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f app/brain/src/motions/core/entities/seed.sql
--
-- Read path used by the bank. The theme argument is the theme name:
--   SELECT * FROM motion_bank.search('schools', 'BP', NULL, NULL, 'newest');

BEGIN;

CREATE SCHEMA IF NOT EXISTS motion_bank;

COMMENT ON SCHEMA motion_bank IS
  'Debate motion catalogue. Themes and tags are lookup tables; tournament is a detached name label.';

-- ---------------------------------------------------------------------------
-- Enums kept on the motion row. Theme is a table, not an enum.
-- ---------------------------------------------------------------------------

CREATE TYPE motion_bank.motion_format AS ENUM (
  'BP',
  'Asian',
  'WSDC',
  'Public Forum'
);

CREATE TYPE motion_bank.motion_difficulty AS ENUM (
  'Novice',
  'Open',
  'Advanced'
);

-- ---------------------------------------------------------------------------
-- Lookups
-- ---------------------------------------------------------------------------

CREATE TABLE motion_bank.themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  CONSTRAINT themes_name_unique UNIQUE (name),
  CONSTRAINT themes_name_not_blank CHECK (char_length(btrim(name)) > 0),
  CONSTRAINT themes_name_trimmed CHECK (name = btrim(name))
);

COMMENT ON TABLE motion_bank.themes IS
  'Motion themes such as Politics, Economy, or IR.';

CREATE TABLE motion_bank.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  CONSTRAINT tags_name_unique UNIQUE (name),
  CONSTRAINT tags_name_not_blank CHECK (char_length(btrim(name)) > 0),
  CONSTRAINT tags_name_trimmed CHECK (name = btrim(name))
);

COMMENT ON TABLE motion_bank.tags IS
  'Shared labels such as education, climate, or AI.';

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX themes_name_trgm_idx
  ON motion_bank.themes USING gin (name gin_trgm_ops);

CREATE INDEX tags_name_trgm_idx
  ON motion_bank.tags USING gin (name gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Motions
-- ---------------------------------------------------------------------------

CREATE TABLE motion_bank.motions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  format motion_bank.motion_format NOT NULL,
  theme_id uuid NOT NULL REFERENCES motion_bank.themes (id) ON DELETE RESTRICT,
  difficulty motion_bank.motion_difficulty NOT NULL,
  year smallint NOT NULL,
  tournament text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT motions_text_not_blank CHECK (char_length(btrim(text)) > 0),
  CONSTRAINT motions_text_trimmed CHECK (text = btrim(text)),
  CONSTRAINT motions_year_range CHECK (year BETWEEN 1900 AND 2100),
  CONSTRAINT motions_tournament_not_blank CHECK (
    tournament IS NULL OR char_length(btrim(tournament)) > 0
  ),
  CONSTRAINT motions_tournament_trimmed CHECK (
    tournament IS NULL OR tournament = btrim(tournament)
  )
);

COMMENT ON TABLE motion_bank.motions IS
  'One debate motion. theme_id is required. tournament is a detached name label for now.';
COMMENT ON COLUMN motion_bank.motions.difficulty IS
  'Called "level" in the Motion Bank UI.';
COMMENT ON COLUMN motion_bank.motions.tournament IS
  'Optional tournament name. Null for a practice set. Not a FK yet.';

CREATE INDEX motions_filter_idx
  ON motion_bank.motions (format, theme_id, difficulty, year DESC, id);

CREATE INDEX motions_year_idx
  ON motion_bank.motions (year DESC, id);

CREATE INDEX motions_tournament_trgm_idx
  ON motion_bank.motions USING gin (tournament gin_trgm_ops)
  WHERE tournament IS NOT NULL;

CREATE INDEX motions_text_trgm_idx
  ON motion_bank.motions USING gin (text gin_trgm_ops);

CREATE OR REPLACE FUNCTION motion_bank.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER motions_set_updated_at
  BEFORE UPDATE ON motion_bank.motions
  FOR EACH ROW
  EXECUTE FUNCTION motion_bank.set_updated_at();

CREATE TABLE motion_bank.motion_tags (
  motion_id uuid NOT NULL REFERENCES motion_bank.motions (id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES motion_bank.tags (id) ON DELETE CASCADE,
  PRIMARY KEY (motion_id, tag_id)
);

CREATE INDEX motion_tags_tag_id_idx
  ON motion_bank.motion_tags (tag_id);

-- ---------------------------------------------------------------------------
-- Catalogue view: names resolved through the foreign keys.
-- ---------------------------------------------------------------------------

CREATE VIEW motion_bank.catalogue AS
SELECT
  m.id,
  m.text,
  m.format,
  m.theme_id,
  th.name AS theme,
  m.difficulty,
  m.year,
  m.tournament,
  COALESCE(
    array_agg(t.name ORDER BY t.name) FILTER (WHERE t.name IS NOT NULL),
    '{}'::text[]
  ) AS tags,
  m.created_at,
  m.updated_at
FROM motion_bank.motions AS m
JOIN motion_bank.themes AS th ON th.id = m.theme_id
LEFT JOIN motion_bank.motion_tags AS mt ON mt.motion_id = m.id
LEFT JOIN motion_bank.tags AS t ON t.id = mt.tag_id
GROUP BY m.id, th.name;

COMMENT ON VIEW motion_bank.catalogue IS
  'Motion with theme and tag names joined from their tables. Tournament is a detached label.';

-- ---------------------------------------------------------------------------
-- Search. Null filters are ignored. Blank query matches everything.
-- p_theme is the theme name. p_sort: newest (default) | oldest | az
-- ---------------------------------------------------------------------------

CREATE FUNCTION motion_bank.search(
  p_query text DEFAULT NULL,
  p_format motion_bank.motion_format DEFAULT NULL,
  p_theme text DEFAULT NULL,
  p_difficulty motion_bank.motion_difficulty DEFAULT NULL,
  p_sort text DEFAULT 'newest'
)
RETURNS TABLE (
  id uuid,
  text text,
  format motion_bank.motion_format,
  theme_id uuid,
  theme text,
  difficulty motion_bank.motion_difficulty,
  year smallint,
  tournament text,
  tags text[],
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
AS $$
  WITH needle AS (
    SELECT CASE
      WHEN p_query IS NULL OR btrim(p_query) = '' THEN NULL
      ELSE replace(replace(replace(btrim(p_query), '\', '\\'), '%', '\%'), '_', '\_')
    END AS pattern
  )
  SELECT
    c.id,
    c.text,
    c.format,
    c.theme_id,
    c.theme,
    c.difficulty,
    c.year,
    c.tournament,
    c.tags,
    c.created_at,
    c.updated_at
  FROM motion_bank.catalogue AS c
  CROSS JOIN needle AS n
  WHERE (p_format IS NULL OR c.format = p_format)
    AND (p_theme IS NULL OR btrim(p_theme) = '' OR c.theme = btrim(p_theme))
    AND (p_difficulty IS NULL OR c.difficulty = p_difficulty)
    AND (
      n.pattern IS NULL
      OR c.text ILIKE '%' || n.pattern || '%' ESCAPE '\'
      OR c.format::text ILIKE '%' || n.pattern || '%' ESCAPE '\'
      OR c.theme ILIKE '%' || n.pattern || '%' ESCAPE '\'
      OR c.difficulty::text ILIKE '%' || n.pattern || '%' ESCAPE '\'
      OR c.tournament ILIKE '%' || n.pattern || '%' ESCAPE '\'
      OR EXISTS (
        SELECT 1
        FROM unnest(c.tags) AS tag
        WHERE tag ILIKE '%' || n.pattern || '%' ESCAPE '\'
      )
    )
  ORDER BY
    CASE
      WHEN COALESCE(NULLIF(p_sort, ''), 'newest') = 'az' THEN c.text
      WHEN p_sort = 'oldest' THEN lpad(c.year::text, 4, '0')
      ELSE lpad((10000 - c.year)::text, 5, '0')
    END ASC,
    c.id ASC;
$$;

COMMENT ON FUNCTION motion_bank.search(text, motion_bank.motion_format, text, motion_bank.motion_difficulty, text) IS
  'Filter and sort the catalogue. Theme is matched by name against motion_bank.themes.';

COMMIT;
