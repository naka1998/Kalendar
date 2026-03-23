import type { ManualHoliday } from "@/stores/types";

export function mergeHolidays(
  apiHolidays: Record<string, string>,
  manualHolidays: ManualHoliday[],
  removedHolidays: string[],
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [date, name] of Object.entries(apiHolidays)) {
    if (!removedHolidays.includes(date)) {
      result[date] = name;
    }
  }

  for (const { date, name } of manualHolidays) {
    result[date] = name;
  }

  return result;
}
