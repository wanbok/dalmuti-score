import { describe, it, expect } from "vitest";
import { calculateScore, buildScoreboard, getAllRounds, isSetComplete, buildSetScoreboard } from "../scoring";
import type { Round, Session, GameSet } from "@/types";

describe("calculateScore", () => {
  it("returns rank - 1", () => {
    expect(calculateScore(1)).toBe(0);
    expect(calculateScore(2)).toBe(1);
    expect(calculateScore(5)).toBe(4);
  });
});

describe("buildScoreboard", () => {
  const playerIds = ["a", "b", "c"];

  it("calculates scores for a single round", () => {
    const rounds: Round[] = [
      {
        id: "r1",
        participantIds: ["a", "b", "c"],
        results: [
          { playerId: "a", rank: 1 },
          { playerId: "b", rank: 2 },
          { playerId: "c", rank: 3 },
        ],
        createdAt: 1,
      },
    ];

    const board = buildScoreboard(playerIds, rounds);
    const a = board.find((e) => e.playerId === "a")!;
    const b = board.find((e) => e.playerId === "b")!;
    const c = board.find((e) => e.playerId === "c")!;

    expect(a.total).toBe(0);
    expect(b.total).toBe(1);
    expect(c.total).toBe(2);
    expect(a.rank).toBe(1);
    expect(b.rank).toBe(2);
    expect(c.rank).toBe(3);
  });

  it("handles absent players as null score (0 in total)", () => {
    const rounds: Round[] = [
      {
        id: "r1",
        participantIds: ["a", "b"],
        results: [
          { playerId: "a", rank: 1 },
          { playerId: "b", rank: 2 },
        ],
        createdAt: 1,
      },
    ];

    const board = buildScoreboard(playerIds, rounds);
    const c = board.find((e) => e.playerId === "c")!;

    expect(c.scores[0]).toBeNull();
    expect(c.total).toBe(0);
  });

  it("accumulates scores across multiple rounds", () => {
    const rounds: Round[] = [
      {
        id: "r1",
        participantIds: ["a", "b", "c"],
        results: [
          { playerId: "a", rank: 1 },
          { playerId: "b", rank: 2 },
          { playerId: "c", rank: 3 },
        ],
        createdAt: 1,
      },
      {
        id: "r2",
        participantIds: ["a", "b", "c"],
        results: [
          { playerId: "a", rank: 3 },
          { playerId: "b", rank: 1 },
          { playerId: "c", rank: 2 },
        ],
        createdAt: 2,
      },
    ];

    const board = buildScoreboard(playerIds, rounds);
    const a = board.find((e) => e.playerId === "a")!;
    const b = board.find((e) => e.playerId === "b")!;
    const c = board.find((e) => e.playerId === "c")!;

    expect(a.total).toBe(2); // 0 + 2
    expect(b.total).toBe(1); // 1 + 0
    expect(c.total).toBe(3); // 2 + 1
  });

  it("assigns same rank for tied totals", () => {
    const rounds: Round[] = [
      {
        id: "r1",
        participantIds: ["a", "b", "c"],
        results: [
          { playerId: "a", rank: 1 },
          { playerId: "b", rank: 2 },
          { playerId: "c", rank: 3 },
        ],
        createdAt: 1,
      },
      {
        id: "r2",
        participantIds: ["a", "b", "c"],
        results: [
          { playerId: "a", rank: 3 },
          { playerId: "b", rank: 2 },
          { playerId: "c", rank: 1 },
        ],
        createdAt: 2,
      },
    ];

    const board = buildScoreboard(playerIds, rounds);
    // a: 0+2=2, b: 1+1=2, c: 2+0=2 — all tied
    expect(board.every((e) => e.rank === 1)).toBe(true);
  });

  it("returns empty scores for no rounds", () => {
    const board = buildScoreboard(playerIds, []);
    expect(board.every((e) => e.total === 0)).toBe(true);
    expect(board.every((e) => e.scores.length === 0)).toBe(true);
  });
});

describe("getAllRounds", () => {
  it("flattens rounds from all sets", () => {
    const session: Session = {
      id: "s1",
      name: "Test",
      playerIds: ["a", "b"],
      sets: [
        {
          id: "set1",
          targetRounds: 2,
          rounds: [
            { id: "r1", participantIds: ["a", "b"], results: [], createdAt: 1 },
            { id: "r2", participantIds: ["a", "b"], results: [], createdAt: 2 },
          ],
          createdAt: 1,
        },
        {
          id: "set2",
          targetRounds: 1,
          rounds: [
            { id: "r3", participantIds: ["a", "b"], results: [], createdAt: 3 },
          ],
          createdAt: 2,
        },
      ],
      createdAt: 1,
    };

    const rounds = getAllRounds(session);
    expect(rounds).toHaveLength(3);
    expect(rounds.map((r) => r.id)).toEqual(["r1", "r2", "r3"]);
  });

  it("returns empty array for session with no sets", () => {
    const session: Session = {
      id: "s1",
      name: "Test",
      playerIds: [],
      sets: [],
      createdAt: 1,
    };

    expect(getAllRounds(session)).toEqual([]);
  });
});

