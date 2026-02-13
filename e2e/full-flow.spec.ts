import { test, expect, type Page } from "@playwright/test";

// Helper: clear localStorage and wait for hydration
async function resetAndNavigate(page: Page, path: string) {
  await page.goto(path);
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("dalmuti-score-storage", JSON.stringify({ state: { onboardingCompleted: true, onboardingStep: -1, players: [], sessions: [], theme: "system" }, version: 2 }));
  });
  await page.reload();
  // Wait for client hydration (loading skeleton disappears)
  await page.waitForFunction(() => {
    return !document.querySelector(".animate-pulse");
  }, { timeout: 10000 });
}

test.describe("Session management", () => {
  test("creates a new session with players", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");

    // Click new session button
    await page.getByRole("button", { name: "+ 새 세션" }).click();

    // Fill in session form
    await page.getByLabel("세션 이름").fill("테스트 게임");
    await page.getByLabel(/선수 이름/).fill("철수, 영희, 민수");
    await page.getByRole("button", { name: "세션 만들기", exact: true }).click();

    // Should navigate to session page
    await expect(page).toHaveURL(/\/sessions\/.+/);
    await expect(page.getByText("테스트 게임")).toBeVisible();
  });

  test("shows empty state when no sessions", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");
    await expect(page.getByText("세션이 없습니다")).toBeVisible();
  });
});

test.describe("Full game flow", () => {
  test("create session → add round → verify scoreboard", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");

    // Step 1: Create session
    await page.getByRole("button", { name: "+ 새 세션" }).click();
    await page.getByLabel("세션 이름").fill("금요게임");
    await page.getByLabel(/선수 이름/).fill("철수, 영희, 민수");
    await page.getByRole("button", { name: "세션 만들기", exact: true }).click();
    await expect(page).toHaveURL(/\/sessions\/.+/);

    // Step 2: Navigate to add round
    await page.getByRole("link", { name: "라운드 추가" }).click();
    await expect(page.getByText("참가자 선택")).toBeVisible();

    // All players should be checked by default
    await expect(page.getByLabel("철수")).toBeChecked();
    await expect(page.getByLabel("영희")).toBeChecked();
    await expect(page.getByLabel("민수")).toBeChecked();

    // Confirm participants
    await page.getByRole("button", { name: /3명/ }).click();

    // Step 3: Ranking screen
    await expect(page.getByText("순위 입력")).toBeVisible();
    await expect(page.getByText("철수")).toBeVisible();

    // Save with default order (1: 철수, 2: 영희, 3: 민수)
    await page.getByRole("button", { name: "저장" }).click();

    // Step 4: Verify scoreboard
    await expect(page.getByRole("columnheader", { name: "R1" })).toBeVisible();
    await expect(page.getByText("합계")).toBeVisible();

    // Verify round appears in history (switch to rounds tab first)
    await page.getByRole("tab", { name: "라운드 이력" }).click();
    await expect(page.getByText(/철수 > 영희 > 민수/)).toBeVisible();
  });

  test("data persists after page reload", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");

    // Create a session
    await page.getByRole("button", { name: "+ 새 세션" }).click();
    await page.getByLabel("세션 이름").fill("영속성 테스트");
    await page.getByLabel(/선수 이름/).fill("A, B");
    await page.getByRole("button", { name: "세션 만들기", exact: true }).click();
    await expect(page).toHaveURL(/\/sessions\/.+/);

    // Reload the page
    await page.reload();
    // Wait for hydration
    await page.waitForFunction(() => !document.querySelector(".animate-pulse"), { timeout: 10000 });

    // Data should still be there
    await expect(page.getByText("영속성 테스트")).toBeVisible();
  });
});

test.describe("Session settings", () => {
  test("can rename session", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");

    // Create session
    await page.getByRole("button", { name: "+ 새 세션" }).click();
    await page.getByLabel("세션 이름").fill("이전이름");
    await page.getByRole("button", { name: "세션 만들기", exact: true }).click();

    // Go to settings
    await page.getByRole("button", { name: "설정" }).click();
    await expect(page).toHaveURL(/\/settings/);

    // Rename
    const input = page.getByLabel("세션 이름");
    await input.clear();
    await input.fill("새이름");
    await page.getByRole("button", { name: "이름 변경" }).click();

    // Navigate back and verify
    await page.goBack();
    await expect(page.getByText("새이름")).toBeVisible();
  });

  test("can add player in settings", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");

    // Create session
    await page.getByRole("button", { name: "+ 새 세션" }).click();
    await page.getByLabel("세션 이름").fill("선수추가테스트");
    await page.getByLabel(/선수 이름/).fill("철수");
    await page.getByRole("button", { name: "세션 만들기", exact: true }).click();

    // Go to settings
    await page.getByRole("button", { name: "설정" }).click();

    // Add a new player
    await page.getByPlaceholder("선수 이름").fill("영희");
    await page.getByRole("button", { name: "추가" }).click();

    // Verify new player appears in the roster
    await expect(page.getByText("영희", { exact: true })).toBeVisible();
  });
});

test.describe("Round edit/delete", () => {
  test("can delete a round and scoreboard recalculates", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");

    // Create session with a round
    await page.getByRole("button", { name: "+ 새 세션" }).click();
    await page.getByLabel("세션 이름").fill("삭제테스트");
    await page.getByLabel(/선수 이름/).fill("A, B");
    await page.getByRole("button", { name: "세션 만들기", exact: true }).click();

    // Add round
    await page.getByRole("link", { name: "라운드 추가" }).click();
    await page.getByRole("button", { name: /2명/ }).click();
    await page.getByRole("button", { name: "저장" }).click();

    // Verify round exists
    await expect(page.getByRole("columnheader", { name: "R1" })).toBeVisible();

    // Switch to rounds tab, then delete round
    await page.getByRole("tab", { name: "라운드 이력" }).click();
    await page.getByRole("button", { name: "삭제" }).click();

    // Confirm deletion in the custom dialog
    await expect(page.getByText("이 라운드를 삭제하시겠습니까?")).toBeVisible();
    await page.getByRole("button", { name: "삭제" }).last().click();

    // Scoreboard should be gone, empty state shown
    await expect(page.getByText("아직 라운드가 없습니다")).toBeVisible();
  });
});
