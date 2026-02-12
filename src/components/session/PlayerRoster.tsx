"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStore } from "@/store";

interface PlayerRosterProps {
  sessionId: string;
}

export function PlayerRoster({ sessionId }: PlayerRosterProps) {
  const session = useStore((s) => s.getSession(sessionId));
  const players = useStore((s) => s.players);
  const addPlayerToSession = useStore((s) => s.addPlayerToSession);
  const removePlayerFromSession = useStore((s) => s.removePlayerFromSession);

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
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold text-gray-900">선수 목록</h3>
      <ul className="flex flex-col gap-1">
        {sessionPlayers.map((player) => (
          <li
            key={player.id}
            className="flex items-center justify-between rounded-lg px-3 py-2 bg-gray-50"
          >
            <span className="text-sm">{player.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removePlayerFromSession(sessionId, player.id)}
              className="text-red-500 hover:text-red-700"
            >
              제거
            </Button>
          </li>
        ))}
      </ul>
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
