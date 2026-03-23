import { useCallback, useRef, useState } from "react";
import type {
  CalendarStyle,
  ColorTheme,
  DayCell,
  FontWeight,
  HolidayMarkStyle,
  ImagePosition,
  Orientation,
} from "@/stores/types";
import { CalendarGrid } from "./CalendarGrid";
import { calcLayoutPercent, isHorizontalLayout } from "@/lib/layoutUtils";
import { A4 } from "@/lib/constants";

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
  imagePercent: number;
  imagePosition: ImagePosition;
  calendarStyle: CalendarStyle;
  onImageUpload?: (file: File) => void;
  onImageRemove?: () => void;
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
  imagePercent,
  imagePosition,
  calendarStyle,
  onImageUpload,
  onImageRemove,
}: CalendarPageProps) {
  const { colors } = theme;
  const pageWidth = orientation === "portrait" ? A4.PORTRAIT_WIDTH_PX : A4.LANDSCAPE_WIDTH_PX;
  const pageHeight = orientation === "portrait" ? A4.PORTRAIT_HEIGHT_PX : A4.LANDSCAPE_HEIGHT_PX;
  const { imagePercent: effectiveImagePercent, gridPercent: effectiveGridPercent } =
    calcLayoutPercent(imagePercent, !!imageBase64);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && onImageUpload) onImageUpload(file);
    },
    [onImageUpload],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && onImageUpload) onImageUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [onImageUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  // Show image area only when images are enabled (onImageUpload provided)
  const imagesEnabled = !!onImageUpload;
  const showImageArea = imagesEnabled && (effectiveImagePercent > 0 || !imageBase64);

  const horizontal = isHorizontalLayout(imagePosition);
  const isReversed = imagePosition === "bottom" || imagePosition === "right";
  const sizeProperty = horizontal ? "width" : "height";
  const placeholderImagePercent = imageBase64 ? effectiveImagePercent : 25;
  const placeholderGridPercent = imageBase64 ? effectiveGridPercent : 75;

  const flexDirection = horizontal
    ? isReversed
      ? ("row-reverse" as const)
      : ("row" as const)
    : isReversed
      ? ("column-reverse" as const)
      : ("column" as const);

  const imageAreaElement = showImageArea && (
    <div
      data-testid="image-area"
      className="relative flex items-center justify-center overflow-hidden"
      style={{ [sizeProperty]: `${placeholderImagePercent}%` }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {imageBase64 ? (
        <>
          <img
            src={imageBase64}
            alt=""
            className="h-full w-full"
            style={{ objectFit: "contain" }}
          />
          {/* Hover overlay with remove button */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity hover:bg-black/30 hover:opacity-100">
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-on-surface shadow-sm"
              >
                変更
              </button>
              <button
                onClick={onImageRemove}
                className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-sunday shadow-sm"
              >
                削除
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Placeholder / drop zone */
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`flex h-full w-full flex-col items-center justify-center gap-2 transition-colors ${
            isDragOver ? "bg-primary/10" : "hover:bg-black/5"
          }`}
        >
          <span className="text-2xl" style={{ color: colors.text, opacity: 0.2 }}>
            +
          </span>
          <span className="text-xs font-medium" style={{ color: colors.text, opacity: 0.3 }}>
            クリックまたはドラッグで画像を追加
          </span>
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );

  const calendarAreaElement = (
    <div
      data-testid="calendar-area"
      className="flex-1 overflow-hidden px-6 py-4"
      style={{
        [sizeProperty]: imageBase64 ? `${placeholderGridPercent}%` : undefined,
      }}
    >
      <CalendarGrid
        grid={grid}
        weekdayHeaders={weekdayHeaders}
        monthLabel={monthLabel}
        theme={theme}
        holidayMarkStyle={holidayMarkStyle}
        fontFamily={fontFamily}
        fontWeight={fontWeight}
        calendarStyle={calendarStyle}
      />
    </div>
  );

  return (
    <div
      className="overflow-hidden rounded-sm"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        background: colors.background,
        boxShadow: "var(--shadow-a4)",
      }}
    >
      <div data-testid="page-container" className="flex h-full" style={{ flexDirection }}>
        {imageAreaElement}
        {calendarAreaElement}
      </div>
    </div>
  );
}
