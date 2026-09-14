import { expect, test } from "@playwright/test";

test("トップページにセレモリンクと役割カードが表示される", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "セレモリンク" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "葬儀社の方" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "フリーランスの方" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "ログイン" }).first()).toBeVisible();
});

test("利用者区分選択ができる", async ({ page }) => {
  await page.goto("/select-role");
  await expect(page.getByRole("heading", { name: "セレモリンク" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "葬儀社の方" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "フリーランスの方" }),
  ).toBeVisible();
});

test("ログイン画面が表示される", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "新規登録はこちら" }),
  ).toBeVisible();
});
