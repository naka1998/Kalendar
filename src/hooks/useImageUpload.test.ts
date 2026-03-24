import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useImageUpload } from "./useImageUpload";
import { useCalendarStore } from "@/stores/calendarStore";
import { DEFAULTS, DEFAULT_CALENDAR_STYLE } from "@/lib/constants";

function resetStore() {
  useCalendarStore.setState({
    startMonth: DEFAULTS.START_MONTH,
    endMonth: DEFAULTS.END_MONTH,
    orientation: DEFAULTS.ORIENTATION,
    weekStart: DEFAULTS.WEEK_START,
    weekdayFormat: DEFAULTS.WEEKDAY_FORMAT,
    monthLabelFormat: DEFAULTS.MONTH_LABEL_FORMAT,
    pageLayout: DEFAULTS.PAGE_LAYOUT,
    apiHolidays: {},
    holidaysFetched: false,
    holidaysFetchError: null,
    manualHolidays: [],
    removedHolidays: [],
    holidayMarkStyle: DEFAULTS.HOLIDAY_MARK_STYLE,
    themeId: DEFAULTS.THEME_ID,
    fontId: DEFAULTS.FONT_ID,
    fontWeight: DEFAULTS.FONT_WEIGHT,
    useImages: true,
    images: {},
    imagePercent: DEFAULTS.IMAGE_PERCENT,
    imagePosition: DEFAULTS.IMAGE_POSITION,
    monthThemeOverrides: {},
    calendarStyle: { ...DEFAULT_CALENDAR_STYLE },
  });
}

describe("useImageUpload", () => {
  beforeEach(() => {
    resetStore();
  });

  it("returns initial state", () => {
    const processor = { resizeImage: vi.fn() };
    const { result } = renderHook(() => useImageUpload(processor));

    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.uploadImage).toBe("function");
  });

  it("uploads image and updates store", async () => {
    const processor = {
      resizeImage: vi.fn().mockResolvedValue({
        base64: "data:image/png;base64,abc",
        mimeType: "image/png",
      }),
    };

    const file = new File(["x"], "photo.png", { type: "image/png" });
    const { result } = renderHook(() => useImageUpload(processor));

    await act(async () => {
      await result.current.uploadImage("2026-04", file);
    });

    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBeNull();

    const image = useCalendarStore.getState().images["2026-04"];
    expect(image).toBeDefined();
    expect(image.base64).toBe("data:image/png;base64,abc");
    expect(image.mimeType).toBe("image/png");
    expect(image.fileName).toBe("photo.png");
    expect(image.monthKey).toBe("2026-04");
  });

  it("sets error on processor failure", async () => {
    const processor = {
      resizeImage: vi.fn().mockRejectedValue(new Error("File too large")),
    };

    const file = new File(["x"], "big.jpg", { type: "image/jpeg" });
    const { result } = renderHook(() => useImageUpload(processor));

    await act(async () => {
      await result.current.uploadImage("2026-04", file);
    });

    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBe("File too large");
    expect(useCalendarStore.getState().images["2026-04"]).toBeUndefined();
  });

  it("sets generic error for non-Error throws", async () => {
    const processor = {
      resizeImage: vi.fn().mockRejectedValue("unknown"),
    };

    const file = new File(["x"], "a.png", { type: "image/png" });
    const { result } = renderHook(() => useImageUpload(processor));

    await act(async () => {
      await result.current.uploadImage("2026-04", file);
    });

    expect(result.current.error).toBe("Upload failed");
  });

  it("clears previous error on new upload", async () => {
    const processor = {
      resizeImage: vi
        .fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValueOnce({ base64: "data:image/png;base64,ok", mimeType: "image/png" }),
    };

    const file = new File(["x"], "a.png", { type: "image/png" });
    const { result } = renderHook(() => useImageUpload(processor));

    await act(async () => {
      await result.current.uploadImage("2026-04", file);
    });
    expect(result.current.error).toBe("fail");

    await act(async () => {
      await result.current.uploadImage("2026-04", file);
    });
    expect(result.current.error).toBeNull();
  });
});
