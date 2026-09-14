import Link from "next/link";

import { CeremoHeader } from "@/components/ceremo/header";
import { RoleCard } from "@/components/ceremo/role-card";
import { SoftBackdrop } from "@/components/ceremo/soft-backdrop";
import { brand } from "@/lib/design/tokens";

export default function HomePage() {
  return (
    <SoftBackdrop>
      <CeremoHeader
        variant="transparent"
        rightSlot={
          <Link
            href="/login"
            className="tap-target inline-flex items-center rounded-lg px-3 text-base font-medium text-funeral hover:bg-funeral-soft"
          >
            ログイン
          </Link>
        }
      />
      <main className="page-shell flex flex-1 flex-col justify-center gap-8 py-10 pb-16">
        <div className="space-y-3 text-center sm:text-left">
          <p className="text-sm font-medium tracking-[0.18em] text-muted-foreground">
            {brand.nameEn}
          </p>
          <h1 className="font-heading text-4xl font-semibold text-funeral sm:text-5xl">
            {brand.nameJa}
          </h1>
          <p className="text-lg leading-relaxed text-foreground/85">
            {brand.tagline}
          </p>
          <p className="text-base text-muted-foreground">
            神奈川県内の葬儀社と、経験のあるフリーランスをつなぐサービスです。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <RoleCard
            role="funeral"
            href="/signup/funeral-company"
            title="葬儀社の方"
            description="火葬場を選び、条件に合うスタッフへ依頼を公開できます。"
          />
          <RoleCard
            role="freelancer"
            href="/signup/freelancer"
            title="フリーランスの方"
            description="空き日時を登録し、条件に合う依頼を先着で受けられます。"
          />
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <Link
            href="/select-role"
            className="tap-target inline-flex items-center justify-center text-base text-funeral underline-offset-4 hover:underline"
          >
            利用者区分の選択へ
          </Link>
          <p className="text-sm text-muted-foreground">
            対象地域は神奈川県のみ（Asia/Tokyo・日本円）
          </p>
        </div>
      </main>
    </SoftBackdrop>
  );
}
