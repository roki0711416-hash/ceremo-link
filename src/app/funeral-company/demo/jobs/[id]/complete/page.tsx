import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/ceremo/status-badge";
import { DemoBanner, DemoShell, NavLink } from "@/components/demo/demo-shell";
import { DEMO_ASSIGNED_JOB, formatYenDemo } from "@/lib/demo/data";

type Props = { params: Promise<{ id: string }> };

export default async function DemoCompletePage({ params }: Props) {
  const { id } = await params;
  if (id !== DEMO_ASSIGNED_JOB.id) notFound();
  const job = DEMO_ASSIGNED_JOB;

  return (
    <DemoShell
      title="完了確認"
      backHref={`/funeral-company/demo/jobs/${id}/day`}
    >
      <DemoBanner />
      <StatusBadge label="完了確認待ち" tone="warning" />
      <h1 className="font-heading text-2xl text-funeral">業務完了の確認</h1>
      <p className="text-base text-muted-foreground">
        {job.facilityName} / {job.workDateLabel}
      </p>
      <div className="rounded-xl border border-border bg-surface p-4 text-base">
        <p>
          報酬: {formatYenDemo(job.payAmount)} / 交通費:{" "}
          {formatYenDemo(job.travelExpense)}
        </p>
        <p className="mt-2 text-muted-foreground">
          双方の確認後に完了となります（デモ画面）。
        </p>
      </div>
      <NavLink href="/funeral-company">確認してホームへ</NavLink>
      <Link
        href={`/funeral-company/demo/jobs/${id}`}
        className="text-base text-funeral underline-offset-4 hover:underline"
      >
        案件詳細へ戻る
      </Link>
    </DemoShell>
  );
}
