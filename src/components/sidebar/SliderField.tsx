export function getFontWarningLevel(
  value: number,
  warningThreshold: number,
  dangerThreshold: number,
): "warning" | "danger" | undefined {
  if (value <= dangerThreshold) return "danger";
  if (value <= warningThreshold) return "warning";
  return undefined;
}

export function SliderField({
  label,
  value,
  min,
  max,
  onChange,
  warningLevel,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  warningLevel?: "warning" | "danger";
}) {
  const labelColor =
    warningLevel === "danger"
      ? "text-red-500"
      : warningLevel === "warning"
        ? "text-amber-500"
        : "text-on-surface-variant";
  const valueColor =
    warningLevel === "danger"
      ? "text-red-500"
      : warningLevel === "warning"
        ? "text-amber-500"
        : "text-on-surface";

  return (
    <div className="flex items-center gap-2">
      <span className={`w-16 shrink-0 text-xs ${labelColor}`}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-surface-container-high accent-[#005bc4]"
      />
      <span className={`w-6 shrink-0 text-right text-xs tabular-nums ${valueColor}`}>{value}</span>
    </div>
  );
}
