import { useCallback, useState } from "react";
import { createImageProcessor, type ImageProcessor } from "@/lib/imageService";
import { useCalendarStore } from "@/stores/calendarStore";

export function useImageUpload(processor: ImageProcessor = createImageProcessor()) {
  const setImage = useCalendarStore((s) => s.setImage);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(
    async (monthKey: string, file: File) => {
      setError(null);
      setUploading(true);
      try {
        const { base64, mimeType } = await processor.resizeImage(file);
        setImage(monthKey, {
          id: `${monthKey}-${Date.now()}`,
          monthKey,
          fileName: file.name,
          base64,
          mimeType,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [setImage, processor],
  );

  return { uploadImage, uploading, error };
}
