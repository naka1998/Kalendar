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

interface SavedData<T = SavedState> {
  version: 1;
  savedAt: string;
  state: T;
}

type StoredSettings = SavedData<Omit<SavedState, "images">>;
type StoredImage = [string, MonthImage];
type SaveResult = { success: true } | { success: false; error: string };

const DATABASE = "kalendar";
const SETTINGS_STORE = "settings";
const IMAGES_STORE = "images";

let databasePromise: Promise<IDBDatabase> | undefined;

function openDatabase(): Promise<IDBDatabase> {
  databasePromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(SETTINGS_STORE);
      request.result.createObjectStore(IMAGES_STORE);
    };
    request.onsuccess = () => {
      const database = request.result;
      database.onclose = () => {
        databasePromise = undefined;
      };
      database.onversionchange = () => {
        database.close();
        databasePromise = undefined;
      };
      resolve(database);
    };
    request.onerror = () => reject(request.error);
  }).catch((error: unknown) => {
    databasePromise = undefined;
    throw error;
  });
  return databasePromise;
}

async function inTransaction<T>(
  mode: IDBTransactionMode,
  work: (transaction: IDBTransaction) => () => T,
): Promise<T> {
  const database = await openDatabase();
  const transaction = database.transaction([SETTINGS_STORE, IMAGES_STORE], mode);
  return new Promise((resolve, reject) => {
    transaction.onabort = () => reject(transaction.error);
    try {
      const readResult = work(transaction);
      transaction.oncomplete = () => resolve(readResult());
      if (mode === "readwrite") transaction.commit?.();
    } catch (error) {
      transaction.abort();
      reject(error);
    }
  });
}

export async function saveToStorage(state: CalendarState): Promise<SaveResult> {
  const data: StoredSettings = {
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
      imagePercent: state.imagePercent,
      imagePosition: state.imagePosition,
      imageFitMode: state.imageFitMode,
      monthThemeOverrides: state.monthThemeOverrides,
      calendarStyle: state.calendarStyle,
      imageCropSettings: state.imageCropSettings,
    },
  };

  try {
    await inTransaction("readwrite", (transaction) => {
      transaction.objectStore(SETTINGS_STORE).put(data, STORAGE_KEYS.USER_SETTINGS);
      const images = transaction.objectStore(IMAGES_STORE);
      images.clear();
      for (const entry of Object.entries(state.images)) {
        images.put(entry, entry[0]);
      }
      return () => undefined;
    });
    removeLegacyData();
    return { success: true };
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      return { success: false, error: "保存容量を超えました。画像を減らしてお試しください。" };
    }
    return { success: false, error: "保存に失敗しました。" };
  }
}

function readLegacyData(): SavedData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    const data = raw ? (JSON.parse(raw) as SavedData) : null;
    return data?.version === 1 && data.state ? data : null;
  } catch {
    return null;
  }
}

function removeLegacyData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_SETTINGS);
  } catch {
    // IndexedDB can still be available when localStorage is blocked.
  }
}

export async function loadFromStorage(): Promise<SavedState | null> {
  let data: SavedData | null;
  try {
    data = await inTransaction("readonly", (transaction) => {
      const settings = transaction.objectStore(SETTINGS_STORE).get(STORAGE_KEYS.USER_SETTINGS);
      const images = transaction.objectStore(IMAGES_STORE).getAll();
      return () => {
        const stored = settings.result as StoredSettings | undefined;
        return stored?.version === 1
          ? {
              ...stored,
              state: {
                ...stored.state,
                images: Object.fromEntries(images.result as StoredImage[]),
              },
            }
          : readLegacyData();
      };
    });
  } catch (error) {
    data = readLegacyData();
    if (!data) throw error;
  }
  if (!data) return null;

  // Backward compatibility: migrate old contentAlign/imageAlign to V/H variants
  if (data.state.calendarStyle) {
    const style = data.state.calendarStyle as unknown as Record<string, unknown>;
    if ("contentAlign" in style && !("contentAlignV" in style)) {
      style.contentAlignV = style.contentAlign;
      style.contentAlignH = "center";
      delete style.contentAlign;
    }
    if ("imageAlign" in style && !("imageAlignV" in style)) {
      style.imageAlignV = style.imageAlign;
      style.imageAlignH = "center";
      delete style.imageAlign;
    }
    if (!("gridWidth" in style)) {
      style.gridWidth = 100;
    }
  }

  return data.state;
}

export async function clearStorage(): Promise<SaveResult> {
  try {
    await inTransaction("readwrite", (transaction) => {
      transaction.objectStore(SETTINGS_STORE).clear();
      transaction.objectStore(IMAGES_STORE).clear();
      return () => undefined;
    });
    removeLegacyData();
    return { success: true };
  } catch {
    return { success: false, error: "保存データの削除に失敗しました。" };
  }
}

async function readSavedSettings(): Promise<StoredSettings | null> {
  try {
    const data = await inTransaction("readonly", (transaction) => {
      const settings = transaction.objectStore(SETTINGS_STORE).get(STORAGE_KEYS.USER_SETTINGS);
      return () => settings.result as StoredSettings | undefined;
    });
    return data?.version === 1 ? data : readLegacyData();
  } catch {
    return readLegacyData();
  }
}

export async function hasSavedData(): Promise<boolean> {
  return (await readSavedSettings()) !== null;
}

export async function getSavedTimestamp(): Promise<string | null> {
  return (await readSavedSettings())?.savedAt ?? null;
}
