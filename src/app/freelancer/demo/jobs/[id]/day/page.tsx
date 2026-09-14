"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { DemoBanner, DemoShell } from "@/components/demo/demo-shell";
import { DEMO_ASSIGNED_JOB } from "@/lib/demo/data";

export default function FreelancerDayPage() {
  const { id } = useParams<{ id: string }>();
  const job = DEMO_ASSIGNED_JOB;
  const [ack, setAck] = useState(false);
  const [phase, setPhase] = useState<
    "prep" | "arrived" | "started" | "done_ok" | "done_issue"
  >("prep");

  if (id !== job.id) {
    return (
      <DemoShell title="当日" backHref="/freelancer">
        <p>案件が見つかりません。</p>
      </DemoShell>
    );
  }

  return (
    <DemoShell
      title="到着・開始・終了"
      backHref={`/freelancer/demo/jobs/${id}`}
      tone="freelancer"
    >
      <DemoBanner />

      {!ack && job.changeNotice ? (
        <div className="sticky top-14 z-30 -mx-4 border-b border-required/30 bg-red-50 px-4 py-3">
          <p className="text-base font-medium text-required">重要変更（未確認）</p>
          <p className="mt-1 text-base">{job.changeNotice.summary}</p>
          <button
            type="button"
            className="tap-target mt-2 rounded-lg bg-required px-4 text-white"
            onClick={() => setAck(true)}
          >
            確認しました
          </button>
        </div>
      ) : null}

      <section className="space-y-3 rounded-xl border-2 border-freelancer bg-freelancer-soft p-5">
        <p className="text-sm font-medium text-freelancer">次に行う操作</p>
        {phase === "prep" ? (
          <button
            type="button"
            className="tap-target w-full rounded-xl bg-freelancer text-base text-white"
            onClick={() => setPhase("arrived")}
          >
            到着しました
          </button>
        ) : null}
        {phase === "arrived" ? (
          <button
            type="button"
            className="tap-target w-full rounded-xl bg-freelancer text-base text-white"
            onClick={() => setPhase("started")}
          >
            業務を開始します
          </button>
        ) : null}
        {phase === "started" ? (
          <div className="grid gap-2">
            <button
              type="button"
              className="tap-target rounded-xl bg-freelancer text-base text-white"
              onClick={() => setPhase("done_ok")}
            >
              問題なく終了
            </button>
            <button
              type="button"
              className="tap-target rounded-xl border-2 border-required bg-white text-base text-required"
              onClick={() => setPhase("done_issue")}
            >
              トラブルあり
            </button>
          </div>
        ) : null}
        {phase === "done_ok" || phase === "done_issue" ? (
          <p className="text-base">
            終了報告を記録しました（デモ）。報酬確認へ進めます。
          </p>
        ) : null}
      </section>

      <a
        href={`tel:${job.emergencyContact.replace(/-/g, "")}`}
        className="tap-target flex items-center justify-center rounded-xl bg-required px-4 text-base font-medium text-white"
      >
        緊急連絡する
      </a>

      <Link
        href={`/freelancer/demo/jobs/${id}/pay`}
        className="tap-target inline-flex w-full items-center justify-center rounded-xl border-2 border-freelancer text-base text-freelancer"
      >
        報酬確認へ
      </Link>
    </DemoShell>
  );
}
