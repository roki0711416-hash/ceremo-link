import { test, expect } from "vitest";

import {
  computeResponseDeadlineAt,
  ensureFutureResponseDeadlineAt,
  tokyoInputToIso,
} from "@/lib/job-request-deadlines";

test("当日の依頼でも回答期限は未来になる", () => {
  const now = new Date("2026-09-01T21:30:00+09:00");
  const workStartsAt = "2026-09-01T10:00";
  const deadline = computeResponseDeadlineAt(workStartsAt);
  expect(new Date(tokyoInputToIso(deadline)) > now).toBe(true);
});

test("過去の回答期限は再計算される", () => {
  const workStartsAt = "2026-09-15T10:00";
  const fixed = ensureFutureResponseDeadlineAt(
    "2026-08-31T18:00",
    workStartsAt,
  );
  expect(new Date(tokyoInputToIso(fixed)) > new Date()).toBe(true);
});
