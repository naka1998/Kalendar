import type { ColorTheme, PersistedCalendarSettings } from "@/stores/types";

function normalizeThemeId(id: string): string {
  return id === "minimal" || id === "minumal" ? "monochrome" : id;
}

export function migrateThemeSettings({
  themeId,
  monthThemeOverrides,
}: Partial<Pick<PersistedCalendarSettings, "themeId" | "monthThemeOverrides">>) {
  return {
    ...(typeof themeId === "string" ? { themeId: normalizeThemeId(themeId) } : {}),
    ...(monthThemeOverrides
      ? {
          monthThemeOverrides: Object.fromEntries(
            Object.entries(monthThemeOverrides).map(([month, id]) => [month, normalizeThemeId(id)]),
          ),
        }
      : {}),
  };
}

export function resolveTheme(
  themeId: string,
  monthKey: string,
  monthOverrides: Record<string, string>,
  themes: ColorTheme[],
): ColorTheme {
  const effectiveId = normalizeThemeId(monthOverrides[monthKey] ?? themeId);
  return themes.find((t) => t.id === effectiveId) ?? themes[0];
}
