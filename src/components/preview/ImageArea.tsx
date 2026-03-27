import { useCallback, useRef, useState } from "react";
import type { CalendarStyle, ColorTheme } from "@/stores/types";
import type { ImageProps, ImageEditProps } from "./calendarPageTypes";
import { ImageEditOverlay } from "./ImageEditOverlay";
import { calcCropRender, isFullImageCrop } from "@/lib/cropUtils";
import {
  alignToPositionV,
  alignToPositionH,
  justifyContentClass,
  alignItemsClass,
} from "@/lib/alignmentUtils";

interface ImageAreaProps {
  image: ImageProps;
  imageEdit: ImageEditProps;
  calendarStyle: CalendarStyle;
  colors: ColorTheme["colors"];
  sizeProperty: "width" | "height";
  placeholderImagePercent: number;
  containerW: number;
  containerH: number;
  onImageUpload?: (file: File) => void;
  onImageRemove?: () => void;
  onImageAspectRatioLoad?: (aspectRatio: number) => void;
}

export function ImageArea({
  image,
  imageEdit,
  calendarStyle,
  colors,
  sizeProperty,
  placeholderImagePercent,
  containerW,
  containerH,
  onImageUpload,
  onImageRemove,
  onImageAspectRatioLoad,
}: ImageAreaProps) {
  const { imageBase64, imageFitMode = "cover", imageCropSettings, imageAspectRatio } = image;
  const {
    isImageEditing = false,
    editDraft,
    onImageEditStart,
    onEditUpdate,
    onEditSave,
    onEditCancel,
    onEditReset,
  } = imageEdit;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showImageButtons, setShowImageButtons] = useState(false);

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

  const handleImageLoad = useCallback(() => {
    if (!imageRef.current || !onImageAspectRatioLoad) return;
    const { naturalWidth, naturalHeight } = imageRef.current;
    if (naturalWidth > 0 && naturalHeight > 0) {
      onImageAspectRatioLoad(naturalWidth / naturalHeight);
    }
  }, [onImageAspectRatioLoad]);

  const imageObjectPosition = `${alignToPositionV(calendarStyle.imageAlignV)} ${alignToPositionH(calendarStyle.imageAlignH)}`;
  const imageJustifyClass = justifyContentClass(calendarStyle.imageAlignH);
  const imageAlignItemsClass = alignItemsClass(calendarStyle.imageAlignV);

  // Determine effective crop settings
  const committedCrop = imageCropSettings;
  const hasCrop =
    !!committedCrop &&
    !isImageEditing &&
    !!imageAspectRatio &&
    !isFullImageCrop(committedCrop) &&
    imageFitMode !== "none";

  const cropRender = hasCrop
    ? calcCropRender(
        committedCrop,
        containerW,
        containerH,
        imageAspectRatio,
        imageFitMode,
        calendarStyle.imageAlignH,
        calendarStyle.imageAlignV,
      )
    : null;

  return (
    <div
      data-testid="image-area"
      className={`relative flex ${imageAlignItemsClass} ${imageJustifyClass} overflow-hidden`}
      style={{ [sizeProperty]: `${placeholderImagePercent}%` }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {imageBase64 ? (
        <>
          {isImageEditing ? (
            <img
              ref={imageRef}
              src={imageBase64}
              alt=""
              className="h-full w-full"
              onLoad={handleImageLoad}
              style={{ objectFit: "contain", objectPosition: "center" }}
            />
          ) : cropRender ? (
            <img
              ref={imageRef}
              data-testid="cropped-image"
              src={imageBase64}
              alt=""
              onLoad={handleImageLoad}
              style={{
                position: "absolute",
                left: `${cropRender.imgLeftPct}%`,
                top: `${cropRender.imgTopPct}%`,
                width: `${cropRender.imgWidthPct}%`,
                height: `${cropRender.imgHeightPct}%`,
              }}
            />
          ) : imageFitMode === "fit-width" ? (
            <img
              ref={imageRef}
              src={imageBase64}
              alt=""
              className="w-full"
              onLoad={handleImageLoad}
            />
          ) : imageFitMode === "fit-height" ? (
            <img
              ref={imageRef}
              src={imageBase64}
              alt=""
              className="h-full"
              onLoad={handleImageLoad}
            />
          ) : imageFitMode === "none" ? (
            <img
              ref={imageRef}
              src={imageBase64}
              alt=""
              className="h-full w-full"
              onLoad={handleImageLoad}
              style={{ objectFit: "none", objectPosition: imageObjectPosition }}
            />
          ) : (
            <img
              ref={imageRef}
              src={imageBase64}
              alt=""
              className="h-full w-full"
              onLoad={handleImageLoad}
              style={{ objectFit: imageFitMode, objectPosition: imageObjectPosition }}
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
                imageAlignV={calendarStyle.imageAlignV}
                imageAlignH={calendarStyle.imageAlignH}
              />
            )}
          {/* Overlay with edit/remove buttons (when not editing) */}
          {!isImageEditing && (
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                showImageButtons
                  ? "bg-black/30 opacity-100"
                  : "bg-black/0 opacity-0 hover:bg-black/30 hover:opacity-100"
              }`}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowImageButtons((prev) => !prev);
                }
              }}
            >
              <div className="flex gap-3 md:gap-2">
                {onImageEditStart && imageAspectRatio && (
                  <button
                    data-testid="image-edit-button"
                    onClick={() => {
                      setShowImageButtons(false);
                      onImageEditStart();
                    }}
                    className="rounded-lg bg-white/90 px-5 py-2.5 text-sm font-medium text-on-surface shadow-sm md:px-3 md:py-1.5 md:text-xs"
                  >
                    トリミング
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowImageButtons(false);
                    fileInputRef.current?.click();
                  }}
                  className="rounded-lg bg-white/90 px-5 py-2.5 text-sm font-medium text-on-surface shadow-sm md:px-3 md:py-1.5 md:text-xs"
                >
                  変更
                </button>
                <button
                  onClick={() => {
                    setShowImageButtons(false);
                    onImageRemove?.();
                  }}
                  className="rounded-lg bg-white/90 px-5 py-2.5 text-sm font-medium text-sunday shadow-sm md:px-3 md:py-1.5 md:text-xs"
                >
                  削除
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
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
}
