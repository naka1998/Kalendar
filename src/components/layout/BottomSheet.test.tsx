import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BottomSheet } from "./BottomSheet";

describe("BottomSheet", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <BottomSheet open={false} onClose={vi.fn()}>
        <p>Content</p>
      </BottomSheet>,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders children when open", () => {
    render(
      <BottomSheet open={true} onClose={vi.fn()}>
        <p>Sheet content</p>
      </BottomSheet>,
    );
    expect(screen.getByText("Sheet content")).toBeDefined();
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open={true} onClose={onClose}>
        <p>Content</p>
      </BottomSheet>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when clicking overlay", () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open={true} onClose={onClose}>
        <p>Content</p>
      </BottomSheet>,
    );
    // Click on the overlay (the outermost fixed div)
    const overlay = screen.getByText("Content").closest(".fixed")!;
    fireEvent.click(overlay, { target: overlay, currentTarget: overlay });
    expect(onClose).toHaveBeenCalled();
  });

  it("does not call onClose when clicking content", () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open={true} onClose={onClose}>
        <p>Content</p>
      </BottomSheet>,
    );
    fireEvent.click(screen.getByText("Content"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("sets body overflow to hidden when open", () => {
    render(
      <BottomSheet open={true} onClose={vi.fn()}>
        <p>Content</p>
      </BottomSheet>,
    );
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("resets body overflow when closed", () => {
    const { rerender } = render(
      <BottomSheet open={true} onClose={vi.fn()}>
        <p>Content</p>
      </BottomSheet>,
    );
    rerender(
      <BottomSheet open={false} onClose={vi.fn()}>
        <p>Content</p>
      </BottomSheet>,
    );
    expect(document.body.style.overflow).toBe("");
  });
});
