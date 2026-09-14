-- TEMPORARY: 審査ゲートを停止（デモ・検証用）
-- 再有効化時は is_approved_funeral_company / is_approved_freelancer を
-- 20260823000000_initial_schema.sql の定義に戻すマイグレーションを適用してください。

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
  );
$$;

COMMENT ON FUNCTION public.is_approved_funeral_company() IS
  'TEMP: 登録済み葬儀社なら true（verification_status 未チェック）';
COMMENT ON FUNCTION public.is_approved_freelancer() IS
  'TEMP: 登録済みフリーランスなら true（verification_status 未チェック）';
