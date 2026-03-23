import { DownloadButton } from "@/components/download/DownloadButton";
import { HelpModal } from "./HelpModal";

export function Header() {
  return (
    <header
      className="flex h-14 items-center justify-between bg-surface px-6"
      style={{ boxShadow: "var(--shadow-elevated)" }}
    >
      <div className="flex items-baseline gap-3">
        <h1 className="font-heading text-lg font-bold text-on-surface">Ethereal Calendar</h1>
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          Editor
        </span>
      </div>

      <div className="flex items-center gap-3">
        <HelpModal />
        <DownloadButton />
      </div>
    </header>
  );
}
