import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RankingList } from "../round/RankingList";
import type { Player } from "@/types";

// Mock DnD to avoid complex sensor setup in tests
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  TouchSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: () => [],
  DragOverlay: () => null,
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
  arrayMove: vi.fn(),
  sortableKeyboardCoordinates: vi.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

vi.mock("@dnd-kit/modifiers", () => ({
  restrictToVerticalAxis: {},
}));

const players: Player[] = [
  { id: "p1", name: "철수", createdAt: 1 },
  { id: "p2", name: "영희", createdAt: 2 },
];

describe("RankingList revolution checkbox", () => {
  it("renders revolution checkbox", () => {
    render(
      <RankingList
        players={players}
        onSave={vi.fn()}
        onBack={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/혁명/)).toBeInTheDocument();
  });

  it("checkbox is unchecked by default", () => {
    render(
      <RankingList
        players={players}
        onSave={vi.fn()}
        onBack={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/혁명/)).not.toBeChecked();
  });

  it("passes revolution=true when checkbox checked and saved", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <RankingList
        players={players}
        onSave={onSave}
        onBack={vi.fn()}
      />
    );
    await user.click(screen.getByLabelText(/혁명/));
    await user.click(screen.getByRole("button", { name: "저장" }));
    expect(onSave).toHaveBeenCalledWith(["p1", "p2"], true);
  });

  it("passes revolution=false when checkbox unchecked and saved", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <RankingList
        players={players}
        onSave={onSave}
        onBack={vi.fn()}
      />
    );
    await user.click(screen.getByRole("button", { name: "저장" }));
    expect(onSave).toHaveBeenCalledWith(["p1", "p2"], false);
  });

  it("initializes checkbox from initialRevolution prop", () => {
    render(
      <RankingList
        players={players}
        onSave={vi.fn()}
        onBack={vi.fn()}
        initialRevolution={true}
      />
    );
    expect(screen.getByLabelText(/혁명/)).toBeChecked();
  });

  it("shows tax exempt banner when revolution is checked", async () => {
    const user = userEvent.setup();
    render(
      <RankingList
        players={players}
        onSave={vi.fn()}
        onBack={vi.fn()}
      />
    );
    await user.click(screen.getByLabelText(/혁명/));
    expect(screen.getByText(/세금 면제/)).toBeInTheDocument();
  });
});
