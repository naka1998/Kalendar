import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CalendarPage, type CalendarPageProps } from "./CalendarPage";
import { getMonthGrid, getWeekdayHeaders, enrichDayCells } from "@/lib/dateUtils";
import { THEMES } from "@/lib/themes";
import { DEFAULT_CALENDAR_STYLE } from "@/lib/constants";

const theme = THEMES[0];

function renderPage(overrides?: Partial<CalendarPageProps>) {
  const grid = enrichDayCells(getMonthGrid("2026-04", "sunday"), {});
  const defaults: CalendarPageProps = {
    monthKey: "2026-04",
    monthLabel: "2026.04",
    grid,
    weekdayHeaders: getWeekdayHeaders("en-short", "sunday"),
    theme,
    holidayMarkStyle: "dot",
    fontFamily: "Montserrat",
    fontWeight: 400,
    orientation: "portrait",
    imageBase64: null,
    imagePercent: 50,
    imagePosition: "top",
    calendarStyle: { ...DEFAULT_CALENDAR_STYLE },
    ...overrides,
  };
  return render(<CalendarPage {...defaults} />);
}

describe("CalendarPage", () => {
  it("renders month label", () => {
    renderPage();
    expect(screen.getByText("2026.04")).toBeDefined();
  });

  it("renders weekday headers", () => {
    renderPage();
    expect(screen.getByText("Sun")).toBeDefined();
    expect(screen.getByText("Sat")).toBeDefined();
  });

  it("renders page container with correct test id", () => {
    renderPage();
    expect(screen.getByTestId("page-container")).toBeDefined();
  });

  it("renders calendar area", () => {
    renderPage();
    expect(screen.getByTestId("calendar-area")).toBeDefined();
  });

  it("does not show image area when onImageUpload is not provided", () => {
    renderPage({ imageBase64: null, onImageUpload: undefined });
    expect(screen.queryByTestId("image-area")).toBeNull();
  });

  it("shows image area placeholder when onImageUpload is provided", () => {
    renderPage({ onImageUpload: vi.fn() });
    expect(screen.getByTestId("image-area")).toBeDefined();
    expect(screen.getByText("クリックまたはドラッグで画像を追加")).toBeDefined();
  });

  it("renders image when imageBase64 is provided", () => {
    renderPage({
      imageBase64: "data:image/jpeg;base64,abc",
      onImageUpload: vi.fn(),
    });
    const img = screen.getByTestId("image-area").querySelector("img");
    expect(img).toBeTruthy();
    expect(img!.getAttribute("src")).toBe("data:image/jpeg;base64,abc");
  });

  it("shows divider handle when image is present and dividerProps provided", () => {
    renderPage({
      imageBase64: "data:image/jpeg;base64,abc",
      onImageUpload: vi.fn(),
      dividerProps: { onPointerDown: vi.fn() },
    });
    expect(screen.getByTestId("divider-handle")).toBeDefined();
  });

  it("shows ratio indicator with displayPercent", () => {
    renderPage({
      imageBase64: "data:image/jpeg;base64,abc",
      onImageUpload: vi.fn(),
      dividerProps: { onPointerDown: vi.fn() },
      imagePercent: 60,
    });
    expect(screen.getByTestId("ratio-indicator").textContent).toBe("60:40");
  });

  it("uses livePercent for ratio display during drag", () => {
    renderPage({
      imageBase64: "data:image/jpeg;base64,abc",
      onImageUpload: vi.fn(),
      dividerProps: { onPointerDown: vi.fn() },
      imagePercent: 50,
      livePercent: 70,
    });
    expect(screen.getByTestId("ratio-indicator").textContent).toBe("70:30");
  });

  it("shows position toggle button when onPositionChange is provided", () => {
    renderPage({
      imageBase64: "data:image/jpeg;base64,abc",
      onImageUpload: vi.fn(),
      dividerProps: { onPointerDown: vi.fn() },
      onPositionChange: vi.fn(),
    });
    expect(screen.getByTestId("position-toggle")).toBeDefined();
  });

  it("cycles position on toggle click", () => {
    const onPositionChange = vi.fn();
    renderPage({
      imageBase64: "data:image/jpeg;base64,abc",
      onImageUpload: vi.fn(),
      dividerProps: { onPointerDown: vi.fn() },
      imagePosition: "top",
      onPositionChange,
    });
    fireEvent.click(screen.getByTestId("position-toggle"));
    expect(onPositionChange).toHaveBeenCalledWith("right");
  });

  it("wraps position cycle from left back to top", () => {
    const onPositionChange = vi.fn();
    renderPage({
      imageBase64: "data:image/jpeg;base64,abc",
      onImageUpload: vi.fn(),
      dividerProps: { onPointerDown: vi.fn() },
      imagePosition: "left",
      onPositionChange,
    });
    fireEvent.click(screen.getByTestId("position-toggle"));
    expect(onPositionChange).toHaveBeenCalledWith("top");
  });

  it("calls onImageRemove when delete button is clicked", () => {
    const onImageRemove = vi.fn();
    renderPage({
      imageBase64: "data:image/jpeg;base64,abc",
      onImageUpload: vi.fn(),
      onImageRemove,
    });
    fireEvent.click(screen.getByText("削除"));
    expect(onImageRemove).toHaveBeenCalled();
  });

  it("calls onImageUpload on file drop", () => {
    const onImageUpload = vi.fn();
    renderPage({ onImageUpload });
    const imageArea = screen.getByTestId("image-area");

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    fireEvent.drop(imageArea, {
      dataTransfer: { files: [file] },
    });
    expect(onImageUpload).toHaveBeenCalledWith(file);
  });

  it("renders landscape dimensions", () => {
    const { container } = renderPage({ orientation: "landscape" });
    const page = container.firstElementChild as HTMLElement;
    expect(page.style.width).toBe("1123px");
    expect(page.style.height).toBe("794px");
  });

  it("applies page margin top from calendarStyle", () => {
    renderPage({ calendarStyle: { ...DEFAULT_CALENDAR_STYLE, pageMarginTop: 40 } });
    const pageContainer = screen.getByTestId("page-container");
    expect(pageContainer.style.paddingTop).toBe("40px");
  });

  it("applies justify-center for center content alignment", () => {
    renderPage({ calendarStyle: { ...DEFAULT_CALENDAR_STYLE, contentAlign: "center" } });
    const calendarArea = screen.getByTestId("calendar-area");
    expect(calendarArea.className).toContain("justify-center");
  });

  it("applies justify-start for start content alignment", () => {
    renderPage({ calendarStyle: { ...DEFAULT_CALENDAR_STYLE, contentAlign: "start" } });
    const calendarArea = screen.getByTestId("calendar-area");
    expect(calendarArea.className).toContain("justify-start");
  });

  it("applies justify-end for end content alignment", () => {
    renderPage({ calendarStyle: { ...DEFAULT_CALENDAR_STYLE, contentAlign: "end" } });
    const calendarArea = screen.getByTestId("calendar-area");
    expect(calendarArea.className).toContain("justify-end");
  });

  it("renders column-reverse flex for bottom image position", () => {
    renderPage({
      imageBase64: "data:image/jpeg;base64,abc",
      onImageUpload: vi.fn(),
      imagePosition: "bottom",
    });
    const pageContainer = screen.getByTestId("page-container");
    expect(pageContainer.style.flexDirection).toBe("column-reverse");
  });

  it("renders row flex for left image position", () => {
    renderPage({
      imageBase64: "data:image/jpeg;base64,abc",
      onImageUpload: vi.fn(),
      imagePosition: "left",
    });
    const pageContainer = screen.getByTestId("page-container");
    expect(pageContainer.style.flexDirection).toBe("row");
  });

  it("renders row-reverse flex for right image position", () => {
    renderPage({
      imageBase64: "data:image/jpeg;base64,abc",
      onImageUpload: vi.fn(),
      imagePosition: "right",
    });
    const pageContainer = screen.getByTestId("page-container");
    expect(pageContainer.style.flexDirection).toBe("row-reverse");
  });

  it("adds select-none class when divider is dragging", () => {
    renderPage({
      imageBase64: "data:image/jpeg;base64,abc",
      onImageUpload: vi.fn(),
      dividerProps: { onPointerDown: vi.fn() },
      isDividerDragging: true,
    });
    const pageContainer = screen.getByTestId("page-container");
    expect(pageContainer.className).toContain("select-none");
  });

  it("sets drag over state on dragOver", () => {
    renderPage({ onImageUpload: vi.fn() });
    const imageArea = screen.getByTestId("image-area");
    fireEvent.dragOver(imageArea);
    // The placeholder button should have bg-primary/10 class when dragging over
    const placeholder = imageArea.querySelector("button")!;
    expect(placeholder.className).toContain("bg-primary/10");
  });

  it("clears drag over state on dragLeave", () => {
    renderPage({ onImageUpload: vi.fn() });
    const imageArea = screen.getByTestId("image-area");
    fireEvent.dragOver(imageArea);
    fireEvent.dragLeave(imageArea);
    const placeholder = imageArea.querySelector("button")!;
    expect(placeholder.className).not.toContain("bg-primary/10");
  });

  it("renders SafeMarginOverlay when showSafeMargin is true", () => {
    renderPage({ showSafeMargin: true });
    expect(screen.getByTestId("safe-margin-overlay")).toBeDefined();
    expect(screen.getByText("印刷安全マージン (5mm)")).toBeDefined();
  });

  it("does not render SafeMarginOverlay when showSafeMargin is false", () => {
    renderPage({ showSafeMargin: false });
    expect(screen.queryByTestId("safe-margin-overlay")).toBeNull();
  });
});
