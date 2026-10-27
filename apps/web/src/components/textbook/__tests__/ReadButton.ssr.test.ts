// Stage 7 Phase 3 Task 2 (D-196 §0-4) — the explicit 読了 button: one-way.
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { NextIntlClientProvider } from "next-intl";
import { readFileSync } from "node:fs";
import path from "node:path";

import { ReadButtonView } from "../ReadButton";

function messages(locale: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8"));
}

const render = (locale: string, props: Parameters<typeof ReadButtonView>[0]) =>
  renderToStaticMarkup(h(NextIntlClientProvider, { locale, messages: messages(locale), children: h(ReadButtonView, props) }));

const noop = () => {};

describe("ReadButtonView", () => {
  it("unread → 「読了」, enabled once the record has loaded", () => {
    const out = render("ja", { readAt: null, ready: true, onRead: noop });
    expect(out).toMatch(/<button[^>]*data-part="read"[^>]*>読了<\/button>/);
    expect(out).not.toContain("disabled");
  });

  it("unread before the record has loaded → 「読了」, disabled", () => {
    const out = render("ja", { readAt: null, ready: false, onRead: noop });
    expect(out).toMatch(/<button[^>]*disabled[^>]*>読了<\/button>/);
  });

  it("read → a focusable status 「✓ 読了 M/D」, no button (no undo)", () => {
    const at = new Date(2026, 9, 7, 12).getTime(); // local Oct 7
    const out = render("ja", { readAt: at, ready: true, onRead: noop });
    expect(out).not.toContain("<button");
    expect(out).toMatch(/^<p[^>]*role="status"[^>]*tabindex="-1"[^>]*data-part="read"/);
    expect(out).toContain('<span aria-hidden="true">✓</span> 読了 10/7');
    expect(render("zh", { readAt: at, ready: true, onRead: noop })).toContain("已读完 10/7");
    expect(render("en", { readAt: at, ready: true, onRead: noop })).toContain("Read Oct 7");
  });
});
