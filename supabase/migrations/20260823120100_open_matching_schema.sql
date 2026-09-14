-- Open matching: broadcast to candidates, first-come claim
-- Does NOT use db reset. Additive migration for linked dev projects.

-- ---------------------------------------------------------------------------
-- Enum extensions
-- ---------------------------------------------------------------------------


DO $$
BEGIN
  CREATE TYPE public.candidate_status AS ENUM (
    'notified',
    'viewed',
    'won',
    'lost',
    'withdrawn'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.change_notice_type AS ENUM ('operational', 'contractual');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.amendment_status AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'expired'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.day_event_type AS ENUM (
    'arrived',
    'started',
    'finished_ok',
    'finished_with_issue'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- profiles: suspension flag
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.protect_profile_suspension()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.is_suspended IS DISTINCT FROM OLD.is_suspended THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'is_suspended can only be changed by admin';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_suspension ON public.profiles;
CREATE TRIGGER trg_protect_profile_suspension
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_suspension();

-- ---------------------------------------------------------------------------
-- job_requests: open matching columns
-- ---------------------------------------------------------------------------

ALTER TABLE public.job_requests
  ALTER COLUMN freelancer_id DROP NOT NULL;

ALTER TABLE public.job_requests
  ADD COLUMN IF NOT EXISTS assigned_freelancer_id uuid REFERENCES public.freelancers (id);

ALTER TABLE public.job_requests
  ADD COLUMN IF NOT EXISTS crematorium_name text;

ALTER TABLE public.job_requests
  ADD COLUMN IF NOT EXISTS estimated_duration_minutes int
    CHECK (estimated_duration_minutes IS NULL OR estimated_duration_minutes > 0);

CREATE INDEX IF NOT EXISTS job_requests_assigned_freelancer_idx
  ON public.job_requests (assigned_freelancer_id);

CREATE INDEX IF NOT EXISTS job_requests_open_idx
  ON public.job_requests (status)
  WHERE status = 'open';

-- ---------------------------------------------------------------------------
-- job_private_details: post-contract fields
-- ---------------------------------------------------------------------------

ALTER TABLE public.job_private_details
  ADD COLUMN IF NOT EXISTS deceased_name text;

ALTER TABLE public.job_private_details
  ADD COLUMN IF NOT EXISTS company_contact_name text;

ALTER TABLE public.job_private_details
  ADD COLUMN IF NOT EXISTS company_contact_phone text;

ALTER TABLE public.job_private_details
  ADD COLUMN IF NOT EXISTS detailed_notes text;

-- ---------------------------------------------------------------------------
-- New tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.job_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id uuid NOT NULL REFERENCES public.job_requests (id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES public.freelancers (id),
  status public.candidate_status NOT NULL DEFAULT 'notified',
  notified_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_request_id, freelancer_id)
);

CREATE INDEX IF NOT EXISTS job_candidates_freelancer_idx
  ON public.job_candidates (freelancer_id);

CREATE INDEX IF NOT EXISTS job_candidates_job_idx
  ON public.job_candidates (job_request_id);

CREATE TABLE IF NOT EXISTS public.job_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id uuid NOT NULL REFERENCES public.job_requests (id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles (id),
  body text NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 5000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS job_messages_job_idx
  ON public.job_messages (job_request_id, created_at);

CREATE TABLE IF NOT EXISTS public.job_change_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id uuid NOT NULL REFERENCES public.job_requests (id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.profiles (id),
  notice_type public.change_notice_type NOT NULL DEFAULT 'operational',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary text NOT NULL,
  requires_reacceptance boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_change_acknowledgements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id uuid NOT NULL REFERENCES public.job_change_notices (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id),
  acknowledged_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (notice_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.contract_amendments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts (id),
  job_request_id uuid NOT NULL REFERENCES public.job_requests (id) ON DELETE CASCADE,
  proposed_by uuid NOT NULL REFERENCES public.profiles (id),
  change_set jsonb NOT NULL,
  status public.amendment_status NOT NULL DEFAULT 'pending',
  notice_id uuid REFERENCES public.job_change_notices (id),
  accepted_by uuid REFERENCES public.profiles (id),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_day_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id uuid NOT NULL REFERENCES public.job_requests (id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES public.profiles (id),
  event_type public.day_event_type NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS job_day_events_job_idx
  ON public.job_day_events (job_request_id, created_at);

-- ---------------------------------------------------------------------------
-- Matching helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.freelancer_is_eligible_for_job(
  p_freelancer_id uuid,
  p_job public.job_requests
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_overlap int;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = p_freelancer_id AND (p.is_suspended OR p.role <> 'freelancer')
  ) THEN
    RETURN false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.freelancers f
    WHERE f.id = p_freelancer_id
      AND f.verification_status = 'approved'
  ) THEN
    RETURN false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.freelancer_service_areas a
    WHERE a.freelancer_id = p_freelancer_id
      AND a.municipality_id = p_job.municipality_id
  ) THEN
    RETURN false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.freelancer_services s
    WHERE s.freelancer_id = p_freelancer_id
      AND s.service_type_id = p_job.service_type_id
  ) THEN
    RETURN false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.availabilities av
    WHERE av.freelancer_id = p_freelancer_id
      AND av.is_active = true
      AND av.is_reserved = false
      AND av.starts_at <= p_job.work_starts_at
      AND av.ends_at >= p_job.work_ends_at
  ) THEN
    RETURN false;
  END IF;

  SELECT count(*) INTO v_overlap
  FROM public.job_requests jr
  WHERE coalesce(jr.assigned_freelancer_id, jr.freelancer_id) = p_freelancer_id
    AND jr.id <> p_job.id
    AND jr.status IN (
      'assigned',
      'accepted',
      'in_progress',
      'completion_pending',
      'cancellation_requested',
      'disputed'
    )
    AND tstzrange(jr.work_starts_at, jr.work_ends_at, '[)') &&
        tstzrange(p_job.work_starts_at, p_job.work_ends_at, '[)');

  IF v_overlap > 0 THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.find_matching_freelancer_ids(p_job_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.id
  FROM public.freelancers f
  JOIN public.job_requests j ON j.id = p_job_id
  WHERE public.freelancer_is_eligible_for_job(f.id, j);
$$;

-- Publish draft -> open and notify candidates
CREATE OR REPLACE FUNCTION public.publish_job_request(p_job_id uuid)
RETURNS public.job_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job public.job_requests%ROWTYPE;
  v_fid uuid;
  v_count int := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_job
  FROM public.job_requests
  WHERE id = p_job_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'job not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_job.funeral_company_id <> auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'only owning funeral company can publish' USING ERRCODE = '42501';
  END IF;

  IF NOT public.is_approved_funeral_company() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'funeral company not approved' USING ERRCODE = '42501';
  END IF;

  IF v_job.status <> 'draft' THEN
    RAISE EXCEPTION 'job cannot be published from status %', v_job.status USING ERRCODE = 'P0001';
  END IF;

  IF v_job.response_deadline_at <= now() THEN
    RAISE EXCEPTION 'response deadline must be in the future' USING ERRCODE = 'P0001';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.job_private_details d WHERE d.job_request_id = v_job.id
  ) THEN
    RAISE EXCEPTION 'private details required before publish' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.job_requests
  SET status = 'open', updated_at = now()
  WHERE id = v_job.id
  RETURNING * INTO v_job;

  INSERT INTO public.job_status_history (job_request_id, from_status, to_status, changed_by, reason)
  VALUES (v_job.id, 'draft', 'open', auth.uid(), 'published for open matching');

  FOR v_fid IN SELECT public.find_matching_freelancer_ids(v_job.id)
  LOOP
    INSERT INTO public.job_candidates (job_request_id, freelancer_id, status)
    VALUES (v_job.id, v_fid, 'notified')
    ON CONFLICT (job_request_id, freelancer_id) DO NOTHING;

    INSERT INTO public.notifications (user_id, type, title, body, link_path, payload)
    VALUES (
      v_fid,
      'job_open',
      '新しい依頼があります',
      '条件に合う依頼が公開されました。詳細を確認し、先着で受けることができます。',
      '/freelancer/offers/' || v_job.id::text,
      jsonb_build_object('job_request_id', v_job.id)
    );

    v_count := v_count + 1;
  END LOOP;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'job.publish',
    'job_request',
    v_job.id,
    jsonb_build_object('candidate_count', v_count)
  );

  RETURN v_job;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_job_request(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_job_request(uuid) TO authenticated;

-- First-come claim (single transaction)
CREATE OR REPLACE FUNCTION public.claim_open_job(p_job_id uuid)
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
  v_availability_id uuid;
  v_other uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_job
  FROM public.job_requests
  WHERE id = p_job_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'job not found' USING ERRCODE = 'P0002';
  END IF;

  -- Idempotent: already assigned to self
  IF v_job.status = 'assigned'
     AND v_job.assigned_freelancer_id = auth.uid() THEN
    SELECT * INTO v_contract FROM public.contracts WHERE job_request_id = v_job.id;
    IF FOUND THEN
      RETURN v_contract;
    END IF;
  END IF;

  IF v_job.status = 'assigned'
     AND v_job.assigned_freelancer_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'job_already_assigned'
      USING ERRCODE = 'P0001',
            MESSAGE = '別の方に決まりました';
  END IF;

  IF v_job.status <> 'open' THEN
    RAISE EXCEPTION 'job cannot be claimed from status %', v_job.status
      USING ERRCODE = 'P0001';
  END IF;

  IF v_job.response_deadline_at < now() THEN
    UPDATE public.job_requests
    SET status = 'expired', updated_at = now()
    WHERE id = v_job.id;

    INSERT INTO public.job_status_history (job_request_id, from_status, to_status, changed_by, reason)
    VALUES (v_job.id, 'open', 'expired', auth.uid(), 'response deadline passed');

    RAISE EXCEPTION 'job_expired'
      USING ERRCODE = 'P0001',
            MESSAGE = '回答期限を過ぎたため承諾できません';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.job_candidates c
    WHERE c.job_request_id = v_job.id
      AND c.freelancer_id = auth.uid()
      AND c.status IN ('notified', 'viewed')
  ) THEN
    RAISE EXCEPTION 'not a candidate' USING ERRCODE = '42501';
  END IF;

  IF NOT public.freelancer_is_eligible_for_job(auth.uid(), v_job) THEN
    RAISE EXCEPTION 'not eligible' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.job_requests
  SET
    status = 'assigned',
    assigned_freelancer_id = auth.uid(),
    freelancer_id = auth.uid(),
    updated_at = now()
  WHERE id = v_job.id
    AND status = 'open'
  RETURNING * INTO v_job;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'job_already_assigned'
      USING ERRCODE = 'P0001',
            MESSAGE = '別の方に決まりました';
  END IF;

  SELECT av.id INTO v_availability_id
  FROM public.availabilities av
  WHERE av.freelancer_id = auth.uid()
    AND av.is_active = true
    AND av.is_reserved = false
    AND av.starts_at <= v_job.work_starts_at
    AND av.ends_at >= v_job.work_ends_at
  ORDER BY av.starts_at
  LIMIT 1
  FOR UPDATE;

  IF v_availability_id IS NULL THEN
    RAISE EXCEPTION 'availability could not be reserved' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.availabilities
  SET is_reserved = true, updated_at = now()
  WHERE id = v_availability_id;

  UPDATE public.job_requests
  SET availability_id = v_availability_id
  WHERE id = v_job.id;

  SELECT * INTO v_private FROM public.job_private_details WHERE job_request_id = v_job.id;
  SELECT * INTO v_freelancer FROM public.freelancers WHERE id = auth.uid();
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
      'crematorium_name', v_job.crematorium_name,
      'estimated_duration_minutes', v_job.estimated_duration_minutes,
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
      'emergency_contact', v_private.emergency_contact,
      'deceased_name', v_private.deceased_name,
      'company_contact_name', v_private.company_contact_name,
      'company_contact_phone', v_private.company_contact_phone,
      'detailed_notes', v_private.detailed_notes
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
  ON CONFLICT (job_request_id) DO NOTHING
  RETURNING * INTO v_contract;

  IF v_contract.id IS NULL THEN
    SELECT * INTO v_contract FROM public.contracts WHERE job_request_id = v_job.id;
  END IF;

  UPDATE public.job_candidates
  SET status = 'won', responded_at = now()
  WHERE job_request_id = v_job.id
    AND freelancer_id = auth.uid();

  UPDATE public.job_candidates
  SET status = 'lost', responded_at = now()
  WHERE job_request_id = v_job.id
    AND freelancer_id <> auth.uid()
    AND status IN ('notified', 'viewed');

  INSERT INTO public.job_status_history (job_request_id, from_status, to_status, changed_by, reason)
  VALUES (v_job.id, 'open', 'assigned', auth.uid(), 'claimed by first freelancer');

  INSERT INTO public.notifications (user_id, type, title, body, link_path, payload)
  VALUES
    (
      v_job.funeral_company_id,
      'job_assigned',
      '依頼が成立しました',
      'フリーランスが依頼を受け、契約が成立しました。',
      '/funeral-company/jobs/' || v_job.id::text,
      jsonb_build_object('job_request_id', v_job.id)
    ),
    (
      auth.uid(),
      'job_assigned',
      '依頼を受けました',
      '契約が成立しました。集合場所などの詳細を確認してください。',
      '/freelancer/jobs/' || v_job.id::text,
      jsonb_build_object('job_request_id', v_job.id)
    );

  FOR v_other IN
    SELECT c.freelancer_id
    FROM public.job_candidates c
    WHERE c.job_request_id = v_job.id
      AND c.freelancer_id <> auth.uid()
      AND c.status = 'lost'
  LOOP
    INSERT INTO public.notifications (user_id, type, title, body, link_path, payload)
    VALUES (
      v_other,
      'job_closed',
      '募集が終了しました',
      'こちらの依頼は別の方に決まりました。',
      '/freelancer/offers',
      jsonb_build_object('job_request_id', v_job.id)
    );
  END LOOP;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'job.claim',
    'job_request',
    v_job.id,
    jsonb_build_object('contract_id', v_contract.id, 'from_status', 'open', 'to_status', 'assigned')
  );

  RETURN v_contract;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_open_job(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_open_job(uuid) TO authenticated;

-- Deprecated direct-accept path
CREATE OR REPLACE FUNCTION public.accept_job_request(p_job_id uuid)
RETURNS public.contracts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'accept_job_request is deprecated; use claim_open_job'
    USING ERRCODE = 'P0001';
END;
$$;

-- ---------------------------------------------------------------------------
-- RLS for new tables + updated job policies
-- ---------------------------------------------------------------------------

ALTER TABLE public.job_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_change_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_change_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_day_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS job_requests_select ON public.job_requests;
CREATE POLICY job_requests_select ON public.job_requests
  FOR SELECT TO authenticated
  USING (
    funeral_company_id = auth.uid()
    OR assigned_freelancer_id = auth.uid()
    OR freelancer_id = auth.uid()
    OR public.is_admin()
    OR (
      status = 'open'
      AND EXISTS (
        SELECT 1 FROM public.job_candidates c
        WHERE c.job_request_id = job_requests.id
          AND c.freelancer_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS job_requests_insert_company ON public.job_requests;
CREATE POLICY job_requests_insert_company ON public.job_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    funeral_company_id = auth.uid()
    AND public.is_approved_funeral_company()
    AND assigned_freelancer_id IS NULL
  );

DROP POLICY IF EXISTS job_requests_update_parties ON public.job_requests;
CREATE POLICY job_requests_update_parties ON public.job_requests
  FOR UPDATE TO authenticated
  USING (
    funeral_company_id = auth.uid()
    OR assigned_freelancer_id = auth.uid()
    OR public.is_admin()
  )
  WITH CHECK (
    funeral_company_id = auth.uid()
    OR assigned_freelancer_id = auth.uid()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS job_private_details_select ON public.job_private_details;
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
        AND jr.assigned_freelancer_id = auth.uid()
        AND jr.status IN (
          'assigned', 'accepted', 'in_progress', 'completion_pending', 'completed',
          'cancellation_requested', 'disputed'
        )
    )
  );

-- job_candidates
CREATE POLICY job_candidates_select ON public.job_candidates
  FOR SELECT TO authenticated
  USING (
    freelancer_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = job_candidates.job_request_id
        AND jr.funeral_company_id = auth.uid()
    )
  );

CREATE POLICY job_candidates_insert_deny ON public.job_candidates
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY job_candidates_update_own ON public.job_candidates
  FOR UPDATE TO authenticated
  USING (freelancer_id = auth.uid() OR public.is_admin())
  WITH CHECK (freelancer_id = auth.uid() OR public.is_admin());

-- job_messages: parties after assignment only
CREATE POLICY job_messages_select ON public.job_messages
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = job_messages.job_request_id
        AND (
          jr.funeral_company_id = auth.uid()
          OR jr.assigned_freelancer_id = auth.uid()
        )
        AND jr.status IN (
          'assigned', 'accepted', 'in_progress', 'completion_pending', 'completed',
          'cancellation_requested', 'disputed'
        )
    )
  );

