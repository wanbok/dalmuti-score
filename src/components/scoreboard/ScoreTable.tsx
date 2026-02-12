"use client";

import { Badge, rankBadgeVariant } from "@/components/ui/Badge";
import { buildScoreboard } from "@/lib/scoring";
import type { Player, Session } from "@/types";

interface ScoreTableProps {
  session: Session;
  players: Player[];
}

export function ScoreTable({ session, players }: ScoreTableProps) {
  const playerMap = new Map(players.map((p) => [p.id, p]));
  const entries = buildScoreboard(session.playerIds, session.rounds);

  // Sort by rank ascending
  const sorted = [...entries].sort((a, b) => a.rank - b.rank);

  return (
    <div className="overflow-x-auto -mx-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-sunken">
            <th className="sticky left-0 bg-surface-sunken px-4 py-2 text-left font-semibold text-text-secondary z-10">
              선수
            </th>
            {session.rounds.map((_, i) => (
              <th
                key={i}
                className="px-3 py-2 text-center font-semibold text-text-secondary whitespace-nowrap"
              >
                R{i + 1}
              </th>
            ))}
            <th className="sticky right-0 bg-surface-sunken px-4 py-2 text-center font-semibold text-text-secondary z-10">
              합계
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((entry) => {
            const player = playerMap.get(entry.playerId);
            if (!player) return null;
            return (
              <tr
                key={entry.playerId}
                className="border-b border-border-light hover:bg-surface-sunken"
              >
                <td className="sticky left-0 bg-surface px-4 py-2 z-10">
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
                    className="px-3 py-2 text-center text-text-secondary whitespace-nowrap"
                  >
                    {score === null ? (
                      <span className="text-text-tertiary">-</span>
                    ) : score === 0 ? (
                      <span className="font-bold text-score-zero">0</span>
                    ) : (
                      score
                    )}
                  </td>
                ))}
                <td className="sticky right-0 bg-surface px-4 py-2 text-center font-bold text-text-primary z-10">
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
