"use client";

import { Badge, rankBadgeVariant } from "@/components/ui/Badge";
import { buildSetScoreboard } from "@/lib/scoring";
import type { Player, GameSet } from "@/types";

interface SetScoreTableProps {
  playerIds: string[];
  sets: GameSet[];
  players: Player[];
}

function ScoreCell({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-text-tertiary">-</span>;
  }
  if (score === 0) {
    return (
      <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-score-zero/15 font-bold text-score-zero text-xs">
        0
      </span>
    );
  }
  const intensity = Math.min(score / 8, 1);
  const opacity = Math.round(intensity * 10 + 5);
  return (
    <span
      className="tabular-nums"
      style={{ color: `color-mix(in srgb, var(--color-danger) ${opacity}%, var(--color-text-secondary))` }}
    >
      {score}
    </span>
  );
}

export function SetScoreTable({ playerIds, sets, players }: SetScoreTableProps) {
  const playerMap = new Map(players.map((p) => [p.id, p]));
  const entries = buildSetScoreboard(playerIds, sets);

  const sorted = [...entries].sort((a, b) => a.rank - b.rank);

  return (
    <div className="overflow-x-auto -mx-4 rounded-xl">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-sunken">
            <th className="sticky left-0 z-10 bg-surface-sunken px-4 py-3 text-left font-semibold text-text-secondary sticky-shadow-left">
              선수
            </th>
            {sets.map((_, i) => (
              <th
                key={i}
                className="px-3 py-3 text-center font-semibold text-text-tertiary whitespace-nowrap text-xs"
              >
                S{i + 1}
              </th>
            ))}
            <th className="sticky right-0 z-10 bg-surface-sunken px-4 py-3 text-center font-semibold text-text-secondary sticky-shadow-right">
              합계
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((entry, rowIndex) => {
            const player = playerMap.get(entry.playerId);
            if (!player) return null;
            return (
              <tr
                key={entry.playerId}
                className={`border-b border-border-light transition-colors hover:bg-surface-sunken/50 ${
                  rowIndex === 0 ? "bg-badge-gold-bg/20" : ""
                }`}
              >
                <td className="sticky left-0 z-10 bg-surface px-4 py-2.5 sticky-shadow-left">
                  <div className="flex items-center gap-2">
                    <Badge variant={rankBadgeVariant(entry.rank)}>
                      {entry.rank}
                    </Badge>
                    <span className="font-medium text-text-primary truncate">
                      {player.name}
                    </span>
                  </div>
                </td>
                {entry.scores.map((score, i) => (
                  <td
                    key={i}
                    className="px-3 py-2.5 text-center whitespace-nowrap"
                  >
                    <ScoreCell score={score} />
                  </td>
                ))}
                <td className="sticky right-0 z-10 bg-surface px-4 py-2.5 text-center font-bold text-text-primary tabular-nums sticky-shadow-right">
                  {entry.total}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
