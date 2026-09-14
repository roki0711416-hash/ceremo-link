import Link from "next/link";

import { CeremoHeader } from "@/components/ceremo/header";
import { RoleCard } from "@/components/ceremo/role-card";
import { SoftBackdrop } from "@/components/ceremo/soft-backdrop";
import { brand } from "@/lib/design/tokens";

export default function SelectRolePage() {
  return (
    <SoftBackdrop>
      <CeremoHeader showBackHref="/" title="利用者区分の選択" />
      <main className="page-shell flex flex-1 flex-col justify-center gap-8 py-10 pb-16">
        <div className="space-y-2 text-center">
          <h1 className="font-heading text-3xl font-semibold text-funeral">
            {brand.nameJa}
          </h1>
          <p className="text-base text-muted-foreground">
            ご利用の区分を選んでください。管理者アカウントはここから作成できません。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <RoleCard
            role="funeral"
            href="/signup/funeral-company"
            title="葬儀社の方"
            description="依頼の作成・公開、マッチング状況の確認を行います。"
          />
          <RoleCard
            role="freelancer"
            href="/signup/freelancer"
            title="フリーランスの方"
            description="空き登録と、届いた依頼への回答を行います。"
          />
        </div>

        <p className="text-center text-base text-muted-foreground">
          すでにアカウントをお持ちの方は{" "}
          <Link
            href="/login"
            className="font-medium text-funeral underline-offset-4 hover:underline"
          >
            ログイン
          </Link>
        </p>
      </main>
    </SoftBackdrop>
  );
}
