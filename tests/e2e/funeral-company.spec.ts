import { expect, test } from "@playwright/test";

test("未ログインでは葬儀社ホームを開けない", async ({ page }) => {
  await page.goto("/funeral-company");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
});

test("未ログインでは火葬場一覧を開けない", async ({ page }) => {
  await page.goto("/funeral-company/facilities");
  await expect(page).toHaveURL(/\/login/);
});

test("未ログインではプロフィール画面を開けない", async ({ page }) => {
  await page.goto("/funeral-company/profile");
  await expect(page).toHaveURL(/\/login/);
});
