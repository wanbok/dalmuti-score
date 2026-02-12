import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "../index";
import { buildScoreboard } from "@/lib/scoring";

// Reset store before each test
beforeEach(() => {
  useStore.setState({ players: [], sessions: [] });
});

describe("Player CRUD", () => {
  it("addPlayer creates a player with id and name", () => {
    const player = useStore.getState().addPlayer("철수");
    expect(player.name).toBe("철수");
    expect(player.id).toBeTruthy();
    expect(useStore.getState().players).toHaveLength(1);
  });

  it("addPlayer generates unique ids", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const p2 = useStore.getState().addPlayer("영희");
    expect(p1.id).not.toBe(p2.id);
  });

  it("removePlayer deletes the player", () => {
    const player = useStore.getState().addPlayer("철수");
    useStore.getState().removePlayer(player.id);
    expect(useStore.getState().players).toHaveLength(0);
  });

  it("removePlayer with unknown id does nothing", () => {
    useStore.getState().addPlayer("철수");
    useStore.getState().removePlayer("unknown");
    expect(useStore.getState().players).toHaveLength(1);
  });

  it("renamePlayer updates the name", () => {
    const player = useStore.getState().addPlayer("철수");
    useStore.getState().renamePlayer(player.id, "민수");
    expect(useStore.getState().players[0].name).toBe("민수");
  });

  it("getPlayer returns the player by id", () => {
    const player = useStore.getState().addPlayer("철수");
    expect(useStore.getState().getPlayer(player.id)).toEqual(player);
  });

  it("getPlayer returns undefined for unknown id", () => {
    expect(useStore.getState().getPlayer("unknown")).toBeUndefined();
  });
});

describe("Session CRUD", () => {
  it("createSession creates a session with name and players", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const p2 = useStore.getState().addPlayer("영희");
    const session = useStore.getState().createSession("테스트", [p1.id, p2.id]);

    expect(session.name).toBe("테스트");
    expect(session.playerIds).toEqual([p1.id, p2.id]);
    expect(session.rounds).toEqual([]);
    expect(useStore.getState().sessions).toHaveLength(1);
  });

  it("deleteSession removes the session", () => {
    const session = useStore.getState().createSession("테스트", []);
    useStore.getState().deleteSession(session.id);
    expect(useStore.getState().sessions).toHaveLength(0);
  });

  it("renameSession updates the name", () => {
    const session = useStore.getState().createSession("이전", []);
    useStore.getState().renameSession(session.id, "이후");
    expect(useStore.getState().sessions[0].name).toBe("이후");
  });

  it("addPlayerToSession adds a new player and links to session", () => {
    const session = useStore.getState().createSession("테스트", []);
    useStore.getState().addPlayerToSession(session.id, "새선수");

    const state = useStore.getState();
    expect(state.players).toHaveLength(1);
    expect(state.players[0].name).toBe("새선수");

    const updated = state.getSession(session.id)!;
    expect(updated.playerIds).toHaveLength(1);
    expect(updated.playerIds[0]).toBe(state.players[0].id);
  });

  it("removePlayerFromSession removes player from session", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const session = useStore.getState().createSession("테스트", [p1.id]);
    useStore.getState().removePlayerFromSession(session.id, p1.id);

    const updated = useStore.getState().getSession(session.id)!;
    expect(updated.playerIds).toHaveLength(0);
    // player still exists in global list
    expect(useStore.getState().players).toHaveLength(1);
  });

  it("getSession returns undefined for unknown id", () => {
    expect(useStore.getState().getSession("unknown")).toBeUndefined();
  });
});

