import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DividerHandle } from "./DividerHandle";

describe("DividerHandle", () => {
  const defaultProps = {
    direction: "horizontal" as const,
    isDragging: false,
    dividerProps: { onPointerDown: vi.fn() },
  };

  it("renders with data-testid", () => {
    render(<DividerHandle {...defaultProps} />);
    expect(screen.getByTestId("divider-handle")).toBeDefined();
  });

  it("uses row-resize cursor for horizontal direction", () => {
    render(<DividerHandle {...defaultProps} direction="horizontal" />);
    const handle = screen.getByTestId("divider-handle");
    expect(handle.className).toContain("cursor-row-resize");
  });

  it("uses col-resize cursor for vertical direction", () => {
    render(<DividerHandle {...defaultProps} direction="vertical" />);
    const handle = screen.getByTestId("divider-handle");
    expect(handle.className).toContain("cursor-col-resize");
  });

  it("applies primary color when dragging", () => {
    render(<DividerHandle {...defaultProps} isDragging={true} />);
    const handle = screen.getByTestId("divider-handle");
    const line = handle.firstElementChild!;
    expect(line.className).toContain("bg-primary");
  });

  it("calls onPointerDown from dividerProps", () => {
    const onPointerDown = vi.fn();
    render(<DividerHandle {...defaultProps} dividerProps={{ onPointerDown }} />);
    fireEvent.pointerDown(screen.getByTestId("divider-handle"));
    expect(onPointerDown).toHaveBeenCalled();
  });
});
