import { logoutAction } from "@/app/actions/auth";
import { LogOut } from "lucide-react";

import { CeremoHeader } from "@/components/ceremo/header";
import { FreelancerMenuButton } from "@/components/ceremo/freelancer/menu-button";
import { SoftBackdrop } from "@/components/ceremo/soft-backdrop";
import {
  FreelancerBottomNav,
} from "@/components/layout/freelancer-bottom-nav";

type FreelancerShellProps = {
  title: string;
  backHref?: string;
  email?: string | null;
  layout?: "default" | "mypage";
  showBottomNav?: boolean;
  bottomNavActive?: "home" | "messages" | "settings";
  children: React.ReactNode;
};

export function FreelancerShell({
  title,
  backHref,
  email,
  layout = "default",
  showBottomNav = false,
  bottomNavActive = "home",
  children,
}: FreelancerShellProps) {
  const header =
    layout === "mypage" ? (
      <header
        className="sticky top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur"
      >
        <div className="page-shell grid min-h-14 grid-cols-[1fr_auto_1fr] items-center gap-2 py-2">
          <div className="flex justify-start">
            <FreelancerMenuButton />
          </div>
          <h1 className="font-heading text-lg font-semibold text-freelancer">
            {title}
          </h1>
          <div className="flex justify-end">
            <form action={logoutAction}>
              <button
                type="submit"
                className="tap-target inline-flex items-center gap-1 rounded-lg px-2 text-sm font-medium text-freelancer hover:bg-freelancer-soft"
              >
                <LogOut className="size-4" aria-hidden />
                <span className="hidden sm:inline">ログアウト</span>
              </button>
            </form>
          </div>
        </div>
      </header>
    ) : (
      <CeremoHeader
        title={title}
        showBackHref={backHref}
        tone="freelancer"
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
                className="tap-target rounded-lg px-2 text-sm text-freelancer hover:bg-freelancer-soft"
              >
                ログアウト
              </button>
            </form>
          </div>
        }
      />
    );

  return (
    <SoftBackdrop>
      {header}
      <main
        className={
          showBottomNav
            ? "page-shell flex flex-1 flex-col gap-6 py-6 pb-28"
            : "page-shell flex flex-1 flex-col gap-6 py-6 pb-24"
        }
      >
        {children}
      </main>
      {showBottomNav ? (
        <FreelancerBottomNav active={bottomNavActive} />
      ) : null}
    </SoftBackdrop>
  );
}
