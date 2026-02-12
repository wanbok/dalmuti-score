import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ParticipantSelector } from "../round/ParticipantSelector";
import type { Player } from "@/types";

const players: Player[] = [
  { id: "a", name: "철수", createdAt: 1 },
  { id: "b", name: "영희", createdAt: 2 },
  { id: "c", name: "민수", createdAt: 3 },
];

describe("ParticipantSelector", () => {
  it("renders all players with checkboxes", () => {
    render(
      <ParticipantSelector
        players={players}
        selected={new Set(["a", "b", "c"])}
        onToggle={vi.fn()}
        onSelectAll={vi.fn()}
        onDeselectAll={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByLabelText("철수")).toBeInTheDocument();
    expect(screen.getByLabelText("영희")).toBeInTheDocument();
    expect(screen.getByLabelText("민수")).toBeInTheDocument();
  });

  it("shows selected count in confirm button", () => {
    render(
      <ParticipantSelector
        players={players}
        selected={new Set(["a", "b"])}
        onToggle={vi.fn()}
        onSelectAll={vi.fn()}
        onDeselectAll={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /2명/ })).toBeInTheDocument();
  });

  it("disables confirm when fewer than 2 selected", () => {
    render(
      <ParticipantSelector
        players={players}
        selected={new Set(["a"])}
        onToggle={vi.fn()}
        onSelectAll={vi.fn()}
        onDeselectAll={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /1명/ })).toBeDisabled();
  });

  it("calls onToggle when checkbox clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <ParticipantSelector
        players={players}
        selected={new Set(["a", "b", "c"])}
        onToggle={onToggle}
        onSelectAll={vi.fn()}
        onDeselectAll={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    await user.click(screen.getByLabelText("철수"));
    expect(onToggle).toHaveBeenCalledWith("a");
  });

  it("calls onSelectAll when 전체 선택 clicked", async () => {
    const user = userEvent.setup();
    const onSelectAll = vi.fn();
    render(
      <ParticipantSelector
        players={players}
        selected={new Set()}
        onToggle={vi.fn()}
        onSelectAll={onSelectAll}
        onDeselectAll={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    await user.click(screen.getByRole("button", { name: "전체 선택" }));
    expect(onSelectAll).toHaveBeenCalledOnce();
  });

  it("calls onConfirm when confirm button clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ParticipantSelector
        players={players}
        selected={new Set(["a", "b"])}
        onToggle={vi.fn()}
        onSelectAll={vi.fn()}
        onDeselectAll={vi.fn()}
        onConfirm={onConfirm}
      />
    );
    await user.click(screen.getByRole("button", { name: /2명/ }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
