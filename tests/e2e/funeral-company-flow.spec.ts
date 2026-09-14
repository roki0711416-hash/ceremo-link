import { expect, test } from "@playwright/test";
import path from "node:path";
import { writeFileSync, mkdirSync } from "node:fs";

test.describe.configure({ timeout: 90000 });

test("葬儀社ログイン後にプロフィール〜火葬場〜依頼入口まで操作できる", async ({
  page,
}) => {
  const email = `e2e.funeral.${Date.now()}@ceremo-link.test`;
  const password = "password1";

  await page.goto("/signup/funeral-company");
  await page.getByLabel("会社名").fill("E2Eサンプル葬祭");
  await page.getByLabel("メールアドレス").fill(email);
  await page.getByLabel("パスワード").fill(password);
  await page.getByRole("button", { name: "葬儀社として登録" }).click();

  await expect(
    page.getByRole("heading", { name: /葬儀社プロフィール登録|会社情報の編集/ }),
  ).toBeVisible({ timeout: 20000 });

  await page.locator("#companyName").fill("E2Eサンプル葬祭");
  await page.locator("#representativeName").fill("E2Eサンプル葬祭");
  await page.locator("#contactPersonName").fill("担当太郎");
  await page.locator("#postalCode").fill("220-0001");
  await page.locator("#municipalityId").selectOption({ index: 1 });
  await page.locator("#address").fill("神奈川県横浜市西区サンプル1-1");
  await page.locator("#phone").fill("045-000-0000");
  await page.locator("#emergencyPhone").fill("045-000-0001");
  await page.locator("#termsAccepted").check();

  const tmpDir = path.join(process.cwd(), "tmp");
  mkdirSync(tmpDir, { recursive: true });
  const pdfPath = path.join(tmpDir, "e2e-company-doc.pdf");
  writeFileSync(
    pdfPath,
    Buffer.from("%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n", "utf8"),
  );
  await page.locator("#businessDocument").setInputFiles(pdfPath);
  await page.getByRole("button", { name: "保存する" }).click();

  await expect(page.getByRole("heading", { name: "E2Eサンプル葬祭" })).toBeVisible({
    timeout: 20000,
  });
  await expect(page.getByText("担当者: 担当太郎").first()).toBeVisible();

  await page.getByRole("link", { name: "新しい依頼を作成" }).click();
  await expect(page.getByRole("heading", { name: "火葬場を選択" })).toBeVisible();
  await expect(page.getByText("仮データ").first()).toBeVisible();

  await page.getByRole("link", { name: "施設詳細" }).first().click();
  await expect(page.getByText("地図（仮表示）")).toBeVisible();
  await expect(
    page.getByText("審査完了後に、この火葬場で依頼を作成できます。"),
  ).toBeVisible();

  await page.getByRole("link", { name: "火葬案内スタッフの対応状況" }).click();
  await expect(
    page.getByRole("heading", { name: "火葬案内スタッフの対応状況" }),
  ).toBeVisible();
  await expect(page.getByText(/公式予約枠ではありません/)).toBeVisible();
  await expect(page.getByText(/人数は審査完了後に表示されます/)).toBeVisible();

  await page.getByRole("button", { name: "前の月" }).click();
  await page.getByRole("button", { name: "次の月" }).click();
  await expect(
    page.getByText("審査完了後に、この火葬場で依頼を作成できます。"),
  ).toBeVisible();
});
