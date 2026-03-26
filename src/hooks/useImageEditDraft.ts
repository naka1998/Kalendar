import { useCallback, useState } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { DEFAULT_IMAGE_CROP_SETTINGS } from "@/lib/constants";
import { calcInitialCropRect } from "@/lib/cropUtils";
import type { ContentAlign, ImageCropSettings } from "@/stores/types";

interface UseImageEditDraftResult {
  isEditing: boolean;
  editingMonthKey: string | null;
  draft: ImageCropSettings | null;
  startEdit: (
    monthKey: string,
    imageAlign: ContentAlign,
    containerAR: number,
    imageAspectRatio: number,
  ) => void;
  updateDraft: (partial: Partial<ImageCropSettings>) => void;
  saveDraft: () => void;
  cancelEdit: () => void;
  resetDraft: (imageAlign: ContentAlign) => void;
}

export function useImageEditDraft(): UseImageEditDraftResult {
  const [editingMonthKey, setEditingMonthKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<ImageCropSettings | null>(null);

  const imageCropSettings = useCalendarStore((s) => s.imageCropSettings);
  const setImageCropSettings = useCalendarStore((s) => s.setImageCropSettings);

  const startEdit = useCallback(
    (
      monthKey: string,
      _imageAlign: ContentAlign,
      containerAR: number,
      imageAspectRatio: number,
    ) => {
      const existing = imageCropSettings[monthKey];
      if (existing) {
        setDraft({ ...existing });
      } else {
        const rect = calcInitialCropRect(containerAR, imageAspectRatio);
        setDraft({
          ...DEFAULT_IMAGE_CROP_SETTINGS,
          ...rect,
        });
      }
      setEditingMonthKey(monthKey);
    },
    [imageCropSettings],
  );

  const updateDraft = useCallback((partial: Partial<ImageCropSettings>) => {
    setDraft((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const saveDraft = useCallback(() => {
    if (editingMonthKey && draft) {
      setImageCropSettings(editingMonthKey, draft);
    }
    setEditingMonthKey(null);
    setDraft(null);
  }, [editingMonthKey, draft, setImageCropSettings]);

  const cancelEdit = useCallback(() => {
    setEditingMonthKey(null);
    setDraft(null);
  }, []);

  const resetDraft = useCallback((_imageAlign: ContentAlign) => {
    setDraft({
      ...DEFAULT_IMAGE_CROP_SETTINGS,
    });
  }, []);

  return {
    isEditing: editingMonthKey !== null,
    editingMonthKey,
    draft,
    startEdit,
    updateDraft,
    saveDraft,
    cancelEdit,
    resetDraft,
  };
}
