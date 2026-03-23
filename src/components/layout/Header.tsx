import { DownloadButton } from "@/components/download/DownloadButton";
import { HelpModal } from "./HelpModal";

interface HeaderProps {
  onSettingsToggle?: () => void;
}

export function Header({ onSettingsToggle }: HeaderProps) {
  return (
    <header
      className="flex h-14 items-center justify-between bg-surface px-4 md:px-6"
      style={{ boxShadow: "var(--shadow-elevated)" }}
    >
      <div className="flex items-baseline gap-2 md:gap-3">
        {/* Settings button — mobile only */}
        <button
          onClick={onSettingsToggle}
          className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high md:hidden"
          aria-label="設定を開く"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

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
