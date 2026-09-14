import { describe, expect, it } from "vitest";

import {
  draftToMeetupAt,
  draftToWorkEndsAt,
  draftToWorkStartsAt,
  type RequestDraft,
} from "@/lib/demo/draft-storage";

describe("request draft datetime helpers", () => {
  const draft: RequestDraft = {
    workDate: "2026-09-01",
    startTime: "09:00",
    endTime: "15:30",
    meetupTime: "08:30",
  };

  it("builds tokyo local datetime strings", () => {
    expect(draftToWorkStartsAt(draft)).toBe("2026-09-01T09:00");
    expect(draftToWorkEndsAt(draft)).toBe("2026-09-01T15:30");
    expect(draftToMeetupAt(draft)).toBe("2026-09-01T08:30");
  });

  it("returns empty when incomplete", () => {
    expect(draftToWorkStartsAt({})).toBe("");
  });
});
