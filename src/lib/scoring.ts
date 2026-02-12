import type { Round, ScoreEntry } from "@/types";

export function calculateScore(rank: number): number {
  return rank - 1;
}

export function buildScoreboard(
  playerIds: string[],
  rounds: Round[]
): ScoreEntry[] {
  const entries: ScoreEntry[] = playerIds.map((playerId) => {
    const scores = rounds.map((round) => {
      const result = round.results.find((r) => r.playerId === playerId);
      if (!result) return null;
      return calculateScore(result.rank);
    });

    const total = scores.reduce<number>(
      (sum, s) => sum + (s ?? 0),
      0
    );

    return { playerId, scores, total, rank: 0 };
  });

  // Sort by total ascending (lower is better), then assign ranks
  const sorted = [...entries].sort((a, b) => a.total - b.total);
  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].total === sorted[i - 1].total) {
      sorted[i].rank = sorted[i - 1].rank;
    } else {
      sorted[i].rank = currentRank;
    }
    currentRank++;
  }

  // Write ranks back to entries by playerId
  for (const entry of entries) {
    const s = sorted.find((x) => x.playerId === entry.playerId);
    if (s) entry.rank = s.rank;
  }

  return entries;
}
