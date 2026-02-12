import { test, expect, type Page } from "@playwright/test";

async function resetAndNavigate(page: Page, path: string) {
  await page.goto(path);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(
    () => !document.querySelector(".animate-pulse"),
    { timeout: 10000 }
  );
}

/** Create a session and navigate to it. Returns the session URL. */
async function createSession(page: Page, name: string, playerNames: string) {
  await resetAndNavigate(page, "/sessions");
  await page.getByRole("button", { name: "+ 새 세션" }).click();
  await page.getByLabel("세션 이름").fill(name);
  await page.getByLabel(/선수 이름/).fill(playerNames);
  await page.getByRole("button", { name: "세션 만들기", exact: true }).click();
  await expect(page).toHaveURL(/\/sessions\/.+/);
}

/** Add a round from the session page. Clicks FAB, confirms participants, optionally checks revolution. */
async function addRound(page: Page, opts: { revolution?: boolean } = {}) {
  // Click FAB (+ button)
  await page.locator("a.fixed").click();
  await expect(page.getByText("참가자 선택")).toBeVisible();

  // Confirm participants (all selected by default)
  await page.getByRole("button", { name: /명/ }).click();
  await expect(page.getByText("순위 입력")).toBeVisible();

  // Optionally check revolution
  if (opts.revolution) {
    await page.getByLabel("혁명 발생").check();
    await expect(
      page.getByText("혁명! 세금 면제 — 이번 라운드는 세금을 내지 않습니다.")
    ).toBeVisible();
  }

  await page.getByRole("button", { name: "저장" }).click();
}

test.describe("Revolution feature", () => {
  test("revolution checkbox shows tax exemption banner", async ({ page }) => {
    await createSession(page, "혁명 테스트", "철수, 영희");

    // Navigate to add round
    await page.getByRole("link", { name: "라운드 추가" }).click();
    await page.getByRole("button", { name: /2명/ }).click();

    // Check revolution checkbox
    await page.getByLabel("혁명 발생").check();

    // Tax exemption banner should appear
    await expect(
      page.getByText("혁명! 세금 면제 — 이번 라운드는 세금을 내지 않습니다.")
    ).toBeVisible();

    // Uncheck — banner should disappear
    await page.getByLabel("혁명 발생").uncheck();
    await expect(
      page.getByText("혁명! 세금 면제 — 이번 라운드는 세금을 내지 않습니다.")
    ).not.toBeVisible();
  });

  test("revolution round shows badges in round history", async ({ page }) => {
    await createSession(page, "배지 테스트", "A, B");
    await addRound(page, { revolution: true });

    // Switch to rounds tab
    await page.getByRole("tab", { name: "라운드 이력" }).click();

    // Revolution badge should be visible
    await expect(page.getByText("혁명")).toBeVisible();
    await expect(page.getByText("세금 면제")).toBeVisible();
  });

  test("non-revolution round shows no badges", async ({ page }) => {
    await createSession(page, "일반 테스트", "A, B");
    await addRound(page, { revolution: false });

    // Switch to rounds tab
    await page.getByRole("tab", { name: "라운드 이력" }).click();

    // No revolution badges
    await expect(page.getByText("혁명")).not.toBeVisible();
    await expect(page.getByText("세금 면제")).not.toBeVisible();
  });

  test("mixed rounds: revolution and normal", async ({ page }) => {
    await createSession(page, "혼합 테스트", "A, B");

    // Round 1: normal
    await addRound(page, { revolution: false });
    // Round 2: revolution
    await addRound(page, { revolution: true });

    // Switch to rounds tab
    await page.getByRole("tab", { name: "라운드 이력" }).click();

    // Should see R1 and R2 in history
    const roundItems = page.locator(".rounded-lg.border.border-border.bg-surface");
    await expect(roundItems).toHaveCount(2);

    // R2 should have revolution badge
    const r2 = roundItems.nth(1);
    await expect(r2.getByText("혁명")).toBeVisible();
    await expect(r2.getByText("세금 면제")).toBeVisible();

    // R1 should NOT have revolution badge
    const r1 = roundItems.nth(0);
    await expect(r1.getByText("혁명")).not.toBeVisible();
  });

  test("revolution flag preserved when editing round", async ({ page }) => {
    await createSession(page, "수정 테스트", "A, B");
    await addRound(page, { revolution: true });

    // Go to rounds tab and click edit
    await page.getByRole("tab", { name: "라운드 이력" }).click();
    await page.getByRole("button", { name: "수정" }).click();

    // Should be on edit page
    await expect(page).toHaveURL(/\/edit/);

    // Confirm participants
    await page.getByRole("button", { name: /2명/ }).click();

    // Revolution checkbox should be pre-checked
    await expect(page.getByLabel("혁명 발생")).toBeChecked();

    // Tax exemption banner should be visible
    await expect(
      page.getByText("혁명! 세금 면제 — 이번 라운드는 세금을 내지 않습니다.")
    ).toBeVisible();
  });

  test("revolution count appears in session stats", async ({ page }) => {
    await createSession(page, "통계 혁명", "A, B");
    await addRound(page, { revolution: true });
    await addRound(page, { revolution: false });
    await addRound(page, { revolution: true });

    // Switch to stats tab
    await page.getByRole("tab", { name: "통계" }).click();

    // Revolution count should show 2회
    await expect(page.getByText("혁명 횟수")).toBeVisible();
    await expect(page.getByText("2회")).toBeVisible();
  });
});
