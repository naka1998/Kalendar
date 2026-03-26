import { useCallback, useState } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { DEFAULT_IMAGE_CROP_SETTINGS } from "@/lib/constants";
import type { ContentAlign, ImageCropSettings } from "@/stores/types";

interface UseImageEditDraftResult {
  isEditing: boolean;
  editingMonthKey: string | null;
  draft: ImageCropSettings | null;
  startEdit: (monthKey: string) => void;
  updateDraft: (partial: Partial<ImageCropSettings>) => void;
  saveDraft: () => void;
  cancelEdit: () => void;
  resetDraft: (alignV: ContentAlign, alignH: ContentAlign) => void;
}

export function useImageEditDraft(): UseImageEditDraftResult {
  const [editingMonthKey, setEditingMonthKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<ImageCropSettings | null>(null);

  const imageCropSettings = useCalendarStore((s) => s.imageCropSettings);
  const setImageCropSettings = useCalendarStore((s) => s.setImageCropSettings);

  const startEdit = useCallback(
    (monthKey: string) => {
      const existing = imageCropSettings[monthKey];
      if (existing) {
        setDraft({ ...existing });
      } else {
        // Start with the full image — no-op save won't change appearance
        setDraft({ ...DEFAULT_IMAGE_CROP_SETTINGS });
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

  const resetDraft = useCallback((_alignV: ContentAlign, _alignH: ContentAlign) => {
    setDraft({ ...DEFAULT_IMAGE_CROP_SETTINGS });
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
