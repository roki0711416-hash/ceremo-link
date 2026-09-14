"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/session";
import { isVerificationApproved } from "@/lib/constants/verification-gate";
import {
  ensureFutureResponseDeadlineAt,
  tokyoInputToIso,
} from "@/lib/job-request-deadlines";
import { createClient } from "@/lib/supabase/server";
import { createOpenJobSchema } from "@/lib/validations/jobs";

/** datetime-local value interpreted as Asia/Tokyo */
function mapJobInsertError(message: string | undefined, code: string | undefined): string {
  if (code === "42501") {
    return "依頼を作成する権限がありません。ログイン状態を確認してください。";
  }
  if (code === "23514" || message?.includes("response_deadline")) {
    return "回答期限が過ぎています。日時を選び直してください。";
  }
  return "依頼の作成に失敗しました";
}

export type JobActionState = {
  error?: string;
  success?: string;
};

function mapClaimError(message: string | undefined): string {
  if (!message) return "承諾に失敗しました";
  if (message.includes("別の方に決まりました") || message.includes("job_already_assigned")) {
    return "別の方に決まりました";
  }
  if (message.includes("job_expired") || message.includes("回答期限")) {
    return "回答期限を過ぎたため承諾できません";
  }
  if (message.includes("not eligible")) {
    return "現在の条件ではこの依頼を受けられません";
  }
  if (message.includes("not a candidate")) {
    return "この依頼の候補者ではありません";
  }
  return "承諾に失敗しました";
}

export async function createAndPublishJobAction(
  _prev: JobActionState,
  formData: FormData,
): Promise<JobActionState> {
  const profile = await requireRole(["funeral_company"]);
  if (!profile) {
    return { error: "ログインが必要です" };
  }

  const parsed = createOpenJobSchema.safeParse({
    serviceTypeId: formData.get("serviceTypeId"),
    municipalityId: formData.get("municipalityId"),
    locationGeneral: formData.get("locationGeneral"),
    crematoriumName: formData.get("crematoriumName"),
    workStartsAt: formData.get("workStartsAt"),
    workEndsAt: formData.get("workEndsAt"),
    estimatedDurationMinutes:
      formData.get("estimatedDurationMinutes") || undefined,
    payAmount: formData.get("payAmount"),
    travelExpense: formData.get("travelExpense"),
    paymentDueOn: formData.get("paymentDueOn"),
    responseDeadlineAt: formData.get("responseDeadlineAt"),
    description: formData.get("description") || undefined,
    dressCode: formData.get("dressCode") || undefined,
    belongings: formData.get("belongings") || undefined,
    deceasedName: formData.get("deceasedName"),
    exactAddress: formData.get("exactAddress"),
    facilityName: formData.get("facilityName") || undefined,
    meetupLocation: formData.get("meetupLocation"),
    companyContactName: formData.get("companyContactName"),
    companyContactPhone: formData.get("companyContactPhone"),
    emergencyContact: formData.get("emergencyContact"),
    detailedNotes: formData.get("detailedNotes") || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください",
    };
  }

  const meetupAtRaw = String(formData.get("meetupAt") ?? "").trim();
  const returnToMatching = formData.get("returnToMatching") === "1";

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("funeral_companies")
    .select("verification_status")
    .eq("id", profile.id)
    .maybeSingle();

  if (!isVerificationApproved(company?.verification_status)) {
    return { error: "審査完了後に依頼を公開できます" };
  }

  const v = parsed.data;
  const workStartsAtIso = tokyoInputToIso(v.workStartsAt);
  const responseDeadlineInput = ensureFutureResponseDeadlineAt(
    v.responseDeadlineAt,
    v.workStartsAt,
  );
  const responseDeadlineIso = tokyoInputToIso(responseDeadlineInput);

  const { data: job, error: jobError } = await supabase
    .from("job_requests")
    .insert({
      funeral_company_id: profile.id,
      service_type_id: v.serviceTypeId,
      municipality_id: v.municipalityId,
      location_general: v.locationGeneral,
      crematorium_name: v.crematoriumName,
      work_starts_at: workStartsAtIso,
      work_ends_at: tokyoInputToIso(v.workEndsAt),
      meetup_at: meetupAtRaw ? tokyoInputToIso(meetupAtRaw) : null,
      estimated_duration_minutes: v.estimatedDurationMinutes ?? null,
      pay_amount: v.payAmount,
      travel_expense: v.travelExpense,
      payment_due_on: v.paymentDueOn,
      response_deadline_at: responseDeadlineIso,
      description: v.description ?? null,
      dress_code: v.dressCode ?? null,
      belongings: v.belongings ?? null,
      status: "draft",
    })
    .select("id")
    .single();

  if (jobError || !job) {
    return {
      error: mapJobInsertError(jobError?.message, jobError?.code),
    };
  }

  const { error: privateError } = await supabase.from("job_private_details").insert({
    job_request_id: job.id,
    deceased_name: v.deceasedName,
    exact_address: v.exactAddress,
    facility_name: v.facilityName ?? null,
    meetup_location: v.meetupLocation,
    company_contact_name: v.companyContactName,
    company_contact_phone: v.companyContactPhone,
    emergency_contact: v.emergencyContact,
    detailed_notes: v.detailedNotes ?? null,
  });

  if (privateError) {
    return { error: "非公開情報の保存に失敗しました" };
  }

  const { error: publishError } = await supabase.rpc("publish_job_request", {
    p_job_id: job.id,
  });

  if (publishError) {
    return { error: "依頼の公開に失敗しました。下書きとして保存されている可能性があります" };
  }

  revalidatePath("/funeral-company");
  revalidatePath("/funeral-company/jobs");
  if (returnToMatching) {
    redirect(`/funeral-company/requests/new/matching?jobId=${job.id}`);
  }
  redirect(`/funeral-company/jobs/${job.id}`);
}

export async function claimOpenJobAction(
  _prev: JobActionState,
  formData: FormData,
): Promise<JobActionState> {
  const profile = await requireRole(["freelancer"]);
  if (!profile) {
    return { error: "ログインが必要です" };
  }

  const jobId = String(formData.get("jobId") ?? "");
  if (!jobId) {
    return { error: "依頼が指定されていません" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("claim_open_job", {
    p_job_id: jobId,
  });

  if (error) {
    return { error: mapClaimError(error.message) };
  }

  revalidatePath("/freelancer/offers");
  revalidatePath(`/freelancer/jobs/${jobId}`);
  redirect(`/freelancer/jobs/${jobId}`);
}

export async function markOfferViewedAction(jobId: string) {
  const profile = await requireRole(["freelancer"]);
  if (!profile) return;

  const supabase = await createClient();
  await supabase
    .from("job_candidates")
    .update({ status: "viewed" })
    .eq("job_request_id", jobId)
    .eq("freelancer_id", profile.id)
    .eq("status", "notified");
}
