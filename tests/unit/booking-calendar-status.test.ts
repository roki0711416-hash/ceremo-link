import { test, expect } from "vitest";

import {
  bookingLevelFromStaffCount,
  BOOKING_SLOT_LABELS,
} from "@/lib/booking-calendar-status";

test("スタッフ人数から予約レベルを判定する", () => {
  expect(BOOKING_SLOT_LABELS[bookingLevelFromStaffCount(5)].label).toBe(
    BOOKING_SLOT_LABELS.available.label,
  );
  expect(BOOKING_SLOT_LABELS[bookingLevelFromStaffCount(2)].label).toBe(
    BOOKING_SLOT_LABELS.moderate.label,
  );
  expect(BOOKING_SLOT_LABELS[bookingLevelFromStaffCount(1)].label).toBe(
    BOOKING_SLOT_LABELS.few.label,
  );
  expect(BOOKING_SLOT_LABELS[bookingLevelFromStaffCount(0)].label).toBe(
    BOOKING_SLOT_LABELS.crowded.label,
  );
});
