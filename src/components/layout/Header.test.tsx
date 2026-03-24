import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./Header";

describe("Header", () => {
  it("renders app title", () => {
    render(<Header />);
    expect(screen.getByText("Ethereal Calendar")).toBeDefined();
  });

  it("renders help button", () => {
    render(<Header />);
    expect(screen.getByLabelText("Help")).toBeDefined();
  });

  it("renders download button", () => {
    render(<Header />);
    expect(screen.getByText("出力")).toBeDefined();
  });

  it("does not render temp save button (replaced by auto-save)", () => {
    render(<Header />);
    expect(screen.queryByText("一時保存")).toBeNull();
  });
});
