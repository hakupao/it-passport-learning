// D-181 §0-7 — model output rendering: react-markdown with its defaults (no raw
// HTML), links limited to https: and site-relative URLs, external links opened
// with rel="noopener noreferrer" target="_blank". SSR (node env, renderToStaticMarkup).
import { describe, expect, it } from "vitest";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { SenseiMarkdown, safeUrl } from "../SenseiMarkdown";

const render = (text: string) => renderToStaticMarkup(h(SenseiMarkdown, { text }));

describe("safeUrl", () => {
  it("keeps https: and site-relative URLs", () => {
    expect(safeUrl("https://example.com/a?b=1#c")).toBe("https://example.com/a?b=1#c");
    expect(safeUrl("HTTPS://example.com")).toBe("HTTPS://example.com");
    expect(safeUrl("/ja/glossary/t1")).toBe("/ja/glossary/t1");
    expect(safeUrl("#2009h21a-q054")).toBe("#2009h21a-q054");
    expect(safeUrl("?mode=topic&id=x")).toBe("?mode=topic&id=x");
    expect(safeUrl("quiz?id=a:b")).toBe("quiz?id=a:b");
  });

  it("drops every other scheme, protocol-relative and backslash / control-character tricks", () => {
    for (const bad of [
      "javascript:alert(1)",
      "JavaScript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "http://example.com",
      "mailto:a@example.com",
      "vbscript:x",
      "//evil.example.com/x",
      "/\\evil.example.com",
      "\\\\evil.example.com",
      "java\tscript:alert(1)",
      " javascript:alert(1)",
    ]) {
      expect(safeUrl(bad), bad).toBeNull();
    }
  });
});

describe("SenseiMarkdown", () => {
  it("renders markdown lists and emphasis", () => {
    const out = render("**結論**: イ\n\n- 理由1\n- 理由2");
    expect(out).toContain("<strong>結論</strong>");
    expect(out).toMatch(/<ul>\s*<li>理由1<\/li>\s*<li>理由2<\/li>\s*<\/ul>/);
  });

  it("does not render raw HTML (it shows up as escaped text)", () => {
    const out = render('前 <script>alert(1)</script> <img src=x onerror="alert(1)"> <b>太字</b> 後');
    expect(out).not.toContain("<script");
    expect(out).not.toContain("<img");
    expect(out).not.toContain("<b>");
    expect(out).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(out).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  });

  it("external https links open in a new tab with noopener noreferrer", () => {
    const out = render("[外部](https://example.com/a)");
    expect(out).toContain('<a href="https://example.com/a" target="_blank" rel="noopener noreferrer">外部</a>');
  });

  it("site-relative links stay in the tab", () => {
    expect(render("[辞典](/ja/glossary)")).toContain('<a href="/ja/glossary">辞典</a>');
    expect(render("[問題](#2009h21a-q054)")).toContain('<a href="#2009h21a-q054">問題</a>');
  });

  it("unsafe links lose their href (text kept)", () => {
    for (const md of ["[x](javascript:alert(1))", "[x](http://example.com)", "[x](//evil.example.com)"]) {
      const out = render(md);
      expect(out, md).toContain(">x</a>");
      expect(out, md).not.toContain("href=");
    }
  });

  it("images are not rendered (no external fetch, no CSP violation); the alt text stays", () => {
    const out = render("![図の説明](https://example.com/x.png)");
    expect(out).not.toContain("<img");
    expect(out).toContain("図の説明");
  });

  it("renders a GFM table as <table> (remark-gfm)", () => {
    const out = render("| 方式 | 取出し順 |\n| --- | --- |\n| スタック | LIFO |\n| キュー | FIFO |");
    expect(out).toMatch(/<table>[\s\S]*<th>方式<\/th>[\s\S]*<th>取出し順<\/th>/);
    expect((out.match(/<tr>/g) ?? []).length).toBe(3);
    expect(out).toContain("<td>スタック</td>");
  });

  it("with GFM: raw HTML (also inside a table) is still not rendered, a javascript: link is still neutralised", () => {
    const out = render(
      "| a | b |\n| --- | --- |\n| <script>alert(1)</script> | [x](javascript:alert(1)) |\n\n<iframe src=\"https://example.com\"></iframe>",
    );
    expect(out).toContain("<table>");
    expect(out).not.toContain("<script");
    expect(out).not.toContain("<iframe");
    expect(out).toContain("&lt;script&gt;");
    expect(out).toMatch(/<a>x<\/a>/);
    expect(out).not.toContain("javascript:");
  });

  it("with GFM: a bare autolinked URL follows the same link rules", () => {
    expect(render("参照 https://example.com/b")).toContain(
      '<a href="https://example.com/b" target="_blank" rel="noopener noreferrer">https://example.com/b</a>',
    );
  });
});
