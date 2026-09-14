import Link from "next/link";
import { Building2, ChevronRight, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

type RoleCardProps = {
  role: "funeral" | "freelancer";
  href: string;
  title: string;
  description: string;
};

export function RoleCard({ role, href, title, description }: RoleCardProps) {
  const isFuneral = role === "funeral";

  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-[220px] flex-col rounded-xl border bg-surface p-6 shadow-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        isFuneral
          ? "border-[#C9C0DD] bg-funeral-soft/60 focus-visible:ring-funeral"
          : "border-[#B7D4C4] bg-freelancer-soft/60 focus-visible:ring-freelancer",
      )}
    >
      <div
        className={cn(
          "mb-4 flex size-14 items-center justify-center rounded-full",
          isFuneral ? "bg-funeral text-white" : "bg-freelancer text-white",
        )}
        aria-hidden
      >
        {isFuneral ? (
          <Building2 className="size-7" />
        ) : (
          <UserRound className="size-7" />
        )}
      </div>
      <h2
        className={cn(
          "font-heading text-2xl font-semibold",
          isFuneral ? "text-funeral" : "text-freelancer",
        )}
      >
        {title}
      </h2>
      <div
        className={cn(
          "my-3 h-px w-full",
          isFuneral ? "bg-[#C9C0DD]" : "bg-[#B7D4C4]",
        )}
      />
      <p className="flex-1 text-base leading-relaxed text-foreground/80">
        {description}
      </p>
      <div className="mt-5 flex justify-end">
        <span
          className={cn(
            "tap-target inline-flex size-12 items-center justify-center rounded-full text-white",
            isFuneral ? "bg-funeral" : "bg-freelancer",
          )}
          aria-hidden
        >
          <ChevronRight className="size-6" />
        </span>
        <span className="sr-only">進む</span>
      </div>
    </Link>
  );
}
