import { RequiredMark } from "@/components/ceremo/status-badge";
import {
  FAREWELL_TYPE_OPTIONS,
  type FarewellType,
} from "@/lib/constants/request-flow";
import { cn } from "@/lib/utils";

type FarewellTypeCardsProps = {
  value?: FarewellType;
  onChange: (value: FarewellType) => void;
};

export function FarewellTypeCards({ value, onChange }: FarewellTypeCardsProps) {
  return (
    <div className="space-y-3">
      <p className="text-base font-semibold text-foreground">
        希望内容
        <RequiredMark />
      </p>
      <div className="space-y-3">
        {FAREWELL_TYPE_OPTIONS.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={cn(
                "tap-target w-full rounded-xl border-2 p-4 text-left transition-colors",
                selected
                  ? "border-funeral bg-funeral-soft"
                  : "border-border bg-surface hover:border-funeral/40",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                    selected
                      ? "border-funeral bg-funeral"
                      : "border-muted-foreground bg-white",
                  )}
                >
                  {selected ? (
                    <span className="size-2 rounded-full bg-white" />
                  ) : null}
                </span>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">
                    {opt.label}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {opt.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
