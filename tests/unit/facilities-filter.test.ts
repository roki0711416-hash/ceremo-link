import { describe, expect, it } from "vitest";

import { filterFacilities } from "@/app/funeral-company/facilities/facilities-browser";

const facilities = [
  {
    id: "1",
    name: "サンプル西横浜斎場",
    address: "神奈川県横浜市西区サンプル1-1",
    municipalityName: "横浜市西区",
    municipalityId: "nishi",
    isPlaceholder: true,
    dataLabel: "仮データ",
  },
  {
    id: "2",
    name: "サンプル藤沢斎場",
    address: "神奈川県藤沢市サンプル4-4",
    municipalityName: "藤沢市",
    municipalityId: "fujisawa",
    isPlaceholder: true,
    dataLabel: "仮データ",
  },
];

describe("filterFacilities", () => {
  it("filters by municipality", () => {
    expect(filterFacilities(facilities, "fujisawa", "").map((item) => item.id)).toEqual([
      "2",
    ]);
  });

  it("filters by facility name", () => {
    expect(filterFacilities(facilities, "all", "西横浜").map((item) => item.id)).toEqual([
      "1",
    ]);
  });
});
