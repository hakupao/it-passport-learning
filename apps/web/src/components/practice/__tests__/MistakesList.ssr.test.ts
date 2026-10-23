// Stage 7 Phase 1 Task 12 (DESIGN §5.4 leech / §6.3, D-190 §0-20) — the mistakes book (SSR). Node
// env, renderToStaticMarkup, real corpus (dictionary-free payload) + catalogs. The learning-record hook
// is mocked at its module boundary and the clock is fixed at 2026-10-23 10:00 local time.
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
  useLearningRecord: () => ({ ...state, answer: () => {}, readUnit: () => {}, setSetting: () => {} }),
}));

import { emptyRecord, recordAttempt, type LearningRecord } from "@/lib/learning/record";
import type { TodayIndex } from "@/lib/practice/practiceIndex";
import { loadSetupIndex } from "@/lib/practice/practiceReader";

import { MistakesList } from "../MistakesList";
import { messagesFor } from "./practiceRender";

const LOCALES = ["ja", "zh", "en"] as const;
type Locale = (typeof LOCALES)[number];
const NOW = new Date(2026, 9, 23, 10, 0).getTime();
const ago = (d: number): number => new Date(2026, 9, 23 - d, 10, 0).getTime();

const INDEX: Partial<Record<Locale, TodayIndex>> = {};
const idx = (l: Locale): TodayIndex => INDEX[l]!;

