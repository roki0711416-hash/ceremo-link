"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireFuneralCompany } from "@/lib/auth/funeral-company";
import { logAuthErrorCode } from "@/lib/auth/map-auth-error";
import { createClient } from "@/lib/supabase/server";
import {
  funeralCompanyProfileSchema,
  isAllowedCompanyDoc,
  KANAGAWA_PREFECTURE,
} from "@/lib/validations/funeral-company";

export type FuneralCompanyActionState = {
  error?: string;
  success?: string;
};

function logCode(context: string, code?: string | null) {
  logAuthErrorCode(context, code ?? undefined);
}

function normalizePostalCode(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 7) return value;
  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
}

function inferMimeFromName(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    default:
      return "";
  }
}

export async function saveFuneralCompanyProfileAction(
  _prev: FuneralCompanyActionState,
  formData: FormData,
): Promise<FuneralCompanyActionState> {
  const { profile, company } = await requireFuneralCompany({
    allowIncomplete: true,
  });

  const parsed = funeralCompanyProfileSchema.safeParse({
    companyName: formData.get("companyName"),
    representativeName: formData.get("representativeName"),
    contactPersonName: formData.get("contactPersonName"),
    postalCode: formData.get("postalCode"),
    prefecture: KANAGAWA_PREFECTURE,
    municipalityId: formData.get("municipalityId"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    emergencyPhone: formData.get("emergencyPhone"),
    corporateNumber: formData.get("corporateNumber") ?? "",
    websiteUrl: formData.get("websiteUrl") ?? "",
    termsAccepted:
      formData.get("termsAccepted") === "on" ||
      formData.get("termsAccepted") === "true" ||
      Boolean(company?.terms_accepted_at),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }

  if (!parsed.data.termsAccepted && !company?.terms_accepted_at) {
    return { error: "利用規約への同意が必要です" };
  }

  const supabase = await createClient();
  const { data: municipality, error: municipalityError } = await supabase
    .from("municipalities")
    .select("id")
    .eq("id", parsed.data.municipalityId)
    .maybeSingle();

  if (municipalityError) {
    logCode("profile_municipality", municipalityError.code);
    return { error: "市区町村の確認に失敗しました。時間をおいて再度お試しください" };
  }
  if (!municipality) {
    return { error: "神奈川県内の市区町村を選択してください" };
  }

  let documentPath = company?.business_document_path ?? null;
  const file = formData.get("businessDocument");
  if (file instanceof File && file.size > 0) {
    const allowed = isAllowedCompanyDoc({
      size: file.size,
      type: file.type || inferMimeFromName(file.name),
      name: file.name,
    });
    if (!allowed.ok) {
      return { error: allowed.error };
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
    const path = `${profile.id}/${Date.now()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from("company-docs")
      .upload(path, bytes, {
        contentType: file.type || inferMimeFromName(file.name),
        upsert: false,
      });

    if (uploadError) {
      logCode("company_docs_upload", uploadError.name);
      return { error: "書類の保存に失敗しました。時間をおいて再度お試しください" };
    }
    documentPath = path;
  }

  if (!documentPath) {
    return { error: "営業確認書類をアップロードしてください" };
  }

  const now = new Date().toISOString();
  const payload = {
    company_name: parsed.data.companyName,
    representative_name: parsed.data.representativeName,
    contact_person_name: parsed.data.contactPersonName,
    postal_code: normalizePostalCode(parsed.data.postalCode),
    prefecture: KANAGAWA_PREFECTURE,
    municipality_id: parsed.data.municipalityId,
    address: parsed.data.address,
    phone: parsed.data.phone,
    emergency_phone: parsed.data.emergencyPhone,
    corporate_number: parsed.data.corporateNumber,
    website_url: parsed.data.websiteUrl,
    business_document_path: documentPath,
    terms_accepted_at: company?.terms_accepted_at ?? now,
    profile_completed_at: now,
  };

  let writeError = null as { code?: string } | null;
  if (company) {
    const { error } = await supabase
      .from("funeral_companies")
      .update(payload)
      .eq("id", profile.id);
    writeError = error;
  } else {
    const { error } = await supabase.from("funeral_companies").insert({
      id: profile.id,
      ...payload,
    });
    writeError = error;
  }

  if (writeError) {
    logCode("funeral_company_save", writeError.code);
    if (writeError.code === "23514") {
      return { error: "神奈川県外の住所は登録できません" };
    }
    return { error: "プロフィールの保存に失敗しました。時間をおいて再度お試しください" };
  }

  revalidatePath("/funeral-company");
  revalidatePath("/funeral-company/profile");
  redirect("/funeral-company");
}
