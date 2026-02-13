import { test, expect, type Page } from "@playwright/test";

async function resetAndNavigate(page: Page, path: string) {
  await page.goto(path);
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("dalmuti-score-storage", JSON.stringify({ state: { onboardingCompleted: true, onboardingStep: -1, players: [], sessions: [], theme: "system" }, version: 3 }));
  });
  await page.reload();
  await page.waitForFunction(
    () => !document.querySelector(".animate-pulse"),
    { timeout: 10000 }
  );
}

/**
 * Create a session with a set and add rounds.
 * Ends on the set detail page with scoreboard visible.
 */
async function createSessionWithRounds(
  page: Page,
  name: string,
  playerNames: string,
  roundCount: number
) {
  // Create session
  await page.getByRole("button", { name: "+ 새 세션" }).click();
  await page.getByLabel("세션 이름").fill(name);
  await page.getByLabel(/선수 이름/).fill(playerNames);
  await page.getByRole("button", { name: "세션 만들기", exact: true }).click();
  await expect(page).toHaveURL(/\/sessions\/.+/);

  // Create a set
  await page.getByRole("button", { name: "첫 세트 만들기" }).click();
  const input = page.getByLabel("목표 라운드 수");
  await input.clear();
  await input.fill(String(roundCount));
  await page.getByRole("button", { name: "세트 만들기", exact: true }).click();

  // Navigate to set detail
  await page.getByRole("tab", { name: "세트 이력" }).click();
  await page.getByRole("link", { name: /세트 1/ }).click();
  await expect(page).toHaveURL(/\/sets\/.+/);

  // Add rounds
  for (let i = 0; i < roundCount; i++) {
    if (i === 0) {
      await page.getByText("첫 라운드 추가").click();
    } else {
      await page.getByRole("link", { name: "새 라운드 추가" }).click();
    }
    await expect(page.getByText("참가자 선택")).toBeVisible();
    await page.getByRole("button", { name: /명/ }).click();
    await expect(page.getByText("순위 입력")).toBeVisible();
    await page.getByRole("button", { name: "저장" }).click();
    // Wait for navigation back to set detail page
    await expect(page.getByRole("columnheader", { name: `R${i + 1}` })).toBeVisible();
  }
}

test.describe("Statistics page", () => {
  test("shows empty state when no sessions exist", async ({ page }) => {
    await resetAndNavigate(page, "/stats");
    await expect(page.getByText("아직 데이터가 없습니다")).toBeVisible();
    await expect(
      page.getByText("세션을 만들고 라운드를 기록하세요")
    ).toBeVisible();
  });

  test("navigates to stats page from sessions list", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");
    await page.getByRole("link", { name: "통계" }).click();
    await expect(page).toHaveURL("/stats");
  });

  test("displays summary stats after creating a session with rounds", async ({
    page,
  }) => {
    await resetAndNavigate(page, "/sessions");
    await createSessionWithRounds(page, "통계 테스트", "철수, 영희", 3);

    // Navigate to global stats
    await page.goto("/stats");
    await page.waitForFunction(
      () => !document.querySelector(".animate-pulse"),
      { timeout: 10000 }
    );

    // Summary cards should show correct values
    await expect(page.getByText("총 세션")).toBeVisible();
    await expect(page.getByText("총 세트")).toBeVisible();
    await expect(page.getByText("총 라운드")).toBeVisible();
    await expect(page.getByText("참여 선수")).toBeVisible();
    await expect(page.getByText("평균 라운드/세션")).toBeVisible();

    // Check actual values
    // 1 session, 1 set, 3 rounds, 2 players, avg 3.0 rounds/session
    const statCards = page.locator(".rounded-2xl.border");
    await expect(statCards.filter({ hasText: "총 세션" })).toContainText("1");
    await expect(statCards.filter({ hasText: "총 세트" })).toContainText("1");
    await expect(statCards.filter({ hasText: "총 라운드" })).toContainText("3");
    await expect(statCards.filter({ hasText: "참여 선수" })).toContainText("2");
    await expect(
      statCards.filter({ hasText: "평균 라운드/세션" })
    ).toContainText("3.0");
  });

  test("shows player rankings in stats overview", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");
    await createSessionWithRounds(page, "랭킹 테스트", "철수, 영희", 2);

    await page.goto("/stats");
    await page.waitForFunction(
      () => !document.querySelector(".animate-pulse"),
      { timeout: 10000 }
    );

    // Player rankings section should be visible
    await expect(page.getByText("선수별 성적")).toBeVisible();
    // Verify player names appear in the table cells
    await expect(page.getByRole("cell", { name: "철수" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "영희" })).toBeVisible();
  });

  test("shows head-to-head comparison with two players", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");
    await createSessionWithRounds(page, "대결 테스트", "철수, 영희", 2);

    await page.goto("/stats");
    await page.waitForFunction(
      () => !document.querySelector(".animate-pulse"),
      { timeout: 10000 }
    );

    // Head-to-head section should be visible
    await expect(page.getByText("라이벌 비교")).toBeVisible();
  });
});

test.describe("Session stats tab", () => {
  test("shows score trend chart after 2+ rounds", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");
    await createSessionWithRounds(page, "차트 테스트", "A, B", 3);

    // Click stats tab (on set detail page, same SessionStatsTab component)
    await page.getByRole("tab", { name: "통계" }).click();

    // Chart section should be visible
    await expect(page.getByText("라운드별 점수 추이")).toBeVisible();

    // Summary stats should appear
    await expect(page.getByText("최다 1위")).toBeVisible();
    await expect(page.getByText("총 라운드")).toBeVisible();
    await expect(page.getByText("최저 총점 (승자)")).toBeVisible();
    await expect(page.getByText("최고 총점 (패자)")).toBeVisible();
  });

  test("shows message when less than 2 rounds for chart", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");
    await createSessionWithRounds(page, "1라운드", "A, B", 1);

    await page.getByRole("tab", { name: "통계" }).click();

    await expect(
      page.getByText("2라운드 이상 진행하면 추이 차트가 표시됩니다")
    ).toBeVisible();
  });

  test("session stats show correct round count", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");
    await createSessionWithRounds(page, "라운드 수", "A, B", 4);

    await page.getByRole("tab", { name: "통계" }).click();

    // Total rounds should be 4
    const totalRoundsCard = page.locator(".rounded-2xl.border").filter({
      hasText: "총 라운드",
    });
    await expect(totalRoundsCard).toContainText("4");
  });
});