describe("Round CRUD", () => {
  it("addRound adds a round to the session", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const p2 = useStore.getState().addPlayer("영희");
    const session = useStore.getState().createSession("테스트", [p1.id, p2.id]);

    useStore.getState().addRound(
      session.id,
      [p1.id, p2.id],
      [
        { playerId: p1.id, rank: 1 },
        { playerId: p2.id, rank: 2 },
      ]
    );

    const updated = useStore.getState().getSession(session.id)!;
    expect(updated.rounds).toHaveLength(1);
    expect(updated.rounds[0].results).toHaveLength(2);
    expect(updated.rounds[0].results[0].rank).toBe(1);
  });

  it("updateRound modifies an existing round", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const p2 = useStore.getState().addPlayer("영희");
    const session = useStore.getState().createSession("테스트", [p1.id, p2.id]);

    useStore.getState().addRound(
      session.id,
      [p1.id, p2.id],
      [
        { playerId: p1.id, rank: 1 },
        { playerId: p2.id, rank: 2 },
      ]
    );

    const roundId = useStore.getState().getSession(session.id)!.rounds[0].id;

    // Swap ranks
    useStore.getState().updateRound(
      session.id,
      roundId,
      [p1.id, p2.id],
      [
        { playerId: p1.id, rank: 2 },
        { playerId: p2.id, rank: 1 },
      ]
    );

    const round = useStore.getState().getRound(session.id, roundId)!;
    expect(round.results.find((r) => r.playerId === p1.id)!.rank).toBe(2);
    expect(round.results.find((r) => r.playerId === p2.id)!.rank).toBe(1);
  });

  it("deleteRound removes the round from session", () => {
    const session = useStore.getState().createSession("테스트", []);
    useStore.getState().addRound(session.id, [], []);

    const roundId = useStore.getState().getSession(session.id)!.rounds[0].id;
    useStore.getState().deleteRound(session.id, roundId);

    expect(useStore.getState().getSession(session.id)!.rounds).toHaveLength(0);
  });

  it("getRound returns undefined for unknown round", () => {
    const session = useStore.getState().createSession("테스트", []);
    expect(useStore.getState().getRound(session.id, "unknown")).toBeUndefined();
  });

  it("getRound returns undefined for unknown session", () => {
    expect(useStore.getState().getRound("unknown", "unknown")).toBeUndefined();
  });
});

describe("Theme state", () => {
  it("defaults to system theme", () => {
    expect(useStore.getState().theme).toBe("system");
  });

  it("setTheme updates theme", () => {
    useStore.getState().setTheme("dark");
    expect(useStore.getState().theme).toBe("dark");

    useStore.getState().setTheme("light");
    expect(useStore.getState().theme).toBe("light");

    useStore.getState().setTheme("system");
    expect(useStore.getState().theme).toBe("system");
  });
});

describe("Revolution on rounds", () => {
  it("addRound stores revolution flag", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const session = useStore.getState().createSession("테스트", [p1.id]);

    useStore.getState().addRound(
      session.id,
      [p1.id],
      [{ playerId: p1.id, rank: 1 }],
      true
    );

    const round = useStore.getState().getSession(session.id)!.rounds[0];
    expect(round.revolution).toBe(true);
  });

  it("addRound defaults revolution to false", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const session = useStore.getState().createSession("테스트", [p1.id]);

    useStore.getState().addRound(
      session.id,
      [p1.id],
      [{ playerId: p1.id, rank: 1 }]
    );

    const round = useStore.getState().getSession(session.id)!.rounds[0];
    expect(round.revolution).toBe(false);
  });

  it("updateRound stores revolution flag", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const session = useStore.getState().createSession("테스트", [p1.id]);

    useStore.getState().addRound(
      session.id,
      [p1.id],
      [{ playerId: p1.id, rank: 1 }]
    );

    const roundId = useStore.getState().getSession(session.id)!.rounds[0].id;

    useStore.getState().updateRound(
      session.id,
      roundId,
      [p1.id],
      [{ playerId: p1.id, rank: 1 }],
      true
    );

    const round = useStore.getState().getRound(session.id, roundId)!;
    expect(round.revolution).toBe(true);
  });

  it("updateRound defaults revolution to false", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const session = useStore.getState().createSession("테스트", [p1.id]);

    useStore.getState().addRound(
      session.id,
      [p1.id],
      [{ playerId: p1.id, rank: 1 }],
      true
    );

    const roundId = useStore.getState().getSession(session.id)!.rounds[0].id;

    useStore.getState().updateRound(
      session.id,
      roundId,
      [p1.id],
      [{ playerId: p1.id, rank: 1 }]
    );

    const round = useStore.getState().getRound(session.id, roundId)!;
    expect(round.revolution).toBe(false);
  });
});

