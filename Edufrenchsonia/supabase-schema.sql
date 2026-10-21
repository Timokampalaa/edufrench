-- ============================================================

-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension (already available in Supabase by default)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- 1. students
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id           TEXT PRIMARY KEY,
  reg_number   TEXT NOT NULL UNIQUE,
  full_name    TEXT NOT NULL,
  email        TEXT NOT NULL,
  course       TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  photo_url    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 2. modules
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS modules (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  code        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 3. enrollments  (student ↔ module)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  student_id  TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module_id   TEXT NOT NULL REFERENCES modules(id)  ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, module_id)
);

-- ─────────────────────────────────────────
-- 4. lectures
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lectures (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  meet_link  TEXT NOT NULL DEFAULT '',
  date       TEXT NOT NULL,
  time       TEXT NOT NULL,
  module_id  TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 5. assignments
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assignments (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  start_time  TIMESTAMPTZ,
  deadline    TIMESTAMPTZ NOT NULL,
  marks       INTEGER NOT NULL DEFAULT 0,
  file_url    TEXT NOT NULL DEFAULT '',
  module_id   TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 6. submissions
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS submissions (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  student_id    TEXT NOT NULL REFERENCES students(id)    ON DELETE CASCADE,
  assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  file_url      TEXT NOT NULL DEFAULT '',
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  grade         NUMERIC NOT NULL DEFAULT 0,
  feedback      TEXT NOT NULL DEFAULT '',
  UNIQUE (student_id, assignment_id)
);

-- ─────────────────────────────────────────
-- 7. materials  (learning materials)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS materials (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  file_url   TEXT NOT NULL DEFAULT '',
  module_id  TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Row-Level Security (RLS)
-- Enable but allow all reads/writes for anon key
-- (tighten these policies in production!)
-- ─────────────────────────────────────────
ALTER TABLE students    ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules     ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lectures    ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials   ENABLE ROW LEVEL SECURITY;

-- Open policies (anon can read/write everything)
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['students','modules','enrollments','lectures','assignments','submissions','materials']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS allow_all ON %I', t);
    EXECUTE format('CREATE POLICY allow_all ON %I FOR ALL USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- ─────────────────────────────────────────
-- Storage bucket: "files"
-- (Run in Supabase Dashboard → Storage → New Bucket, or via SQL below)
-- ─────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read from the files bucket
DROP POLICY IF EXISTS "Public files read" ON storage.objects;
CREATE POLICY "Public files read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'files');

-- Allow authenticated + anon uploads
DROP POLICY IF EXISTS "Public files write" ON storage.objects;
CREATE POLICY "Public files write"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'files');

DROP POLICY IF EXISTS "Public files update" ON storage.objects;
CREATE POLICY "Public files update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'files');

-- ─────────────────────────────────────────
-- Done!
-- ─────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('students','modules','enrollments','lectures','assignments','submissions','materials')
ORDER BY table_name;