describe("isSetComplete", () => {
  it("returns true when rounds >= targetRounds", () => {
    const gameSet: GameSet = {
      id: "set1",
      targetRounds: 2,
      rounds: [
        { id: "r1", participantIds: [], results: [], createdAt: 1 },
        { id: "r2", participantIds: [], results: [], createdAt: 2 },
      ],
      createdAt: 1,
    };
    expect(isSetComplete(gameSet)).toBe(true);
  });

  it("returns false when rounds < targetRounds", () => {
    const gameSet: GameSet = {
      id: "set1",
      targetRounds: 3,
      rounds: [
        { id: "r1", participantIds: [], results: [], createdAt: 1 },
      ],
      createdAt: 1,
    };
    expect(isSetComplete(gameSet)).toBe(false);
  });

  it("returns true when rounds exceed targetRounds", () => {
    const gameSet: GameSet = {
      id: "set1",
      targetRounds: 1,
      rounds: [
        { id: "r1", participantIds: [], results: [], createdAt: 1 },
        { id: "r2", participantIds: [], results: [], createdAt: 2 },
      ],
      createdAt: 1,
    };
    expect(isSetComplete(gameSet)).toBe(true);
  });
});

describe("buildSetScoreboard", () => {
  const playerIds = ["a", "b", "c"];

  it("calculates session-level scores from set rankings", () => {
    // Set 1: a=rank1(0), b=rank2(1), c=rank3(2) → set scores: a=0, b=1, c=2
    // Set 2: a=rank2(1), b=rank1(0), c=rank3(2) → set scores: a=0(rank1 in set), b=1, c=2...
    // Actually let me think more carefully:
    // In set 1 round scores: a=0, b=1, c=2 → ranks: a=1st, b=2nd, c=3rd → set scores: a=0, b=1, c=2
    const sets: GameSet[] = [
      {
        id: "set1",
        targetRounds: 1,
        rounds: [{
          id: "r1",
          participantIds: ["a", "b", "c"],
          results: [
            { playerId: "a", rank: 1 },
            { playerId: "b", rank: 2 },
            { playerId: "c", rank: 3 },
          ],
          createdAt: 1,
        }],
        createdAt: 1,
      },
      {
        id: "set2",
        targetRounds: 1,
        rounds: [{
          id: "r2",
          participantIds: ["a", "b", "c"],
          results: [
            { playerId: "a", rank: 3 },
            { playerId: "b", rank: 1 },
            { playerId: "c", rank: 2 },
          ],
          createdAt: 2,
        }],
        createdAt: 2,
      },
    ];

    const board = buildSetScoreboard(playerIds, sets);
    const a = board.find((e) => e.playerId === "a")!;
    const b = board.find((e) => e.playerId === "b")!;
    const c = board.find((e) => e.playerId === "c")!;

    // Set 1: round scores a=0,b=1,c=2 → ranks a=1st,b=2nd,c=3rd → set scores: a=0,b=1,c=2
    // Set 2: round scores a=2,b=0,c=1 → ranks b=1st,c=2nd,a=3rd → set scores: a=2,b=0,c=1
    // Totals: a=0+2=2, b=1+0=1, c=2+1=3
    expect(a.total).toBe(2);
    expect(b.total).toBe(1);
    expect(c.total).toBe(3);
    expect(b.rank).toBe(1);
    expect(a.rank).toBe(2);
    expect(c.rank).toBe(3);
  });

  it("returns null scores for empty sets", () => {
    const sets: GameSet[] = [
      { id: "set1", targetRounds: 2, rounds: [], createdAt: 1 },
    ];

    const board = buildSetScoreboard(playerIds, sets);
    expect(board.every((e) => e.scores[0] === null)).toBe(true);
    expect(board.every((e) => e.total === 0)).toBe(true);
  });

  it("returns empty scores for no sets", () => {
    const board = buildSetScoreboard(playerIds, []);
    expect(board.every((e) => e.total === 0)).toBe(true);
    expect(board.every((e) => e.scores.length === 0)).toBe(true);
  });
});
