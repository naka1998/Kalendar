import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AutoSaveIndicator } from "./AutoSaveIndicator";
import { useCalendarStore } from "@/stores/calendarStore";

describe("AutoSaveIndicator", () => {
  it("renders nothing when lastAutoSavedAt is null", () => {
    useCalendarStore.setState({ lastAutoSavedAt: null });
    const { container } = render(<AutoSaveIndicator />);
    expect(container.innerHTML).toBe("");
  });

  it("renders timestamp when lastAutoSavedAt is set", () => {
    useCalendarStore.setState({ lastAutoSavedAt: "2026-03-24T14:32:00.000Z" });
    render(<AutoSaveIndicator />);
    expect(screen.getByText(/自動保存済み/)).toBeDefined();
  });
});
