import { useCallback, useRef, useState } from "react";
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
import { ImageEditOverlay } from "./ImageEditOverlay";
import { SafeMarginOverlay } from "./SafeMarginOverlay";
import { calcLayoutPercent, isHorizontalLayout } from "@/lib/layoutUtils";
import { calcCropRender } from "@/lib/cropUtils";
import { A4 } from "@/lib/constants";

const POSITION_CYCLE: ImagePosition[] = ["top", "right", "bottom", "left"];

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
  // Divider drag
  dividerProps?: { onPointerDown: (e: React.PointerEvent) => void };
  isDividerDragging?: boolean;
  livePercent?: number | null;
  // Position toggle
  onPositionChange?: (pos: ImagePosition) => void;
  // Print safety guide
  showSafeMargin?: boolean;
  // Image crop settings
  imageCropSettings?: ImageCropSettings;
  imageFitMode?: FitMode;
  imageAspectRatio?: number;
  // Image edit mode
  isImageEditing?: boolean;
  editDraft?: ImageCropSettings | null;
  onImageEditStart?: () => void;
  onEditUpdate?: (partial: Partial<ImageCropSettings>) => void;
  onEditSave?: () => void;
  onEditCancel?: () => void;
  onEditReset?: (imageAlign: ContentAlign) => void;
  onImageAspectRatioLoad?: (aspectRatio: number) => void;
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
  dividerProps,
  isDividerDragging = false,
  livePercent,
  onPositionChange,
  showSafeMargin,
  imageCropSettings,
  imageFitMode = "cover",
  imageAspectRatio,
  isImageEditing = false,
  editDraft,
  onImageEditStart,
  onEditUpdate,
  onEditSave,
  onEditCancel,
  onEditReset,
  onImageAspectRatioLoad,
}: CalendarPageProps) {
  const { colors } = theme;
  const pageWidth = orientation === "portrait" ? A4.PORTRAIT_WIDTH_PX : A4.LANDSCAPE_WIDTH_PX;
  const pageHeight = orientation === "portrait" ? A4.PORTRAIT_HEIGHT_PX : A4.LANDSCAPE_HEIGHT_PX;

  // Use livePercent during drag for responsiveness
  const displayPercent = livePercent ?? imagePercent;
  const { imagePercent: effectiveImagePercent, gridPercent: effectiveGridPercent } =
    calcLayoutPercent(displayPercent, !!imageBase64);
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

  const handlePositionToggle = useCallback(() => {
    if (!onPositionChange) return;
    const currentIndex = POSITION_CYCLE.indexOf(imagePosition);
    const nextIndex = (currentIndex + 1) % POSITION_CYCLE.length;
    onPositionChange(POSITION_CYCLE[nextIndex]);
  }, [imagePosition, onPositionChange]);

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

  // Content alignment: applied inside each area as justify-content,
  // not as align-items on the container (which would shrink children).
  const justifyContentClass =
    calendarStyle.contentAlign === "start"
      ? "justify-start"
      : calendarStyle.contentAlign === "end"
        ? "justify-end"
        : "justify-center";

  const imageObjectPosition =
    calendarStyle.imageAlign === "start"
      ? "top"
      : calendarStyle.imageAlign === "end"
        ? "bottom"
        : "center";

  // Determine effective crop settings: editing draft takes priority, then committed, then none
  // During editing, we show the full image (for frame placement), not the cropped result
  const committedCrop = imageCropSettings;
  const hasCrop = !!committedCrop && !isImageEditing && !!imageAspectRatio;

  // Calculate container size for edit overlay
  const containerW = horizontal ? (pageWidth * placeholderImagePercent) / 100 : pageWidth;
  const containerH = horizontal ? pageHeight : (pageHeight * placeholderImagePercent) / 100;

  // Compute crop render properties for committed (non-editing) display
  const cropRender = hasCrop
    ? calcCropRender(committedCrop, containerW, containerH, imageAspectRatio, imageFitMode)
    : null;

  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = useCallback(() => {
    if (!imageRef.current || !onImageAspectRatioLoad) return;
    const { naturalWidth, naturalHeight } = imageRef.current;
    if (naturalWidth > 0 && naturalHeight > 0) {
      onImageAspectRatioLoad(naturalWidth / naturalHeight);
    }
  }, [onImageAspectRatioLoad]);

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
          {isImageEditing ? (
            /* During editing: show full image with contain fit for crop frame placement */
            <img
              ref={imageRef}
              src={imageBase64}
              alt=""
              className="h-full w-full"
              onLoad={handleImageLoad}
              style={{ objectFit: "contain", objectPosition: "center" }}
            />
          ) : cropRender ? (
            /* Cropped display: absolute positioning to show only the crop region */
            <img
              ref={imageRef}
              data-testid="cropped-image"
              src={imageBase64}
              alt=""
              onLoad={handleImageLoad}
              style={{
                position: "absolute",
                left: `${cropRender.imgLeft}px`,
                top: `${cropRender.imgTop}px`,
                width: `${cropRender.imgWidth}px`,
                height: `${cropRender.imgHeight}px`,
              }}
            />
          ) : (
            /* Default display: no crop */
            <img
              ref={imageRef}
              src={imageBase64}
              alt=""
              className="h-full w-full"
              onLoad={handleImageLoad}
              style={{ objectFit: "contain", objectPosition: imageObjectPosition }}
            />
          )}
          {/* Edit overlay (when editing) */}
          {isImageEditing &&
            editDraft &&
            imageAspectRatio &&
            onEditUpdate &&
            onEditSave &&
            onEditCancel &&
            onEditReset && (
              <ImageEditOverlay
                draft={editDraft}
                containerW={containerW}
                containerH={containerH}
                imageAspectRatio={imageAspectRatio}
                onUpdate={onEditUpdate}
                onSave={onEditSave}
                onCancel={onEditCancel}
                onReset={onEditReset}
                imageAlign={calendarStyle.imageAlign}
              />
            )}
          {/* Hover overlay with edit/remove buttons (when not editing) */}
          {!isImageEditing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity hover:bg-black/30 hover:opacity-100">
              <div className="flex gap-2">
                {onImageEditStart && imageAspectRatio && (
                  <button
                    data-testid="image-edit-button"
                    onClick={onImageEditStart}
                    className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-on-surface shadow-sm"
                  >
                    トリミング
                  </button>
                )}
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
          )}
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

  const dividerElement = showDivider && (
    <div className="relative">
      <DividerHandle
        direction={horizontal ? "vertical" : "horizontal"}
        isDragging={isDividerDragging}
        dividerProps={dividerProps}
      />
      {/* Ratio indicator */}
      <span
        data-testid="ratio-indicator"
        className={`pointer-events-none absolute z-10 rounded bg-black/50 px-1.5 py-0.5 text-[10px] tabular-nums text-white ${
          horizontal ? "top-1 left-1/2 -translate-x-1/2" : "top-1/2 left-1 -translate-y-1/2"
        }`}
      >
        {displayPercent}:{100 - displayPercent}
      </span>
      {/* Position toggle button — shown on hover */}
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
  );

  const calendarAreaElement = (
    <div
      data-testid="calendar-area"
      className={`flex flex-col overflow-hidden px-6 py-4 ${justifyContentClass}`}
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
  );

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
        {imageAreaElement}
        {dividerElement}
        {calendarAreaElement}
      </div>
    </div>
  );
}
