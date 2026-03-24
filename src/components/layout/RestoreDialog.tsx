import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCalendarStore } from "@/stores/calendarStore";
import { loadFromStorage, clearStorage, getSavedTimestamp } from "@/lib/storageService";
import { suppressNextAutoSave } from "@/hooks/useAutoSave";

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function RestoreDialog({ onComplete }: { onComplete: () => void }) {
  const [open, setOpen] = useState(true);
  const timestamp = getSavedTimestamp();

  const handleRestore = () => {
    const loaded = loadFromStorage();
    if (loaded) {
      suppressNextAutoSave();
      useCalendarStore.setState((prev) => ({ ...prev, ...loaded }));
    }
    setOpen(false);
    onComplete();
  };

  const handleDiscard = () => {
    clearStorage();
    setOpen(false);
    onComplete();
  };

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-bold">編集データの復元</DialogTitle>
          <DialogDescription>
            前回の編集中データがあります。復元しますか？
            {timestamp && (
              <span className="mt-1 block text-xs text-on-surface-variant">
                最終保存: {formatTimestamp(timestamp)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleDiscard}>
            破棄して新規作成
          </Button>
          <Button onClick={handleRestore}>復元する</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
