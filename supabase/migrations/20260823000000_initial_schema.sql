-- CeremoLink initial schema
-- Timezone: store timestamptz; display as Asia/Tokyo in the app
-- Money: integer JPY only

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ---------------------------------------------------------------------------
-- Enums / check helpers
-- ---------------------------------------------------------------------------

CREATE TYPE public.user_role AS ENUM ('freelancer', 'funeral_company', 'admin');

CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE public.job_status AS ENUM (
  'draft',
  'requested',
  'accepted',
  'declined',
  'expired',
  'in_progress',
  'completion_pending',
  'completed',
  'cancellation_requested',
  'cancelled',
  'disputed'
);

CREATE TYPE public.cancellation_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE public.identity_doc_status AS ENUM ('pending', 'approved', 'rejected');

-- ---------------------------------------------------------------------------
-- Masters
-- ---------------------------------------------------------------------------

CREATE TABLE public.municipalities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.service_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  email text NOT NULL,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.freelancers (
  id uuid PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  legal_name text,
  display_name text,
  avatar_path text,
  phone text,
  residence_municipality_id uuid REFERENCES public.municipalities (id),
  years_of_experience int NOT NULL DEFAULT 0 CHECK (years_of_experience >= 0),
  bio text,
  transport_modes text[] NOT NULL DEFAULT '{}',
  desired_pay_min int CHECK (desired_pay_min IS NULL OR desired_pay_min >= 0),
  verification_status public.verification_status NOT NULL DEFAULT 'pending',
  verified_at timestamptz,
  rejection_reason text,
  rating_avg numeric(3, 2) NOT NULL DEFAULT 0,
  rating_count int NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.funeral_companies (
  id uuid PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  company_name text,
  representative_name text,
  phone text,
  municipality_id uuid REFERENCES public.municipalities (id),
  address text,
  contact_person_name text,
  verification_status public.verification_status NOT NULL DEFAULT 'pending',
  verified_at timestamptz,
  rejection_reason text,
  rating_avg numeric(3, 2) NOT NULL DEFAULT 0,
  rating_count int NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.identity_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid NOT NULL REFERENCES public.freelancers (id) ON DELETE CASCADE,
  doc_type text NOT NULL,
  storage_path text NOT NULL,
  status public.identity_doc_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.freelancer_services (
  freelancer_id uuid NOT NULL REFERENCES public.freelancers (id) ON DELETE CASCADE,
  service_type_id uuid NOT NULL REFERENCES public.service_types (id) ON DELETE CASCADE,
  PRIMARY KEY (freelancer_id, service_type_id)
);

CREATE TABLE public.freelancer_service_areas (
  freelancer_id uuid NOT NULL REFERENCES public.freelancers (id) ON DELETE CASCADE,
  municipality_id uuid NOT NULL REFERENCES public.municipalities (id) ON DELETE CASCADE,
  PRIMARY KEY (freelancer_id, municipality_id)
);

-- ---------------------------------------------------------------------------
-- Availabilities (no overlapping active slots per freelancer)
-- ---------------------------------------------------------------------------

CREATE TABLE public.availabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid NOT NULL REFERENCES public.freelancers (id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  note text,
  is_active boolean NOT NULL DEFAULT true,
  is_reserved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT availabilities_time_order CHECK (ends_at > starts_at),
  CONSTRAINT availabilities_no_overlap EXCLUDE USING gist (
    freelancer_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (is_active)
);

CREATE INDEX availabilities_freelancer_idx ON public.availabilities (freelancer_id);
CREATE INDEX availabilities_range_idx ON public.availabilities (starts_at, ends_at);

-- ---------------------------------------------------------------------------
-- Jobs
-- ---------------------------------------------------------------------------

CREATE TABLE public.job_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funeral_company_id uuid NOT NULL REFERENCES public.funeral_companies (id),
  freelancer_id uuid NOT NULL REFERENCES public.freelancers (id),
  availability_id uuid REFERENCES public.availabilities (id),
  service_type_id uuid NOT NULL REFERENCES public.service_types (id),
  municipality_id uuid NOT NULL REFERENCES public.municipalities (id),
  location_general text NOT NULL,
  work_starts_at timestamptz NOT NULL,
  work_ends_at timestamptz NOT NULL,
  meetup_at timestamptz,
  description text,
  dress_code text,
  belongings text,
  notes text,
  pay_amount int NOT NULL CHECK (pay_amount >= 0),
  travel_expense int NOT NULL DEFAULT 0 CHECK (travel_expense >= 0),
  payment_due_on date NOT NULL,
  response_deadline_at timestamptz NOT NULL,
  status public.job_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT job_requests_time_order CHECK (work_ends_at > work_starts_at),
  CONSTRAINT job_requests_response_deadline CHECK (response_deadline_at > created_at)
);

CREATE INDEX job_requests_freelancer_idx ON public.job_requests (freelancer_id);
CREATE INDEX job_requests_company_idx ON public.job_requests (funeral_company_id);
CREATE INDEX job_requests_status_idx ON public.job_requests (status);

CREATE TABLE public.job_private_details (
  job_request_id uuid PRIMARY KEY REFERENCES public.job_requests (id) ON DELETE CASCADE,
  exact_address text,
  facility_name text,
  meetup_location text,
  emergency_contact text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id uuid NOT NULL UNIQUE REFERENCES public.job_requests (id),
  terms_snapshot jsonb NOT NULL,
  private_snapshot jsonb NOT NULL,
  freelancer_snapshot jsonb NOT NULL,
  funeral_company_snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.job_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id uuid NOT NULL REFERENCES public.job_requests (id) ON DELETE CASCADE,
  from_status public.job_status,
  to_status public.job_status NOT NULL,
  changed_by uuid REFERENCES public.profiles (id),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.cancellations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id uuid NOT NULL REFERENCES public.job_requests (id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES public.profiles (id),
  reason text NOT NULL,
  status public.cancellation_status NOT NULL DEFAULT 'pending',
  resolved_by uuid REFERENCES public.profiles (id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id uuid NOT NULL REFERENCES public.job_requests (id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES public.profiles (id),
  reviewee_id uuid NOT NULL REFERENCES public.profiles (id),
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  is_published boolean NOT NULL DEFAULT false,
  publish_after timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_request_id, reviewer_id)
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  link_path text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles (id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.current_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_approved_funeral_company()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.funeral_companies
    WHERE id = auth.uid()
      AND verification_status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_approved_freelancer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.freelancers
    WHERE id = auth.uid()
      AND verification_status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'role cannot be changed by non-admin';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_freelancer_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (
    NEW.verification_status IS DISTINCT FROM OLD.verification_status
    OR NEW.verified_at IS DISTINCT FROM OLD.verified_at
    OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason
  ) THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'verification fields can only be changed by admin';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_funeral_company_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (
    NEW.verification_status IS DISTINCT FROM OLD.verification_status
    OR NEW.verified_at IS DISTINCT FROM OLD.verified_at
    OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason
  ) THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'verification fields can only be changed by admin';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_contract_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'contracts are immutable';
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_audit_log_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs cannot be updated or deleted';
END;
$$;

-- Publish reviews when both sides posted, or after publish_after
CREATE OR REPLACE FUNCTION public.maybe_publish_reviews()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  SELECT count(*) INTO v_count
  FROM public.reviews
  WHERE job_request_id = NEW.job_request_id;

  IF v_count >= 2 OR NEW.publish_after <= now() THEN
    UPDATE public.reviews
    SET is_published = true
    WHERE job_request_id = NEW.job_request_id
      AND is_published = false;
  END IF;

  RETURN NEW;
END;
$$;

-- Accept job: single transaction
CREATE OR REPLACE FUNCTION public.accept_job_request(p_job_id uuid)
RETURNS public.contracts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job public.job_requests%ROWTYPE;
  v_private public.job_private_details%ROWTYPE;
  v_freelancer public.freelancers%ROWTYPE;
  v_company public.funeral_companies%ROWTYPE;
  v_contract public.contracts%ROWTYPE;
  v_overlap int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT * INTO v_job
  FROM public.job_requests
  WHERE id = p_job_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'job not found';
  END IF;

  IF v_job.freelancer_id <> auth.uid() THEN
    RAISE EXCEPTION 'only assigned freelancer can accept';
  END IF;

  IF v_job.status <> 'requested' THEN
    RAISE EXCEPTION 'job cannot be accepted from status %', v_job.status;
  END IF;

  IF v_job.response_deadline_at < now() THEN
    UPDATE public.job_requests
    SET status = 'expired', updated_at = now()
    WHERE id = v_job.id;

    INSERT INTO public.job_status_history (job_request_id, from_status, to_status, changed_by, reason)
    VALUES (v_job.id, 'requested', 'expired', auth.uid(), 'response deadline passed');

    RAISE EXCEPTION 'job response deadline has passed';
  END IF;

  SELECT count(*) INTO v_overlap
  FROM public.job_requests jr
  WHERE jr.freelancer_id = v_job.freelancer_id
    AND jr.id <> v_job.id
    AND jr.status IN (
      'accepted',
      'in_progress',
      'completion_pending',
      'cancellation_requested',
      'disputed'
    )
    AND tstzrange(jr.work_starts_at, jr.work_ends_at, '[)') &&
        tstzrange(v_job.work_starts_at, v_job.work_ends_at, '[)');

  IF v_overlap > 0 THEN
    RAISE EXCEPTION 'overlapping contracted job exists';
  END IF;

  UPDATE public.job_requests
  SET status = 'accepted', updated_at = now()
  WHERE id = v_job.id
    AND status = 'requested'
  RETURNING * INTO v_job;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'job already accepted or changed';
  END IF;

  IF v_job.availability_id IS NOT NULL THEN
    UPDATE public.availabilities
    SET is_reserved = true, updated_at = now()
    WHERE id = v_job.availability_id
      AND freelancer_id = v_job.freelancer_id
      AND is_active = true
      AND is_reserved = false;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'availability could not be reserved';
    END IF;
  END IF;

  SELECT * INTO v_private FROM public.job_private_details WHERE job_request_id = v_job.id;
  SELECT * INTO v_freelancer FROM public.freelancers WHERE id = v_job.freelancer_id;
  SELECT * INTO v_company FROM public.funeral_companies WHERE id = v_job.funeral_company_id;

  INSERT INTO public.contracts (
    job_request_id,
    terms_snapshot,
    private_snapshot,
    freelancer_snapshot,
    funeral_company_snapshot
  ) VALUES (
    v_job.id,
    jsonb_build_object(
      'service_type_id', v_job.service_type_id,
      'municipality_id', v_job.municipality_id,
      'location_general', v_job.location_general,
      'work_starts_at', v_job.work_starts_at,
      'work_ends_at', v_job.work_ends_at,
      'meetup_at', v_job.meetup_at,
      'description', v_job.description,
      'dress_code', v_job.dress_code,
      'belongings', v_job.belongings,
      'notes', v_job.notes,
      'pay_amount', v_job.pay_amount,
      'travel_expense', v_job.travel_expense,
      'payment_due_on', v_job.payment_due_on
    ),
    jsonb_build_object(
      'exact_address', v_private.exact_address,
      'facility_name', v_private.facility_name,
      'meetup_location', v_private.meetup_location,
      'emergency_contact', v_private.emergency_contact
    ),
    jsonb_build_object(
      'id', v_freelancer.id,
      'legal_name', v_freelancer.legal_name,
      'display_name', v_freelancer.display_name,
      'phone', v_freelancer.phone
    ),
    jsonb_build_object(
      'id', v_company.id,
      'company_name', v_company.company_name,
      'contact_person_name', v_company.contact_person_name,
      'phone', v_company.phone
    )
  )
  RETURNING * INTO v_contract;

  INSERT INTO public.job_status_history (job_request_id, from_status, to_status, changed_by, reason)
  VALUES (v_job.id, 'requested', 'accepted', auth.uid(), 'accepted by freelancer');

  INSERT INTO public.notifications (user_id, type, title, body, link_path, payload)
  VALUES
    (
      v_job.funeral_company_id,
      'job_accepted',
      '依頼が承諾されました',
      'フリーランスが依頼を承諾し、契約が成立しました。',
      '/funeral-company/requests/' || v_job.id::text,
      jsonb_build_object('job_request_id', v_job.id)
    ),
    (
      v_job.freelancer_id,
      'job_accepted',
      '依頼を承諾しました',
      '契約が成立しました。集合場所などの詳細を確認してください。',
      '/freelancer/requests/' || v_job.id::text,
      jsonb_build_object('job_request_id', v_job.id)
    );

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'job.accept',
    'job_request',
    v_job.id,
    jsonb_build_object('contract_id', v_contract.id, 'from_status', 'requested', 'to_status', 'accepted')
  );

  RETURN v_contract;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_job_request(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_job_request(uuid) TO authenticated;

-- Create profile + role row on signup (role from metadata; admin not allowed)
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
    RAISE EXCEPTION 'invalid signup role';
  END IF;

  INSERT INTO public.profiles (id, role, email, phone)
  VALUES (
    NEW.id,
    v_safe_role,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'phone', '')
  );

  IF v_safe_role = 'freelancer' THEN
    INSERT INTO public.freelancers (id, display_name)
    VALUES (
      NEW.id,
      NULLIF(NEW.raw_user_meta_data->>'display_name', '')
    );
  ELSE
    INSERT INTO public.funeral_companies (id, company_name)
    VALUES (
      NEW.id,
      NULLIF(NEW.raw_user_meta_data->>'company_name', '')
    );
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

CREATE TRIGGER trg_freelancers_updated_at
  BEFORE UPDATE ON public.freelancers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_protect_freelancer_verification
  BEFORE UPDATE ON public.freelancers
  FOR EACH ROW EXECUTE FUNCTION public.protect_freelancer_verification();

CREATE TRIGGER trg_funeral_companies_updated_at
  BEFORE UPDATE ON public.funeral_companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_protect_funeral_company_verification
  BEFORE UPDATE ON public.funeral_companies
  FOR EACH ROW EXECUTE FUNCTION public.protect_funeral_company_verification();

CREATE TRIGGER trg_identity_verifications_updated_at
  BEFORE UPDATE ON public.identity_verifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_availabilities_updated_at
  BEFORE UPDATE ON public.availabilities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_job_requests_updated_at
  BEFORE UPDATE ON public.job_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_job_private_details_updated_at
  BEFORE UPDATE ON public.job_private_details
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_contracts_no_update
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.prevent_contract_mutation();

CREATE TRIGGER trg_contracts_no_delete
  BEFORE DELETE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.prevent_contract_mutation();

CREATE TRIGGER trg_audit_logs_no_update
  BEFORE UPDATE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_mutation();

CREATE TRIGGER trg_audit_logs_no_delete
  BEFORE DELETE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_mutation();

CREATE TRIGGER trg_reviews_maybe_publish
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.maybe_publish_reviews();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funeral_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_private_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- municipalities / service_types: readable by authenticated
CREATE POLICY municipalities_select ON public.municipalities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY service_types_select ON public.service_types
  FOR SELECT TO authenticated USING (true);

-- profiles
CREATE POLICY profiles_select_own_or_admin ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- freelancers
CREATE POLICY freelancers_select ON public.freelancers
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.is_admin()
    OR (
      verification_status = 'approved'
      AND public.is_approved_funeral_company()
    )
  );

CREATE POLICY freelancers_insert_own ON public.freelancers
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() AND public.current_role() = 'freelancer');

CREATE POLICY freelancers_update_own ON public.freelancers
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

-- funeral_companies
CREATE POLICY funeral_companies_select ON public.funeral_companies
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.funeral_company_id = funeral_companies.id
        AND jr.freelancer_id = auth.uid()
        AND jr.status IN (
          'accepted', 'in_progress', 'completion_pending', 'completed',
          'cancellation_requested', 'disputed'
        )
    )
  );

CREATE POLICY funeral_companies_insert_own ON public.funeral_companies
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() AND public.current_role() = 'funeral_company');

