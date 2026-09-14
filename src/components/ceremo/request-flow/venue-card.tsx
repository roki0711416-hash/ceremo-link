import Link from "next/link";
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

type RequestVenueCardProps = {
  name: string;
  address: string;
  municipalityName?: string;
  phone?: string | null;
  detailHref: string;
  tone?: "funeral" | "freelancer";
};

export function RequestVenueCard({
  name,
  address,
  municipalityName,
  phone,
  detailHref,
  tone = "funeral",
}: RequestVenueCardProps) {
  const soft = tone === "funeral" ? "bg-funeral-soft" : "bg-freelancer-soft";
  const accent = tone === "funeral" ? "text-funeral" : "text-freelancer";
  const outline =
    tone === "funeral"
      ? "border-funeral text-funeral"
      : "border-freelancer text-freelancer";

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div
        className={cn(
          "flex size-20 shrink-0 items-center justify-center rounded-lg text-sm font-medium",
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
        <p className="text-base leading-snug text-foreground">{address}</p>
        {phone ? (
          <p className="text-base text-muted-foreground">{phone}</p>
        ) : null}
        <Link
          href={detailHref}
          className={cn(
            "tap-target mt-2 inline-flex items-center gap-1.5 rounded-lg border-2 bg-white px-3 py-2 text-sm font-medium",
            outline,
          )}
        >
          <Info className="size-4" aria-hidden />
          施設詳細
        </Link>
      </div>
    </div>
  );
}