describe("Revolution chain and recalculation", () => {
  it("stores multiple revolution rounds in same session", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const p2 = useStore.getState().addPlayer("영희");
    const session = useStore.getState().createSession("테스트", [p1.id, p2.id]);

    useStore.getState().addRound(
      session.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 1 }, { playerId: p2.id, rank: 2 }],
      true
    );
    useStore.getState().addRound(
      session.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 2 }, { playerId: p2.id, rank: 1 }]
    );
    useStore.getState().addRound(
      session.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 1 }, { playerId: p2.id, rank: 2 }],
      true
    );

    const rounds = useStore.getState().getSession(session.id)!.rounds;
    expect(rounds).toHaveLength(3);
    expect(rounds[0].revolution).toBe(true);
    expect(rounds[1].revolution).toBe(false);
    expect(rounds[2].revolution).toBe(true);
  });

  it("toggles revolution flag via updateRound", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const session = useStore.getState().createSession("테스트", [p1.id]);

    useStore.getState().addRound(
      session.id,
      [p1.id],
      [{ playerId: p1.id, rank: 1 }]
    );

    const roundId = useStore.getState().getSession(session.id)!.rounds[0].id;
    expect(useStore.getState().getRound(session.id, roundId)!.revolution).toBe(false);

    // Toggle to true
    useStore.getState().updateRound(session.id, roundId, [p1.id], [{ playerId: p1.id, rank: 1 }], true);
    expect(useStore.getState().getRound(session.id, roundId)!.revolution).toBe(true);

    // Toggle back to false
    useStore.getState().updateRound(session.id, roundId, [p1.id], [{ playerId: p1.id, rank: 1 }], false);
    expect(useStore.getState().getRound(session.id, roundId)!.revolution).toBe(false);
  });

  it("deleting revolution round does not affect other rounds", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const p2 = useStore.getState().addPlayer("영희");
    const session = useStore.getState().createSession("테스트", [p1.id, p2.id]);

    useStore.getState().addRound(
      session.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 1 }, { playerId: p2.id, rank: 2 }],
      true
    );
    useStore.getState().addRound(
      session.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 2 }, { playerId: p2.id, rank: 1 }]
    );

    const revolutionRoundId = useStore.getState().getSession(session.id)!.rounds[0].id;
    useStore.getState().deleteRound(session.id, revolutionRoundId);

    const remaining = useStore.getState().getSession(session.id)!.rounds;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].revolution).toBe(false);
    expect(remaining[0].results[0].rank).toBe(2);
  });

  it("updating non-revolution round preserves other round's revolution flag", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const p2 = useStore.getState().addPlayer("영희");
    const session = useStore.getState().createSession("테스트", [p1.id, p2.id]);

    useStore.getState().addRound(
      session.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 1 }, { playerId: p2.id, rank: 2 }],
      true
    );
    useStore.getState().addRound(
      session.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 2 }, { playerId: p2.id, rank: 1 }]
    );

    const rounds = useStore.getState().getSession(session.id)!.rounds;
    const normalRoundId = rounds[1].id;

    // Update the non-revolution round's results
    useStore.getState().updateRound(
      session.id,
      normalRoundId,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 1 }, { playerId: p2.id, rank: 2 }]
    );

    const updated = useStore.getState().getSession(session.id)!.rounds;
    expect(updated[0].revolution).toBe(true); // revolution round unchanged
    expect(updated[1].revolution).toBe(false);
    expect(updated[1].results[0].rank).toBe(1); // results updated
  });

  it("scoreboard recalculates correctly after round deletion", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const p2 = useStore.getState().addPlayer("영희");
    const session = useStore.getState().createSession("테스트", [p1.id, p2.id]);

    // Round 1: 철수 1st (score 0), 영희 2nd (score 1)
    useStore.getState().addRound(
      session.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 1 }, { playerId: p2.id, rank: 2 }]
    );
    // Round 2: 영희 1st (score 0), 철수 2nd (score 1)
    useStore.getState().addRound(
      session.id,
      [p1.id, p2.id],
      [{ playerId: p2.id, rank: 1 }, { playerId: p1.id, rank: 2 }]
    );
    // Round 3: 철수 1st (score 0), 영희 2nd (score 1)
    useStore.getState().addRound(
      session.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 1 }, { playerId: p2.id, rank: 2 }]
    );

    // Before deletion: 철수=0+1+0=1, 영희=1+0+1=2
    let updated = useStore.getState().getSession(session.id)!;
    let board = buildScoreboard(updated.playerIds, updated.rounds);
    expect(board.find((e) => e.playerId === p1.id)!.total).toBe(1);
    expect(board.find((e) => e.playerId === p2.id)!.total).toBe(2);

    // Delete round 2 (where 영희 won)
    const round2Id = updated.rounds[1].id;
    useStore.getState().deleteRound(session.id, round2Id);

    // After deletion: 철수=0+0=0, 영희=1+1=2
    updated = useStore.getState().getSession(session.id)!;
    expect(updated.rounds).toHaveLength(2);
    board = buildScoreboard(updated.playerIds, updated.rounds);
    expect(board.find((e) => e.playerId === p1.id)!.total).toBe(0);
    expect(board.find((e) => e.playerId === p2.id)!.total).toBe(2);
  });

  it("scoreboard recalculates correctly after round update", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const p2 = useStore.getState().addPlayer("영희");
    const session = useStore.getState().createSession("테스트", [p1.id, p2.id]);

    useStore.getState().addRound(
      session.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 1 }, { playerId: p2.id, rank: 2 }]
    );
    useStore.getState().addRound(
      session.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 1 }, { playerId: p2.id, rank: 2 }]
    );

    // Before: 철수=0+0=0, 영희=1+1=2
    let updated = useStore.getState().getSession(session.id)!;
    let board = buildScoreboard(updated.playerIds, updated.rounds);
    expect(board.find((e) => e.playerId === p1.id)!.total).toBe(0);
    expect(board.find((e) => e.playerId === p2.id)!.total).toBe(2);

    // Swap ranks in round 2
    const round2Id = updated.rounds[1].id;
    useStore.getState().updateRound(
      session.id,
      round2Id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 2 }, { playerId: p2.id, rank: 1 }]
    );

    // After: 철수=0+1=1, 영희=1+0=1 → tied
    updated = useStore.getState().getSession(session.id)!;
    board = buildScoreboard(updated.playerIds, updated.rounds);
    expect(board.find((e) => e.playerId === p1.id)!.total).toBe(1);
    expect(board.find((e) => e.playerId === p2.id)!.total).toBe(1);
    expect(board.find((e) => e.playerId === p1.id)!.rank).toBe(1);
    expect(board.find((e) => e.playerId === p2.id)!.rank).toBe(1);
  });
});

