import { notFound } from "next/navigation";
import Link from "next/link";

import { FuneralCompanyShell, ScreenState } from "@/components/layout/funeral-company-shell";
import { requireFuneralCompany } from "@/lib/auth/funeral-company";
import { isVerificationApproved } from "@/lib/constants/verification-gate";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export default async function FacilityDetailPage({ params }: Props) {
  const { id } = await params;
  const { profile, company } = await requireFuneralCompany();
  const supabase = await createClient();
  const canCreate = isVerificationApproved(company?.verification_status);

  const [{ data: facility, error }, { data: municipality }] = await Promise.all([
    supabase
      .from("crematoriums")
      .select("id, name, address, notes, is_placeholder, data_label, municipality_id, usage_fee_note")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("municipalities").select("id, name"),
  ]);

  if (error) {
    return (
      <FuneralCompanyShell
        title="施設詳細"
        backHref="/funeral-company/facilities"
        email={profile.email}
      >
        <ScreenState title="取得に失敗しました">
          施設情報を表示できませんでした。時間をおいて再度お試しください。
        </ScreenState>
      </FuneralCompanyShell>
    );
  }

  if (!facility) notFound();

  const municipalityName =
    municipality?.find((item) => item.id === facility.municipality_id)?.name ??
    "";

  return (
    <FuneralCompanyShell
      title="施設詳細"
      backHref="/funeral-company/facilities"
      email={profile.email}
    >
      <div className="space-y-3 rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-funeral-soft text-sm text-funeral">
          仮画像
        </div>
        <p className="text-center text-sm text-funeral">{facility.data_label}</p>
        <h1 className="font-heading text-2xl font-semibold text-funeral">
          {facility.name}
        </h1>
        <p className="text-base text-muted-foreground">{municipalityName}</p>
        <p className="text-base">{facility.address}</p>
        {facility.usage_fee_note ? (
          <p className="text-base">利用料金目安: {facility.usage_fee_note}</p>
        ) : null}
      </div>

      <div className="space-y-2 rounded-xl border border-dashed border-funeral bg-funeral-soft p-5">
        <h2 className="font-heading text-lg text-funeral">地図</h2>
        <p className="text-base text-muted-foreground">
          火葬場の位置は
          <Link href="/funeral-company/map" className="mx-1 text-funeral underline">
            神奈川県の火葬場マップ
          </Link>
          で確認できます。
        </p>
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-surface p-5">
        <h2 className="font-heading text-lg text-funeral">注意事項</h2>
        <p className="text-base">{facility.notes}</p>
        {facility.is_placeholder ? (
          <p className="text-sm text-muted-foreground">
            この施設情報は仮データです。実在施設の写真・電話番号・公式案内は掲載していません。
          </p>
        ) : null}
      </div>

      <Link
        href={`/funeral-company/facilities/${facility.id}/staff`}
        className="tap-target inline-flex w-full items-center justify-center rounded-xl bg-funeral px-4 text-base font-medium text-white"
      >
        火葬案内スタッフの対応状況
      </Link>

      {canCreate ? (
        <Link
          href={`/funeral-company/requests/new/datetime?facilityId=${facility.id}`}
          className="tap-target inline-flex w-full items-center justify-center rounded-xl border-2 border-funeral bg-white px-4 text-base font-medium text-funeral"
        >
          この火葬場で依頼を作成
        </Link>
      ) : (
        <p
          role="status"
          className="rounded-xl border border-border bg-amber-50 px-4 py-3 text-base text-amber-950"
        >
          審査完了後に、この火葬場で依頼を作成できます。
        </p>
      )}

      <Link
        href="/funeral-company/facilities"
        className="text-center text-base text-funeral underline-offset-4 hover:underline"
      >
        一覧へ戻る
      </Link>
    </FuneralCompanyShell>
  );
}
