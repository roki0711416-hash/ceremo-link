"use client";

import { useActionState, useState } from "react";

import {
  saveFuneralCompanyProfileAction,
  type FuneralCompanyActionState,
} from "@/app/actions/funeral-company";
import { FormActions } from "@/components/ceremo/form-actions";
import { RequiredMark } from "@/components/ceremo/status-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KANAGAWA_PREFECTURE } from "@/lib/validations/funeral-company";
import type { FuneralCompany } from "@/types/database";

const initialState: FuneralCompanyActionState = {};

type MunicipalityOption = { id: string; name: string };

const fieldClass =
  "tap-target h-11 w-full rounded-xl border border-input bg-white px-3 text-base";

export function FuneralCompanyProfileForm({
  company,
  municipalities,
  verificationLabel,
}: {
  company: FuneralCompany | null;
  municipalities: MunicipalityOption[];
  verificationLabel: string;
}) {
  const [state, formAction, pending] = useActionState(
    saveFuneralCompanyProfileAction,
    initialState,
  );
  const [fileName, setFileName] = useState<string | null>(
    company?.business_document_path ? "登録済みの書類があります" : null,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-base text-required">
          {state.error}
        </p>
      ) : null}

      <p className="rounded-lg border border-border bg-funeral-soft px-3 py-2 text-base text-funeral">
        審査状態: {verificationLabel}（本人では変更できません）
      </p>

      <Field label="会社名" required htmlFor="companyName">
        <Input
          id="companyName"
          name="companyName"
          required
          defaultValue={company?.company_name ?? ""}
          className={fieldClass}
        />
      </Field>

      <Field label="法人名または屋号" required htmlFor="representativeName">
        <Input
          id="representativeName"
          name="representativeName"
          required
          defaultValue={company?.representative_name ?? ""}
          className={fieldClass}
        />
      </Field>

      <Field label="担当者名" required htmlFor="contactPersonName">
        <Input
          id="contactPersonName"
          name="contactPersonName"
          required
          defaultValue={company?.contact_person_name ?? ""}
          className={fieldClass}
        />
      </Field>

      <Field label="郵便番号" required htmlFor="postalCode">
        <Input
          id="postalCode"
          name="postalCode"
          inputMode="numeric"
          placeholder="123-4567"
          required
          defaultValue={company?.postal_code ?? ""}
          className={fieldClass}
        />
      </Field>

      <Field label="都道府県" required htmlFor="prefecture">
        <Input
          id="prefecture"
          name="prefecture"
          value={KANAGAWA_PREFECTURE}
          readOnly
          className={`${fieldClass} bg-muted`}
        />
        <p className="text-sm text-muted-foreground">
          MVPでは神奈川県のみ登録できます。
        </p>
      </Field>

      <Field label="市区町村" required htmlFor="municipalityId">
        <select
          id="municipalityId"
          name="municipalityId"
          required
          defaultValue={company?.municipality_id ?? ""}
          className={fieldClass}
        >
          <option value="">選択してください</option>
          {municipalities.map((municipality) => (
            <option key={municipality.id} value={municipality.id}>
              {municipality.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="住所" required htmlFor="address">
        <Input
          id="address"
          name="address"
          required
          placeholder="神奈川県横浜市西区…"
          defaultValue={company?.address ?? KANAGAWA_PREFECTURE}
          className={fieldClass}
        />
      </Field>

      <Field label="電話番号" required htmlFor="phone">
        <Input
          id="phone"
          name="phone"
          required
          defaultValue={company?.phone ?? ""}
          className={fieldClass}
        />
      </Field>

      <Field label="緊急連絡先" required htmlFor="emergencyPhone">
        <Input
          id="emergencyPhone"
          name="emergencyPhone"
          required
          defaultValue={company?.emergency_phone ?? ""}
          className={fieldClass}
        />
      </Field>

      <Field label="法人番号（任意）" htmlFor="corporateNumber">
        <Input
          id="corporateNumber"
          name="corporateNumber"
          inputMode="numeric"
          defaultValue={company?.corporate_number ?? ""}
          className={fieldClass}
        />
      </Field>

      <Field label="Webサイト（任意）" htmlFor="websiteUrl">
        <Input
          id="websiteUrl"
          name="websiteUrl"
          type="url"
          placeholder="https://"
          defaultValue={company?.website_url ?? ""}
          className={fieldClass}
        />
      </Field>

      <div className="space-y-2">
        <Label htmlFor="businessDocument" className="text-base">
          営業確認書類
          <RequiredMark />
        </Label>
        <Input
          id="businessDocument"
          name="businessDocument"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp"
          className={`${fieldClass} py-2`}
          onChange={(event) => {
            const next = event.target.files?.[0]?.name;
            setFileName(next ?? fileName);
          }}
        />
        <p className="text-sm text-muted-foreground">
          PDF / JPEG / PNG / WebP、10MBまで。非公開で保存され、本人と管理者だけが閲覧できます。
        </p>
        {fileName ? (
          <p className="text-sm text-funeral">{fileName}</p>
        ) : null}
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-base">
        <input
          id="termsAccepted"
          type="checkbox"
          name="termsAccepted"
          defaultChecked={Boolean(company?.terms_accepted_at)}
          className="mt-1 size-5 accent-[#4A3E7F]"
          required={!company?.terms_accepted_at}
        />
        <span>
          利用規約に同意します
          <RequiredMark />
          {company?.terms_accepted_at ? (
            <span className="mt-1 block text-sm text-muted-foreground">
              同意済みです。再保存しても同意日時は変わりません。
            </span>
          ) : null}
        </span>
      </label>

      <FormActions
        backHref={company?.profile_completed_at ? "/funeral-company" : undefined}
        primaryLabel="保存する"
        primaryPendingLabel="保存中…"
        pending={pending}
      />
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-base">
        {label}
        {required ? <RequiredMark /> : null}
      </Label>
      {children}
    </div>
  );
}
