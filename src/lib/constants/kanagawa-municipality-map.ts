import raw from "./kanagawa-municipality-map.json";

export type KanagawaMunicipalityMapData = typeof raw;

export const kanagawaMunicipalityMap = raw as KanagawaMunicipalityMapData;

export function getKanagawaPinPosition(pinId: string) {
  return kanagawaMunicipalityMap.pinPositions[
    pinId as keyof typeof kanagawaMunicipalityMap.pinPositions
  ];
}
