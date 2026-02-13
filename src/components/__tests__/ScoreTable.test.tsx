import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreTable } from "../scoreboard/ScoreTable";
import type { Player, Round } from "@/types";

const players: Player[] = [
  { id: "a", name: "철수", createdAt: 1 },
  { id: "b", name: "영희", createdAt: 2 },
  { id: "c", name: "민수", createdAt: 3 },
];

describe("ScoreTable", () => {
  it("renders player names", () => {
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

    render(<ScoreTable playerIds={["a", "b", "c"]} rounds={rounds} players={players} />);
    expect(screen.getByText("철수")).toBeInTheDocument();
    expect(screen.getByText("영희")).toBeInTheDocument();
    expect(screen.getByText("민수")).toBeInTheDocument();
  });

  it("renders round column headers", () => {
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
      {
        id: "r2",
        participantIds: ["a", "b"],
        results: [
          { playerId: "a", rank: 2 },
          { playerId: "b", rank: 1 },
        ],
        createdAt: 2,
      },
    ];

    render(<ScoreTable playerIds={["a", "b"]} rounds={rounds} players={players} />);
    expect(screen.getByText("R1")).toBeInTheDocument();
    expect(screen.getByText("R2")).toBeInTheDocument();
  });

  it("shows '-' for absent players", () => {
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

    render(<ScoreTable playerIds={["a", "b", "c"]} rounds={rounds} players={players} />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("shows totals", () => {
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

    render(<ScoreTable playerIds={["a", "b"]} rounds={rounds} players={players} />);
    // a total=0, b total=1
    expect(screen.getByText("합계")).toBeInTheDocument();
  });

  it("sorts players by rank (lowest total first)", () => {
    const rounds: Round[] = [
      {
        id: "r1",
        participantIds: ["a", "b"],
        results: [
          { playerId: "a", rank: 2 },
          { playerId: "b", rank: 1 },
        ],
        createdAt: 1,
      },
    ];

    render(<ScoreTable playerIds={["a", "b"]} rounds={rounds} players={players} />);
    const rows = screen.getAllByRole("row");
    // header row + 2 data rows; first data row should be 영희 (rank 1)
    expect(rows[1]).toHaveTextContent("영희");
    expect(rows[2]).toHaveTextContent("철수");
  });
});
