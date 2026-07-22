import { expect, test } from "@playwright/test";

test("visitor can run both real behaviours for retry storm", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Choose an exhibit").selectOption("retry-storm");
  await page.getByRole("button", { name: "Run exhibit" }).click();
  await expect(page.getByLabel("Broken behaviour result")).toContainText("assertion failed");
  await expect(page.getByLabel("Repaired behaviour result")).toContainText("assertion passed");
  await expect(page.getByLabel("Broken behaviour result")).toContainText("15");
  await expect(page.getByLabel("Repaired behaviour result")).toContainText("3");
});

test("visitor can switch an exhibit and observe a different broken result", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Choose an exhibit").selectOption("race-condition");
  await page.getByRole("button", { name: "Run broken version" }).click();
  await expect(page.getByLabel("Broken behaviour result")).toContainText("9");
  await expect(page.getByLabel("Broken behaviour result")).toContainText("14");
});

test("keyboard users can focus and run the repaired version", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Choose an exhibit").selectOption("floating-currency");
  await page.getByRole("button", { name: "Run repaired version" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Repaired behaviour result")).toContainText("assertion passed");
});
