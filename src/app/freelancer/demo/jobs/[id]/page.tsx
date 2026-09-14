import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/ceremo/status-badge";
import { DemoBanner, DemoShell, NavLink } from "@/components/demo/demo-shell";
import { DEMO_ASSIGNED_JOB, formatYenDemo } from "@/lib/demo/data";

type Props = { params: Promise<{ id: string }> };

export default async function FreelancerDemoJobPage({ params }: Props) {
  const { id } = await params;
  if (id !== DEMO_ASSIGNED_JOB.id) notFound();
  const job = DEMO_ASSIGNED_JOB;

  return (
    <DemoShell title="成立案件詳細" backHref="/freelancer" tone="freelancer">
      <DemoBanner />
      <StatusBadge label="契約成立" tone="freelancer" icon="✓" />
      <h1 className="font-heading text-2xl text-freelancer">{job.facilityName}</h1>
      <section className="space-y-2 rounded-xl border border-border bg-surface p-4 text-base">
        <p>
          {job.workDateLabel} {job.timeRange}
        </p>
        <p>業務: {job.serviceName}</p>
        <p>
          報酬: {formatYenDemo(job.payAmount)} / 交通費:{" "}
          {formatYenDemo(job.travelExpense)}
        </p>
      </section>
      <section className="space-y-2 rounded-xl border border-border bg-surface p-4 text-base">
        <h2 className="font-heading text-lg">契約後に開示</h2>
        <p>故人名: {job.deceasedName}</p>
        <p>集合場所: {job.meetupLocation}</p>
        <p>
          担当: {job.contactName}（{job.contactPhone}）
        </p>
        <p>緊急連絡先: {job.emergencyContact}</p>
        <p>{job.notes}</p>
      </section>
      <div className="grid gap-3">
        <NavLink
          href={`/freelancer/demo/jobs/${id}/precheck`}
          variant="freelancer"
        >
          前日確認へ
        </NavLink>
        <NavLink href={`/freelancer/demo/jobs/${id}/day`} variant="outline">
          当日報告へ
        </NavLink>
        <NavLink href={`/freelancer/demo/jobs/${id}/pay`} variant="outline">
          報酬確認へ
        </NavLink>
      </div>
      <Link
        href="/freelancer"
        className="text-base text-freelancer underline-offset-4 hover:underline"
      >
        ホームへ
      </Link>
    </DemoShell>
  );
}
