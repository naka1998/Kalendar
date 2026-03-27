import type { FitMode } from "@/stores/types";
import { ALIGN_BTN, ALIGN_ACTIVE, ALIGN_INACTIVE } from "./AlignGrid";

const FIT_MODES: { mode: FitMode; label: string }[] = [
  { mode: "contain", label: "全体を表示" },
  { mode: "cover", label: "枠いっぱいに表示" },
  { mode: "none", label: "等倍" },
  { mode: "fit-width", label: "横幅に合わせる" },
  { mode: "fit-height", label: "高さに合わせる" },
];

export function FitModeGrid({
  fitMode,
  onChange,
}: {
  fitMode: FitMode;
  onChange: (mode: FitMode) => void;
}) {
  return (
    <div className="space-y-1 rounded-lg bg-surface-container-high p-1">
      {/* Top row: contain, cover */}
      <div className="flex">
        {FIT_MODES.slice(0, 2).map(({ mode, label }) => (
          <button
            key={mode}
            data-testid={`fit-mode-${mode}`}
            onClick={() => onChange(mode)}
            className={`${ALIGN_BTN} ${fitMode === mode ? ALIGN_ACTIVE : ALIGN_INACTIVE}`}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Bottom row: none, fit-width, fit-height */}
      <div className="flex">
        {FIT_MODES.slice(2).map(({ mode, label }) => (
          <button
            key={mode}
            data-testid={`fit-mode-${mode}`}
            onClick={() => onChange(mode)}
            className={`${ALIGN_BTN} ${fitMode === mode ? ALIGN_ACTIVE : ALIGN_INACTIVE}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
