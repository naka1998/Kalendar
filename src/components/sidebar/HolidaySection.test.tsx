import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HolidaySection } from "./HolidaySection";
import { useCalendarStore } from "@/stores/calendarStore";
import { DEFAULTS } from "@/lib/constants";

beforeEach(() => {
  useCalendarStore.setState({
    holidaysFetched: true,
    holidaysFetchError: null,
    manualHolidays: [],
    removedHolidays: [],
    holidayMarkStyle: DEFAULTS.HOLIDAY_MARK_STYLE,
    apiHolidays: {},
  });
});

describe("HolidaySection", () => {
  it("renders fetch status as 取得済み", () => {
    render(<HolidaySection />);
    expect(screen.getByText("取得済み")).toBeDefined();
  });

  it("shows error status when fetch failed", () => {
    useCalendarStore.setState({ holidaysFetchError: "error", holidaysFetched: false });
    render(<HolidaySection />);
    expect(screen.getByText("エラー")).toBeDefined();
  });

  it("shows fetching status when not yet fetched", () => {
    useCalendarStore.setState({ holidaysFetched: false, holidaysFetchError: null });
    render(<HolidaySection />);
    expect(screen.getByText("取得中...")).toBeDefined();
  });

  it("renders holiday mark style options", () => {
    render(<HolidaySection />);
    expect(screen.getByText("祝日マーク")).toBeDefined();
    expect(screen.getByText("ドット")).toBeDefined();
    expect(screen.getByText("丸囲み")).toBeDefined();
    expect(screen.getByText("下線")).toBeDefined();
    expect(screen.getByText("色のみ")).toBeDefined();
  });

  it("renders add holiday form", () => {
    render(<HolidaySection />);
    expect(screen.getByText("祝日を追加")).toBeDefined();
    expect(screen.getByText("追加")).toBeDefined();
  });

  it("add button is disabled when fields are empty", () => {
    render(<HolidaySection />);
    const addButton = screen.getByText("追加");
    expect(addButton.hasAttribute("disabled")).toBe(true);
  });

  it("adds manual holiday when form is filled", () => {
    const { container } = render(<HolidaySection />);
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    const nameInput = screen.getByPlaceholderText("名称");

    fireEvent.change(dateInput, { target: { value: "2026-12-25" } });
    fireEvent.change(nameInput, { target: { value: "クリスマス" } });
    fireEvent.click(screen.getByText("追加"));

    const state = useCalendarStore.getState();
    expect(state.manualHolidays).toEqual([{ date: "2026-12-25", name: "クリスマス" }]);
  });

  it("displays manually added holidays", () => {
    useCalendarStore.setState({
      manualHolidays: [{ date: "2026-12-25", name: "クリスマス" }],
    });
    render(<HolidaySection />);
    expect(screen.getByText("手動追加した祝日")).toBeDefined();
    expect(screen.getByText("2026-12-25 — クリスマス")).toBeDefined();
  });

  it("removes manual holiday when × is clicked", () => {
    useCalendarStore.setState({
      manualHolidays: [{ date: "2026-12-25", name: "クリスマス" }],
    });
    render(<HolidaySection />);
    fireEvent.click(screen.getByText("×"));
    expect(useCalendarStore.getState().manualHolidays).toEqual([]);
  });

  it("displays removed holidays with restore option", () => {
    useCalendarStore.setState({
      removedHolidays: ["2026-01-01"],
      apiHolidays: { "2026-01-01": "元日" },
    });
    render(<HolidaySection />);
    expect(screen.getByText("非表示の祝日")).toBeDefined();
    expect(screen.getByText("2026-01-01 — 元日")).toBeDefined();
    expect(screen.getByText("復元")).toBeDefined();
  });

  it("restores removed holiday on restore click", () => {
    useCalendarStore.setState({
      removedHolidays: ["2026-01-01"],
      apiHolidays: { "2026-01-01": "元日" },
    });
    render(<HolidaySection />);
    fireEvent.click(screen.getByText("復元"));
    expect(useCalendarStore.getState().removedHolidays).toEqual([]);
  });

  it("changes holiday mark style on click", () => {
    render(<HolidaySection />);
    fireEvent.click(screen.getByText("丸囲み"));
    expect(useCalendarStore.getState().holidayMarkStyle).toBe("circle");
  });
});
