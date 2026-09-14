import type { JobStatus } from "@/types/database";

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: "下書き",
  open: "募集中",
  assigned: "契約成立",
  requested: "依頼中（旧）",
  accepted: "承諾済（旧）",
  declined: "辞退",
  expired: "期限切れ",
  in_progress: "業務中",
  completion_pending: "完了確認待ち",
  completed: "完了",
  cancellation_requested: "キャンセル申請中",
  cancelled: "キャンセル",
  disputed: "紛争中",
};

/** Fields safe to show before contract (assigned). */
export const PRE_CONTRACT_JOB_FIELDS = [
  "work_starts_at",
  "work_ends_at",
  "municipality_id",
  "crematorium_name",
  "service_type_id",
  "estimated_duration_minutes",
  "pay_amount",
  "travel_expense",
  "response_deadline_at",
  "location_general",
] as const;

/** Fields only after contract. */
export const POST_CONTRACT_PRIVATE_FIELDS = [
  "deceased_name",
  "meetup_location",
  "company_contact_name",
  "company_contact_phone",
  "emergency_contact",
  "detailed_notes",
  "exact_address",
  "facility_name",
] as const;
