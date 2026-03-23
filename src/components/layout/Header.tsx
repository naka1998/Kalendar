export function Header() {
  return (
    <header className="flex h-14 items-center justify-between bg-surface px-6"
      style={{ boxShadow: "var(--shadow-elevated)" }}
    >
      <div className="flex items-baseline gap-3">
        <h1 className="font-heading text-lg font-bold text-on-surface">
          Ethereal Calendar
        </h1>
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          Editor
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
          aria-label="Help"
        >
          ?
        </button>
        <button className="rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-2 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90">
          Export HTML
        </button>
      </div>
    </header>
  );
}