CREATE POLICY funeral_companies_update_own ON public.funeral_companies
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

-- identity_verifications
CREATE POLICY identity_verifications_select ON public.identity_verifications
  FOR SELECT TO authenticated
  USING (freelancer_id = auth.uid() OR public.is_admin());

CREATE POLICY identity_verifications_insert ON public.identity_verifications
  FOR INSERT TO authenticated
  WITH CHECK (freelancer_id = auth.uid());

CREATE POLICY identity_verifications_update_admin ON public.identity_verifications
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- freelancer_services / areas
CREATE POLICY freelancer_services_select ON public.freelancer_services
  FOR SELECT TO authenticated
  USING (
    freelancer_id = auth.uid()
    OR public.is_admin()
    OR (
      public.is_approved_funeral_company()
      AND EXISTS (
        SELECT 1 FROM public.freelancers f
        WHERE f.id = freelancer_services.freelancer_id
          AND f.verification_status = 'approved'
      )
    )
  );

CREATE POLICY freelancer_services_write_own ON public.freelancer_services
  FOR ALL TO authenticated
  USING (freelancer_id = auth.uid() OR public.is_admin())
  WITH CHECK (freelancer_id = auth.uid() OR public.is_admin());

CREATE POLICY freelancer_service_areas_select ON public.freelancer_service_areas
  FOR SELECT TO authenticated
  USING (
    freelancer_id = auth.uid()
    OR public.is_admin()
    OR (
      public.is_approved_funeral_company()
      AND EXISTS (
        SELECT 1 FROM public.freelancers f
        WHERE f.id = freelancer_service_areas.freelancer_id
          AND f.verification_status = 'approved'
      )
    )
  );

