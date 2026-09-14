"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { DemoFacilityBanner } from "@/components/ceremo/demo-facility-banner";
import {
  KANAGAWA_CREMATORIUMS,
  KANAGAWA_CREMATORIUM_SOURCE_URL,
  crematoriumDetailPath,
  type KanagawaCrematoriumPin,
} from "@/lib/constants/kanagawa-crematoriums";
import { cn } from "@/lib/utils";

import { KanagawaIllustratedMap, KanagawaMapAttribution } from "./kanagawa-illustrated-map";

type MapPin = KanagawaCrematoriumPin & {
  dbId?: string;
};

type DbFacility = {
  id: string;
  name: string;
  slug?: string | null;
};

type KanagawaCrematoriumMapProps = {
  role: "funeral_company" | "freelancer";
  dbFacilities?: DbFacility[];
  homeHref: string;
};

export function KanagawaCrematoriumMap({
  role,
  dbFacilities = [],
  homeHref,
}: KanagawaCrematoriumMapProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pins = useMemo<MapPin[]>(
    () =>
      KANAGAWA_CREMATORIUMS.map((pin) => {
        const dbId =
          dbFacilities.find((row) => row.slug === pin.id)?.id ??
          dbFacilities.find(
            (row) =>
              row.name.replace(/\s/g, "") === pin.name.replace(/\s/g, "") ||
              row.name.includes(pin.name) ||
              pin.name.includes(row.name),
          )?.id;
        return { ...pin, dbId };
      }),
    [dbFacilities],
  );

  const tone = role === "funeral_company" ? "funeral" : "freelancer";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          神奈川県の火葬場マップ
        </h1>
        <p className="text-base text-muted-foreground">
          市区町村ごとに色分けした地図から、火葬場を選んで予約カレンダーへ進みます。
        </p>
      </div>

      <DemoFacilityBanner />

      <KanagawaIllustratedMap
        pins={pins}
        role={role}
        tone={tone}
        selectedId={selectedId}
        onSelectPin={setSelectedId}
        onNavigate={(path) => router.push(path)}
      />

      <ul className="space-y-2 rounded-xl border border-border bg-surface p-4 text-sm">
        {pins.map((pin) => (
          <li key={pin.id}>
            <button
              type="button"
              onClick={() => {
                setSelectedId(pin.id);
                router.push(
                  crematoriumDetailPath(role, { id: pin.id, dbId: pin.dbId }),
                );
              }}
              className={cn(
                "tap-target w-full rounded-lg px-3 py-2 text-left text-base hover:bg-muted",
                pin.isDemo
                  ? "border border-amber-300 bg-amber-50 hover:bg-amber-100"
                  : "",
                tone === "funeral" ? "text-funeral" : "text-freelancer",
              )}
            >
              {pin.name}
              {pin.isDemo ? (
                <span className="ml-2 rounded bg-amber-200 px-1.5 py-0.5 text-xs font-medium text-amber-950">
                  デモ用
                </span>
              ) : null}
              <span className="ml-2 text-muted-foreground">
                {pin.municipalityName}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="text-sm text-muted-foreground">
        地図は神奈川県の市区町村境界をもとにしたイラストです。マーカー位置は住所をもとにした概略です。火葬場の公式予約枠ではありません。
        料金目安は
        <a
          href={KANAGAWA_CREMATORIUM_SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-1 underline underline-offset-2"
        >
          公開情報
        </a>
        を参考にしています。
      </p>

      <KanagawaMapAttribution />

      <a
        href={homeHref}
        className={cn(
          "block text-center text-base underline-offset-4 hover:underline",
          tone === "funeral" ? "text-funeral" : "text-freelancer",
        )}
      >
        ホームへ戻る
      </a>
    </div>
  );
}
