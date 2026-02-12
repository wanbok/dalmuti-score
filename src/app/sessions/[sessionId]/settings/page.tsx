"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PlayerRoster } from "@/components/session/PlayerRoster";
import { EmptyState } from "@/components/layout/EmptyState";
import { useStore } from "@/store";
import { useHydration } from "@/hooks/useHydration";

export default function SessionSettingsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const hydrated = useHydration();
  const session = useStore((s) => s.getSession(sessionId));
  const renameSession = useStore((s) => s.renameSession);
  const deleteSession = useStore((s) => s.deleteSession);
  const router = useRouter();

  const [name, setName] = useState(session?.name ?? "");

  if (!hydrated) {
    return (
      <div>
        <AppHeader backHref={`/sessions/${sessionId}`} title="로딩..." />
      </div>
    );
  }

  if (!session) {
    return (
      <div>
        <AppHeader backHref="/sessions" title="세션 없음" />
        <EmptyState title="세션을 찾을 수 없습니다" />
      </div>
    );
  }

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed && trimmed !== session.name) {
      renameSession(sessionId, trimmed);
    }
  };

  const handleDelete = () => {
    if (confirm("이 세션을 삭제하시겠습니까? 모든 라운드 데이터가 삭제됩니다.")) {
      deleteSession(sessionId);
      router.push("/sessions");
    }
  };

  return (
    <div>
      <AppHeader backHref={`/sessions/${sessionId}`} title="세션 설정" />
      <div className="p-4 flex flex-col gap-4">
        <Card>
          <form onSubmit={handleRename} className="flex flex-col gap-3">
            <Input
              label="세션 이름"
              id="session-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!name.trim() || name.trim() === session.name}
            >
              이름 변경
            </Button>
          </form>
        </Card>

        <Card>
          <PlayerRoster sessionId={sessionId} />
        </Card>

        <Card className="border-red-200">
          <h3 className="font-semibold text-red-600 mb-3">위험 영역</h3>
          <Button variant="danger" onClick={handleDelete}>
            세션 삭제
          </Button>
        </Card>
      </div>
    </div>
  );
}
