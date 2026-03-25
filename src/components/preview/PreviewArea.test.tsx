import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PreviewArea } from "./PreviewArea";
import { useCalendarStore } from "@/stores/calendarStore";
import { DEFAULTS, DEFAULT_CALENDAR_STYLE } from "@/lib/constants";

vi.mock("@/hooks/useImageUpload", () => ({
  useImageUpload: () => ({
    uploadImage: vi.fn(),
    uploading: false,
    error: null,
  }),
}));

// Mock browser APIs not available in jsdom
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
globalThis.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

beforeEach(() => {
  useCalendarStore.setState({
    startMonth: "2026-04",
    endMonth: "2026-06",
    monthLabelFormat: DEFAULTS.MONTH_LABEL_FORMAT,
    orientation: DEFAULTS.ORIENTATION,
    weekStart: DEFAULTS.WEEK_START,
    weekdayFormat: DEFAULTS.WEEKDAY_FORMAT,
    themeId: DEFAULTS.THEME_ID,
    fontId: DEFAULTS.FONT_ID,
    fontWeight: DEFAULTS.FONT_WEIGHT,
    holidayMarkStyle: DEFAULTS.HOLIDAY_MARK_STYLE,
    useImages: false,
    images: {},
    imagePercent: DEFAULTS.IMAGE_PERCENT,
    imagePosition: DEFAULTS.IMAGE_POSITION,
    apiHolidays: {},
    manualHolidays: [],
    removedHolidays: [],
    monthThemeOverrides: {},
    calendarStyle: { ...DEFAULT_CALENDAR_STYLE },
    previewZoom: "standard",
  });
});

describe("PreviewArea", () => {
  it("renders month navigation buttons", () => {
    render(<PreviewArea />);
    expect(screen.getByText("04")).toBeDefined();
    expect(screen.getByText("05")).toBeDefined();
    expect(screen.getByText("06")).toBeDefined();
  });

  it("renders calendar pages for each month", () => {
    render(<PreviewArea />);
    // Month labels appear in both nav and calendar grid
    expect(screen.getAllByText("2026.04").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2026.05").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2026.06").length).toBeGreaterThanOrEqual(1);
  });

  it("shows error message for invalid date range", () => {
    useCalendarStore.setState({ startMonth: "2027-01", endMonth: "2026-01" });
    render(<PreviewArea />);
    expect(screen.getByText("無効な期間です。終了月は開始月より後にしてください。")).toBeDefined();
  });

  it("renders active month label in navigation", () => {
    render(<PreviewArea />);
    expect(screen.getAllByText("2026.04").length).toBeGreaterThanOrEqual(1);
  });

  it("toggles showSafeMargin when clicking margin guide button", () => {
    render(<PreviewArea />);
    expect(useCalendarStore.getState().showSafeMargin).toBe(false);
    fireEvent.click(screen.getByText("余白ガイド"));
    expect(useCalendarStore.getState().showSafeMargin).toBe(true);
    fireEvent.click(screen.getByText("余白ガイド"));
    expect(useCalendarStore.getState().showSafeMargin).toBe(false);
  });

  it("renders zoom control buttons", () => {
    render(<PreviewArea />);
    expect(screen.getByTestId("zoom-large")).toBeDefined();
    expect(screen.getByTestId("zoom-standard")).toBeDefined();
    expect(screen.getByTestId("zoom-small")).toBeDefined();
  });

  it("clicking zoom button updates store", () => {
    render(<PreviewArea />);
    expect(useCalendarStore.getState().previewZoom).toBe("standard");
    fireEvent.click(screen.getByTestId("zoom-large"));
    expect(useCalendarStore.getState().previewZoom).toBe("large");
    fireEvent.click(screen.getByTestId("zoom-small"));
    expect(useCalendarStore.getState().previewZoom).toBe("small");
  });
});
