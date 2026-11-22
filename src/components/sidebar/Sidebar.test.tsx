import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "./Sidebar";

describe("Sidebar", () => {
  it("renders desktop sidebar with settings label", () => {
    render(<Sidebar />);
    expect(screen.getByText("設定")).toBeDefined();
  });

  it("does not show settings label in mobile mode", () => {
    render(<Sidebar mobile />);
    expect(screen.queryByText("設定")).toBeNull();
  });

  it("renders all section headers", () => {
    render(<Sidebar />);
    const presets = screen.getByRole("button", { name: "プリセット" });
    const basic = screen.getByRole("button", { name: "基本設定" });
    expect(presets.compareDocumentPosition(basic) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText("見た目")).toBeDefined();
    expect(screen.getByText("サイズと配置")).toBeDefined();
    expect(screen.getByText("画像")).toBeDefined();
    expect(screen.getByText("データ")).toBeDefined();
  });

  it("opens preset cards directly from the preset section", () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByRole("button", { name: "プリセット" }));
    expect(screen.getByRole("button", { name: "縦リスト" })).toBeDefined();
  });

  it("renders settings actions inside data section when expanded", () => {
    render(<Sidebar />);
    // Expand data section
    fireEvent.click(screen.getByText("データ"));
    expect(screen.getByText("HTMLから読込")).toBeDefined();
    expect(screen.getByText("カレンダーをリセット")).toBeDefined();
  });
});
