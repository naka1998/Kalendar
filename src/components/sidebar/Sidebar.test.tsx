import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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
    expect(screen.getByText("基本設定")).toBeDefined();
    expect(screen.getByText("祝日")).toBeDefined();
    expect(screen.getByText("デザイン")).toBeDefined();
    expect(screen.getByText("画像")).toBeDefined();
  });

  it("renders settings actions", () => {
    render(<Sidebar />);
    expect(screen.getByText("HTMLから読込")).toBeDefined();
    expect(screen.getByText("カレンダーをリセット")).toBeDefined();
  });
});
