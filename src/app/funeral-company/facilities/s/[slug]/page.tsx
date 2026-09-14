import { notFound, redirect } from "next/navigation";

import { CrematoriumDetailBody } from "@/components/ceremo/crematorium-detail";
import { FuneralCompanyShell } from "@/components/layout/funeral-company-shell";
import { requireFuneralCompany } from "@/lib/auth/funeral-company";
import { isVerificationApproved } from "@/lib/constants/verification-gate";
import { getCrematoriumPinBySlug } from "@/lib/constants/kanagawa-crematoriums";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }> };

export default async function FuneralCompanyFacilitySlugPage({ params }: Props) {
  const { slug } = await params;
  const { profile, company } = await requireFuneralCompany();
  const supabase = await createClient();

  const { data: facility } = await supabase
    .from("crematoriums")
    .select(
      "id, name, address, notes, is_placeholder, data_label, municipality_id, usage_fee_note, slug",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (facility) {
    redirect(`/funeral-company/facilities/${facility.id}/staff`);
  }

  const pin = getCrematoriumPinBySlug(slug);
  if (!pin) notFound();

  const canCreate = isVerificationApproved(company?.verification_status);

  return (
    <FuneralCompanyShell
      title="施設詳細"
      backHref="/funeral-company/map"
      email={profile.email}
    >
      <CrematoriumDetailBody
        role="funeral_company"
        name={pin.name}
        municipalityName={pin.municipalityName}
        address={pin.address}
        usageFeeNote={pin.usageFeeNote}
        isPrivate={pin.isPrivate}
        dataLabel="公開情報"
        mapBackHref="/funeral-company/map"
        listBackHref="/funeral-company/facilities"
        canCreateRequest={false}
      />
      {!canCreate ? (
        <p
          role="status"
          className="rounded-xl border border-border bg-amber-50 px-4 py-3 text-base text-amber-950"
        >
          審査完了後に、この火葬場で依頼を作成できます。
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          依頼作成はデータベース連携後の施設から行えます。火葬場マップから再度お試しください。
        </p>
      )}
    </FuneralCompanyShell>
  );
}
