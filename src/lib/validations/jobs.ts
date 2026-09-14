import { z } from "zod";

import { tokyoInputToIso } from "@/lib/job-request-deadlines";

const tokyoDateTime = z.string().min(1, "日時を入力してください");

export const createOpenJobSchema = z
  .object({
    serviceTypeId: z.string().uuid("業務区分を選択してください"),
    municipalityId: z.string().uuid("市区町村を選択してください"),
    locationGeneral: z
      .string()
      .trim()
      .min(1, "一般的な場所情報を入力してください")
      .max(200),
    crematoriumName: z.string().trim().min(1, "火葬場名を入力してください").max(100),
    workStartsAt: tokyoDateTime,
    workEndsAt: tokyoDateTime,
    estimatedDurationMinutes: z.coerce.number().int().positive().optional(),
    payAmount: z.coerce.number().int().min(0, "報酬は0以上の整数です"),
    travelExpense: z.coerce.number().int().min(0, "交通費は0以上の整数です"),
    paymentDueOn: z.string().min(1, "支払期日を入力してください"),
    responseDeadlineAt: tokyoDateTime,
    description: z.string().trim().max(2000).optional(),
    dressCode: z.string().trim().max(200).optional(),
    belongings: z.string().trim().max(500).optional(),
    // private
    deceasedName: z.string().trim().min(1, "故人名は契約後開示用に保存します").max(100),
    exactAddress: z.string().trim().min(1).max(300),
    facilityName: z.string().trim().max(200).optional(),
    meetupLocation: z.string().trim().min(1).max(300),
    companyContactName: z.string().trim().min(1).max(100),
    companyContactPhone: z.string().trim().min(1).max(30),
    emergencyContact: z.string().trim().min(1).max(100),
    detailedNotes: z.string().trim().max(5000).optional(),
  })
  .refine((v) => new Date(tokyoInputToIso(v.workEndsAt)) > new Date(tokyoInputToIso(v.workStartsAt)), {
    message: "終了日時は開始日時より後にしてください",
    path: ["workEndsAt"],
  })
  .refine((v) => new Date(tokyoInputToIso(v.responseDeadlineAt)) > new Date(), {
    message: "回答期限は現在より後にしてください",
    path: ["responseDeadlineAt"],
  });

export type CreateOpenJobInput = z.infer<typeof createOpenJobSchema>;
