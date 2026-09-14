import { redirect } from "next/navigation";

import { requireFuneralCompany } from "@/lib/auth/funeral-company";
import { isVerificationApproved } from "@/lib/constants/verification-gate";
import { createClient } from "@/lib/supabase/server";

/** Legacy one-page form entry. Prefer the facility → wizard flow. */
export default async function NewJobPage() {
  const { profile } = await requireFuneralCompany();

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("funeral_companies")
    .select("verification_status")
    .eq("id", profile.id)
    .maybeSingle();

  if (!isVerificationApproved(company?.verification_status)) {
    redirect("/funeral-company");
  }

  redirect("/funeral-company/facilities");
}
