import Image from "next/image";
import Link from "next/link";
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

export type FacilityCardData = {
  id: string;
  name: string;
  area: string;
  address: string;
  imageSrc?: string;
  detailHref?: string;
  selectHref?: string;
  selectLabel?: string;
  placeholderLabel?: string;
};

type FacilityCardProps = {
  facility: FacilityCardData;
  className?: string;
};

/** Dummy-friendly facility card. Real facility data comes later. */
export function FacilityCard({ facility, className }: FacilityCardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-surface p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-muted">
          {facility.imageSrc ? (
            <Image
              src={facility.imageSrc}
              alt=""
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
              {facility.placeholderLabel ?? "仮画像"}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-heading text-lg font-semibold text-funeral">
            {facility.name}
          </h3>
          <p className="text-sm text-muted-foreground">{facility.area}</p>
          <p className="text-base text-foreground/80">{facility.address}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {facility.detailHref ? (
          <Link
            href={facility.detailHref}
            className="tap-target inline-flex items-center gap-1 rounded-lg border border-funeral px-3 text-base text-funeral"
          >
            <Info className="size-4" aria-hidden />
            施設詳細
          </Link>
        ) : null}
        {facility.selectHref ? (
          <Link
            href={facility.selectHref}
            className="tap-target inline-flex items-center justify-center rounded-lg bg-funeral px-4 text-base text-white"
          >
            {facility.selectLabel ?? "対応状況を見る"}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
