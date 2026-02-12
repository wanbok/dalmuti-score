"use client";

import { useState } from "react";
import type { PlayerStatistics } from "@/types";

type SortKey = "winRate" | "averageRank" | "totalGames";

interface StatsOverviewProps {
  stats: PlayerStatistics[];
  playerNames: Record<string, string>;
}

export function StatsOverview({ stats, playerNames }: StatsOverviewProps) {
  const [sortKey, setSortKey] = useState<SortKey>("winRate");

  if (stats.length === 0) {
    return (
      <p className="text-center text-text-secondary py-8">
        아직 데이터가 없습니다
      </p>
    );
  }

  const sorted = [...stats].sort((a, b) => {
    if (sortKey === "winRate") return b.winRate - a.winRate;
    if (sortKey === "averageRank") return a.averageRank - b.averageRank;
    return b.totalGames - a.totalGames;
  });

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <SortButton active={sortKey === "winRate"} onClick={() => setSortKey("winRate")}>
          승률
        </SortButton>
        <SortButton active={sortKey === "averageRank"} onClick={() => setSortKey("averageRank")}>
          평균순위
        </SortButton>
        <SortButton active={sortKey === "totalGames"} onClick={() => setSortKey("totalGames")}>
          게임수
        </SortButton>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-sunken">
              <th className="px-3 py-2 text-left font-semibold text-text-secondary">#</th>
              <th className="px-3 py-2 text-left font-semibold text-text-secondary">선수</th>
              <th className="px-3 py-2 text-center font-semibold text-text-secondary">게임</th>
              <th className="px-3 py-2 text-center font-semibold text-text-secondary">승률</th>
              <th className="px-3 py-2 text-center font-semibold text-text-secondary">평균순위</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((stat, i) => (
              <tr key={stat.playerId} className="border-b border-border-light hover:bg-surface-sunken">
                <td className="px-3 py-2 text-text-tertiary">{i + 1}</td>
                <td className="px-3 py-2 font-medium text-text-primary">
                  {playerNames[stat.playerId] ?? "?"}
                </td>
                <td className="px-3 py-2 text-center text-text-secondary">
                  {stat.totalGames}
                </td>
                <td className="px-3 py-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-2 rounded-full bg-surface-sunken overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.round(stat.winRate * 100)}%` }}
                      />
                    </div>
                    <span className="text-text-primary font-medium">
                      {Math.round(stat.winRate * 100)}%
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-center text-text-secondary">
                  {stat.averageRank.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
        active
          ? "bg-primary text-text-inverse border-primary"
          : "bg-surface text-text-secondary border-border hover:bg-surface-sunken"
      }`}
    >
      {children}
    </button>
  );
}
