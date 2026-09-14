"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { FormActions } from "@/components/ceremo/form-actions";
import { StepIndicator } from "@/components/ceremo/step-indicator";
import { DemoBanner, DemoShell } from "@/components/demo/demo-shell";
import { FREELANCER_AVAIL_STEPS } from "@/lib/demo/data";
import {
  clearAvailDraft,
  loadAvailDraft,
  type AvailDraft,
} from "@/lib/demo/draft-storage";

export default function FreelancerAvailConfirmPage() {
  const router = useRouter();
  const [draft] = useState<AvailDraft>(() => loadAvailDraft());

  return (
    <DemoShell
      title="空き登録の確認"
      backHref="/freelancer/availability/times"
      tone="freelancer"
    >
      <DemoBanner />
      <StepIndicator
        steps={[...FREELANCER_AVAIL_STEPS]}
        currentStepId="confirm"
        tone="freelancer"
      />
      <div className="space-y-3 rounded-xl border border-border bg-surface p-4 text-base">
        {draft.dates.length === 0 ? (
          <p className="text-muted-foreground">選択がありません。</p>
        ) : (
          draft.dates.map((date) => (
            <div key={date}>
              <p className="font-medium text-freelancer">{date}</p>
              <ul className="mt-1 text-muted-foreground">
                {(draft.slots[date] ?? []).map((s, i) => (
                  <li key={i}>
                    {s.start}〜{s.end}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
      <FormActions
        backHref="/freelancer/availability/times"
        primaryLabel="登録する（デモ）"
        primaryType="button"
        onPrimaryClick={() => {
          clearAvailDraft();
          router.push("/freelancer?registered=1");
        }}
      />
    </DemoShell>
  );
}
