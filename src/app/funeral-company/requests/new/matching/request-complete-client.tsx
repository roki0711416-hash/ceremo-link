"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import { ClearDraftOnMount } from "@/app/funeral-company/requests/new/matching/clear-draft";
import { DemoFacilityBanner } from "@/components/ceremo/demo-facility-banner";
import { RequestFlowNotice } from "@/components/ceremo/request-flow/notice";
import { RequestSummary } from "@/components/ceremo/request-flow/request-summary";
import { StepIndicator } from "@/components/ceremo/step-indicator";
import { FuneralCompanyShell } from "@/components/layout/funeral-company-shell";
import { FUNERAL_REQUEST_SERVICE_LABEL, FUNERAL_REQUEST_STEPS } from "@/lib/constants/request-flow";
import { isDemoCrematorium } from "@/lib/constants/demo-crematorium";

type RequestCompleteClientProps = {
  email?: string | null;
  jobId: string;
  summary: {
    crematoriumName?: string;
    workDate?: string;
    startTime?: string;
    endTime?: string;
    farewellType?: string;
    serviceLabel?: string;
    deceasedName?: string;
    contactName?: string;
    contactPhone?: string;
    notes?: string;
  };
};

export function RequestCompleteClient({
  email,
  jobId,
  summary,
}: RequestCompleteClientProps) {
  const isDemo = isDemoCrematorium(null, null, summary.crematoriumName);

  return (
    <FuneralCompanyShell title="依頼完了" backHref="/funeral-company" email={email}>
      <ClearDraftOnMount />
      <div className="space-y-5 pb-4">
        <StepIndicator
          steps={[...FUNERAL_REQUEST_STEPS]}
          currentStepId="complete"
          tone="funeral"
        />

        <div className="space-y-3 py-4 text-center">
          <div
            className="mx-auto flex size-20 items-center justify-center rounded-full bg-funeral text-white shadow-md"
            aria-hidden
          >
            <Check className="size-10 stroke-[3]" />
          </div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            依頼を受け付けました
          </h2>
          <p className="text-base text-muted-foreground">
            条件が一致するフリーランスへ通知しました。マッチング状況はマイページでご確認いただけます。
          </p>
        </div>

        {isDemo ? <DemoFacilityBanner /> : null}

        <RequestSummary
          crematoriumName={summary.crematoriumName}
          workDate={summary.workDate}
          startTime={summary.startTime}
          endTime={summary.endTime}
          serviceLabel={summary.serviceLabel ?? FUNERAL_REQUEST_SERVICE_LABEL}
          deceasedName={summary.deceasedName}
          contactName={summary.contactName}
          contactPhone={summary.contactPhone}
          notes={summary.notes}
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/funeral-company"
            className="tap-target inline-flex flex-1 items-center justify-center rounded-xl border-2 border-funeral bg-white px-4 text-base font-medium text-funeral"
          >
            マイページに戻る
          </Link>
          <Link
            href="/funeral-company/jobs"
            className="tap-target inline-flex flex-[1.4] items-center justify-center rounded-xl bg-funeral px-4 text-base font-medium text-white"
          >
            依頼一覧を見る
          </Link>
        </div>

        <Link
          href={`/funeral-company/jobs/${jobId}`}
          className="block text-center text-sm text-funeral underline-offset-2 hover:underline"
        >
          この依頼の詳細を見る
        </Link>

        <RequestFlowNotice>
          変更が必要な場合は、マイページの「マッチング」から担当スタッフへご連絡ください。
        </RequestFlowNotice>
      </div>
    </FuneralCompanyShell>
  );
}
