"use client";

import { useMemo } from "react";
import { ScoreTrendChart } from "./ScoreTrendChart";
import { buildScoreboard } from "@/lib/scoring";
import type { Session, Player } from "@/types";

interface SessionStatsTabProps {
  session: Session;
  players: Player[];
}

export function SessionStatsTab({ session, players }: SessionStatsTabProps) {
  const playerMap = useMemo(
    () => new Map(players.map((p) => [p.id, p])),
    [players]
  );

  const scoreboard = useMemo(
    () => buildScoreboard(session.playerIds, session.rounds),
    [session]
  );

  const stats = useMemo(() => {
    if (session.rounds.length === 0) return null;

    // Most 1st place finishes
    const winCounts = new Map<string, number>();
    for (const round of session.rounds) {
      for (const result of round.results) {
        if (result.rank === 1) {
          winCounts.set(
            result.playerId,
            (winCounts.get(result.playerId) ?? 0) + 1
          );
        }
      }
    }

    let mostWinsPlayer = "";
    let mostWinsCount = 0;
    for (const [playerId, count] of winCounts) {
      if (count > mostWinsCount) {
        mostWinsCount = count;
        mostWinsPlayer = playerId;
      }
    }

    // Winner (lowest total) and loser (highest total)
    const sorted = [...scoreboard].sort((a, b) => a.total - b.total);
    const winner = sorted[0];
    const loser = sorted[sorted.length - 1];

    // Revolution count
    const revolutionCount = session.rounds.filter(
      (r) => r.revolution === true
    ).length;

    return {
      mostWinsPlayer,
      mostWinsCount,
      winner,
      loser,
      totalRounds: session.rounds.length,
      revolutionCount,
    };
  }, [session, scoreboard]);

  if (session.rounds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
        <p className="text-lg font-medium">아직 라운드가 없습니다</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Chart section */}
      {session.rounds.length >= 2 ? (
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="font-semibold text-text-primary mb-3">
            라운드별 점수 추이
          </h3>
          <ScoreTrendChart session={session} players={players} />
        </div>
      ) : (
        <div className="rounded-lg border border-border-light bg-surface-sunken px-4 py-3 text-sm text-text-secondary">
          2라운드 이상 진행하면 추이 차트가 표시됩니다
        </div>
      )}

      {/* Summary stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-text-secondary">최다 1위</p>
          <p className="text-lg font-bold text-text-primary">
            {stats.mostWinsCount > 0
              ? `${playerMap.get(stats.mostWinsPlayer)?.name ?? "?"} (${stats.mostWinsCount}회)`
              : "-"}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-text-secondary">총 라운드</p>
          <p className="text-lg font-bold text-text-primary">
            {stats.totalRounds}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-text-secondary">최저 총점 (승자)</p>
          <p className="text-lg font-bold text-text-primary">
            {stats.winner
              ? `${playerMap.get(stats.winner.playerId)?.name ?? "?"} (${stats.winner.total}점)`
              : "-"}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-text-secondary">최고 총점 (패자)</p>
          <p className="text-lg font-bold text-text-primary">
            {stats.loser
              ? `${playerMap.get(stats.loser.playerId)?.name ?? "?"} (${stats.loser.total}점)`
              : "-"}
          </p>
        </div>

        {stats.revolutionCount > 0 && (
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm text-text-secondary">혁명 횟수</p>
            <p className="text-lg font-bold text-text-primary">
              {stats.revolutionCount}회
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
