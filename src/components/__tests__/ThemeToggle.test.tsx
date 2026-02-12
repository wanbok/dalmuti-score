import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "../theme/ThemeToggle";
import { useStore } from "@/store";

describe("ThemeToggle", () => {
  beforeEach(() => {
    useStore.setState({ theme: "system" });
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  it("renders as a button with accessible label", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: /테마/i })).toBeInTheDocument();
  });

  it("meets 44px min touch target", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: /테마/i })).toHaveClass("min-h-[44px]");
  });

  it("cycles system → light → dark → system on click", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /테마/i });

    // system → light
    expect(useStore.getState().theme).toBe("system");
    await user.click(button);
    expect(useStore.getState().theme).toBe("light");

    // light → dark
    await user.click(button);
    expect(useStore.getState().theme).toBe("dark");

    // dark → system
    await user.click(button);
    expect(useStore.getState().theme).toBe("system");
  });

  it("shows sun icon when theme is light", () => {
    useStore.setState({ theme: "light" });
    render(<ThemeToggle />);
    expect(screen.getByTestId("icon-sun")).toBeInTheDocument();
  });

  it("shows moon icon when theme is dark", () => {
    useStore.setState({ theme: "dark" });
    render(<ThemeToggle />);
    expect(screen.getByTestId("icon-moon")).toBeInTheDocument();
  });

  it("shows auto icon when theme is system", () => {
    useStore.setState({ theme: "system" });
    render(<ThemeToggle />);
    expect(screen.getByTestId("icon-auto")).toBeInTheDocument();
  });
});
