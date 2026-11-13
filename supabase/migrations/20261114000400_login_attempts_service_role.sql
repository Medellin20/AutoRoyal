-- Login throttling is managed only by the trusted Next.js server client.
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, DELETE ON TABLE public.login_attempts TO service_role;

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'login_attempts'
      AND policyname = 'login_attempts_service_role_access'
  ) THEN
    CREATE POLICY login_attempts_service_role_access
      ON public.login_attempts
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
