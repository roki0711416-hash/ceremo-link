import { cn } from "@/lib/utils";

export type StepItem = {
  id: string;
  label: string;
};

type StepIndicatorProps = {
  steps: StepItem[];
  currentStepId: string;
  tone?: "funeral" | "freelancer";
  className?: string;
};

export function StepIndicator({
  steps,
  currentStepId,
  tone = "funeral",
  className,
}: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStepId);
  const activeBg =
    tone === "freelancer" ? "bg-freelancer" : "bg-funeral";
  const activeText =
    tone === "freelancer" ? "text-freelancer" : "text-funeral";
  const lineBg =
    tone === "freelancer" ? "bg-freelancer/40" : "bg-funeral/40";

  return (
    <nav aria-label="入力ステップ" className={cn("w-full", className)}>
      <ol className="flex items-center justify-between gap-1">
        {steps.map((step, index) => {
          const done = index < currentIndex;
          const current = index === currentIndex;
          const isLast = index === steps.length - 1;
          return (
            <li
              key={step.id}
              className="flex min-w-0 flex-1 items-center"
            >
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full text-sm font-semibold",
                    current && `${activeBg} text-white shadow-sm`,
                    done && `${activeBg} text-white`,
                    !current && !done && "bg-muted text-muted-foreground",
                  )}
                  aria-current={current ? "step" : undefined}
                >
                  {index + 1}
                </span>
                <span
                  className={cn(
                    "line-clamp-2 text-xs sm:text-sm",
                    current ? `font-semibold ${activeText}` : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast ? (
                <div
                  className={cn(
                    "mx-1 hidden h-0.5 flex-1 sm:block",
                    index < currentIndex ? activeBg : lineBg,
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
