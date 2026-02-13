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
    expect(session.sets).toEqual([]);
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

describe("Set CRUD", () => {
  it("createSet creates a set in the session", () => {
    const session = useStore.getState().createSession("테스트", []);
    const gameSet = useStore.getState().createSet(session.id, 4);

    expect(gameSet).toBeDefined();
    expect(gameSet!.targetRounds).toBe(4);
    expect(gameSet!.rounds).toEqual([]);

    const updated = useStore.getState().getSession(session.id)!;
    expect(updated.sets).toHaveLength(1);
  });

  it("deleteSet removes the set from session", () => {
    const session = useStore.getState().createSession("테스트", []);
    const gameSet = useStore.getState().createSet(session.id, 4)!;
    useStore.getState().deleteSet(session.id, gameSet.id);

    const updated = useStore.getState().getSession(session.id)!;
    expect(updated.sets).toHaveLength(0);
  });

  it("getSet returns the set", () => {
    const session = useStore.getState().createSession("테스트", []);
    const gameSet = useStore.getState().createSet(session.id, 4)!;

    const found = useStore.getState().getSet(session.id, gameSet.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(gameSet.id);
  });

  it("getSet returns undefined for unknown set", () => {
    const session = useStore.getState().createSession("테스트", []);
    expect(useStore.getState().getSet(session.id, "unknown")).toBeUndefined();
  });
});

describe("Round CRUD", () => {
  it("addRound adds a round to the set", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const p2 = useStore.getState().addPlayer("영희");
    const session = useStore.getState().createSession("테스트", [p1.id, p2.id]);
    const gameSet = useStore.getState().createSet(session.id, 4)!;

    useStore.getState().addRound(
      session.id,
      gameSet.id,
      [p1.id, p2.id],
      [
        { playerId: p1.id, rank: 1 },
        { playerId: p2.id, rank: 2 },
      ]
    );

    const updated = useStore.getState().getSet(session.id, gameSet.id)!;
    expect(updated.rounds).toHaveLength(1);
    expect(updated.rounds[0].results).toHaveLength(2);
    expect(updated.rounds[0].results[0].rank).toBe(1);
  });

  it("updateRound modifies an existing round", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const p2 = useStore.getState().addPlayer("영희");
    const session = useStore.getState().createSession("테스트", [p1.id, p2.id]);
    const gameSet = useStore.getState().createSet(session.id, 4)!;

    useStore.getState().addRound(
      session.id,
      gameSet.id,
      [p1.id, p2.id],
      [
        { playerId: p1.id, rank: 1 },
        { playerId: p2.id, rank: 2 },
      ]
    );

    const roundId = useStore.getState().getSet(session.id, gameSet.id)!.rounds[0].id;

    // Swap ranks
    useStore.getState().updateRound(
      session.id,
      gameSet.id,
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

  it("deleteRound removes the round from set", () => {
    const session = useStore.getState().createSession("테스트", []);
    const gameSet = useStore.getState().createSet(session.id, 4)!;
    useStore.getState().addRound(session.id, gameSet.id, [], []);

    const roundId = useStore.getState().getSet(session.id, gameSet.id)!.rounds[0].id;
    useStore.getState().deleteRound(session.id, gameSet.id, roundId);

    expect(useStore.getState().getSet(session.id, gameSet.id)!.rounds).toHaveLength(0);
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
    const gameSet = useStore.getState().createSet(session.id, 4)!;

    useStore.getState().addRound(
      session.id,
      gameSet.id,
      [p1.id],
      [{ playerId: p1.id, rank: 1 }],
      true
    );

    const round = useStore.getState().getSet(session.id, gameSet.id)!.rounds[0];
    expect(round.revolution).toBe(true);
  });

  it("addRound defaults revolution to false", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const session = useStore.getState().createSession("테스트", [p1.id]);
    const gameSet = useStore.getState().createSet(session.id, 4)!;

    useStore.getState().addRound(
      session.id,
      gameSet.id,
      [p1.id],
      [{ playerId: p1.id, rank: 1 }]
    );

    const round = useStore.getState().getSet(session.id, gameSet.id)!.rounds[0];
    expect(round.revolution).toBe(false);
  });

  it("updateRound stores revolution flag", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const session = useStore.getState().createSession("테스트", [p1.id]);
    const gameSet = useStore.getState().createSet(session.id, 4)!;

    useStore.getState().addRound(
      session.id,
      gameSet.id,
      [p1.id],
      [{ playerId: p1.id, rank: 1 }]
    );

    const roundId = useStore.getState().getSet(session.id, gameSet.id)!.rounds[0].id;

    useStore.getState().updateRound(
      session.id,
      gameSet.id,
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
    const gameSet = useStore.getState().createSet(session.id, 4)!;

    useStore.getState().addRound(
      session.id,
      gameSet.id,
      [p1.id],
      [{ playerId: p1.id, rank: 1 }],
      true
    );

    const roundId = useStore.getState().getSet(session.id, gameSet.id)!.rounds[0].id;

    useStore.getState().updateRound(
      session.id,
      gameSet.id,
      roundId,
      [p1.id],
      [{ playerId: p1.id, rank: 1 }]
    );

    const round = useStore.getState().getRound(session.id, roundId)!;
    expect(round.revolution).toBe(false);
  });
});

describe("Revolution chain and recalculation", () => {
  it("stores multiple revolution rounds in same set", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const p2 = useStore.getState().addPlayer("영희");
    const session = useStore.getState().createSession("테스트", [p1.id, p2.id]);
    const gameSet = useStore.getState().createSet(session.id, 4)!;

    useStore.getState().addRound(
      session.id, gameSet.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 1 }, { playerId: p2.id, rank: 2 }],
      true
    );
    useStore.getState().addRound(
      session.id, gameSet.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 2 }, { playerId: p2.id, rank: 1 }]
    );
    useStore.getState().addRound(
      session.id, gameSet.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 1 }, { playerId: p2.id, rank: 2 }],
      true
    );

    const rounds = useStore.getState().getSet(session.id, gameSet.id)!.rounds;
    expect(rounds).toHaveLength(3);
    expect(rounds[0].revolution).toBe(true);
    expect(rounds[1].revolution).toBe(false);
    expect(rounds[2].revolution).toBe(true);
  });

  it("toggles revolution flag via updateRound", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const session = useStore.getState().createSession("테스트", [p1.id]);
    const gameSet = useStore.getState().createSet(session.id, 4)!;

    useStore.getState().addRound(
      session.id, gameSet.id,
      [p1.id],
      [{ playerId: p1.id, rank: 1 }]
    );

    const roundId = useStore.getState().getSet(session.id, gameSet.id)!.rounds[0].id;
    expect(useStore.getState().getRound(session.id, roundId)!.revolution).toBe(false);

    // Toggle to true
    useStore.getState().updateRound(session.id, gameSet.id, roundId, [p1.id], [{ playerId: p1.id, rank: 1 }], true);
    expect(useStore.getState().getRound(session.id, roundId)!.revolution).toBe(true);

    // Toggle back to false
    useStore.getState().updateRound(session.id, gameSet.id, roundId, [p1.id], [{ playerId: p1.id, rank: 1 }], false);
    expect(useStore.getState().getRound(session.id, roundId)!.revolution).toBe(false);
  });

  it("deleting revolution round does not affect other rounds", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const p2 = useStore.getState().addPlayer("영희");
    const session = useStore.getState().createSession("테스트", [p1.id, p2.id]);
    const gameSet = useStore.getState().createSet(session.id, 4)!;

    useStore.getState().addRound(
      session.id, gameSet.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 1 }, { playerId: p2.id, rank: 2 }],
      true
    );
    useStore.getState().addRound(
      session.id, gameSet.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 2 }, { playerId: p2.id, rank: 1 }]
    );

    const revolutionRoundId = useStore.getState().getSet(session.id, gameSet.id)!.rounds[0].id;
    useStore.getState().deleteRound(session.id, gameSet.id, revolutionRoundId);

    const remaining = useStore.getState().getSet(session.id, gameSet.id)!.rounds;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].revolution).toBe(false);
    expect(remaining[0].results[0].rank).toBe(2);
  });

  it("updating non-revolution round preserves other round's revolution flag", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const p2 = useStore.getState().addPlayer("영희");
    const session = useStore.getState().createSession("테스트", [p1.id, p2.id]);
    const gameSet = useStore.getState().createSet(session.id, 4)!;

    useStore.getState().addRound(
      session.id, gameSet.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 1 }, { playerId: p2.id, rank: 2 }],
      true
    );
    useStore.getState().addRound(
      session.id, gameSet.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 2 }, { playerId: p2.id, rank: 1 }]
    );

    const rounds = useStore.getState().getSet(session.id, gameSet.id)!.rounds;
    const normalRoundId = rounds[1].id;

    // Update the non-revolution round's results
    useStore.getState().updateRound(
      session.id, gameSet.id,
      normalRoundId,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 1 }, { playerId: p2.id, rank: 2 }]
    );

    const updated = useStore.getState().getSet(session.id, gameSet.id)!.rounds;
    expect(updated[0].revolution).toBe(true); // revolution round unchanged
    expect(updated[1].revolution).toBe(false);
    expect(updated[1].results[0].rank).toBe(1); // results updated
  });

  it("scoreboard recalculates correctly after round deletion", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const p2 = useStore.getState().addPlayer("영희");
    const session = useStore.getState().createSession("테스트", [p1.id, p2.id]);
    const gameSet = useStore.getState().createSet(session.id, 4)!;

    // Round 1: 철수 1st (score 0), 영희 2nd (score 1)
    useStore.getState().addRound(
      session.id, gameSet.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 1 }, { playerId: p2.id, rank: 2 }]
    );
    // Round 2: 영희 1st (score 0), 철수 2nd (score 1)
    useStore.getState().addRound(
      session.id, gameSet.id,
      [p1.id, p2.id],
      [{ playerId: p2.id, rank: 1 }, { playerId: p1.id, rank: 2 }]
    );
    // Round 3: 철수 1st (score 0), 영희 2nd (score 1)
    useStore.getState().addRound(
      session.id, gameSet.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 1 }, { playerId: p2.id, rank: 2 }]
    );

    // Before deletion: 철수=0+1+0=1, 영희=1+0+1=2
    let updatedSet = useStore.getState().getSet(session.id, gameSet.id)!;
    let updatedSession = useStore.getState().getSession(session.id)!;
    let board = buildScoreboard(updatedSession.playerIds, updatedSet.rounds);
    expect(board.find((e) => e.playerId === p1.id)!.total).toBe(1);
    expect(board.find((e) => e.playerId === p2.id)!.total).toBe(2);

    // Delete round 2 (where 영희 won)
    const round2Id = updatedSet.rounds[1].id;
    useStore.getState().deleteRound(session.id, gameSet.id, round2Id);

    // After deletion: 철수=0+0=0, 영희=1+1=2
    updatedSet = useStore.getState().getSet(session.id, gameSet.id)!;
    updatedSession = useStore.getState().getSession(session.id)!;
    expect(updatedSet.rounds).toHaveLength(2);
    board = buildScoreboard(updatedSession.playerIds, updatedSet.rounds);
    expect(board.find((e) => e.playerId === p1.id)!.total).toBe(0);
    expect(board.find((e) => e.playerId === p2.id)!.total).toBe(2);
  });

  it("scoreboard recalculates correctly after round update", () => {
    const p1 = useStore.getState().addPlayer("철수");
    const p2 = useStore.getState().addPlayer("영희");
    const session = useStore.getState().createSession("테스트", [p1.id, p2.id]);
    const gameSet = useStore.getState().createSet(session.id, 4)!;

    useStore.getState().addRound(
      session.id, gameSet.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 1 }, { playerId: p2.id, rank: 2 }]
    );
    useStore.getState().addRound(
      session.id, gameSet.id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 1 }, { playerId: p2.id, rank: 2 }]
    );

    // Before: 철수=0+0=0, 영희=1+1=2
    let updatedSet = useStore.getState().getSet(session.id, gameSet.id)!;
    let updatedSession = useStore.getState().getSession(session.id)!;
    let board = buildScoreboard(updatedSession.playerIds, updatedSet.rounds);
    expect(board.find((e) => e.playerId === p1.id)!.total).toBe(0);
    expect(board.find((e) => e.playerId === p2.id)!.total).toBe(2);

    // Swap ranks in round 2
    const round2Id = updatedSet.rounds[1].id;
    useStore.getState().updateRound(
      session.id, gameSet.id,
      round2Id,
      [p1.id, p2.id],
      [{ playerId: p1.id, rank: 2 }, { playerId: p2.id, rank: 1 }]
    );

    // After: 철수=0+1=1, 영희=1+0=1 → tied
    updatedSet = useStore.getState().getSet(session.id, gameSet.id)!;
    updatedSession = useStore.getState().getSession(session.id)!;
    board = buildScoreboard(updatedSession.playerIds, updatedSet.rounds);
    expect(board.find((e) => e.playerId === p1.id)!.total).toBe(1);
    expect(board.find((e) => e.playerId === p2.id)!.total).toBe(1);
    expect(board.find((e) => e.playerId === p1.id)!.rank).toBe(1);
    expect(board.find((e) => e.playerId === p2.id)!.rank).toBe(1);
  });
});

