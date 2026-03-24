import { useCalendarStore } from "@/stores/calendarStore";

export function SaveErrorBanner() {
  const saveError = useCalendarStore((s) => s.saveError);

  if (!saveError) return null;

  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-2 bg-destructive/10 px-4 py-2 text-sm text-destructive"
    >
      <span>{saveError}</span>
      <button
        onClick={() => useCalendarStore.setState({ saveError: null })}
        className="shrink-0 rounded px-2 py-0.5 text-xs font-medium hover:bg-destructive/10"
        aria-label="閉じる"
      >
        &times;
      </button>
    </div>
  );
}
