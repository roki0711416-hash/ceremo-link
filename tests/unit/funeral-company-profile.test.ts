import { describe, expect, it } from "vitest";

import {
  funeralCompanyProfileSchema,
  isAllowedCompanyDoc,
  isFuneralCompanyProfileComplete,
  KANAGAWA_PREFECTURE,
} from "@/lib/validations/funeral-company";

const completeCompany = {
  company_name: "サンプル葬祭",
  representative_name: "サンプル葬祭",
  contact_person_name: "担当花子",
  postal_code: "220-0001",
  prefecture: KANAGAWA_PREFECTURE,
  municipality_id: "22222222-2222-4222-8222-222222222222",
  address: "神奈川県横浜市西区1-1",
  phone: "045-000-0000",
  emergency_phone: "045-000-0001",
  business_document_path: "uid/file.pdf",
  terms_accepted_at: "2026-08-24T00:00:00Z",
  profile_completed_at: "2026-08-24T00:00:00Z",
};

const validInput = {
  companyName: "サンプル葬祭",
  representativeName: "サンプル葬祭",
  contactPersonName: "担当花子",
  postalCode: "2200001",
  prefecture: KANAGAWA_PREFECTURE,
  municipalityId: "22222222-2222-4222-8222-222222222222",
  address: "神奈川県横浜市西区1-1",
  phone: "045-000-0000",
  emergencyPhone: "045-000-0001",
  corporateNumber: "",
  websiteUrl: "",
  termsAccepted: true,
};

describe("funeralCompanyProfileSchema", () => {
  it("accepts a Kanagawa profile", () => {
    expect(funeralCompanyProfileSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects a prefecture outside Kanagawa", () => {
    const result = funeralCompanyProfileSchema.safeParse({
      ...validInput,
      prefecture: "東京都",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an address outside Kanagawa", () => {
    const result = funeralCompanyProfileSchema.safeParse({
      ...validInput,
      address: "東京都千代田区1-1",
    });
    expect(result.success).toBe(false);
  });
});

describe("isFuneralCompanyProfileComplete", () => {
  it("requires all mandatory fields", () => {
    expect(isFuneralCompanyProfileComplete(completeCompany)).toBe(true);
    expect(
      isFuneralCompanyProfileComplete({
        ...completeCompany,
        profile_completed_at: null,
      }),
    ).toBe(false);
  });
});

describe("isAllowedCompanyDoc", () => {
  it("accepts pdf under 10MB", () => {
    expect(
      isAllowedCompanyDoc({
        size: 1024,
        type: "application/pdf",
        name: "license.pdf",
      }).ok,
    ).toBe(true);
  });

  it("rejects oversized files", () => {
    expect(
      isAllowedCompanyDoc({
        size: 11 * 1024 * 1024,
        type: "application/pdf",
        name: "license.pdf",
      }).ok,
    ).toBe(false);
  });
});
