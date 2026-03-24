import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { DownloadButton } from "./DownloadButton";

vi.mock("@/lib/zipGenerator", () => ({
  generateZip: vi.fn(),
}));

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("DownloadButton", () => {
  it("renders export button", () => {
    render(<DownloadButton />);
    expect(screen.getByText("出力")).toBeDefined();
  });

  it("button is not disabled by default", () => {
    render(<DownloadButton />);
    const button = screen.getByText("出力");
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  it("shows dropdown menu on click", () => {
    render(<DownloadButton />);
    fireEvent.click(screen.getByText("出力"));
    expect(screen.getByText("PDF")).toBeDefined();
    expect(screen.getByText("HTML")).toBeDefined();
    expect(screen.getByText("ZIP")).toBeDefined();
  });

  it("shows descriptions in dropdown", () => {
    render(<DownloadButton />);
    fireEvent.click(screen.getByText("出力"));
    expect(screen.getByText("印刷ダイアログからPDF保存")).toBeDefined();
    expect(screen.getByText("単一HTMLファイル（画像埋め込み）")).toBeDefined();
    expect(screen.getByText("HTML + 画像ファイル")).toBeDefined();
  });

  it("closes dropdown on outside click", () => {
    render(<DownloadButton />);
    fireEvent.click(screen.getByText("出力"));
    expect(screen.getByText("PDF")).toBeDefined();
    fireEvent.mouseDown(document);
    expect(screen.queryByText("PDF")).toBeNull();
  });

  it("toggles menu open and closed", () => {
    render(<DownloadButton />);
    const button = screen.getByText("出力");
    fireEvent.click(button);
    expect(screen.getByText("PDF")).toBeDefined();
    fireEvent.click(button);
    expect(screen.queryByText("PDF")).toBeNull();
  });

  it("closes menu when clicking an export option", async () => {
    // Mock window.open for PDF mode
    vi.spyOn(window, "open").mockReturnValue(null);

    render(<DownloadButton />);
    fireEvent.click(screen.getByText("出力"));
    expect(screen.getByText("PDF")).toBeDefined();

    await act(async () => {
      fireEvent.click(screen.getByText("PDF"));
    });

    // Menu should close after clicking
    expect(screen.queryByText("HTML + 画像ファイル")).toBeNull();
  });

  it("triggers HTML export and creates download", async () => {
    render(<DownloadButton />);
    fireEvent.click(screen.getByText("出力"));

    // Mock needed for download
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

    await act(async () => {
      fireEvent.click(screen.getByText("HTML"));
    });

    expect(clicks).toContain("clicked");
    vi.restoreAllMocks();
  });

  it("shows 出力中... while downloading", async () => {
    // Use ZIP mode which has an async await, allowing us to observe the intermediate state
    const { generateZip } = await import("@/lib/zipGenerator");
    const generateZipMock = vi.mocked(generateZip);

    // Create a deferred promise so we control when the export completes
    let resolveZip!: (blob: Blob) => void;
    generateZipMock.mockReturnValue(
      new Promise((resolve) => {
        resolveZip = resolve;
      }),
    );

    render(<DownloadButton />);
    fireEvent.click(screen.getByText("出力"));

    // Click ZIP to start an async export
    await act(async () => {
      fireEvent.click(screen.getByText("ZIP"));
    });

    // During download, button text should show "出力中..." and be disabled
    expect(screen.getByText("出力中...")).toBeDefined();
    expect(screen.getByText("出力中...").closest("button")?.disabled).toBe(true);

    // Resolve the zip generation to complete the export
    const mockBlob = new Blob(["test"], { type: "application/zip" });
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = origCreateElement(tag);
      if (tag === "a") {
        Object.defineProperty(el, "click", { value: () => {} });
      }
      return el;
    });

    await act(async () => {
      resolveZip(mockBlob);
    });

    // After export completes, button should revert to "出力" and be enabled
    expect(screen.getByText("出力")).toBeDefined();
    expect(screen.getByText("出力").closest("button")?.disabled).toBe(false);
  });
});
