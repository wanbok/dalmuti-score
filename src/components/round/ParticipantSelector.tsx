"use client";

import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import type { Player } from "@/types";

interface ParticipantSelectorProps {
  players: Player[];
  selected: Set<string>;
  onToggle: (playerId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onConfirm: () => void;
}

export function ParticipantSelector({
  players,
  selected,
  onToggle,
  onSelectAll,
  onDeselectAll,
  onConfirm,
}: ParticipantSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">참가자 선택</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onSelectAll}>
            전체 선택
          </Button>
          <Button variant="ghost" size="sm" onClick={onDeselectAll}>
            전체 해제
          </Button>
        </div>
      </div>
      <ul className="flex flex-col gap-1">
        {players.map((player) => (
          <li key={player.id}>
            <Checkbox
              id={`participant-${player.id}`}
              label={player.name}
              checked={selected.has(player.id)}
              onChange={() => onToggle(player.id)}
            />
          </li>
        ))}
      </ul>
      <Button onClick={onConfirm} disabled={selected.size < 2}>
        순위 입력 ({selected.size}명)
      </Button>
    </div>
  );
}
