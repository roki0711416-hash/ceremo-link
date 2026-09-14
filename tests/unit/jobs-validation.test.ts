import { describe, expect, it } from "vitest";

import { createOpenJobSchema } from "@/lib/validations/jobs";

describe("createOpenJobSchema", () => {
  const base = {
    serviceTypeId: "11111111-1111-4111-8111-111111111111",
    municipalityId: "22222222-2222-4222-8222-222222222222",
    locationGeneral: "横浜市内の式場付近",
    crematoriumName: "サンプル火葬場",
    workStartsAt: "2099-01-10T10:00",
    workEndsAt: "2099-01-10T16:00",
    payAmount: 15000,
    travelExpense: 1000,
    paymentDueOn: "2099-01-31",
    responseDeadlineAt: "2099-01-09T18:00",
    deceasedName: "テスト故人",
    exactAddress: "神奈川県横浜市西区1-1-1",
    meetupLocation: "式場正面玄関",
    companyContactName: "担当太郎",
    companyContactPhone: "045-000-0000",
    emergencyContact: "045-000-0001",
  };

  it("accepts a valid open job payload", () => {
    expect(createOpenJobSchema.safeParse(base).success).toBe(true);
  });

  it("rejects when end is before start", () => {
    const result = createOpenJobSchema.safeParse({
      ...base,
      workEndsAt: "2099-01-10T09:00",
    });
    expect(result.success).toBe(false);
  });
});
