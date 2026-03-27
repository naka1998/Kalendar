import type {
  CalendarStyle,
  ColorTheme,
  ContentAlign,
  FitMode,
  FontWeight,
  HolidayMarkStyle,
  ImageCropSettings,
  ImagePosition,
  Orientation,
} from "@/stores/types";

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
