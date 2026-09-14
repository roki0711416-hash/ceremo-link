import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type JobListItemProps = {
  id: string;
  crematoriumName: string | null;
  workStartsAt: string;
  workEndsAt: string;
  statusLabel: string;
  statusTone?: "completed" | "cancelled" | "default";
};

export function FreelancerJobListItem({
  id,
  crematoriumName,
  workStartsAt,
  workEndsAt,
  statusLabel,
  statusTone = "default",
}: JobListItemProps) {
  const start = new Date(workStartsAt);
  const end = new Date(workEndsAt);
  const dateLabel = format(start, "yyyy/MM/dd（EEE）", { locale: ja });
  const timeLabel = `${format(start, "HH:mm")} 〜 ${format(end, "HH:mm")}`;

  const badgeClass = {
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-red-50 text-required",
    default: "bg-freelancer-soft text-freelancer",
  }[statusTone];

  return (
    <Link
      href={`/freelancer/jobs/${id}`}
      className="tap-target flex items-center gap-3 border-b border-border py-4 last:border-b-0"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm text-muted-foreground">{dateLabel}</p>
        <p className="font-heading text-lg font-semibold text-foreground">
          {crematoriumName ?? "火葬場未設定"}
        </p>
        <p className="text-sm text-muted-foreground">{timeLabel}</p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-3 py-1 text-sm font-medium",
          badgeClass,
        )}
      >
        {statusLabel}
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}
