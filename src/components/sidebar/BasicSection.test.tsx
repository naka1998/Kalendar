import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BasicSection } from "./BasicSection";
import { useCalendarStore } from "@/stores/calendarStore";
import { DEFAULTS } from "@/lib/constants";

beforeEach(() => {
  useCalendarStore.setState({
    startMonth: DEFAULTS.START_MONTH,
    endMonth: DEFAULTS.END_MONTH,
    orientation: DEFAULTS.ORIENTATION,
    weekStart: DEFAULTS.WEEK_START,
    weekdayFormat: DEFAULTS.WEEKDAY_FORMAT,
    monthLabelFormat: DEFAULTS.MONTH_LABEL_FORMAT,
  });
});

describe("BasicSection", () => {
  it("renders start month and end month labels", () => {
    render(<BasicSection />);
    expect(screen.getByText("開始月")).toBeDefined();
    expect(screen.getByText("終了月")).toBeDefined();
  });

  it("renders orientation control", () => {
    render(<BasicSection />);
    expect(screen.getByText("用紙")).toBeDefined();
    expect(screen.getByText("縦")).toBeDefined();
    expect(screen.getByText("横")).toBeDefined();
  });

  it("renders week start control", () => {
    render(<BasicSection />);
    expect(screen.getByText("週の開始")).toBeDefined();
    expect(screen.getByText("日曜")).toBeDefined();
    expect(screen.getByText("月曜")).toBeDefined();
  });

  it("renders weekday format control", () => {
    render(<BasicSection />);
    expect(screen.getByText("曜日表記")).toBeDefined();
  });

  it("renders month label format control", () => {
    render(<BasicSection />);
    expect(screen.getByText("月表記")).toBeDefined();
  });

  it("switches orientation on click", () => {
    render(<BasicSection />);
    fireEvent.click(screen.getByText("横"));
    expect(useCalendarStore.getState().orientation).toBe("landscape");
  });

  it("switches week start on click", () => {
    render(<BasicSection />);
    fireEvent.click(screen.getByText("月曜"));
    expect(useCalendarStore.getState().weekStart).toBe("monday");
  });
});
