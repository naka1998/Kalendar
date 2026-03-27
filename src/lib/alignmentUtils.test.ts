import { describe, it, expect } from "vitest";
import {
  alignToPositionV,
  alignToPositionH,
  objectPositionValue,
  justifyContentValue,
  alignItemsValue,
  justifyContentClass,
  alignItemsClass,
} from "./alignmentUtils";

describe("alignToPositionV", () => {
  it("returns top for start", () => expect(alignToPositionV("start")).toBe("top"));
  it("returns bottom for end", () => expect(alignToPositionV("end")).toBe("bottom"));
  it("returns center for center", () => expect(alignToPositionV("center")).toBe("center"));
  it("returns center for undefined", () => expect(alignToPositionV(undefined)).toBe("center"));
});

describe("alignToPositionH", () => {
  it("returns left for start", () => expect(alignToPositionH("start")).toBe("left"));
  it("returns right for end", () => expect(alignToPositionH("end")).toBe("right"));
  it("returns center for center", () => expect(alignToPositionH("center")).toBe("center"));
  it("returns center for undefined", () => expect(alignToPositionH(undefined)).toBe("center"));
});

describe("objectPositionValue", () => {
  it("combines vertical and horizontal", () => {
    expect(objectPositionValue("start", "end")).toBe("top right");
  });
  it("defaults to center center", () => {
    expect(objectPositionValue(undefined, undefined)).toBe("center center");
  });
  it("handles mixed values", () => {
    expect(objectPositionValue("end", "start")).toBe("bottom left");
  });
});

describe("justifyContentValue", () => {
  it("returns flex-start for start", () => expect(justifyContentValue("start")).toBe("flex-start"));
  it("returns flex-end for end", () => expect(justifyContentValue("end")).toBe("flex-end"));
  it("returns center for center", () => expect(justifyContentValue("center")).toBe("center"));
  it("returns center for undefined", () => expect(justifyContentValue(undefined)).toBe("center"));
});

describe("alignItemsValue", () => {
  it("returns flex-start for start", () => expect(alignItemsValue("start")).toBe("flex-start"));
  it("returns flex-end for end", () => expect(alignItemsValue("end")).toBe("flex-end"));
  it("returns center for center", () => expect(alignItemsValue("center")).toBe("center"));
  it("returns center for undefined", () => expect(alignItemsValue(undefined)).toBe("center"));
});

describe("justifyContentClass", () => {
  it("returns justify-start for start", () =>
    expect(justifyContentClass("start")).toBe("justify-start"));
  it("returns justify-end for end", () => expect(justifyContentClass("end")).toBe("justify-end"));
  it("returns justify-center for center", () =>
    expect(justifyContentClass("center")).toBe("justify-center"));
  it("returns justify-center for undefined", () =>
    expect(justifyContentClass(undefined)).toBe("justify-center"));
});

describe("alignItemsClass", () => {
  it("returns items-start for start", () => expect(alignItemsClass("start")).toBe("items-start"));
  it("returns items-end for end", () => expect(alignItemsClass("end")).toBe("items-end"));
  it("returns items-center for center", () =>
    expect(alignItemsClass("center")).toBe("items-center"));
  it("returns items-center for undefined", () =>
    expect(alignItemsClass(undefined)).toBe("items-center"));
});