CREATE POLICY job_messages_insert ON public.job_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = job_messages.job_request_id
        AND (
          jr.funeral_company_id = auth.uid()
          OR jr.assigned_freelancer_id = auth.uid()
        )
        AND jr.status IN (
          'assigned', 'accepted', 'in_progress', 'completion_pending',
          'cancellation_requested', 'disputed'
        )
    )
  );

-- change notices
CREATE POLICY job_change_notices_select ON public.job_change_notices
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = job_change_notices.job_request_id
        AND (
          jr.funeral_company_id = auth.uid()
          OR jr.assigned_freelancer_id = auth.uid()
        )
    )
  );

CREATE POLICY job_change_notices_insert ON public.job_change_notices
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = job_change_notices.job_request_id
        AND jr.funeral_company_id = auth.uid()
        AND jr.assigned_freelancer_id IS NOT NULL
    )
  );

CREATE POLICY job_change_acknowledgements_select ON public.job_change_acknowledgements
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.job_change_notices n
      JOIN public.job_requests jr ON jr.id = n.job_request_id
      WHERE n.id = job_change_acknowledgements.notice_id
        AND jr.funeral_company_id = auth.uid()
    )
  );

CREATE POLICY job_change_acknowledgements_insert ON public.job_change_acknowledgements
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.job_change_notices n
      JOIN public.job_requests jr ON jr.id = n.job_request_id
      WHERE n.id = job_change_acknowledgements.notice_id
        AND jr.assigned_freelancer_id = auth.uid()
    )
  );

