"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { FormActions } from "@/components/ceremo/form-actions";
import { StepIndicator } from "@/components/ceremo/step-indicator";
import { DemoBanner, DemoShell } from "@/components/demo/demo-shell";
import { FREELANCER_AVAIL_STEPS } from "@/lib/demo/data";
import {
  loadAvailDraft,
  saveAvailDraft,
  type AvailDraft,
} from "@/lib/demo/draft-storage";

function overlaps(
  a: { start: string; end: string },
  b: { start: string; end: string },
) {
  return a.start < b.end && b.start < a.end;
}

export default function FreelancerAvailTimesPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<AvailDraft>(() => loadAvailDraft());
  const [error, setError] = useState<string | null>(null);

  function persist(next: AvailDraft) {
    setDraft(next);
    saveAvailDraft(next);
  }

  return (
    <DemoShell
      title="対応可能時間"
      backHref="/freelancer/availability"
      tone="freelancer"
    >
      <DemoBanner />
      <StepIndicator
        steps={[...FREELANCER_AVAIL_STEPS]}
        currentStepId="schedule"
        tone="freelancer"
      />
      <p className="text-base text-muted-foreground">
        選択した日ごとに開始・終了を設定できます。同じ日に複数帯を追加可能です。
      </p>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-base text-required">
          {error}
        </p>
      ) : null}

      <div className="space-y-6">
        {draft.dates.map((date) => (
          <section
            key={date}
            className="space-y-3 rounded-xl border border-border bg-surface p-4"
          >
            <h2 className="font-heading text-lg text-freelancer">{date}</h2>
            {(draft.slots[date] ?? []).map((slot, idx) => (
              <div key={idx} className="flex items-end gap-2">
                <label className="flex-1 space-y-1 text-sm">
                  開始
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => {
                      const slots = [...(draft.slots[date] ?? [])];
                      slots[idx] = { ...slots[idx], start: e.target.value };
                      persist({
                        ...draft,
                        slots: { ...draft.slots, [date]: slots },
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
                      const slots = [...(draft.slots[date] ?? [])];
                      slots[idx] = { ...slots[idx], end: e.target.value };
                      persist({
                        ...draft,
                        slots: { ...draft.slots, [date]: slots },
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
                    const slots = (draft.slots[date] ?? []).filter(
                      (_, i) => i !== idx,
                    );
                    persist({
                      ...draft,
                      slots: { ...draft.slots, [date]: slots },
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
                  ...(draft.slots[date] ?? []),
                  { start: "13:00", end: "17:00" },
                ];
                persist({
                  ...draft,
                  slots: { ...draft.slots, [date]: slots },
                });
              }}
            >
              時間帯を追加
            </button>
          </section>
        ))}
      </div>

      <FormActions
        backHref="/freelancer/availability"
        primaryLabel="確認画面へ"
        primaryType="button"
        onPrimaryClick={() => {
          for (const date of draft.dates) {
            const slots = draft.slots[date] ?? [];
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
    </DemoShell>
  );
}
