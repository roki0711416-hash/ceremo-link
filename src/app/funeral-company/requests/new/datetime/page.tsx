import { redirect } from "next/navigation";

import { requireFuneralCompany } from "@/lib/auth/funeral-company";
import { isVerificationApproved } from "@/lib/constants/verification-gate";

type Props = {
  searchParams: Promise<{ facilityId?: string; date?: string }>;
};

export default async function RequestDatetimePage({ searchParams }: Props) {
  const { facilityId, date } = await searchParams;
  const { company } = await requireFuneralCompany();

  if (!isVerificationApproved(company?.verification_status)) {
    redirect("/funeral-company");
  }

  if (!facilityId) {
    redirect("/funeral-company/facilities");
  }

  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const month = date.slice(0, 7);
    redirect(
      `/funeral-company/facilities/${facilityId}/book?date=${date}&month=${month}`,
    );
  }

  redirect(`/funeral-company/facilities/${facilityId}/staff`);
}
