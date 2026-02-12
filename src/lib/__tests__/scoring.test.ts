import { describe, it, expect } from "vitest";
import { calculateScore, buildScoreboard } from "../scoring";
import type { Round } from "@/types";

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
