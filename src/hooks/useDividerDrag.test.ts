import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDividerDrag } from "./useDividerDrag";

describe("useDividerDrag", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      }),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  it("returns initial state", () => {
    const onPercentCommit = vi.fn();
    const { result } = renderHook(() =>
      useDividerDrag({
        pageWidth: 794,
        pageHeight: 1123,
        scale: 0.5,
        currentPercent: 50,
        imagePosition: "top",
        onPercentCommit,
      }),
    );

    expect(result.current.isDragging).toBe(false);
    expect(result.current.livePercent).toBeNull();
    expect(typeof result.current.dividerProps.onPointerDown).toBe("function");
  });

  it("starts dragging on pointer down", () => {
    const onPercentCommit = vi.fn();
    const { result } = renderHook(() =>
      useDividerDrag({
        pageWidth: 794,
        pageHeight: 1123,
        scale: 0.5,
        currentPercent: 50,
        imagePosition: "top",
        onPercentCommit,
      }),
    );

    const target = document.createElement("div");
    target.setPointerCapture = vi.fn();

    const event = {
      preventDefault: vi.fn(),
      target,
      clientX: 100,
      clientY: 200,
      pointerId: 1,
    } as unknown as React.PointerEvent;

    act(() => {
      result.current.dividerProps.onPointerDown(event);
    });

    expect(result.current.isDragging).toBe(true);
    expect(result.current.livePercent).toBe(50);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(target.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it("updates livePercent on pointer move (vertical, top position)", () => {
    const onPercentCommit = vi.fn();
    const { result } = renderHook(() =>
      useDividerDrag({
        pageWidth: 794,
        pageHeight: 1123,
        scale: 1,
        currentPercent: 50,
        imagePosition: "top",
        onPercentCommit,
      }),
    );

    const target = document.createElement("div");
    target.setPointerCapture = vi.fn();
    const listeners: Record<string, EventListener> = {};
    target.addEventListener = vi.fn((type: string, fn: EventListener) => {
      listeners[type] = fn;
    });
    target.removeEventListener = vi.fn();

    act(() => {
      result.current.dividerProps.onPointerDown({
        preventDefault: vi.fn(),
        target,
        clientX: 100,
        clientY: 200,
        pointerId: 1,
      } as unknown as React.PointerEvent);
    });

    // Move down by ~112px on a 1123px page → ~10% increase
    act(() => {
      listeners["pointermove"]?.(new PointerEvent("pointermove", { clientX: 100, clientY: 312 }));
    });

    expect(result.current.livePercent).toBe(60);
  });

  it("commits percent on pointer up", () => {
    const onPercentCommit = vi.fn();
    const { result } = renderHook(() =>
      useDividerDrag({
        pageWidth: 794,
        pageHeight: 1123,
        scale: 1,
        currentPercent: 50,
        imagePosition: "top",
        onPercentCommit,
      }),
    );

    const target = document.createElement("div");
    target.setPointerCapture = vi.fn();
    const listeners: Record<string, EventListener> = {};
    target.addEventListener = vi.fn((type: string, fn: EventListener) => {
      listeners[type] = fn;
    });
    target.removeEventListener = vi.fn();

    act(() => {
      result.current.dividerProps.onPointerDown({
        preventDefault: vi.fn(),
        target,
        clientX: 100,
        clientY: 200,
        pointerId: 1,
      } as unknown as React.PointerEvent);
    });

    act(() => {
      listeners["pointerup"]?.(new PointerEvent("pointerup"));
    });

    expect(result.current.isDragging).toBe(false);
    expect(result.current.livePercent).toBeNull();
    expect(onPercentCommit).toHaveBeenCalledWith(50);
  });

  it("clamps percent within min/max bounds", () => {
    const onPercentCommit = vi.fn();
    const { result } = renderHook(() =>
      useDividerDrag({
        pageWidth: 794,
        pageHeight: 1123,
        scale: 1,
        currentPercent: 50,
        imagePosition: "top",
        onPercentCommit,
      }),
    );

    const target = document.createElement("div");
    target.setPointerCapture = vi.fn();
    const listeners: Record<string, EventListener> = {};
    target.addEventListener = vi.fn((type: string, fn: EventListener) => {
      listeners[type] = fn;
    });
    target.removeEventListener = vi.fn();

    act(() => {
      result.current.dividerProps.onPointerDown({
        preventDefault: vi.fn(),
        target,
        clientX: 100,
        clientY: 200,
        pointerId: 1,
      } as unknown as React.PointerEvent);
    });

    // Move way down to try to exceed max (80%)
    act(() => {
      listeners["pointermove"]?.(new PointerEvent("pointermove", { clientX: 100, clientY: 1500 }));
    });

    expect(result.current.livePercent).toBeLessThanOrEqual(80);
    expect(result.current.livePercent).toBeGreaterThanOrEqual(20);
  });

  it("uses horizontal axis for left/right positions", () => {
    const onPercentCommit = vi.fn();
    const { result } = renderHook(() =>
      useDividerDrag({
        pageWidth: 794,
        pageHeight: 1123,
        scale: 1,
        currentPercent: 50,
        imagePosition: "left",
        onPercentCommit,
      }),
    );

    const target = document.createElement("div");
    target.setPointerCapture = vi.fn();
    const listeners: Record<string, EventListener> = {};
    target.addEventListener = vi.fn((type: string, fn: EventListener) => {
      listeners[type] = fn;
    });
    target.removeEventListener = vi.fn();

    act(() => {
      result.current.dividerProps.onPointerDown({
        preventDefault: vi.fn(),
        target,
        clientX: 200,
        clientY: 100,
        pointerId: 1,
      } as unknown as React.PointerEvent);
    });

    // Move right by ~79px on 794px width → ~10%
    act(() => {
      listeners["pointermove"]?.(new PointerEvent("pointermove", { clientX: 279, clientY: 100 }));
    });

    expect(result.current.livePercent).toBe(60);
  });

  it("reverses direction for bottom position", () => {
    const onPercentCommit = vi.fn();
    const { result } = renderHook(() =>
      useDividerDrag({
        pageWidth: 794,
        pageHeight: 1123,
        scale: 1,
        currentPercent: 50,
        imagePosition: "bottom",
        onPercentCommit,
      }),
    );

    const target = document.createElement("div");
    target.setPointerCapture = vi.fn();
    const listeners: Record<string, EventListener> = {};
    target.addEventListener = vi.fn((type: string, fn: EventListener) => {
      listeners[type] = fn;
    });
    target.removeEventListener = vi.fn();

    act(() => {
      result.current.dividerProps.onPointerDown({
        preventDefault: vi.fn(),
        target,
        clientX: 100,
        clientY: 200,
        pointerId: 1,
      } as unknown as React.PointerEvent);
    });

    // Move DOWN → reversed → percent decreases
    act(() => {
      listeners["pointermove"]?.(new PointerEvent("pointermove", { clientX: 100, clientY: 312 }));
    });

    expect(result.current.livePercent).toBe(40);
  });
});
