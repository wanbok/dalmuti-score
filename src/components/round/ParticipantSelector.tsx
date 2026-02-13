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
  const allSelected = selected.size === players.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-text-primary">참가자 선택</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={allSelected ? onDeselectAll : onSelectAll}
        >
          {allSelected ? "전체 해제" : "전체 선택"}
        </Button>
      </div>
      <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden divide-y divide-border-light">
        {players.map((player) => (
          <Checkbox
            key={player.id}
            id={`participant-${player.id}`}
            label={player.name}
            checked={selected.has(player.id)}
            onChange={() => onToggle(player.id)}
            className="rounded-none"
          />
        ))}
      </div>
      <Button onClick={onConfirm} disabled={selected.size < 2}>
        순위 입력 ({selected.size}명)
      </Button>
    </div>
  );
}
