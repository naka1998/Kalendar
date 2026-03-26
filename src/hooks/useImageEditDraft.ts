import { useCallback, useState } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { DEFAULT_IMAGE_CROP_SETTINGS } from "@/lib/constants";
import { imageAlignToOffset } from "@/lib/cropUtils";
import type { ContentAlign, ImageCropSettings } from "@/stores/types";

interface UseImageEditDraftResult {
  isEditing: boolean;
  editingMonthKey: string | null;
  draft: ImageCropSettings | null;
  startEdit: (monthKey: string, imageAlign: ContentAlign) => void;
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
    (monthKey: string, imageAlign: ContentAlign) => {
      const existing = imageCropSettings[monthKey];
      if (existing) {
        setDraft({ ...existing });
      } else {
        setDraft({
          ...DEFAULT_IMAGE_CROP_SETTINGS,
          offsetY: imageAlignToOffset(imageAlign),
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

  const resetDraft = useCallback((imageAlign: ContentAlign) => {
    setDraft({
      ...DEFAULT_IMAGE_CROP_SETTINGS,
      offsetY: imageAlignToOffset(imageAlign),
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
