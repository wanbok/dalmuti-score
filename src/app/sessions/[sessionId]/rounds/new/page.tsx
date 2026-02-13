"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { ParticipantSelector } from "@/components/round/ParticipantSelector";
import { RankingList } from "@/components/round/RankingList";
import { EmptyState } from "@/components/layout/EmptyState";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { useStore } from "@/store";
import { useHydration } from "@/hooks/useHydration";
import { useToast } from "@/components/ui/Toast";
import type { RoundResult } from "@/types";

const ROUND_STEPS = [
  { label: "참가자" },
  { label: "순위" },
];

export default function NewRoundPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const hydrated = useHydration();
  const session = useStore((s) => s.getSession(sessionId));
  const players = useStore((s) => s.players);
  const addRound = useStore((s) => s.addRound);
  const router = useRouter();
  const { toast } = useToast();

  const sessionPlayers = useMemo(() => {
    if (!session) return [];
    return players.filter((p) => session.playerIds.includes(p.id));
  }, [session, players]);

  const [step, setStep] = useState<"select" | "rank">("select");
  // Initialize with all session player IDs selected
  const [selected, setSelected] = useState<Set<string>>(() => {
    return new Set<string>();
  });

  // Track if we've initialized selection from hydrated data
  const [initialized, setInitialized] = useState(false);
  if (hydrated && !initialized && sessionPlayers.length > 0) {
    setInitialized(true);
    setSelected(new Set(sessionPlayers.map((p) => p.id)));
  }

  if (!hydrated) {
    return (
      <div>
        <AppHeader backHref={`/sessions/${sessionId}`} title="로딩..." />
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
    addRound(sessionId, orderedIds, results, revolution);
    toast("라운드가 저장되었습니다");
    router.push(`/sessions/${sessionId}`);
  };

  return (
    <div>
      <AppHeader
        backHref={`/sessions/${sessionId}`}
        title={`라운드 ${session.rounds.length + 1}`}
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
            onSave={handleSave}
            onBack={() => setStep("select")}
          />
        )}
      </div>
    </div>
  );
}
