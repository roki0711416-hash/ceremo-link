import Link from "next/link";
import { notFound } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { JOB_STATUS_LABELS } from "@/lib/constants/jobs";
import { requireFuneralCompany } from "@/lib/auth/funeral-company";
import { formatTokyo, formatYen } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export default async function FuneralCompanyJobDetailPage({ params }: Props) {
  const { id } = await params;
  const { profile } = await requireFuneralCompany();

  const supabase = await createClient();
  const { data: job } = await supabase
    .from("job_requests")
    .select("*")
    .eq("id", id)
    .eq("funeral_company_id", profile.id)
    .maybeSingle();

  if (!job) notFound();

  const [{ data: candidates }, { data: privateDetails }, { data: municipality }, { data: serviceType }] =
    await Promise.all([
      supabase
        .from("job_candidates")
        .select("id, status, freelancer_id, notified_at")
        .eq("job_request_id", id),
      supabase
        .from("job_private_details")
        .select("*")
        .eq("job_request_id", id)
        .maybeSingle(),
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

  const isAssigned = Boolean(job.assigned_freelancer_id);

  return (
    <>
      <AppHeader email={profile.email} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {JOB_STATUS_LABELS[job.status]}
          </p>
          <h1 className="text-2xl font-semibold">
            {job.crematorium_name ?? "依頼詳細"}
          </h1>
        </div>

        <section className="space-y-2 text-sm">
          <h2 className="font-semibold">公開情報</h2>
          <p>実施: {formatTokyo(job.work_starts_at)} 〜 {formatTokyo(job.work_ends_at, "HH:mm")}</p>
          <p>市区町村: {municipality?.name ?? "-"}</p>
          <p>業務: {serviceType?.name ?? "-"}</p>
          <p>報酬: {formatYen(job.pay_amount)} / 交通費: {formatYen(job.travel_expense)}</p>
          <p>回答期限: {formatTokyo(job.response_deadline_at)}</p>
        </section>

        {isAssigned && privateDetails ? (
          <section className="space-y-2 text-sm">
            <h2 className="font-semibold">契約後情報</h2>
            <p>故人名: {privateDetails.deceased_name}</p>
            <p>集合場所: {privateDetails.meetup_location}</p>
            <p>担当者: {privateDetails.company_contact_name}（{privateDetails.company_contact_phone}）</p>
            <p>緊急連絡先: {privateDetails.emergency_contact}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href={`/funeral-company/jobs/${id}/messages`} className="underline">
                連絡
              </Link>
              <Link href={`/funeral-company/jobs/${id}/changes`} className="underline">
                重要変更
              </Link>
              <Link href={`/funeral-company/jobs/${id}/day`} className="underline">
                当日操作
              </Link>
            </div>
          </section>
        ) : (
          <p className="text-sm text-muted-foreground">
            契約成立前のため、候補者には非公開情報は表示されません。
          </p>
        )}

        <section className="space-y-2 text-sm">
          <h2 className="font-semibold">候補者（{candidates?.length ?? 0}名）</h2>
          <ul className="space-y-1 text-muted-foreground">
            {(candidates ?? []).map((c) => (
              <li key={c.id}>
                状態: {c.status} / 通知: {formatTokyo(c.notified_at)}
              </li>
            ))}
          </ul>
        </section>

        <Link href="/funeral-company/jobs" className="text-sm underline">
          一覧へ戻る
        </Link>
      </main>
    </>
  );
}