CREATE POLICY contract_amendments_select ON public.contract_amendments
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = contract_amendments.job_request_id
        AND (
          jr.funeral_company_id = auth.uid()
          OR jr.assigned_freelancer_id = auth.uid()
        )
    )
  );

CREATE POLICY contract_amendments_insert ON public.contract_amendments
  FOR INSERT TO authenticated
  WITH CHECK (
    proposed_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = contract_amendments.job_request_id
        AND jr.funeral_company_id = auth.uid()
    )
  );

CREATE POLICY contract_amendments_update ON public.contract_amendments
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = contract_amendments.job_request_id
        AND (
          jr.funeral_company_id = auth.uid()
          OR jr.assigned_freelancer_id = auth.uid()
        )
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = contract_amendments.job_request_id
        AND (
          jr.funeral_company_id = auth.uid()
          OR jr.assigned_freelancer_id = auth.uid()
        )
    )
  );

CREATE POLICY job_day_events_select ON public.job_day_events
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = job_day_events.job_request_id
        AND (
          jr.funeral_company_id = auth.uid()
          OR jr.assigned_freelancer_id = auth.uid()
        )
    )
  );

CREATE POLICY job_day_events_insert ON public.job_day_events
  FOR INSERT TO authenticated
  WITH CHECK (
    actor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.job_requests jr
      WHERE jr.id = job_day_events.job_request_id
        AND (
          jr.funeral_company_id = auth.uid()
          OR jr.assigned_freelancer_id = auth.uid()
        )
        AND jr.status IN (
          'assigned', 'accepted', 'in_progress', 'completion_pending',
          'cancellation_requested', 'disputed'
        )
    )
  );
