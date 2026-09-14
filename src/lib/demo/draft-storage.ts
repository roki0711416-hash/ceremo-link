export const REQUEST_DRAFT_KEY = "ceremo-request-draft-v1";
export const AVAIL_DRAFT_KEY = "ceremo-avail-draft-v1";

export type RequestDraft = {
  facilityId?: string;
  crematoriumName?: string;
  municipalityId?: string;
  municipalityName?: string;
  locationGeneral?: string;
  exactAddress?: string;
  workDate?: string;
  startTime?: string;
  endTime?: string;
  meetupTime?: string;
  serviceTypeId?: string;
  /** @deprecated Prefer serviceTypeId. Kept for older drafts. */
  serviceIds?: string[];
  deceasedName?: string;
  contactName?: string;
  contactPhone?: string;
  emergencyContact?: string;
  meetupLocation?: string;
  payAmount?: string;
  travelExpense?: string;
  paymentDueOn?: string;
  dressCode?: string;
  belongings?: string;
  notes?: string;
  responseDeadline?: string;
  /** 希望内容: お別れ済み / お別れなし */
  farewellType?: "farewell_done" | "farewell_none";
};

export type AvailDraft = {
  dates: string[];
  slots: Record<string, { start: string; end: string }[]>;
};

/** Client-only. Do not log draft contents (may contain private fields). */
export function loadRequestDraft(): RequestDraft {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(REQUEST_DRAFT_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as RequestDraft;
  } catch {
    return {};
  }
}

export function saveRequestDraft(patch: Partial<RequestDraft>) {
  if (typeof window === "undefined") return;
  const next = { ...loadRequestDraft(), ...patch };
  sessionStorage.setItem(REQUEST_DRAFT_KEY, JSON.stringify(next));
}

export function clearRequestDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(REQUEST_DRAFT_KEY);
}

export function draftToWorkStartsAt(draft: RequestDraft) {
  if (!draft.workDate || !draft.startTime) return "";
  return `${draft.workDate}T${draft.startTime}`;
}

export function draftToWorkEndsAt(draft: RequestDraft) {
  if (!draft.workDate || !draft.endTime) return "";
  return `${draft.workDate}T${draft.endTime}`;
}

export function draftToMeetupAt(draft: RequestDraft) {
  if (!draft.workDate || !draft.meetupTime) return "";
  return `${draft.workDate}T${draft.meetupTime}`;
}

export function loadAvailDraft(): AvailDraft {
  if (typeof window === "undefined") return { dates: [], slots: {} };
  try {
    const raw = sessionStorage.getItem(AVAIL_DRAFT_KEY);
    if (!raw) return { dates: [], slots: {} };
    return JSON.parse(raw) as AvailDraft;
  } catch {
    return { dates: [], slots: {} };
  }
}

export function saveAvailDraft(draft: AvailDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(AVAIL_DRAFT_KEY, JSON.stringify(draft));
}

export function clearAvailDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(AVAIL_DRAFT_KEY);
}
