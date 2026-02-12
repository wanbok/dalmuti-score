"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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

  return (
    <Card className="flex flex-col gap-2">
      <Link href={`/sessions/${session.id}`} className="block">
        <h3 className="font-bold text-gray-900">{session.name}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {sessionPlayers.map((p) => p.name).join(", ") || "선수 없음"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {session.rounds.length}라운드
        </p>
      </Link>
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm("이 세션을 삭제하시겠습니까?")) {
              deleteSession(session.id);
            }
          }}
          className="text-red-500 hover:text-red-700"
        >
          삭제
        </Button>
      </div>
    </Card>
  );
}