describe("Integration: full game scenario", () => {
  it("simulates a 3-player, 3-round game with varying participation", () => {
    const state = useStore.getState();
    const p1 = state.addPlayer("철수");
    const p2 = state.addPlayer("영희");
    const p3 = state.addPlayer("민수");
    const session = useStore.getState().createSession("금요게임", [p1.id, p2.id, p3.id]);
    const gameSet = useStore.getState().createSet(session.id, 3)!;

    // Round 1: all 3 play — 철수 1st, 영희 2nd, 민수 3rd
    useStore.getState().addRound(
      session.id, gameSet.id,
      [p1.id, p2.id, p3.id],
      [
        { playerId: p1.id, rank: 1 },
        { playerId: p2.id, rank: 2 },
        { playerId: p3.id, rank: 3 },
      ]
    );

    // Round 2: only 철수 and 민수 play — 민수 1st, 철수 2nd
    useStore.getState().addRound(
      session.id, gameSet.id,
      [p1.id, p3.id],
      [
        { playerId: p3.id, rank: 1 },
        { playerId: p1.id, rank: 2 },
      ]
    );

    // Round 3: all play — 영희 1st, 민수 2nd, 철수 3rd
    useStore.getState().addRound(
      session.id, gameSet.id,
      [p1.id, p2.id, p3.id],
      [
        { playerId: p2.id, rank: 1 },
        { playerId: p3.id, rank: 2 },
        { playerId: p1.id, rank: 3 },
      ]
    );

    const updatedSet = useStore.getState().getSet(session.id, gameSet.id)!;
    const updatedSession = useStore.getState().getSession(session.id)!;
    expect(updatedSet.rounds).toHaveLength(3);

    // Verify score calculation via scoring lib
    const board = buildScoreboard(updatedSession.playerIds, updatedSet.rounds);

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
