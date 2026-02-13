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
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useStore } from "@/store";
import { useHydration } from "@/hooks/useHydration";
import { useToast } from "@/components/ui/Toast";

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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("scoreboard");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

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
        <EmptyState title="세션을 찾을 수 없습니다" icon="search" />
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
        <div className="flex border-b border-border bg-surface" role="tablist" aria-label="세션 탭">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              id={`tab-${tab.key}`}
              aria-selected={activeTab === tab.key}
              aria-controls={`panel-${tab.key}`}
              className={`flex-1 min-h-[44px] py-3 text-sm font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 ${
                activeTab === tab.key
                  ? "border-b-2 border-primary text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-sunken/50"
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
            icon="trophy"
            action={
              <Link href={`/sessions/${sessionId}/rounds/new`}>
                <Button>라운드 추가</Button>
              </Link>
            }
          />
        ) : (
          <>
            {activeTab === "scoreboard" && (
              <div id="panel-scoreboard" role="tabpanel" aria-labelledby="tab-scoreboard">
                <ScoreTable session={session} players={players} />
              </div>
            )}

            {activeTab === "rounds" && (
              <div id="panel-rounds" role="tabpanel" aria-labelledby="tab-rounds">
                <div className="flex flex-col gap-2">
                  {session.rounds.map((round, index) => {
                    const playerMap = new Map(
                      players.map((p) => [p.id, p])
                    );
                    return (
                      <div
                        key={round.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated px-4 py-3 transition-colors hover:border-primary/20"
                      >
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-light text-xs font-bold text-primary-text">
                              {index + 1}
                            </span>
                            {round.revolution && (
                              <Badge variant="gold">혁명</Badge>
                            )}
                            {round.revolution && (
                              <Badge>세금 면제</Badge>
                            )}
                          </div>
                          <span className="text-sm text-text-secondary truncate">
                            {round.results
                              .sort((a, b) => a.rank - b.rank)
                              .map(
                                (r) =>
                                  playerMap.get(r.playerId)?.name ?? "?"
                              )
                              .join(" > ")}
                          </span>
                        </div>
                        <div className="flex gap-1 shrink-0 ml-2">
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
                            onClick={() => setDeleteTarget(round.id)}
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
              <div id="panel-stats" role="tabpanel" aria-labelledby="tab-stats">
                <SessionStatsTab session={session} players={players} />
              </div>
            )}
          </>
        )}
      </div>

      {/* FAB for adding rounds */}
      {session.playerIds.length >= 2 && session.rounds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
          <div className="mx-auto max-w-lg relative">
            <Link
              href={`/sessions/${sessionId}/rounds/new`}
              aria-label="라운드 추가"
              className="pointer-events-auto absolute bottom-6 right-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-text-inverse shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 active:bg-primary-active active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteRound(sessionId, deleteTarget);
            toast("라운드가 삭제되었습니다");
          }
        }}
        title="라운드 삭제"
        description="이 라운드를 삭제하시겠습니까?"
        confirmLabel="삭제"
      />
    </div>
  );
}
