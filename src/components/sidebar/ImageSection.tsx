import { useCallback, useMemo, useRef, useState } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { useImageUpload } from "@/hooks/useImageUpload";
import { generateMonthRange, formatMonthLabel } from "@/lib/dateUtils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const DRAG_MIME = "text/x-month-key";

export function ImageSection() {
  const startMonth = useCalendarStore((s) => s.startMonth);
  const endMonth = useCalendarStore((s) => s.endMonth);
  const monthLabelFormat = useCalendarStore((s) => s.monthLabelFormat);
  const images = useCalendarStore((s) => s.images);
  const removeImage = useCalendarStore((s) => s.removeImage);
  const swapImages = useCalendarStore((s) => s.swapImages);

  const months = useMemo(() => generateMonthRange(startMonth, endMonth), [startMonth, endMonth]);
  const selectedMonth = useCalendarStore((s) => s.startMonth);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading, error } = useImageUpload();

  const [draggingMonth, setDraggingMonth] = useState<string | null>(null);
  const [dragOverMonth, setDragOverMonth] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && selectedMonth) {
        void uploadImage(selectedMonth, file);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [selectedMonth, uploadImage],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, monthKey: string) => {
      e.preventDefault();
      setDragOverMonth(null);

      // Check if this is a month-to-month image move
      const sourceMonth = e.dataTransfer.getData(DRAG_MIME);
      if (sourceMonth && sourceMonth !== monthKey) {
        swapImages(sourceMonth, monthKey);
        return;
      }

      // Otherwise, handle as file upload
      const file = e.dataTransfer.files[0];
      if (file) {
        void uploadImage(monthKey, file);
      }
    },
    [uploadImage, swapImages],
  );

  const handleDragStart = useCallback((e: React.DragEvent, monthKey: string) => {
    e.dataTransfer.setData(DRAG_MIME, monthKey);
    e.dataTransfer.effectAllowed = "move";
    setDraggingMonth(monthKey);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingMonth(null);
    setDragOverMonth(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, monthKey: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (monthKey !== draggingMonth) {
        setDragOverMonth(monthKey);
      }
    },
    [draggingMonth],
  );

  const handleDragLeave = useCallback(() => {
    setDragOverMonth(null);
  }, []);

  return (
    <div className="space-y-4">
      {/* Month image assignment overview */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          画像の割り当て
        </Label>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {months.map((m) => {
            const img = images[m];
            const isDragSource = draggingMonth === m;
            const isDragTarget = dragOverMonth === m && draggingMonth !== m;
            return (
              <div
                key={m}
                className={`flex items-center gap-2 rounded-md p-2 transition-all ${
                  isDragTarget ? "bg-primary/10 ring-2 ring-primary" : "bg-surface-container-high"
                } ${isDragSource ? "opacity-40" : ""}`}
                draggable={!!img}
                onDragStart={img ? (e) => handleDragStart(e, m) : undefined}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, m)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, m)}
              >
                {/* Thumbnail or placeholder */}
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-surface-container">
                  {img ? (
                    <img
                      src={img.base64}
                      alt={img.fileName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-on-surface-variant">
                      —
                    </div>
                  )}
                </div>

                {/* Month label */}
                <span className="flex-1 text-xs text-on-surface">
                  {formatMonthLabel(m, monthLabelFormat)}
                </span>

                {/* Actions */}
                {img ? (
                  <button
                    onClick={() => removeImage(m)}
                    className="text-xs text-on-surface-variant hover:text-sunday"
                  >
                    ×
                  </button>
                ) : (
                  <label className="cursor-pointer text-xs text-primary hover:underline">
                    追加
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadImage(m, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bulk upload */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          アップロード
        </Label>
        <div className="space-y-2">
          <Select
            value={selectedMonth}
            onValueChange={() => {
              // selectedMonth is derived, no setter needed for now
            }}
          >
            <SelectTrigger className="border-none bg-surface-container-high text-sm focus:bg-surface">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m}>
                  {formatMonthLabel(m, monthLabelFormat)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? "アップロード中..." : "ファイルを選択"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Error display */}
      {error && <p className="text-xs text-sunday">{error}</p>}
    </div>
  );
}
