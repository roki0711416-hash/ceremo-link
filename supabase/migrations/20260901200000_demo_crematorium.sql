-- デモ・練習専用の火葬場（実在施設ではない）

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
  'demo-ceremo-link',
  '【デモ】セレモリンク練習斎場',
  m.id,
  '神奈川県横浜市（デモ用・実在の火葬場ではありません）',
  '本番の火葬場ではありません。依頼作成フローの練習・デモ確認専用です。マッチング・通知もテスト目的です。',
  true,
  'デモ用',
  0,
  35.465,
  139.635,
  'デモ用（料金は表示のみ）'
FROM public.municipalities m
WHERE m.code = '14103'
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
