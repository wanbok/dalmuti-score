import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ThemeProvider } from "../theme/ThemeProvider";
import { useStore } from "@/store";

type MediaQueryListener = (e: { matches: boolean }) => void;

function createMatchMediaMock(matches: boolean) {
  const listeners: MediaQueryListener[] = [];
  const mql = {
    matches,
    media: "(prefers-color-scheme: dark)",
    addEventListener: vi.fn((_, cb: MediaQueryListener) => listeners.push(cb)),
    removeEventListener: vi.fn((_, cb: MediaQueryListener) => {
      const idx = listeners.indexOf(cb);
      if (idx >= 0) listeners.splice(idx, 1);
    }),
    dispatchEvent: vi.fn(),
  };
  return {
    mock: vi.fn().mockReturnValue(mql),
    mql,
    fire(newMatches: boolean) {
      mql.matches = newMatches;
      listeners.forEach((cb) => cb({ matches: newMatches }));
    },
  };
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    useStore.setState({ theme: "system" });
    document.documentElement.className = "";
    const { mock } = createMatchMediaMock(false);
    window.matchMedia = mock;
  });

  it("renders children", () => {
    render(
      <ThemeProvider>
        <p>Hello</p>
      </ThemeProvider>
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("applies 'dark' class when theme is dark", () => {
    useStore.setState({ theme: "dark" });
    render(
      <ThemeProvider>
        <p>Content</p>
      </ThemeProvider>
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("applies 'light' class when theme is light", () => {
    useStore.setState({ theme: "light" });
    render(
      <ThemeProvider>
        <p>Content</p>
      </ThemeProvider>
    );
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("does not add theme class when theme is system (light preference)", () => {
    useStore.setState({ theme: "system" });
    render(
      <ThemeProvider>
        <p>Content</p>
      </ThemeProvider>
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("removes previous class when theme changes from dark to light", () => {
    useStore.setState({ theme: "dark" });
    render(
      <ThemeProvider>
        <p>Content</p>
      </ThemeProvider>
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    act(() => {
      useStore.setState({ theme: "light" });
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("removes all theme classes when switching to system", () => {
    useStore.setState({ theme: "dark" });
    render(
      <ThemeProvider>
        <p>Content</p>
      </ThemeProvider>
    );

    act(() => {
      useStore.setState({ theme: "system" });
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

});
