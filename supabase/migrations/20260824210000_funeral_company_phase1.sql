-- Funeral company phase 1: profile fields, crematoriums (placeholder), company docs, staff counts RPC
-- Additive only. Does NOT rewrite past migrations. No db reset.
-- Does not DROP tables, TRUNCATE, or delete existing rows.

-- ---------------------------------------------------------------------------
-- funeral_companies: profile fields for Kanagawa-only registration
-- Reuses existing company_name / representative_name / contact_person_name / phone / address / municipality_id / verification_*
-- ---------------------------------------------------------------------------

ALTER TABLE public.funeral_companies
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS prefecture text NOT NULL DEFAULT '神奈川県',
  ADD COLUMN IF NOT EXISTS emergency_phone text,
  ADD COLUMN IF NOT EXISTS corporate_number text,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS business_document_path text,
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS profile_completed_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'funeral_companies_prefecture_kanagawa_chk'
  ) THEN
    ALTER TABLE public.funeral_companies
      ADD CONSTRAINT funeral_companies_prefecture_kanagawa_chk
      CHECK (prefecture = '神奈川県');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'funeral_companies_postal_code_chk'
  ) THEN
    ALTER TABLE public.funeral_companies
      ADD CONSTRAINT funeral_companies_postal_code_chk
      CHECK (
        postal_code IS NULL
        OR postal_code ~ '^[0-9]{3}-?[0-9]{4}$'
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'funeral_companies_corporate_number_chk'
  ) THEN
    ALTER TABLE public.funeral_companies
      ADD CONSTRAINT funeral_companies_corporate_number_chk
      CHECK (
        corporate_number IS NULL
        OR corporate_number ~ '^[0-9]{13}$'
      );
  END IF;
END $$;

COMMENT ON COLUMN public.funeral_companies.company_name IS '会社名';
COMMENT ON COLUMN public.funeral_companies.representative_name IS '法人名または屋号';
COMMENT ON COLUMN public.funeral_companies.contact_person_name IS '担当者名';
COMMENT ON COLUMN public.funeral_companies.business_document_path IS '営業確認書類（company-docs バケット内パス）';

-- ---------------------------------------------------------------------------
-- crematoriums: placeholder Kanagawa facilities (no real photos/phones)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.crematoriums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  municipality_id uuid NOT NULL REFERENCES public.municipalities (id),
  address text NOT NULL,
  notes text,
  is_placeholder boolean NOT NULL DEFAULT true,
  data_label text NOT NULL DEFAULT '仮データ',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT crematoriums_placeholder_mvp_chk CHECK (is_placeholder = true),
  CONSTRAINT crematoriums_data_label_chk CHECK (data_label = '仮データ')
);

COMMENT ON TABLE public.crematoriums IS '神奈川県内火葬場のマスタ。MVPは仮データのみ（is_placeholder / data_label で識別）。';
COMMENT ON COLUMN public.crematoriums.is_placeholder IS 'true のとき仮データ。実在施設の写真・電話番号は含めない。';
COMMENT ON COLUMN public.crematoriums.data_label IS '画面表示用の識別ラベル（仮データ）。';

CREATE INDEX IF NOT EXISTS crematoriums_municipality_idx
  ON public.crematoriums (municipality_id);

CREATE INDEX IF NOT EXISTS crematoriums_name_idx
  ON public.crematoriums (name);

CREATE OR REPLACE TRIGGER trg_crematoriums_updated_at
  BEFORE UPDATE ON public.crematoriums
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.crematoriums ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY crematoriums_select ON public.crematoriums
    FOR SELECT TO authenticated
    USING (
      public.current_role() = 'funeral_company'
      OR public.is_admin()
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY crematoriums_write_admin ON public.crematoriums
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

GRANT SELECT ON public.crematoriums TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crematoriums TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'crematoriums_name_municipality_uidx'
  ) THEN
    ALTER TABLE public.crematoriums
      ADD CONSTRAINT crematoriums_name_municipality_uidx UNIQUE (name, municipality_id);
  END IF;
END $$;

INSERT INTO public.crematoriums (
  name,
  municipality_id,
  address,
  notes,
  is_placeholder,
  data_label,
  sort_order
)
SELECT
  v.name,
  m.id,
  v.address,
  '仮データです。実在施設の写真・電話番号・公式情報は掲載していません。火葬場の公式予約枠ではありません。',
  true,
  '仮データ',
  v.sort_order
