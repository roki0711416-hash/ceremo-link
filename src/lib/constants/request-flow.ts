export const FUNERAL_REQUEST_STEPS = [
  { id: "datetime", label: "日時選択" },
  { id: "details", label: "詳細入力" },
  { id: "confirm", label: "確認" },
  { id: "complete", label: "完了" },
] as const;

export const FUNERAL_REQUEST_SERVICE_LABEL = "火葬案内・誘導";

export const FAREWELL_TYPE_OPTIONS = [
  {
    id: "farewell_done",
    label: "お別れ済み",
    description: "式場などで故人とのお別れが済んでいる場合",
  },
  {
    id: "farewell_none",
    label: "お別れなし",
    description: "火葬場でのお別れが必要な場合",
  },
] as const;

export type FarewellType = (typeof FAREWELL_TYPE_OPTIONS)[number]["id"];

export function farewellTypeLabel(type?: string) {
  return FAREWELL_TYPE_OPTIONS.find((o) => o.id === type)?.label ?? "—";
}
