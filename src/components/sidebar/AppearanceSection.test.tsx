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

  it("keeps presets and detailed controls in separate sections", () => {
    render(<AppearanceSection />);
    expect(screen.queryByRole("button", { name: "縦リスト" })).toBeNull();
    expect(screen.queryByText("上余白")).toBeNull();
  });
});
