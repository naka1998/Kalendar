import { useCallback, useMemo } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { buildPageData } from "@/lib/buildPageData";
import { FONT_PRESETS } from "@/lib/fonts";
import { A4 } from "@/lib/constants";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useDividerDrag } from "@/hooks/useDividerDrag";
import { useImageEditDraft } from "@/hooks/useImageEditDraft";
import { useScale } from "./ScaledPage";
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
  const imagePercent = useCalendarStore((s) => s.imagePercent);
  const imagePosition = useCalendarStore((s) => s.imagePosition);
  const setImagePercent = useCalendarStore((s) => s.setImagePercent);
  const setImagePosition = useCalendarStore((s) => s.setImagePosition);
  const calendarStyle = useCalendarStore((s) => s.calendarStyle);
  const apiHolidays = useCalendarStore((s) => s.apiHolidays);
  const manualHolidays = useCalendarStore((s) => s.manualHolidays);
  const removedHolidays = useCalendarStore((s) => s.removedHolidays);
  const images = useCalendarStore((s) => s.images);
  const removeImage = useCalendarStore((s) => s.removeImage);
  const showSafeMargin = useCalendarStore((s) => s.showSafeMargin);
  const imageCropSettings = useCalendarStore((s) => s.imageCropSettings);
  const imageFitMode = useCalendarStore((s) => s.imageFitMode);
  const updateImageAspectRatio = useCalendarStore((s) => s.updateImageAspectRatio);

  const { uploadImage } = useImageUpload();
  const scale = useScale();
  const {
    isEditing,
    editingMonthKey,
    draft,
    startEdit,
    updateDraft,
    saveDraft,
    cancelEdit,
    resetDraft,
  } = useImageEditDraft();

  const isEditingThisMonth = isEditing && editingMonthKey === monthKey;

  const pageWidth = orientation === "portrait" ? A4.PORTRAIT_WIDTH_PX : A4.LANDSCAPE_WIDTH_PX;
  const pageHeight = orientation === "portrait" ? A4.PORTRAIT_HEIGHT_PX : A4.LANDSCAPE_HEIGHT_PX;

  const { dividerProps, isDragging, livePercent } = useDividerDrag({
    pageWidth,
    pageHeight,
    scale,
    currentPercent: imagePercent,
    imagePosition,
    onPercentCommit: setImagePercent,
  });

  const pageData = useMemo(
    () =>
      buildPageData(monthKey, {
        weekStart,
        weekdayFormat,
        monthLabelFormat,
        themeId,
        monthThemeOverrides,
        holidayMarkStyle,
        apiHolidays,
        manualHolidays,
        removedHolidays,
        useImages,
        images,
        imagePercent,
        imagePosition,
        imageFitMode,
        imageCropSettings,
      }),
    [
      monthKey,
      weekStart,
      weekdayFormat,
      monthLabelFormat,
      themeId,
      monthThemeOverrides,
      holidayMarkStyle,
      apiHolidays,
      manualHolidays,
      removedHolidays,
      useImages,
      images,
      imagePercent,
      imagePosition,
      imageFitMode,
      imageCropSettings,
    ],
  );

  const font = FONT_PRESETS.find((f) => f.id === fontId) ?? FONT_PRESETS[0];

  const handleImageUpload = useCallback(
    (file: File) => {
      void uploadImage(monthKey, file);
    },
    [monthKey, uploadImage],
  );

  const handleImageRemove = useCallback(() => {
    removeImage(monthKey);
  }, [monthKey, removeImage]);

  const handleImageEditStart = useCallback(() => {
    const horizontal = imagePosition === "left" || imagePosition === "right";
    const containerW = horizontal ? (pageWidth * imagePercent) / 100 : pageWidth;
    const containerH = horizontal ? pageHeight : (pageHeight * imagePercent) / 100;
    const containerAR = containerW / containerH;
    const ar = images[monthKey]?.aspectRatio ?? 1;
    startEdit(monthKey, calendarStyle.imageAlign, containerAR, ar);
  }, [
    monthKey,
    startEdit,
    calendarStyle.imageAlign,
    imagePosition,
    pageWidth,
    pageHeight,
    imagePercent,
    images,
  ]);

  const handleAspectRatioLoad = useCallback(
    (aspectRatio: number) => {
      const current = images[monthKey]?.aspectRatio;
      if (current === undefined || current === null) {
        updateImageAspectRatio(monthKey, aspectRatio);
      }
    },
    [monthKey, images, updateImageAspectRatio],
  );

  return (
    <CalendarPage
      monthKey={monthKey}
      monthLabel={pageData.monthLabel}
      grid={pageData.grid}
      weekdayHeaders={pageData.weekdayHeaders}
      theme={pageData.theme}
      holidayMarkStyle={pageData.holidayMarkStyle}
      fontFamily={font.family}
      fontWeight={fontWeight}
      orientation={orientation}
      imageBase64={pageData.imageBase64}
      imagePercent={pageData.imagePercent}
      imagePosition={pageData.imagePosition}
      calendarStyle={calendarStyle}
      onImageUpload={useImages ? handleImageUpload : undefined}
      onImageRemove={useImages ? handleImageRemove : undefined}
      dividerProps={dividerProps}
      isDividerDragging={isDragging}
      livePercent={livePercent}
      onPositionChange={setImagePosition}
      showSafeMargin={showSafeMargin}
      imageCropSettings={pageData.imageCropSettings}
      imageFitMode={imageFitMode}
      imageAspectRatio={pageData.imageAspectRatio}
      isImageEditing={isEditingThisMonth}
      editDraft={isEditingThisMonth ? draft : null}
      onImageEditStart={useImages ? handleImageEditStart : undefined}
      onEditUpdate={isEditingThisMonth ? updateDraft : undefined}
      onEditSave={isEditingThisMonth ? saveDraft : undefined}
      onEditCancel={isEditingThisMonth ? cancelEdit : undefined}
      onEditReset={isEditingThisMonth ? resetDraft : undefined}
      onImageAspectRatioLoad={handleAspectRatioLoad}
    />
  );
}
