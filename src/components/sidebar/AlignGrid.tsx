import type { ContentAlign } from "@/stores/types";

export const ALIGN_BTN = "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all";
export const ALIGN_ACTIVE = "bg-surface text-on-surface shadow-sm";
export const ALIGN_INACTIVE = "text-on-surface-variant hover:text-on-surface";

export function AlignGrid({
  alignV,
  alignH,
  onChangeV,
  onChangeH,
}: {
  alignV: ContentAlign;
  alignH: ContentAlign;
  onChangeV: (v: ContentAlign) => void;
  onChangeH: (h: ContentAlign) => void;
}) {
  return (
    <div className="space-y-1 rounded-lg bg-surface-container-high p-1">
      {/* Vertical row */}
      <div className="flex">
        {(["start", "center", "end"] as ContentAlign[]).map((a) => {
          const label = a === "start" ? "上揃え" : a === "center" ? "中央" : "下揃え";
          return (
            <button
              key={`v-${a}`}
              onClick={() => onChangeV(a)}
              className={`${ALIGN_BTN} ${alignV === a ? ALIGN_ACTIVE : ALIGN_INACTIVE}`}
            >
              {label}
            </button>
          );
        })}
      </div>
      {/* Horizontal row */}
      <div className="flex">
        {(["start", "center", "end"] as ContentAlign[]).map((a) => {
          const label = a === "start" ? "左揃え" : a === "center" ? "中央" : "右揃え";
          return (
            <button
              key={`h-${a}`}
              onClick={() => onChangeH(a)}
              className={`${ALIGN_BTN} ${alignH === a ? ALIGN_ACTIVE : ALIGN_INACTIVE}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
