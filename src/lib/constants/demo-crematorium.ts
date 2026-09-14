import type { KanagawaCrematoriumPin } from "@/lib/constants/kanagawa-crematoriums";

export const DEMO_CREMATORIUM_SLUG = "demo-ceremo-link";

export const DEMO_CREMATORIUM_DATA_LABEL = "デモ用";

export const DEMO_CREMATORIUM_PIN: KanagawaCrematoriumPin = {
  id: DEMO_CREMATORIUM_SLUG,
  name: "【デモ】セレモリンク練習斎場",
  address: "神奈川県横浜市（デモ用・実在の火葬場ではありません）",
  municipalityName: "横浜市",
  lat: 35.465,
  lng: 139.635,
  usageFeeNote: "デモ用（料金は表示のみ）",
  isDemo: true,
};

export function isDemoCrematorium(
  slug?: string | null,
  dataLabel?: string | null,
  name?: string | null,
): boolean {
  return (
    slug === DEMO_CREMATORIUM_SLUG ||
    dataLabel === DEMO_CREMATORIUM_DATA_LABEL ||
    (name != null && name.includes("【デモ】"))
  );
}
