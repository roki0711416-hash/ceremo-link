import { JobFeatureStub } from "@/components/jobs/job-feature-stub";

type Props = { params: Promise<{ id: string }> };

export default function Page({ params }: Props) {
  return (
    <JobFeatureStub
      params={params}
      role="freelancer"
      title="重要変更通知"
      description="未確認バッジと「確認しました」、契約条件変更時の再承諾は後続実装します。"
    />
  );
}
