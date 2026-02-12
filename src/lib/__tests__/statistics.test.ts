import { describe, it, expect } from "vitest";
import {
  calculatePlayerStatistics,
  calculateSessionTrend,
  calculateRoundTrend,
  calculateAllPlayerRoundTrends,
  calculateHeadToHead,
} from "../statistics";
import type { Session, Round } from "@/types";

// Helper to create rounds concisely
function makeRound(
  id: string,
  participantIds: string[],
  ranks: { playerId: string; rank: number }[],
  options?: { revolution?: boolean }
): Round {
  return {
    id,
    participantIds,
    results: ranks,
    revolution: options?.revolution,
    createdAt: Date.now(),
  };
}

function makeSession(
  id: string,
  playerIds: string[],
  rounds: Round[],
  createdAt?: number
): Session {
  return { id, name: `Session ${id}`, playerIds, rounds, createdAt: createdAt ?? Date.now() };
}

describe("calculatePlayerStatistics", () => {
  it("returns zero stats for player with no games", () => {
    const sessions: Session[] = [];
    const stats = calculatePlayerStatistics("a", sessions);

    expect(stats.playerId).toBe("a");
    expect(stats.totalGames).toBe(0);
    expect(stats.totalSessions).toBe(0);
    expect(stats.wins).toBe(0);
    expect(stats.winRate).toBe(0);
    expect(stats.averageRank).toBe(0);
    expect(stats.bestRank).toBe(0);
    expect(stats.worstRank).toBe(0);
    expect(stats.revolutionCount).toBe(0);
  });

  it("calculates stats for a single game", () => {
    const round = makeRound("r1", ["a", "b", "c"], [
      { playerId: "a", rank: 1 },
      { playerId: "b", rank: 2 },
      { playerId: "c", rank: 3 },
    ]);
    const session = makeSession("s1", ["a", "b", "c"], [round]);

    const stats = calculatePlayerStatistics("a", [session]);

    expect(stats.totalGames).toBe(1);
    expect(stats.totalSessions).toBe(1);
    expect(stats.wins).toBe(1);
    expect(stats.winRate).toBe(1);
    expect(stats.averageRank).toBe(1);
    expect(stats.bestRank).toBe(1);
    expect(stats.worstRank).toBe(1);
  });

  it("calculates stats across multiple sessions", () => {
    const s1 = makeSession("s1", ["a", "b"], [
      makeRound("r1", ["a", "b"], [
        { playerId: "a", rank: 1 },
        { playerId: "b", rank: 2 },
      ]),
      makeRound("r2", ["a", "b"], [
        { playerId: "a", rank: 2 },
        { playerId: "b", rank: 1 },
      ]),
    ]);
    const s2 = makeSession("s2", ["a", "b"], [
      makeRound("r3", ["a", "b"], [
        { playerId: "a", rank: 1 },
        { playerId: "b", rank: 2 },
      ]),
    ]);

    const stats = calculatePlayerStatistics("a", [s1, s2]);

    expect(stats.totalGames).toBe(3);
    expect(stats.totalSessions).toBe(2);
    expect(stats.wins).toBe(2);
    expect(stats.winRate).toBeCloseTo(2 / 3);
    expect(stats.averageRank).toBeCloseTo(4 / 3); // (1+2+1)/3
    expect(stats.bestRank).toBe(1);
    expect(stats.worstRank).toBe(2);
  });

  it("ignores rounds where player did not participate", () => {
    const session = makeSession("s1", ["a", "b", "c"], [
      makeRound("r1", ["a", "b"], [
        { playerId: "a", rank: 1 },
        { playerId: "b", rank: 2 },
      ]),
      makeRound("r2", ["b", "c"], [
        { playerId: "b", rank: 1 },
        { playerId: "c", rank: 2 },
      ]),
    ]);

    const stats = calculatePlayerStatistics("a", [session]);

    expect(stats.totalGames).toBe(1);
    expect(stats.totalSessions).toBe(1);
    expect(stats.wins).toBe(1);
  });

  it("counts revolution rounds", () => {
    const session = makeSession("s1", ["a", "b"], [
      makeRound("r1", ["a", "b"], [
        { playerId: "a", rank: 1 },
        { playerId: "b", rank: 2 },
      ], { revolution: true }),
      makeRound("r2", ["a", "b"], [
        { playerId: "a", rank: 2 },
        { playerId: "b", rank: 1 },
      ]),
      makeRound("r3", ["a", "b"], [
        { playerId: "a", rank: 1 },
        { playerId: "b", rank: 2 },
      ], { revolution: true }),
    ]);

    const stats = calculatePlayerStatistics("a", [session]);

    expect(stats.revolutionCount).toBe(2);
  });

  it("does not count session where player has no rounds", () => {
    const session = makeSession("s1", ["a", "b", "c"], [
      makeRound("r1", ["b", "c"], [
        { playerId: "b", rank: 1 },
        { playerId: "c", rank: 2 },
      ]),
    ]);

    const stats = calculatePlayerStatistics("a", [session]);

    expect(stats.totalSessions).toBe(0);
    expect(stats.totalGames).toBe(0);
  });

  it("handles session with empty rounds array", () => {
    const session = makeSession("s1", ["a", "b"], []);
    const stats = calculatePlayerStatistics("a", [session]);

    expect(stats.totalGames).toBe(0);
    expect(stats.totalSessions).toBe(0);
  });

  it("handles single player always winning", () => {
    const session = makeSession("s1", ["a"], [
      makeRound("r1", ["a"], [{ playerId: "a", rank: 1 }]),
      makeRound("r2", ["a"], [{ playerId: "a", rank: 1 }]),
    ]);

    const stats = calculatePlayerStatistics("a", [session]);

    expect(stats.totalGames).toBe(2);
    expect(stats.wins).toBe(2);
    expect(stats.winRate).toBe(1);
    expect(stats.bestRank).toBe(1);
    expect(stats.worstRank).toBe(1);
  });

  it("handles revolution undefined (backward compat)", () => {
    const round: Round = {
      id: "r1",
      participantIds: ["a", "b"],
      results: [
        { playerId: "a", rank: 1 },
        { playerId: "b", rank: 2 },
      ],
      createdAt: Date.now(),
      // revolution not set (undefined)
    };
    const session = makeSession("s1", ["a", "b"], [round]);

    const stats = calculatePlayerStatistics("a", [session]);
    expect(stats.revolutionCount).toBe(0);
  });

  it("tracks worst rank across many rounds", () => {
    const rounds = Array.from({ length: 10 }, (_, i) =>
      makeRound(`r${i}`, ["a", "b", "c", "d", "e"], [
        { playerId: "a", rank: (i % 5) + 1 },
        { playerId: "b", rank: ((i + 1) % 5) + 1 },
        { playerId: "c", rank: ((i + 2) % 5) + 1 },
        { playerId: "d", rank: ((i + 3) % 5) + 1 },
        { playerId: "e", rank: ((i + 4) % 5) + 1 },
      ])
    );
    const session = makeSession("s1", ["a", "b", "c", "d", "e"], rounds);

    const stats = calculatePlayerStatistics("a", [session]);

    expect(stats.totalGames).toBe(10);
    expect(stats.bestRank).toBe(1);
    expect(stats.worstRank).toBe(5);
    expect(stats.wins).toBe(2); // rank 1 occurs at i=0 and i=5
    expect(stats.averageRank).toBe(3); // (1+2+3+4+5+1+2+3+4+5)/10 = 30/10
  });
});

