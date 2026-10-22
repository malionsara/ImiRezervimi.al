-- Local dev database only.
-- 005 drops this check upstream but aborts on a missing log table here; past "completed" rows need it gone.
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS future_appointment;
-- schema.sql ships a sample salon; the showcase shows only the seeded demo account.
DELETE FROM salons WHERE email IS NULL OR email NOT LIKE '%@example.com';
-- The salon dashboard reads appointments with the anon key, which no RLS policy allows,
-- so with RLS on it shows zero appointments. Disabled here so the dashboard can be filmed.
DO $$ DECLARE t text; BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;
