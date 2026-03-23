import type { ColorTheme } from "@/stores/types";

export function resolveTheme(
  themeId: string,
  monthKey: string,
  monthOverrides: Record<string, string>,
  themes: ColorTheme[],
): ColorTheme {
  const effectiveId = monthOverrides[monthKey] ?? themeId;
  return themes.find((t) => t.id === effectiveId) ?? themes[0];
}
