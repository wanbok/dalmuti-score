"use client";

import { useStore } from "@/store";
import type { ThemeMode } from "@/types";

const CYCLE: ThemeMode[] = ["system", "light", "dark"];

function SunIcon() {
  return (
    <svg data-testid="icon-sun" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg data-testid="icon-moon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function AutoIcon() {
  return (
    <svg data-testid="icon-auto" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 1 0 20V2z" />
    </svg>
  );
}

const ICONS: Record<ThemeMode, () => React.ReactNode> = {
  light: SunIcon,
  dark: MoonIcon,
  system: AutoIcon,
};

export function ThemeToggle() {
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);

  const handleClick = () => {
    const currentIndex = CYCLE.indexOf(theme);
    const nextIndex = (currentIndex + 1) % CYCLE.length;
    setTheme(CYCLE[nextIndex]);
  };

  const Icon = ICONS[theme];

  return (
    <button
      onClick={handleClick}
      aria-label="테마 변경"
      className="flex items-center justify-center rounded-xl p-2 min-h-[44px] min-w-[44px] text-text-secondary hover:bg-secondary active:scale-[0.93] transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus/40"
    >
      <Icon />
    </button>
  );
}
