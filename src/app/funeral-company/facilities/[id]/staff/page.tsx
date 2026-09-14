import { format, startOfMonth } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { notFound } from "next/navigation";

import { FacilityBookingCalendarClient } from "@/components/ceremo/facility-booking-calendar-client";
import { FuneralCompanyShell, ScreenState } from "@/components/layout/funeral-company-shell";
import { requireFuneralCompany } from "@/lib/auth/funeral-company";
import { APP_TIMEZONE } from "@/lib/datetime";
import { isDemoCrematorium } from "@/lib/constants/demo-crematorium";
import {
  isVerificationApproved,
  relaxStaffCountsIfGateDisabled,
} from "@/lib/constants/verification-gate";
import { classifyStaffCountsResult } from "@/lib/staff-status";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
};

function monthBounds(month: string) {
  const year = Number(month.slice(0, 4));
  const monthNum = Number(month.slice(5, 7));
  const lastDay = new Date(Date.UTC(year, monthNum, 0)).getUTCDate();
  return {
    from: `${month}-01`,
    to: `${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

export default async function StaffAvailabilityPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { month: monthParam } = await searchParams;
  const { profile, company } = await requireFuneralCompany();
  const supabase = await createClient();

  const tokyoNow = toZonedTime(new Date(), APP_TIMEZONE);
  const defaultMonth = format(startOfMonth(tokyoNow), "yyyy-MM");
  const month =
    monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : defaultMonth;
  const { from, to } = monthBounds(month);

  const { data: facility, error: facilityError } = await supabase
    .from("crematoriums")
    .select(
      "id, name, address, is_placeholder, data_label, municipality_id, slug",
    )
    .eq("id", id)
    .maybeSingle();

  if (facilityError) {
    return (
      <FuneralCompanyShell
        title="予約カレンダー"
        backHref="/funeral-company/map"
        email={profile.email}
      >
        <ScreenState title="取得に失敗しました">
          施設情報を表示できませんでした。
        </ScreenState>
      </FuneralCompanyShell>
    );
  }
  if (!facility) notFound();

  const canOperate = isVerificationApproved(company?.verification_status);
  let countsState = classifyStaffCountsResult({ rows: [] });

  if (canOperate) {
    const { data, error } = await supabase.rpc(
      "staff_availability_daily_counts",
      {
        p_municipality_id: facility.municipality_id,
        p_from: from,
        p_to: to,
      },
    );
    countsState = relaxStaffCountsIfGateDisabled(
      classifyStaffCountsResult({
        errorCode: error?.code,
        errorMessage: error?.message,
        rows: data,
      }),
    );
  } else {
    countsState = { kind: "unauthorized" };
  }

  const { data: municipality } = await supabase
    .from("municipalities")
    .select("name")
    .eq("id", facility.municipality_id)
    .maybeSingle();

  return (
    <FacilityBookingCalendarClient
      role="funeral_company"
      email={profile.email}
      facility={{
        id: facility.id,
        name: facility.name,
        address: facility.address,
        municipalityName: municipality?.name ?? "",
        municipalityId: facility.municipality_id,
        dataLabel: facility.data_label,
        isPlaceholder: facility.is_placeholder,
        isDemo: isDemoCrematorium(
          facility.slug,
          facility.data_label,
          facility.name,
        ),
      }}
      month={month}
      countsState={countsState}
      showCounts={canOperate}
      canBook={canOperate}
      mapBackHref="/funeral-company/map"
    />
  );
}
