"use client";

import { useActionState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import {
  createAndPublishJobAction,
  type JobActionState,
} from "@/app/actions/jobs";
import { FormActions } from "@/components/ceremo/form-actions";
import { DemoFacilityBanner } from "@/components/ceremo/demo-facility-banner";
import { RequestFlowNotice } from "@/components/ceremo/request-flow/notice";
import { RequestSummary } from "@/components/ceremo/request-flow/request-summary";
import { RequestVenueCard } from "@/components/ceremo/request-flow/venue-card";
import { SelectedDatetimeBar } from "@/components/ceremo/request-flow/selected-datetime-bar";
import { StepIndicator } from "@/components/ceremo/step-indicator";
import { FuneralCompanyShell } from "@/components/layout/funeral-company-shell";
import { FUNERAL_REQUEST_SERVICE_LABEL, FUNERAL_REQUEST_STEPS } from "@/lib/constants/request-flow";
import { isDemoCrematorium } from "@/lib/constants/demo-crematorium";
import {
  draftToMeetupAt,
  draftToWorkEndsAt,
  draftToWorkStartsAt,
  loadRequestDraft,
} from "@/lib/demo/draft-storage";
import { computeResponseDeadlineAt } from "@/lib/job-request-deadlines";

const initial: JobActionState = {};

export function RequestConfirmClient({
  email,
}: {
  email?: string | null;
}) {
  const router = useRouter();
  const draft = useMemo(() => {
    const loaded = loadRequestDraft();
    if (!loaded.facilityId || !loaded.workDate) return null;
    return loaded;
  }, []);
  const [state, formAction, pending] = useActionState(
    createAndPublishJobAction,
    initial,
  );

  useEffect(() => {
    if (!draft) {
      router.replace("/funeral-company/facilities");
    }
  }, [draft, router]);

  if (!draft) {
    return (
      <FuneralCompanyShell title="依頼確認" email={email}>
        <p className="text-base text-muted-foreground">読み込み中…</p>
      </FuneralCompanyShell>
    );
  }

  const workStartsAt = draftToWorkStartsAt(draft);
  const workEndsAt = draftToWorkEndsAt(draft);
  const meetupAt = draftToMeetupAt(draft);
  const responseDeadlineAt = computeResponseDeadlineAt(workStartsAt);

  const confirmBackHref =
    draft.facilityId && draft.workDate
      ? `/funeral-company/facilities/${draft.facilityId}/book?date=${draft.workDate}&month=${draft.workDate.slice(0, 7)}`
      : "/funeral-company/requests/new/details";

  const calendarHref =
    draft.facilityId && draft.workDate
      ? `/funeral-company/facilities/${draft.facilityId}/staff?month=${draft.workDate.slice(0, 7)}`
      : "/funeral-company/map";

  const isDemo = isDemoCrematorium(null, null, draft.crematoriumName);

  return (
    <FuneralCompanyShell
      title="依頼確認"
      backHref={confirmBackHref}
      email={email}
    >
      <div className="space-y-5 pb-4">
        <StepIndicator
          steps={[...FUNERAL_REQUEST_STEPS]}
          currentStepId="confirm"
          tone="funeral"
        />

        <RequestVenueCard
          name={draft.crematoriumName ?? "—"}
          address={draft.locationGeneral ?? "—"}
          municipalityName={draft.municipalityName}
          detailHref={
            draft.facilityId
              ? `/funeral-company/facilities/${draft.facilityId}`
              : "/funeral-company/map"
          }
        />

        {isDemo ? <DemoFacilityBanner /> : null}

        <SelectedDatetimeBar
          workDate={draft.workDate!}
          startTime={draft.startTime ?? "10:00"}
          endTime={draft.endTime ?? "12:00"}
          changeHref={calendarHref}
        />

        {state.error ? (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-base text-required"
          >
            {state.error}
          </p>
        ) : null}

        <RequestSummary
          crematoriumName={draft.crematoriumName}
          workDate={draft.workDate}
          startTime={draft.startTime}
          endTime={draft.endTime}
          serviceLabel={FUNERAL_REQUEST_SERVICE_LABEL}
          deceasedName={draft.deceasedName}
          contactName={draft.contactName}
          contactPhone={draft.contactPhone}
          notes={draft.notes}
          highlightService
        />

        <RequestFlowNotice>
          内容をご確認ください。依頼内容を確認のうえ送信してください。マッチングが完了すると、担当スタッフをご案内します。
        </RequestFlowNotice>

        <form action={formAction} className="space-y-3">
          <input type="hidden" name="returnToMatching" value="1" />
          <input type="hidden" name="serviceTypeId" value={draft.serviceTypeId ?? ""} />
          <input type="hidden" name="municipalityId" value={draft.municipalityId ?? ""} />
          <input type="hidden" name="locationGeneral" value={draft.locationGeneral ?? ""} />
          <input type="hidden" name="crematoriumName" value={draft.crematoriumName ?? ""} />
          <input type="hidden" name="workStartsAt" value={workStartsAt} />
          <input type="hidden" name="workEndsAt" value={workEndsAt} />
          <input type="hidden" name="meetupAt" value={meetupAt} />
          <input type="hidden" name="payAmount" value={draft.payAmount ?? "0"} />
          <input type="hidden" name="travelExpense" value={draft.travelExpense ?? "0"} />
          <input type="hidden" name="paymentDueOn" value={draft.paymentDueOn ?? ""} />
          <input type="hidden" name="responseDeadlineAt" value={responseDeadlineAt} />
          <input type="hidden" name="dressCode" value={draft.dressCode ?? ""} />
          <input type="hidden" name="belongings" value={draft.belongings ?? ""} />
          <input type="hidden" name="description" value={draft.notes ?? ""} />
          <input type="hidden" name="deceasedName" value={draft.deceasedName ?? ""} />
          <input type="hidden" name="exactAddress" value={draft.exactAddress ?? ""} />
          <input type="hidden" name="facilityName" value={draft.crematoriumName ?? ""} />
          <input type="hidden" name="meetupLocation" value={draft.meetupLocation ?? ""} />
          <input type="hidden" name="companyContactName" value={draft.contactName ?? ""} />
          <input type="hidden" name="companyContactPhone" value={draft.contactPhone ?? ""} />
          <input type="hidden" name="emergencyContact" value={draft.emergencyContact ?? ""} />
          <input type="hidden" name="detailedNotes" value={draft.notes ?? ""} />

          <FormActions
            backHref={confirmBackHref}
            backLabel="戻る"
            primaryLabel="この内容で依頼する"
            primaryPendingLabel="送信中…"
            pending={pending}
            tone="funeral"
          />
        </form>
      </div>
    </FuneralCompanyShell>
  );
}
