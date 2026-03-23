import { useCallback, useRef, useState } from "react";
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
  imageRatio,
  onImageUpload,
  onImageRemove,
}: CalendarPageProps) {
  const { colors } = theme;
  const aspectRatio = orientation === "portrait" ? "210 / 297" : "297 / 210";
  const { imagePercent, gridPercent } = calcImageGridRatio(imageRatio, !!imageBase64);
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
  const showImageArea = imagesEnabled && (imagePercent > 0 || !imageBase64);
  const effectiveImagePercent = imageBase64 ? imagePercent : 40;
  const effectiveGridPercent = imageBase64 ? gridPercent : 60;

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
        {/* Image area — always visible for interaction */}
        {showImageArea && (
          <div
            className="relative flex items-center justify-center overflow-hidden"
            style={{ height: `${effectiveImagePercent}%` }}
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
        )}

        {/* Calendar grid area */}
        <div
          className="flex-1 overflow-hidden px-6 py-4"
          style={{ height: imageBase64 ? `${effectiveGridPercent}%` : undefined }}
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
