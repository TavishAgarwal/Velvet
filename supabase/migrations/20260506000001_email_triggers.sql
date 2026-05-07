-- ─────────────────────────────────────────────────────────────────────────────
-- ADD EMAIL WEBHOOK TRIGGER
-- ─────────────────────────────────────────────────────────────────────────────

-- Ensure pg_net is enabled (often enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.trigger_application_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  edge_function_url text;
  anon_key text;
  payload jsonb;
BEGIN
  -- We only fire when status changes from 'pending'
  IF OLD.status = 'pending' AND (NEW.status = 'approved' OR NEW.status = 'declined') THEN
    
    -- In a real Supabase project, you would set these via vault or current_setting
    -- For local dev / standard setup, we can use env vars if available or placeholder
    -- Since this is just a webhook, it's safer to use the built-in supabase_functions.http_request if available,
    -- but pg_net is more standard for custom triggers. Let's use pg_net.

    payload := jsonb_build_object(
      'type', 'UPDATE',
      'table', 'applications',
      'record', row_to_json(NEW),
      'old_record', row_to_json(OLD)
    );

    PERFORM net.http_post(
      url := coalesce(current_setting('app.settings.edge_function_base_url', true), 'http://127.0.0.1:54321/functions/v1') || '/send-application-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || coalesce(current_setting('app.settings.anon_key', true), 'YOUR_ANON_KEY')
      ),
      body := payload
    );

  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS application_email_trigger ON public.applications;
CREATE TRIGGER application_email_trigger
  AFTER UPDATE OF status ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_application_email();