describe("calculateSessionTrend", () => {
  it("returns empty array when no sessions", () => {
    const trend = calculateSessionTrend("a", []);
    expect(trend).toEqual([]);
  });

  it("returns stats for a single session", () => {
    const session = makeSession("s1", ["a", "b", "c"], [
      makeRound("r1", ["a", "b", "c"], [
        { playerId: "a", rank: 1 },
        { playerId: "b", rank: 2 },
        { playerId: "c", rank: 3 },
      ]),
      makeRound("r2", ["a", "b", "c"], [
        { playerId: "a", rank: 2 },
        { playerId: "b", rank: 1 },
        { playerId: "c", rank: 3 },
      ]),
    ], 1000);

    const trend = calculateSessionTrend("a", [session]);

    expect(trend).toHaveLength(1);
    expect(trend[0].sessionId).toBe("s1");
    expect(trend[0].playerId).toBe("a");
    expect(trend[0].gamesPlayed).toBe(2);
    expect(trend[0].wins).toBe(1);
    expect(trend[0].averageRank).toBeCloseTo(1.5); // (1+2)/2
    expect(trend[0].totalScore).toBe(1); // 0 + 1
    expect(trend[0].finalRank).toBe(1); // lowest total score = rank 1
  });

  it("sorts sessions by createdAt ascending", () => {
    const s1 = makeSession("s1", ["a", "b"], [
      makeRound("r1", ["a", "b"], [
        { playerId: "a", rank: 1 },
        { playerId: "b", rank: 2 },
      ]),
    ], 2000);
    const s2 = makeSession("s2", ["a", "b"], [
      makeRound("r2", ["a", "b"], [
        { playerId: "a", rank: 2 },
        { playerId: "b", rank: 1 },
      ]),
    ], 1000);

    const trend = calculateSessionTrend("a", [s1, s2]);

    expect(trend).toHaveLength(2);
    expect(trend[0].sessionId).toBe("s2"); // earlier createdAt
    expect(trend[1].sessionId).toBe("s1");
  });

  it("skips sessions where player did not participate", () => {
    const s1 = makeSession("s1", ["a", "b"], [
      makeRound("r1", ["a", "b"], [
        { playerId: "a", rank: 1 },
        { playerId: "b", rank: 2 },
      ]),
    ], 1000);
    const s2 = makeSession("s2", ["b", "c"], [
      makeRound("r2", ["b", "c"], [
        { playerId: "b", rank: 1 },
        { playerId: "c", rank: 2 },
      ]),
    ], 2000);

    const trend = calculateSessionTrend("a", [s1, s2]);

    expect(trend).toHaveLength(1);
    expect(trend[0].sessionId).toBe("s1");
  });

  it("handles session with empty rounds", () => {
    const session = makeSession("s1", ["a", "b"], [], 1000);
    const trend = calculateSessionTrend("a", [session]);
    expect(trend).toEqual([]);
  });

  it("calculates finalRank correctly with ties", () => {
    const session = makeSession("s1", ["a", "b", "c"], [
      makeRound("r1", ["a", "b", "c"], [
        { playerId: "a", rank: 1 },
        { playerId: "b", rank: 2 },
        { playerId: "c", rank: 3 },
      ]),
      makeRound("r2", ["a", "b", "c"], [
        { playerId: "a", rank: 3 },
        { playerId: "b", rank: 2 },
        { playerId: "c", rank: 1 },
      ]),
    ], 1000);

    const trend = calculateSessionTrend("a", [session]);

    // a: 0+2=2, b: 1+1=2, c: 2+0=2 → all tied at rank 1
    expect(trend[0].finalRank).toBe(1);
    expect(trend[0].totalScore).toBe(2);
  });
});

