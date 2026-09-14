import { redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export default async function AdminDashboardPage() {
  const profile = await requireRole(["admin"]);
  if (!profile) redirect("/login");

  return (
    <>
      <AppHeader email={profile.email} />
      <DashboardShell
        heading="運営管理"
        description="管理者ダッシュボードの枠組みです。審査画面は今後実装します。"
      >
        <p>1. フリーランスの本人確認・審査（未実装）</p>
        <p>2. 葬儀社の審査（未実装）</p>
        <p>3. 依頼監視・監査ログ閲覧（未実装）</p>
        <p className="pt-2 text-xs">
          管理者アカウントはシードまたは手動発行のみです。新規登録からは作成できません。
        </p>
      </DashboardShell>
    </>
  );
}
