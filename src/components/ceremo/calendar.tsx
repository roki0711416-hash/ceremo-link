"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type CalendarDay = {
  date: string;
  label: string;
  inMonth: boolean;
  selected?: boolean;
  disabled?: boolean;
  marked?: "registered" | "selecting" | "contracted" | "closed";
  statusSymbol?: "◎" | "○" | "△" | "×" | "—" | null;
  statusText?: string;
};

type CeremoCalendarProps = {
  monthLabel: string;
  weekdays?: string[];
  days: CalendarDay[];
  onSelectDate?: (date: string) => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  tone?: "funeral" | "freelancer";
  className?: string;
};

export function CeremoCalendar({
  monthLabel,
  weekdays = ["日", "月", "火", "水", "木", "金", "土"],
  days,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  tone = "funeral",
  className,
}: CeremoCalendarProps) {
  const selectedClass =
    tone === "funeral"
      ? "bg-funeral text-white shadow-sm"
      : "bg-freelancer text-white shadow-sm";
  const ringClass =
    tone === "funeral" ? "ring-funeral/30" : "ring-freelancer/30";

  return (
    <div
      className={cn(
        "space-y-3 rounded-xl border border-border bg-surface p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="前の月"
          onClick={onPrevMonth}
          disabled={!onPrevMonth}
          className="tap-target rounded-lg border border-border px-3 py-2 text-base disabled:opacity-40"
        >
          ◀
        </button>
        <p
          className={cn(
            "font-heading text-lg font-semibold",
            tone === "funeral" ? "text-funeral" : "text-freelancer",
          )}
        >
          {monthLabel}
        </p>
        <button
          type="button"
          aria-label="次の月"
          onClick={onNextMonth}
          disabled={!onNextMonth}
          className="tap-target rounded-lg border border-border px-3 py-2 text-base disabled:opacity-40"
        >
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-sm">
        {weekdays.map((d, i) => (
          <div
            key={d}
            className={cn(
              "py-2 font-medium",
              i === 0 && "text-required",
              i === 6 && "text-blue-700",
            )}
          >
            {d}
          </div>
        ))}
        {days.map((day) => {
          if (!day.inMonth) {
            return (
              <div
                key={day.date}
                className="min-h-[3.25rem] rounded-xl bg-transparent"
                aria-hidden
              />
            );
          }

          const clickable = onSelectDate && !day.disabled;

          return (
            <button
              key={day.date}
              type="button"
              disabled={!clickable}
              aria-label={
                day.statusText
                  ? `${day.label}日 ${day.statusText}`
                  : `${day.label}日`
              }
              aria-pressed={day.selected}
              onClick={() => onSelectDate?.(day.date)}
              className={cn(
                "tap-target relative flex min-h-[3.25rem] flex-col items-center justify-center rounded-xl border border-border/50 p-1 text-sm transition",
                !day.selected && day.marked === "registered" && "bg-freelancer-soft",
                !day.selected && day.marked === "contracted" && "bg-amber-50",
                !day.selected && day.marked === "closed" && "bg-rose-50",
                !day.selected && !day.marked && "bg-white",
                day.selected && selectedClass,
                day.selected && "ring-2 ring-offset-1",
                day.selected && ringClass,
                clickable && !day.selected && "hover:bg-muted/60",
                day.disabled && "opacity-40",
              )}
            >
              <span className="font-medium leading-none">{day.label}</span>
              {day.selected ? (
                <Check className="mt-0.5 size-3.5" strokeWidth={3} aria-hidden />
              ) : day.statusSymbol ? (
                <span
                  className="mt-0.5 text-xs leading-none opacity-80"
                  aria-hidden
                >
                  {day.statusSymbol}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
