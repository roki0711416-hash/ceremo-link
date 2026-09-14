"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { DemoBanner, DemoShell } from "@/components/demo/demo-shell";
import { DEMO_ASSIGNED_JOB } from "@/lib/demo/data";

export default function DemoDayPage() {
  const { id } = useParams<{ id: string }>();
  const job = DEMO_ASSIGNED_JOB;
  const [ack, setAck] = useState(job.changeNotice?.acknowledged ?? false);
  const [phase, setPhase] = useState<
    "prep" | "arrived" | "started" | "done_ok" | "done_issue"
  >("prep");

  if (id !== job.id) {
    return (
      <DemoShell title="当日" backHref="/funeral-company">
        <p>案件が見つかりません。</p>
      </DemoShell>
    );
  }

  const nextAction =
    phase === "prep"
      ? "到着しました"
      : phase === "arrived"
        ? "業務を開始します"
        : phase === "started"
          ? "終了報告へ"
          : "ホームへ戻る";

  return (
    <DemoShell
      title="当日進行・連絡"
      backHref={`/funeral-company/demo/jobs/${id}`}
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

      <section className="space-y-3 rounded-xl border-2 border-funeral bg-funeral-soft p-5">
        <p className="text-sm font-medium text-funeral">次に行う操作</p>
        <p className="font-heading text-2xl text-funeral">{nextAction}</p>
        {phase === "prep" || phase === "arrived" || phase === "started" ? (
          <div className="flex flex-col gap-2">
            {phase === "prep" ? (
              <button
                type="button"
                className="tap-target rounded-xl bg-funeral text-base text-white"
                onClick={() => setPhase("arrived")}
              >
                到着しました
              </button>
            ) : null}
            {phase === "arrived" ? (
              <button
                type="button"
                className="tap-target rounded-xl bg-funeral text-base text-white"
                onClick={() => setPhase("started")}
              >
                業務を開始します
              </button>
            ) : null}
            {phase === "started" ? (
              <>
                <button
                  type="button"
                  className="tap-target rounded-xl bg-funeral text-base text-white"
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
              </>
            ) : null}
          </div>
        ) : (
          <p className="text-base">
            {phase === "done_ok"
              ? "終了報告（問題なし）を記録しました（デモ）。"
              : "終了報告（トラブルあり）を記録しました（デモ）。"}
          </p>
        )}
      </section>

      <a
        href={`tel:${job.emergencyContact.replace(/-/g, "")}`}
        className="tap-target flex items-center justify-center rounded-xl bg-required px-4 text-base font-medium text-white"
      >
        緊急連絡する
      </a>

      <section className="space-y-2 rounded-xl border border-border bg-surface p-4 text-base">
        <h2 className="font-heading text-lg">連絡・メッセージ</h2>
        <p className="text-muted-foreground">
          通常メッセージ／重要変更の送受信UIは次段階で接続します。
        </p>
        <p>担当: {job.contactName}</p>
      </section>

      <Link
        href={`/funeral-company/demo/jobs/${id}/complete`}
        className="text-base text-funeral underline-offset-4 hover:underline"
      >
        完了確認へ
      </Link>
    </DemoShell>
  );
}
