import { DownloadButton } from "@/components/download/DownloadButton";
import { HelpModal } from "./HelpModal";

export function Header() {
  return (
    <header
      className="flex h-14 items-center justify-between bg-surface px-4 md:px-6"
      style={{ boxShadow: "var(--shadow-elevated)" }}
    >
      <div className="flex items-baseline gap-2 md:gap-3">
        <h1 className="font-heading text-base font-bold text-on-surface md:text-lg">
          Ethereal Calendar
        </h1>
        <span className="hidden text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant md:inline">
          エディタ
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <HelpModal />
        <DownloadButton />
      </div>
    </header>
  );
}
