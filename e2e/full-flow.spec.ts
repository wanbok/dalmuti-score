import { test, expect, type Page } from "@playwright/test";

// Helper: clear localStorage and wait for hydration
async function resetAndNavigate(page: Page, path: string) {
  await page.goto(path);
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("dalmuti-score-storage", JSON.stringify({ state: { onboardingCompleted: true, onboardingStep: -1, players: [], sessions: [], theme: "system" }, version: 3 }));
  });
  await page.reload();
  // Wait for client hydration (loading skeleton disappears)
  await page.waitForFunction(() => {
    return !document.querySelector(".animate-pulse");
  }, { timeout: 10000 });
}

/** Create a session from the sessions list page */
async function createSession(page: Page, name: string, playerNames: string) {
  await page.getByRole("button", { name: "+ 새 세션" }).click();
  await page.getByLabel("세션 이름").fill(name);
  await page.getByLabel(/선수 이름/).fill(playerNames);
  await page.getByRole("button", { name: "세션 만들기", exact: true }).click();
  await expect(page).toHaveURL(/\/sessions\/.+/);
}

/** Create a set on the session page and navigate to the set detail page */
async function createSetAndNavigate(page: Page, targetRounds = 4) {
  // Click "첫 세트 만들기" if no sets, or FAB otherwise
  const firstSetBtn = page.getByRole("button", { name: "첫 세트 만들기" });
  if (await firstSetBtn.count() > 0) {
    await firstSetBtn.click();
  } else {
    await page.getByRole("button", { name: "새 세트 만들기" }).click();
  }

  // Fill target rounds in dialog
  const input = page.getByLabel("목표 라운드 수");
  await input.clear();
  await input.fill(String(targetRounds));
  await page.getByRole("button", { name: "세트 만들기", exact: true }).click();

  // Navigate to set detail via "세트 이력" tab
  await page.getByRole("tab", { name: "세트 이력" }).click();
  await page.getByRole("link", { name: /세트/ }).last().click();
  await expect(page).toHaveURL(/\/sets\/.+/);
}

/** Add a round from the set detail page */
async function addRound(page: Page) {
  const firstRoundBtn = page.getByText("첫 라운드 추가");
  if (await firstRoundBtn.count() > 0) {
    await firstRoundBtn.click();
  } else {
    await page.getByRole("link", { name: "새 라운드 추가" }).click();
  }

  await expect(page.getByText("참가자 선택")).toBeVisible();
  await page.getByRole("button", { name: /명/ }).click();
  await expect(page.getByText("순위 입력")).toBeVisible();
  await page.getByRole("button", { name: "저장" }).click();
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
  test("create session → create set → add round → verify scoreboard", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");

    // Step 1: Create session
    await createSession(page, "금요게임", "철수, 영희, 민수");

    // Step 2: Create set and navigate to set detail
    await createSetAndNavigate(page, 4);

    // Step 3: Add first round
    await addRound(page);

    // Step 4: Verify scoreboard on set detail page
    await expect(page.getByRole("columnheader", { name: "R1" })).toBeVisible();
    await expect(page.getByText("합계")).toBeVisible();

    // Verify round appears in history
    await page.getByRole("tab", { name: "라운드 이력" }).click();
    await expect(page.getByText("라운드 1")).toBeVisible();
    await expect(page.getByText("3명 참가")).toBeVisible();
  });

  test("data persists after page reload", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");

    // Create a session
    await createSession(page, "영속성 테스트", "A, B");

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
    await createSession(page, "이전이름", "A, B");

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
    await createSession(page, "선수추가테스트", "철수");

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
  test("can delete a round on set detail page", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");

    // Create session with a set and round
    await createSession(page, "삭제테스트", "A, B");
    await createSetAndNavigate(page, 4);
    await addRound(page);

    // Verify round exists
    await expect(page.getByRole("columnheader", { name: "R1" })).toBeVisible();

    // Switch to rounds tab, then delete round
    await page.getByRole("tab", { name: "라운드 이력" }).click();
    await page.getByRole("button", { name: "삭제" }).click();

    // Confirm deletion in the custom dialog
    await expect(page.getByText("이 라운드를 삭제하시겠습니까?")).toBeVisible();
    await page.getByRole("button", { name: "삭제" }).last().click();

    // Empty state shown
    await expect(page.getByText("아직 라운드가 없습니다")).toBeVisible();
  });
});
