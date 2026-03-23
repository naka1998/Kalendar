import { describe, it, expect } from "vitest";
import { escapeHtml, unescapeHtml } from "./htmlUtils";

describe("escapeHtml", () => {
  it("escapes &, <, >, and double quotes", () => {
    expect(escapeHtml('a & b < c > d "e"')).toBe("a &amp; b &lt; c &gt; d &quot;e&quot;");
  });

  it("returns empty string unchanged", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("returns string without special chars unchanged", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });

  it("handles multiple occurrences", () => {
    expect(escapeHtml("<<>>&&")).toBe("&lt;&lt;&gt;&gt;&amp;&amp;");
  });
});

describe("unescapeHtml", () => {
  it("unescapes &amp;, &lt;, &gt;, and &quot;", () => {
    expect(unescapeHtml("a &amp; b &lt; c &gt; d &quot;e&quot;")).toBe('a & b < c > d "e"');
  });

  it("returns empty string unchanged", () => {
    expect(unescapeHtml("")).toBe("");
  });

  it("returns string without entities unchanged", () => {
    expect(unescapeHtml("hello world")).toBe("hello world");
  });

  it("is the inverse of escapeHtml", () => {
    const original = 'Tom & Jerry <"friends">';
    expect(unescapeHtml(escapeHtml(original))).toBe(original);
  });
});
