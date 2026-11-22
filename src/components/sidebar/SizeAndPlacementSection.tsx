import {
  getDayRules,
  getTitleSettings,
  resolveCalendarLayout,
  TITLE_ORDERS,
  TITLE_POSITIONS,
  TITLE_RULES,
} from "@/lib/calendarLayouts";
import { useCalendarStore } from "@/stores/calendarStore";
import { FontWeightSelector } from "./FontSelector";
import { SliderField, getFontWarningLevel } from "./SliderField";

const alignmentOptions = [
  { value: "", label: "自動" },
  { value: "start", label: "左" },
  { value: "center", label: "中央" },
  { value: "end", label: "右" },
] as const;
const verticalOptions = [
  { value: "", label: "自動" },
  { value: "start", label: "上" },
  { value: "center", label: "中央" },
  { value: "end", label: "下" },
] as const;

function SettingSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs">
      {label}
      <select
        className="min-w-24 rounded-md bg-surface-container-high p-1.5 text-xs focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(event) => {
          const selected = options.find((option) => option.value === event.target.value);
          if (selected) onChange(selected.value);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SizeAndPlacementSection() {
  const style = useCalendarStore((s) => s.calendarStyle);
  const setStyle = useCalendarStore((s) => s.setCalendarStyle);
  const layout = resolveCalendarLayout(style.layoutPreset);
  const dayRules = getDayRules(style);
  const title = getTitleSettings(style);

  return (
    <div className="space-y-3">
      <section aria-label="月見出し" className="space-y-2">
        <h3 className="text-xs font-bold">月見出し</h3>
        <SettingSelect
          label="見出しの位置"
          value={title.titlePosition}
          options={TITLE_POSITIONS}
          onChange={(titlePosition) => setStyle({ titlePosition })}
        />
        <SettingSelect
          label="年と月の並べ方"
          value={title.titleOrder}
          options={TITLE_ORDERS}
          onChange={(titleOrder) => setStyle({ titleOrder })}
        />
        <SettingSelect
          label="見出しの下線"
          value={title.titleRule}
          options={TITLE_RULES}
          onChange={(titleRule) => setStyle({ titleRule })}
        />
        <SliderField
          label="月タイトル"
          value={style.monthFontSize}
          min={24}
          max={72}
          onChange={(monthFontSize) => setStyle({ monthFontSize })}
          warningLevel={getFontWarningLevel(style.monthFontSize, 30, 26)}
        />
        <SliderField
          label="ヘッダー間隔"
          value={style.headerGap}
          min={2}
          max={20}
          onChange={(headerGap) => setStyle({ headerGap })}
        />
      </section>

      <section aria-label="日付・曜日" className="space-y-2 border-t border-border pt-3">
        <h3 className="text-xs font-bold">日付・曜日</h3>
        <div role="group" aria-label="日付欄の罫線" className="grid grid-cols-2 gap-2">
          {(
            [
              { field: "dayRuleV", label: "縦罫線" },
              { field: "dayRuleH", label: "横罫線" },
            ] as const
          ).map(({ field, label }) => (
            <label key={field} className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={dayRules[field]}
                onChange={(event) => setStyle({ [field]: event.target.checked })}
              />
              {label}
            </label>
          ))}
        </div>
        <SettingSelect
          label="日付の左右揃え"
          value={style.dayAlignH ?? ""}
          options={alignmentOptions}
          onChange={(value) => setStyle({ dayAlignH: value || undefined })}
        />
        <SettingSelect
          label="日付の上下揃え"
          value={style.dayAlignV ?? ""}
          options={verticalOptions}
          onChange={(value) => setStyle({ dayAlignV: value || undefined })}
        />
        {layout !== "date-list" && (
          <SettingSelect
            label="曜日の左右揃え"
            value={title.weekdayAlign}
            options={alignmentOptions.slice(1)}
            onChange={(value) => setStyle({ weekdayAlign: value || undefined })}
          />
        )}
        <SliderField
          label="日付"
          value={layout === "date-list" ? Math.min(style.dayFontSize, 14) : style.dayFontSize}
          min={10}
          max={layout === "date-list" ? 14 : 24}
          onChange={(dayFontSize) => setStyle({ dayFontSize })}
          warningLevel={getFontWarningLevel(style.dayFontSize, 12, 11)}
        />
        {layout !== "date-list" && (
          <SliderField
            label="曜日"
            value={style.weekdayFontSize}
            min={10}
            max={20}
            onChange={(weekdayFontSize) => setStyle({ weekdayFontSize })}
            warningLevel={getFontWarningLevel(style.weekdayFontSize, 11, 10)}
          />
        )}
        <FontWeightSelector />
        {layout !== "date-list" && (
          <SliderField
            label="セル余白"
            value={style.cellPadding}
            min={2}
            max={16}
            onChange={(cellPadding) => setStyle({ cellPadding })}
          />
        )}
      </section>

      <section aria-label="用紙内の余白" className="space-y-2 border-t border-border pt-3">
        <h3 className="text-xs font-bold">用紙内の余白</h3>
        <SliderField
          label="上余白"
          value={style.pageMarginTop}
          min={0}
          max={80}
          onChange={(pageMarginTop) => setStyle({ pageMarginTop })}
        />
        <SliderField
          label="日付欄の幅"
          value={style.gridWidth}
          min={50}
          max={100}
          onChange={(gridWidth) => setStyle({ gridWidth })}
        />
      </section>
    </div>
  );
}
