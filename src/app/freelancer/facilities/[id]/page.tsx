import { notFound } from "next/navigation";

import {
  CrematoriumDetailBody,
  crematoriumPinFromDb,
} from "@/components/ceremo/crematorium-detail";
import { FreelancerShell } from "@/components/layout/freelancer-shell";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export default async function FreelancerFacilityDetailPage({ params }: Props) {
  const { id } = await params;
  const profile = await requireRole(["freelancer"]);
  if (!profile) notFound();

  const supabase = await createClient();
  const [{ data: facility, error }, { data: municipalities }] = await Promise.all([
    supabase
      .from("crematoriums")
      .select(
        "id, name, address, notes, is_placeholder, data_label, municipality_id, usage_fee_note",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("municipalities").select("id, name"),
  ]);

  if (error || !facility) notFound();

  const municipalityName =
    municipalities?.find((m) => m.id === facility.municipality_id)?.name ?? "";

  return (
    <FreelancerShell
      title="施設詳細"
      backHref="/freelancer/map"
      email={profile.email}
    >
      <CrematoriumDetailBody
        role="freelancer"
        {...crematoriumPinFromDb(facility, municipalityName)}
        mapBackHref="/freelancer/map"
        listBackHref="/freelancer/map"
      />
    </FreelancerShell>
  );
}
