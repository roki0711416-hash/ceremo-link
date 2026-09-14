import { format, startOfMonth } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { notFound, redirect } from "next/navigation";

import { FacilityBookingCalendarClient } from "@/components/ceremo/facility-booking-calendar-client";
import { FreelancerShell } from "@/components/layout/freelancer-shell";
import { ScreenState } from "@/components/layout/funeral-company-shell";
import { requireRole } from "@/lib/auth/session";
import { isVerificationApproved } from "@/lib/constants/verification-gate";
import { APP_TIMEZONE } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
};

export default async function FreelancerFacilityStaffPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { month: monthParam } = await searchParams;
  const profile = await requireRole(["freelancer"]);
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const tokyoNow = toZonedTime(new Date(), APP_TIMEZONE);
  const defaultMonth = format(startOfMonth(tokyoNow), "yyyy-MM");
  const month =
    monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : defaultMonth;

  const { data: freelancer } = await supabase
    .from("freelancers")
    .select("verification_status")
    .eq("id", profile.id)
    .maybeSingle();

  const { data: facility, error: facilityError } = await supabase
    .from("crematoriums")
    .select(
      "id, name, address, is_placeholder, data_label, municipality_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (facilityError) {
    return (
      <FreelancerShell
        title="予約カレンダー"
        backHref="/freelancer/map"
        email={profile.email}
      >
        <ScreenState title="取得に失敗しました">
          施設情報を表示できませんでした。
        </ScreenState>
      </FreelancerShell>
    );
  }
  if (!facility) notFound();

  const canOperate = isVerificationApproved(freelancer?.verification_status);
  const countsState = { kind: "ok" as const, rows: [] };

  const { data: municipality } = await supabase
    .from("municipalities")
    .select("name")
    .eq("id", facility.municipality_id)
    .maybeSingle();

  return (
    <FacilityBookingCalendarClient
      role="freelancer"
      email={profile.email}
      facility={{
        id: facility.id,
        name: facility.name,
        address: facility.address,
        municipalityName: municipality?.name ?? "",
        municipalityId: facility.municipality_id,
        dataLabel: facility.data_label,
        isPlaceholder: facility.is_placeholder,
      }}
      month={month}
      countsState={countsState}
      showCounts={canOperate}
      canBook={canOperate}
      mapBackHref="/freelancer/map"
    />
  );
}
