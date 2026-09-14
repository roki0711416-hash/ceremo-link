import type { VerificationStatus } from "@/types/database";
import type { StaffCountsLoadState } from "@/lib/staff-status";

/**
 * 審査ゲートを有効にするか。
 * デモ・開発中は false。本番リリース時に true に戻す。
 */
export const VERIFICATION_GATE_ENABLED = false;

export function isVerificationApproved(
  status: VerificationStatus | null | undefined,
): boolean {
  if (!VERIFICATION_GATE_ENABLED) return true;
  return status === "approved";
}

/** RPC が審査未完了で拒否された場合、ゲート停止時は空き表示にフォールバック */
export function relaxStaffCountsIfGateDisabled(
  state: StaffCountsLoadState,
): StaffCountsLoadState {
  if (!VERIFICATION_GATE_ENABLED && state.kind === "unauthorized") {
    return { kind: "ok", rows: [] };
  }
  return state;
}
