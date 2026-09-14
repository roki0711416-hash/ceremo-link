import { z } from "zod";

export const KANAGAWA_PREFECTURE = "神奈川県";

const phoneSchema = z
  .string()
  .trim()
  .min(1, "電話番号を入力してください")
  .max(20, "電話番号が長すぎます")
  .regex(/^[0-9+\-() ]+$/, "電話番号の形式を確認してください");

export const funeralCompanyProfileSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, "会社名を入力してください")
    .max(100, "会社名は100文字以内にしてください"),
  representativeName: z
    .string()
    .trim()
    .min(1, "法人名または屋号を入力してください")
    .max(100, "法人名または屋号は100文字以内にしてください"),
  contactPersonName: z
    .string()
    .trim()
    .min(1, "担当者名を入力してください")
    .max(80, "担当者名は80文字以内にしてください"),
  postalCode: z
    .string()
    .trim()
    .transform((value) => value.replace(/[ー−]/g, "-").replace(/\s/g, ""))
    .pipe(
      z
        .string()
        .regex(
          /^[0-9]{3}-?[0-9]{4}$/,
          "郵便番号は123-4567の形式で入力してください",
        ),
    ),
  prefecture: z
    .string()
    .trim()
    .refine((value) => value === KANAGAWA_PREFECTURE, {
      message: "MVPでは神奈川県のみ登録できます",
    }),
  municipalityId: z.string().uuid("市区町村を選択してください"),
  address: z
    .string()
    .trim()
    .min(1, "住所を入力してください")
    .max(200, "住所は200文字以内にしてください")
    .refine((value) => value.startsWith(KANAGAWA_PREFECTURE), {
      message: "神奈川県外の住所は登録できません",
    }),
  phone: phoneSchema,
  emergencyPhone: phoneSchema,
  corporateNumber: z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }, z
    .string()
    .regex(/^[0-9]{13}$/, "法人番号は13桁の数字で入力してください")
    .nullable()),
  websiteUrl: z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }, z.url("WebサイトのURLを確認してください").nullable()),
  termsAccepted: z.boolean(),
});

export type FuneralCompanyProfileInput = z.infer<
  typeof funeralCompanyProfileSchema
>;

export const COMPANY_DOC_MAX_BYTES = 10 * 1024 * 1024;
export const COMPANY_DOC_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export function isAllowedCompanyDoc(file: {
  size: number;
  type: string;
  name: string;
}) {
  if (file.size <= 0) {
    return { ok: false as const, error: "書類ファイルを選択してください" };
  }
  if (file.size > COMPANY_DOC_MAX_BYTES) {
    return { ok: false as const, error: "書類は10MB以下にしてください" };
  }
  const mimeOk = (COMPANY_DOC_MIME_TYPES as readonly string[]).includes(
    file.type,
  );
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const extOk = ["jpg", "jpeg", "png", "webp", "pdf"].includes(ext);
  if (!mimeOk || !extOk) {
    return {
      ok: false as const,
      error: "書類はPDF、JPEG、PNG、WebPのみ登録できます",
    };
  }
  return { ok: true as const };
}

export function isFuneralCompanyProfileComplete(company: {
  company_name: string | null;
  representative_name: string | null;
  contact_person_name: string | null;
  postal_code: string | null;
  prefecture: string | null;
  municipality_id: string | null;
  address: string | null;
  phone: string | null;
  emergency_phone: string | null;
  business_document_path: string | null;
  terms_accepted_at: string | null;
  profile_completed_at?: string | null;
}) {
  return Boolean(
    company.company_name?.trim() &&
      company.representative_name?.trim() &&
      company.contact_person_name?.trim() &&
      company.postal_code?.trim() &&
      company.prefecture === KANAGAWA_PREFECTURE &&
      company.municipality_id &&
      company.address?.startsWith(KANAGAWA_PREFECTURE) &&
      company.phone?.trim() &&
      company.emergency_phone?.trim() &&
      company.business_document_path &&
      company.terms_accepted_at &&
      company.profile_completed_at,
  );
}