FROM (
  VALUES
    ('サンプル西横浜斎場', '14103', '神奈川県横浜市西区サンプル1-1', 10),
    ('サンプル横浜中斎苑', '14104', '神奈川県横浜市中区サンプル1-2', 20),
    ('サンプル川崎北斎苑', '14134', '神奈川県川崎市高津区サンプル2-2', 30),
    ('サンプル川崎中央斎場', '14131', '神奈川県川崎市川崎区サンプル2-3', 40),
    ('サンプル相模原聖苑', '14152', '神奈川県相模原市中央区サンプル3-3', 50),
    ('サンプル藤沢斎場', '14205', '神奈川県藤沢市サンプル4-4', 60),
    ('サンプル小田原斎場', '14206', '神奈川県小田原市サンプル5-5', 70),
    ('サンプル横須賀斎苑', '14201', '神奈川県横須賀市サンプル6-6', 80)
) AS v(name, muni_code, address, sort_order)
JOIN public.municipalities m ON m.code = v.muni_code
ON CONFLICT (name, municipality_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Storage: private company-docs bucket (business verification)
-- public=false, 10MB, jpeg/png/webp/pdf only
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-docs',
  'company-docs',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

UPDATE storage.buckets
SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
WHERE id = 'company-docs';

DO $$
BEGIN
  CREATE POLICY company_docs_select ON storage.objects
    FOR SELECT TO authenticated
    USING (
      bucket_id = 'company-docs'
      AND (
        public.is_admin()
        OR (storage.foldername(name))[1] = auth.uid()::text
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY company_docs_insert ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'company-docs'
      AND (storage.foldername(name))[1] = auth.uid()::text
      AND public.current_role() = 'funeral_company'
      AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'pdf')
      AND coalesce(metadata->>'mimetype', '') IN (
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf'
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY company_docs_update ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'company-docs'
      AND (
        public.is_admin()
        OR (storage.foldername(name))[1] = auth.uid()::text
      )
    )
    WITH CHECK (
      bucket_id = 'company-docs'
      AND (
        public.is_admin()
        OR (storage.foldername(name))[1] = auth.uid()::text
      )
      AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'pdf')
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY company_docs_delete ON storage.objects
    FOR DELETE TO authenticated
    USING (
      bucket_id = 'company-docs'
      AND (
        public.is_admin()
        OR (storage.foldername(name))[1] = auth.uid()::text
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Staff availability daily counts
-- Returns only (work_date, freelancer_count). No freelancer PII or IDs.
-- Callable by logged-in approved funeral companies or admins only.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.staff_availability_daily_counts(
  p_municipality_id uuid,
  p_from date,
  p_to date
)
RETURNS TABLE (work_date date, freelancer_count integer)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_service_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  IF p_municipality_id IS NULL OR p_from IS NULL OR p_to IS NULL THEN
    RAISE EXCEPTION 'invalid arguments' USING ERRCODE = '22023';
  END IF;

  IF p_to < p_from THEN
    RAISE EXCEPTION 'invalid date range' USING ERRCODE = '22023';
  END IF;

  IF p_to > p_from + 62 THEN
    RAISE EXCEPTION 'date range too large' USING ERRCODE = '22023';
  END IF;

  IF public.is_admin() THEN
    NULL;
  ELSIF public.is_approved_funeral_company()
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'funeral_company'
        AND COALESCE(p.is_suspended, false) = false
    )
  THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  SELECT id INTO v_service_id
  FROM public.service_types
  WHERE code = 'crematorium_guide'
  LIMIT 1;

  IF v_service_id IS NULL THEN
    RAISE EXCEPTION 'service type missing' USING ERRCODE = 'P0001';
  END IF;

  RETURN QUERY
  SELECT
    d.d AS work_date,
    (
      SELECT count(DISTINCT a.freelancer_id)::integer
      FROM public.availabilities a
      INNER JOIN public.freelancers f
        ON f.id = a.freelancer_id
        AND f.verification_status = 'approved'
      INNER JOIN public.profiles fp
        ON fp.id = a.freelancer_id
        AND fp.role = 'freelancer'
        AND COALESCE(fp.is_suspended, false) = false
      INNER JOIN public.freelancer_service_areas fsa
        ON fsa.freelancer_id = a.freelancer_id
        AND fsa.municipality_id = p_municipality_id
      INNER JOIN public.freelancer_services fs
        ON fs.freelancer_id = a.freelancer_id
        AND fs.service_type_id = v_service_id
      WHERE a.is_active = true
        AND a.is_reserved = false
        AND a.starts_at < ((d.d + 1)::timestamp AT TIME ZONE 'Asia/Tokyo')
        AND a.ends_at > (d.d::timestamp AT TIME ZONE 'Asia/Tokyo')
        AND NOT EXISTS (
          SELECT 1
          FROM public.contracts c
          INNER JOIN public.job_requests jr ON jr.id = c.job_request_id
          WHERE coalesce(jr.assigned_freelancer_id, jr.freelancer_id) = a.freelancer_id
            AND jr.status NOT IN ('cancelled', 'declined', 'expired')
            AND tstzrange(jr.work_starts_at, jr.work_ends_at, '[)')
                && tstzrange(a.starts_at, a.ends_at, '[)')
        )
    ) AS freelancer_count
  FROM (
    SELECT generate_series(p_from, p_to, interval '1 day')::date AS d
  ) d
  ORDER BY d.d;
END;
$$;

COMMENT ON FUNCTION public.staff_availability_daily_counts(uuid, date, date) IS
  '審査済み葬儀社または管理者向け。該当日の火葬案内対応可能人数のみ返す（個人情報なし）。';

REVOKE ALL ON FUNCTION public.staff_availability_daily_counts(uuid, date, date) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.staff_availability_daily_counts(uuid, date, date) FROM anon;
GRANT EXECUTE ON FUNCTION public.staff_availability_daily_counts(uuid, date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.staff_availability_daily_counts(uuid, date, date) TO service_role;
