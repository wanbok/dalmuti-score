import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SessionStatsTab } from "../stats/SessionStatsTab";
import type { Session, Player } from "@/types";

// Mock ScoreTrendChart since it uses Recharts (heavy dependency)
vi.mock("../stats/ScoreTrendChart", () => ({
  ScoreTrendChart: ({ session, players }: { session: Session; players: Player[] }) => (
    <div data-testid="score-trend-chart">
      Chart: {players.length} players, {session.rounds.length} rounds
    </div>
  ),
}));

const players: Player[] = [
  { id: "p1", name: "Alice", createdAt: 1 },
  { id: "p2", name: "Bob", createdAt: 2 },
  { id: "p3", name: "Charlie", createdAt: 3 },
];

function makeSession(rounds: Session["rounds"]): Session {
  return {
    id: "s1",
    name: "Test Session",
    playerIds: ["p1", "p2", "p3"],
    rounds,
    createdAt: 1,
  };
}

function makeRound(
  id: string,
  results: { playerId: string; rank: number }[],
  revolution = false
): Session["rounds"][0] {
  return {
    id,
    participantIds: results.map((r) => r.playerId),
    results,
    revolution,
    createdAt: Date.now(),
  };
}

describe("SessionStatsTab", () => {
  it("shows empty state when no rounds", () => {
    const session = makeSession([]);
    render(<SessionStatsTab session={session} players={players} />);
    expect(screen.getByText("아직 라운드가 없습니다")).toBeDefined();
  });

  it("shows summary stats with rounds", () => {
    const session = makeSession([
      makeRound("r1", [
        { playerId: "p1", rank: 1 },
        { playerId: "p2", rank: 2 },
        { playerId: "p3", rank: 3 },
      ]),
      makeRound("r2", [
        { playerId: "p1", rank: 2 },
        { playerId: "p2", rank: 1 },
        { playerId: "p3", rank: 3 },
      ]),
    ]);
    render(<SessionStatsTab session={session} players={players} />);

    // Total rounds stat card
    expect(screen.getByText("총 라운드")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
  });

  it("shows most 1st place finisher", () => {
    const session = makeSession([
      makeRound("r1", [
        { playerId: "p1", rank: 1 },
        { playerId: "p2", rank: 2 },
        { playerId: "p3", rank: 3 },
      ]),
      makeRound("r2", [
        { playerId: "p1", rank: 1 },
        { playerId: "p2", rank: 2 },
        { playerId: "p3", rank: 3 },
      ]),
      makeRound("r3", [
        { playerId: "p1", rank: 2 },
        { playerId: "p2", rank: 1 },
        { playerId: "p3", rank: 3 },
      ]),
    ]);
    render(<SessionStatsTab session={session} players={players} />);

    expect(screen.getByText("최다 1위")).toBeDefined();
    expect(screen.getByText("Alice (2회)")).toBeDefined();
  });

  it("shows winner (lowest total) and loser (highest total)", () => {
    const session = makeSession([
      makeRound("r1", [
        { playerId: "p1", rank: 1 },
        { playerId: "p2", rank: 2 },
        { playerId: "p3", rank: 3 },
      ]),
      makeRound("r2", [
        { playerId: "p1", rank: 1 },
        { playerId: "p2", rank: 2 },
        { playerId: "p3", rank: 3 },
      ]),
    ]);
    // Scores: p1=0+0=0, p2=1+1=2, p3=2+2=4
    render(<SessionStatsTab session={session} players={players} />);

    expect(screen.getByText("최저 총점 (승자)")).toBeDefined();
    expect(screen.getByText("Alice (0점)")).toBeDefined();
    expect(screen.getByText("최고 총점 (패자)")).toBeDefined();
    expect(screen.getByText("Charlie (4점)")).toBeDefined();
  });

  it("renders chart when 2+ rounds exist", () => {
    const session = makeSession([
      makeRound("r1", [
        { playerId: "p1", rank: 1 },
        { playerId: "p2", rank: 2 },
        { playerId: "p3", rank: 3 },
      ]),
      makeRound("r2", [
        { playerId: "p1", rank: 2 },
        { playerId: "p2", rank: 1 },
        { playerId: "p3", rank: 3 },
      ]),
    ]);
    render(<SessionStatsTab session={session} players={players} />);

    expect(screen.getByTestId("score-trend-chart")).toBeDefined();
  });

  it("shows hint instead of chart when only 1 round", () => {
    const session = makeSession([
      makeRound("r1", [
        { playerId: "p1", rank: 1 },
        { playerId: "p2", rank: 2 },
        { playerId: "p3", rank: 3 },
      ]),
    ]);
    render(<SessionStatsTab session={session} players={players} />);

    expect(screen.queryByTestId("score-trend-chart")).toBeNull();
    expect(
      screen.getByText("2라운드 이상 진행하면 추이 차트가 표시됩니다")
    ).toBeDefined();
  });

  it("shows revolution count when revolutions occurred", () => {
    const session = makeSession([
      makeRound(
        "r1",
        [
          { playerId: "p1", rank: 1 },
          { playerId: "p2", rank: 2 },
          { playerId: "p3", rank: 3 },
        ],
        true
      ),
      makeRound("r2", [
        { playerId: "p1", rank: 2 },
        { playerId: "p2", rank: 1 },
        { playerId: "p3", rank: 3 },
      ]),
    ]);
    render(<SessionStatsTab session={session} players={players} />);

    expect(screen.getByText("혁명 횟수")).toBeDefined();
    expect(screen.getByText("1회")).toBeDefined();
  });
});
