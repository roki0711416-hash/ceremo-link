import Link from "next/link";

import { CeremoHeader } from "@/components/ceremo/header";
import { SoftBackdrop } from "@/components/ceremo/soft-backdrop";

/**
 * Legacy /signup path — redirects users to the branded role selection.
 * Kept so old links keep working.
 */
export default function SignupPage() {
  return (
    <SoftBackdrop>
      <CeremoHeader showBackHref="/" title="新規登録" />
      <main className="page-shell flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
        <h1 className="font-heading text-2xl text-funeral">利用者区分を選択</h1>
        <p className="text-base text-muted-foreground">
          新規登録は利用者区分の選択から進みます。
        </p>
        <Link
          href="/select-role"
          className="tap-target inline-flex items-center justify-center rounded-xl bg-funeral px-6 text-base text-white"
        >
          区分選択へ進む
        </Link>
      </main>
    </SoftBackdrop>
  );
}
