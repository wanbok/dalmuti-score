import { test, expect } from "@playwright/test";
import {
  resetAndNavigate,
  createSession,
  createSetAndNavigate,
  addRound,
} from "./helpers";

test.describe("Revolution feature", () => {
  // Each revolution test needs a session + set on set detail page
  async function setup(page: import("@playwright/test").Page, name: string, playerNames: string) {
    await resetAndNavigate(page, "/sessions");
    await createSession(page, name, playerNames);
    await createSetAndNavigate(page, 10); // high target so set won't complete
  }

  test("revolution checkbox shows tax exemption banner", async ({ page }) => {
    await setup(page, "혁명 테스트", "철수, 영희");

    // Navigate to add round from set detail
    await page.getByText("첫 라운드 추가").click();
    await page.getByRole("button", { name: /2명/ }).click();

    // Check revolution checkbox
    await page.getByLabel("혁명 발생").check();
    await expect(
      page.getByText("혁명! 세금 면제 — 이번 라운드는 세금을 내지 않습니다.")
    ).toBeVisible();

    // Uncheck — banner should disappear
    await page.getByLabel("혁명 발생").uncheck();
    await expect(
      page.getByText("혁명! 세금 면제 — 이번 라운드는 세금을 내지 않습니다.")
    ).not.toBeVisible();
  });

  test("revolution round shows badge in round history", async ({ page }) => {
    await setup(page, "배지 테스트", "A, B");
    await addRound(page, { revolution: true });

    await page.getByRole("tab", { name: "라운드 이력" }).click();
    await expect(page.getByText("혁명")).toBeVisible();
  });

  test("non-revolution round shows no badge", async ({ page }) => {
    await setup(page, "일반 테스트", "A, B");
    await addRound(page, { revolution: false });

    await page.getByRole("tab", { name: "라운드 이력" }).click();
    await expect(page.getByText("혁명")).not.toBeVisible();
  });

  test("mixed rounds: revolution and normal", async ({ page }) => {
    await setup(page, "혼합 테스트", "A, B");

    await addRound(page, { revolution: false });
    await addRound(page, { revolution: true });

    await page.getByRole("tab", { name: "라운드 이력" }).click();

    const roundItems = page.locator(".rounded-xl.border.border-border.bg-surface-elevated");
    await expect(roundItems).toHaveCount(2);

    await expect(roundItems.nth(1).getByText("혁명")).toBeVisible();
    await expect(roundItems.nth(0).getByText("혁명")).not.toBeVisible();
  });

  test("revolution flag preserved when editing round", async ({ page }) => {
    await setup(page, "수정 테스트", "A, B");
    await addRound(page, { revolution: true });

    await page.getByRole("tab", { name: "라운드 이력" }).click();
    await page.getByRole("link", { name: /라운드 1/ }).click();

    await expect(page).toHaveURL(/\/edit/);

    await page.getByRole("button", { name: /2명/ }).click();

    await expect(page.getByLabel("혁명 발생")).toBeChecked();
    await expect(
      page.getByText("혁명! 세금 면제 — 이번 라운드는 세금을 내지 않습니다.")
    ).toBeVisible();
  });

  test("revolution count appears in stats", async ({ page }) => {
    await setup(page, "통계 혁명", "A, B");
    await addRound(page, { revolution: true });
    await addRound(page, { revolution: false });
    await addRound(page, { revolution: true });

    await page.getByRole("tab", { name: "통계" }).click();

    await expect(page.getByText("혁명 횟수")).toBeVisible();
    await expect(page.getByText("2회")).toBeVisible();
  });
});
