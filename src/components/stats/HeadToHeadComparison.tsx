"use client";

import { useState } from "react";
import type { HeadToHeadStats } from "@/types";

interface HeadToHeadComparisonProps {
  playerIds: string[];
  playerNames: Record<string, string>;
  calculateH2H: (p1: string, p2: string) => HeadToHeadStats;
}

export function HeadToHeadComparison({
  playerIds,
  playerNames,
  calculateH2H,
}: HeadToHeadComparisonProps) {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");

  const bothSelected = player1 && player2 && player1 !== player2;
  const stats = bothSelected ? calculateH2H(player1, player2) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <select
          value={player1}
          onChange={(e) => setPlayer1(e.target.value)}
          aria-label="선수 1 선택"
          className="flex-1 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm min-h-[44px] text-text-primary cursor-pointer hover:border-border-focus/40 focus:border-border-focus focus:ring-2 focus:ring-border-focus/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus/40 outline-none transition-all"
        >
          <option value="">선수 1</option>
          {playerIds
            .filter((id) => id !== player2)
            .map((id) => (
              <option key={id} value={id}>
                {playerNames[id] ?? id}
              </option>
            ))}
        </select>
        <span className="flex items-center text-text-tertiary font-bold">VS</span>
        <select
          value={player2}
          onChange={(e) => setPlayer2(e.target.value)}
          aria-label="선수 2 선택"
          className="flex-1 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm min-h-[44px] text-text-primary cursor-pointer hover:border-border-focus/40 focus:border-border-focus focus:ring-2 focus:ring-border-focus/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus/40 outline-none transition-all"
        >
          <option value="">선수 2</option>
          {playerIds
            .filter((id) => id !== player1)
            .map((id) => (
              <option key={id} value={id}>
                {playerNames[id] ?? id}
              </option>
            ))}
        </select>
      </div>

      {!bothSelected && (
        <p className="text-center text-text-tertiary text-sm py-4">
          두 선수를 선택하세요
        </p>
      )}

      {stats && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-primary-light p-3">
            <p className="text-2xl font-bold text-primary-text tabular-nums">{stats.player1Wins}</p>
            <p className="text-xs font-medium text-text-secondary mt-0.5">{playerNames[player1]}</p>
          </div>
          <div className="rounded-xl bg-surface-sunken p-3">
            <p className="text-2xl font-bold text-text-tertiary tabular-nums">{stats.draws}</p>
            <p className="text-xs font-medium text-text-secondary mt-0.5">무승부</p>
          </div>
          <div className="rounded-xl bg-danger-light p-3">
            <p className="text-2xl font-bold text-danger-text tabular-nums">{stats.player2Wins}</p>
            <p className="text-xs font-medium text-text-secondary mt-0.5">{playerNames[player2]}</p>
          </div>
        </div>
      )}
    </div>
  );
}
