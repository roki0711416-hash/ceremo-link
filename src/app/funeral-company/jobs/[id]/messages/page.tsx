import { JobFeatureStub } from "@/components/jobs/job-feature-stub";

type Props = { params: Promise<{ id: string }> };

export default function Page({ params }: Props) {
  return (
    <JobFeatureStub
      params={params}
      role="funeral_company"
      title="通常メッセージ"
      description="契約成立後の当事者間メッセージです。故人名は通知・件名に含めません。"
    />
  );
}
