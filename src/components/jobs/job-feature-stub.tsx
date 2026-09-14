import Link from "next/link";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { requireRole } from "@/lib/auth/session";

type JobFeatureStubProps = {
  params: Promise<{ id: string }>;
  role: "freelancer" | "funeral_company";
  title: string;
  description: string;
};

export async function JobFeatureStub({
  params,
  role,
  title,
  description,
}: JobFeatureStubProps) {
  const { id } = await params;
  const profile = await requireRole([role]);
  if (!profile) redirect("/login");

  const back =
    role === "freelancer"
      ? `/freelancer/jobs/${id}`
      : `/funeral-company/jobs/${id}`;

  return (
    <>
      <AppHeader email={profile.email} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-8">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-sm">枠のみ実装済みです。送受信UIは次の段階で追加します。</p>
        <Link href={back} className="text-sm underline">
          依頼詳細へ戻る
        </Link>
      </main>
    </>
  );
}
