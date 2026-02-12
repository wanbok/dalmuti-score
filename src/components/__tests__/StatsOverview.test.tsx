import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatsOverview } from "../stats/StatsOverview";
import type { PlayerStatistics } from "@/types";

const mockStats: PlayerStatistics[] = [
  {
    playerId: "p1",
    totalGames: 10,
    totalSessions: 3,
    wins: 5,
    winRate: 0.5,
    averageRank: 1.8,
    bestRank: 1,
    worstRank: 4,
    revolutionCount: 1,
  },
  {
    playerId: "p2",
    totalGames: 10,
    totalSessions: 3,
    wins: 3,
    winRate: 0.3,
    averageRank: 2.5,
    bestRank: 1,
    worstRank: 5,
    revolutionCount: 0,
  },
  {
    playerId: "p3",
    totalGames: 8,
    totalSessions: 2,
    wins: 6,
    winRate: 0.75,
    averageRank: 1.5,
    bestRank: 1,
    worstRank: 3,
    revolutionCount: 2,
  },
];

const playerNames: Record<string, string> = {
  p1: "철수",
  p2: "영희",
  p3: "민수",
};

describe("StatsOverview", () => {
  it("renders player names", () => {
    render(
      <StatsOverview stats={mockStats} playerNames={playerNames} />
    );
    expect(screen.getByText("철수")).toBeInTheDocument();
    expect(screen.getByText("영희")).toBeInTheDocument();
    expect(screen.getByText("민수")).toBeInTheDocument();
  });

  it("shows win rate percentage for each player", () => {
    render(
      <StatsOverview stats={mockStats} playerNames={playerNames} />
    );
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("sorts by win rate descending by default", () => {
    render(
      <StatsOverview stats={mockStats} playerNames={playerNames} />
    );
    const rows = screen.getAllByRole("row").slice(1); // skip header
    expect(within(rows[0]).getByText("민수")).toBeInTheDocument();
    expect(within(rows[1]).getByText("철수")).toBeInTheDocument();
    expect(within(rows[2]).getByText("영희")).toBeInTheDocument();
  });

  it("sorts by average rank ascending when clicked", async () => {
    const user = userEvent.setup();
    render(
      <StatsOverview stats={mockStats} playerNames={playerNames} />
    );
    await user.click(screen.getByRole("button", { name: /평균순위/i }));
    const rows = screen.getAllByRole("row").slice(1);
    // 민수 1.5 < 철수 1.8 < 영희 2.5
    expect(within(rows[0]).getByText("민수")).toBeInTheDocument();
    expect(within(rows[1]).getByText("철수")).toBeInTheDocument();
    expect(within(rows[2]).getByText("영희")).toBeInTheDocument();
  });

  it("sorts by game count descending when clicked", async () => {
    const user = userEvent.setup();
    render(
      <StatsOverview stats={mockStats} playerNames={playerNames} />
    );
    await user.click(screen.getByRole("button", { name: /게임수/i }));
    const rows = screen.getAllByRole("row").slice(1);
    // 철수 10 = 영희 10, 민수 8
    expect(within(rows[2]).getByText("민수")).toBeInTheDocument();
  });

  it("renders empty state when no stats", () => {
    render(
      <StatsOverview stats={[]} playerNames={{}} />
    );
    expect(screen.getByText(/아직 데이터가 없습니다/)).toBeInTheDocument();
  });

  it("shows total games played", () => {
    render(
      <StatsOverview stats={mockStats} playerNames={playerNames} />
    );
    expect(screen.getAllByText("10")).toHaveLength(2); // p1 & p2
    expect(screen.getByText("8")).toBeInTheDocument(); // p3
  });
});
