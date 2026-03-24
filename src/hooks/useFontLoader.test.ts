import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFontLoader } from "./useFontLoader";

describe("useFontLoader", () => {
  beforeEach(() => {
    // Clean up any link elements from previous tests
    document.head.querySelectorAll("link[rel=stylesheet]").forEach((el) => el.remove());
  });

  afterEach(() => {
    document.head.querySelectorAll("link[rel=stylesheet]").forEach((el) => el.remove());
  });

  it("does nothing when url is undefined", () => {
    renderHook(() => useFontLoader(undefined));
    const links = document.head.querySelectorAll("link[rel=stylesheet]");
    expect(links.length).toBe(0);
  });

  it("inserts a link element for the font url", () => {
    const url = "https://fonts.googleapis.com/css2?family=Montserrat";
    renderHook(() => useFontLoader(url));
    const link = document.head.querySelector(`link[href="${url}"]`);
    expect(link).not.toBeNull();
    expect(link?.getAttribute("rel")).toBe("stylesheet");
  });

  it("does not duplicate link if same url is re-rendered", () => {
    const url = "https://fonts.googleapis.com/css2?family=Inter";
    const { rerender } = renderHook(({ url }) => useFontLoader(url), {
      initialProps: { url },
    });

    rerender({ url });
    const links = document.head.querySelectorAll(`link[href="${url}"]`);
    expect(links.length).toBe(1);
  });

  it("replaces link when url changes", () => {
    const url1 = "https://fonts.googleapis.com/css2?family=Montserrat";
    const url2 = "https://fonts.googleapis.com/css2?family=Inter";

    const { rerender } = renderHook(({ url }) => useFontLoader(url), {
      initialProps: { url: url1 },
    });

    expect(document.head.querySelector(`link[href="${url1}"]`)).not.toBeNull();

    rerender({ url: url2 });

    expect(document.head.querySelector(`link[href="${url1}"]`)).toBeNull();
    expect(document.head.querySelector(`link[href="${url2}"]`)).not.toBeNull();
  });
});
