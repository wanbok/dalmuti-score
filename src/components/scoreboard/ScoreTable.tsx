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
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="sticky left-0 bg-gray-50 px-4 py-2 text-left font-semibold text-gray-600 z-10">
              선수
            </th>
            {session.rounds.map((_, i) => (
              <th
                key={i}
                className="px-3 py-2 text-center font-semibold text-gray-600 whitespace-nowrap"
              >
                R{i + 1}
              </th>
            ))}
            <th className="sticky right-0 bg-gray-50 px-4 py-2 text-center font-semibold text-gray-600 z-10">
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
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="sticky left-0 bg-white px-4 py-2 z-10">
                  <div className="flex items-center gap-2">
                    <Badge variant={rankBadgeVariant(entry.rank)}>
                      {entry.rank}
                    </Badge>
                    <span className="font-medium text-gray-900 truncate">
                      {player.name}
                    </span>
                  </div>
                </td>
                {entry.scores.map((score, i) => (
                  <td
                    key={i}
                    className="px-3 py-2 text-center text-gray-700 whitespace-nowrap"
                  >
                    {score === null ? (
                      <span className="text-gray-300">-</span>
                    ) : score === 0 ? (
                      <span className="font-bold text-blue-600">0</span>
                    ) : (
                      score
                    )}
                  </td>
                ))}
                <td className="sticky right-0 bg-white px-4 py-2 text-center font-bold text-gray-900 z-10">
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
