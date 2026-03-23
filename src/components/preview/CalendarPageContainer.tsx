import { useCallback, useMemo } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { getMonthGrid, formatMonthLabel, getWeekdayHeaders, enrichDayCells } from "@/lib/dateUtils";
import { mergeHolidays } from "@/lib/holidayUtils";
import { resolveTheme } from "@/lib/themeUtils";
import { THEMES } from "@/lib/themes";
import { FONT_PRESETS } from "@/lib/fonts";
import { useImageUpload } from "@/hooks/useImageUpload";
import { CalendarPage } from "./CalendarPage";

export function CalendarPageContainer({ monthKey }: { monthKey: string }) {
  const weekStart = useCalendarStore((s) => s.weekStart);
  const weekdayFormat = useCalendarStore((s) => s.weekdayFormat);
  const monthLabelFormat = useCalendarStore((s) => s.monthLabelFormat);
  const orientation = useCalendarStore((s) => s.orientation);
  const themeId = useCalendarStore((s) => s.themeId);
  const monthThemeOverrides = useCalendarStore((s) => s.monthThemeOverrides);
  const holidayMarkStyle = useCalendarStore((s) => s.holidayMarkStyle);
  const fontId = useCalendarStore((s) => s.fontId);
  const fontWeight = useCalendarStore((s) => s.fontWeight);
  const useImages = useCalendarStore((s) => s.useImages);
  const imageRatio = useCalendarStore((s) => s.imageRatio);
  const calendarStyle = useCalendarStore((s) => s.calendarStyle);
  const apiHolidays = useCalendarStore((s) => s.apiHolidays);
  const manualHolidays = useCalendarStore((s) => s.manualHolidays);
  const removedHolidays = useCalendarStore((s) => s.removedHolidays);
  const images = useCalendarStore((s) => s.images);
  const removeImage = useCalendarStore((s) => s.removeImage);

  const { uploadImage } = useImageUpload();

  const theme = useMemo(
    () => resolveTheme(themeId, monthKey, monthThemeOverrides, THEMES),
    [themeId, monthKey, monthThemeOverrides],
  );

  const holidays = useMemo(
    () => mergeHolidays(apiHolidays, manualHolidays, removedHolidays),
    [apiHolidays, manualHolidays, removedHolidays],
  );

  const grid = useMemo(() => {
    const raw = getMonthGrid(monthKey, weekStart);
    return enrichDayCells(raw, holidays);
  }, [monthKey, weekStart, holidays]);

  const weekdayHeaders = useMemo(
    () => getWeekdayHeaders(weekdayFormat, weekStart),
    [weekdayFormat, weekStart],
  );

  const monthLabel = useMemo(
    () => formatMonthLabel(monthKey, monthLabelFormat),
    [monthKey, monthLabelFormat],
  );

  const font = FONT_PRESETS.find((f) => f.id === fontId) ?? FONT_PRESETS[0];
  const imageBase64 = useImages ? (images[monthKey]?.base64 ?? null) : null;

  const handleImageUpload = useCallback(
    (file: File) => {
      void uploadImage(monthKey, file);
    },
    [monthKey, uploadImage],
  );

  const handleImageRemove = useCallback(() => {
    removeImage(monthKey);
  }, [monthKey, removeImage]);

  return (
    <CalendarPage
      monthKey={monthKey}
      monthLabel={monthLabel}
      grid={grid}
      weekdayHeaders={weekdayHeaders}
      theme={theme}
      holidayMarkStyle={holidayMarkStyle}
      fontFamily={font.family}
      fontWeight={fontWeight}
      orientation={orientation}
      imageBase64={imageBase64}
      imageRatio={imageRatio}
      calendarStyle={calendarStyle}
      onImageUpload={useImages ? handleImageUpload : undefined}
      onImageRemove={useImages ? handleImageRemove : undefined}
    />
  );
}
