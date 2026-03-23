import { describe, it, expect } from "vitest";
import { mergeHolidays } from "./holidayUtils";

describe("mergeHolidays", () => {
  it("returns API holidays as-is when no manual or removed", () => {
    const api = { "2026-01-01": "元日", "2026-02-11": "建国記念の日" };
    expect(mergeHolidays(api, [], [])).toEqual(api);
  });

  it("merges manual holidays with API holidays", () => {
    const api = { "2026-01-01": "元日" };
    const manual = [{ date: "2026-12-29", name: "会社休日" }];
    const result = mergeHolidays(api, manual, []);
    expect(result["2026-01-01"]).toBe("元日");
    expect(result["2026-12-29"]).toBe("会社休日");
  });

  it("excludes removed API holidays", () => {
    const api = { "2026-01-01": "元日", "2026-02-11": "建国記念の日" };
    const result = mergeHolidays(api, [], ["2026-01-01"]);
    expect(result["2026-01-01"]).toBeUndefined();
    expect(result["2026-02-11"]).toBe("建国記念の日");
  });

  it("manual holidays override API holidays on same date", () => {
    const api = { "2026-01-01": "元日" };
    const manual = [{ date: "2026-01-01", name: "カスタム元日" }];
    const result = mergeHolidays(api, manual, []);
    expect(result["2026-01-01"]).toBe("カスタム元日");
  });

  it("returns only manual holidays when API is empty", () => {
    const manual = [{ date: "2026-12-29", name: "会社休日" }];
    const result = mergeHolidays({}, manual, []);
    expect(Object.keys(result)).toHaveLength(1);
    expect(result["2026-12-29"]).toBe("会社休日");
  });
});
