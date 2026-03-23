import { describe, it, expect } from "vitest";
import { resolveTheme } from "./themeUtils";
import type { ColorTheme } from "@/stores/types";

const mockThemes: ColorTheme[] = [
  {
    id: "classic",
    name: "Classic",
    colors: {
      background: "#FFFFFF",
      text: "#1A1A1A",
      sunday: "#DC2626",
      saturday: "#2563EB",
      holidayMark: "#DC2626",
      headerRule: "#D1D5DB",
      gridRule: "#E5E7EB",
      weekdayHeader: "#6B7280",
      monthLabel: "#111827",
    },
  },
  {
    id: "dark",
    name: "Dark",
    colors: {
      background: "#1F2937",
      text: "#F9FAFB",
      sunday: "#FCA5A5",
      saturday: "#93C5FD",
      holidayMark: "#FCA5A5",
      headerRule: "#4B5563",
      gridRule: "#374151",
      weekdayHeader: "#9CA3AF",
      monthLabel: "#F3F4F6",
    },
  },
];

describe("resolveTheme", () => {
  it("returns global theme when no month override", () => {
    const theme = resolveTheme("classic", "2026-04", {}, mockThemes);
    expect(theme.id).toBe("classic");
  });

  it("returns month-overridden theme", () => {
    const overrides = { "2026-04": "dark" };
    const theme = resolveTheme("classic", "2026-04", overrides, mockThemes);
    expect(theme.id).toBe("dark");
  });

  it("falls back to first theme for unknown themeId", () => {
    const theme = resolveTheme("nonexistent", "2026-04", {}, mockThemes);
    expect(theme.id).toBe("classic");
  });

  it("uses global theme for months without override", () => {
    const overrides = { "2026-04": "dark" };
    const theme = resolveTheme("classic", "2026-05", overrides, mockThemes);
    expect(theme.id).toBe("classic");
  });
});
