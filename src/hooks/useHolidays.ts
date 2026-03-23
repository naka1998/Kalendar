import { useEffect } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { createHolidayService } from "@/lib/holidayService";

export function useHolidays(service = createHolidayService()) {
  const holidaysFetched = useCalendarStore((s) => s.holidaysFetched);
  const setApiHolidays = useCalendarStore((s) => s.setApiHolidays);
  const setHolidayFetchError = useCalendarStore((s) => s.setHolidayFetchError);

  useEffect(() => {
    if (holidaysFetched) return;

    service
      .fetchHolidays()
      .then(setApiHolidays)
      .catch((e: Error) => setHolidayFetchError(e.message));
  }, [holidaysFetched, service, setApiHolidays, setHolidayFetchError]);
}
