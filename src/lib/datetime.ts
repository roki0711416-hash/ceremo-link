import { formatInTimeZone, toZonedTime } from "date-fns-tz";

export const APP_TIMEZONE = "Asia/Tokyo";

export function formatTokyo(
  value: string | Date,
  pattern = "yyyy/MM/dd HH:mm",
) {
  return formatInTimeZone(value, APP_TIMEZONE, pattern);
}

export function toTokyoDate(value: string | Date) {
  return toZonedTime(value, APP_TIMEZONE);
}

export function formatYen(amount: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(amount);
}
