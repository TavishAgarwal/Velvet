-- ─────────────────────────────────────────────────────────────────────────────
-- ADD APPLICATION FIELDS
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.applications
  ADD COLUMN country text,
  ADD COLUMN what_you_bring text,
  ADD COLUMN how_heard text;

ALTER TABLE public.applications
  ADD CONSTRAINT chk_app_country_len CHECK (char_length(country) <= 100),
  ADD CONSTRAINT chk_app_what_you_bring_len CHECK (char_length(what_you_bring) <= 2000),
  ADD CONSTRAINT chk_app_how_heard_len CHECK (char_length(how_heard) <= 500);
