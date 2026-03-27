import type {
  CalendarStyle,
  ColorTheme,
  ContentAlign,
  DayCell,
  FitMode,
  FontWeight,
  HolidayMarkStyle,
  ImageCropSettings,
  ImagePosition,
  Orientation,
} from "@/stores/types";
import { CalendarGrid } from "./CalendarGrid";
import { DividerHandle } from "./DividerHandle";
import { ImageArea } from "./ImageArea";
import { SafeMarginOverlay } from "./SafeMarginOverlay";
import { calcLayoutPercent, isHorizontalLayout } from "@/lib/layoutUtils";
import { A4 } from "@/lib/constants";
import { justifyContentClass, alignItemsClass } from "@/lib/alignmentUtils";
import { useCallback } from "react";

const POSITION_CYCLE: ImagePosition[] = ["top", "right", "bottom", "left"];

export interface ImageProps {
  imageBase64: string | null;
  imagePercent: number;
  imagePosition: ImagePosition;
  imageFitMode?: FitMode;
  imageCropSettings?: ImageCropSettings;
  imageAspectRatio?: number;
}

export interface ImageEditProps {
  isImageEditing?: boolean;
  editDraft?: ImageCropSettings | null;
  onImageEditStart?: () => void;
  onEditUpdate?: (partial: Partial<ImageCropSettings>) => void;
  onEditSave?: () => void;
  onEditCancel?: () => void;
  onEditReset?: (alignV: ContentAlign, alignH: ContentAlign) => void;
}

export interface CalendarStyleProps {
  theme: ColorTheme;
  fontFamily: string;
  fontWeight: FontWeight;
  orientation: Orientation;
  holidayMarkStyle: HolidayMarkStyle;
  calendarStyle: CalendarStyle;
}

export interface CalendarPageProps {
  monthKey: string;
  monthLabel: string;
  grid: DayCell[][];
  weekdayHeaders: string[];
  image: ImageProps;
  imageEdit: ImageEditProps;
  style: CalendarStyleProps;
  onImageUpload?: (file: File) => void;
  onImageRemove?: () => void;
  // Divider drag
  dividerProps?: { onPointerDown: (e: React.PointerEvent) => void };
  isDividerDragging?: boolean;
  livePercent?: number | null;
  // Position toggle
  onPositionChange?: (pos: ImagePosition) => void;
  // Print safety guide
  showSafeMargin?: boolean;
  onImageAspectRatioLoad?: (aspectRatio: number) => void;
}

export function CalendarPage({
  monthLabel,
  grid,
  weekdayHeaders,
  image,
  imageEdit,
  style,
  onImageUpload,
  onImageRemove,
  dividerProps,
  isDividerDragging = false,
  livePercent,
  onPositionChange,
  showSafeMargin,
  onImageAspectRatioLoad,
}: CalendarPageProps) {
  const { theme, fontFamily, fontWeight, orientation, holidayMarkStyle, calendarStyle } = style;
  const { imageBase64, imagePercent, imagePosition } = image;

  const { colors } = theme;
  const pageWidth = orientation === "portrait" ? A4.PORTRAIT_WIDTH_PX : A4.LANDSCAPE_WIDTH_PX;
  const pageHeight = orientation === "portrait" ? A4.PORTRAIT_HEIGHT_PX : A4.LANDSCAPE_HEIGHT_PX;

  // Use livePercent during drag for responsiveness
  const displayPercent = livePercent ?? imagePercent;
  const { imagePercent: effectiveImagePercent, gridPercent: effectiveGridPercent } =
    calcLayoutPercent(displayPercent, !!imageBase64);

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

  const showDivider = showImageArea && !!imageBase64 && !!dividerProps;

  // Content alignment
  const contentJustifyClass = justifyContentClass(calendarStyle.contentAlignV);
  const contentAlignItemsClass = alignItemsClass(calendarStyle.contentAlignH);

  // Calculate container size for edit overlay
  const containerW = horizontal ? (pageWidth * placeholderImagePercent) / 100 : pageWidth;
  const containerH = horizontal ? pageHeight : (pageHeight * placeholderImagePercent) / 100;

  const handlePositionToggle = useCallback(() => {
    if (!onPositionChange) return;
    const currentIndex = POSITION_CYCLE.indexOf(imagePosition);
    const nextIndex = (currentIndex + 1) % POSITION_CYCLE.length;
    onPositionChange(POSITION_CYCLE[nextIndex]);
  }, [imagePosition, onPositionChange]);

  return (
    <div
      className="group/page relative overflow-hidden rounded-sm"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        background: colors.background,
        boxShadow: "var(--shadow-a4)",
      }}
    >
      {showSafeMargin && <SafeMarginOverlay />}
      <div
        data-testid="page-container"
        className={`flex h-full ${isDividerDragging ? "select-none" : ""}`}
        style={{
          flexDirection,
          paddingTop:
            calendarStyle.pageMarginTop > 0 ? `${calendarStyle.pageMarginTop}px` : undefined,
        }}
      >
        {showImageArea && (
          <ImageArea
            image={image}
            imageEdit={imageEdit}
            calendarStyle={calendarStyle}
            colors={colors}
            sizeProperty={sizeProperty}
            placeholderImagePercent={placeholderImagePercent}
            containerW={containerW}
            containerH={containerH}
            onImageUpload={onImageUpload}
            onImageRemove={onImageRemove}
            onImageAspectRatioLoad={onImageAspectRatioLoad}
          />
        )}
        {showDivider && (
          <div className="relative">
            <DividerHandle
              direction={horizontal ? "vertical" : "horizontal"}
              isDragging={isDividerDragging}
              dividerProps={dividerProps}
            />
            <span
              data-testid="ratio-indicator"
              className={`pointer-events-none absolute z-10 rounded bg-black/50 px-1.5 py-0.5 text-[10px] tabular-nums text-white ${
                horizontal ? "top-1 left-1/2 -translate-x-1/2" : "top-1/2 left-1 -translate-y-1/2"
              }`}
            >
              {displayPercent}:{100 - displayPercent}
            </span>
            {onPositionChange && (
              <button
                data-testid="position-toggle"
                onClick={handlePositionToggle}
                className="absolute top-1/2 right-1 z-20 -translate-y-1/2 rounded-full bg-surface/80 p-1 text-on-surface-variant opacity-0 shadow-sm transition-opacity hover:bg-surface hover:text-on-surface group-hover/page:opacity-100"
                title="配置を変更"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div
          data-testid="calendar-area"
          className={`flex flex-col overflow-hidden px-6 py-4 ${contentJustifyClass} ${contentAlignItemsClass}`}
          style={{
            flex: 1,
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
      </div>
    </div>
  );
}
