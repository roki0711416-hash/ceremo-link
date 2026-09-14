import Link from "next/link";

import { cn } from "@/lib/utils";

type FacilityBookingHeaderProps = {
  name: string;
  address: string;
  municipalityName?: string;
  detailHref: string;
  tone?: "funeral" | "freelancer";
};

export function FacilityBookingHeader({
  name,
  address,
  municipalityName,
  detailHref,
  tone = "funeral",
}: FacilityBookingHeaderProps) {
  const accent = tone === "funeral" ? "text-funeral" : "text-freelancer";
  const soft = tone === "funeral" ? "bg-funeral-soft" : "bg-freelancer-soft";
  const btn =
    tone === "funeral"
      ? "bg-funeral text-white"
      : "bg-freelancer text-white";

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div
        className={cn(
          "flex size-16 shrink-0 items-center justify-center rounded-full text-sm font-medium",
          soft,
          accent,
        )}
      >
        斎場
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          {name}
        </h2>
        {municipalityName ? (
          <p className="text-sm text-muted-foreground">{municipalityName}</p>
        ) : null}
        <p className="text-base leading-snug">{address}</p>
        <Link
          href={detailHref}
          className={cn(
            "tap-target mt-2 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
            btn,
          )}
        >
          斎場詳細情報
        </Link>
      </div>
    </div>
  );
}
