// Stage 7 Phase 2 Task 5 (DESIGN §6.6 / D-193 §0-9) — the learning record page (SSR). Node env,
// renderToStaticMarkup, real corpus + catalogs; the learning-record hook is mocked at its module
// boundary and the clock is fixed at 2026-10-23 10:00 local time (a Friday).
import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) =>
    h("a", { href, ...rest }, children),
  useRouter: () => ({ push: () => {} }),
}));

const state: { record: LearningRecord; loaded: boolean } = { record: emptyRecord(), loaded: false };
vi.mock("@/hooks/useLearningRecord", () => ({
  useLearningRecord: () => ({ ...state, answer: () => {}, answerBatch: () => {}, readUnit: () => {}, setSetting: () => {} }),
}));

import { emptyRecord, recordAttempt, type LearningRecord } from "@/lib/learning/record";
import type { TodayIndex } from "@/lib/practice/practiceIndex";
import { loadSetupIndex } from "@/lib/practice/practiceReader";
import type { RecordSort } from "@/lib/record/recordModel";

import { RecordPage } from "../RecordPage";

type Messages = Record<string, Record<string, string>>;
const catalogs = new Map<string, Messages>();
function messagesFor(locale: string): Messages {
  let m = catalogs.get(locale);
  if (!m) {
    m = JSON.parse(readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8")) as Messages;
    catalogs.set(locale, m);
  }
  return m;
}

const LOCALES = ["ja", "zh", "en"] as const;
const NOW = new Date(2026, 9, 23, 10, 0).getTime();
const ago = (d: number): number => new Date(2026, 9, 23 - d, 10, 0).getTime();

let INDEX: TodayIndex;
beforeAll(async () => {
  INDEX = await loadSetupIndex("ja");
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
});
afterAll(() => {
  vi.useRealTimers();
});
beforeEach(() => {
  state.record = emptyRecord();
  state.loaded = true;
});

function render(locale: (typeof LOCALES)[number], sort: RecordSort = "stars"): string {
  return renderToStaticMarkup(
    h(NextIntlClientProvider, {
      locale,
      messages: messagesFor(locale),
      timeZone: "Asia/Tokyo",
      children: h(RecordPage, { index: INDEX, locale, sort }),
    }),
  );
}
const attr = (html: string, name: string): string | null => new RegExp(`${name}="([^"]*)"`).exec(html)?.[1] ?? null;

describe("RecordPage", () => {
  it.each(LOCALES)("%s: the four section titles; empty record → one empty line, no NaN; no svg / canvas", (locale) => {
    const html = render(locale);
    const R = messagesFor(locale).Record!;
    for (const k of ["totalsTitle", "forecastTitle", "dailyTitle", "topicsTitle"]) expect(html).toContain(R[k]!);
    expect(html.match(/data-empty=/g)).toHaveLength(1);
    expect(html).toContain(R.empty!);
    expect(html).not.toMatch(/NaN|undefined|Infinity/);
    expect(html).not.toContain("<svg");
    expect(html).not.toContain("<canvas");
  });

  it("before the record loads: titles but no numbers (data-pending)", () => {
    state.loaded = false;
    const html = render("ja");
    expect(html).toContain("data-pending");
    expect(html).not.toContain("data-answered");
    expect(html).not.toContain("data-count");
  });

  it("with attempts: totals, today's daily cell, forecast, rate sort link active", () => {
    const qids = INDEX.topicQuestionIds[INDEX.topics[0]!.id]!.slice(0, 2);
    let r = emptyRecord();
    r = recordAttempt(r, qids[0]!, "ア", false, ago(1)); // due today
    r = recordAttempt(r, qids[0]!, "イ", true, NOW - 1000);
    r = recordAttempt(r, qids[1]!, "ア", true, NOW - 500, "mock");
    state.record = r;
    const html = render("ja", "rate");
    expect(attr(html, "data-answered")).toBe("2");
    expect(attr(html, "data-total")).toBe(String(new Set(Object.values(INDEX.topicQuestionIds).flat()).size));
    expect(attr(html, "data-study-days")).toBe("2");
    expect(/data-day-today="" data-count="(\d+)"/.exec(html)?.[1]).toBe("2");
    expect(html).not.toContain("data-empty");
    expect(html).toMatch(/aria-current="true"[^>]*href="\/record\?sort=rate"|href="\/record\?sort=rate"[^>]*aria-current="true"/);
    expect(html).not.toMatch(/NaN|undefined|Infinity/);
    expect(html).not.toContain("<svg");
  });
});
