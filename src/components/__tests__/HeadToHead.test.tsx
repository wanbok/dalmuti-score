import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeadToHeadComparison } from "../stats/HeadToHeadComparison";
import type { HeadToHeadStats } from "@/types";

const mockH2H: HeadToHeadStats = {
  player1Id: "p1",
  player2Id: "p2",
  player1Wins: 5,
  player2Wins: 3,
  draws: 2,
  totalFaceOffs: 10,
};

const playerNames: Record<string, string> = {
  p1: "철수",
  p2: "영희",
  p3: "민수",
};

const playerIds = ["p1", "p2", "p3"];

describe("HeadToHeadComparison", () => {
  it("renders player selection dropdowns", () => {
    render(
      <HeadToHeadComparison
        playerIds={playerIds}
        playerNames={playerNames}
        calculateH2H={() => mockH2H}
      />
    );
    const selects = screen.getAllByRole("combobox");
    expect(selects).toHaveLength(2);
  });

  it("shows head-to-head stats when two players selected", async () => {
    const user = userEvent.setup();
    render(
      <HeadToHeadComparison
        playerIds={playerIds}
        playerNames={playerNames}
        calculateH2H={() => mockH2H}
      />
    );
    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[0], "p1");
    await user.selectOptions(selects[1], "p2");

    expect(screen.getByText("5")).toBeInTheDocument(); // p1 wins
    expect(screen.getByText("3")).toBeInTheDocument(); // p2 wins
    expect(screen.getByText("2")).toBeInTheDocument(); // draws
  });

  it("shows prompt when no players selected", () => {
    render(
      <HeadToHeadComparison
        playerIds={playerIds}
        playerNames={playerNames}
        calculateH2H={() => mockH2H}
      />
    );
    expect(screen.getByText(/두 선수를 선택/)).toBeInTheDocument();
  });
});
