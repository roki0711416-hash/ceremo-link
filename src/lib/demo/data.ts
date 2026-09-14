import { staffAvailabilityThresholds } from "@/lib/design/tokens";

/** Dummy Kanagawa facilities — fictional names/addresses only. */
export type DemoFacility = {
  id: string;
  name: string;
  area: string;
  municipality: string;
  address: string;
};

export const DEMO_FACILITIES: DemoFacility[] = [
  {
    id: "fac-yokohama-nishi",
    name: "サンプル西横浜斎場",
    area: "横浜市",
    municipality: "横浜市西区",
    address: "神奈川県横浜市西区サンプル1-1",
  },
  {
    id: "fac-kawasaki-kita",
    name: "サンプル川崎北斎苑",
    area: "川崎市",
    municipality: "川崎市高津区",
    address: "神奈川県川崎市高津区サンプル2-2",
  },
  {
    id: "fac-sagamihara",
    name: "サンプル相模原聖苑",
    area: "相模原市",
    municipality: "相模原市中央区",
    address: "神奈川県相模原市中央区サンプル3-3",
  },
  {
    id: "fac-fujisawa",
    name: "サンプル藤沢斎場",
    area: "湘南",
    municipality: "藤沢市",
    address: "神奈川県藤沢市サンプル4-4",
  },
  {
    id: "fac-odawara",
    name: "サンプル小田原斎場",
    area: "県西",
    municipality: "小田原市",
    address: "神奈川県小田原市サンプル5-5",
  },
  {
    id: "fac-yokosuka",
    name: "サンプル横須賀斎苑",
    area: "横須賀三浦",
    municipality: "横須賀市",
    address: "神奈川県横須賀市サンプル6-6",
  },
];

export const DEMO_AREAS = [
  "すべて",
  "横浜市",
  "川崎市",
  "相模原市",
  "湘南",
  "県西",
  "横須賀三浦",
] as const;

export type StaffStatusSymbol = "◎" | "○" | "△" | "×";

export function staffStatusFromCount(count: number): {
  symbol: StaffStatusSymbol;
  label: string;
} {
  if (count >= staffAvailabilityThresholds.many) {
    return { symbol: "◎", label: "対応可能者が多い" };
  }
  if (count >= staffAvailabilityThresholds.available) {
    return { symbol: "○", label: "対応可能" };
  }
  if (count >= staffAvailabilityThresholds.few) {
    return { symbol: "△", label: "残りわずか" };
  }
  return { symbol: "×", label: "現在対応者なし" };
}

/** Deterministic dummy counts for calendar cells (no real PII). */
export function demoStaffCountForDate(facilityId: string, day: number): number {
  const seed = facilityId.length + day * 7;
  return seed % 7; // 0–6
}

export const DEMO_SERVICE_OPTIONS = [
  { id: "crematorium_guide", name: "火葬場案内" },
  { id: "reception", name: "受付" },
  { id: "attendee_guide", name: "会葬者案内" },
  { id: "venue_setup", name: "式場設営" },
  { id: "venue_teardown", name: "式場撤収" },
  { id: "transport_assist", name: "搬送補助" },
  { id: "emcee", name: "司会" },
  { id: "operation_assist", name: "葬儀運営補助" },
] as const;

export type DemoOffer = {
  id: string;
  facilityName: string;
  municipality: string;
  workDateLabel: string;
  timeRange: string;
  serviceName: string;
  payAmount: number;
  travelExpense: number;
  deadlineLabel: string;
  status: "open" | "assigned_other" | "won";
};

export const DEMO_OFFERS: DemoOffer[] = [
  {
    id: "offer-1",
    facilityName: "サンプル西横浜斎場",
    municipality: "横浜市西区",
    workDateLabel: "2026年8月25日（火）",
    timeRange: "9:00〜15:00",
    serviceName: "火葬場案内",
    payAmount: 18000,
    travelExpense: 1500,
    deadlineLabel: "2026年8月24日 18:00まで",
    status: "open",
  },
  {
    id: "offer-2",
    facilityName: "サンプル藤沢斎場",
    municipality: "藤沢市",
    workDateLabel: "2026年8月28日（金）",
    timeRange: "10:00〜16:00",
    serviceName: "受付",
    payAmount: 16000,
    travelExpense: 2000,
    deadlineLabel: "2026年8月27日 12:00まで",
    status: "open",
  },
];

export type DemoAssignedJob = {
  id: string;
  facilityName: string;
  workDateLabel: string;
  timeRange: string;
  serviceName: string;
  payAmount: number;
  travelExpense: number;
  /** Post-contract only */
  deceasedName: string;
  meetupLocation: string;
  contactName: string;
  contactPhone: string;
  emergencyContact: string;
  notes: string;
  changeNotice?: {
    summary: string;
    acknowledged: boolean;
  };
};

export const DEMO_ASSIGNED_JOB: DemoAssignedJob = {
  id: "job-assigned-1",
  facilityName: "サンプル西横浜斎場",
  workDateLabel: "2026年8月20日（木）",
  timeRange: "8:30集合 / 9:00〜14:00",
  serviceName: "火葬場案内",
  payAmount: 18000,
  travelExpense: 1500,
  deceasedName: "（仮）山田 一郎 様",
  meetupLocation: "斎場正面玄関（仮）",
  contactName: "（仮）担当 花子",
  contactPhone: "045-0000-0000",
  emergencyContact: "045-0000-0001",
  notes: "黒スーツ着用。名札は現地でお渡しします。",
  changeNotice: {
    summary: "集合時刻が8:20に変更されました（故人名は通知に含みません）",
    acknowledged: false,
  },
};

export const FUNERAL_REQUEST_STEPS = [
  { id: "facility", label: "火葬場" },
  { id: "datetime", label: "日時" },
  { id: "details", label: "詳細" },
  { id: "confirm", label: "確認" },
  { id: "matching", label: "マッチング" },
] as const;

export const FREELANCER_AVAIL_STEPS = [
  { id: "schedule", label: "日時" },
  { id: "confirm", label: "確認" },
] as const;

export function getDemoFacility(id: string) {
  return DEMO_FACILITIES.find((f) => f.id === id);
}

export function formatYenDemo(amount: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(amount);
}