CREATE POLICY freelancer_service_areas_write_own ON public.freelancer_service_areas
  FOR ALL TO authenticated
  USING (freelancer_id = auth.uid() OR public.is_admin())
  WITH CHECK (freelancer_id = auth.uid() OR public.is_admin());

-- availabilities: unapproved freelancers cannot publish to others
CREATE POLICY availabilities_select ON public.availabilities
  FOR SELECT TO authenticated
  USING (
    freelancer_id = auth.uid()
    OR public.is_admin()
    OR (
      is_active = true
      AND public.is_approved_funeral_company()
      AND EXISTS (
        SELECT 1 FROM public.freelancers f
        WHERE f.id = availabilities.freelancer_id
          AND f.verification_status = 'approved'
      )
    )
  );

CREATE POLICY availabilities_insert_own ON public.availabilities
  FOR INSERT TO authenticated
  WITH CHECK (
    freelancer_id = auth.uid()
    AND public.is_approved_freelancer()
  );

CREATE POLICY availabilities_update_own ON public.availabilities
  FOR UPDATE TO authenticated
  USING (freelancer_id = auth.uid() OR public.is_admin())
  WITH CHECK (freelancer_id = auth.uid() OR public.is_admin());

CREATE POLICY availabilities_delete_own ON public.availabilities
  FOR DELETE TO authenticated
  USING (freelancer_id = auth.uid() OR public.is_admin());

