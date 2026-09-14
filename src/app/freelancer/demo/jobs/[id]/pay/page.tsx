import Link from "next/link";
import { notFound } from "next/navigation";

import { DemoBanner, DemoShell, NavLink } from "@/components/demo/demo-shell";
import { DEMO_ASSIGNED_JOB, formatYenDemo } from "@/lib/demo/data";

type Props = { params: Promise<{ id: string }> };

export default async function PayConfirmPage({ params }: Props) {
  const { id } = await params;
  if (id !== DEMO_ASSIGNED_JOB.id) notFound();
  const job = DEMO_ASSIGNED_JOB;
  const total = job.payAmount + job.travelExpense;

  return (
    <DemoShell
      title="報酬確認"
      backHref={`/freelancer/demo/jobs/${id}`}
      tone="freelancer"
    >
      <DemoBanner />
      <h1 className="font-heading text-2xl text-freelancer">報酬の確認</h1>
      <div className="space-y-2 rounded-xl border border-border bg-surface p-4 text-base">
        <p>案件: {job.facilityName}</p>
        <p>実施日: {job.workDateLabel}</p>
        <p>報酬: {formatYenDemo(job.payAmount)}</p>
        <p>交通費: {formatYenDemo(job.travelExpense)}</p>
        <p className="border-t border-border pt-2 font-medium">
          合計: {formatYenDemo(total)}
        </p>
        <p className="text-sm text-muted-foreground">
          支払いはオフライン精算です。アプリ内決済はありません。
        </p>
      </div>
      <NavLink href="/freelancer" variant="freelancer">
        確認してホームへ
      </NavLink>
      <Link
        href={`/freelancer/demo/jobs/${id}`}
        className="text-base text-freelancer underline-offset-4 hover:underline"
      >
        案件詳細へ
      </Link>
    </DemoShell>
  );
}
