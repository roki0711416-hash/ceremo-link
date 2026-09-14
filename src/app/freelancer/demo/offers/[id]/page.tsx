"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { DemoBanner, DemoShell } from "@/components/demo/demo-shell";
import { DEMO_OFFERS, formatYenDemo } from "@/lib/demo/data";

export default function DemoOfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const offer = DEMO_OFFERS.find((o) => o.id === id);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!offer) {
    return (
      <DemoShell title="依頼詳細" backHref="/freelancer/demo/offers">
        <p>依頼が見つかりません。</p>
      </DemoShell>
    );
  }

  return (
    <DemoShell
      title="依頼詳細・受諾"
      backHref="/freelancer/demo/offers"
      tone="freelancer"
    >
      <DemoBanner />
      <h1 className="font-heading text-2xl text-freelancer">
        {offer.facilityName}
      </h1>
      <section className="space-y-2 rounded-xl border border-border bg-surface p-4 text-base">
        <h2 className="font-heading text-lg">契約前に確認できる情報</h2>
        <p>
          実施: {offer.workDateLabel} {offer.timeRange}
        </p>
        <p>市区町村: {offer.municipality}</p>
        <p>火葬場: {offer.facilityName}</p>
        <p>業務: {offer.serviceName}</p>
        <p>報酬: {formatYenDemo(offer.payAmount)}</p>
        <p>交通費: {formatYenDemo(offer.travelExpense)}</p>
        <p>回答期限: {offer.deadlineLabel}</p>
        <p className="text-sm text-muted-foreground">
          故人名・正確な集合場所・担当者連絡先は契約成立後に表示されます。
        </p>
      </section>

      {message ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-base">{message}</p>
      ) : null}

      <button
        type="button"
        disabled={busy}
        className="tap-target w-full rounded-xl bg-freelancer text-base font-medium text-white disabled:opacity-60"
        onClick={() => {
          setBusy(true);
          // Demo: always succeed as first claimer
          setTimeout(() => {
            router.push("/freelancer/demo/jobs/job-assigned-1");
          }, 400);
        }}
      >
        {busy ? "処理中…" : "この依頼を受ける"}
      </button>
      <button
        type="button"
        className="tap-target w-full rounded-xl border-2 border-muted-foreground/30 text-base"
        onClick={() => setMessage("別の方に決まりました（デモ表示）")}
      >
        「別の方に決まりました」表示を試す
      </button>
      <Link
        href="/freelancer/demo/offers"
        className="text-base text-freelancer underline-offset-4 hover:underline"
      >
        一覧へ戻る
      </Link>
    </DemoShell>
  );
}
