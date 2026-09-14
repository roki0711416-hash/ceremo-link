/**
 * CeremoLink design tokens (runtime helpers).
 * Visual source of truth is also mirrored in globals.css CSS variables.
 */
export const brand = {
  nameJa: "セレモリンク",
  nameEn: "CeremoLink",
  tagline: "葬儀の現場と、経験ある人材をつなぐ。",
} as const;

/** Funeral company = deep purple, Freelancer = deep green */
export const roleColors = {
  funeralCompany: {
    key: "funeral",
    label: "葬儀社の方",
    main: "#4A3E7F",
    soft: "#F3F0F8",
    border: "#C9C0DD",
  },
  freelancer: {
    key: "freelancer",
    label: "フリーランスの方",
    main: "#2F6B4F",
    soft: "#EFF6F1",
    border: "#B7D4C4",
  },
} as const;

/** Staff availability legend thresholds (changeable without migration). */
export const staffAvailabilityThresholds = {
  many: 5, // ◎
  available: 2, // ○
  few: 1, // △
  // 0 => ×
} as const;

export const layout = {
  maxWidth: "42rem", // ~672px centered on PC
  pagePaddingX: "1rem",
  sectionGap: "1.5rem",
  cardRadius: "0.75rem",
  tapMin: "2.75rem", // 44px
  bodyMinPx: 16,
} as const;
