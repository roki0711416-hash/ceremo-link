import { addHours, addMinutes, subHours } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

import { APP_TIMEZONE } from "@/lib/datetime";

/** datetime-local 風の文字列を Asia/Tokyo として ISO に変換 */
export function tokyoInputToIso(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const normalized =
    trimmed.length === 16 ? `${trimmed}:00` : trimmed.replace(/Z$/, "");
  if (normalized.includes("+") || normalized.endsWith("Z")) {
    return new Date(normalized).toISOString();
  }
  return new Date(`${normalized}+09:00`).toISOString();
}

/** Asia/Tokyo の datetime-local 文字列 (yyyy-MM-ddTHH:mm) */
export function formatTokyoInput(value: Date) {
  return formatInTimeZone(value, APP_TIMEZONE, "yyyy-MM-dd'T'HH:mm");
}

/**
 * 回答期限を算出する。
 * - 原則: 実働開始の24時間前
 * - ただし常に「現在+2時間」より後（DB制約・公開RPC対策）
 */
export function computeResponseDeadlineAt(workStartsAt: string): string {
  const workStart = new Date(tokyoInputToIso(workStartsAt));
  const now = new Date();
  const minDeadline = addHours(now, 2);
  const ideal = subHours(workStart, 24);
  const deadline = ideal > minDeadline ? ideal : minDeadline;
  return formatTokyoInput(deadline);
}

/** フォーム値が過去なら再計算して未来の期限に補正 */
export function ensureFutureResponseDeadlineAt(
  responseDeadlineAt: string,
  workStartsAt: string,
): string {
  const minFuture = addMinutes(new Date(), 5);
  const parsed = responseDeadlineAt
    ? new Date(tokyoInputToIso(responseDeadlineAt))
    : null;
  if (parsed && parsed > minFuture) {
    return formatTokyoInput(parsed);
  }
  const recomputed = computeResponseDeadlineAt(workStartsAt);
  const recomputedDate = new Date(tokyoInputToIso(recomputed));
  if (recomputedDate > minFuture) {
    return recomputed;
  }
  return formatTokyoInput(minFuture);
}

/** 支払期日の初期値（実働日+14日） */
export function defaultPaymentDueOn(workDate: string) {
  const base = new Date(`${workDate}T00:00:00+09:00`);
  base.setUTCDate(base.getUTCDate() + 14);
  return formatInTimeZone(base, APP_TIMEZONE, "yyyy-MM-dd");
}
