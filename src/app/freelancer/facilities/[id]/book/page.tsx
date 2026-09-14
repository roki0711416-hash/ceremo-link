import { format, startOfMonth } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { redirect } from "next/navigation";

import { APP_TIMEZONE } from "@/lib/datetime";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string; month?: string }>;
};

/** フリーランスはカレンダー画面で日付・時間を一括入力 */
export default async function FreelancerFacilityBookPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { month: monthParam, date: dateParam } = await searchParams;
  const month =
    monthParam && /^\d{4}-\d{2}$/.test(monthParam)
      ? monthParam
      : dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam.slice(0, 7)
        : format(startOfMonth(toZonedTime(new Date(), APP_TIMEZONE)), "yyyy-MM");
  redirect(`/freelancer/facilities/${id}/staff?month=${month}`);
}
