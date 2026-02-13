import { expect, type Page } from "@playwright/test";

/** Current Zustand persist store version */
const STORE_VERSION = 3;

/** Clear localStorage with fresh store state and wait for hydration */
export async function resetAndNavigate(page: Page, path: string) {
  await page.goto(path);
  await page.evaluate((version) => {
    localStorage.clear();
    localStorage.setItem(
      "dalmuti-score-storage",
      JSON.stringify({
        state: { onboardingCompleted: true, onboardingStep: -1, players: [], sessions: [], theme: "system" },
        version,
      })
    );
  }, STORE_VERSION);
  await page.reload();
  await waitForHydration(page);
}

/** Wait for client-side hydration to complete (loading skeleton disappears) */
export async function waitForHydration(page: Page) {
  await page.waitForFunction(
    () => !document.querySelector(".animate-pulse"),
    { timeout: 10000 }
  );
}

/** Create a session from the sessions list page. Ends on session detail page. */
export async function createSession(page: Page, name: string, playerNames: string) {
  await page.getByRole("button", { name: "+ 새 세션" }).click();
  await page.getByLabel("세션 이름").fill(name);
  await page.getByLabel(/선수 이름/).fill(playerNames);
  await page.getByRole("button", { name: "세션 만들기", exact: true }).click();
  await expect(page).toHaveURL(/\/sessions\/.+/);
}

/** Create a set on the session page and navigate to the set detail page */
export async function createSetAndNavigate(page: Page, targetRounds = 4) {
  const firstSetBtn = page.getByRole("button", { name: "첫 세트 만들기" });
  if (await firstSetBtn.count() > 0) {
    await firstSetBtn.click();
  } else {
    await page.getByRole("button", { name: "새 세트 만들기" }).click();
  }

  const input = page.getByLabel("목표 라운드 수");
  await input.clear();
  await input.fill(String(targetRounds));
  await page.getByRole("button", { name: "세트 만들기", exact: true }).click();

  await page.getByRole("tab", { name: "세트 이력" }).click();
  await page.getByRole("link", { name: /세트/ }).last().click();
  await expect(page).toHaveURL(/\/sets\/.+/);
}

/** Add a round from the set detail page. Optionally toggle revolution. */
export async function addRound(page: Page, opts: { revolution?: boolean } = {}) {
  const firstRoundBtn = page.getByText("첫 라운드 추가");
  if (await firstRoundBtn.count() > 0) {
    await firstRoundBtn.click();
  } else {
    await page.getByRole("link", { name: "새 라운드 추가" }).click();
  }

  await expect(page.getByText("참가자 선택")).toBeVisible();
  await page.getByRole("button", { name: /명/ }).click();
  await expect(page.getByText("순위 입력")).toBeVisible();

  if (opts.revolution) {
    await page.getByLabel("혁명 발생").check();
    await expect(
      page.getByText("혁명! 세금 면제 — 이번 라운드는 세금을 내지 않습니다.")
    ).toBeVisible();
  }

  await page.getByRole("button", { name: "저장" }).click();
}

/**
 * Create a session with a set containing `roundCount` rounds.
 * Ends on the set detail page with scoreboard visible.
 */
export async function createSessionWithRounds(
  page: Page,
  name: string,
  playerNames: string,
  roundCount: number
) {
  await createSession(page, name, playerNames);
  await createSetAndNavigate(page, roundCount);

  for (let i = 0; i < roundCount; i++) {
    await addRound(page);
    await expect(page.getByRole("columnheader", { name: `R${i + 1}` })).toBeVisible();
  }
}