describe("calculateRoundTrend", () => {
  it("returns empty array for no rounds", () => {
    expect(calculateRoundTrend("a", [])).toEqual([]);
  });

  it("calculates cumulative score for single round", () => {
    const rounds: Round[] = [
      makeRound("r1", ["a", "b"], [
        { playerId: "a", rank: 2 },
        { playerId: "b", rank: 1 },
      ]),
    ];

    const trend = calculateRoundTrend("a", rounds);

    expect(trend).toHaveLength(1);
    expect(trend[0]).toEqual({ roundIndex: 0, cumulativeScore: 1 }); // rank 2 → score 1
  });

  it("accumulates scores across multiple rounds", () => {
    const rounds: Round[] = [
      makeRound("r1", ["a", "b", "c"], [
        { playerId: "a", rank: 1 },
        { playerId: "b", rank: 2 },
        { playerId: "c", rank: 3 },
      ]),
      makeRound("r2", ["a", "b", "c"], [
        { playerId: "a", rank: 3 },
        { playerId: "b", rank: 1 },
        { playerId: "c", rank: 2 },
      ]),
      makeRound("r3", ["a", "b", "c"], [
        { playerId: "a", rank: 2 },
        { playerId: "b", rank: 3 },
        { playerId: "c", rank: 1 },
      ]),
    ];

    const trend = calculateRoundTrend("a", rounds);

    expect(trend).toHaveLength(3);
    expect(trend[0]).toEqual({ roundIndex: 0, cumulativeScore: 0 }); // rank 1 → 0
    expect(trend[1]).toEqual({ roundIndex: 1, cumulativeScore: 2 }); // 0 + 2
    expect(trend[2]).toEqual({ roundIndex: 2, cumulativeScore: 3 }); // 2 + 1
  });

  it("skips rounds where player did not participate", () => {
    const rounds: Round[] = [
      makeRound("r1", ["a", "b"], [
        { playerId: "a", rank: 1 },
        { playerId: "b", rank: 2 },
      ]),
      makeRound("r2", ["b", "c"], [
        { playerId: "b", rank: 1 },
        { playerId: "c", rank: 2 },
      ]),
      makeRound("r3", ["a", "b"], [
        { playerId: "a", rank: 2 },
        { playerId: "b", rank: 1 },
      ]),
    ];

    const trend = calculateRoundTrend("a", rounds);

    expect(trend).toHaveLength(2);
    expect(trend[0]).toEqual({ roundIndex: 0, cumulativeScore: 0 }); // round 0, rank 1
    expect(trend[1]).toEqual({ roundIndex: 2, cumulativeScore: 1 }); // round 2 (skipped 1), rank 2
  });
});

