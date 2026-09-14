import { Suspense } from "react";

import { FreelancerAvailabilityClient } from "@/app/freelancer/availability/availability-client";
import { DemoShell } from "@/components/demo/demo-shell";

export default function FreelancerAvailabilityPage() {
  return (
    <Suspense
      fallback={
        <DemoShell title="対応可能日" backHref="/freelancer" tone="freelancer">
          <p className="text-base text-muted-foreground" role="status">
            読み込み中…
          </p>
        </DemoShell>
      }
    >
      <FreelancerAvailabilityClient />
    </Suspense>
  );
}
