"use client";

import { useMemo } from "react";

import {
  crematoriumDetailPath,
  type KanagawaCrematoriumPin,
} from "@/lib/constants/kanagawa-crematoriums";
import { getKanagawaPinPosition, kanagawaMunicipalityMap } from "@/lib/constants/kanagawa-municipality-map";
import { cn } from "@/lib/utils";

type MapPin = KanagawaCrematoriumPin & {
  dbId?: string;
  x: number;
  y: number;
};

type KanagawaIllustratedMapProps = {
  pins: Omit<MapPin, "x" | "y">[];
  role: "funeral_company" | "freelancer";
  tone: "funeral" | "freelancer";
  selectedId: string | null;
  onSelectPin: (pinId: string) => void;
  onNavigate: (path: string) => void;
};

export function KanagawaIllustratedMap({
  pins,
  role,
  tone,
  selectedId,
  onSelectPin,
  onNavigate,
}: KanagawaIllustratedMapProps) {
  const { viewBox } = kanagawaMunicipalityMap;

  const positionedPins = useMemo<MapPin[]>(
    () =>
      pins.map((pin) => {
        const projected = getKanagawaPinPosition(pin.id);
        return {
          ...pin,
          x: projected?.x ?? 50,
          y: projected?.y ?? 50,
        };
      }),
    [pins],
  );

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border bg-[#f8f9fb] shadow-inner"
      style={{ aspectRatio: `${viewBox.width} / ${viewBox.height}` }}
    >
      <KanagawaMunicipalityMapArtwork />

      {positionedPins.map((pin) => {
        const isSelected = pin.id === selectedId;
        const isDemo = pin.isDemo === true;
        const detailPath = crematoriumDetailPath(role, {
          id: pin.id,
          dbId: pin.dbId,
        });

        return (
          <button
            key={pin.id}
            type="button"
            aria-label={`${pin.name}を選択`}
            aria-pressed={isSelected}
            onClick={() => {
              onSelectPin(pin.id);
              onNavigate(detailPath);
            }}
            className="absolute z-10 -translate-x-1/2 -translate-y-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              left: `${pin.x}%`,
              top: `${pin.y}%`,
            }}
          >
            <span
              className={cn(
                "flex flex-col items-center gap-0.5 transition-transform",
                isSelected ? "scale-110" : "hover:scale-105",
              )}
            >
              <MapPinIcon
                className={cn(
                  isDemo
                    ? "text-amber-600"
                    : isSelected
                      ? tone === "funeral"
                        ? "text-funeral"
                        : "text-freelancer"
                      : "text-[#4a3e7f]",
                )}
              />
              {isSelected || isDemo ? (
                <span
                  className={cn(
                    "max-w-[7.5rem] truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium text-white shadow",
                    isDemo
                      ? "bg-amber-600"
                      : tone === "funeral"
                        ? "bg-funeral"
                        : "bg-freelancer",
                  )}
                >
                  {isDemo ? "デモ" : pin.name}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      width="28"
      height="36"
      viewBox="0 0 28 36"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M14 0C6.82 0 1 5.82 1 13c0 9.75 13 23 13 23s13-13.25 13-23C27 5.82 21.18 0 14 0zm0 18a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
    </svg>
  );
}

function KanagawaMunicipalityMapArtwork() {
  const { viewBox, municipalities } = kanagawaMunicipalityMap;

  return (
    <svg
      viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
      className="absolute inset-0 size-full"
      aria-label="神奈川県市区町村地図"
      role="img"
    >
      <rect width={viewBox.width} height={viewBox.height} fill="#f8f9fb" />

      {municipalities.map((municipality) => (
        <g key={municipality.code}>
          <path
            d={municipality.path}
            fill={municipality.color}
            stroke="#ffffff"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
          {municipality.showLabel ? (
            <text
              x={municipality.labelX}
              y={municipality.labelY}
              fill="#2f3440"
              fontSize={municipality.fontSize}
              fontWeight={600}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ pointerEvents: "none" }}
            >
              {municipality.displayName}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}

export function KanagawaMapAttribution() {
  return (
    <p className="text-xs text-muted-foreground">
      {kanagawaMunicipalityMap.attribution}
    </p>
  );
}
