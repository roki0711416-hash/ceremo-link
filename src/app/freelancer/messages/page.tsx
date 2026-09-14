import Link from "next/link";
import { redirect } from "next/navigation";

import { FreelancerShell } from "@/components/layout/freelancer-shell";
import { ScreenState } from "@/components/layout/funeral-company-shell";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function FreelancerMessagesPage() {
  const profile = await requireRole(["freelancer"]);
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: jobs, error } = await supabase
    .from("job_requests")
    .select("id, crematorium_name, status")
    .or(
      `assigned_freelancer_id.eq.${profile.id},freelancer_id.eq.${profile.id}`,
    )
    .in("status", ["assigned", "in_progress", "completion_pending"])
    .order("work_starts_at", { ascending: false })
    .limit(20);

  return (
    <FreelancerShell
      title="メッセージ"
      backHref="/freelancer"
      email={profile.email}
      showBottomNav
      bottomNavActive="messages"
    >
      <p className="text-base text-muted-foreground">
        契約成立後の案件ごとにメッセージのやり取りができます。
      </p>
      {error ? (
        <ScreenState title="取得に失敗しました">
          メッセージ一覧を表示できませんでした。
        </ScreenState>
      ) : (jobs ?? []).length === 0 ? (
        <ScreenState title="メッセージはありません">
          マッチング済みの案件があると、ここからメッセージ画面へ進めます。
        </ScreenState>
      ) : (
        <ul className="space-y-3">
          {(jobs ?? []).map((job) => (
            <li key={job.id}>
              <Link
                href={`/freelancer/jobs/${job.id}/messages`}
                className="tap-target block rounded-xl border border-border bg-surface p-4 shadow-sm"
              >
                <p className="font-medium text-foreground">
                  {job.crematorium_name ?? "火葬場未設定"}
                </p>
                <p className="text-sm text-muted-foreground">メッセージを開く</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </FreelancerShell>
  );
}
