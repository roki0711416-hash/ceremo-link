"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type ComingSoonButtonProps = {
  label: string;
  className?: string;
  variant?: "funeral" | "outline";
};

export function ComingSoonButton({
  label,
  className,
  variant = "funeral",
}: ComingSoonButtonProps) {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setMessage("次の開発段階で追加予定")}
        className={cn(
          "tap-target inline-flex w-full items-center justify-center rounded-xl px-4 text-base font-medium",
          variant === "outline"
            ? "border-2 border-funeral bg-white text-funeral"
            : "bg-funeral text-white",
          className,
        )}
      >
        {label}
      </button>
      {message ? (
        <p role="status" className="text-base text-funeral">
          {message}
        </p>
      ) : null}
    </div>
  );
}
