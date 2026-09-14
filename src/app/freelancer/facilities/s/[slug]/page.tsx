import { notFound, redirect } from "next/navigation";

import { CrematoriumDetailBody } from "@/components/ceremo/crematorium-detail";
import { FreelancerShell } from "@/components/layout/freelancer-shell";
import { requireRole } from "@/lib/auth/session";
import { getCrematoriumPinBySlug } from "@/lib/constants/kanagawa-crematoriums";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }> };

export default async function FreelancerFacilitySlugPage({ params }: Props) {
  const { slug } = await params;
  const profile = await requireRole(["freelancer"]);
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: facility } = await supabase
    .from("crematoriums")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (facility) {
    redirect(`/freelancer/facilities/${facility.id}/staff`);
  }

  const pin = getCrematoriumPinBySlug(slug);
  if (!pin) notFound();

  return (
    <FreelancerShell
      title="施設詳細"
      backHref="/freelancer/map"
      email={profile.email}
    >
      <CrematoriumDetailBody
        role="freelancer"
        name={pin.name}
        municipalityName={pin.municipalityName}
        address={pin.address}
        usageFeeNote={pin.usageFeeNote}
        isPrivate={pin.isPrivate}
        dataLabel="公開情報"
        mapBackHref="/freelancer/map"
        listBackHref="/freelancer/map"
      />
    </FreelancerShell>
  );
}
