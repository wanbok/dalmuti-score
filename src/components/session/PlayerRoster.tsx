"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStore } from "@/store";
import { useToast } from "@/components/ui/Toast";

interface PlayerRosterProps {
  sessionId: string;
}

export function PlayerRoster({ sessionId }: PlayerRosterProps) {
  const session = useStore((s) => s.getSession(sessionId));
  const players = useStore((s) => s.players);
  const addPlayerToSession = useStore((s) => s.addPlayerToSession);
  const removePlayerFromSession = useStore((s) => s.removePlayerFromSession);
  const { toast } = useToast();

  const [newName, setNewName] = useState("");

  if (!session) return null;

  const sessionPlayers = players.filter((p) =>
    session.playerIds.includes(p.id)
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    addPlayerToSession(sessionId, name);
    setNewName("");
    toast(`${name} 선수가 추가되었습니다`);
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold text-text-primary">선수 목록</h3>
      <div className="rounded-xl border border-border overflow-hidden divide-y divide-border-light">
        {sessionPlayers.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between px-4 py-2.5 bg-surface-elevated"
          >
            <span className="text-sm font-medium text-text-primary">{player.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removePlayerFromSession(sessionId, player.id)}
              className="text-danger hover:text-danger-hover"
            >
              제거
            </Button>
          </div>
        ))}
        {sessionPlayers.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-text-tertiary bg-surface-elevated">
            선수를 추가하세요
          </div>
        )}
      </div>
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="선수 이름"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={!newName.trim()}>
          추가
        </Button>
      </form>
    </div>
  );
}
