import { test, expect } from "@playwright/test";
import {
  resetAndNavigate,
  waitForHydration,
  createSession,
  createSetAndNavigate,
  addRound,
} from "./helpers";

test.describe("Session management", () => {
  test("creates a new session with players", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");
    await createSession(page, "테스트 게임", "철수, 영희, 민수");
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
    await createSession(page, "금요게임", "철수, 영희, 민수");
    await createSetAndNavigate(page, 4);
    await addRound(page);

    // Verify scoreboard on set detail page
    await expect(page.getByRole("columnheader", { name: "R1" })).toBeVisible();
    await expect(page.getByText("합계")).toBeVisible();

    // Verify round appears in history
    await page.getByRole("tab", { name: "라운드 이력" }).click();
    await expect(page.getByText("라운드 1")).toBeVisible();
    await expect(page.getByText("3명 참가")).toBeVisible();
  });

  test("data persists after page reload", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");
    await createSession(page, "영속성 테스트", "A, B");

    await page.reload();
    await waitForHydration(page);

    await expect(page.getByText("영속성 테스트")).toBeVisible();
  });
});

test.describe("Session settings", () => {
  test("can rename session", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");
    await createSession(page, "이전이름", "A, B");

    await page.getByRole("button", { name: "설정" }).click();
    await expect(page).toHaveURL(/\/settings/);

    const input = page.getByLabel("세션 이름");
    await input.clear();
    await input.fill("새이름");
    await page.getByRole("button", { name: "이름 변경" }).click();

    await page.goBack();
    await expect(page.getByText("새이름")).toBeVisible();
  });

  test("can add player in settings", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");
    await createSession(page, "선수추가테스트", "철수");

    await page.getByRole("button", { name: "설정" }).click();

    await page.getByPlaceholder("선수 이름").fill("영희");
    await page.getByRole("button", { name: "추가" }).click();

    await expect(page.getByText("영희", { exact: true })).toBeVisible();
  });
});

test.describe("Round edit/delete", () => {
  test("can delete a round on set detail page", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");
    await createSession(page, "삭제테스트", "A, B");
    await createSetAndNavigate(page, 4);
    await addRound(page);

    await expect(page.getByRole("columnheader", { name: "R1" })).toBeVisible();

    // Switch to rounds tab, then delete round
    await page.getByRole("tab", { name: "라운드 이력" }).click();
    await page.getByRole("button", { name: "삭제" }).click();

    await expect(page.getByText("이 라운드를 삭제하시겠습니까?")).toBeVisible();
    await page.getByRole("button", { name: "삭제" }).last().click();

    await expect(page.getByText("아직 라운드가 없습니다")).toBeVisible();
  });
});
