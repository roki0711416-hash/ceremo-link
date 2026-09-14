import { FuneralCompanyShell, ScreenState } from "@/components/layout/funeral-company-shell";

export default function FuneralCompanyLoading() {
  return (
    <FuneralCompanyShell title="読み込み中">
      <ScreenState title="読み込み中">画面を準備しています。</ScreenState>
    </FuneralCompanyShell>
  );
}
