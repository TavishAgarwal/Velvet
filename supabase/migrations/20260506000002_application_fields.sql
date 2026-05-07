-- ─────────────────────────────────────────────────────────────────────────────
-- ADD APPLICATION FIELDS
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS what_you_bring text,
  ADD COLUMN IF NOT EXISTS how_heard text;

ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS chk_app_country_len;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS chk_app_what_you_bring_len;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS chk_app_how_heard_len;

ALTER TABLE public.applications
  ADD CONSTRAINT chk_app_country_len CHECK (char_length(country) <= 100),
  ADD CONSTRAINT chk_app_what_you_bring_len CHECK (char_length(what_you_bring) <= 2000),
  ADD CONSTRAINT chk_app_how_heard_len CHECK (char_length(how_heard) <= 500);
