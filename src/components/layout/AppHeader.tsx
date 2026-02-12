import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

interface AppHeaderProps {
  title?: string;
  backHref?: string;
  action?: React.ReactNode;
}

export function AppHeader({ title = APP_NAME, backHref, action }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {backHref && (
            <Link
              href={backHref}
              className="flex items-center justify-center rounded-lg p-2 -ml-2 min-h-[44px] min-w-[44px] text-gray-600 hover:bg-gray-100"
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
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
          )}
          <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  );
}
