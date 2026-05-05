-- ─────────────────────────────────────────────────────────────────────────────
-- SECURITY HARDENING — PRIORITY 2 (Pre-100 Users)
-- Fixes: FINDING-06, FINDING-07, FINDING-09, FINDING-10 + message rate limit
-- ─────────────────────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════════════════════════════════
-- 1. DATABASE-LEVEL LENGTH CONSTRAINTS (FINDING-06)
-- ══════════════════════════════════════════════════════════════════════════════

-- Profiles
ALTER TABLE public.profiles
  ADD CONSTRAINT chk_display_name_len CHECK (char_length(display_name) <= 100),
  ADD CONSTRAINT chk_bio_len           CHECK (char_length(bio) <= 500),
  ADD CONSTRAINT chk_profession_len    CHECK (char_length(profession) <= 100),
  ADD CONSTRAINT chk_company_len       CHECK (char_length(company) <= 100),
  ADD CONSTRAINT chk_city_len          CHECK (char_length(city) <= 100),
  ADD CONSTRAINT chk_linkedin_url_len  CHECK (char_length(linkedin_url) <= 200),
  ADD CONSTRAINT chk_instagram_len     CHECK (char_length(instagram_handle) <= 100);

-- Messages
ALTER TABLE public.messages
  ADD CONSTRAINT chk_content_len CHECK (char_length(content) BETWEEN 1 AND 5000);

-- Applications
ALTER TABLE public.applications
  ADD CONSTRAINT chk_app_full_name_len  CHECK (char_length(full_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT chk_app_why_join_len   CHECK (char_length(why_join) BETWEEN 10 AND 2000),
  ADD CONSTRAINT chk_app_city_len       CHECK (char_length(city) BETWEEN 1 AND 100),
  ADD CONSTRAINT chk_app_profession_len CHECK (char_length(profession) BETWEEN 1 AND 100),
  ADD CONSTRAINT chk_app_company_len    CHECK (char_length(company) <= 100),
  ADD CONSTRAINT chk_app_linkedin_len   CHECK (char_length(linkedin_url) <= 200),
  ADD CONSTRAINT chk_app_instagram_len  CHECK (char_length(instagram_handle) <= 100);


-- ══════════════════════════════════════════════════════════════════════════════
-- 2. RESTRICT NOTIFICATION UPDATE COLUMNS (FINDING-07)
--    Users should only be able to mark notifications as read, not modify
--    title, body, type, or data.
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.restrict_notification_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Freeze all fields except is_read
  NEW.title      := OLD.title;
  NEW.body       := OLD.body;
  NEW.type       := OLD.type;
  NEW.data       := OLD.data;
  NEW.user_id    := OLD.user_id;
  NEW.created_at := OLD.created_at;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_restrict_notification_update
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.restrict_notification_update();


-- ══════════════════════════════════════════════════════════════════════════════
-- 3. ADD ROLE CHECK TO RSVP INSERT (FINDING-09)
--    Only members/admins can RSVP to events, not applicants.
-- ══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can insert own RSVP" ON public.event_rsvps;

CREATE POLICY "Members can insert own RSVP"
  ON public.event_rsvps FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_member_or_admin());


-- ══════════════════════════════════════════════════════════════════════════════
-- 4. ADD ROLE CHECK TO CONVERSATION CREATE (FINDING-10)
--    Only members/admins can create conversations.
-- ══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

CREATE POLICY "Members can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (
    (auth.uid() = member_1_id OR auth.uid() = member_2_id)
    AND is_member_or_admin()
  );


-- ══════════════════════════════════════════════════════════════════════════════
-- 5. MESSAGE RATE LIMITING — 60 messages/minute per user
--    Prevents spam/abuse via DB-level enforcement.
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.check_message_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.messages
  WHERE sender_id = NEW.sender_id
    AND created_at > now() - interval '1 minute';

  IF recent_count >= 60 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 60 messages per minute';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_message_rate_limit
  BEFORE INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.check_message_rate_limit();
