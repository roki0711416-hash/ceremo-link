"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { CeremoCalendar } from "@/components/ceremo/calendar";
import { FormActions } from "@/components/ceremo/form-actions";
import { StepIndicator } from "@/components/ceremo/step-indicator";
import { DemoBanner, DemoShell } from "@/components/demo/demo-shell";
import { FREELANCER_AVAIL_STEPS } from "@/lib/demo/data";
import { loadAvailDraft, saveAvailDraft } from "@/lib/demo/draft-storage";

function buildDays(selected: Set<string>) {
  const days: {
    date: string;
    label: string;
    inMonth: boolean;
    selected?: boolean;
    marked?: "registered" | "selecting" | "contracted" | "closed";
  }[] = [];
  for (let i = 0; i < 6; i++) {
    days.push({ date: `pad-${i}`, label: "", inMonth: false });
  }
  for (let d = 1; d <= 31; d++) {
    const date = `2026-08-${String(d).padStart(2, "0")}`;
    let marked: "registered" | "selecting" | "contracted" | "closed" | undefined;
    if (d === 5) marked = "contracted";
    if (d === 10) marked = "registered";
    if (selected.has(date)) marked = "selecting";
    days.push({
      date,
      label: String(d),
      inMonth: true,
      selected: selected.has(date),
      marked,
    });
  }
  return days;
}

function addDateToAvailDraft(date: string) {
  const draft = loadAvailDraft();
  const dates = new Set(draft.dates);
  if (dates.has(date)) return;
  dates.add(date);
  const slots = { ...draft.slots };
  if (!slots[date]?.length) slots[date] = [{ start: "09:00", end: "17:00" }];
  saveAvailDraft({ dates: [...dates].sort(), slots });
}

export function FreelancerAvailabilityClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const validDate = useMemo(() => {
    const date = searchParams.get("date");
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    return date;
  }, [searchParams]);

  const [selectedBase, setSelectedBase] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    const dates = loadAvailDraft().dates;
    if (validDate) {
      addDateToAvailDraft(validDate);
      return new Set([...dates, validDate]);
    }
    return new Set(dates);
  });

  const selected = useMemo(() => {
    const next = new Set(selectedBase);
    if (validDate) next.add(validDate);
    return next;
  }, [selectedBase, validDate]);

  const days = useMemo(() => buildDays(selected), [selected]);

  function toggle(date: string) {
    if (!date.startsWith("2026")) return;
    if (date.endsWith("-05")) return;
    setSelectedBase((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      const draft = loadAvailDraft();
      const slots = { ...draft.slots };
      for (const d of next) {
        if (!slots[d]?.length) slots[d] = [{ start: "09:00", end: "17:00" }];
      }
      saveAvailDraft({ dates: [...next].sort(), slots });
      return next;
    });
  }

  return (
    <DemoShell title="対応可能日" backHref="/freelancer" tone="freelancer">
      <DemoBanner />
      <StepIndicator
        steps={[...FREELANCER_AVAIL_STEPS]}
        currentStepId="schedule"
      />
      <p className="text-base text-muted-foreground">
        複数日を選べます。色と文字で状態を区別します。
      </p>
      <CeremoCalendar
        monthLabel="2026年 8月"
        days={days}
        onSelectDate={toggle}
      />
      <ul className="space-y-1 text-sm text-muted-foreground">
        <li>・選択中: 紫のハイライト</li>
        <li>・登録済み: 緑の背景（例: 10日）</li>
        <li>・契約済み: 黄の背景（例: 5日・選択不可）</li>
      </ul>
      <FormActions
        backHref="/freelancer"
        primaryLabel="時間設定へ進む"
        primaryType="button"
        onPrimaryClick={() => {
          if (selected.size === 0) return;
          router.push("/freelancer/availability/times");
        }}
      />
    </DemoShell>
  );
}
