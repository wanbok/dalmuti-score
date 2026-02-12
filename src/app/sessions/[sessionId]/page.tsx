"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { ScoreTable } from "@/components/scoreboard/ScoreTable";
import { SessionStatsTab } from "@/components/stats/SessionStatsTab";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useStore } from "@/store";
import { useHydration } from "@/hooks/useHydration";

type Tab = "scoreboard" | "rounds" | "stats";

const TABS: { key: Tab; label: string }[] = [
  { key: "scoreboard", label: "점수판" },
  { key: "rounds", label: "라운드 이력" },
  { key: "stats", label: "통계" },
];

export default function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const hydrated = useHydration();
  const session = useStore((s) => s.getSession(sessionId));
  const players = useStore((s) => s.players);
  const deleteRound = useStore((s) => s.deleteRound);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("scoreboard");

  if (!hydrated) {
    return (
      <div>
        <AppHeader backHref="/sessions" title="로딩..." />
        <div className="p-4 animate-pulse">
          <div className="h-48 rounded-xl bg-skeleton" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div>
        <AppHeader backHref="/sessions" title="세션 없음" />
        <EmptyState title="세션을 찾을 수 없습니다" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      <AppHeader
        backHref="/sessions"
        title={session.name}
        action={
          <Link href={`/sessions/${sessionId}/settings`}>
            <Button variant="ghost" size="sm">
              설정
            </Button>
          </Link>
        }
      />

      {/* Tab bar */}
      {session.rounds.length > 0 && (
        <div className="flex border-b border-border" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-primary text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="p-4">
        {session.rounds.length === 0 ? (
          <EmptyState
            title="아직 라운드가 없습니다"
            description="첫 라운드를 시작하세요"
            action={
              <Link href={`/sessions/${sessionId}/rounds/new`}>
                <Button>라운드 추가</Button>
              </Link>
            }
          />
        ) : (
          <>
            {activeTab === "scoreboard" && (
              <ScoreTable session={session} players={players} />
            )}

            {activeTab === "rounds" && (
              <div>
                <div className="flex flex-col gap-2">
                  {session.rounds.map((round, index) => {
                    const playerMap = new Map(
                      players.map((p) => [p.id, p])
                    );
                    return (
                      <div
                        key={round.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-text-primary">
                              R{index + 1}
                            </span>
                            {round.revolution && (
                              <Badge variant="gold">혁명</Badge>
                            )}
                            {round.revolution && (
                              <Badge>세금 면제</Badge>
                            )}
                          </div>
                          <span className="text-sm text-text-secondary">
                            {round.results
                              .sort((a, b) => a.rank - b.rank)
                              .map(
                                (r) =>
                                  playerMap.get(r.playerId)?.name ?? "?"
                              )
                              .join(" > ")}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/sessions/${sessionId}/rounds/${round.id}/edit`
                              )
                            }
                          >
                            수정
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger"
                            onClick={() => {
                              if (confirm("이 라운드를 삭제하시겠습니까?")) {
                                deleteRound(sessionId, round.id);
                              }
                            }}
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "stats" && (
              <SessionStatsTab session={session} players={players} />
            )}
          </>
        )}
      </div>

      {/* FAB for adding rounds */}
      {session.playerIds.length >= 2 && (
        <Link
          href={`/sessions/${sessionId}/rounds/new`}
          className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-text-inverse shadow-lg hover:bg-primary-hover active:bg-primary-active transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
      )}
    </div>
  );
}
