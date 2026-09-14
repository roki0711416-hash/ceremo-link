"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { FormActions } from "@/components/ceremo/form-actions";
import { DemoFacilityBanner } from "@/components/ceremo/demo-facility-banner";
import { RequestVenueCard } from "@/components/ceremo/request-flow/venue-card";
import { SelectedDateBar } from "@/components/ceremo/request-flow/selected-date-bar";
import { RequiredMark } from "@/components/ceremo/status-badge";
import { StepIndicator } from "@/components/ceremo/step-indicator";
import { FuneralCompanyShell } from "@/components/layout/funeral-company-shell";
import {
  FUNERAL_REQUEST_SERVICE_LABEL,
  FUNERAL_REQUEST_STEPS,
} from "@/lib/constants/request-flow";
import {
  loadRequestDraft,
  saveRequestDraft,
  type RequestDraft,
} from "@/lib/demo/draft-storage";
import {
  computeResponseDeadlineAt,
  defaultPaymentDueOn,
} from "@/lib/job-request-deadlines";

const fieldClass =
  "tap-target h-11 w-full rounded-xl border border-input bg-white px-3 text-base";

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

type FacilityInfo = {
  id: string;
  name: string;
  address: string;
  municipalityName: string;
  municipalityId: string;
  isDemo?: boolean;
};

type ServiceOption = { id: string; name: string; code: string };

function initDraft(
  facility: FacilityInfo,
  date: string,
  serviceTypes: ServiceOption[],
  defaults: {
    contactName: string;
    contactPhone: string;
    emergencyContact: string;
  },
): RequestDraft {
  const loaded = loadRequestDraft();
  const guide = serviceTypes.find((s) => s.code === "crematorium_guide");
  const sameBooking =
    loaded.facilityId === facility.id && loaded.workDate === date;
  const startTime = sameBooking ? (loaded.startTime ?? "10:00") : "10:00";
  const workStartsAt = `${date}T${startTime}`;

  return {
    ...loaded,
    facilityId: facility.id,
    crematoriumName: facility.name,
    municipalityId: facility.municipalityId,
    municipalityName: facility.municipalityName,
    locationGeneral: facility.address,
    workDate: date,
    startTime,
    endTime: sameBooking ? (loaded.endTime ?? "12:00") : "12:00",
    meetupTime: sameBooking ? (loaded.meetupTime ?? "08:30") : "08:30",
    serviceTypeId: guide?.id ?? loaded.serviceTypeId,
    serviceIds: guide ? [guide.id] : [],
    contactName: loaded.contactName || defaults.contactName,
    contactPhone: loaded.contactPhone || defaults.contactPhone,
    emergencyContact:
      loaded.emergencyContact || defaults.emergencyContact,
    exactAddress: loaded.exactAddress || facility.address,
    meetupLocation: loaded.meetupLocation || facility.name,
    travelExpense: loaded.travelExpense ?? "0",
    payAmount: loaded.payAmount ?? "30000",
    paymentDueOn: loaded.paymentDueOn ?? defaultPaymentDueOn(date),
    responseDeadline:
      sameBooking && loaded.responseDeadline
        ? loaded.responseDeadline
        : computeResponseDeadlineAt(workStartsAt),
    deceasedName: loaded.deceasedName ?? "",
    notes: loaded.notes ?? "",
  };
}

