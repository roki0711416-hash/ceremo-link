-- Kanagawa crematoriums: public reference data (20 sites). Additive only.
-- Relaxes placeholder-only constraint and seeds slug + coordinates for map.

ALTER TABLE public.crematoriums
  DROP CONSTRAINT IF EXISTS crematoriums_placeholder_mvp_chk;

ALTER TABLE public.crematoriums
  DROP CONSTRAINT IF EXISTS crematoriums_data_label_chk;

ALTER TABLE public.crematoriums
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS lat numeric(9, 6),
  ADD COLUMN IF NOT EXISTS lng numeric(9, 6),
  ADD COLUMN IF NOT EXISTS usage_fee_note text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'crematoriums_slug_key'
  ) THEN
    ALTER TABLE public.crematoriums
      ADD CONSTRAINT crematoriums_slug_key UNIQUE (slug);
  END IF;
END $$;

INSERT INTO public.crematoriums (
  slug,
  name,
  municipality_id,
  address,
  notes,
  is_placeholder,
  data_label,
  sort_order,
  lat,
  lng,
  usage_fee_note
)
SELECT
  v.slug,
  v.name,
  m.id,
  v.address,
  '公開情報を参考に掲載。火葬場の公式予約枠ではありません。写真・電話番号は掲載していません。',
  false,
  '公開情報',
  v.sort_order,
  v.lat,
  v.lng,
  v.usage_fee_note
FROM (
  VALUES
    ('kuboyama', '久保山斎場', '14103', '神奈川県横浜市西区元久保町3-1', 10, 35.4458, 139.6185, '12,000円（横浜市民）'),
    ('totsuka', '戸塚斎場', '14110', '神奈川県横浜市戸塚区鳥が丘10-5', 20, 35.3968, 139.4902, '12,000円（横浜市民）'),
    ('yokohama-hokubu', '横浜市北部斎場', '14113', '神奈川県横浜市緑区長津田町5125-1', 30, 35.5491, 139.4994, '12,000円（横浜市民）'),
    ('yokohama-minami', '横浜市南部斎場', '14108', '神奈川県横浜市金沢区みず木町1', 40, 35.3578, 139.6225, '12,000円（横浜市民）'),
    ('kawasaki-kita', 'かわさき北部斎苑', '14134', '神奈川県川崎市高津区下作延6-18-1', 50, 35.5905, 139.593, '6,750円（川崎市民）'),
    ('kawasaki-minami', 'かわさき南部斎苑', '14131', '神奈川県川崎市川崎区夜光3-2-7', 60, 35.5288, 139.7156, '6,750円（川崎市民）'),
    ('aikawa', '愛川聖苑', '14401', '神奈川県愛甲郡愛川町棚沢941-1', 70, 35.521, 139.3135, '8,000円（愛川町民）'),
    ('atsugi', '厚木市斎場', '14212', '神奈川県厚木市下古沢548', 80, 35.4545, 139.351, '10,000円（厚木市民）'),
    ('odawara', '小田原市斎場', '14206', '神奈川県小田原市久野3664-8', 90, 35.2835, 139.152, '無料（小田原市民）ほか条件あり'),
    ('sagamihara', '相模原市営斎場', '14152', '神奈川県相模原市古淵5-26-1', 100, 35.5895, 139.419, '6,000円（相模原市民）'),
    ('chigasaki', '茅ヶ崎市斎場', '14207', '神奈川県茅ケ崎市芹沢1700', 110, 35.3695, 139.388, '無料（茅ヶ崎市民）'),
    ('hadano', '秦野斎場', '14211', '神奈川県秦野市曽屋1006', 120, 35.371, 139.228, '11,000円（秦野市民）'),
    ('hiratsuka', '平塚市聖苑', '14203', '神奈川県平塚市田村九丁目25-2', 130, 35.336, 139.365, '無料（平塚市民）'),
    ('fujisawa', '藤沢聖苑', '14205', '神奈川県藤沢市大鋸1225', 140, 35.4005, 139.472, '10,000円（藤沢市民）'),
    ('manazuru', '真鶴聖苑', '14383', '神奈川県足柄下郡真鶴町真鶴1916', 150, 35.156, 139.6225, '無料（真鶴町民または湯河原町民）'),
    ('miura', '三浦市火葬場', '14210', '神奈川県三浦市三崎町六合1019', 160, 35.136, 139.632, '8,000円（三浦市民）'),
    ('yamato', '大和斎場', '14213', '神奈川県大和市西鶴間8-10-8', 170, 35.471, 139.441, '10,000円（大和市・海老名市・座間市・綾瀬市民）'),
    ('yokosuka', '横須賀市中央斎場', '14201', '神奈川県横須賀市坂本町6-18', 180, 35.283, 139.668, '10,000円（横須賀市民）'),
    ('nishiterao', '西寺尾火葬場', '14112', '神奈川県横浜市旭区西寺尾町779', 190, 35.438, 139.552, '民営（56,000円〜85,000円）'),
    ('ozu', '小坪誠行社斎場', '14208', '神奈川県逗子市小坪5-8-1', 200, 35.298, 139.578, '民営（逗子・鎌倉・葉山エリア）')
) AS v(slug, name, muni_code, address, sort_order, lat, lng, usage_fee_note)
JOIN public.municipalities m ON m.code = v.muni_code
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  municipality_id = EXCLUDED.municipality_id,
  address = EXCLUDED.address,
  notes = EXCLUDED.notes,
  is_placeholder = EXCLUDED.is_placeholder,
  data_label = EXCLUDED.data_label,
  sort_order = EXCLUDED.sort_order,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  usage_fee_note = EXCLUDED.usage_fee_note;

COMMENT ON COLUMN public.crematoriums.slug IS '地図・URL用の安定ID';
COMMENT ON COLUMN public.crematoriums.lat IS '地図表示用の概略緯度';
COMMENT ON COLUMN public.crematoriums.lng IS '地図表示用の概略経度';
COMMENT ON COLUMN public.crematoriums.usage_fee_note IS '利用料金の目安（公開情報参考）';
