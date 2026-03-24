import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalendarPageContainer } from "./CalendarPageContainer";
import { useCalendarStore } from "@/stores/calendarStore";
import { DEFAULTS, DEFAULT_CALENDAR_STYLE } from "@/lib/constants";

vi.mock("@/hooks/useImageUpload", () => ({
  useImageUpload: () => ({
    uploadImage: vi.fn(),
    uploading: false,
    error: null,
  }),
}));

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

beforeEach(() => {
  useCalendarStore.setState({
    startMonth: DEFAULTS.START_MONTH,
    endMonth: DEFAULTS.END_MONTH,
    orientation: DEFAULTS.ORIENTATION,
    weekStart: DEFAULTS.WEEK_START,
    weekdayFormat: DEFAULTS.WEEKDAY_FORMAT,
    monthLabelFormat: DEFAULTS.MONTH_LABEL_FORMAT,
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
  });
});

describe("CalendarPageContainer", () => {
  it("renders calendar page with month label", () => {
    render(<CalendarPageContainer monthKey="2026-04" />);
    expect(screen.getByText("2026.04")).toBeDefined();
  });

  it("renders weekday headers", () => {
    render(<CalendarPageContainer monthKey="2026-04" />);
    expect(screen.getByText("Sun")).toBeDefined();
    expect(screen.getByText("Sat")).toBeDefined();
  });

  it("renders calendar area", () => {
    render(<CalendarPageContainer monthKey="2026-04" />);
    expect(screen.getByTestId("calendar-area")).toBeDefined();
  });

  it("does not show image area when useImages is false", () => {
    render(<CalendarPageContainer monthKey="2026-04" />);
    expect(screen.queryByTestId("image-area")).toBeNull();
  });

  it("shows image placeholder when useImages is true", () => {
    useCalendarStore.setState({ useImages: true });
    render(<CalendarPageContainer monthKey="2026-04" />);
    expect(screen.getByTestId("image-area")).toBeDefined();
  });

  it("renders with landscape orientation", () => {
    useCalendarStore.setState({ orientation: "landscape" });
    render(<CalendarPageContainer monthKey="2026-04" />);
    const page = screen.getByTestId("page-container").parentElement!;
    expect(page.style.width).toBe("1123px");
  });

  it("renders with different month", () => {
    render(<CalendarPageContainer monthKey="2026-12" />);
    expect(screen.getByText("2026.12")).toBeDefined();
  });
});
