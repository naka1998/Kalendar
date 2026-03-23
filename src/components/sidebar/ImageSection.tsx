import { useCallback, useMemo, useRef } from "react";
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

export function ImageSection() {
  const startMonth = useCalendarStore((s) => s.startMonth);
  const endMonth = useCalendarStore((s) => s.endMonth);
  const monthLabelFormat = useCalendarStore((s) => s.monthLabelFormat);
  const images = useCalendarStore((s) => s.images);
  const removeImage = useCalendarStore((s) => s.removeImage);

  const months = useMemo(() => generateMonthRange(startMonth, endMonth), [startMonth, endMonth]);
  const selectedMonth = useCalendarStore((s) => s.startMonth); // Default to first month
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading, error } = useImageUpload();

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && selectedMonth) {
        void uploadImage(selectedMonth, file);
      }
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [selectedMonth, uploadImage],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, monthKey: string) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        void uploadImage(monthKey, file);
      }
    },
    [uploadImage],
  );

  return (
    <div className="space-y-4">
      {/* Month image assignment overview */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          画像の割り当て
        </Label>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {months.map((m) => {
            const img = images[m];
            return (
              <div
                key={m}
                className="flex items-center gap-2 rounded-md bg-surface-container-high p-2"
                onDragOver={(e) => e.preventDefault()}
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
                    <div className="flex h-full w-full items-center justify-center text-[8px] text-on-surface-variant">
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
                    className="text-[10px] text-on-surface-variant hover:text-sunday"
                  >
                    ×
                  </button>
                ) : (
                  <label className="cursor-pointer text-[10px] text-primary hover:underline">
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
        <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
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
