import Link from "next/link";

import { LoginForm } from "@/components/auth/auth-forms";
import { CeremoHeader } from "@/components/ceremo/header";
import { SoftBackdrop } from "@/components/ceremo/soft-backdrop";
import { brand } from "@/lib/design/tokens";

export default function LoginPage() {
  return (
    <SoftBackdrop>
      <CeremoHeader showBackHref="/" />
      <main className="page-shell flex flex-1 flex-col justify-center py-10 pb-16">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="font-heading text-3xl font-semibold text-funeral">
              {brand.nameJa}
            </h1>
            <p className="text-base text-muted-foreground">{brand.tagline}</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="mb-6 text-center font-heading text-2xl text-foreground">
              ログイン
            </h2>
            <LoginForm />
          </div>

          <div className="relative py-2 text-center">
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            <span className="relative bg-background px-3 text-sm text-muted-foreground">
              または
            </span>
          </div>

          <Link
            href="/select-role"
            className="tap-target inline-flex w-full items-center justify-center rounded-xl border-2 border-funeral bg-white px-4 text-base font-medium text-funeral"
          >
            新規登録はこちら
          </Link>
        </div>
      </main>
    </SoftBackdrop>
  );
}
