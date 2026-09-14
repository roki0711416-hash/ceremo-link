import { describe, expect, it } from "vitest";

import { staffAvailabilityThresholds } from "@/lib/design/tokens";
import {
  classifyStaffCountsResult,
  staffStatusFromCount,
} from "@/lib/staff-status";

describe("staffStatusFromCount", () => {
  it("maps counts to symbols with labels", () => {
    expect(staffStatusFromCount(0)).toEqual({
      symbol: "×",
      label: "現在対応者なし",
    });
    expect(staffStatusFromCount(staffAvailabilityThresholds.few).symbol).toBe(
      "△",
    );
    expect(
      staffStatusFromCount(staffAvailabilityThresholds.available).symbol,
    ).toBe("○");
    expect(staffStatusFromCount(staffAvailabilityThresholds.many).symbol).toBe(
      "◎",
    );
  });
});

describe("classifyStaffCountsResult", () => {
  it("distinguishes empty, unauthorized, and error", () => {
    expect(classifyStaffCountsResult({ rows: [] }).kind).toBe("empty");
    expect(
      classifyStaffCountsResult({
        rows: null,
        errorCode: "42501",
        errorMessage: "not authorized",
      }).kind,
    ).toBe("unauthorized");
    expect(
      classifyStaffCountsResult({
        rows: null,
        errorCode: "PGRST301",
        errorMessage: "fetch failed",
      }).kind,
    ).toBe("error");
    expect(
      classifyStaffCountsResult({
        rows: [{ work_date: "2026-08-01", freelancer_count: 2 }],
      }).kind,
    ).toBe("ok");
  });
});
