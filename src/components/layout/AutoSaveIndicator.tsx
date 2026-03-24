import { useCalendarStore } from "@/stores/calendarStore";

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function AutoSaveIndicator() {
  const lastAutoSavedAt = useCalendarStore((s) => s.lastAutoSavedAt);

  if (!lastAutoSavedAt) return null;

  return (
    <span className="text-xs text-on-surface-variant">
      自動保存済み {formatTime(lastAutoSavedAt)}
    </span>
  );
}
