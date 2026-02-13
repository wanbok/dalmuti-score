"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortablePlayerItemProps {
  id: string;
  name: string;
  rank: number;
}

function RankBadge({ rank }: { rank: number }) {
  const colors =
    rank === 1
      ? "bg-badge-gold-bg text-badge-gold-text border-badge-gold-border"
      : rank === 2
        ? "bg-badge-silver-bg text-badge-silver-text border-badge-silver-border"
        : rank === 3
          ? "bg-badge-bronze-bg text-badge-bronze-text border-badge-bronze-border"
          : "bg-primary-light text-primary-text border-transparent";

  return (
    <span
      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold border ${colors} transition-colors duration-150`}
    >
      {rank}
    </span>
  );
}

function GripIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-text-tertiary"
      aria-hidden="true"
    >
      <circle cx="9" cy="5" r="1.5" />
      <circle cx="15" cy="5" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="15" cy="19" r="1.5" />
    </svg>
  );
}

export function SortablePlayerItem({ id, name, rank }: SortablePlayerItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface-elevated px-4 py-3 shadow-sm touch-none select-none cursor-grab active:cursor-grabbing transition-all duration-100"
      {...attributes}
      {...listeners}
    >
      <RankBadge rank={rank} />
      <span className="font-medium text-text-primary flex-1">{name}</span>
      <span className="ml-auto shrink-0 opacity-60">
        <GripIcon />
      </span>
    </div>
  );
}

interface PlayerItemOverlayProps {
  name: string;
  rank: number;
}

export function PlayerItemOverlay({ name, rank }: PlayerItemOverlayProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-primary bg-surface-elevated px-4 py-3 shadow-xl shadow-primary/10">
      <RankBadge rank={rank} />
      <span className="font-medium text-text-primary flex-1">{name}</span>
    </div>
  );
}