-- job_requests
CREATE POLICY job_requests_select ON public.job_requests
  FOR SELECT TO authenticated
  USING (
    freelancer_id = auth.uid()
    OR funeral_company_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY job_requests_insert_company ON public.job_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    funeral_company_id = auth.uid()
    AND public.is_approved_funeral_company()
  );

CREATE POLICY job_requests_update_parties ON public.job_requests
  FOR UPDATE TO authenticated
  USING (
    freelancer_id = auth.uid()
    OR funeral_company_id = auth.uid()
    OR public.is_admin()
  )
  WITH CHECK (
    freelancer_id = auth.uid()
    OR funeral_company_id = auth.uid()
    OR public.is_admin()
  );

-- job_private_details: company always; freelancer only after accepted+
CREATE POLICY job_private_details_select ON public.job_private_details
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = job_private_details.job_request_id
        AND jr.funeral_company_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = job_private_details.job_request_id
        AND jr.freelancer_id = auth.uid()
        AND jr.status IN (
          'accepted', 'in_progress', 'completion_pending', 'completed',
          'cancellation_requested', 'disputed'
        )
    )
  );

CREATE POLICY job_private_details_insert ON public.job_private_details
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = job_private_details.job_request_id
        AND jr.funeral_company_id = auth.uid()
    )
  );

