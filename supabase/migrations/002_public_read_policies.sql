-- Fix public read access for anon key (optional — server uses service role,
-- but these policies are needed if you ever read from the browser client)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profile' AND policyname = 'Public read profile'
  ) THEN
    CREATE POLICY "Public read profile" ON profile FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sections' AND policyname = 'Public read sections'
  ) THEN
    CREATE POLICY "Public read sections" ON sections FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'links' AND policyname = 'Public read active links'
  ) THEN
    CREATE POLICY "Public read active links" ON links FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Storage: public read for avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read avatars'
  ) THEN
    CREATE POLICY "Public read avatars" ON storage.objects
      FOR SELECT USING (bucket_id = 'avatars');
  END IF;
END $$;
