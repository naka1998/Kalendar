import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsActions } from "./SettingsActions";

describe("SettingsActions", () => {
  it("renders HTML import button", () => {
    render(<SettingsActions />);
    expect(screen.getByText("HTMLから読込")).toBeDefined();
  });

  it("renders hidden file input for html", () => {
    const { container } = render(<SettingsActions />);
    const fileInputs = container.querySelectorAll('input[type="file"]');
    expect(fileInputs.length).toBe(1);
    expect(fileInputs[0].getAttribute("accept")).toBe(".html,.htm");
  });

  it("opens html file picker on HTML import click", () => {
    const { container } = render(<SettingsActions />);
    const htmlInput = container.querySelectorAll('input[type="file"]')[0] as HTMLInputElement;
    const clickSpy = vi.spyOn(htmlInput, "click");

    fireEvent.click(screen.getByText("HTMLから読込"));
    expect(clickSpy).toHaveBeenCalled();
  });

  it("handles html file import", () => {
    const { container } = render(<SettingsActions />);
    const htmlInput = container.querySelectorAll('input[type="file"]')[0] as HTMLInputElement;

    const file = new File(["<html></html>"], "calendar.html", { type: "text/html" });
    fireEvent.change(htmlInput, { target: { files: [file] } });
  });
});
