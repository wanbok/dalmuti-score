"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortablePlayerItem, PlayerItemOverlay } from "./SortablePlayerItem";
import { Button } from "@/components/ui/Button";
import type { Player } from "@/types";

interface RankingListProps {
  players: Player[];
  initialOrder?: string[];
  onSave: (orderedIds: string[]) => void;
  onBack: () => void;
}

export function RankingList({
  players,
  initialOrder,
  onSave,
  onBack,
}: RankingListProps) {
  const [orderedIds, setOrderedIds] = useState<string[]>(
    initialOrder ?? players.map((p) => p.id)
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const playerMap = new Map(players.map((p) => [p.id, p]));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedIds((items) => {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const activePlayer = activeId ? playerMap.get(activeId) : null;
  const activeRank = activeId ? orderedIds.indexOf(activeId) + 1 : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">순위 입력</h3>
        <p className="text-sm text-gray-500">드래그로 순서를 변경하세요</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {orderedIds.map((id, index) => {
              const player = playerMap.get(id);
              if (!player) return null;
              return (
                <SortablePlayerItem
                  key={id}
                  id={id}
                  name={player.name}
                  rank={index + 1}
                />
              );
            })}
          </div>
        </SortableContext>

        <DragOverlay>
          {activePlayer ? (
            <PlayerItemOverlay name={activePlayer.name} rank={activeRank} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          뒤로
        </Button>
        <Button onClick={() => onSave(orderedIds)} className="flex-1">
          저장
        </Button>
      </div>
    </div>
  );
}
