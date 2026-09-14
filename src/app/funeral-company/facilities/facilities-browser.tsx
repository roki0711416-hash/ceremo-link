"use client";

import { useMemo, useState } from "react";

import { FacilityCard } from "@/components/ceremo/facility-card";
import { ScreenState } from "@/components/layout/funeral-company-shell";

export type FacilityListItem = {
  id: string;
  name: string;
  address: string;
  municipalityName: string;
  municipalityId: string;
  isPlaceholder: boolean;
  dataLabel: string;
};

export function filterFacilities(
  facilities: FacilityListItem[],
  municipalityId: string,
  query: string,
) {
  const q = query.trim();
  return facilities.filter((facility) => {
    const areaOk =
      municipalityId === "all" || facility.municipalityId === municipalityId;
    const queryOk =
      !q ||
      facility.name.includes(q) ||
      facility.municipalityName.includes(q) ||
      facility.address.includes(q);
    return areaOk && queryOk;
  });
}

export function FacilitiesBrowser({
  facilities,
  municipalities,
}: {
  facilities: FacilityListItem[];
  municipalities: { id: string; name: string }[];
}) {
  const [municipalityId, setMunicipalityId] = useState("all");
  const [query, setQuery] = useState("");

  const list = useMemo(
    () => filterFacilities(facilities, municipalityId, query),
    [facilities, municipalityId, query],
  );

  return (
    <div className="space-y-4">
      <label className="block space-y-1">
        <span className="text-base font-medium">市区町村で絞り込み</span>
        <select
          value={municipalityId}
          onChange={(event) => setMunicipalityId(event.target.value)}
          className="tap-target h-11 w-full rounded-xl border border-input bg-white px-3 text-base"
        >
          <option value="all">すべて</option>
          {municipalities.map((municipality) => (
            <option key={municipality.id} value={municipality.id}>
              {municipality.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-base font-medium">施設名検索</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="施設名"
          className="tap-target h-11 w-full rounded-xl border border-input bg-white px-3 text-base"
        />
      </label>

      {facilities.length === 0 ? (
        <ScreenState title="施設がまだ登録されていません">
          仮データの火葬場を表示できませんでした。
        </ScreenState>
      ) : list.length === 0 ? (
        <ScreenState title="条件に合う施設がありません">
          市区町村または施設名を変えて検索してください。
        </ScreenState>
      ) : (
        <ul className="space-y-4">
          {list.map((facility) => (
            <li key={facility.id}>
              <FacilityCard
                facility={{
                  id: facility.id,
                  name: facility.name,
                  area: `${facility.dataLabel} / ${facility.municipalityName}`,
                  address: facility.address,
                  placeholderLabel: facility.isPlaceholder ? "仮画像" : "画像",
                  detailHref: `/funeral-company/facilities/${facility.id}`,
                  selectHref: `/funeral-company/facilities/${facility.id}/staff`,
                  selectLabel: "対応状況を見る",
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
