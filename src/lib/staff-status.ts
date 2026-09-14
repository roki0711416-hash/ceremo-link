import { staffAvailabilityThresholds } from "@/lib/design/tokens";

export type StaffStatusSymbol = "◎" | "○" | "△" | "×";

export function staffStatusFromCount(count: number): {
  symbol: StaffStatusSymbol;
  label: string;
} {
  if (count >= staffAvailabilityThresholds.many) {
    return { symbol: "◎", label: "対応可能者が多い" };
  }
  if (count >= staffAvailabilityThresholds.available) {
    return { symbol: "○", label: "対応可能" };
  }
  if (count >= staffAvailabilityThresholds.few) {
    return { symbol: "△", label: "残りわずか" };
  }
  return { symbol: "×", label: "現在対応者なし" };
}

export type StaffCountRow = {
  work_date: string;
  freelancer_count: number;
};

export type StaffCountsLoadState =
  | { kind: "ok"; rows: StaffCountRow[] }
  | { kind: "empty" }
  | { kind: "unauthorized" }
  | { kind: "error" };

export function classifyStaffCountsResult(input: {
  errorCode?: string | null;
  errorMessage?: string | null;
  rows: StaffCountRow[] | null;
}): StaffCountsLoadState {
  const code = (input.errorCode ?? "").toLowerCase();
  const message = (input.errorMessage ?? "").toLowerCase();

  if (input.errorCode || input.errorMessage) {
    if (
      code.includes("42501") ||
      message.includes("not authorized") ||
      message.includes("permission")
    ) {
      return { kind: "unauthorized" };
    }
    return { kind: "error" };
  }

  if (!input.rows || input.rows.length === 0) {
    return { kind: "empty" };
  }

  return { kind: "ok", rows: input.rows };
}

export function countForDate(
  rows: StaffCountRow[],
  isoDate: string,
): number | null {
  const found = rows.find((row) => row.work_date.slice(0, 10) === isoDate);
  return found ? found.freelancer_count : null;
}
