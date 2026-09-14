import Link from "next/link";

import { cn } from "@/lib/utils";

type FormActionsProps = {
  backHref?: string;
  backLabel?: string;
  primaryLabel: string;
  primaryPendingLabel?: string;
  pending?: boolean;
  primaryType?: "submit" | "button";
  onPrimaryClick?: () => void;
  tone?: "funeral" | "freelancer";
  className?: string;
};

export function FormActions({
  backHref,
  backLabel = "戻る",
  primaryLabel,
  primaryPendingLabel,
  pending,
  primaryType = "submit",
  onPrimaryClick,
  tone = "funeral",
  className,
}: FormActionsProps) {
  const backBorder =
    tone === "freelancer" ? "border-freelancer text-freelancer" : "border-funeral text-funeral";
  const primaryBg =
    tone === "freelancer" ? "bg-freelancer" : "bg-funeral";

  return (
    <div
      className={cn(
        "sticky bottom-0 -mx-4 mt-8 border-t border-border bg-surface/95 px-4 py-4 backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row">
        {backHref ? (
          <Link
            href={backHref}
            className={cn(
              "tap-target inline-flex flex-1 items-center justify-center rounded-xl border-2 bg-white px-4 text-base font-medium",
              backBorder,
            )}
          >
            {backLabel}
          </Link>
        ) : null}
        <button
          type={primaryType}
          disabled={pending}
          onClick={onPrimaryClick}
          className={cn(
            "tap-target inline-flex flex-[1.4] items-center justify-center rounded-xl px-4 text-base font-medium text-white disabled:opacity-60",
            primaryBg,
          )}
        >
          {pending ? (primaryPendingLabel ?? "処理中…") : primaryLabel}
        </button>
      </div>
    </div>
  );
}
