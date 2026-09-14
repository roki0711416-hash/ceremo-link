import { KanagawaCrematoriumMap } from "@/components/ceremo/kanagawa-map";
import { FuneralCompanyShell } from "@/components/layout/funeral-company-shell";
import { requireFuneralCompany } from "@/lib/auth/funeral-company";
import { createClient } from "@/lib/supabase/server";

export default async function FuneralCompanyMapPage() {
  const { profile } = await requireFuneralCompany();
  const supabase = await createClient();
  const { data: facilities } = await supabase
    .from("crematoriums")
    .select("id, name, slug");

  return (
    <FuneralCompanyShell
      title="火葬場マップ"
      backHref="/funeral-company"
      email={profile.email}
    >
      <KanagawaCrematoriumMap
        role="funeral_company"
        dbFacilities={facilities ?? []}
        homeHref="/funeral-company"
      />
    </FuneralCompanyShell>
  );
}
