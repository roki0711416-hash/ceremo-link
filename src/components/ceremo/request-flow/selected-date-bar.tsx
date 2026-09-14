import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

import { cn } from "@/lib/utils";

type SelectedDateBarProps = {
  workDate: string;
  changeHref: string;
  tone?: "funeral" | "freelancer";
};

export function SelectedDateBar({
  workDate,
  changeHref,
  tone = "funeral",
}: SelectedDateBarProps) {
  const dateLabel = format(new Date(`${workDate}T00:00:00`), "yyyy年M月d日 (EEE)", {
    locale: ja,
  });
  const outline =
    tone === "funeral"
      ? "border-funeral text-funeral"
      : "border-freelancer text-freelancer";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-sm">
      <div>
        <p className="text-sm text-muted-foreground">選択した日付</p>
        <p className="font-heading text-lg font-semibold text-foreground">
          {dateLabel}
        </p>
      </div>
      <Link
        href={changeHref}
        className={cn(
          "tap-target shrink-0 rounded-lg border-2 bg-white px-3 py-2 text-sm font-medium",
          outline,
        )}
      >
        日付を変更
      </Link>
    </div>
  );
}
