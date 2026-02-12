"use client";

import { useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { SessionCard } from "@/components/session/SessionCard";
import { SessionForm } from "@/components/session/SessionForm";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useStore } from "@/store";
import { useHydration } from "@/hooks/useHydration";

export default function SessionsPage() {
  const hydrated = useHydration();
  const sessions = useStore((s) => s.sessions);
  const [showForm, setShowForm] = useState(false);

  if (!hydrated) {
    return (
      <div>
        <AppHeader />
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-24 rounded-xl bg-skeleton" />
            <div className="h-24 rounded-xl bg-skeleton" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AppHeader
        action={
          <div className="flex items-center gap-1">
            <Link
              href="/stats"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-text-secondary hover:bg-secondary transition-colors"
              aria-label="통계"
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
                <path d="M18 20V10M12 20V4M6 20v-6" />
              </svg>
            </Link>
            <ThemeToggle />
            <Button size="sm" onClick={() => setShowForm(true)}>
              + 새 세션
            </Button>
          </div>
        }
      />

      <div className="p-4">
        {sessions.length === 0 ? (
          <EmptyState
            title="세션이 없습니다"
            description="새 세션을 만들어 점수를 기록하세요"
            action={
              <Button onClick={() => setShowForm(true)}>첫 세션 만들기</Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {[...sessions].reverse().map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        title="새 세션"
      >
        <SessionForm />
      </Dialog>
    </div>
  );
}
