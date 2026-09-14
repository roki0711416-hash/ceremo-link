import { format, startOfMonth } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { notFound, redirect } from "next/navigation";

import { FacilityRequestFormClient } from "@/components/ceremo/facility-request-form-client";
import { FuneralCompanyShell, ScreenState } from "@/components/layout/funeral-company-shell";
import { requireFuneralCompany } from "@/lib/auth/funeral-company";
import { isDemoCrematorium } from "@/lib/constants/demo-crematorium";
import { isVerificationApproved } from "@/lib/constants/verification-gate";
import { APP_TIMEZONE } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string; month?: string }>;
};

export default async function FuneralFacilityBookPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { date: dateParam, month: monthParam } = await searchParams;
  const { profile, company } = await requireFuneralCompany();

  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const month =
      monthParam && /^\d{4}-\d{2}$/.test(monthParam)
        ? monthParam
        : format(startOfMonth(toZonedTime(new Date(), APP_TIMEZONE)), "yyyy-MM");
    redirect(`/funeral-company/facilities/${id}/staff?month=${month}`);
  }

  const month =
    monthParam && /^\d{4}-\d{2}$/.test(monthParam)
      ? monthParam
      : dateParam.slice(0, 7);

  const supabase = await createClient();
  const { data: facility, error: facilityError } = await supabase
    .from("crematoriums")
    .select("id, name, address, municipality_id, slug, data_label")
    .eq("id", id)
    .maybeSingle();

  if (facilityError) {
    return (
      <FuneralCompanyShell
        title="依頼内容入力"
        backHref={`/funeral-company/facilities/${id}/staff?month=${month}`}
        email={profile.email}
      >
        <ScreenState title="取得に失敗しました">
          施設情報を表示できませんでした。
        </ScreenState>
      </FuneralCompanyShell>
    );
  }
  if (!facility) notFound();

  const [{ data: municipality }, { data: serviceTypes, error: svcError }] =
    await Promise.all([
      supabase
        .from("municipalities")
        .select("name")
        .eq("id", facility.municipality_id)
        .maybeSingle(),
      supabase
        .from("service_types")
        .select("id, name, code")
        .order("sort_order"),
    ]);

  if (svcError) {
    return (
      <FuneralCompanyShell
        title="依頼内容入力"
        backHref={`/funeral-company/facilities/${id}/staff?month=${month}`}
        email={profile.email}
      >
        <ScreenState title="取得に失敗しました">
          業務区分を表示できませんでした。
        </ScreenState>
      </FuneralCompanyShell>
    );
  }

  const canOperate = isVerificationApproved(company?.verification_status);

  return (
    <FacilityRequestFormClient
      email={profile.email}
      facility={{
        id: facility.id,
        name: facility.name,
        address: facility.address,
        municipalityName: municipality?.name ?? "",
        municipalityId: facility.municipality_id,
        isDemo: isDemoCrematorium(
          facility.slug,
          facility.data_label,
          facility.name,
        ),
      }}
      date={dateParam}
      month={month}
      serviceTypes={serviceTypes ?? []}
      defaults={{
        contactName: company?.contact_person_name ?? "",
        contactPhone: company?.phone ?? "",
        emergencyContact: company?.emergency_phone ?? company?.phone ?? "",
      }}
      canBook={canOperate}
    />
  );
}
