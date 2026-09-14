import { format } from "date-fns";
import { redirect } from "next/navigation";

import { RequestCompleteClient } from "@/app/funeral-company/requests/new/matching/request-complete-client";
import { FuneralCompanyShell, ScreenState } from "@/components/layout/funeral-company-shell";
import { requireFuneralCompany } from "@/lib/auth/funeral-company";
import { isVerificationApproved } from "@/lib/constants/verification-gate";
import { FUNERAL_REQUEST_SERVICE_LABEL } from "@/lib/constants/request-flow";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{ jobId?: string }>;
};

export default async function RequestMatchingPage({ searchParams }: Props) {
  const { jobId } = await searchParams;
  const { profile, company } = await requireFuneralCompany();
  if (!isVerificationApproved(company?.verification_status)) {
    redirect("/funeral-company");
  }

  if (!jobId) {
    redirect("/funeral-company");
  }

  const supabase = await createClient();
  const { data: job, error: jobError } = await supabase
    .from("job_requests")
    .select("id, crematorium_name, work_starts_at, work_ends_at, funeral_company_id")
    .eq("id", jobId)
    .eq("funeral_company_id", profile.id)
    .maybeSingle();

  if (jobError || !job) {
    return (
      <FuneralCompanyShell title="依頼完了" backHref="/funeral-company" email={profile.email}>
        <ScreenState title="依頼を取得できませんでした">
          ホームから案件一覧をご確認ください。
        </ScreenState>
      </FuneralCompanyShell>
    );
  }

  const { data: privateDetails } = await supabase
    .from("job_private_details")
    .select(
      "deceased_name, company_contact_name, company_contact_phone, detailed_notes",
    )
    .eq("job_request_id", jobId)
    .maybeSingle();

  const notes = privateDetails?.detailed_notes;

  return (
    <RequestCompleteClient
      email={profile.email}
      jobId={job.id}
      summary={{
        crematoriumName: job.crematorium_name ?? undefined,
        workDate: job.work_starts_at
          ? format(new Date(job.work_starts_at), "yyyy-MM-dd")
          : undefined,
        startTime: job.work_starts_at
          ? format(new Date(job.work_starts_at), "HH:mm")
          : undefined,
        endTime: job.work_ends_at
          ? format(new Date(job.work_ends_at), "HH:mm")
          : undefined,
        serviceLabel: FUNERAL_REQUEST_SERVICE_LABEL,
        deceasedName: privateDetails?.deceased_name ?? undefined,
        contactName: privateDetails?.company_contact_name ?? undefined,
        contactPhone: privateDetails?.company_contact_phone ?? undefined,
        notes: notes ?? undefined,
      }}
    />
  );
}
