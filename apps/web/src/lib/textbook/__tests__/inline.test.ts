// Stage 7 Phase 3 Task 6 (D-196 §0-12) — inline markup: **keyword** and [[jp:原語]].
import { createElement as h, Fragment, isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { inlineErrors, parseInline, stripInline } from "../inline";

const html = (s: string): string => renderToStaticMarkup(h(Fragment, null, ...parseInline(s)));

describe("parseInline", () => {
  it("turns **x** into <strong> and [[jp:x]] into a lang=ja span", () => {
    expect(html("a **WBS** b [[jp:回避]] c")).toBe('a <strong>WBS</strong> b <span lang="ja" data-inline="jp">回避</span> c');
  });

  it("returns strings and React elements only — never an HTML string", () => {
    const nodes = parseInline("<b>x</b> **<i>y</i>** [[jp:<u>z</u>]]");
    for (const n of nodes) expect(typeof n === "string" || isValidElement(n)).toBe(true);
    const out = html("<b>x</b> **<i>y</i>** [[jp:<u>z</u>]]");
    expect(out).not.toMatch(/<(b|i|u)>/);
    expect(out).toContain("&lt;b&gt;x&lt;/b&gt;");
    expect(out).toContain("<strong>&lt;i&gt;y&lt;/i&gt;</strong>");
  });

  it("prints an unclosed marker as-is", () => {
    expect(html("a **b")).toBe("a **b");
    expect(html("[[jp:回避 c")).toBe("[[jp:回避 c");
    expect(html("**")).toBe("**");
  });

  it("prints nested markup as-is", () => {
    expect(html("**a [[jp:b]] c**")).toBe("**a [[jp:b]] c**");
    expect(html("[[jp:a **b** c]]")).toBe("[[jp:a **b** c]]");
  });

  it("applies optional class names", () => {
    const out = renderToStaticMarkup(h(Fragment, null, ...parseInline("**k** [[jp:j]]", { key: "kw", jp: "jp" })));
    expect(out).toBe('<strong class="kw">k</strong> <span lang="ja" data-inline="jp" class="jp">j</span>');
  });

  it("plain text is one string node", () => {
    expect(parseInline("plain")).toEqual(["plain"]);
    expect(parseInline("")).toEqual([]);
  });
});

describe("stripInline", () => {
  it("removes both markers and keeps their text", () => {
    expect(stripInline("**项目风险管理**（[[jp:プロジェクトリスクマネジメント]]）是")).toBe("项目风险管理（プロジェクトリスクマネジメント）是");
  });

  it("keeps unclosed / nested markup as-is (same reading as parseInline)", () => {
    expect(stripInline("a **b")).toBe("a **b");
    expect(stripInline("**a [[jp:b]] c**")).toBe("**a [[jp:b]] c**");
  });
});

describe("inlineErrors", () => {
  it("is empty for well-formed text", () => {
    expect(inlineErrors("a **b** [[jp:c]] d")).toEqual([]);
    expect(inlineErrors("no markup")).toEqual([]);
  });

  it("reports unclosed, nested and stray markers", () => {
    for (const bad of ["a **b", "**a [[jp:b]]**", "[[jp:a **b**]]", "x ]] y", "[[jp:]]", "[[en:x]]", "***x***", "**x***", "a ***b** c"]) {
      expect(inlineErrors(bad).length, bad).toBeGreaterThan(0);
    }
  });
});
