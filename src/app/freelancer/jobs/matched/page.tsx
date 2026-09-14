import Link from "next/link";
import { redirect } from "next/navigation";

import { FreelancerJobListItem } from "@/components/ceremo/freelancer/job-list-item";
import { FreelancerShell } from "@/components/layout/freelancer-shell";
import { ScreenState } from "@/components/layout/funeral-company-shell";
import { requireRole } from "@/lib/auth/session";
import { JOB_STATUS_LABELS } from "@/lib/constants/jobs";
import { createClient } from "@/lib/supabase/server";

export default async function FreelancerMatchedJobsPage() {
  const profile = await requireRole(["freelancer"]);
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: jobs, error } = await supabase
    .from("job_requests")
    .select("id, status, crematorium_name, work_starts_at, work_ends_at")
    .or(
      `assigned_freelancer_id.eq.${profile.id},freelancer_id.eq.${profile.id}`,
    )
    .in("status", ["assigned", "in_progress", "completion_pending"])
    .order("work_starts_at", { ascending: true });

  return (
    <FreelancerShell
      title="マッチング済み一覧"
      backHref="/freelancer"
      email={profile.email}
      showBottomNav
      bottomNavActive="home"
    >
      {error ? (
        <ScreenState title="取得に失敗しました">
          一覧を表示できませんでした。
        </ScreenState>
      ) : (jobs ?? []).length === 0 ? (
        <ScreenState title="マッチング済みの依頼はありません">
          担当が決定した依頼がここに表示されます。
        </ScreenState>
      ) : (
        <div className="rounded-xl border border-border bg-surface px-4 shadow-sm">
          {(jobs ?? []).map((job) => (
            <FreelancerJobListItem
              key={job.id}
              id={job.id}
              crematoriumName={job.crematorium_name}
              workStartsAt={job.work_starts_at}
              workEndsAt={job.work_ends_at}
              statusLabel={JOB_STATUS_LABELS[job.status] ?? job.status}
              statusTone="default"
            />
          ))}
        </div>
      )}
      <Link
        href="/freelancer"
        className="text-center text-sm text-freelancer underline-offset-2 hover:underline"
      >
        マイページに戻る
      </Link>
    </FreelancerShell>
  );
}
