"use client";

import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatsOverview } from "@/components/stats/StatsOverview";
import { HeadToHeadComparison } from "@/components/stats/HeadToHeadComparison";
import { useStore } from "@/store";
import { useHydration } from "@/hooks/useHydration";
import {
  calculatePlayerStatistics,
  calculateHeadToHead,
} from "@/lib/statistics";

export default function StatsPage() {
  const hydrated = useHydration();
  const sessions = useStore((s) => s.sessions);
  const players = useStore((s) => s.players);

  if (!hydrated) {
    return (
      <div>
        <AppHeader backHref="/sessions" title="통계" />
        <div className="p-4 animate-pulse space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 rounded-xl bg-skeleton" />
            <div className="h-20 rounded-xl bg-skeleton" />
            <div className="h-20 rounded-xl bg-skeleton" />
            <div className="h-20 rounded-xl bg-skeleton" />
          </div>
          <div className="h-64 rounded-xl bg-skeleton" />
        </div>
      </div>
    );
  }

  const totalSessions = sessions.length;
  const totalRounds = sessions.reduce((sum, s) => sum + s.rounds.length, 0);
  const uniquePlayerIds = new Set(sessions.flatMap((s) => s.playerIds));
  const avgRoundsPerSession =
    totalSessions > 0 ? (totalRounds / totalSessions).toFixed(1) : "0";

  const playerNames: Record<string, string> = {};
  for (const p of players) {
    playerNames[p.id] = p.name;
  }

  const allStats = players
    .filter((p) => uniquePlayerIds.has(p.id))
    .map((p) => calculatePlayerStatistics(p.id, sessions));

  const playerIds = players
    .filter((p) => uniquePlayerIds.has(p.id))
    .map((p) => p.id);

  if (totalSessions === 0) {
    return (
      <div>
        <AppHeader backHref="/sessions" title="통계" />
        <EmptyState
          title="아직 데이터가 없습니다"
          description="세션을 만들고 라운드를 기록하세요"
          action={
            <Link href="/sessions">
              <Button>세션 목록</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <AppHeader backHref="/sessions" title="통계" />
      <div className="p-4 flex flex-col gap-6">
        {/* StatCard Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="총 세션" value={totalSessions} />
          <StatCard label="총 라운드" value={totalRounds} />
          <StatCard label="참여 선수" value={uniquePlayerIds.size} />
          <StatCard label="평균 라운드/세션" value={avgRoundsPerSession} />
        </div>

        {/* Player Rankings */}
        <Card>
          <h3 className="font-semibold text-text-primary mb-3">선수별 성적</h3>
          <StatsOverview stats={allStats} playerNames={playerNames} />
        </Card>

        {/* Head-to-Head */}
        {playerIds.length >= 2 && (
          <Card>
            <h3 className="font-semibold text-text-primary mb-3">라이벌 비교</h3>
            <HeadToHeadComparison
              playerIds={playerIds}
              playerNames={playerNames}
              calculateH2H={(p1, p2) => calculateHeadToHead(p1, p2, sessions)}
            />
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
    </div>
  );
}
