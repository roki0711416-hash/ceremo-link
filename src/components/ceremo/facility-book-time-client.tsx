"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Trash2 } from "lucide-react";

import { FormActions } from "@/components/ceremo/form-actions";
import { FacilityBookingHeader } from "@/components/ceremo/facility-booking-header";
import { StepIndicator } from "@/components/ceremo/step-indicator";
import { FuneralCompanyShell } from "@/components/layout/funeral-company-shell";
import { FreelancerShell } from "@/components/layout/freelancer-shell";
import { FREELANCER_AVAIL_STEPS } from "@/lib/demo/data";
import { FUNERAL_REQUEST_STEPS } from "@/lib/constants/request-flow";
import {
  loadAvailDraft,
  loadRequestDraft,
  saveAvailDraft,
  saveRequestDraft,
  type AvailDraft,
} from "@/lib/demo/draft-storage";
import { cn } from "@/lib/utils";

type FacilityInfo = {
  id: string;
  name: string;
  address: string;
  municipalityName: string;
  municipalityId: string;
};

type FacilityBookTimeClientProps = {
  role: "funeral_company" | "freelancer";
  email?: string | null;
  facility: FacilityInfo;
  date: string;
  month: string;
  canBook: boolean;
};

function formatJapaneseDate(date: string) {
  return format(new Date(`${date}T00:00:00`), "yyyy年M月d日 (EEE)", {
    locale: ja,
  });
}

function overlaps(
  a: { start: string; end: string },
  b: { start: string; end: string },
) {
  return a.start < b.end && b.start < a.end;
}

function ensureFreelancerDate(draft: AvailDraft, date: string): AvailDraft {
  if (draft.dates.includes(date)) return draft;
  const next = {
    dates: [...draft.dates, date].sort(),
    slots: {
      ...draft.slots,
      [date]: draft.slots[date] ?? [{ start: "09:00", end: "17:00" }],
    },
  };
  saveAvailDraft(next);
  return next;
}

