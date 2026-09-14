import { redirect } from "next/navigation";

import { RequestConfirmClient } from "@/app/funeral-company/requests/new/confirm/confirm-client";
import { requireFuneralCompany } from "@/lib/auth/funeral-company";
import { isVerificationApproved } from "@/lib/constants/verification-gate";

export default async function RequestConfirmPage() {
  const { profile, company } = await requireFuneralCompany();
  if (!isVerificationApproved(company?.verification_status)) {
    redirect("/funeral-company");
  }

  return <RequestConfirmClient email={profile.email} />;
}
