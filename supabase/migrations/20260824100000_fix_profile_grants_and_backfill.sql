-- Fix: grant table privileges to authenticated/service_role
-- and idempotent profile backfill for existing auth users.
-- Safe when later tables (open matching) are not yet present.
-- Does NOT delete users or reset the database.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'profiles',
    'freelancers',
    'funeral_companies',
    'municipalities',
    'service_types',
    'freelancer_services',
    'freelancer_service_areas',
    'availabilities',
    'identity_verifications',
    'job_requests',
    'job_private_details',
    'contracts',
    'job_status_history',
    'cancellations',
    'reviews',
    'notifications',
    'audit_logs',
    'job_candidates',
    'job_messages',
    'job_change_notices',
    'job_change_acknowledgements',
    'contract_amendments',
    'job_day_events'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      CONTINUE;
    END IF;

    IF t IN ('municipalities', 'service_types') THEN
      EXECUTE format('GRANT SELECT ON TABLE public.%I TO authenticated, anon', t);
    ELSIF t IN ('contracts', 'job_status_history') THEN
      EXECUTE format('GRANT SELECT ON TABLE public.%I TO authenticated', t);
    ELSIF t IN ('reviews', 'audit_logs', 'job_messages', 'job_change_notices', 'job_change_acknowledgements', 'job_day_events') THEN
      EXECUTE format('GRANT SELECT, INSERT ON TABLE public.%I TO authenticated', t);
    ELSIF t IN ('freelancer_services', 'freelancer_service_areas', 'availabilities') THEN
      EXECUTE format(
        'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated',
        t
      );
    ELSE
      EXECUTE format(
        'GRANT SELECT, INSERT, UPDATE ON TABLE public.%I TO authenticated',
        t
      );
    END IF;

    EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role', t);
  END LOOP;
END $$;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Harden signup trigger (idempotent inserts)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_safe_role public.user_role;
BEGIN
  v_role := coalesce(NEW.raw_user_meta_data->>'role', '');

  IF v_role = 'freelancer' THEN
    v_safe_role := 'freelancer';
  ELSIF v_role = 'funeral_company' THEN
    v_safe_role := 'funeral_company';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.profiles (id, role, email, phone)
  VALUES (
    NEW.id,
    v_safe_role,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;

  IF v_safe_role = 'freelancer' THEN
    INSERT INTO public.freelancers (id, display_name)
    VALUES (
      NEW.id,
      NULLIF(NEW.raw_user_meta_data->>'display_name', '')
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    INSERT INTO public.funeral_companies (id, company_name)
    VALUES (
      NEW.id,
      NULLIF(NEW.raw_user_meta_data->>'company_name', '')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    NEW.id,
    'auth.signup',
    'profile',
    NEW.id,
    jsonb_build_object('role', v_safe_role)
  );

  RETURN NEW;
END;
$$;

-- Idempotent backfill for existing auth users missing profiles
INSERT INTO public.profiles (id, role, email, phone)
SELECT
  u.id,
  (u.raw_user_meta_data->>'role')::public.user_role,
  u.email,
  NULLIF(u.raw_user_meta_data->>'phone', '')
FROM auth.users u
WHERE u.raw_user_meta_data->>'role' IN ('freelancer', 'funeral_company')
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.freelancers (id, display_name)
SELECT
  u.id,
  NULLIF(u.raw_user_meta_data->>'display_name', '')
FROM auth.users u
WHERE u.raw_user_meta_data->>'role' = 'freelancer'
  AND NOT EXISTS (
    SELECT 1 FROM public.freelancers f WHERE f.id = u.id
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.funeral_companies (id, company_name)
SELECT
  u.id,
  NULLIF(u.raw_user_meta_data->>'company_name', '')
FROM auth.users u
WHERE u.raw_user_meta_data->>'role' = 'funeral_company'
  AND NOT EXISTS (
    SELECT 1 FROM public.funeral_companies c WHERE c.id = u.id
  )
ON CONFLICT (id) DO NOTHING;
