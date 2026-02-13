"use client";

import { use, useState } from "react";
import Link from "next/link";
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
import { isSetComplete } from "@/lib/scoring";

type Tab = "scoreboard" | "rounds" | "stats";

const TABS: { key: Tab; label: string }[] = [
  { key: "scoreboard", label: "점수판" },
  { key: "rounds", label: "라운드 이력" },
  { key: "stats", label: "통계" },
];

export default function SetDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string; setId: string }>;
}) {
  const { sessionId, setId } = use(params);
  const hydrated = useHydration();
  const session = useStore((s) => s.getSession(sessionId));
  const gameSet = useStore((s) => s.getSet(sessionId, setId));
  const players = useStore((s) => s.players);
  const deleteRound = useStore((s) => s.deleteRound);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("scoreboard");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  if (!hydrated) {
    return (
      <div>
        <AppHeader backHref={`/sessions/${sessionId}`} title="로딩..." />
        <div className="p-4 animate-pulse">
          <div className="h-48 rounded-xl bg-skeleton" />
        </div>
      </div>
    );
  }

  if (!session || !gameSet) {
    return (
      <div>
        <AppHeader backHref={`/sessions/${sessionId}`} title="세트 없음" />
        <EmptyState title="세트를 찾을 수 없습니다" icon="search" />
      </div>
    );
  }

  const setIndex = session.sets.findIndex((s) => s.id === setId);
  const complete = isSetComplete(gameSet);

  return (
    <div className="pb-24">
      <AppHeader
        backHref={`/sessions/${sessionId}`}
        title={`세트 ${setIndex + 1}`}
        action={
          complete ? (
            <Badge variant="success">완료</Badge>
          ) : (
            <span className="text-sm text-text-secondary">
              {gameSet.rounds.length}/{gameSet.targetRounds} 라운드
            </span>
          )
        }
      />

      {/* Tab bar */}
      {gameSet.rounds.length > 0 && (
        <div className="flex border-b border-border bg-surface" role="tablist" aria-label="세트 탭">
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
        {gameSet.rounds.length === 0 ? (
          <EmptyState
            title="아직 라운드가 없습니다"
            description="라운드를 추가하여 게임을 기록하세요"
            icon="trophy"
            action={
              <Link href={`/sessions/${sessionId}/sets/${setId}/rounds/new`}>
                <Button>첫 라운드 추가</Button>
              </Link>
            }
          />
        ) : (
          <>
            {activeTab === "scoreboard" && (
              <div id="panel-scoreboard" role="tabpanel" aria-labelledby="tab-scoreboard">
                <ScoreTable playerIds={session.playerIds} rounds={gameSet.rounds} players={players} />
              </div>
            )}

            {activeTab === "rounds" && (
              <div id="panel-rounds" role="tabpanel" aria-labelledby="tab-rounds">
                <div className="flex flex-col gap-2">
                  {gameSet.rounds.map((round, index) => (
                    <Link
                      key={round.id}
                      href={`/sessions/${sessionId}/sets/${setId}/rounds/${round.id}/edit`}
                      className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated px-4 py-3 transition-colors hover:border-primary/20 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-light text-xs font-bold text-primary-text">
                          {index + 1}
                        </span>
                        <span className="font-medium text-text-primary">
                          라운드 {index + 1}
                        </span>
                        {round.revolution && (
                          <Badge variant="gold">혁명</Badge>
                        )}
                        <span className="text-sm text-text-secondary">
                          {round.participantIds.length}명 참가
                        </span>
                      </div>
                      <div className="flex gap-1 shrink-0 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-danger"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteTarget(round.id);
                          }}
                        >
                          삭제
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "stats" && (
              <div id="panel-stats" role="tabpanel" aria-labelledby="tab-stats">
                <SessionStatsTab playerIds={session.playerIds} rounds={gameSet.rounds} players={players} />
              </div>
            )}
          </>
        )}
      </div>

      {/* FAB for adding new round */}
      {!complete && gameSet.rounds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
          <div className="mx-auto max-w-lg relative">
            <Link
              href={`/sessions/${sessionId}/sets/${setId}/rounds/new`}
              aria-label="새 라운드 추가"
              className="pointer-events-auto absolute bottom-6 right-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-text-inverse shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 active:bg-primary-active active:scale-95 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
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

      {/* Delete Round Confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteRound(sessionId, setId, deleteTarget);
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
