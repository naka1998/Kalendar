import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsActions } from "./SettingsActions";

describe("SettingsActions", () => {
  it("renders export button", () => {
    render(<SettingsActions />);
    expect(screen.getByText("設定を保存")).toBeDefined();
  });

  it("renders import button", () => {
    render(<SettingsActions />);
    expect(screen.getByText("設定を読込")).toBeDefined();
  });

  it("renders HTML import button", () => {
    render(<SettingsActions />);
    expect(screen.getByText("HTMLから読込")).toBeDefined();
  });

  it("renders hidden file inputs for json and html", () => {
    const { container } = render(<SettingsActions />);
    const fileInputs = container.querySelectorAll('input[type="file"]');
    expect(fileInputs.length).toBe(2);
    expect(fileInputs[0].getAttribute("accept")).toBe(".json");
    expect(fileInputs[1].getAttribute("accept")).toBe(".html,.htm");
  });

  it("triggers download on export click", () => {
    const clicks: string[] = [];
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = origCreateElement(tag);
      if (tag === "a") {
        Object.defineProperty(el, "click", {
          value: () => clicks.push("clicked"),
        });
      }
      return el;
    });

    render(<SettingsActions />);
    fireEvent.click(screen.getByText("設定を保存"));

    expect(clicks).toContain("clicked");
    vi.restoreAllMocks();
  });

  it("opens json file picker on import click", () => {
    const { container } = render(<SettingsActions />);
    const jsonInput = container.querySelectorAll('input[type="file"]')[0] as HTMLInputElement;
    const clickSpy = vi.spyOn(jsonInput, "click");

    fireEvent.click(screen.getByText("設定を読込"));
    expect(clickSpy).toHaveBeenCalled();
  });

  it("opens html file picker on HTML import click", () => {
    const { container } = render(<SettingsActions />);
    const htmlInput = container.querySelectorAll('input[type="file"]')[1] as HTMLInputElement;
    const clickSpy = vi.spyOn(htmlInput, "click");

    fireEvent.click(screen.getByText("HTMLから読込"));
    expect(clickSpy).toHaveBeenCalled();
  });

  it("handles json file import", () => {
    const { container } = render(<SettingsActions />);
    const jsonInput = container.querySelectorAll('input[type="file"]')[0] as HTMLInputElement;

    const settingsJson = JSON.stringify({
      version: 1,
      startMonth: "2026-04",
      endMonth: "2027-03",
      orientation: "portrait",
      weekStart: "sunday",
      weekdayFormat: "en-short",
      monthLabelFormat: "yyyy.mm",
      pageLayout: "1-month",
      holidayMarkStyle: "dot",
      themeId: "classic",
      fontId: "montserrat",
      fontWeight: 400,
      imagePercent: 50,
      imagePosition: "top",
      manualHolidays: [],
      removedHolidays: [],
      monthThemeOverrides: {},
      imageFileNames: {},
    });
    const file = new File([settingsJson], "settings.json", { type: "application/json" });

    // Should not throw
    fireEvent.change(jsonInput, { target: { files: [file] } });
  });

  it("handles html file import", () => {
    const { container } = render(<SettingsActions />);
    const htmlInput = container.querySelectorAll('input[type="file"]')[1] as HTMLInputElement;

    const file = new File(["<html></html>"], "calendar.html", { type: "text/html" });
    fireEvent.change(htmlInput, { target: { files: [file] } });
  });

  it("handles empty file selection gracefully", () => {
    const { container } = render(<SettingsActions />);
    const jsonInput = container.querySelectorAll('input[type="file"]')[0] as HTMLInputElement;

    // No file selected
    fireEvent.change(jsonInput, { target: { files: [] } });
  });
});
