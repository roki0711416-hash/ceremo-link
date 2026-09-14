import { describe, expect, it } from "vitest";

import { brand, roleColors, staffAvailabilityThresholds } from "@/lib/design/tokens";

describe("design tokens", () => {
  it("exposes CeremoLink brand copy", () => {
    expect(brand.nameJa).toBe("セレモリンク");
    expect(brand.nameEn).toBe("CeremoLink");
    expect(brand.tagline).toContain("つなぐ");
  });

  it("keeps funeral purple and freelancer green distinct", () => {
    expect(roleColors.funeralCompany.main).toBe("#4A3E7F");
    expect(roleColors.freelancer.main).toBe("#2F6B4F");
  });

  it("defines staff availability thresholds", () => {
    expect(staffAvailabilityThresholds.many).toBeGreaterThan(
      staffAvailabilityThresholds.available,
    );
  });
});
