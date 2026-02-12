"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStore } from "@/store";

export function SessionForm() {
  const router = useRouter();
  const createSession = useStore((s) => s.createSession);
  const addPlayer = useStore((s) => s.addPlayer);

  const [sessionName, setSessionName] = useState("");
  const [playerNames, setPlayerNames] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = sessionName.trim();
    if (!name) return;

    const names = playerNames
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);

    const playerIds = names.map((n) => addPlayer(n).id);
    const session = createSession(name, playerIds);
    router.push(`/sessions/${session.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="세션 이름"
        id="session-name"
        placeholder="예: 금요 게임"
        value={sessionName}
        onChange={(e) => setSessionName(e.target.value)}
        required
      />
      <Input
        label="선수 이름 (쉼표 구분)"
        id="player-names"
        placeholder="예: 철수, 영희, 민수"
        value={playerNames}
        onChange={(e) => setPlayerNames(e.target.value)}
      />
      <Button type="submit" disabled={!sessionName.trim()}>
        세션 만들기
      </Button>
    </form>
  );
}
