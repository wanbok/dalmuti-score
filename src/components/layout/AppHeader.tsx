import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

interface AppHeaderProps {
  title?: string;
  backHref?: string;
  action?: React.ReactNode;
}

export function AppHeader({ title = APP_NAME, backHref, action }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface-overlay backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <div className="flex items-center gap-2 min-w-0">
          {backHref && (
            <Link
              href={backHref}
              aria-label="뒤로 가기"
              className="flex items-center justify-center rounded-xl p-2 -ml-2 min-h-[44px] min-w-[44px] text-text-secondary hover:bg-surface-sunken active:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus/40 transition-all duration-150 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
          )}
          <h1 className="text-lg font-bold text-text-primary truncate">{title}</h1>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
