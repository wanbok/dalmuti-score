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
    root.classList.remove("light", "dark");

    if (theme === "light") {
      root.classList.add("light");
    } else if (theme === "dark") {
      root.classList.add("dark");
    }
    // 'system' → no class, CSS @media handles it
  }, [theme, hydrated]);

  return <>{children}</>;
}
