"use client";

import {
  BOOKING_SLOT_LABELS,
  type BookingSlotLevel,
} from "@/lib/booking-calendar-status";
import { cn } from "@/lib/utils";

export type BookingCalendarDay = {
  date: string;
  label: string;
  inMonth: boolean;
  level: BookingSlotLevel;
  selected?: boolean;
  disabled?: boolean;
};

type BookingCalendarProps = {
  monthLabel: string;
  days: BookingCalendarDay[];
  onSelectDate?: (date: string) => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  tone?: "funeral" | "freelancer";
};

const levelCellClass: Record<BookingSlotLevel, string> = {
  available: "bg-sky-50 text-sky-900",
  moderate: "bg-emerald-50 text-emerald-900",
  few: "bg-emerald-50 text-emerald-800",
  crowded: "bg-rose-50 text-rose-900",
  unknown: "bg-muted text-muted-foreground",
};

export function BookingCalendar({
  monthLabel,
  days,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  tone = "funeral",
}: BookingCalendarProps) {
  const selectedRing =
    tone === "funeral" ? "ring-2 ring-funeral ring-offset-1" : "ring-2 ring-freelancer ring-offset-1";

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="前の月"
          onClick={onPrevMonth}
          className="tap-target rounded-lg border border-border px-3 py-2 text-base"
        >
          ◀
        </button>
        <p className="font-heading text-lg font-semibold text-foreground">
          {monthLabel}
        </p>
        <button
          type="button"
          aria-label="次の月"
          onClick={onNextMonth}
          className="tap-target rounded-lg border border-border px-3 py-2 text-base"
        >
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {["日", "月", "火", "水", "木", "金", "土"].map((weekday, i) => (
          <div
            key={weekday}
            className={cn(
              "py-2 font-medium",
              i === 0 && "text-required",
              i === 6 && "text-blue-700",
            )}
          >
            {weekday}
          </div>
        ))}
        {days.map((day) => {
          if (!day.inMonth) {
            return (
              <div
                key={day.date}
                className="min-h-14 rounded-lg bg-transparent"
                aria-hidden
              />
            );
          }

          const meta = BOOKING_SLOT_LABELS[day.level];
          const clickable = !day.disabled && onSelectDate;

          return (
            <button
              key={day.date}
              type="button"
              disabled={!clickable}
              aria-label={`${day.label}日 ${meta.label}`}
              aria-pressed={day.selected}
              onClick={() => onSelectDate?.(day.date)}
              className={cn(
                "tap-target flex min-h-14 flex-col items-center justify-center rounded-lg border border-border/60 p-1 text-sm transition",
                levelCellClass[day.level],
                day.selected && selectedRing,
                clickable && "hover:brightness-95",
                day.disabled && "opacity-50",
              )}
            >
              <span className="font-medium">{day.label}</span>
              <span className="text-xs leading-none">{meta.symbol}</span>
              <span className="mt-0.5 text-[10px] leading-tight">{meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BookingCalendarLegend() {
  const items: BookingSlotLevel[] = [
    "available",
    "moderate",
    "few",
    "crowded",
  ];

  return (
    <div className="space-y-2 rounded-xl border border-border bg-surface p-4 text-sm">
      <p className="font-medium text-foreground">凡例</p>
      <ul className="space-y-2 text-muted-foreground">
        {items.map((level) => {
          const meta = BOOKING_SLOT_LABELS[level];
          return (
            <li key={level} className="flex items-start gap-2">
              <span
                className={cn(
                  "inline-flex min-w-16 justify-center rounded px-1.5 py-0.5 text-xs font-medium",
                  levelCellClass[level],
                )}
              >
                {meta.symbol} {meta.label}
              </span>
              <span>{meta.description}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
