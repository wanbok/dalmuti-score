import { test, expect } from "@playwright/test";
import { resetAndNavigate, createSession } from "./helpers";

test.describe("Dark mode", () => {
  test("theme toggle cycles system → light → dark", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");

    const toggle = page.getByRole("button", { name: "테마 변경" });

    await expect(page.getByTestId("icon-auto")).toBeVisible();

    await toggle.click();
    await expect(page.getByTestId("icon-sun")).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/light/);

    await toggle.click();
    await expect(page.getByTestId("icon-moon")).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await toggle.click();
    await expect(page.getByTestId("icon-auto")).toBeVisible();
    const htmlClass = await page.locator("html").getAttribute("class");
    expect(htmlClass).not.toContain("light");
    expect(htmlClass).not.toContain("dark");
  });

  test("theme persists after page reload", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");

    const toggle = page.getByRole("button", { name: "테마 변경" });

    await toggle.click(); // system → light
    await toggle.click(); // light → dark
    await expect(page.getByTestId("icon-moon")).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.reload();
    await page.waitForFunction(
      () => !document.querySelector(".animate-pulse"),
      { timeout: 10000 }
    );

    await expect(page.getByTestId("icon-moon")).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("dark mode applies to session detail page", async ({ page }) => {
    await resetAndNavigate(page, "/sessions");

    await page.getByRole("button", { name: "테마 변경" }).click(); // → light
    await page.getByRole("button", { name: "테마 변경" }).click(); // → dark

    await createSession(page, "다크모드 테스트", "A, B");

    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