beforeAll(async () => {
  for (const l of LOCALES) INDEX[l] = await loadSetupIndex(l);
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

function render(locale: Locale): string {
  return renderToStaticMarkup(
    h(NextIntlClientProvider, {
      locale,
      messages: messagesFor(locale),
      timeZone: "Asia/Tokyo",
      children: h(MistakesList, { index: idx(locale) }),
    }),
  );
}
const decode = (s: string): string => s.replace(/&amp;/g, "&");
const textOf = (html: string): string =>
  decode(html.replace(/<[^>]+>/g, " "))
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

/** the 2 first questions of the first strategy topic and the first technology topic */
function picks(index: TodayIndex) {
  const strat = index.topics.find((t) => t.category === "strategy" && t.units.length > 0)!;
  const tech = index.topics.find((t) => t.category === "technology" && t.units.length > 0)!;
  return { strat, tech, s: index.topicQuestionIds[strat.id]!, t: index.topicQuestionIds[tech.id]! };
}

/** tech[0] = leech (4 wrong), tech[1] wrong yesterday (due today), strat[0] wrong today (due tomorrow) */
function seeded(index: TodayIndex): LearningRecord {
  const { s, t } = picks(index);
  let r: LearningRecord = { ...emptyRecord(), v2Since: ago(60) };
  for (let k = 0; k < 4; k++) r = recordAttempt(r, t[0]!, "ア", false, ago(9 - k));
  r = recordAttempt(r, t[1]!, "ア", false, ago(1));
  r = recordAttempt(r, s[0]!, "ア", false, NOW - 60_000);
  // answered right only → not in the book
  r = recordAttempt(r, s[1]!, "イ", true, ago(3));
  return r;
}

const groupsOf = (html: string) => [...html.matchAll(/<section[^>]*data-mistake-group="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)];
const rowsOf = (html: string) => [...html.matchAll(/<tr[^>]*data-mistake-row="([^"]+)"([^>]*)>([\s\S]*?)<\/tr>/g)];

describe("MistakesList", () => {
  it("mistakes grouped by topic, leech tagged 顽固 with unit + AI links", () => {
    const index = idx("zh");
    const { strat, tech, s, t } = picks(index);
    state.record = seeded(index);
    const html = render("zh");
    expect(html).toMatch(/<h1[^>]*>错题本<\/h1>/);
    // strategy before technology (exam order), one section per topic with its JP name
    const groups = groupsOf(html);
    expect(groups.map((g) => g[1])).toEqual([strat.id, tech.id]);
    expect(groups[1]![2]).toContain(`lang="ja">${tech.name_jp}<`);
    const rows = rowsOf(html);
    expect(rows.map((m) => m[1])).toEqual([s[0], t[0], t[1]]);
    const leech = rows.find((m) => m[1] === t[0])!;
    expect(leech[2]).toContain('data-leech=""');
    expect(textOf(leech[3]!)).toContain("顽固");
    expect(textOf(leech[3]!)).toContain("近 10 次错 4 次");
    expect(leech[3]).toMatch(new RegExp(`<a href="/textbook/${tech.units[0]!.id}"[^>]*>读单元</a>`));
    expect(leech[3]).toMatch(new RegExp(`<a href="/practice/q/${t[0]}"[^>]*>问 AI</a>`));
    // a plain mistake: no tag, no unit / AI links
    const plain = rows.find((m) => m[1] === t[1])!;
    expect(plain[2]).not.toContain("data-leech");
    expect(textOf(plain[3]!)).not.toContain("顽固");
    expect(plain[3]).not.toContain("/textbook/");
    expect(textOf(plain[3]!)).toContain("近 10 次错 1 次");
    // next: due today → 今天; wrong today → tomorrow's date
    expect(textOf(plain[3]!)).toContain("今天");
    expect(textOf(rows[0]![3]!)).toContain("10/24");
    // the leech tag in the other locales
    state.record = seeded(idx("ja"));
    expect(textOf(rowsOf(render("ja")).find((m) => m[1] === t[0])![3]!)).toContain("苦手");
    state.record = seeded(idx("en"));
    expect(textOf(rowsOf(render("en")).find((m) => m[1] === t[0])![3]!)).toContain("Stubborn");
  });

  it("mistake row label = exam label_jp + 問N + topic name", () => {
    const index = idx("en");
    const { tech, t } = picks(index);
    state.record = seeded(index);
    const row = rowsOf(render("en")).find((m) => m[1] === t[1])!;
    const examId = t[1]!.replace(/-q\d+$/, "");
    const n = Number(/-q(\d+)$/.exec(t[1]!)![1]);
    expect(row[3]).toMatch(new RegExp(`<a href="/practice/q/${t[1]}"[^>]*lang="ja"[^>]*>問 ${n}</a>`));
    expect(row[3]).toContain(`lang="ja">${index.exams[examId]}<`);
    expect(row[3]).toMatch(new RegExp(`<td lang="ja"[^>]*>${tech.name_jp}</td>`));
    expect(textOf(row[3]!)).toMatch(new RegExp(`^問 ${n} ${index.exams[examId]} ${tech.name_jp} `));
  });

  it("做全部错题 caps the URL at 100 ids", () => {
    const index = idx("zh");
    const tech = index.topics.filter((x) => x.category === "technology");
    const ids = tech.flatMap((x) => index.topicQuestionIds[x.id]!).slice(0, 120);
    let r: LearningRecord = { ...emptyRecord(), v2Since: ago(60) };
    // the last 20 were wrong earlier → due earlier → first in the URL
    ids.forEach((id, k) => (r = recordAttempt(r, id, "ア", false, ago(k >= 100 ? 5 : 2))));
    state.record = r;
    const html = render("zh");
    const btn = /<a[^>]*data-do-all=""[^>]*>([\s\S]*?)<\/a>/.exec(html)!;
    expect(textOf(btn[1]!)).toBe("做全部错题（120）");
    const href = decode(/href="([^"]+)"/.exec(btn[0])![1]!);
    const list = href.replace(/^\/practice\?ids=/, "").split(",");
    expect(list).toHaveLength(100);
    expect(list.slice(0, 20)).toEqual([...ids.slice(100)].sort());
    expect(textOf(html)).toContain("超过 100 题时");
    expect(rowsOf(html)).toHaveLength(120);
  });

  it("empty → one-line empty state (no button, no table)", () => {
    for (const l of LOCALES) {
      const html = render(l);
      expect(html).toContain('data-empty=""');
      expect(html).not.toContain("data-do-all");
      expect(html).not.toContain("<table");
    }
    expect(textOf(render("zh"))).toContain("错题本是空的");
  });

  it("loading → space reserved, no numbers, no empty state", () => {
    state.record = seeded(idx("zh"));
    state.loaded = false;
    const html = render("zh");
    expect(html).toContain('data-pending=""');
    expect(html).not.toContain("data-empty");
    expect(html).not.toContain("data-mistake-row");
    expect(html).not.toMatch(/data-do-all/);
    // heading and lead are static copy (the lead says 「2 天」); nothing after them shows a number
    expect(textOf(html.replace(/<h1[\s\S]*?<\/h1>/, "").replace(/<p[^>]*>[\s\S]*?<\/p>/, ""))).not.toMatch(/\d/);
  });
});
