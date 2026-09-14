import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  label: string;
  tone?: "neutral" | "funeral" | "freelancer" | "warning" | "danger";
  icon?: string;
  className?: string;
};

const toneClass = {
  neutral: "bg-muted text-foreground",
  funeral: "bg-funeral-soft text-funeral",
  freelancer: "bg-freelancer-soft text-freelancer",
  warning: "bg-amber-50 text-amber-900",
  danger: "bg-red-50 text-required",
} as const;

/** Status with text (+ optional symbol). Do not rely on color alone. */
export function StatusBadge({
  label,
  tone = "neutral",
  icon,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-sm font-medium",
        toneClass[tone],
        className,
      )}
    >
      {icon ? <span aria-hidden>{icon}</span> : null}
      <span>{label}</span>
    </span>
  );
}

export function RequiredMark() {
  return (
    <span className="ml-1 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium text-white bg-required">
      必須
    </span>
  );
}
