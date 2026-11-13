-- Supabase Auth handles login validation and its own abuse protection.
-- The application no longer stores or reads login attempts.
DROP TABLE IF EXISTS public.login_attempts;
