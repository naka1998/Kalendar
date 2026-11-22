import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppearanceSection } from "./AppearanceSection";
import { useCalendarStore } from "@/stores/calendarStore";
import { DEFAULTS, DEFAULT_CALENDAR_STYLE } from "@/lib/constants";

beforeEach(() => {
  useCalendarStore.setState({
    themeId: DEFAULTS.THEME_ID,
    fontId: DEFAULTS.FONT_ID,
    fontWeight: DEFAULTS.FONT_WEIGHT,
    calendarStyle: { ...DEFAULT_CALENDAR_STYLE },
  });
});

describe("AppearanceSection", () => {
  it("renders theme label", () => {
    render(<AppearanceSection />);
    expect(screen.getByText("テーマ")).toBeDefined();
  });

  it("renders font label", () => {
    render(<AppearanceSection />);
    expect(screen.getByText("フォント")).toBeDefined();
  });

  it("shows presets and keeps the detailed controls in another section", () => {
    render(<AppearanceSection />);
    expect(screen.getByRole("button", { name: "縦リスト" })).toBeDefined();
    expect(screen.queryByText("上余白")).toBeNull();
  });
});