describe("Backward compatibility — existing data without revolution", () => {
  it("handles rounds with undefined revolution field in store operations", () => {
    // Simulate old data loaded from localStorage (no revolution field)
    useStore.setState({
      players: [{ id: "p1", name: "철수", createdAt: 1000 }],
      sessions: [{
        id: "s1",
        name: "옛날 세션",
        playerIds: ["p1"],
        rounds: [{
          id: "r1",
          participantIds: ["p1"],
          results: [{ playerId: "p1", rank: 1 }],
          createdAt: 1000,
          // revolution: undefined — old data
        }],
        createdAt: 1000,
      }],
    });

    // Store operations should still work
    const session = useStore.getState().getSession("s1")!;
    expect(session.rounds).toHaveLength(1);
    expect(session.rounds[0].revolution).toBeUndefined();

    const round = useStore.getState().getRound("s1", "r1")!;
    expect(round.results[0].rank).toBe(1);
  });

  it("updating old round without revolution defaults to false", () => {
    useStore.setState({
      players: [
        { id: "p1", name: "철수", createdAt: 1000 },
        { id: "p2", name: "영희", createdAt: 1000 },
      ],
      sessions: [{
        id: "s1",
        name: "옛날 세션",
        playerIds: ["p1", "p2"],
        rounds: [{
          id: "r1",
          participantIds: ["p1", "p2"],
          results: [
            { playerId: "p1", rank: 1 },
            { playerId: "p2", rank: 2 },
          ],
          createdAt: 1000,
        }],
        createdAt: 1000,
      }],
    });

    // Update round without specifying revolution
    useStore.getState().updateRound(
      "s1",
      "r1",
      ["p1", "p2"],
      [{ playerId: "p1", rank: 2 }, { playerId: "p2", rank: 1 }]
    );

    const round = useStore.getState().getRound("s1", "r1")!;
    expect(round.revolution).toBe(false);
    expect(round.results[0].rank).toBe(2);
  });

  it("scoreboard works with mixed revolution/undefined rounds", () => {
    useStore.setState({
      players: [
        { id: "p1", name: "철수", createdAt: 1000 },
        { id: "p2", name: "영희", createdAt: 1000 },
      ],
      sessions: [{
        id: "s1",
        name: "혼합 세션",
        playerIds: ["p1", "p2"],
        rounds: [
          {
            id: "r1",
            participantIds: ["p1", "p2"],
            results: [{ playerId: "p1", rank: 1 }, { playerId: "p2", rank: 2 }],
            createdAt: 1000,
            // revolution: undefined — old data
          },
          {
            id: "r2",
            participantIds: ["p1", "p2"],
            results: [{ playerId: "p1", rank: 2 }, { playerId: "p2", rank: 1 }],
            revolution: true, // new data
            createdAt: 2000,
          },
          {
            id: "r3",
            participantIds: ["p1", "p2"],
            results: [{ playerId: "p1", rank: 1 }, { playerId: "p2", rank: 2 }],
            revolution: false, // explicit false
            createdAt: 3000,
          },
        ],
        createdAt: 1000,
      }],
    });

    const session = useStore.getState().getSession("s1")!;
    const board = buildScoreboard(session.playerIds, session.rounds);

    // 철수: 0+1+0=1, 영희: 1+0+1=2
    expect(board.find((e) => e.playerId === "p1")!.total).toBe(1);
    expect(board.find((e) => e.playerId === "p2")!.total).toBe(2);

    // Revolution flags are stored correctly
    expect(session.rounds[0].revolution).toBeUndefined();
    expect(session.rounds[1].revolution).toBe(true);
    expect(session.rounds[2].revolution).toBe(false);
  });

  it("adds new round to session with old rounds", () => {
    useStore.setState({
      players: [
        { id: "p1", name: "철수", createdAt: 1000 },
        { id: "p2", name: "영희", createdAt: 1000 },
      ],
      sessions: [{
        id: "s1",
        name: "옛날 세션",
        playerIds: ["p1", "p2"],
        rounds: [{
          id: "r1",
          participantIds: ["p1", "p2"],
          results: [{ playerId: "p1", rank: 1 }, { playerId: "p2", rank: 2 }],
          createdAt: 1000,
          // no revolution field
        }],
        createdAt: 1000,
      }],
    });

    // Add a new round with revolution
    useStore.getState().addRound(
      "s1",
      ["p1", "p2"],
      [{ playerId: "p1", rank: 2 }, { playerId: "p2", rank: 1 }],
      true
    );

    const session = useStore.getState().getSession("s1")!;
    expect(session.rounds).toHaveLength(2);
    expect(session.rounds[0].revolution).toBeUndefined(); // old round unchanged
    expect(session.rounds[1].revolution).toBe(true); // new round has revolution

    // Scoreboard works with mixed data
    const board = buildScoreboard(session.playerIds, session.rounds);
    expect(board.find((e) => e.playerId === "p1")!.total).toBe(1); // 0+1
    expect(board.find((e) => e.playerId === "p2")!.total).toBe(1); // 1+0
  });
});

