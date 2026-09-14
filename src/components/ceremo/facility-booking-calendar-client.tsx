"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { addMonths, format, getDay, startOfMonth } from "date-fns";
import { ja } from "date-fns/locale";
import { Trash2 } from "lucide-react";

import { CeremoCalendar, type CalendarDay } from "@/components/ceremo/calendar";
import { DemoFacilityBanner } from "@/components/ceremo/demo-facility-banner";
import { FormActions } from "@/components/ceremo/form-actions";
import { FacilityBookingHeader } from "@/components/ceremo/facility-booking-header";
import { StepIndicator } from "@/components/ceremo/step-indicator";
import { FuneralCompanyShell, ScreenState } from "@/components/layout/funeral-company-shell";
import { FreelancerShell } from "@/components/layout/freelancer-shell";
import { FREELANCER_AVAIL_STEPS } from "@/lib/demo/data";
import { FUNERAL_REQUEST_STEPS } from "@/lib/constants/request-flow";
import {
  BOOKING_SLOT_LABELS,
  bookingLevelFromStaffCount,
  type BookingSlotLevel,
} from "@/lib/booking-calendar-status";
import { VERIFICATION_GATE_ENABLED } from "@/lib/constants/verification-gate";
import {
  loadAvailDraft,
  saveAvailDraft,
  type AvailDraft,
} from "@/lib/demo/draft-storage";
import {
  countForDate,
  type StaffCountsLoadState,
} from "@/lib/staff-status";

type FacilityInfo = {
  id: string;
  name: string;
  address: string;
  municipalityName: string;
  municipalityId: string;
  dataLabel: string;
  isPlaceholder: boolean;
  isDemo?: boolean;
};

type FacilityBookingCalendarClientProps = {
  role: "funeral_company" | "freelancer";
  email?: string | null;
  facility: FacilityInfo;
  month: string;
  countsState: StaffCountsLoadState;
  showCounts: boolean;
  canBook: boolean;
  mapBackHref: string;
};

function levelToSymbol(level: BookingSlotLevel): CalendarDay["statusSymbol"] {
  if (level === "available" || level === "moderate") return "○";
  if (level === "few" || level === "crowded") return "△";
  return null;
}

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