export function FacilityBookTimeClient({
  role,
  email,
  facility,
  date,
  month,
  canBook,
}: FacilityBookTimeClientProps) {
  const router = useRouter();
  const tone = role === "funeral_company" ? "funeral" : "freelancer";
  const base = role === "funeral_company" ? "/funeral-company" : "/freelancer";
  const calendarHref = `${base}/facilities/${facility.id}/staff?month=${month}`;

  const [startTime, setStartTime] = useState(() => {
    const draft = loadRequestDraft();
    return draft.workDate === date ? (draft.startTime ?? "09:00") : "09:00";
  });
  const [endTime, setEndTime] = useState(() => {
    const draft = loadRequestDraft();
    return draft.workDate === date ? (draft.endTime ?? "15:00") : "15:00";
  });
  const [meetupTime, setMeetupTime] = useState(() => {
    const draft = loadRequestDraft();
    return draft.workDate === date ? (draft.meetupTime ?? "08:30") : "08:30";
  });
  const [freelancerDraft, setFreelancerDraft] = useState<AvailDraft>(() =>
    role === "freelancer" ? ensureFreelancerDate(loadAvailDraft(), date) : loadAvailDraft(),
  );
  const [error, setError] = useState<string | null>(null);

  const shell =
    role === "funeral_company"
      ? (children: ReactNode) => (
          <FuneralCompanyShell
            title="希望時間"
            backHref={calendarHref}
            email={email}
          >
            {children}
          </FuneralCompanyShell>
        )
      : (children: ReactNode) => (
          <FreelancerShell
            title="対応可能時間"
            backHref={calendarHref}
            email={email}
          >
            {children}
          </FreelancerShell>
        );

  const timeFieldClass =
    "tap-target h-11 w-full rounded-xl border border-input bg-white px-3 text-base";

  function persistFreelancer(next: AvailDraft) {
    setFreelancerDraft(next);
    saveAvailDraft(next);
  }

  return shell(
    <div className="space-y-5 pb-4">
      <StepIndicator
        steps={
          role === "funeral_company"
            ? [...FUNERAL_REQUEST_STEPS]
            : [...FREELANCER_AVAIL_STEPS]
        }
        currentStepId={
          role === "funeral_company" ? "datetime" : "schedule"
        }
        tone={tone}
      />

      <FacilityBookingHeader
        name={facility.name}
        address={facility.address}
        municipalityName={facility.municipalityName}
        detailHref={`${base}/facilities/${facility.id}`}
        tone={tone}
      />

      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl border px-4 py-3",
          tone === "funeral"
            ? "border-funeral/20 bg-funeral-soft"
            : "border-freelancer/20 bg-freelancer-soft",
        )}
      >
        <div>
          <p className="text-sm text-muted-foreground">選択中の日付</p>
          <p className="font-heading text-lg font-semibold text-foreground">
            {formatJapaneseDate(date)}
          </p>
        </div>
        <Link
          href={calendarHref}
          className={cn(
            "tap-target shrink-0 rounded-lg border-2 px-3 py-2 text-sm font-medium",
            tone === "funeral"
              ? "border-funeral text-funeral"
              : "border-freelancer text-freelancer",
          )}
        >
          日付を変更
        </Link>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-base text-required"
        >
          {error}
        </p>
      ) : null}

      {role === "funeral_company" ? (
        <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
          <p className="text-base font-medium text-foreground">希望時間</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-sm text-muted-foreground">開始</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={timeFieldClass}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm text-muted-foreground">終了</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={timeFieldClass}
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-sm text-muted-foreground">集合時刻</span>
            <input
              type="time"
              value={meetupTime}
              onChange={(e) => setMeetupTime(e.target.value)}
              className={timeFieldClass}
            />
          </label>
        </div>
      ) : (
        <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
          <h2
            className={cn(
              "font-heading text-lg font-semibold",
              tone === "freelancer" ? "text-freelancer" : "text-funeral",
            )}
          >
            対応可能時間
          </h2>
          {(freelancerDraft.slots[date] ?? []).map((slot, idx) => (
            <div key={idx} className="flex items-end gap-2">
              <label className="flex-1 space-y-1 text-sm">
                開始
                <input
                  type="time"
                  value={slot.start}
                  onChange={(e) => {
                    const slots = [...(freelancerDraft.slots[date] ?? [])];
                    slots[idx] = { ...slots[idx], start: e.target.value };
                    persistFreelancer({
                      ...freelancerDraft,
                      slots: { ...freelancerDraft.slots, [date]: slots },
                    });
                  }}
                  className="tap-target w-full rounded-lg border border-input px-2 text-base"
                />
              </label>
              <label className="flex-1 space-y-1 text-sm">
                終了
                <input
                  type="time"
                  value={slot.end}
                  onChange={(e) => {
                    const slots = [...(freelancerDraft.slots[date] ?? [])];
                    slots[idx] = { ...slots[idx], end: e.target.value };
                    persistFreelancer({
                      ...freelancerDraft,
                      slots: { ...freelancerDraft.slots, [date]: slots },
                    });
                  }}
                  className="tap-target w-full rounded-lg border border-input px-2 text-base"
                />
              </label>
              <button
                type="button"
                className="tap-target inline-flex items-center justify-center text-required"
                aria-label="この時間帯を削除"
                onClick={() => {
                  const slots = (freelancerDraft.slots[date] ?? []).filter(
                    (_, i) => i !== idx,
                  );
                  persistFreelancer({
                    ...freelancerDraft,
                    slots: { ...freelancerDraft.slots, [date]: slots },
                  });
                }}
              >
                <Trash2 className="size-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            className={cn(
              "tap-target w-full rounded-xl border-2 text-base",
              tone === "freelancer"
                ? "border-freelancer text-freelancer"
                : "border-funeral text-funeral",
            )}
            onClick={() => {
              const slots = [
                ...(freelancerDraft.slots[date] ?? []),
                { start: "13:00", end: "17:00" },
              ];
              persistFreelancer({
                ...freelancerDraft,
                slots: { ...freelancerDraft.slots, [date]: slots },
              });
            }}
          >
            時間を追加
          </button>
        </section>
      )}

      {role === "funeral_company" ? (
        canBook ? (
          <FormActions
            backHref={calendarHref}
            backLabel="カレンダーに戻る"
            primaryLabel="内容入力へ進む"
            primaryType="button"
            tone={tone}
            onPrimaryClick={() => {
              if (endTime <= startTime) {
                setError("終了時刻は開始より後にしてください");
                return;
              }
              setError(null);
              const prev = loadRequestDraft();
              saveRequestDraft({
                ...prev,
                facilityId: facility.id,
                crematoriumName: facility.name,
                municipalityId: facility.municipalityId,
                workDate: date,
                startTime,
                endTime,
                meetupTime,
                locationGeneral: facility.address,
              });
              router.push("/funeral-company/requests/new/details");
            }}
          />
        ) : (
          <p
            role="status"
            className="rounded-xl border border-border bg-amber-50 px-4 py-3 text-base text-amber-950"
          >
            審査完了後に、日時を選んで依頼を作成できます。
          </p>
        )
      ) : canBook ? (
        <FormActions
          backHref={calendarHref}
          backLabel="別の日付を追加"
          primaryLabel="確認画面へ進む"
          primaryType="button"
          tone={tone}
          onPrimaryClick={() => {
            const slots = freelancerDraft.slots[date] ?? [];
            if (slots.length === 0) {
              setError("時間帯を1つ以上設定してください");
              return;
            }
            for (let i = 0; i < slots.length; i++) {
              const s = slots[i];
              if (s.end <= s.start) {
                setError("終了時刻は開始より後にしてください");
                return;
              }
              for (let j = i + 1; j < slots.length; j++) {
                if (overlaps(s, slots[j])) {
                  setError("同じ日に重複する時間帯があります");
                  return;
                }
              }
            }
            if (freelancerDraft.dates.length === 0) {
              setError("日付を1つ以上選んでください");
              return;
            }
            setError(null);
            router.push("/freelancer/availability/confirm");
          }}
        />
      ) : (
        <p
          role="status"
          className="rounded-xl border border-border bg-amber-50 px-4 py-3 text-base text-amber-950"
        >
          審査完了後に、対応可能日時を登録できます。
        </p>
      )}
    </div>,
  );
}
