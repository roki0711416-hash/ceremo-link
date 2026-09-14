import Link from "next/link";

import { StatusBadge } from "@/components/ceremo/status-badge";
import { DemoBanner, DemoShell } from "@/components/demo/demo-shell";
import { DEMO_OFFERS, formatYenDemo } from "@/lib/demo/data";

export default function DemoOffersPage() {
  return (
    <DemoShell title="届いた依頼" backHref="/freelancer" tone="freelancer">
      <DemoBanner />
      <p className="text-base text-muted-foreground">
        契約前は日時・地域・火葬場・業務・報酬などだけが表示されます。
      </p>
      <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
        {DEMO_OFFERS.map((o) => (
          <li key={o.id}>
            <Link
              href={`/freelancer/demo/offers/${o.id}`}
              className="block space-y-1 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-foreground">{o.facilityName}</p>
                <StatusBadge label="募集中" tone="freelancer" icon="○" />
              </div>
              <p className="text-base text-muted-foreground">
                {o.workDateLabel} {o.timeRange}
              </p>
              <p className="text-base">
                {o.serviceName} / {formatYenDemo(o.payAmount)}
              </p>
              <p className="text-sm text-muted-foreground">
                回答期限: {o.deadlineLabel}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </DemoShell>
  );
}
