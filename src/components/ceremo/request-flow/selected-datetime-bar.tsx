import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

import { cn } from "@/lib/utils";

type SelectedDatetimeBarProps = {
  workDate: string;
  startTime: string;
  endTime: string;
  changeHref: string;
  tone?: "funeral" | "freelancer";
};

export function SelectedDatetimeBar({
  workDate,
  startTime,
  endTime,
  changeHref,
  tone = "funeral",
}: SelectedDatetimeBarProps) {
  const dateLabel = format(new Date(`${workDate}T00:00:00`), "yyyy年M月d日（EEE）", {
    locale: ja,
  });
  const outline =
    tone === "funeral"
      ? "border-funeral text-funeral"
      : "border-freelancer text-freelancer";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-sm">
      <div>
        <p className="text-sm text-muted-foreground">選択した日時</p>
        <p className="font-heading text-lg font-semibold text-foreground">
          {dateLabel}
          <span className="ml-2 text-base font-medium text-foreground">
            {startTime} 〜 {endTime}
          </span>
        </p>
      </div>
      <Link
        href={changeHref}
        className={cn(
          "tap-target shrink-0 rounded-lg border-2 bg-white px-3 py-2 text-sm font-medium",
          outline,
        )}
      >
        日時を変更
      </Link>
    </div>
  );
}