export function FacilityRequestFormClient({
  email,
  facility,
  date,
  month,
  serviceTypes,
  defaults,
  canBook,
}: {
  email?: string | null;
  facility: FacilityInfo;
  date: string;
  month: string;
  serviceTypes: ServiceOption[];
  defaults: {
    contactName: string;
    contactPhone: string;
    emergencyContact: string;
  };
  canBook: boolean;
}) {
  const router = useRouter();
  const calendarHref = `/funeral-company/facilities/${facility.id}/staff?month=${month}`;
  const [draft, setDraft] = useState<RequestDraft>(() =>
    initDraft(facility, date, serviceTypes, defaults),
  );
  const [error, setError] = useState<string | null>(null);

  function update(patch: Partial<RequestDraft>) {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      saveRequestDraft(next);
      return next;
    });
  }

  return (
    <FuneralCompanyShell
      title="依頼内容入力"
      backHref={calendarHref}
      email={email}
    >
      <div className="space-y-5 pb-4">
        <StepIndicator
          steps={[...FUNERAL_REQUEST_STEPS]}
          currentStepId="details"
          tone="funeral"
        />

        <RequestVenueCard
          name={facility.name}
          address={facility.address}
          municipalityName={facility.municipalityName}
          detailHref={`/funeral-company/facilities/${facility.id}`}
        />

        {facility.isDemo ? <DemoFacilityBanner /> : null}

        <SelectedDateBar workDate={date} changeHref={calendarHref} />

        {error ? (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-base text-required"
          >
            {error}
          </p>
        ) : null}

        <div className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h3 className="font-heading text-base font-semibold text-foreground">
            依頼内容の入力
          </h3>

          <div className="space-y-3">
            <p className="text-base font-semibold text-foreground">
              希望時間
              <RequiredMark />
            </p>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-sm text-muted-foreground">開始</span>
                <select
                  value={draft.startTime ?? "10:00"}
                  onChange={(e) => update({ startTime: e.target.value })}
                  className={fieldClass}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-sm text-muted-foreground">終了</span>
                <select
                  value={draft.endTime ?? "12:00"}
                  onChange={(e) => update({ endTime: e.target.value })}
                  className={fieldClass}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-base font-semibold text-foreground">
              依頼内容
              <RequiredMark />
            </p>
            <div
              className="flex items-center gap-3 rounded-xl border border-funeral/30 bg-funeral-soft px-4 py-3"
              aria-readonly="true"
            >
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded border-2 border-funeral bg-funeral text-white"
                aria-hidden
              >
                ✓
              </span>
              <span className="text-base font-medium text-foreground">
                {FUNERAL_REQUEST_SERVICE_LABEL}
              </span>
            </div>
          </div>

          <label className="block space-y-1">
            <span className="text-base font-semibold text-foreground">
              喪家名
              <RequiredMark />
            </span>
            <input
              value={draft.deceasedName ?? ""}
              onChange={(e) => update({ deceasedName: e.target.value })}
              placeholder="例）山田家"
              className={fieldClass}
              autoComplete="off"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-base font-semibold text-foreground">
              担当者名
              <RequiredMark />
            </span>
            <input
              value={draft.contactName ?? ""}
              onChange={(e) => update({ contactName: e.target.value })}
              placeholder="例）山田 太郎"
              className={fieldClass}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-base font-semibold text-foreground">
              連絡先
              <RequiredMark />
            </span>
            <input
              value={draft.contactPhone ?? ""}
              onChange={(e) => update({ contactPhone: e.target.value })}
              placeholder="例）090-1234-5678"
              className={fieldClass}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-base font-semibold text-foreground">備考</span>
            <textarea
              value={draft.notes ?? ""}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder="備考があればご入力ください"
              rows={4}
              className="w-full rounded-xl border border-input bg-white px-3 py-2 text-base"
            />
          </label>
        </div>

        {canBook ? (
          <FormActions
            backHref={calendarHref}
            backLabel="戻る"
            primaryLabel="確認画面へ進む"
            primaryType="button"
            tone="funeral"
            onPrimaryClick={() => {
              if (!draft.startTime || !draft.endTime) {
                setError("希望時間を選択してください");
                return;
              }
              if (draft.endTime <= draft.startTime) {
                setError("終了時刻は開始より後にしてください");
                return;
              }
              if (!draft.deceasedName?.trim()) {
                setError("喪家名を入力してください");
                return;
              }
              if (!draft.contactName?.trim() || !draft.contactPhone?.trim()) {
                setError("担当者名と連絡先を入力してください");
                return;
              }

              const guide = serviceTypes.find((s) => s.code === "crematorium_guide");
              if (!guide) {
                setError("依頼内容の設定に失敗しました");
                return;
              }

              const next: RequestDraft = {
                ...draft,
                serviceTypeId: guide.id,
                serviceIds: [guide.id],
                emergencyContact: draft.contactPhone,
              };
              saveRequestDraft(next);
              setError(null);
              router.push("/funeral-company/requests/new/confirm");
            }}
          />
        ) : (
          <p
            role="status"
            className="rounded-xl border border-border bg-amber-50 px-4 py-3 text-base text-amber-950"
          >
            審査完了後に、日時を選んで依頼を作成できます。
          </p>
        )}
      </div>
    </FuneralCompanyShell>
  );
}
