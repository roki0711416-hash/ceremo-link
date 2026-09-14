import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { CeremoHeader } from "@/components/ceremo/header";
import { SoftBackdrop } from "@/components/ceremo/soft-backdrop";

type DemoShellProps = {
  title: string;
  backHref?: string;
  email?: string | null;
  tone?: "funeral" | "freelancer";
  children: React.ReactNode;
};

export function DemoShell({
  title,
  backHref,
  email,
  children,
}: DemoShellProps) {
  return (
    <SoftBackdrop>
      <CeremoHeader
        title={title}
        showBackHref={backHref}
        rightSlot={
          <div className="flex items-center gap-2">
            {email ? (
              <span className="hidden max-w-[9rem] truncate text-xs text-muted-foreground sm:inline">
                {email}
              </span>
            ) : null}
            <form action={logoutAction}>
              <button
                type="submit"
                className="tap-target rounded-lg px-2 text-sm text-funeral hover:bg-funeral-soft"
              >
                ログアウト
              </button>
            </form>
          </div>
        }
      />
      <main className="page-shell flex flex-1 flex-col gap-6 py-6 pb-24">
        {children}
      </main>
    </SoftBackdrop>
  );
}

export function DemoBanner() {
  return (
    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
      画面デザイン用のダミーデータです。実在施設・個人情報は含みません。
    </p>
  );
}

export function NavLink({
  href,
  children,
  variant = "funeral",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "funeral" | "freelancer" | "outline";
}) {
  const cls =
    variant === "outline"
      ? "border-2 border-funeral bg-white text-funeral"
      : variant === "freelancer"
        ? "bg-freelancer text-white"
        : "bg-funeral text-white";
  return (
    <Link
      href={href}
      className={`tap-target inline-flex w-full items-center justify-center rounded-xl px-4 text-base font-medium ${cls}`}
    >
      {children}
    </Link>
  );
}
