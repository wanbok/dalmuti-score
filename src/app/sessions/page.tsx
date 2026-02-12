"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { SessionCard } from "@/components/session/SessionCard";
import { SessionForm } from "@/components/session/SessionForm";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
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
            <div className="h-24 rounded-xl bg-gray-200" />
            <div className="h-24 rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AppHeader
        action={
          <Button size="sm" onClick={() => setShowForm(true)}>
            + 새 세션
          </Button>
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
