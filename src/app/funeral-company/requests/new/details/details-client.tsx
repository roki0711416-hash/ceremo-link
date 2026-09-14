"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

import { FormActions } from "@/components/ceremo/form-actions";
import { FacilityBookingHeader } from "@/components/ceremo/facility-booking-header";
import { RequiredMark } from "@/components/ceremo/status-badge";
import { StepIndicator } from "@/components/ceremo/step-indicator";
import { FuneralCompanyShell } from "@/components/layout/funeral-company-shell";
import { FUNERAL_REQUEST_STEPS } from "@/lib/constants/request-flow";
import {
  loadRequestDraft,
  saveRequestDraft,
  type RequestDraft,
} from "@/lib/demo/draft-storage";

const fieldClass =
  "tap-target h-11 w-full rounded-xl border border-input bg-white px-3 text-base";

type ServiceOption = { id: string; name: string; code: string };

export function RequestDetailsClient({
  email,
  serviceTypes,
  defaults,
}: {
  email?: string | null;
  serviceTypes: ServiceOption[];
  defaults: {
    contactName: string;
    contactPhone: string;
    emergencyContact: string;
  };
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<RequestDraft>(() => {
    const loaded = loadRequestDraft();
    if (!loaded.facilityId) return {};
    const guide =
      serviceTypes.find((s) => s.code === "crematorium_guide") ??
      serviceTypes[0];
    return {
      ...loaded,
      serviceTypeId: loaded.serviceTypeId ?? guide?.id,
      contactName: loaded.contactName || defaults.contactName,
      contactPhone: loaded.contactPhone || defaults.contactPhone,
      emergencyContact: loaded.emergencyContact || defaults.emergencyContact,
      travelExpense: loaded.travelExpense ?? "0",
      exactAddress: loaded.exactAddress || loaded.locationGeneral || "",
    };
  });
  const [error, setError] = useState<string | null>(null);
  const hasFacility = draft.facilityId != null && draft.facilityId !== "";

  useEffect(() => {
    if (!hasFacility) {
      router.replace("/funeral-company/facilities");
    }
  }, [hasFacility, router]);

  function update(patch: Partial<RequestDraft>) {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      saveRequestDraft(next);
      return next;
    });
  }

  if (!hasFacility) {
    return (
      <FuneralCompanyShell title="依頼内容入力" email={email}>
        <p className="text-base text-muted-foreground">読み込み中…</p>
      </FuneralCompanyShell>
    );
  }

  return (
    <FuneralCompanyShell
      title="依頼内容入力"
      backHref={`/funeral-company/facilities/${draft.facilityId}/staff`}
      email={email}
    >
      <StepIndicator
        steps={[...FUNERAL_REQUEST_STEPS]}
        currentStepId="details"
      />

      {draft.crematoriumName ? (
        <FacilityBookingHeader
          name={draft.crematoriumName}
          address={draft.locationGeneral ?? ""}
          detailHref={`/funeral-company/facilities/${draft.facilityId}`}
          tone="funeral"
        />
      ) : null}

      {draft.workDate ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-funeral/20 bg-funeral-soft px-4 py-3">
          <div>
            <p className="text-sm text-muted-foreground">選択中の日付</p>
            <p className="font-heading text-lg font-semibold">
              {format(new Date(`${draft.workDate}T00:00:00`), "yyyy年M月d日 (EEE)", {
                locale: ja,
              })}
            </p>
            {draft.startTime && draft.endTime ? (
              <p className="text-sm text-muted-foreground">
                {draft.startTime} 〜 {draft.endTime}
                {draft.meetupTime ? `（集合 ${draft.meetupTime}）` : ""}
              </p>
            ) : null}
          </div>
          <Link
            href={`/funeral-company/facilities/${draft.facilityId}/staff`}
            className="text-sm font-medium text-funeral underline-offset-2 hover:underline"
          >
            日付を変更
          </Link>
        </div>
      ) : null}

      <p className="text-sm text-muted-foreground">
        故人名・正確な住所・集合場所・連絡先は契約成立前の候補者には表示されません。
      </p>

      {error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-base text-required">
          {error}
        </p>
      ) : null}

      <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
        <label className="block space-y-1">
          <span className="text-base font-medium">
            業務区分
            <RequiredMark />
          </span>
          <select
            value={draft.serviceTypeId ?? ""}
            onChange={(e) => update({ serviceTypeId: e.target.value })}
            className={fieldClass}
          >
            <option value="">選択してください</option>
            {serviceTypes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-base font-medium">
            故人名（契約後開示）
            <RequiredMark />
          </span>
          <input
            value={draft.deceasedName ?? ""}
            onChange={(e) => update({ deceasedName: e.target.value })}
            className={fieldClass}
            autoComplete="off"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-base font-medium">
            正確な住所（契約後開示）
            <RequiredMark />
          </span>
          <input
            value={draft.exactAddress ?? ""}
            onChange={(e) => update({ exactAddress: e.target.value })}
            className={fieldClass}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-base font-medium">
            集合場所（契約後開示）
            <RequiredMark />
          </span>
          <input
            value={draft.meetupLocation ?? ""}
            onChange={(e) => update({ meetupLocation: e.target.value })}
            className={fieldClass}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-base font-medium">
            葬儀社担当者
            <RequiredMark />
          </span>
          <input
            value={draft.contactName ?? ""}
            onChange={(e) => update({ contactName: e.target.value })}
            className={fieldClass}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-base font-medium">
            担当者連絡先
            <RequiredMark />
          </span>
          <input
            value={draft.contactPhone ?? ""}
            onChange={(e) => update({ contactPhone: e.target.value })}
            className={fieldClass}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-base font-medium">
            緊急連絡先
            <RequiredMark />
          </span>
          <input
            value={draft.emergencyContact ?? ""}
            onChange={(e) => update({ emergencyContact: e.target.value })}
            className={fieldClass}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-base font-medium">
              報酬（円）
              <RequiredMark />
            </span>
            <input
              type="number"
              min={0}
              value={draft.payAmount ?? ""}
              onChange={(e) => update({ payAmount: e.target.value })}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-base font-medium">交通費（円）</span>
            <input
              type="number"
              min={0}
              value={draft.travelExpense ?? "0"}
              onChange={(e) => update({ travelExpense: e.target.value })}
              className={fieldClass}
            />
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-base font-medium">
            支払期日
            <RequiredMark />
          </span>
          <input
            type="date"
            value={draft.paymentDueOn ?? ""}
            onChange={(e) => update({ paymentDueOn: e.target.value })}
            className={fieldClass}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-base font-medium">服装</span>
          <input
            value={draft.dressCode ?? ""}
            onChange={(e) => update({ dressCode: e.target.value })}
            className={fieldClass}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-base font-medium">持ち物</span>
          <input
            value={draft.belongings ?? ""}
            onChange={(e) => update({ belongings: e.target.value })}
            className={fieldClass}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-base font-medium">備考</span>
          <textarea
            value={draft.notes ?? ""}
            onChange={(e) => update({ notes: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-input px-3 py-2 text-base"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-base font-medium">
            回答期限
            <RequiredMark />
          </span>
          <input
            type="datetime-local"
            value={draft.responseDeadline ?? ""}
            onChange={(e) => update({ responseDeadline: e.target.value })}
            className={fieldClass}
          />
        </label>
      </div>

      <FormActions
        backHref={`/funeral-company/requests/new/datetime?facilityId=${draft.facilityId}`}
        primaryLabel="確認画面へ"
        primaryType="button"
        onPrimaryClick={() => {
          if (
            !draft.serviceTypeId ||
            !draft.deceasedName?.trim() ||
            !draft.exactAddress?.trim() ||
            !draft.meetupLocation?.trim() ||
            !draft.contactName?.trim() ||
            !draft.contactPhone?.trim() ||
            !draft.emergencyContact?.trim() ||
            !draft.payAmount ||
            !draft.paymentDueOn ||
            !draft.responseDeadline
          ) {
            setError("必須項目を入力してください");
            return;
          }
          saveRequestDraft(draft);
          router.push("/funeral-company/requests/new/confirm");
        }}
      />
    </FuneralCompanyShell>
  );
}
