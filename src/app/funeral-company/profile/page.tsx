import { requireFuneralCompany } from "@/lib/auth/funeral-company";
import { FuneralCompanyProfileForm } from "@/app/funeral-company/profile/profile-form";
import { FuneralCompanyShell } from "@/components/layout/funeral-company-shell";
import { createClient } from "@/lib/supabase/server";

const statusLabels = {
  pending: "審査待ち",
  approved: "承認済み",
  rejected: "却下",
} as const;

export default async function FuneralCompanyProfilePage() {
  const { profile, company } = await requireFuneralCompany({
    allowIncomplete: true,
  });

  const supabase = await createClient();
  const { data: municipalities, error } = await supabase
    .from("municipalities")
    .select("id, name")
    .order("code");

  const status = company?.verification_status ?? "pending";

  return (
    <FuneralCompanyShell
      title="葬儀社プロフィール"
      backHref={company?.profile_completed_at ? "/funeral-company" : undefined}
      email={profile.email}
    >
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold text-funeral">
          {company?.profile_completed_at
            ? "会社情報の編集"
            : "葬儀社プロフィール登録"}
        </h1>
        <p className="text-base text-muted-foreground">
          神奈川県内の事業所情報を登録してください。審査状態は管理者のみが変更します。
        </p>
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-base text-required">
          市区町村一覧を取得できませんでした。時間をおいて再度お試しください。
        </p>
      ) : (
        <FuneralCompanyProfileForm
          company={company}
          municipalities={municipalities ?? []}
          verificationLabel={statusLabels[status]}
        />
      )}
    </FuneralCompanyShell>
  );
}
