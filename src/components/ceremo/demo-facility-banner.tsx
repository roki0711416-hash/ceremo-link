import { Info } from "lucide-react";

export function DemoFacilityBanner() {
  return (
    <div
      role="status"
      className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950"
    >
      <Info className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden />
      <div>
        <p className="font-semibold">デモ用の練習斎場です</p>
        <p>
          実在の火葬場ではありません。依頼フローの動作確認・練習にご利用ください。
        </p>
      </div>
    </div>
  );
}
