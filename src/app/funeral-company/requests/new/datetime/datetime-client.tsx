"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { FormActions } from "@/components/ceremo/form-actions";
import { RequiredMark } from "@/components/ceremo/status-badge";
import { StepIndicator } from "@/components/ceremo/step-indicator";
import { FuneralCompanyShell } from "@/components/layout/funeral-company-shell";
import { FUNERAL_REQUEST_STEPS } from "@/lib/constants/request-flow";
import {
  loadRequestDraft,
  saveRequestDraft,
} from "@/lib/demo/draft-storage";

type FacilityInfo = {
  id: string;
  name: string;
  address: string;
  municipalityId: string;
  municipalityName: string;
};

export function RequestDatetimeClient({
  email,
  facility,
  initialDate,
}: {
  email?: string | null;
  facility: FacilityInfo;
  initialDate?: string;
}) {
  const router = useRouter();
  const draft = loadRequestDraft();

  const [workDate, setWorkDate] = useState(
    () => initialDate || draft.workDate || "",
  );
  const [startTime, setStartTime] = useState(() => draft.startTime ?? "09:00");
  const [endTime, setEndTime] = useState(() => draft.endTime ?? "15:00");
  const [meetupTime, setMeetupTime] = useState(
    () => draft.meetupTime ?? "08:30",
  );
  const [error, setError] = useState<string | null>(null);

  const backHref = `/funeral-company/facilities/${facility.id}/staff`;

  return (
    <FuneralCompanyShell title="依頼日時" backHref={backHref} email={email}>
      <StepIndicator
        steps={[...FUNERAL_REQUEST_STEPS]}
        currentStepId="datetime"
      />
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">選択中の火葬場</p>
        <p className="text-base font-medium">{facility.name}</p>
        <p className="text-sm text-muted-foreground">
          {facility.municipalityName} / {facility.address}
        </p>
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-base text-required">
          {error}
        </p>
      ) : null}

      <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
        <label className="block space-y-1">
          <span className="text-base font-medium">
            火葬・実施日
            <RequiredMark />
          </span>
          <input
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            className="tap-target h-11 w-full rounded-xl border border-input px-3 text-base"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-base font-medium">
              開始
              <RequiredMark />
            </span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="tap-target h-11 w-full rounded-xl border border-input px-3 text-base"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-base font-medium">
              終了
              <RequiredMark />
            </span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="tap-target h-11 w-full rounded-xl border border-input px-3 text-base"
            />
          </label>
        </div>
        <label className="block space-y-1">
          <span className="text-base font-medium">
            集合時刻
            <RequiredMark />
          </span>
          <input
            type="time"
            value={meetupTime}
            onChange={(e) => setMeetupTime(e.target.value)}
            className="tap-target h-11 w-full rounded-xl border border-input px-3 text-base"
          />
        </label>
      </div>

      <FormActions
        backHref={backHref}
        primaryLabel="依頼詳細へ進む"
        primaryType="button"
        onPrimaryClick={() => {
          if (!workDate || !startTime || !endTime || !meetupTime) {
            setError("日付と時刻をすべて入力してください");
            return;
          }
          if (endTime <= startTime) {
            setError("終了時刻は開始時刻より後にしてください");
            return;
          }
          saveRequestDraft({
            facilityId: facility.id,
            crematoriumName: facility.name,
            municipalityId: facility.municipalityId,
            municipalityName: facility.municipalityName,
            locationGeneral: facility.address,
            exactAddress: facility.address,
            workDate,
            startTime,
            endTime,
            meetupTime,
          });
          router.push("/funeral-company/requests/new/details");
        }}
      />
    </FuneralCompanyShell>
  );
}
