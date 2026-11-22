import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SizeAndPlacementSection } from "./SizeAndPlacementSection";
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

describe("SizeAndPlacementSection", () => {
  it("renders font weight options", () => {
    render(<SizeAndPlacementSection />);
    expect(screen.getByText("細字")).toBeDefined();
    expect(screen.getByText("標準")).toBeDefined();
    expect(screen.getByText("太字")).toBeDefined();
  });

  it("renders typography size controls", () => {
    render(<SizeAndPlacementSection />);
    expect(screen.getByText("月タイトル")).toBeDefined();
    expect(screen.getByText("日付")).toBeDefined();
    expect(screen.getByText("曜日")).toBeDefined();
    expect(screen.getByText("セル余白")).toBeDefined();
    expect(screen.getByText("ヘッダー間隔")).toBeDefined();
    expect(screen.getByText("上余白")).toBeDefined();
  });

  it("changes font weight on click", () => {
    render(<SizeAndPlacementSection />);
    fireEvent.click(screen.getByText("太字"));
    expect(useCalendarStore.getState().fontWeight).toBe(600);
  });

  it("shows warning color when font size is at warning threshold", () => {
    useCalendarStore.setState({
      calendarStyle: {
        ...DEFAULT_CALENDAR_STYLE,
        monthFontSize: 30,
      },
    });
    render(<SizeAndPlacementSection />);
    const monthLabel = screen.getByText("月タイトル");
    expect(monthLabel.className).toContain("text-amber-500");
  });

  it("shows danger color when font size is at danger threshold", () => {
    useCalendarStore.setState({
      calendarStyle: {
        ...DEFAULT_CALENDAR_STYLE,
        monthFontSize: 26,
      },
    });
    render(<SizeAndPlacementSection />);
    const monthLabel = screen.getByText("月タイトル");
    expect(monthLabel.className).toContain("text-red-500");
  });

  it("shows no warning color when font size is above thresholds", () => {
    render(<SizeAndPlacementSection />);
    const monthLabel = screen.getByText("月タイトル");
    expect(monthLabel.className).toContain("text-on-surface-variant");
    expect(monthLabel.className).not.toContain("text-amber-500");
    expect(monthLabel.className).not.toContain("text-red-500");
  });
});
