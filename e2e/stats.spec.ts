import { test, expect } from "@playwright/test";
import {
  resetAndNavigate,
  waitForHydration,
  createSessionWithRounds,
} from "./helpers";

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

    await page.goto("/stats");
    await waitForHydration(page);

    await expect(page.getByText("총 세션")).toBeVisible();
    await expect(page.getByText("총 세트")).toBeVisible();
    await expect(page.getByText("총 라운드")).toBeVisible();
    await expect(page.getByText("참여 선수")).toBeVisible();
    await expect(page.getByText("평균 라운드/세션")).toBeVisible();

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
    await waitForHydration(page);

    await expect(page.getByText("선수별 성적")).toBeVisible();
    await expect(page.getByRole("cell", { name: "철수" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "영희" })).toBeVisible();
  });

  test("shows head-to-head comparison with two players", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");
    await createSessionWithRounds(page, "대결 테스트", "철수, 영희", 2);

    await page.goto("/stats");
    await waitForHydration(page);

    await expect(page.getByText("라이벌 비교")).toBeVisible();
  });
});

test.describe("Session stats tab", () => {
  test("shows score trend chart after 2+ rounds", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");
    await createSessionWithRounds(page, "차트 테스트", "A, B", 3);

    await page.getByRole("tab", { name: "통계" }).click();

    await expect(page.getByText("라운드별 점수 추이")).toBeVisible();
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

    const totalRoundsCard = page.locator(".rounded-2xl.border").filter({
      hasText: "총 라운드",
    });
    await expect(totalRoundsCard).toContainText("4");
  });
});
