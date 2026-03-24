import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImageSection } from "./ImageSection";
import { useCalendarStore } from "@/stores/calendarStore";
import { DEFAULTS } from "@/lib/constants";

vi.mock("@/hooks/useImageUpload", () => ({
  useImageUpload: () => ({
    uploadImage: vi.fn(),
    uploading: false,
    error: null,
  }),
}));

beforeEach(() => {
  useCalendarStore.setState({
    startMonth: DEFAULTS.START_MONTH,
    endMonth: "2026-06",
    monthLabelFormat: DEFAULTS.MONTH_LABEL_FORMAT,
    images: {},
  });
});

describe("ImageSection", () => {
  it("renders image assignment label", () => {
    render(<ImageSection />);
    expect(screen.getByText("画像の割り当て")).toBeDefined();
  });

  it("renders upload label", () => {
    render(<ImageSection />);
    expect(screen.getByText("アップロード")).toBeDefined();
  });

  it("renders upload button", () => {
    render(<ImageSection />);
    expect(screen.getByText("ファイルを選択")).toBeDefined();
  });

  it("renders month entries for each month in range", () => {
    render(<ImageSection />);
    expect(screen.getByText("2026.04")).toBeDefined();
    expect(screen.getByText("2026.05")).toBeDefined();
    expect(screen.getByText("2026.06")).toBeDefined();
  });

  it("shows add button for months without images", () => {
    render(<ImageSection />);
    const addButtons = screen.getAllByText("追加");
    expect(addButtons.length).toBe(3); // 3 months without images
  });

  it("shows remove button for months with images", () => {
    useCalendarStore.setState({
      images: {
        "2026-04": {
          id: "test-1",
          monthKey: "2026-04",
          fileName: "april.jpg",
          base64: "data:image/jpeg;base64,abc",
          mimeType: "image/jpeg",
        },
      },
    });
    render(<ImageSection />);
    expect(screen.getByText("×")).toBeDefined();
  });

  it("shows thumbnail for months with images", () => {
    useCalendarStore.setState({
      images: {
        "2026-04": {
          id: "test-1",
          monthKey: "2026-04",
          fileName: "april.jpg",
          base64: "data:image/jpeg;base64,abc",
          mimeType: "image/jpeg",
        },
      },
    });
    render(<ImageSection />);
    const img = screen.getByAltText("april.jpg");
    expect(img).toBeDefined();
  });
});
