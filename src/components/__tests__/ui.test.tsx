import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Checkbox } from "../ui/Checkbox";
import { Badge, rankBadgeVariant } from "../ui/Badge";
import { EmptyState } from "../layout/EmptyState";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>클릭</Button>);
    expect(screen.getByRole("button", { name: "클릭" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>클릭</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>비활성</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies variant classes", () => {
    const { rerender } = render(<Button variant="danger">삭제</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-danger");

    rerender(<Button variant="secondary">취소</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-secondary");
  });

  it("meets 44px min touch target", () => {
    render(<Button>터치</Button>);
    expect(screen.getByRole("button")).toHaveClass("min-h-[44px]");
  });
});

describe("Card", () => {
  it("renders children", () => {
    render(<Card><p>내용</p></Card>);
    expect(screen.getByText("내용")).toBeInTheDocument();
  });
});

describe("Input", () => {
  it("renders with label", () => {
    render(<Input label="이름" id="name" />);
    expect(screen.getByLabelText("이름")).toBeInTheDocument();
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    render(<Input label="이름" id="name" />);
    const input = screen.getByLabelText("이름");
    await user.type(input, "철수");
    expect(input).toHaveValue("철수");
  });

  it("meets 44px min touch target", () => {
    render(<Input label="이름" id="name" />);
    expect(screen.getByLabelText("이름")).toHaveClass("min-h-[44px]");
  });
});

describe("Checkbox", () => {
  it("renders with label", () => {
    render(<Checkbox label="선택" id="chk" />);
    expect(screen.getByLabelText("선택")).toBeInTheDocument();
  });

  it("toggles on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="선택" id="chk" onChange={onChange} />);
    await user.click(screen.getByLabelText("선택"));
    expect(onChange).toHaveBeenCalledOnce();
  });
});

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>1</Badge>);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("rankBadgeVariant returns correct variants", () => {
    expect(rankBadgeVariant(1)).toBe("gold");
    expect(rankBadgeVariant(2)).toBe("silver");
    expect(rankBadgeVariant(3)).toBe("bronze");
    expect(rankBadgeVariant(4)).toBe("default");
    expect(rankBadgeVariant(10)).toBe("default");
  });
});

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="비어있음" />);
    expect(screen.getByText("비어있음")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<EmptyState title="비어있음" description="설명 텍스트" />);
    expect(screen.getByText("설명 텍스트")).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState
        title="비어있음"
        action={<button>추가하기</button>}
      />
    );
    expect(screen.getByRole("button", { name: "추가하기" })).toBeInTheDocument();
  });
});
