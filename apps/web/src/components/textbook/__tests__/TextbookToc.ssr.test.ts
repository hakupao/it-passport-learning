// D-180 Task 12 — read marks in the textbook TOC (TextbookToc + the UnitReadMark
// client island). SSR approach as in UnitReader.ssr.test.ts; the learning-record
// hook is mocked at its module boundary (effects never run under SSR).
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { NextIntlClientProvider, createTranslator } from "next-intl";
import { readFileSync } from "node:fs";
import path from "node:path";

import type { LearningRecord } from "@/lib/learning/record";

function messages(locale: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8"));
}

vi.mock("next-intl/server", () => ({
  getTranslations: async ({ locale, namespace }: { locale: string; namespace: string }) =>
    createTranslator({ locale, messages: messages(locale), namespace: namespace as never }),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    h("a", { href, className }, children),
}));

const state: { record: LearningRecord; loaded: boolean } = {
  record: { v: 1, questions: {}, unitsRead: {} },
  loaded: false,
};

vi.mock("@/hooks/useLearningRecord", () => ({
  useLearningRecord: () => ({ ...state, answer: () => {}, readUnit: () => {} }),
}));

import { TextbookToc } from "../TextbookToc";
import { buildNav, loadReaderIndex } from "@/lib/textbook/reader";

const READ_UNIT = "management-08-25-u01";

async function render(locale: "ja" | "zh" | "en"): Promise<string> {
  const index = await loadReaderIndex();
  const el = await TextbookToc({ nav: buildNav(index, locale), stats: index.stats, locale });
  return renderToStaticMarkup(h(NextIntlClientProvider, { locale, messages: messages(locale), children: el }));
}

function row(out: string, unitId: string): string {
  const m = out.match(new RegExp(`<a href="/textbook/${unitId}"[^>]*>([\\s\\S]*?)</a>`));
  expect(m, unitId).not.toBeNull();
  return m![1] ?? "";
}

const marks = (out: string): string[] =>
  out.match(/<span class="[^"]*readMark[^"]*">[^<]*<span aria-hidden="true">✓<\/span>/g) ?? [];

beforeEach(() => {
  state.record = { v: 1, questions: {}, unitsRead: {} };
  state.loaded = false;
});

describe("TextbookToc read marks (SSR)", () => {
  it("marks the read unit, and only that one", async () => {
    state.loaded = true;
    state.record.unitsRead[READ_UNIT] = 1;
    const out = await render("ja");
    expect(row(out, READ_UNIT)).toContain("既読");
    expect(marks(out)).toHaveLength(1);
  });

  it("localizes the label", async () => {
    state.loaded = true;
    state.record.unitsRead[READ_UNIT] = 1;
    expect(row(await render("zh"), READ_UNIT)).toContain("已读");
    expect(row(await render("en"), READ_UNIT)).toContain("Read");
  });

  it("before the record has loaded: no marks, one reserved empty slot per unit", async () => {
    state.record.unitsRead[READ_UNIT] = 1;
    const out = await render("ja");
    expect(marks(out)).toHaveLength(0);
    expect(row(out, READ_UNIT)).not.toContain("既読");
    const index = await loadReaderIndex();
    const slots = out.match(/<span class="[^"]*readMark[^"]*"><\/span>/g) ?? [];
    expect(slots.length).toBe(index.stats.units);
  });
});
