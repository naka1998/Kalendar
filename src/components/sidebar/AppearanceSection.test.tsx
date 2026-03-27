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

  it("renders font weight options", () => {
    render(<AppearanceSection />);
    expect(screen.getByText("細字")).toBeDefined();
    expect(screen.getByText("標準")).toBeDefined();
    expect(screen.getByText("太字")).toBeDefined();
  });

  it("renders typography size controls", () => {
    render(<AppearanceSection />);
    expect(screen.getByText("月タイトル")).toBeDefined();
    expect(screen.getByText("日付")).toBeDefined();
    expect(screen.getByText("曜日")).toBeDefined();
    expect(screen.getByText("セル余白")).toBeDefined();
    expect(screen.getByText("ヘッダー間隔")).toBeDefined();
    expect(screen.getByText("上余白")).toBeDefined();
  });

  it("shows warning color when font size is at warning threshold", () => {
    useCalendarStore.setState({
      calendarStyle: {
        ...DEFAULT_CALENDAR_STYLE,
        monthFontSize: 30,
      },
    });
    render(<AppearanceSection />);
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
    render(<AppearanceSection />);
    const monthLabel = screen.getByText("月タイトル");
    expect(monthLabel.className).toContain("text-red-500");
  });

  it("shows no warning color when font size is above thresholds", () => {
    render(<AppearanceSection />);
    const monthLabel = screen.getByText("月タイトル");
    expect(monthLabel.className).toContain("text-on-surface-variant");
    expect(monthLabel.className).not.toContain("text-amber-500");
    expect(monthLabel.className).not.toContain("text-red-500");
  });
});
