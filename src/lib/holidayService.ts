import { CACHE_TTL_MS, STORAGE_KEYS } from "@/lib/constants";
import { FALLBACK_HOLIDAYS } from "@/lib/holidayFallback";

const API_URL = "https://holidays-jp.github.io/api/v1/date.json";

export interface HolidayFetcher {
  fetch(url: string): Promise<{ ok: boolean; json(): Promise<unknown> }>;
}

export interface HolidayCache {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

const defaultFetcher: HolidayFetcher = {
  fetch: (url: string) => globalThis.fetch(url),
};

const defaultCache: HolidayCache = {
  get: (k: string) => localStorage.getItem(k),
  set: (k: string, v: string) => localStorage.setItem(k, v),
};

export function createHolidayService(
  fetcher: HolidayFetcher = defaultFetcher,
  cache: HolidayCache = defaultCache,
) {
  return {
    async fetchHolidays(): Promise<Record<string, string>> {
      // Check cache first
      const cachedAt = cache.get(STORAGE_KEYS.HOLIDAYS_FETCHED_AT);
      const cachedData = cache.get(STORAGE_KEYS.HOLIDAYS_DATA);

      if (cachedAt && cachedData) {
        const elapsed = Date.now() - Number(cachedAt);
        if (elapsed < CACHE_TTL_MS) {
          return JSON.parse(cachedData) as Record<string, string>;
        }
      }

      // Try API fetch
      try {
        const res = await fetcher.fetch(API_URL);
        if (!res.ok) throw new Error("API request failed");

        const data = await res.json();
        if (!data || typeof data !== "object") throw new Error("Invalid response");

        const holidays = data as Record<string, string>;
        cache.set(STORAGE_KEYS.HOLIDAYS_DATA, JSON.stringify(holidays));
        cache.set(STORAGE_KEYS.HOLIDAYS_FETCHED_AT, String(Date.now()));
        return holidays;
      } catch {
        // Fallback to stale cache
        if (cachedData) {
          return JSON.parse(cachedData) as Record<string, string>;
        }
        // Fallback to hardcoded data
        return FALLBACK_HOLIDAYS;
      }
    },
  };
}
