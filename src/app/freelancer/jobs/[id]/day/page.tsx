import { JobFeatureStub } from "@/components/jobs/job-feature-stub";

type Props = { params: Promise<{ id: string }> };

export default function Page({ params }: Props) {
  return (
    <JobFeatureStub
      params={params}
      role="freelancer"
      title="当日操作"
      description="到着しました／業務を開始します／終了報告の操作枠です。"
    />
  );
}
