import type {
  ColorTheme,
  DayCell,
  FontWeight,
  HolidayMarkStyle,
  ImageRatio,
  Orientation,
} from "@/stores/types";
import { CalendarGrid } from "./CalendarGrid";
import { calcImageGridRatio } from "@/lib/layoutUtils";

export interface CalendarPageProps {
  monthKey: string;
  monthLabel: string;
  grid: DayCell[][];
  weekdayHeaders: string[];
  theme: ColorTheme;
  holidayMarkStyle: HolidayMarkStyle;
  fontFamily: string;
  fontWeight: FontWeight;
  orientation: Orientation;
  imageBase64: string | null;
  imageRatio: ImageRatio;
}

export function CalendarPage({
  monthLabel,
  grid,
  weekdayHeaders,
  theme,
  holidayMarkStyle,
  fontFamily,
  fontWeight,
  orientation,
  imageBase64,
  imageRatio,
}: CalendarPageProps) {
  const { colors } = theme;
  const aspectRatio = orientation === "portrait" ? "210 / 297" : "297 / 210";
  const { imagePercent, gridPercent } = calcImageGridRatio(imageRatio, !!imageBase64);

  return (
    <div
      className="w-full overflow-hidden rounded-sm"
      style={{
        aspectRatio,
        background: colors.background,
        boxShadow: "var(--shadow-a4)",
      }}
    >
      <div className="flex h-full flex-col">
        {/* Image area */}
        {imageBase64 && imagePercent > 0 && (
          <div
            className="flex items-center justify-center overflow-hidden"
            style={{ height: `${imagePercent}%` }}
          >
            <img
              src={imageBase64}
              alt=""
              className="h-full w-full"
              style={{ objectFit: "contain" }}
            />
          </div>
        )}

        {/* Calendar grid area */}
        <div
          className="flex-1 overflow-hidden px-6 py-4"
          style={{ height: imageBase64 ? `${gridPercent}%` : undefined }}
        >
          <CalendarGrid
            grid={grid}
            weekdayHeaders={weekdayHeaders}
            monthLabel={monthLabel}
            theme={theme}
            holidayMarkStyle={holidayMarkStyle}
            fontFamily={fontFamily}
            fontWeight={fontWeight}
          />
        </div>
      </div>
    </div>
  );
}
