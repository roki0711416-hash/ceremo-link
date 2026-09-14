import Link from "next/link";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { JOB_STATUS_LABELS } from "@/lib/constants/jobs";
import { requireRole } from "@/lib/auth/session";
import { formatTokyo, formatYen } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";
import type { JobStatus } from "@/types/database";

export default async function FreelancerOffersPage() {
  const profile = await requireRole(["freelancer"]);
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: candidates } = await supabase
    .from("job_candidates")
    .select("id, status, job_request_id, notified_at")
    .eq("freelancer_id", profile.id)
    .in("status", ["notified", "viewed"])
    .order("notified_at", { ascending: false });

  const jobIds = (candidates ?? []).map((c) => c.job_request_id);
  const { data: jobs } =
    jobIds.length > 0
      ? await supabase
          .from("job_requests")
          .select(
            "id, status, crematorium_name, work_starts_at, pay_amount, response_deadline_at",
          )
          .in("id", jobIds)
      : { data: [] as const };

  const jobMap = new Map((jobs ?? []).map((j) => [j.id, j]));

  return (
    <>
      <AppHeader email={profile.email} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">届いた依頼</h1>
          <p className="text-sm text-muted-foreground">
            条件一致の依頼です。先着1名が契約します。
          </p>
        </div>
        <ul className="divide-y divide-border">
          {(candidates ?? []).length === 0 ? (
            <li className="py-8 text-sm text-muted-foreground">
              現在、受け取れる依頼はありません。
            </li>
          ) : (
            (candidates ?? []).map((c) => {
              const job = jobMap.get(c.job_request_id);
              if (!job) return null;
              return (
                <li key={c.id} className="py-4">
                  <Link
                    href={`/freelancer/offers/${job.id}`}
                    className="block space-y-1"
                  >
                    <div className="flex justify-between gap-2">
                      <p className="font-medium">{job.crematorium_name}</p>
                      <span className="text-xs text-muted-foreground">
                        {JOB_STATUS_LABELS[job.status as JobStatus]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatTokyo(job.work_starts_at)} /{" "}
                      {formatYen(job.pay_amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      回答期限 {formatTokyo(job.response_deadline_at)}
                    </p>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
        <Link href="/freelancer" className="text-sm underline">
          ダッシュボードへ戻る
        </Link>
      </main>
    </>
  );
}
