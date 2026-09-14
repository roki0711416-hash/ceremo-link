"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { DemoBanner, DemoShell, NavLink } from "@/components/demo/demo-shell";
import { DEMO_ASSIGNED_JOB } from "@/lib/demo/data";

export default function PrecheckPage() {
  const { id } = useParams<{ id: string }>();
  const job = DEMO_ASSIGNED_JOB;
  const [checked, setChecked] = useState({
    time: false,
    place: false,
    dress: false,
  });

  if (id !== job.id) {
    return (
      <DemoShell title="前日確認" backHref="/freelancer">
        <p>案件が見つかりません。</p>
      </DemoShell>
    );
  }

  const allOk = checked.time && checked.place && checked.dress;

  return (
    <DemoShell
      title="前日確認"
      backHref={`/freelancer/demo/jobs/${id}`}
      tone="freelancer"
    >
      <DemoBanner />
      <h1 className="font-heading text-2xl text-freelancer">前日の最終確認</h1>
      <p className="text-base text-muted-foreground">
        {job.workDateLabel} / {job.facilityName}
      </p>
      <ul className="space-y-3 rounded-xl border border-border bg-surface p-4">
        {(
          [
            ["time", `集合・業務時間: ${job.timeRange}`],
            ["place", `集合場所: ${job.meetupLocation}`],
            ["dress", `服装・持ち物: ${job.notes}`],
          ] as const
        ).map(([key, label]) => (
          <li key={key}>
            <label className="flex min-h-11 items-start gap-3 text-base">
              <input
                type="checkbox"
                className="mt-1 size-5"
                checked={checked[key]}
                onChange={(e) =>
                  setChecked((c) => ({ ...c, [key]: e.target.checked }))
                }
              />
              <span>{label}</span>
            </label>
          </li>
        ))}
      </ul>
      {allOk ? (
        <NavLink
          href={`/freelancer/demo/jobs/${id}/day`}
          variant="freelancer"
        >
          確認完了・当日へ
        </NavLink>
      ) : (
        <p className="text-base text-muted-foreground">
          すべて確認すると次へ進めます。
        </p>
      )}
      <Link
        href={`/freelancer/demo/jobs/${id}`}
        className="text-base text-freelancer underline-offset-4 hover:underline"
      >
        案件詳細へ
      </Link>
    </DemoShell>
  );
}
