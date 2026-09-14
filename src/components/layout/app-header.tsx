import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppHeaderProps = {
  title?: string;
  email?: string | null;
  showAuthLinks?: boolean;
};

export function AppHeader({
  title = "セレモリンク",
  email,
  showAuthLinks = false,
}: AppHeaderProps) {
  return (
    <header className="border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="text-base font-semibold tracking-tight">
          {title}
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {email ? <span className="text-muted-foreground">{email}</span> : null}
          {email ? (
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                ログアウト
              </Button>
            </form>
          ) : null}
          {showAuthLinks ? (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                ログイン
              </Link>
              <Link
                href="/signup"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                新規登録
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
