"use client";

import { useActionState } from "react";

import {
  claimOpenJobAction,
  createAndPublishJobAction,
  type JobActionState,
} from "@/app/actions/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: JobActionState = {};

type Option = { id: string; name: string };

export function CreateOpenJobForm({
  municipalities,
  serviceTypes,
}: {
  municipalities: Option[];
  serviceTypes: Option[];
}) {
  const [state, action, pending] = useActionState(
    createAndPublishJobAction,
    initial,
  );

  return (
    <form action={action} className="space-y-6">
      {state.error ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">公開情報（契約前に表示）</h2>
        <div className="space-y-2">
          <Label htmlFor="serviceTypeId">業務区分</Label>
          <select
            id="serviceTypeId"
            name="serviceTypeId"
            required
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          >
            <option value="">選択してください</option>
            {serviceTypes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="municipalityId">市区町村</Label>
          <select
            id="municipalityId"
            name="municipalityId"
            required
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          >
            <option value="">選択してください</option>
            {municipalities.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="crematoriumName">火葬場</Label>
          <Input id="crematoriumName" name="crematoriumName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="locationGeneral">一般的な場所情報</Label>
          <Input id="locationGeneral" name="locationGeneral" required />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="workStartsAt">開始日時</Label>
            <Input
              id="workStartsAt"
              name="workStartsAt"
              type="datetime-local"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workEndsAt">終了日時</Label>
            <Input
              id="workEndsAt"
              name="workEndsAt"
              type="datetime-local"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedDurationMinutes">想定時間（分・任意）</Label>
          <Input
            id="estimatedDurationMinutes"
            name="estimatedDurationMinutes"
            type="number"
            min={1}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="payAmount">報酬（円）</Label>
            <Input id="payAmount" name="payAmount" type="number" min={0} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="travelExpense">交通費（円）</Label>
            <Input
              id="travelExpense"
              name="travelExpense"
              type="number"
              min={0}
              defaultValue={0}
              required
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="paymentDueOn">支払期日</Label>
            <Input id="paymentDueOn" name="paymentDueOn" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responseDeadlineAt">回答期限</Label>
            <Input
              id="responseDeadlineAt"
              name="responseDeadlineAt"
              type="datetime-local"
              required
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">非公開情報（契約成立後のみ開示）</h2>
        <p className="text-xs text-muted-foreground">
          故人名は通知文面には表示されません。
        </p>
        <div className="space-y-2">
          <Label htmlFor="deceasedName">故人名</Label>
          <Input id="deceasedName" name="deceasedName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meetupLocation">正確な集合場所</Label>
          <Input id="meetupLocation" name="meetupLocation" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="exactAddress">正確な住所</Label>
          <Input id="exactAddress" name="exactAddress" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="facilityName">施設名（任意）</Label>
          <Input id="facilityName" name="facilityName" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyContactName">葬儀社担当者名</Label>
          <Input id="companyContactName" name="companyContactName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyContactPhone">担当者連絡先</Label>
          <Input id="companyContactPhone" name="companyContactPhone" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyContact">緊急連絡先</Label>
          <Input id="emergencyContact" name="emergencyContact" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="detailedNotes">詳細な注意事項（任意）</Label>
          <textarea
            id="detailedNotes"
            name="detailedNotes"
            rows={3}
            className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
      </section>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "公開中…" : "条件一致者へ一斉通知する"}
      </Button>
    </form>
  );
}

export function ClaimJobButton({ jobId }: { jobId: string }) {
  const [state, action, pending] = useActionState(claimOpenJobAction, initial);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="jobId" value={jobId} />
      {state.error ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "処理中…" : "この依頼を受ける"}
      </Button>
    </form>
  );
}
