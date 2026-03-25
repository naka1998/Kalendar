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
  const timestamp = getSavedTimestamp();

  const handleRestore = () => {
    const loaded = loadFromStorage();
    if (loaded) {
      suppressNextAutoSave();
      useCalendarStore.setState((prev) => ({ ...prev, ...loaded }));
    } else {
      clearStorage();
    }
    onComplete();
  };

  const handleDiscard = () => {
    clearStorage();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="pointer-events-none fixed inset-0 bg-black/10 backdrop-blur-xs"
        aria-hidden="true"
      />
      <div className="relative z-10 grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-xl bg-background p-4 text-sm ring-1 ring-foreground/10 sm:max-w-md">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-lg leading-none font-bold">編集データの復元</h2>
          <p className="text-sm text-muted-foreground">
            前回の編集中データがあります。復元しますか？
            {timestamp && (
              <span className="mt-1 block text-xs text-on-surface-variant">
                最終保存: {formatTimestamp(timestamp)}
              </span>
            )}
          </p>
        </div>
        <div className="-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={handleDiscard}>
            破棄して新規作成
          </Button>
          <Button onClick={handleRestore}>復元する</Button>
        </div>
      </div>
    </div>
  );
}
