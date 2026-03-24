import { useEffect, useRef } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { saveToStorage } from "@/lib/storageService";
import type { CalendarState } from "@/stores/types";

const DEBOUNCE_MS = 1500;

let suppressFlag = false;

/** Call before restoring state to prevent auto-save from firing on the restore setState. */
export function suppressNextAutoSave(): void {
  suppressFlag = true;
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
  const prevRef = useRef<PersistedFields | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Capture current persisted fields as baseline (skip saving on initial mount)
    prevRef.current = selectPersistedFields(useCalendarStore.getState());

    const flush = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        doSave();
      }
    };

    const doSave = () => {
      const state = useCalendarStore.getState();
      const result = saveToStorage(state);
      if (result.success) {
        useCalendarStore.setState({ lastAutoSavedAt: new Date().toISOString(), saveError: null });
      } else {
        useCalendarStore.setState({ saveError: result.error ?? "保存に失敗しました。" });
      }
    };

    const unsubscribe = useCalendarStore.subscribe((state) => {
      const current = selectPersistedFields(state);

      // Check if suppress flag is set (restore operation)
      if (suppressFlag) {
        suppressFlag = false;
        prevRef.current = current;
        return;
      }

      // Skip if no persisted field changed
      if (prevRef.current && shallowEqual(prevRef.current, current)) {
        return;
      }

      prevRef.current = current;

      // Debounce
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        doSave();
      }, DEBOUNCE_MS);
    });

    // Flush pending save on page unload
    window.addEventListener("beforeunload", flush);

    return () => {
      unsubscribe();
      window.removeEventListener("beforeunload", flush);
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled]);
}
