import { JobFeatureStub } from "@/components/jobs/job-feature-stub";

type Props = { params: Promise<{ id: string }> };

export default function Page({ params }: Props) {
  return (
    <JobFeatureStub
      params={params}
      role="funeral_company"
      title="重要変更通知"
      description="車両番号・集合場所などの変更履歴。契約本体は上書きせず、確認・再承諾フローを後続実装します。"
    />
  );
}