CREATE POLICY job_private_details_update ON public.job_private_details
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = job_private_details.job_request_id
        AND jr.funeral_company_id = auth.uid()
        AND jr.status IN ('draft', 'requested')
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = job_private_details.job_request_id
        AND jr.funeral_company_id = auth.uid()
        AND jr.status IN ('draft', 'requested')
    )
  );

-- contracts: select only; mutations blocked by trigger
CREATE POLICY contracts_select ON public.contracts
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = contracts.job_request_id
        AND (jr.freelancer_id = auth.uid() OR jr.funeral_company_id = auth.uid())
    )
  );

CREATE POLICY contracts_insert_via_function ON public.contracts
  FOR INSERT TO authenticated
  WITH CHECK (false);

-- job_status_history
CREATE POLICY job_status_history_select ON public.job_status_history
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = job_status_history.job_request_id
        AND (jr.freelancer_id = auth.uid() OR jr.funeral_company_id = auth.uid())
    )
  );

CREATE POLICY job_status_history_insert_deny ON public.job_status_history
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- cancellations
CREATE POLICY cancellations_select ON public.cancellations
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = cancellations.job_request_id
        AND (jr.freelancer_id = auth.uid() OR jr.funeral_company_id = auth.uid())
    )
  );

CREATE POLICY cancellations_insert ON public.cancellations
  FOR INSERT TO authenticated
  WITH CHECK (
    requested_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = cancellations.job_request_id
        AND (jr.freelancer_id = auth.uid() OR jr.funeral_company_id = auth.uid())
    )
  );

