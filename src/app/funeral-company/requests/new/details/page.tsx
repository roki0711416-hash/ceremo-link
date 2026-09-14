import { redirect } from "next/navigation";

import { RequestDetailsClient } from "@/app/funeral-company/requests/new/details/details-client";
import { FuneralCompanyShell, ScreenState } from "@/components/layout/funeral-company-shell";
import { requireFuneralCompany } from "@/lib/auth/funeral-company";
import { isVerificationApproved } from "@/lib/constants/verification-gate";
import { createClient } from "@/lib/supabase/server";

export default async function RequestDetailsPage() {
  const { profile, company } = await requireFuneralCompany();
  if (!isVerificationApproved(company?.verification_status)) {
    redirect("/funeral-company");
  }

  const supabase = await createClient();
  const { data: serviceTypes, error } = await supabase
    .from("service_types")
    .select("id, name, code")
    .order("sort_order");

  if (error) {
    return (
      <FuneralCompanyShell
        title="依頼内容入力"
        backHref="/funeral-company/requests/new/datetime"
        email={profile.email}
      >
        <ScreenState title="取得に失敗しました">
          業務区分を表示できませんでした。
        </ScreenState>
      </FuneralCompanyShell>
    );
  }

  const defaults = {
    contactName: company?.contact_person_name ?? "",
    contactPhone: company?.phone ?? "",
    emergencyContact: company?.emergency_phone ?? company?.phone ?? "",
  };

  return (
    <RequestDetailsClient
      email={profile.email}
      serviceTypes={serviceTypes ?? []}
      defaults={defaults}
    />
  );
}