export function FacilityBookingCalendarClient({
  role,
  email,
  facility,
  month,
  countsState,
  showCounts,
  canBook,
  mapBackHref,
}: FacilityBookingCalendarClientProps) {
  const router = useRouter();
  const monthDate = useMemo(() => new Date(`${month}-01T00:00:00`), [month]);
  const tone = role === "funeral_company" ? "funeral" : "freelancer";
  const base = role === "funeral_company" ? "/funeral-company" : "/freelancer";

  const [freelancerDraft, setFreelancerDraft] = useState<AvailDraft>(() =>
    role === "freelancer" ? loadAvailDraft() : { dates: [], slots: {} },
  );
  const [error, setError] = useState<string | null>(null);

  const days = useMemo<CalendarDay[]>(() => {
    const start = startOfMonth(monthDate);
    const pad = getDay(start);
    const last = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    const rows: CalendarDay[] = [];
    const counts = countsState.kind === "ok" ? countsState.rows : [];

    for (let i = 0; i < pad; i += 1) {
      rows.push({
        date: `pad-${i}`,
        label: "",
        inMonth: false,
      });
    }

    for (let day = 1; day <= last; day += 1) {
      const date = `${month}-${String(day).padStart(2, "0")}`;
      const count =
        countsState.kind === "ok" ? (countForDate(counts, date) ?? 0) : null;
      const level = bookingLevelFromStaffCount(count);

      let disabled = false;
      if (role === "funeral_company") {
        disabled = showCounts && countsState.kind !== "ok";
      }

      const isSelected =
        role === "freelancer" ? freelancerDraft.dates.includes(date) : false;

      rows.push({
        date,
        label: String(day),
        inMonth: true,
        selected: isSelected,
        disabled,
        statusSymbol:
          role === "funeral_company" && showCounts
            ? levelToSymbol(level)
            : null,
        statusText: showCounts ? BOOKING_SLOT_LABELS[level].label : undefined,
      });
    }
    return rows;
  }, [freelancerDraft.dates, countsState, month, monthDate, role, showCounts]);

  function goMonth(offset: number) {
    const next = format(addMonths(monthDate, offset), "yyyy-MM");
    router.push(`${base}/facilities/${facility.id}/staff?month=${next}`);
  }

  function openRequestForm(date: string) {
    if (!date.startsWith(month) || !canBook) return;
    router.push(
      `${base}/facilities/${facility.id}/book?date=${date}&month=${month}`,
    );
  }

  function toggleFreelancerDate(date: string) {
    if (!date.startsWith(month)) return;
    setFreelancerDraft((prev) => {
      const nextDates = new Set(prev.dates);
      const slots = { ...prev.slots };
      if (nextDates.has(date)) {
        nextDates.delete(date);
        delete slots[date];
      } else {
        nextDates.add(date);
        if (!slots[date]?.length) {
          slots[date] = [{ start: "09:00", end: "17:00" }];
        }
      }
      const next = {
        dates: [...nextDates].sort(),
        slots,
      };
      saveAvailDraft(next);
      return next;
    });
  }

  function persistFreelancer(next: AvailDraft) {
    setFreelancerDraft(next);
    saveAvailDraft(next);
  }

  const shell =
    role === "funeral_company"
      ? (children: ReactNode) => (
          <FuneralCompanyShell
            title="日時選択"
            backHref={mapBackHref}
            email={email}
          >
            {children}
          </FuneralCompanyShell>
        )
      : (children: ReactNode) => (
          <FreelancerShell
            title="対応可能日時"
            backHref={mapBackHref}
            email={email}
          >
            {children}
          </FreelancerShell>
        );

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

      {facility.isDemo ? <DemoFacilityBanner /> : null}

      {countsState.kind === "error" ? (
        <ScreenState title="対応状況の取得に失敗しました">
          カレンダーを表示できませんでした。時間をおいて再度お試しください。
        </ScreenState>
      ) : null}

      {VERIFICATION_GATE_ENABLED && countsState.kind === "unauthorized" ? (
        <ScreenState title="審査完了後に予約できます">
          審査が完了すると、日時の選択と依頼の作成ができます。
        </ScreenState>
      ) : null}

      {role === "freelancer" ? (
        <p className="text-base text-muted-foreground">
          対応可能な日付を選んでください（複数選択可）
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-base text-required"
        >
          {error}
        </p>
      ) : null}

      <CeremoCalendar
        monthLabel={`${month.slice(0, 4)}年 ${month.slice(5)}月`}
        days={days}
        tone={tone}
        onPrevMonth={() => goMonth(-1)}
        onNextMonth={() => goMonth(1)}
        onSelectDate={(date) => {
          if (role === "funeral_company") {
            openRequestForm(date);
          } else {
            toggleFreelancerDate(date);
          }
        }}
      />

      {role === "funeral_company" && showCounts ? (
        <ul className="space-y-1 rounded-xl border border-border bg-surface px-4 py-3 text-xs text-muted-foreground">
          <li>○ 空きあり・やや混雑 / △ 残りわずか・混雑（スタッフ対応可能人数の目安）</li>
        </ul>
      ) : null}

      {role === "funeral_company" && canBook ? (
        <p className="text-base text-muted-foreground">
          日付をタップして、依頼内容を入力してください。
        </p>
      ) : null}

      {role === "freelancer" ? (
        <div className="space-y-4">
          {freelancerDraft.dates.length === 0 ? (
            <p className="text-base text-muted-foreground">
              カレンダーから日付を選ぶと、下に時間帯を設定できます。
            </p>
          ) : (
            freelancerDraft.dates.map((date) => (
              <section
                key={date}
                className="space-y-3 rounded-xl border border-border bg-surface p-4"
              >
                <h2 className="font-heading text-lg font-semibold text-freelancer">
                  {formatJapaneseDate(date)}
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
                  className="tap-target w-full rounded-xl border-2 border-freelancer text-base text-freelancer"
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
            ))
          )}
        </div>
      ) : null}

      {role === "freelancer" && canBook ? (
        <FormActions
          backHref={mapBackHref}
          backLabel="戻る"
          primaryLabel="確認画面へ進む"
          primaryType="button"
          tone="freelancer"
          onPrimaryClick={() => {
            if (freelancerDraft.dates.length === 0) {
              setError("日付を1つ以上選んでください");
              return;
            }
            for (const date of freelancerDraft.dates) {
              const slots = freelancerDraft.slots[date] ?? [];
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
            }
            setError(null);
            router.push("/freelancer/availability/confirm");
          }}
        />
      ) : role === "freelancer" ? (
        <p
          role="status"
          className="rounded-xl border border-border bg-amber-50 px-4 py-3 text-base text-amber-950"
        >
          審査完了後に、対応可能日時を登録できます。
        </p>
      ) : null}

      {role === "funeral_company" && !canBook ? (
        <p
          role="status"
          className="rounded-xl border border-border bg-amber-50 px-4 py-3 text-base text-amber-950"
        >
          審査完了後に、日時を選んで依頼を作成できます。
        </p>
      ) : null}
    </div>,
  );
}
