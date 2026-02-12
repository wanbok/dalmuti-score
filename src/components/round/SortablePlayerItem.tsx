"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortablePlayerItemProps {
  id: string;
  name: string;
  rank: number;
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
      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm touch-none select-none"
      {...attributes}
      {...listeners}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
        {rank}
      </span>
      <span className="font-medium text-gray-900">{name}</span>
      <span className="ml-auto text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="6" r="1" />
          <circle cx="15" cy="6" r="1" />
          <circle cx="9" cy="12" r="1" />
          <circle cx="15" cy="12" r="1" />
          <circle cx="9" cy="18" r="1" />
          <circle cx="15" cy="18" r="1" />
        </svg>
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
    <div className="flex items-center gap-3 rounded-lg border border-blue-300 bg-white px-4 py-3 shadow-lg">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
        {rank}
      </span>
      <span className="font-medium text-gray-900">{name}</span>
    </div>
  );
}
