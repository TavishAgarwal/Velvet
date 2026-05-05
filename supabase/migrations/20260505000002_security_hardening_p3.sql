-- ─────────────────────────────────────────────────────────────────────────────
-- SECURITY HARDENING — PRIORITY 3 (Pre-Scale)
-- Fixes: FINDING-11
-- ─────────────────────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════════════════════════════════
-- 1. SERVER-SIDE EVENT CAPACITY ENFORCEMENT (FINDING-11)
--    Replaces the original update_rsvp_count() trigger to add a capacity
--    check with row-level locking to prevent overselling.
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_rsvp_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_capacity integer;
  v_count    integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Lock the event row to prevent race conditions
    SELECT capacity, rsvp_count
    INTO v_capacity, v_count
    FROM public.events
    WHERE id = NEW.event_id
    FOR UPDATE;

    -- Enforce capacity limit (NULL capacity = unlimited)
    IF v_capacity IS NOT NULL AND v_count >= v_capacity THEN
      RAISE EXCEPTION 'Event is at capacity (% / %)', v_count, v_capacity;
    END IF;

    UPDATE public.events
    SET rsvp_count = rsvp_count + 1
    WHERE id = NEW.event_id;

    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.events
    SET rsvp_count = greatest(rsvp_count - 1, 0)
    WHERE id = OLD.event_id;

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;
