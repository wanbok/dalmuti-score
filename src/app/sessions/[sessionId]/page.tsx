"use client";

import { use, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { SetScoreTable } from "@/components/scoreboard/SetScoreTable";
import { SessionStatsTab } from "@/components/stats/SessionStatsTab";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CoachmarkOverlay } from "@/components/ui/Coachmark";
import type { CoachmarkStep } from "@/components/ui/Coachmark";
import { useStore } from "@/store";
import { useHydration } from "@/hooks/useHydration";
import { useToast } from "@/components/ui/Toast";
import { getAllRounds, isSetComplete } from "@/lib/scoring";

type Tab = "scoreboard" | "sets" | "stats";

const SESSION_DETAIL_STEPS: CoachmarkStep[] = [
  { targetSelector: '[data-coachmark="tab-bar"]', message: "점수판, 세트 이력, 통계를 탭으로 전환하세요", placement: "bottom" },
  { targetSelector: '[data-coachmark="new-set"]', message: "여기를 눌러 새 세트를 시작하세요", placement: "top" },
];

const TABS: { key: Tab; label: string }[] = [
  { key: "scoreboard", label: "점수판" },
  { key: "sets", label: "세트 이력" },
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
  const createSet = useStore((s) => s.createSet);
  const deleteSet = useStore((s) => s.deleteSet);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("scoreboard");
  const [showNewSet, setShowNewSet] = useState(false);
  const [targetRounds, setTargetRounds] = useState("4");
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

  const allRounds = getAllRounds(session);

  const handleCreateSet = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(targetRounds, 10);
    if (isNaN(count) || count < 1) return;
    const newSet = createSet(sessionId, count);
    setShowNewSet(false);
    setTargetRounds("4");
    if (newSet) {
      toast("새 세트가 생성되었습니다");
    }
  };

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
      {session.sets.length > 0 && (
        <div className="flex border-b border-border bg-surface" role="tablist" aria-label="세션 탭" data-coachmark="tab-bar">
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
        {session.sets.length === 0 ? (
          <EmptyState
            title="아직 세트가 없습니다"
            description="세트를 만들어 게임을 시작하세요"
            icon="trophy"
            action={
              <Button onClick={() => setShowNewSet(true)} data-coachmark="new-set">
                첫 세트 만들기
              </Button>
            }
          />
        ) : (
          <>
            {activeTab === "scoreboard" && (
              <div id="panel-scoreboard" role="tabpanel" aria-labelledby="tab-scoreboard">
                {session.sets.some((s) => s.rounds.length > 0) ? (
                  <SetScoreTable playerIds={session.playerIds} sets={session.sets} players={players} />
                ) : (
                  <div className="text-center py-8 text-text-secondary">
                    <p>세트에 라운드를 추가하면 점수판이 표시됩니다</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "sets" && (
              <div id="panel-sets" role="tabpanel" aria-labelledby="tab-sets">
                <div className="flex flex-col gap-2">
                  {session.sets.map((gameSet, index) => {
                    const complete = isSetComplete(gameSet);
                    return (
                      <Link
                        key={gameSet.id}
                        href={`/sessions/${sessionId}/sets/${gameSet.id}`}
                        className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated px-4 py-3 transition-colors hover:border-primary/20 cursor-pointer"
                      >
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-light text-xs font-bold text-primary-text">
                              {index + 1}
                            </span>
                            <span className="font-medium text-text-primary">
                              세트 {index + 1}
                            </span>
                            {complete ? (
                              <Badge variant="success">완료</Badge>
                            ) : (
                              <Badge>진행 중</Badge>
                            )}
                          </div>
                          <span className="text-sm text-text-secondary">
                            {gameSet.rounds.length}/{gameSet.targetRounds} 라운드
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
                              setDeleteTarget(gameSet.id);
                            }}
                          >
                            삭제
                          </Button>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "stats" && (
              <div id="panel-stats" role="tabpanel" aria-labelledby="tab-stats">
                <SessionStatsTab playerIds={session.playerIds} rounds={allRounds} players={players} />
              </div>
            )}
          </>
        )}
      </div>

      {/* FAB for creating new set */}
      {session.playerIds.length >= 2 && session.sets.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
          <div className="mx-auto max-w-lg relative">
            <button
              aria-label="새 세트 만들기"
              data-coachmark="new-set"
              onClick={() => setShowNewSet(true)}
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
            </button>
          </div>
        </div>
      )}

      {/* New Set Dialog */}
      <Dialog
        open={showNewSet}
        onClose={() => setShowNewSet(false)}
        title="새 세트"
      >
        <form onSubmit={handleCreateSet} className="flex flex-col gap-4">
          <Input
            label="목표 라운드 수"
            id="target-rounds"
            type="number"
            min="1"
            max="99"
            value={targetRounds}
            onChange={(e) => setTargetRounds(e.target.value)}
            required
            autoFocus
          />
          <Button type="submit" disabled={!targetRounds || parseInt(targetRounds, 10) < 1}>
            세트 만들기
          </Button>
        </form>
      </Dialog>

      {/* Delete Set Confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteSet(sessionId, deleteTarget);
            toast("세트가 삭제되었습니다");
          }
        }}
        title="세트 삭제"
        description="이 세트를 삭제하시겠습니까? 모든 라운드 데이터가 함께 삭제됩니다."
        confirmLabel="삭제"
      />

      <CoachmarkOverlay steps={SESSION_DETAIL_STEPS} group="session-detail" />
    </div>
  );
}
