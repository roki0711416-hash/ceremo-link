import Link from "next/link";

import { AppHeader } from "@/components/layout/app-header";
import { buttonVariants } from "@/components/ui/button";
import { JOB_STATUS_LABELS } from "@/lib/constants/jobs";
import { requireFuneralCompany } from "@/lib/auth/funeral-company";
import { formatTokyo, formatYen } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function FuneralCompanyJobsPage() {
  const { profile } = await requireFuneralCompany();

  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("job_requests")
    .select(
      "id, status, crematorium_name, work_starts_at, pay_amount, response_deadline_at",
    )
    .eq("funeral_company_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <AppHeader email={profile.email} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">依頼一覧</h1>
            <p className="text-sm text-muted-foreground">
              条件一致者への一斉通知・先着承諾方式です。
            </p>
          </div>
          <Link
            href="/funeral-company/jobs/new"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            新規依頼
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {(jobs ?? []).length === 0 ? (
            <li className="py-8 text-sm text-muted-foreground">
              まだ依頼がありません。
            </li>
          ) : (
            (jobs ?? []).map((job) => (
              <li key={job.id} className="py-4">
                <Link
                  href={`/funeral-company/jobs/${job.id}`}
                  className="block space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">
                      {job.crematorium_name ?? "火葬場未設定"}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {JOB_STATUS_LABELS[job.status]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatTokyo(job.work_starts_at)} / {formatYen(job.pay_amount)}
                  </p>
                </Link>
              </li>
            ))
          )}
        </ul>
        <Link href="/funeral-company" className="text-sm underline">
          ダッシュボードへ戻る
        </Link>
      </main>
    </>
  );
}
