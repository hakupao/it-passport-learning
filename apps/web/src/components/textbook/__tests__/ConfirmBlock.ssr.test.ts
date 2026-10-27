// Stage 7 Phase 3 Task 2 (D-196 §0-1 / §0-6) — the unit-end confirmation section.
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { NextIntlClientProvider } from "next-intl";
import { readFileSync } from "node:fs";
import path from "node:path";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    h("a", { href, className }, children),
  useRouter: () => ({ push: () => {} }),
}));

import { ConfirmBlock } from "../ConfirmBlock";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";

function messages(locale: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8"));
}

const UNIT = "management-08-25-u01";
const render = (locale: string, ids: string[]) =>
  renderToStaticMarkup(
    h(NextIntlClientProvider, {
      locale,
      messages: messages(locale),
      children: h(LearningRecordProvider, { isOwner: false, children: h(ConfirmBlock, { ids, unitId: UNIT }) }),
    }),
  );

describe("ConfirmBlock", () => {
  // The server-rendered href has no run: the run nonce is made at click time (§0-2) and the order
  // (orderConfirm) is applied after mount, from the learning record.
  it("renders #confirm with the title, the count and a from=unit practice link over the ids", () => {
    const out = render("ja", ["2009h21a-q001", "2010h22h-q002", "2011h23a-q003"]);
    expect(out).toMatch(/^<section[^>]*id="confirm"/);
    expect(out).toContain("<h2");
    expect(out).toContain("確認問題");
    expect(out).toContain("この単元の過去問から 3 題");
    expect(out).toContain(
      `href="/practice?ids=2009h21a-q001,2010h22h-q002,2011h23a-q003&amp;from=unit&amp;unit=${UNIT}"`,
    );
    expect(out).not.toContain("run=");
    expect(out).toContain("確認問題を解く");
  });

  it("renders nothing without questions", () => {
    expect(render("en", [])).toBe("");
  });
});