describe("Integration: full game scenario", () => {
  it("simulates a 3-player, 3-round game with varying participation", () => {
    const state = useStore.getState();
    const p1 = state.addPlayer("철수");
    const p2 = state.addPlayer("영희");
    const p3 = state.addPlayer("민수");
    const session = useStore.getState().createSession("금요게임", [p1.id, p2.id, p3.id]);

    // Round 1: all 3 play — 철수 1st, 영희 2nd, 민수 3rd
    useStore.getState().addRound(
      session.id,
      [p1.id, p2.id, p3.id],
      [
        { playerId: p1.id, rank: 1 },
        { playerId: p2.id, rank: 2 },
        { playerId: p3.id, rank: 3 },
      ]
    );

    // Round 2: only 철수 and 민수 play — 민수 1st, 철수 2nd
    useStore.getState().addRound(
      session.id,
      [p1.id, p3.id],
      [
        { playerId: p3.id, rank: 1 },
        { playerId: p1.id, rank: 2 },
      ]
    );

    // Round 3: all play — 영희 1st, 민수 2nd, 철수 3rd
    useStore.getState().addRound(
      session.id,
      [p1.id, p2.id, p3.id],
      [
        { playerId: p2.id, rank: 1 },
        { playerId: p3.id, rank: 2 },
        { playerId: p1.id, rank: 3 },
      ]
    );

    const updated = useStore.getState().getSession(session.id)!;
    expect(updated.rounds).toHaveLength(3);

    // Verify score calculation via scoring lib
    const board = buildScoreboard(updated.playerIds, updated.rounds);

    const 철수 = board.find((e) => e.playerId === p1.id)!;
    const 영희 = board.find((e) => e.playerId === p2.id)!;
    const 민수 = board.find((e) => e.playerId === p3.id)!;

    // 철수: R1=0, R2=1, R3=2 → total=3
    expect(철수.scores).toEqual([0, 1, 2]);
    expect(철수.total).toBe(3);

    // 영희: R1=1, R2=null(0), R3=0 → total=1
    expect(영희.scores).toEqual([1, null, 0]);
    expect(영희.total).toBe(1);

    // 민수: R1=2, R2=0, R3=1 → total=3
    expect(민수.scores).toEqual([2, 0, 1]);
    expect(민수.total).toBe(3);

    // 영희 1st, 철수&민수 tied 2nd
    expect(영희.rank).toBe(1);
    expect(철수.rank).toBe(2);
    expect(민수.rank).toBe(2);
  });
});
