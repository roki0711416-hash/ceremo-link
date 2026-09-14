import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/session";
import { isFuneralCompanyProfileComplete } from "@/lib/validations/funeral-company";
import { createClient } from "@/lib/supabase/server";
import type { FuneralCompany, Profile } from "@/types/database";

export async function requireFuneralCompany(options?: {
  allowIncomplete?: boolean;
}): Promise<{ profile: Profile; company: FuneralCompany | null }> {
  const profile = await requireRole(["funeral_company"]);
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: company, error } = await supabase
    .from("funeral_companies")
    .select("*")
    .eq("id", profile.id)
    .maybeSingle();

  if (error) {
    redirect("/login");
  }

  const complete = company
    ? isFuneralCompanyProfileComplete(company)
    : false;

  if (!options?.allowIncomplete && !complete) {
    redirect("/funeral-company/profile");
  }

  return { profile, company };
}
