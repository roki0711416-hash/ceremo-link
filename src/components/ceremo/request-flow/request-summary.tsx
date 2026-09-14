type RequestSummaryProps = {
  crematoriumName?: string;
  workDate?: string;
  startTime?: string;
  endTime?: string;
  serviceLabel?: string;
  deceasedName?: string;
  contactName?: string;
  contactPhone?: string;
  notes?: string;
  highlightService?: boolean;
};

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="shrink-0 text-sm text-muted-foreground sm:w-28">{label}</dt>
      <dd
        className={
          highlight
            ? "text-base font-medium text-sky-700"
            : "text-base text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  );
}

export function RequestSummary({
  crematoriumName,
  workDate,
  startTime,
  endTime,
  serviceLabel,
  deceasedName,
  contactName,
  contactPhone,
  notes,
  highlightService = false,
}: RequestSummaryProps) {
  const datetime =
    workDate && startTime && endTime
      ? `${workDate} ${startTime} 〜 ${endTime}`
      : "—";

  return (
    <dl className="space-y-3 rounded-xl border border-border bg-surface p-4 text-base shadow-sm">
      <Row label="火葬場" value={crematoriumName ?? "—"} />
      <Row label="日時" value={datetime} />
      <Row
        label="依頼内容"
        value={serviceLabel ?? "—"}
        highlight={highlightService}
      />
      <Row label="喪家名" value={deceasedName?.trim() || "—"} />
      <Row label="担当者名" value={contactName?.trim() || "—"} />
      <Row label="連絡先" value={contactPhone?.trim() || "—"} />
      {notes?.trim() ? (
        <Row label="備考" value={notes.trim()} />
      ) : null}
    </dl>
  );
}
