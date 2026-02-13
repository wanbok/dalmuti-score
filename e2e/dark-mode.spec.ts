import { test, expect, type Page } from "@playwright/test";

async function resetAndNavigate(page: Page, path: string) {
  await page.goto(path);
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("dalmuti-score-storage", JSON.stringify({ state: { onboardingCompleted: true, onboardingStep: -1, players: [], sessions: [], theme: "system" }, version: 2 }));
  });
  await page.reload();
  await page.waitForFunction(
    () => !document.querySelector(".animate-pulse"),
    { timeout: 10000 }
  );
}

test.describe("Dark mode", () => {
  test("theme toggle cycles system → light → dark", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");

    const toggle = page.getByRole("button", { name: "테마 변경" });

    // Default: system — auto icon visible
    await expect(page.getByTestId("icon-auto")).toBeVisible();

    // Click → light
    await toggle.click();
    await expect(page.getByTestId("icon-sun")).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/light/);

    // Click → dark
    await toggle.click();
    await expect(page.getByTestId("icon-moon")).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Click → back to system
    await toggle.click();
    await expect(page.getByTestId("icon-auto")).toBeVisible();
    // system mode: no light or dark class
    const htmlClass = await page.locator("html").getAttribute("class");
    expect(htmlClass).not.toContain("light");
    expect(htmlClass).not.toContain("dark");
  });

  test("theme persists after page reload", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");

    const toggle = page.getByRole("button", { name: "테마 변경" });

    // Set to dark
    await toggle.click(); // system → light
    await toggle.click(); // light → dark
    await expect(page.getByTestId("icon-moon")).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Reload
    await page.reload();
    await page.waitForFunction(
      () => !document.querySelector(".animate-pulse"),
      { timeout: 10000 }
    );

    // Should still be dark
    await expect(page.getByTestId("icon-moon")).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("dark mode applies to session detail page", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");

    // Set dark mode first
    await page.getByRole("button", { name: "테마 변경" }).click(); // → light
    await page.getByRole("button", { name: "테마 변경" }).click(); // → dark

    // Create a session
    await page.getByRole("button", { name: "+ 새 세션" }).click();
    await page.getByLabel("세션 이름").fill("다크모드 테스트");
    await page.getByLabel(/선수 이름/).fill("A, B");
    await page.getByRole("button", { name: "세션 만들기", exact: true }).click();
    await expect(page).toHaveURL(/\/sessions\/.+/);

    // Dark class should still be present on session page
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
