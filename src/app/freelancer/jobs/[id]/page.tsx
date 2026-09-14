import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { JOB_STATUS_LABELS } from "@/lib/constants/jobs";
import { requireRole } from "@/lib/auth/session";
import { formatTokyo, formatYen } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export default async function FreelancerJobDetailPage({ params }: Props) {
  const { id } = await params;
  const profile = await requireRole(["freelancer"]);
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: job } = await supabase
    .from("job_requests")
    .select("*")
    .eq("id", id)
    .eq("assigned_freelancer_id", profile.id)
    .maybeSingle();

  if (!job) notFound();

  const { data: privateDetails } = await supabase
    .from("job_private_details")
    .select("*")
    .eq("job_request_id", id)
    .maybeSingle();

  return (
    <>
      <AppHeader email={profile.email} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {JOB_STATUS_LABELS[job.status]}
          </p>
          <h1 className="text-2xl font-semibold">契約済み依頼</h1>
        </div>

        <section className="space-y-2 text-sm">
          <p>実施: {formatTokyo(job.work_starts_at)}</p>
          <p>火葬場: {job.crematorium_name}</p>
          <p>報酬: {formatYen(job.pay_amount)} / 交通費: {formatYen(job.travel_expense)}</p>
        </section>

        {privateDetails ? (
          <section className="space-y-2 text-sm">
            <h2 className="font-semibold">契約後に開示される情報</h2>
            <p>故人名: {privateDetails.deceased_name}</p>
            <p>集合場所: {privateDetails.meetup_location}</p>
            <p>住所: {privateDetails.exact_address}</p>
            <p>
              担当者: {privateDetails.company_contact_name}（
              {privateDetails.company_contact_phone}）
            </p>
            <p>緊急連絡先: {privateDetails.emergency_contact}</p>
            {privateDetails.detailed_notes ? (
              <p>注意事項: {privateDetails.detailed_notes}</p>
            ) : null}
          </section>
        ) : null}

        <nav className="flex flex-wrap gap-4 text-sm">
          <Link href={`/freelancer/jobs/${id}/messages`} className="underline">
            通常メッセージ
          </Link>
          <Link href={`/freelancer/jobs/${id}/changes`} className="underline">
            重要変更通知
          </Link>
          <Link href={`/freelancer/jobs/${id}/day`} className="underline">
            当日操作
          </Link>
        </nav>

        <Link href="/freelancer/offers" className="text-sm underline">
          届いた依頼へ
        </Link>
      </main>
    </>
  );
}
