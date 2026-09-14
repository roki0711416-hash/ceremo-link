import Link from "next/link";

import { FuneralCompanySignupForm } from "@/components/auth/auth-forms";
import { CeremoHeader } from "@/components/ceremo/header";
import { SoftBackdrop } from "@/components/ceremo/soft-backdrop";
import { brand } from "@/lib/design/tokens";

export default function FuneralCompanySignupPage() {
  return (
    <SoftBackdrop>
      <CeremoHeader showBackHref="/select-role" title="葬儀社登録" />
      <main className="page-shell flex flex-1 flex-col justify-center py-10 pb-16">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="font-heading text-3xl font-semibold text-funeral">
              {brand.nameJa}
            </h1>
            <p className="text-base text-muted-foreground">
              葬儀社として新規登録します
            </p>
          </div>
          <div className="rounded-xl border border-[#C9C0DD] bg-surface p-6 shadow-sm">
            <FuneralCompanySignupForm />
          </div>
          <p className="text-center text-base text-muted-foreground">
            <Link
              href="/select-role"
              className="text-funeral underline-offset-4 hover:underline"
            >
              区分選択に戻る
            </Link>
          </p>
        </div>
      </main>
    </SoftBackdrop>
  );
}
