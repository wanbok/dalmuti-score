"use client";

import { useEffect } from "react";
import { useStore } from "@/store";
import { useHydration } from "@/hooks/useHydration";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useStore((state) => state.theme);
  const hydrated = useHydration();

  useEffect(() => {
    if (!hydrated) return;

    const root = document.documentElement;

    // Add transitioning class for smooth theme switch
    root.classList.add("theme-transitioning");

    root.classList.remove("light", "dark");

    if (theme === "light") {
      root.classList.add("light");
    } else if (theme === "dark") {
      root.classList.add("dark");
    }
    // 'system' → no class, CSS @media handles it

    // Remove transitioning class after animation
    const timer = setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 350);

    return () => clearTimeout(timer);
  }, [theme, hydrated]);

  return <>{children}</>;
}
