import { test, expect } from "vitest";

import {
  KANAGAWA_CREMATORIUMS,
  getCrematoriumPinBySlug,
  latLngToMapPercent,
} from "@/lib/constants/kanagawa-crematoriums";
import { DEMO_CREMATORIUM_SLUG } from "@/lib/constants/demo-crematorium";

test("神奈川県火葬場マスタは21件（実在20 + デモ1）", () => {
  expect(KANAGAWA_CREMATORIUMS.length).toBe(21);
});

test("デモ用練習斎場が先頭に含まれる", () => {
  const pin = getCrematoriumPinBySlug(DEMO_CREMATORIUM_SLUG);
  expect(pin?.isDemo).toBe(true);
  expect(pin?.name).toContain("【デモ】");
  expect(KANAGAWA_CREMATORIUMS[0].id).toBe(DEMO_CREMATORIUM_SLUG);
});

test("久保山斎場のスラッグで取得できる", () => {
  const pin = getCrematoriumPinBySlug("kuboyama");
  expect(pin?.name).toBe("久保山斎場");
  expect(pin?.address).toContain("元久保町");
});

test("緯度経度を地図%に変換できる", () => {
  const { x, y } = latLngToMapPercent(35.45, 139.62);
  expect(x).toBeGreaterThan(0);
  expect(x).toBeLessThan(100);
  expect(y).toBeGreaterThan(0);
  expect(y).toBeLessThan(100);
});
