import Link from "next/link";
import { redirect } from "next/navigation";

import { FreelancerShell } from "@/components/layout/freelancer-shell";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const statusLabels = {
  pending: "審査待ち",
  approved: "承認済み",
  rejected: "却下",
} as const;

export default async function FreelancerSettingsPage() {
  const profile = await requireRole(["freelancer"]);
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: freelancer } = await supabase
    .from("freelancers")
    .select("display_name, verification_status")
    .eq("id", profile.id)
    .maybeSingle();

  const status = freelancer?.verification_status ?? "pending";

  return (
    <FreelancerShell
      title="設定"
      backHref="/freelancer"
      email={profile.email}
      showBottomNav
      bottomNavActive="settings"
    >
      <div className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div>
          <p className="text-sm text-muted-foreground">表示名</p>
          <p className="text-base font-medium">
            {freelancer?.display_name ?? "未設定"}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">メールアドレス</p>
          <p className="text-base font-medium">{profile.email}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">審査状態</p>
          <p className="text-base font-medium">{statusLabels[status]}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          href="/freelancer/map"
          className="tap-target flex w-full items-center justify-center rounded-xl border-2 border-freelancer bg-white px-4 py-3 text-base font-medium text-freelancer"
        >
          火葬場マップ
        </Link>
        <Link
          href="/freelancer/availability"
          className="tap-target flex w-full items-center justify-center rounded-xl border-2 border-freelancer bg-white px-4 py-3 text-base font-medium text-freelancer"
        >
          対応可能日時の登録
        </Link>
        <Link
          href="/freelancer/offers"
          className="tap-target flex w-full items-center justify-center rounded-xl border-2 border-freelancer bg-white px-4 py-3 text-base font-medium text-freelancer"
        >
          届いた依頼一覧
        </Link>
      </div>
    </FreelancerShell>
  );
}
