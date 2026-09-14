import Link from "next/link";

import { KANAGAWA_CREMATORIUM_SOURCE_URL } from "@/lib/constants/kanagawa-crematoriums";

type CrematoriumDetailBodyProps = {
  role: "funeral_company" | "freelancer";
  name: string;
  municipalityName: string;
  address: string;
  usageFeeNote?: string | null;
  isPrivate?: boolean;
  dataLabel?: string;
  notes?: string | null;
  facilityId?: string;
  canCreateRequest?: boolean;
  mapBackHref: string;
  listBackHref: string;
};

export function CrematoriumDetailBody({
  role,
  name,
  municipalityName,
  address,
  usageFeeNote,
  isPrivate,
  dataLabel,
  notes,
  facilityId,
  canCreateRequest = false,
  mapBackHref,
  listBackHref,
}: CrematoriumDetailBodyProps) {
  const tone = role === "funeral_company" ? "funeral" : "freelancer";
  const headingCls =
    tone === "funeral" ? "text-funeral" : "text-freelancer";
  const btnPrimary =
    tone === "funeral"
      ? "bg-funeral text-white"
      : "bg-freelancer text-white";
  const btnOutline =
    tone === "funeral"
      ? "border-funeral text-funeral"
      : "border-freelancer text-freelancer";

  return (
    <>
      <div className="space-y-3 rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div
          className={`mx-auto flex size-24 items-center justify-center rounded-full text-sm ${tone === "funeral" ? "bg-funeral-soft text-funeral" : "bg-freelancer-soft text-freelancer"}`}
        >
          地図
        </div>
        {dataLabel ? (
          <p className={`text-center text-sm ${headingCls}`}>{dataLabel}</p>
        ) : null}
        {isPrivate ? (
          <p className="text-center text-sm text-muted-foreground">民営火葬場</p>
        ) : null}
        <h1 className={`font-heading text-2xl font-semibold ${headingCls}`}>
          {name}
        </h1>
        <p className="text-base text-muted-foreground">{municipalityName}</p>
        <p className="text-base">{address}</p>
        {usageFeeNote ? (
          <p className="text-base">
            利用料金目安: {usageFeeNote}
          </p>
        ) : null}
      </div>

      <div className="space-y-2 rounded-xl border border-dashed border-border bg-surface p-5">
        <h2 className={`font-heading text-lg ${headingCls}`}>地図</h2>
        <p className="text-base text-muted-foreground">
          詳細な地図は
          <Link href={mapBackHref} className={`mx-1 underline ${headingCls}`}>
            火葬場マップ
          </Link>
          で確認できます。
        </p>
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-surface p-5">
        <h2 className={`font-heading text-lg ${headingCls}`}>注意事項</h2>
        <p className="text-base">
          {notes ??
            "火葬場の公式予約枠ではありません。写真・電話番号は掲載していません。"}
        </p>
        <p className="text-sm text-muted-foreground">
          料金目安は
          <a
            href={KANAGAWA_CREMATORIUM_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-1 underline underline-offset-2"
          >
            公開情報
          </a>
          を参考にしています。
        </p>
      </div>

      {role === "funeral_company" && facilityId ? (
        <>
          <Link
            href={`/funeral-company/facilities/${facilityId}/staff`}
            className={`tap-target inline-flex w-full items-center justify-center rounded-xl px-4 text-base font-medium ${btnPrimary}`}
          >
            火葬案内スタッフの対応状況
          </Link>
          {canCreateRequest ? (
            <Link
              href={`/funeral-company/requests/new/datetime?facilityId=${facilityId}`}
              className={`tap-target inline-flex w-full items-center justify-center rounded-xl border-2 bg-white px-4 text-base font-medium ${btnOutline}`}
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
        </>
      ) : role === "freelancer" ? (
        <div className="space-y-2">
          <Link
            href="/freelancer/offers"
            className={`tap-target inline-flex w-full items-center justify-center rounded-xl px-4 text-base font-medium ${btnPrimary}`}
          >
            届いた依頼を見る
          </Link>
          <Link
            href="/freelancer/availability"
            className={`tap-target inline-flex w-full items-center justify-center rounded-xl border-2 bg-white px-4 text-base font-medium ${btnOutline}`}
          >
            対応可能日を登録する
          </Link>
        </div>
      ) : null}

      <Link
        href={listBackHref}
        className={`text-center text-base underline-offset-4 hover:underline ${headingCls}`}
      >
        一覧へ戻る
      </Link>
    </>
  );
}

export function crematoriumPinFromDb(
  facility: {
    name: string;
    address: string;
    usage_fee_note?: string | null;
    notes?: string | null;
    data_label?: string;
    is_placeholder?: boolean;
  },
  municipalityName: string,
): Pick<
  CrematoriumDetailBodyProps,
  "name" | "municipalityName" | "address" | "usageFeeNote" | "notes" | "dataLabel"
> {
  return {
    name: facility.name,
    municipalityName,
    address: facility.address,
    usageFeeNote: facility.usage_fee_note,
    notes: facility.notes,
    dataLabel: facility.data_label,
  };
}
