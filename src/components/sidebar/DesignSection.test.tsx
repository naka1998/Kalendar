import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DesignSection } from "./DesignSection";
import { useCalendarStore } from "@/stores/calendarStore";
import { DEFAULTS, DEFAULT_CALENDAR_STYLE } from "@/lib/constants";

beforeEach(() => {
  useCalendarStore.setState({
    themeId: DEFAULTS.THEME_ID,
    fontId: DEFAULTS.FONT_ID,
    fontWeight: DEFAULTS.FONT_WEIGHT,
    useImages: true,
    calendarStyle: { ...DEFAULT_CALENDAR_STYLE },
  });
});

describe("DesignSection", () => {
  it("renders theme label", () => {
    render(<DesignSection />);
    expect(screen.getByText("テーマ")).toBeDefined();
  });

  it("renders font label", () => {
    render(<DesignSection />);
    expect(screen.getByText("フォント")).toBeDefined();
  });

  it("renders font weight options", () => {
    render(<DesignSection />);
    expect(screen.getByText("細字")).toBeDefined();
    expect(screen.getByText("標準")).toBeDefined();
    expect(screen.getByText("太字")).toBeDefined();
  });

  it("renders image toggle", () => {
    render(<DesignSection />);
    expect(screen.getByText("画像を使用")).toBeDefined();
  });

  it("renders typography size controls", () => {
    render(<DesignSection />);
    expect(screen.getByText("月タイトル")).toBeDefined();
    expect(screen.getByText("日付")).toBeDefined();
    expect(screen.getByText("曜日")).toBeDefined();
    expect(screen.getByText("セル余白")).toBeDefined();
    expect(screen.getByText("ヘッダー間隔")).toBeDefined();
    expect(screen.getByText("上余白")).toBeDefined();
  });

  it("renders content alignment options", () => {
    render(<DesignSection />);
    expect(screen.getByText("配置揃え")).toBeDefined();
    expect(screen.getByText("上揃え")).toBeDefined();
    expect(screen.getByText("中央")).toBeDefined();
    expect(screen.getByText("下揃え")).toBeDefined();
  });

  it("changes font weight on click", () => {
    render(<DesignSection />);
    fireEvent.click(screen.getByText("太字"));
    expect(useCalendarStore.getState().fontWeight).toBe(600);
  });

  it("toggles useImages on click", () => {
    render(<DesignSection />);
    // Find the toggle button (the one with rounded-full class)
    const toggleContainer = screen.getByText("画像を使用").closest("div")!;
    const toggle = toggleContainer.querySelector("button")!;
    fireEvent.click(toggle);
    expect(useCalendarStore.getState().useImages).toBe(false);
  });

  it("changes content alignment on click", () => {
    render(<DesignSection />);
    fireEvent.click(screen.getByText("下揃え"));
    expect(useCalendarStore.getState().calendarStyle.contentAlign).toBe("end");
  });

  it("shows warning color when font size is at warning threshold", () => {
    useCalendarStore.setState({
      calendarStyle: {
        ...DEFAULT_CALENDAR_STYLE,
        monthFontSize: 30,
      },
    });
    render(<DesignSection />);
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
    render(<DesignSection />);
    const monthLabel = screen.getByText("月タイトル");
    expect(monthLabel.className).toContain("text-red-500");
  });

  it("shows no warning color when font size is above thresholds", () => {
    render(<DesignSection />);
    const monthLabel = screen.getByText("月タイトル");
    expect(monthLabel.className).toContain("text-on-surface-variant");
    expect(monthLabel.className).not.toContain("text-amber-500");
    expect(monthLabel.className).not.toContain("text-red-500");
  });
});
