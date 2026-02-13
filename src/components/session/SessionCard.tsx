"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Session } from "@/types";
import { useStore } from "@/store";

interface SessionCardProps {
  session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
  const players = useStore((s) => s.players);
  const deleteSession = useStore((s) => s.deleteSession);
  const sessionPlayers = players.filter((p) =>
    session.playerIds.includes(p.id)
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <Card className="group hover:border-primary/30 transition-all duration-200">
        <Link href={`/sessions/${session.id}`} className="block cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors">
                {session.name}
              </h3>
              <p className="text-sm text-text-secondary mt-1 truncate">
                {sessionPlayers.map((p) => p.name).join(", ") || "선수 없음"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 ml-3 shrink-0">
              <span className="inline-flex items-center rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-bold text-primary-text">
                {session.rounds.length}R
              </span>
              <span className="inline-flex items-center rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs font-medium text-text-tertiary">
                {sessionPlayers.length}명
              </span>
            </div>
          </div>
        </Link>
        <div className="flex justify-end mt-2 pt-2 border-t border-border-light">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="text-danger hover:text-danger-hover"
          >
            삭제
          </Button>
        </div>
      </Card>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => deleteSession(session.id)}
        title="세션 삭제"
        description="이 세션을 삭제하시겠습니까? 모든 라운드 데이터가 함께 삭제됩니다."
        confirmLabel="삭제"
      />
    </>
  );
}
