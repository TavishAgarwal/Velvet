-- ─────────────────────────────────────────────────────────────────────────────
-- SECURITY HARDENING — PRIORITY 1 (Block Launch)
-- Fixes: FINDING-01, FINDING-02, FINDING-03, FINDING-04
-- ─────────────────────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════════════════════════════════
-- 1. LOCK PROTECTED COLUMNS ON PROFILES (FINDING-02 + FINDING-04)
--    Prevents any non-admin from changing: role, plan_type, invite_count,
--    invite_code, invited_by, onboarding_completed.
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Non-admins cannot change protected fields, but allow dashboard/service_role bypass
  IF auth.uid() IS NOT NULL AND NOT is_admin() THEN
    NEW.role                  := OLD.role;
    NEW.plan_type             := OLD.plan_type;
    NEW.invite_count          := OLD.invite_count;
    NEW.invite_code           := OLD.invite_code;
    NEW.invited_by            := OLD.invited_by;
    NEW.onboarding_completed  := OLD.onboarding_completed;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();


-- ══════════════════════════════════════════════════════════════════════════════
-- 2. ADD ADMIN UPDATE POLICY (FINDING-02)
--    Allows admins to update any profile (needed for approval flow).
-- ══════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (is_admin());


-- ══════════════════════════════════════════════════════════════════════════════
-- 3. APPROVE/REJECT APPLICATION — SERVER-SIDE RPC (FINDING-02)
--    Atomic function: validates admin, validates application, updates both
--    the application and the user profile in a single transaction.
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.review_application(
  app_id     uuid,
  new_status text,
  notes      text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Only admins can review applications
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;

  -- Validate status value
  IF new_status NOT IN ('approved', 'rejected', 'waitlisted') THEN
    RAISE EXCEPTION 'Invalid status: %', new_status;
  END IF;

  -- Fetch the application (must be pending)
  SELECT user_id INTO v_user_id
  FROM public.applications
  WHERE id = app_id AND status = 'pending';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Application not found or not in pending state';
  END IF;

  -- Update the application record
  UPDATE public.applications
  SET status      = new_status,
      admin_notes = COALESCE(notes, admin_notes),
      reviewed_by = auth.uid(),
      reviewed_at = now()
  WHERE id = app_id;

  -- If approved, promote the user to member and migrate application data
  IF new_status = 'approved' THEN
    UPDATE public.profiles p
    SET role = 'member',
        display_name = COALESCE(p.display_name, a.full_name),
        city = COALESCE(p.city, a.city),
        profession = COALESCE(p.profession, a.profession),
        company = COALESCE(p.company, a.company),
        linkedin_url = COALESCE(p.linkedin_url, a.linkedin_url),
        instagram_handle = COALESCE(p.instagram_handle, a.instagram_handle),
        onboarding_completed = true
    FROM public.applications a
    WHERE a.id = app_id
      AND p.id = a.user_id;
  END IF;
END;
$$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 4. REPLACE GLOBAL PROFILES SELECT POLICY (FINDING-01)
--    - Members/admins can see all profiles
--    - Applicants can see own profile + limited view of members (social proof)
-- ══════════════════════════════════════════════════════════════════════════════

-- Drop the overly permissive policy from init migration
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;

-- Everyone can always read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Members and admins can see all profiles
CREATE POLICY "Members can read all profiles"
  ON public.profiles FOR SELECT
  USING (is_member_or_admin());

-- Create a limited view for applicants (social proof: names + avatars only)
-- This allows unapproved users to see that real people use the platform.
CREATE OR REPLACE VIEW public.member_previews AS
  SELECT
    id,
    display_name,
    avatar_url,
    city,
    profession
  FROM public.profiles
  WHERE role IN ('member', 'admin')
    AND onboarding_completed = true;

-- Grant read access to the view for authenticated users
GRANT SELECT ON public.member_previews TO authenticated;


-- ══════════════════════════════════════════════════════════════════════════════
-- 5. REPLACE GLOBAL INVITES SELECT POLICY (FINDING-03)
--    - Remove "Anyone can validate invite codes" (USING true)
--    - Keep owner-read policy
--    - Add server-side validate_invite_code() RPC
-- ══════════════════════════════════════════════════════════════════════════════

-- Drop the blanket policy that exposes all invite codes
DROP POLICY IF EXISTS "Anyone can validate invite codes" ON public.invites;

-- Server-side function: returns true/false without exposing any invite data
CREATE OR REPLACE FUNCTION public.validate_invite_code(p_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.invites
    WHERE code = p_code
      AND used_by IS NULL
      AND (expires_at IS NULL OR expires_at > now())
  );
$$;
