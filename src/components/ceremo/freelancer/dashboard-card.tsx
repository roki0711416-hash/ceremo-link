import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type FreelancerDashboardCardProps = {
  href: string;
  title: string;
  description: string;
  count: number;
  icon: LucideIcon;
  tone: "green" | "freelancer";
};

const toneStyles = {
  green: {
    icon: "bg-emerald-100 text-emerald-600",
    count: "text-emerald-600",
    title: "text-emerald-700",
  },
  freelancer: {
    icon: "bg-freelancer-soft text-freelancer",
    count: "text-freelancer",
    title: "text-freelancer",
  },
};

export function FreelancerDashboardCard({
  href,
  title,
  description,
  count,
  icon: Icon,
  tone,
}: FreelancerDashboardCardProps) {
  const styles = toneStyles[tone];

  return (
    <Link
      href={href}
      className="tap-target flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-freelancer/30"
    >
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full",
          styles.icon,
        )}
      >
        <Icon className="size-6" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("font-heading text-base font-semibold", styles.title)}>
          {title}
        </p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className={cn("text-2xl font-bold tabular-nums", styles.count)}>
          {count}
        </span>
        <span className="text-sm text-muted-foreground">件</span>
        <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
      </div>
    </Link>
  );
}
