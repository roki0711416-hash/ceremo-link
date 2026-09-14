import { logoutAction } from "@/app/actions/auth";
import { CeremoHeader } from "@/components/ceremo/header";
import { SoftBackdrop } from "@/components/ceremo/soft-backdrop";

type FuneralCompanyShellProps = {
  title: string;
  backHref?: string;
  email?: string | null;
  children: React.ReactNode;
};

export function FuneralCompanyShell({
  title,
  backHref,
  email,
  children,
}: FuneralCompanyShellProps) {
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

export function ScreenState({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className="rounded-xl border border-border bg-surface px-4 py-8 text-center"
    >
      <p className="font-heading text-lg text-funeral">{title}</p>
      <p className="mt-2 text-base text-muted-foreground">{children}</p>
    </div>
  );
}
