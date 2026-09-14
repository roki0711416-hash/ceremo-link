import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ClaimJobButton } from "@/components/jobs/job-forms";
import { AppHeader } from "@/components/layout/app-header";
import { markOfferViewedAction } from "@/app/actions/jobs";
import { JOB_STATUS_LABELS } from "@/lib/constants/jobs";
import { requireRole } from "@/lib/auth/session";
import { formatTokyo, formatYen } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export default async function FreelancerOfferDetailPage({ params }: Props) {
  const { id } = await params;
  const profile = await requireRole(["freelancer"]);
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: candidate } = await supabase
    .from("job_candidates")
    .select("status")
    .eq("job_request_id", id)
    .eq("freelancer_id", profile.id)
    .maybeSingle();

  if (!candidate) notFound();

  await markOfferViewedAction(id);

  const { data: job } = await supabase
    .from("job_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!job) notFound();

  const [{ data: municipality }, { data: serviceType }] = await Promise.all([
    supabase
      .from("municipalities")
      .select("name")
      .eq("id", job.municipality_id)
      .maybeSingle(),
    supabase
      .from("service_types")
      .select("name")
      .eq("id", job.service_type_id)
      .maybeSingle(),
  ]);

  const alreadyAssignedToOther =
    job.status === "assigned" && job.assigned_freelancer_id !== profile.id;
  const canClaim =
    job.status === "open" &&
    (candidate.status === "notified" || candidate.status === "viewed");

  return (
    <>
      <AppHeader email={profile.email} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {JOB_STATUS_LABELS[job.status]}
          </p>
          <h1 className="text-2xl font-semibold">{job.crematorium_name}</h1>
        </div>

        <section className="space-y-2 text-sm">
          <h2 className="font-semibold">契約前に確認できる情報</h2>
          <p>実施: {formatTokyo(job.work_starts_at)} 〜 {formatTokyo(job.work_ends_at, "HH:mm")}</p>
          <p>市区町村: {municipality?.name ?? "-"}</p>
          <p>火葬場: {job.crematorium_name}</p>
          <p>業務: {serviceType?.name ?? "-"}</p>
          {job.estimated_duration_minutes ? (
            <p>想定時間: {job.estimated_duration_minutes}分</p>
          ) : null}
          <p>報酬: {formatYen(job.pay_amount)}</p>
          <p>交通費: {formatYen(job.travel_expense)}</p>
          <p>回答期限: {formatTokyo(job.response_deadline_at)}</p>
          <p className="text-muted-foreground">
            故人名・正確な集合場所・担当者連絡先などは、契約成立後に表示されます。
          </p>
        </section>

        {alreadyAssignedToOther ? (
          <p className="rounded-md bg-muted px-3 py-2 text-sm">
            別の方に決まりました
          </p>
        ) : null}

        {job.assigned_freelancer_id === profile.id ? (
          <Link href={`/freelancer/jobs/${id}`} className="text-sm underline">
            契約済みの依頼詳細へ
          </Link>
        ) : null}

        {canClaim ? <ClaimJobButton jobId={id} /> : null}

        <Link href="/freelancer/offers" className="text-sm underline">
          一覧へ戻る
        </Link>
      </main>
    </>
  );
}
