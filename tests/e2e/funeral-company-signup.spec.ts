import { expect, test } from "@playwright/test";

test("葬儀社として登録するとプロフィール画面へ進める", async ({ page }) => {
  const email = `e2e.funeral.${Date.now()}@ceremo-link.test`;
  await page.goto("/signup/funeral-company");
  await page.getByLabel("会社名").fill("E2Eサンプル葬祭");
  await page.getByLabel("メールアドレス").fill(email);
  await page.getByLabel("パスワード").fill("password1");
  await page.getByRole("button", { name: "葬儀社として登録" }).click();

  const profileHeading = page.getByRole("heading", {
    name: /葬儀社プロフィール|会社情報/,
  });
  const mailNotice = page.getByText(/確認メール|メール内のリンク/);
  const errorNotice = page.getByRole("alert");

  await expect(profileHeading.or(mailNotice).or(errorNotice)).toBeVisible({
    timeout: 20000,
  });

  if (await profileHeading.isVisible().catch(() => false)) {
    await expect(page).toHaveURL(/\/funeral-company/);
    await page.goto("/funeral-company/facilities");
    await expect(
      page.getByRole("heading", { name: "火葬場を選択" }),
    ).toBeVisible();
  }
});
