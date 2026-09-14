import Link from "next/link";

import { brand } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

type CeremoHeaderProps = {
  title?: string;
  showBackHref?: string;
  rightSlot?: React.ReactNode;
  variant?: "transparent" | "solid";
  tone?: "funeral" | "freelancer";
};

export function CeremoHeader({
  title,
  showBackHref,
  rightSlot,
  variant = "solid",
  tone = "funeral",
}: CeremoHeaderProps) {
  const toneCls =
    tone === "freelancer"
      ? "text-freelancer hover:bg-freelancer-soft"
      : "text-funeral hover:bg-funeral-soft";
  const brandCls =
    tone === "freelancer" ? "text-freelancer" : "text-funeral";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b",
        variant === "solid"
          ? "border-border bg-surface/95 backdrop-blur"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="page-shell flex min-h-14 items-center justify-between gap-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          {showBackHref ? (
            <Link
              href={showBackHref}
              className={cn(
                "tap-target inline-flex items-center justify-center rounded-lg px-2 text-base",
                toneCls,
              )}
              aria-label="戻る"
            >
              ←
            </Link>
          ) : null}
          <div className="min-w-0">
            {title ? (
              <p className="truncate text-base font-medium text-foreground">
                {title}
              </p>
            ) : (
              <Link href="/" className="block">
                <span className={cn("font-heading text-lg font-semibold", brandCls)}>
                  {brand.nameJa}
                </span>
                <span className="ml-2 text-xs tracking-wide text-muted-foreground">
                  {brand.nameEn}
                </span>
              </Link>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">{rightSlot}</div>
      </div>
    </header>
  );
}
