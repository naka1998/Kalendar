import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScaledPage, useScale } from "./ScaledPage";
import { useCalendarStore } from "@/stores/calendarStore";

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

beforeEach(() => {
  useCalendarStore.setState({ orientation: "portrait" });
});

function ScaleReader() {
  const scale = useScale();
  return <span data-testid="scale-value">{scale}</span>;
}

describe("ScaledPage", () => {
  it("renders children", () => {
    render(
      <ScaledPage>
        <span>Child content</span>
      </ScaledPage>,
    );
    expect(screen.getByText("Child content")).toBeDefined();
  });

  it("provides scale context to children", () => {
    render(
      <ScaledPage>
        <ScaleReader />
      </ScaledPage>,
    );
    // Default scale is 1 when container width is 0 (jsdom)
    expect(screen.getByTestId("scale-value").textContent).toBe("1");
  });

  it("renders portrait page dimensions", () => {
    const { container } = render(
      <ScaledPage>
        <span>Content</span>
      </ScaledPage>,
    );
    const inner = container.querySelector('[style*="width: 794px"]');
    expect(inner).toBeTruthy();
  });

  it("renders landscape page dimensions", () => {
    useCalendarStore.setState({ orientation: "landscape" });
    const { container } = render(
      <ScaledPage>
        <span>Content</span>
      </ScaledPage>,
    );
    const inner = container.querySelector('[style*="width: 1123px"]');
    expect(inner).toBeTruthy();
  });
});
