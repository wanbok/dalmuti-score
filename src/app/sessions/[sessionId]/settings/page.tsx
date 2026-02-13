"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PlayerRoster } from "@/components/session/PlayerRoster";
import { EmptyState } from "@/components/layout/EmptyState";
import { useStore } from "@/store";
import { useHydration } from "@/hooks/useHydration";
import { useToast } from "@/components/ui/Toast";

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
  const { toast } = useToast();

  const [name, setName] = useState(session?.name ?? "");
  const [confirmOpen, setConfirmOpen] = useState(false);

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
      toast("세션 이름이 변경되었습니다");
    }
  };

  const handleDelete = () => {
    deleteSession(sessionId);
    router.push("/sessions");
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

        <Card className="border-danger/30 bg-danger-light">
          <h3 className="font-semibold text-danger-text mb-3">위험 영역</h3>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            세션 삭제
          </Button>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="세션 삭제"
        description="이 세션을 삭제하시겠습니까? 모든 세트와 라운드 데이터가 삭제됩니다."
        confirmLabel="삭제"
      />
    </div>
  );
}
