-- ─────────────────────────────────────────────────────────────────────────────
-- FIX ONBOARDING TRIGGER
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Non-admins cannot change protected fields
  IF NOT is_admin() THEN
    NEW.role                  := OLD.role;
    NEW.plan_type             := OLD.plan_type;
    NEW.invite_count          := OLD.invite_count;
    NEW.invite_code           := OLD.invite_code;
    NEW.invited_by            := OLD.invited_by;
    
    -- Users can only set onboarding_completed to TRUE if it was FALSE.
    -- They cannot set it back to FALSE.
    IF OLD.onboarding_completed = TRUE OR NEW.onboarding_completed = FALSE THEN
      NEW.onboarding_completed := OLD.onboarding_completed;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
