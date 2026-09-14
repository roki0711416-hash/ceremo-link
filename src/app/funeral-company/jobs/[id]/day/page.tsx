import { JobFeatureStub } from "@/components/jobs/job-feature-stub";

type Props = { params: Promise<{ id: string }> };

export default function Page({ params }: Props) {
  return (
    <JobFeatureStub
      params={params}
      role="funeral_company"
      title="当日操作"
      description="到着・開始・終了報告（問題なし／トラブル）の記録枠です。"
    />
  );
}
