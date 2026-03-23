/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi } from "vitest";
import { createHolidayService, type HolidayCache, type HolidayFetcher } from "./holidayService";
import { STORAGE_KEYS } from "@/lib/constants";
import { FALLBACK_HOLIDAYS } from "@/lib/holidayFallback";

function mockFetcher(data: Record<string, string>, ok = true): HolidayFetcher {
  return {
    fetch: vi.fn().mockResolvedValue({
      ok,
      json: () => Promise.resolve(data),
    }),
  };
}

function failingFetcher(): HolidayFetcher {
  return {
    fetch: vi.fn().mockRejectedValue(new Error("Network error")),
  };
}

function mockCache(store: Record<string, string> = {}): HolidayCache {
  return {
    get: vi.fn((key: string) => store[key] ?? null),
    set: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
  };
}

describe("createHolidayService", () => {
  it("fetches from API and caches result", async () => {
    const apiData = { "2026-01-01": "元日" };
    const fetcher = mockFetcher(apiData);
    const cache = mockCache();

    const service = createHolidayService(fetcher, cache);
    const result = await service.fetchHolidays();

    expect(result).toEqual(apiData);
    expect(fetcher.fetch).toHaveBeenCalled();
    expect(cache.set).toHaveBeenCalledWith(STORAGE_KEYS.HOLIDAYS_DATA, JSON.stringify(apiData));
    expect(cache.set).toHaveBeenCalledWith(STORAGE_KEYS.HOLIDAYS_FETCHED_AT, expect.any(String));
  });

  it("returns cached data when within TTL", async () => {
    const cachedData = { "2026-01-01": "元日" };
    const store: Record<string, string> = {
      [STORAGE_KEYS.HOLIDAYS_DATA]: JSON.stringify(cachedData),
      [STORAGE_KEYS.HOLIDAYS_FETCHED_AT]: String(Date.now()), // Fresh
    };
    const fetcher = mockFetcher({});
    const cache = mockCache(store);

    const service = createHolidayService(fetcher, cache);
    const result = await service.fetchHolidays();

    expect(result).toEqual(cachedData);
    expect(fetcher.fetch).not.toHaveBeenCalled();
  });

  it("re-fetches when cache is expired", async () => {
    const apiData = { "2026-01-01": "元日NEW" };
    const store: Record<string, string> = {
      [STORAGE_KEYS.HOLIDAYS_DATA]: JSON.stringify({ "2026-01-01": "元日OLD" }),
      [STORAGE_KEYS.HOLIDAYS_FETCHED_AT]: String(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    };
    const fetcher = mockFetcher(apiData);
    const cache = mockCache(store);

    const service = createHolidayService(fetcher, cache);
    const result = await service.fetchHolidays();

    expect(result).toEqual(apiData);
    expect(fetcher.fetch).toHaveBeenCalled();
  });

  it("falls back to stale cache on API failure", async () => {
    const cachedData = { "2026-01-01": "元日CACHED" };
    const store: Record<string, string> = {
      [STORAGE_KEYS.HOLIDAYS_DATA]: JSON.stringify(cachedData),
      [STORAGE_KEYS.HOLIDAYS_FETCHED_AT]: String(Date.now() - 8 * 24 * 60 * 60 * 1000),
    };
    const fetcher = failingFetcher();
    const cache = mockCache(store);

    const service = createHolidayService(fetcher, cache);
    const result = await service.fetchHolidays();

    expect(result).toEqual(cachedData);
  });

  it("falls back to hardcoded holidays when no cache and API fails", async () => {
    const fetcher = failingFetcher();
    const cache = mockCache();

    const service = createHolidayService(fetcher, cache);
    const result = await service.fetchHolidays();

    expect(result).toEqual(FALLBACK_HOLIDAYS);
  });

  it("falls back to hardcoded holidays when API returns invalid data", async () => {
    const fetcher: HolidayFetcher = {
      fetch: vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      }),
    };
    const cache = mockCache();

    const service = createHolidayService(fetcher, cache);
    const result = await service.fetchHolidays();

    expect(result).toEqual(FALLBACK_HOLIDAYS);
  });
});
