import { useEffect } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { clearStorage, saveToStorage } from "@/lib/storageService";
import type { CalendarState } from "@/stores/types";

const DEBOUNCE_MS = 1500;

let suppressFlag = false;

/** Skip the next store update when replacing the current calendar. */
export function suppressNextAutoSave(): void {
  suppressFlag = true;
}

export function resetSavedCalendar(): void {
  suppressNextAutoSave();
  useCalendarStore.getState().resetCalendar();
  suppressFlag = false;
  void clearStorage().then((result) => {
    if (!result.success) useCalendarStore.setState({ saveError: result.error });
  });
}

type PersistedFields = Pick<
  CalendarState,
  | "startMonth"
  | "endMonth"
  | "orientation"
  | "weekStart"
  | "weekdayFormat"
  | "monthLabelFormat"
  | "pageLayout"
  | "manualHolidays"
  | "removedHolidays"
  | "holidayMarkStyle"
  | "themeId"
  | "fontId"
  | "fontWeight"
  | "useImages"
  | "images"
  | "imagePercent"
  | "imagePosition"
  | "imageFitMode"
  | "imageCropSettings"
  | "monthThemeOverrides"
  | "calendarStyle"
>;

const PERSISTED_KEYS: (keyof PersistedFields)[] = [
  "startMonth",
  "endMonth",
  "orientation",
  "weekStart",
  "weekdayFormat",
  "monthLabelFormat",
  "pageLayout",
  "manualHolidays",
  "removedHolidays",
  "holidayMarkStyle",
  "themeId",
  "fontId",
  "fontWeight",
  "useImages",
  "images",
  "imagePercent",
  "imagePosition",
  "imageFitMode",
  "imageCropSettings",
  "monthThemeOverrides",
  "calendarStyle",
];

function selectPersistedFields(state: CalendarState): PersistedFields {
  const result = {} as Record<string, unknown>;
  for (const key of PERSISTED_KEYS) {
    result[key] = state[key];
  }
  return result as PersistedFields;
}

function shallowEqual(a: PersistedFields, b: PersistedFields): boolean {
  for (const key of PERSISTED_KEYS) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export function useAutoSave(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    // Capture current persisted fields as baseline (skip saving on initial mount)
    let previous = selectPersistedFields(useCalendarStore.getState());
    let timer: ReturnType<typeof setTimeout> | undefined;
    let saveAttempt = 0;

    const cancelTimer = () => {
      clearTimeout(timer);
      timer = undefined;
    };

    const flush = () => {
      if (timer !== undefined) {
        cancelTimer();
        void doSave();
      }
    };

    const doSave = async () => {
      const attempt = ++saveAttempt;
      const state = useCalendarStore.getState();
      if (state.lastAutoSavedAt) useCalendarStore.setState({ lastAutoSavedAt: null });
      const result = await saveToStorage(state);
      if (attempt !== saveAttempt) return;
      if (result.success) {
        useCalendarStore.setState({ lastAutoSavedAt: new Date().toISOString(), saveError: null });
      } else {
        useCalendarStore.setState({ saveError: result.error });
      }
    };

    const flushWhenHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };

    const unsubscribe = useCalendarStore.subscribe((state) => {
      const current = selectPersistedFields(state);

      if (suppressFlag) {
        suppressFlag = false;
        previous = current;
        saveAttempt++;
        cancelTimer();
        return;
      }

      // Skip if no persisted field changed
      if (shallowEqual(previous, current)) {
        return;
      }

      const imagesChanged = previous.images !== current.images;
      previous = current;
      cancelTimer();
      if (imagesChanged) {
        void doSave();
        return;
      }
      timer = setTimeout(flush, DEBOUNCE_MS);
    });

    document.addEventListener("visibilitychange", flushWhenHidden);
    window.addEventListener("beforeunload", flush);

    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", flushWhenHidden);
      window.removeEventListener("beforeunload", flush);
      saveAttempt++;
      cancelTimer();
    };
  }, [enabled]);
}
