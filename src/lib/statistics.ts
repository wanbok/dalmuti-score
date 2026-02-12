import type {
  Session,
  Round,
  PlayerStatistics,
  SessionStatistics,
  HeadToHeadStats,
  RoundTrendPoint,
} from "@/types";
import { calculateScore, buildScoreboard } from "@/lib/scoring";

export function calculatePlayerStatistics(
  playerId: string,
  sessions: Session[]
): PlayerStatistics {
  let totalGames = 0;
  let wins = 0;
  let rankSum = 0;
  let bestRank = 0;
  let worstRank = 0;
  let revolutionCount = 0;
  const sessionSet = new Set<string>();

  for (const session of sessions) {
    for (const round of session.rounds) {
      const result = round.results.find((r) => r.playerId === playerId);
      if (!result) continue;

      totalGames++;
      sessionSet.add(session.id);
      rankSum += result.rank;

      if (result.rank === 1) wins++;
      if (bestRank === 0 || result.rank < bestRank) bestRank = result.rank;
      if (result.rank > worstRank) worstRank = result.rank;
      if (round.revolution === true) revolutionCount++;
    }
  }

  return {
    playerId,
    totalGames,
    totalSessions: sessionSet.size,
    wins,
    winRate: totalGames > 0 ? wins / totalGames : 0,
    averageRank: totalGames > 0 ? rankSum / totalGames : 0,
    bestRank,
    worstRank,
    revolutionCount,
  };
}

export function calculateSessionTrend(
  playerId: string,
  sessions: Session[]
): SessionStatistics[] {
  const results: SessionStatistics[] = [];

  for (const session of sessions) {
    const participatedRounds = session.rounds.filter((r) =>
      r.results.some((res) => res.playerId === playerId)
    );

    if (participatedRounds.length === 0) continue;

    let wins = 0;
    let rankSum = 0;

    for (const round of participatedRounds) {
      const result = round.results.find((r) => r.playerId === playerId)!;
      rankSum += result.rank;
      if (result.rank === 1) wins++;
    }

    const scoreboard = buildScoreboard(session.playerIds, session.rounds);
    const entry = scoreboard.find((e) => e.playerId === playerId);

    results.push({
      sessionId: session.id,
      playerId,
      gamesPlayed: participatedRounds.length,
      wins,
      averageRank: rankSum / participatedRounds.length,
      totalScore: entry?.total ?? 0,
      finalRank: entry?.rank ?? 0,
    });
  }

  results.sort((a, b) => {
    const sessionA = sessions.find((s) => s.id === a.sessionId)!;
    const sessionB = sessions.find((s) => s.id === b.sessionId)!;
    return sessionA.createdAt - sessionB.createdAt;
  });

  return results;
}

export function calculateRoundTrend(
  playerId: string,
  rounds: Round[]
): RoundTrendPoint[] {
  const points: RoundTrendPoint[] = [];
  let cumulative = 0;

  for (let i = 0; i < rounds.length; i++) {
    const result = rounds[i].results.find((r) => r.playerId === playerId);
    if (!result) continue;

    cumulative += calculateScore(result.rank);
    points.push({ roundIndex: i, cumulativeScore: cumulative });
  }

  return points;
}

export function calculateAllPlayerRoundTrends(
  playerIds: string[],
  rounds: Round[]
): Map<string, RoundTrendPoint[]> {
  const map = new Map<string, RoundTrendPoint[]>();
  for (const playerId of playerIds) {
    map.set(playerId, calculateRoundTrend(playerId, rounds));
  }
  return map;
}

export function calculateHeadToHead(
  player1Id: string,
  player2Id: string,
  sessions: Session[]
): HeadToHeadStats {
  let player1Wins = 0;
  let player2Wins = 0;
  let draws = 0;
  let totalFaceOffs = 0;

  for (const session of sessions) {
    for (const round of session.rounds) {
      const r1 = round.results.find((r) => r.playerId === player1Id);
      const r2 = round.results.find((r) => r.playerId === player2Id);

      if (!r1 || !r2) continue;

      totalFaceOffs++;
      if (r1.rank < r2.rank) player1Wins++;
      else if (r2.rank < r1.rank) player2Wins++;
      else draws++;
    }
  }

  return {
    player1Id,
    player2Id,
    player1Wins,
    player2Wins,
    draws,
    totalFaceOffs,
  };
}
