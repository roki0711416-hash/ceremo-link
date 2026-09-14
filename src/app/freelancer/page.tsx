import { redirect } from "next/navigation";
import { Handshake, FileText, Info } from "lucide-react";

import { FreelancerDashboardCard } from "@/components/ceremo/freelancer/dashboard-card";
import { FreelancerShell } from "@/components/layout/freelancer-shell";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function FreelancerDashboardPage() {
  const profile = await requireRole(["freelancer"]);
  if (!profile) redirect("/login");

  const supabase = await createClient();

  const { data: freelancer } = await supabase
    .from("freelancers")
    .select("display_name")
    .eq("id", profile.id)
    .maybeSingle();

  const { data: jobs, error: jobsError } = await supabase
    .from("job_requests")
    .select("id, status")
    .or(
      `assigned_freelancer_id.eq.${profile.id},freelancer_id.eq.${profile.id}`,
    );

  const list = jobs ?? [];
  const matchedCount = list.filter((job) =>
    ["assigned", "in_progress", "completion_pending"].includes(job.status),
  ).length;
  const pastCount = list.filter((job) =>
    ["completed", "cancelled", "declined", "expired"].includes(job.status),
  ).length;

  const displayName = freelancer?.display_name ?? "フリーランス";

  return (
    <FreelancerShell
      title="マイページ"
      layout="mypage"
      showBottomNav
      bottomNavActive="home"
      email={profile.email}
    >
      <section className="flex items-center gap-4">
        <div
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-freelancer-soft text-lg font-semibold text-freelancer"
          aria-hidden
        >
          {displayName.slice(0, 1)}
        </div>
        <div className="min-w-0 space-y-1">
          <h2 className="font-heading text-xl font-semibold text-freelancer">
            {displayName} 様
          </h2>
          <p className="text-base text-muted-foreground">
            いつもお仕事ありがとうございます。
          </p>
        </div>
      </section>

      <div className="space-y-3">
        <FreelancerDashboardCard
          href="/freelancer/jobs/matched"
          title="マッチング済み一覧"
          description="担当が決定している依頼です。"
          count={jobsError ? 0 : matchedCount}
          icon={Handshake}
          tone="green"
        />
        <FreelancerDashboardCard
          href="/freelancer/jobs/history"
          title="過去の依頼一覧"
          description="完了・キャンセルされた依頼の履歴です。"
          count={jobsError ? 0 : pastCount}
          icon={FileText}
          tone="freelancer"
        />
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span
            className="flex size-8 items-center justify-center rounded-full bg-freelancer-soft text-freelancer"
            aria-hidden
          >
            <Info className="size-4" />
          </span>
          <h3 className="font-heading text-base font-semibold text-foreground">
            お知らせ
          </h3>
        </div>
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>・新しい依頼がマッチングするとお知らせします。</li>
          <li>・依頼の詳細は「マッチング済み一覧」から確認できます。</li>
        </ul>
      </div>
    </FreelancerShell>
  );
}
