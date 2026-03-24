import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RestoreDialog } from "./RestoreDialog";
import * as storageService from "@/lib/storageService";

vi.mock("@/lib/storageService", () => ({
  loadFromStorage: vi.fn(() => null),
  clearStorage: vi.fn(),
  getSavedTimestamp: vi.fn(() => "2026-03-24T12:30:00.000Z"),
  hasSavedData: vi.fn(() => true),
  saveToStorage: vi.fn(() => ({ success: true })),
}));

vi.mock("@/hooks/useAutoSave", () => ({
  suppressNextAutoSave: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("RestoreDialog", () => {
  it("renders dialog with restore and discard buttons", () => {
    const onComplete = vi.fn();
    render(<RestoreDialog onComplete={onComplete} />);
    expect(screen.getByText("編集データの復元")).toBeDefined();
    expect(screen.getByText("復元する")).toBeDefined();
    expect(screen.getByText("破棄して新規作成")).toBeDefined();
  });

  it("shows saved timestamp", () => {
    const onComplete = vi.fn();
    render(<RestoreDialog onComplete={onComplete} />);
    expect(screen.getByText(/最終保存/)).toBeDefined();
  });

  it("calls loadFromStorage and onComplete when restore is clicked", () => {
    vi.mocked(storageService.loadFromStorage).mockReturnValue({
      startMonth: "2026-04",
      endMonth: "2027-03",
      orientation: "portrait",
      weekStart: "sunday",
      weekdayFormat: "en-short",
      monthLabelFormat: "yyyy.mm",
      pageLayout: "1-month",
      manualHolidays: [],
      removedHolidays: [],
      holidayMarkStyle: "dot",
      themeId: "ocean",
      fontId: "montserrat",
      fontWeight: 400,
      useImages: true,
      images: {},
      imagePercent: 50,
      imagePosition: "top",
      monthThemeOverrides: {},
      calendarStyle: {
        monthFontSize: 48,
        dayFontSize: 14,
        weekdayFontSize: 12,
        cellPadding: 8,
        headerGap: 8,
        contentAlign: "center",
        pageMarginTop: 0,
      },
    });
    const onComplete = vi.fn();
    render(<RestoreDialog onComplete={onComplete} />);
    fireEvent.click(screen.getByText("復元する"));
    expect(storageService.loadFromStorage).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
  });

  it("calls clearStorage and onComplete when discard is clicked", () => {
    const onComplete = vi.fn();
    render(<RestoreDialog onComplete={onComplete} />);
    fireEvent.click(screen.getByText("破棄して新規作成"));
    expect(storageService.clearStorage).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
  });
});
