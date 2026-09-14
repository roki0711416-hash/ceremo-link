import Link from "next/link";

import { ComingSoonButton } from "@/components/ceremo/coming-soon-button";
import { StatusBadge } from "@/components/ceremo/status-badge";
import { FuneralCompanyShell, ScreenState } from "@/components/layout/funeral-company-shell";
import { requireFuneralCompany } from "@/lib/auth/funeral-company";
import { JOB_STATUS_LABELS } from "@/lib/constants/jobs";
import { APP_TIMEZONE, formatTokyo } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";

const statusLabels = {
  pending: "審査待ち",
  approved: "承認済み",
  rejected: "却下",
} as const;

function isSameTokyoDay(value: string, today: string) {
  return formatTokyo(value, "yyyy-MM-dd") === today;
}

export default async function FuneralCompanyHomePage() {
  const { profile, company } = await requireFuneralCompany();
  const supabase = await createClient();
  const today = format(toZonedTime(new Date(), APP_TIMEZONE), "yyyy-MM-dd");

  const [
    { data: jobs, error: jobsError },
    { data: notifications, error: notificationsError },
  ] = await Promise.all([
    supabase
      .from("job_requests")
      .select("id, status, crematorium_name, work_starts_at")
      .eq("funeral_company_id", profile.id)
      .order("work_starts_at", { ascending: false }),
    supabase
      .from("notifications")
      .select("id, title, body, read_at, created_at, link_path")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const list = jobs ?? [];
  const todayJobs = list.filter(
    (job) =>
      isSameTokyoDay(job.work_starts_at, today) &&
      ["assigned", "in_progress", "completion_pending"].includes(job.status),
  );
  const matchingJobs = list.filter((job) => job.status === "open");
  const assignedJobs = list
    .filter((job) => job.status === "assigned" || job.status === "in_progress")
    .slice(0, 5);
  const pastJobs = list.filter((job) => job.status === "completed").slice(0, 5);
  const unread = (notifications ?? []).filter((item) => !item.read_at);
  const status = company?.verification_status ?? "pending";

  return (
    <FuneralCompanyShell title="葬儀社ホーム" email={profile.email}>
      <section className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold text-funeral">
          {company?.company_name ?? "葬儀社ホーム"}
        </h1>
        <p className="text-base">担当者: {company?.contact_person_name ?? "未設定"}</p>
        <StatusBadge
          label={statusLabels[status]}
          tone={status === "approved" ? "funeral" : "warning"}
        />
      </section>

      <Link
        href="/funeral-company/map"
        className="tap-target inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-funeral px-4 text-lg font-medium text-white"
      >
        新しい依頼を作成
      </Link>
      <p className="text-sm text-muted-foreground">
        神奈川県の火葬場マップから施設を選び、スタッフの対応状況を確認して依頼を作成できます。
      </p>

      <HomeSection title="本日の案件">
        {jobsError ? (
          <ScreenState title="取得に失敗しました">
            本日の案件を表示できませんでした。
          </ScreenState>
        ) : todayJobs.length === 0 ? (
          <ScreenState title="本日の案件はありません">
            今日の進行予定はまだありません。
          </ScreenState>
        ) : (
          <JobList jobs={todayJobs} />
        )}
      </HomeSection>

      <HomeSection title="マッチング待ち">
        {jobsError ? (
          <ScreenState title="取得に失敗しました">
            マッチング待ちの案件を表示できませんでした。
          </ScreenState>
        ) : matchingJobs.length === 0 ? (
          <ScreenState title="募集中の案件はありません">
            公開中の依頼はまだありません。依頼公開は次の開発段階です。
          </ScreenState>
        ) : (
          <JobList jobs={matchingJobs} />
        )}
      </HomeSection>

      <HomeSection title="成立済みの直近案件">
        {jobsError ? (
          <ScreenState title="取得に失敗しました">
            成立済み案件を表示できませんでした。
          </ScreenState>
        ) : assignedJobs.length === 0 ? (
          <ScreenState title="成立済みの案件はありません">
            契約が成立すると、ここに表示されます。
          </ScreenState>
        ) : (
          <JobList jobs={assignedJobs} />
        )}
      </HomeSection>

      <HomeSection title="確認が必要な連絡">
        {notificationsError ? (
          <ScreenState title="取得に失敗しました">
            連絡を表示できませんでした。
          </ScreenState>
        ) : unread.length === 0 ? (
          <ScreenState title="確認が必要な連絡はありません">
            未読の連絡はありません。
          </ScreenState>
        ) : (
          <ul className="space-y-3">
            {unread.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <p className="font-medium">{item.title}</p>
                <p className="text-base text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ul>
        )}
      </HomeSection>

      <HomeSection title="過去の案件">
        {jobsError ? (
          <ScreenState title="取得に失敗しました">
            過去の案件を表示できませんでした。
          </ScreenState>
        ) : pastJobs.length === 0 ? (
          <ScreenState title="過去の案件はありません">
            完了した案件はここに表示されます。
          </ScreenState>
        ) : (
          <JobList jobs={pastJobs} />
        )}
      </HomeSection>

      <HomeSection title="会社情報">
        <div className="rounded-xl border border-border bg-surface p-4 text-base">
          <p>会社名: {company?.company_name}</p>
          <p>担当者: {company?.contact_person_name}</p>
          <p>電話: {company?.phone}</p>
        </div>
        <Link
          href="/funeral-company/profile"
          className="tap-target inline-flex w-full items-center justify-center rounded-xl border-2 border-funeral bg-white px-4 text-base font-medium text-funeral"
        >
          プロフィールを編集
        </Link>
      </HomeSection>

      <HomeSection title="通知">
        {notificationsError ? (
          <ScreenState title="取得に失敗しました">
            通知を表示できませんでした。
          </ScreenState>
        ) : (notifications ?? []).length === 0 ? (
          <ScreenState title="通知はありません">
            新しいお知らせがあると、ここに表示されます。
          </ScreenState>
        ) : (
          <ul className="space-y-3">
            {(notifications ?? []).slice(0, 5).map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {formatTokyo(item.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
        <ComingSoonButton label="通知設定" variant="outline" />
      </HomeSection>
    </FuneralCompanyShell>
  );
}

function HomeSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-xl font-semibold text-funeral">{title}</h2>
      {children}
    </section>
  );
}

function JobList({
  jobs,
}: {
  jobs: {
    id: string;
    status: keyof typeof JOB_STATUS_LABELS;
    crematorium_name: string | null;
    work_starts_at: string;
  }[];
}) {
  return (
    <ul className="space-y-3">
      {jobs.map((job) => (
        <li key={job.id} className="rounded-xl border border-border bg-surface p-4">
          <p className="font-medium">{job.crematorium_name ?? "火葬場未設定"}</p>
          <p className="text-base text-muted-foreground">
            {formatTokyo(job.work_starts_at)} / {JOB_STATUS_LABELS[job.status]}
          </p>
          <Link
            href={`/funeral-company/jobs/${job.id}`}
            className="tap-target mt-2 inline-flex w-full items-center justify-center rounded-xl border-2 border-funeral bg-white px-4 text-base font-medium text-funeral"
          >
            詳細を見る
          </Link>
        </li>
      ))}
    </ul>
  );
}
