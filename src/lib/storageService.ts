import { STORAGE_KEYS } from "./constants";
import type {
  CalendarState,
  CalendarStyle,
  ImageCropSettings,
  MonthImage,
  PersistedCalendarSettings,
} from "@/stores/types";

interface SavedState extends PersistedCalendarSettings {
  useImages: boolean;
  images: Record<string, MonthImage>;
  calendarStyle: CalendarStyle;
  imageCropSettings?: Record<string, ImageCropSettings>;
}

interface SavedData {
  version: 1;
  savedAt: string;
  state: SavedState;
}

export function saveToStorage(state: CalendarState): { success: boolean; error?: string } {
  const data: SavedData = {
    version: 1,
    savedAt: new Date().toISOString(),
    state: {
      startMonth: state.startMonth,
      endMonth: state.endMonth,
      orientation: state.orientation,
      weekStart: state.weekStart,
      weekdayFormat: state.weekdayFormat,
      monthLabelFormat: state.monthLabelFormat,
      pageLayout: state.pageLayout,
      manualHolidays: state.manualHolidays,
      removedHolidays: state.removedHolidays,
      holidayMarkStyle: state.holidayMarkStyle,
      themeId: state.themeId,
      fontId: state.fontId,
      fontWeight: state.fontWeight,
      useImages: state.useImages,
      images: state.images,
      imagePercent: state.imagePercent,
      imagePosition: state.imagePosition,
      imageFitMode: state.imageFitMode,
      monthThemeOverrides: state.monthThemeOverrides,
      calendarStyle: state.calendarStyle,
      imageCropSettings: state.imageCropSettings,
    },
  };

  try {
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(data));
    return { success: true };
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      return { success: false, error: "保存容量を超えました。画像を減らしてお試しください。" };
    }
    return { success: false, error: "保存に失敗しました。" };
  }
}

export function loadFromStorage(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (!raw) return null;

    const data = JSON.parse(raw) as SavedData;
    if (data.version !== 1) return null;

    return data.state;
  } catch {
    return null;
  }
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.USER_SETTINGS);
}

export function hasSavedData(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (!raw) return false;

    const data = JSON.parse(raw) as SavedData;
    return data.version === 1 && data.state != null;
  } catch {
    return false;
  }
}

export function getSavedTimestamp(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (!raw) return null;

    const data = JSON.parse(raw) as SavedData;
    return data.savedAt ?? null;
  } catch {
    return null;
  }
}
