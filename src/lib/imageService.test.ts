/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi } from "vitest";
import { calcResizeDimensions, createImageProcessor, type ImageResizer } from "./imageService";
import { IMAGE } from "@/lib/constants";

describe("calcResizeDimensions", () => {
  it("returns original dimensions when within limit", () => {
    expect(calcResizeDimensions(1000, 800, 2400)).toEqual({ width: 1000, height: 800 });
  });

  it("resizes landscape image to fit max dimension", () => {
    const result = calcResizeDimensions(4800, 3200, 2400);
    expect(result.width).toBe(2400);
    expect(result.height).toBe(1600);
  });

  it("resizes portrait image to fit max dimension", () => {
    const result = calcResizeDimensions(3000, 4800, 2400);
    expect(result.width).toBe(1500);
    expect(result.height).toBe(2400);
  });

  it("preserves aspect ratio", () => {
    const original = 4000 / 3000;
    const result = calcResizeDimensions(4000, 3000, 2400);
    const resized = result.width / result.height;
    expect(Math.abs(original - resized)).toBeLessThan(0.01);
  });
});

describe("createImageProcessor", () => {
  function mockResizer(): ImageResizer {
    return {
      loadImage: vi.fn().mockResolvedValue({ width: 4800, height: 3200 }),
      toDataURL: vi.fn().mockResolvedValue("data:image/jpeg;base64,resized"),
    };
  }

  function createMockFile(size: number, type: string): File {
    const buffer = new ArrayBuffer(size);
    return new File([buffer], "test.jpg", { type });
  }

  it("rejects files over 10MB", async () => {
    const resizer = mockResizer();
    const processor = createImageProcessor(resizer);
    const file = createMockFile(11 * 1024 * 1024, "image/jpeg");

    await expect(processor.resizeImage(file)).rejects.toThrow("File size exceeds");
    expect(resizer.loadImage).not.toHaveBeenCalled();
  });

  it("rejects unsupported MIME types", async () => {
    const resizer = mockResizer();
    const processor = createImageProcessor(resizer);
    const file = createMockFile(1024, "image/gif");

    await expect(processor.resizeImage(file)).rejects.toThrow("Unsupported file type");
  });

  it("resizes images exceeding max dimension", async () => {
    const resizer = mockResizer();
    const processor = createImageProcessor(resizer);
    const file = createMockFile(1024, "image/jpeg");

    const result = await processor.resizeImage(file);

    expect(resizer.loadImage).toHaveBeenCalled();
    expect(resizer.toDataURL).toHaveBeenCalledWith(
      expect.any(String),
      IMAGE.MAX_DIMENSION,
      1600,
      "image/jpeg",
      IMAGE.JPEG_QUALITY,
    );
    expect(result.base64).toBe("data:image/jpeg;base64,resized");
    expect(result.mimeType).toBe("image/jpeg");
  });

  it("does not resize images within limit", async () => {
    const resizer: ImageResizer = {
      loadImage: vi.fn().mockResolvedValue({ width: 1000, height: 800 }),
      toDataURL: vi.fn(),
    };
    const processor = createImageProcessor(resizer);
    const file = createMockFile(1024, "image/png");

    const result = await processor.resizeImage(file);

    expect(resizer.toDataURL).not.toHaveBeenCalled();
    expect(result.mimeType).toBe("image/png");
  });
});
