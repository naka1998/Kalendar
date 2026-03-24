import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TempSaveButton } from "./TempSaveButton";
import * as storageService from "@/lib/storageService";

vi.mock("@/lib/storageService", () => ({
  saveToStorage: vi.fn(() => ({ success: true })),
  loadFromStorage: vi.fn(() => null),
  hasSavedData: vi.fn(() => false),
}));

beforeEach(() => {
  vi.mocked(storageService.hasSavedData).mockReturnValue(false);
  vi.mocked(storageService.saveToStorage).mockReturnValue({ success: true });
});

describe("TempSaveButton", () => {
  it("renders save button", () => {
    render(<TempSaveButton />);
    expect(screen.getByText("一時保存")).toBeDefined();
  });

  it("does not show restore button when no saved data", () => {
    render(<TempSaveButton />);
    expect(screen.queryByText("復元")).toBeNull();
  });

  it("shows restore button when saved data exists", () => {
    vi.mocked(storageService.hasSavedData).mockReturnValue(true);
    render(<TempSaveButton />);
    expect(screen.getByText("復元")).toBeDefined();
  });

  it("calls saveToStorage on save click", () => {
    render(<TempSaveButton />);
    fireEvent.click(screen.getByText("一時保存"));
    expect(storageService.saveToStorage).toHaveBeenCalled();
  });

  it("shows success message after save", () => {
    render(<TempSaveButton />);
    fireEvent.click(screen.getByText("一時保存"));
    expect(screen.getByText("保存しました")).toBeDefined();
  });

  it("shows error message on save failure", () => {
    vi.mocked(storageService.saveToStorage).mockReturnValue({
      success: false,
      error: "容量オーバー",
    });
    render(<TempSaveButton />);
    fireEvent.click(screen.getByText("一時保存"));
    expect(screen.getByText("容量オーバー")).toBeDefined();
  });
});
