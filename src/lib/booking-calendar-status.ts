import { staffAvailabilityThresholds } from "@/lib/design/tokens";

/** カレンダー表示用の空きレベル（火葬案内スタッフの対応可能人数ベース） */
export type BookingSlotLevel =
  | "available"
  | "moderate"
  | "few"
  | "crowded"
  | "unknown";

export const BOOKING_SLOT_LABELS: Record<
  BookingSlotLevel,
  { symbol: string; label: string; description: string }
> = {
  available: {
    symbol: "○",
    label: "空きあり",
    description: "十分に対応可能なスタッフがいます",
  },
  moderate: {
    symbol: "○",
    label: "やや混雑",
    description: "対応可能者が少なくなっています",
  },
  few: {
    symbol: "△",
    label: "残りわずか",
    description: "対応可能なスタッフがわずかです",
  },
  crowded: {
    symbol: "△",
    label: "混雑",
    description: "現在対応可能なスタッフがほとんどありません",
  },
  unknown: {
    symbol: "—",
    label: "未表示",
    description: "審査完了後に表示されます",
  },
};

export function bookingLevelFromStaffCount(count: number | null): BookingSlotLevel {
  if (count === null) return "unknown";
  if (count >= staffAvailabilityThresholds.many) return "available";
  if (count >= staffAvailabilityThresholds.available) return "moderate";
  if (count >= staffAvailabilityThresholds.few) return "few";
  return "crowded";
}