CREATE POLICY cancellations_update ON public.cancellations
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = cancellations.job_request_id
        AND (jr.freelancer_id = auth.uid() OR jr.funeral_company_id = auth.uid())
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = cancellations.job_request_id
        AND (jr.freelancer_id = auth.uid() OR jr.funeral_company_id = auth.uid())
    )
  );

-- reviews: unpublished only visible to author/admin
CREATE POLICY reviews_select ON public.reviews
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR reviewer_id = auth.uid()
    OR is_published = true
  );

CREATE POLICY reviews_insert ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = reviews.job_request_id
        AND jr.status = 'completed'
        AND (jr.freelancer_id = auth.uid() OR jr.funeral_company_id = auth.uid())
    )
  );

-- notifications
CREATE POLICY notifications_select ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY notifications_update ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY notifications_insert_admin ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR user_id = auth.uid());

-- audit_logs: admin select only; no update/delete (trigger + no policies)
CREATE POLICY audit_logs_select_admin ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY audit_logs_insert_authenticated ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() OR public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: private identity-docs bucket
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'identity-docs',
  'identity-docs',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY identity_docs_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'identity-docs'
    AND (
      public.is_admin()
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

CREATE POLICY identity_docs_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'identity-docs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY identity_docs_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'identity-docs'
    AND (
      public.is_admin()
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  )
  WITH CHECK (
    bucket_id = 'identity-docs'
    AND (
      public.is_admin()
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

CREATE POLICY identity_docs_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'identity-docs'
    AND (
      public.is_admin()
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

CREATE POLICY avatars_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY avatars_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY avatars_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY avatars_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
