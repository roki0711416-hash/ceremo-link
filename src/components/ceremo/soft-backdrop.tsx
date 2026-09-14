import { cn } from "@/lib/utils";

type SoftBackdropProps = {
  className?: string;
  children: React.ReactNode;
};

/** Abstract calm backdrop (no stock photos / no unverified facility images). */
export function SoftBackdrop({ className, children }: SoftBackdropProps) {
  return (
    <div className={cn("relative flex min-h-0 flex-1 flex-col", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#f3f0f8_0%,_#f7f6fa_45%,_#eef2f0_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(ellipse_at_bottom,_rgba(74,62,127,0.12),_transparent_70%)]"
      />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
