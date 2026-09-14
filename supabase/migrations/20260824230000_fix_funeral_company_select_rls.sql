-- Break RLS recursion: funeral_companies SELECT -> job_requests -> job_candidates -> job_requests
-- SECURITY DEFINER reads job_requests without RLS. search_path is fixed. anon cannot execute.

CREATE OR REPLACE FUNCTION public.can_select_funeral_company(p_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    p_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.job_requests jr
      WHERE jr.funeral_company_id = p_id
        AND coalesce(jr.assigned_freelancer_id, jr.freelancer_id) = auth.uid()
        AND jr.status IN (
          'assigned',
          'accepted',
          'in_progress',
          'completion_pending',
          'completed',
          'cancellation_requested',
          'disputed'
        )
    );
$$;

REVOKE ALL ON FUNCTION public.can_select_funeral_company(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_select_funeral_company(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.can_select_funeral_company(uuid) TO authenticated;

DROP POLICY IF EXISTS funeral_companies_select ON public.funeral_companies;
CREATE POLICY funeral_companies_select ON public.funeral_companies
  FOR SELECT TO authenticated
  USING (public.can_select_funeral_company(id));
