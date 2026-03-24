import { DownloadButton } from "@/components/download/DownloadButton";
import { AutoSaveIndicator } from "./AutoSaveIndicator";
import { HelpModal } from "./HelpModal";

export function Header() {
  return (
    <header
      className="flex h-14 items-center justify-between bg-surface px-4 md:px-6"
      style={{ boxShadow: "var(--shadow-elevated)" }}
    >
      <h1 className="font-heading text-base font-bold text-on-surface md:text-lg">
        Ethereal Calendar
      </h1>

      <div className="flex items-center gap-2 md:gap-3">
        <AutoSaveIndicator />
        <HelpModal />
        <DownloadButton />
      </div>
    </header>
  );
}
