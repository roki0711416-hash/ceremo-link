import type { ReactNode } from "react";
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

type RequestFlowNoticeProps = {
  children: ReactNode;
  className?: string;
};

export function RequestFlowNotice({ children, className }: RequestFlowNoticeProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-relaxed text-sky-950",
        className,
      )}
    >
      <Info className="mt-0.5 size-5 shrink-0 text-sky-600" aria-hidden />
      <div>{children}</div>
    </div>
  );
}
