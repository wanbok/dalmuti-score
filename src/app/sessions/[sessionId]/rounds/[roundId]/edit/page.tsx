"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { ParticipantSelector } from "@/components/round/ParticipantSelector";
import { RankingList } from "@/components/round/RankingList";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { useStore } from "@/store";
import { useHydration } from "@/hooks/useHydration";
import { useToast } from "@/components/ui/Toast";
import type { RoundResult } from "@/types";

const ROUND_STEPS = [
  { label: "참가자" },
  { label: "순위" },
];

export default function EditRoundPage({
  params,
}: {
  params: Promise<{ sessionId: string; roundId: string }>;
}) {
  const { sessionId, roundId } = use(params);
  const hydrated = useHydration();
  const session = useStore((s) => s.getSession(sessionId));
  const round = useStore((s) => s.getRound(sessionId, roundId));
  const players = useStore((s) => s.players);
  const updateRound = useStore((s) => s.updateRound);
  const deleteRound = useStore((s) => s.deleteRound);
  const router = useRouter();
  const { toast } = useToast();

  const sessionPlayers = useMemo(() => {
    if (!session) return [];
    return players.filter((p) => session.playerIds.includes(p.id));
  }, [session, players]);

  const [step, setStep] = useState<"select" | "rank">("select");
  const [selected, setSelected] = useState<Set<string>>(() => {
    if (!round) return new Set();
    return new Set(round.participantIds);
  });
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Preserve existing order for participants that were in the original round
  const initialOrder = useMemo(() => {
    if (!round) return [...selected];
    const existingOrder = [...round.results]
      .sort((a, b) => a.rank - b.rank)
      .map((r) => r.playerId)
      .filter((id) => selected.has(id));
    const newIds = [...selected].filter((id) => !existingOrder.includes(id));
    return [...existingOrder, ...newIds];
  }, [round, selected]);

  if (!hydrated) {
    return (
      <div>
        <AppHeader backHref={`/sessions/${sessionId}`} title="로딩..." />
      </div>
    );
  }

  if (!session || !round) {
    return (
      <div>
        <AppHeader backHref={`/sessions/${sessionId}`} title="라운드 없음" />
        <EmptyState title="라운드를 찾을 수 없습니다" />
      </div>
    );
  }

  const participantPlayers = sessionPlayers.filter((p) => selected.has(p.id));

  const handleToggle = (playerId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  };

  const handleSave = (orderedIds: string[], revolution: boolean) => {
    const results: RoundResult[] = orderedIds.map((playerId, index) => ({
      playerId,
      rank: index + 1,
    }));
    updateRound(sessionId, roundId, orderedIds, results, revolution);
    toast("라운드가 수정되었습니다");
    router.push(`/sessions/${sessionId}`);
  };

  const handleDelete = () => {
    deleteRound(sessionId, roundId);
    toast("라운드가 삭제되었습니다");
    router.push(`/sessions/${sessionId}`);
  };

  return (
    <div>
      <AppHeader
        backHref={`/sessions/${sessionId}`}
        title="라운드 수정"
        action={
          <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
            삭제
          </Button>
        }
      />
      <div className="p-4">
        <StepIndicator
          steps={ROUND_STEPS}
          currentStep={step === "select" ? 0 : 1}
        />
        {step === "select" ? (
          <ParticipantSelector
            players={sessionPlayers}
            selected={selected}
            onToggle={handleToggle}
            onSelectAll={() =>
              setSelected(new Set(sessionPlayers.map((p) => p.id)))
            }
            onDeselectAll={() => setSelected(new Set())}
            onConfirm={() => setStep("rank")}
          />
        ) : (
          <RankingList
            players={participantPlayers}
            initialOrder={initialOrder}
            initialRevolution={round.revolution ?? false}
            onSave={handleSave}
            onBack={() => setStep("select")}
          />
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="라운드 삭제"
        description="이 라운드를 삭제하시겠습니까?"
        confirmLabel="삭제"
      />
    </div>
  );
}
