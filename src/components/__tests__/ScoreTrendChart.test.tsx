import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreTrendChart } from "../stats/ScoreTrendChart";
import type { Player, Round } from "@/types";

// Mock recharts to avoid rendering real SVG charts in tests
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="line-chart" data-points={data.length}>
      {children}
    </div>
  ),
  Line: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid={`line-${dataKey}`} data-name={name} />
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ReferenceLine: ({ label }: { label?: string }) => (
    <div data-testid="reference-line" data-label={label} />
  ),
}));

const players: Player[] = [
  { id: "p1", name: "Alice", createdAt: 1 },
  { id: "p2", name: "Bob", createdAt: 2 },
];

const playerIds = ["p1", "p2"];

function makeRound(
  id: string,
  results: { playerId: string; rank: number }[],
  revolution = false
): Round {
  return {
    id,
    participantIds: results.map((r) => r.playerId),
    results,
    revolution,
    createdAt: Date.now(),
  };
}

describe("ScoreTrendChart", () => {
  it("renders a line for each player", () => {
    const rounds = [
      makeRound("r1", [
        { playerId: "p1", rank: 1 },
        { playerId: "p2", rank: 2 },
      ]),
      makeRound("r2", [
        { playerId: "p1", rank: 2 },
        { playerId: "p2", rank: 1 },
      ]),
    ];
    render(<ScoreTrendChart playerIds={playerIds} rounds={rounds} players={players} />);

    expect(screen.getByTestId("line-Alice")).toBeDefined();
    expect(screen.getByTestId("line-Bob")).toBeDefined();
  });

  it("renders chart structure (grid, axes, tooltip, legend)", () => {
    const rounds = [
      makeRound("r1", [
        { playerId: "p1", rank: 1 },
        { playerId: "p2", rank: 2 },
      ]),
      makeRound("r2", [
        { playerId: "p1", rank: 2 },
        { playerId: "p2", rank: 1 },
      ]),
    ];
    render(<ScoreTrendChart playerIds={playerIds} rounds={rounds} players={players} />);

    expect(screen.getByTestId("responsive-container")).toBeDefined();
    expect(screen.getByTestId("line-chart")).toBeDefined();
    expect(screen.getByTestId("cartesian-grid")).toBeDefined();
    expect(screen.getByTestId("x-axis")).toBeDefined();
    expect(screen.getByTestId("y-axis")).toBeDefined();
    expect(screen.getByTestId("tooltip")).toBeDefined();
    expect(screen.getByTestId("legend")).toBeDefined();
  });

  it("generates correct number of data points", () => {
    const rounds = [
      makeRound("r1", [
        { playerId: "p1", rank: 1 },
        { playerId: "p2", rank: 2 },
      ]),
      makeRound("r2", [
        { playerId: "p1", rank: 2 },
        { playerId: "p2", rank: 1 },
      ]),
      makeRound("r3", [
        { playerId: "p1", rank: 1 },
        { playerId: "p2", rank: 2 },
      ]),
    ];
    render(<ScoreTrendChart playerIds={playerIds} rounds={rounds} players={players} />);

    const chart = screen.getByTestId("line-chart");
    expect(chart.getAttribute("data-points")).toBe("3");
  });

  it("renders revolution reference lines", () => {
    const rounds = [
      makeRound("r1", [
        { playerId: "p1", rank: 1 },
        { playerId: "p2", rank: 2 },
      ]),
      makeRound(
        "r2",
        [
          { playerId: "p1", rank: 2 },
          { playerId: "p2", rank: 1 },
        ],
        true
      ),
      makeRound("r3", [
        { playerId: "p1", rank: 1 },
        { playerId: "p2", rank: 2 },
      ]),
    ];
    render(<ScoreTrendChart playerIds={playerIds} rounds={rounds} players={players} />);

    const refLines = screen.getAllByTestId("reference-line");
    expect(refLines.length).toBe(1);
  });
});
