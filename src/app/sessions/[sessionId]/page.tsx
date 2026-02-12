"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { ScoreTable } from "@/components/scoreboard/ScoreTable";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/store";
import { useHydration } from "@/hooks/useHydration";

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

  if (!hydrated) {
    return (
      <div>
        <AppHeader backHref="/sessions" title="로딩..." />
        <div className="p-4 animate-pulse">
          <div className="h-48 rounded-xl bg-gray-200" />
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
            <ScoreTable session={session} players={players} />

            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">라운드 이력</h3>
              <div className="flex flex-col gap-2">
                {session.rounds.map((round, index) => {
                  const playerMap = new Map(
                    players.map((p) => [p.id, p])
                  );
                  return (
                    <div
                      key={round.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
                    >
                      <div>
                        <span className="font-medium text-gray-900">
                          R{index + 1}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
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
                          className="text-red-500"
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
          </>
        )}
      </div>

      {/* FAB for adding rounds */}
      {session.playerIds.length >= 2 && (
        <Link
          href={`/sessions/${sessionId}/rounds/new`}
          className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
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