describe("calculateAllPlayerRoundTrends", () => {
  it("returns empty map for no rounds", () => {
    const result = calculateAllPlayerRoundTrends(["a", "b"], []);
    expect(result.get("a")).toEqual([]);
    expect(result.get("b")).toEqual([]);
  });

  it("returns trends for all players", () => {
    const rounds: Round[] = [
      makeRound("r1", ["a", "b"], [
        { playerId: "a", rank: 1 },
        { playerId: "b", rank: 2 },
      ]),
      makeRound("r2", ["a", "b"], [
        { playerId: "a", rank: 2 },
        { playerId: "b", rank: 1 },
      ]),
    ];

    const result = calculateAllPlayerRoundTrends(["a", "b"], rounds);

    expect(result.get("a")).toEqual([
      { roundIndex: 0, cumulativeScore: 0 },
      { roundIndex: 1, cumulativeScore: 1 },
    ]);
    expect(result.get("b")).toEqual([
      { roundIndex: 0, cumulativeScore: 1 },
      { roundIndex: 1, cumulativeScore: 1 },
    ]);
  });
});

describe("calculateHeadToHead", () => {
  it("returns zero stats when players never faced each other", () => {
    const session = makeSession("s1", ["a", "b", "c"], [
      makeRound("r1", ["a", "c"], [
        { playerId: "a", rank: 1 },
        { playerId: "c", rank: 2 },
      ]),
      makeRound("r2", ["b", "c"], [
        { playerId: "b", rank: 1 },
        { playerId: "c", rank: 2 },
      ]),
    ]);

    const h2h = calculateHeadToHead("a", "b", [session]);

    expect(h2h.player1Id).toBe("a");
    expect(h2h.player2Id).toBe("b");
    expect(h2h.player1Wins).toBe(0);
    expect(h2h.player2Wins).toBe(0);
    expect(h2h.draws).toBe(0);
    expect(h2h.totalFaceOffs).toBe(0);
  });

  it("counts wins correctly when both participate", () => {
    const session = makeSession("s1", ["a", "b"], [
      makeRound("r1", ["a", "b"], [
        { playerId: "a", rank: 1 },
        { playerId: "b", rank: 2 },
      ]),
      makeRound("r2", ["a", "b"], [
        { playerId: "a", rank: 2 },
        { playerId: "b", rank: 1 },
      ]),
      makeRound("r3", ["a", "b"], [
        { playerId: "a", rank: 1 },
        { playerId: "b", rank: 2 },
      ]),
    ]);

    const h2h = calculateHeadToHead("a", "b", [session]);

    expect(h2h.player1Wins).toBe(2);
    expect(h2h.player2Wins).toBe(1);
    expect(h2h.draws).toBe(0);
    expect(h2h.totalFaceOffs).toBe(3);
  });

  it("counts draws when ranks are equal", () => {
    const session = makeSession("s1", ["a", "b", "c"], [
      makeRound("r1", ["a", "b", "c"], [
        { playerId: "a", rank: 1 },
        { playerId: "b", rank: 1 },
        { playerId: "c", rank: 3 },
      ]),
    ]);

    const h2h = calculateHeadToHead("a", "b", [session]);

    expect(h2h.player1Wins).toBe(0);
    expect(h2h.player2Wins).toBe(0);
    expect(h2h.draws).toBe(1);
    expect(h2h.totalFaceOffs).toBe(1);
  });

  it("ignores rounds where only one player participates", () => {
    const session = makeSession("s1", ["a", "b", "c"], [
      makeRound("r1", ["a", "b"], [
        { playerId: "a", rank: 1 },
        { playerId: "b", rank: 2 },
      ]),
      makeRound("r2", ["a", "c"], [
        { playerId: "a", rank: 1 },
        { playerId: "c", rank: 2 },
      ]),
    ]);

    const h2h = calculateHeadToHead("a", "b", [session]);

    expect(h2h.totalFaceOffs).toBe(1);
    expect(h2h.player1Wins).toBe(1);
  });

  it("works across multiple sessions", () => {
    const s1 = makeSession("s1", ["a", "b"], [
      makeRound("r1", ["a", "b"], [
        { playerId: "a", rank: 1 },
        { playerId: "b", rank: 2 },
      ]),
    ]);
    const s2 = makeSession("s2", ["a", "b"], [
      makeRound("r2", ["a", "b"], [
        { playerId: "a", rank: 2 },
        { playerId: "b", rank: 1 },
      ]),
    ]);

    const h2h = calculateHeadToHead("a", "b", [s1, s2]);

    expect(h2h.player1Wins).toBe(1);
    expect(h2h.player2Wins).toBe(1);
    expect(h2h.totalFaceOffs).toBe(2);
  });

  it("returns zero stats for empty sessions", () => {
    const h2h = calculateHeadToHead("a", "b", []);

    expect(h2h.totalFaceOffs).toBe(0);
    expect(h2h.player1Wins).toBe(0);
    expect(h2h.player2Wins).toBe(0);
    expect(h2h.draws).toBe(0);
  });

  it("handles multiple draws in a row", () => {
    const session = makeSession("s1", ["a", "b"], [
      makeRound("r1", ["a", "b"], [
        { playerId: "a", rank: 1 },
        { playerId: "b", rank: 1 },
      ]),
      makeRound("r2", ["a", "b"], [
        { playerId: "a", rank: 2 },
        { playerId: "b", rank: 2 },
      ]),
    ]);

    const h2h = calculateHeadToHead("a", "b", [session]);

    expect(h2h.draws).toBe(2);
    expect(h2h.totalFaceOffs).toBe(2);
    expect(h2h.player1Wins).toBe(0);
    expect(h2h.player2Wins).toBe(0);
  });
});
