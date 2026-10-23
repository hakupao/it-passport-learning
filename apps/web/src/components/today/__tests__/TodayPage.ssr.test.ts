// Stage 7 Phase 1 Task 11 (D-189 §6.1, mockup A4-Home / D-190 §0-17 / §0-20 / §0-26) — the today
// page (SSR). Node env, renderToStaticMarkup, real corpus + catalogs. Effects never run under SSR, so
// the learning-record hook is mocked at its module boundary (fixed record / loaded) and the clock is
// fixed at 2026-10-23 10:00 local time (a Friday).
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
  useLearningRecord: () => ({ ...state, answer: () => {}, readUnit: () => {}, setSetting: () => {} }),
  useLearningActions: () => ({ answer: () => {}, readUnit: () => {}, setSetting: () => {} }),
}));

import { emptyRecord, recordAttempt, setSetting, type LearningRecord } from "@/lib/learning/record";
import { dailyPlan, toLocalDay } from "@/lib/learning/schedule";
import { poolFromIndex, type TodayIndex } from "@/lib/practice/practiceIndex";
import { loadTodayIndex } from "@/lib/practice/practiceReader";
import { startOfDayPlan, todayKind } from "@/lib/practice/practiceSession";
import { baselineIds, todayTasks, weakTopicRows } from "@/lib/practice/todayModel";

import { TodayPage } from "../TodayPage";

type Messages = Record<string, unknown>;
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
/** local 10:00, `d` days before NOW */
const ago = (d: number): number => new Date(2026, 9, 23 - d, 10, 0).getTime();
const TODAY = toLocalDay(NOW);
const DK = "2026-10-23";

const INDEX: Partial<Record<(typeof LOCALES)[number], TodayIndex>> = {};
const idx = (locale: (typeof LOCALES)[number]): TodayIndex => INDEX[locale]!;

beforeAll(async () => {
  for (const l of LOCALES) INDEX[l] = await loadTodayIndex(l);
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

function render(locale: (typeof LOCALES)[number], index: TodayIndex = idx(locale)): string {
  return renderToStaticMarkup(
    h(NextIntlClientProvider, {
      locale,
      messages: messagesFor(locale),
      timeZone: "Asia/Tokyo",
      children: h(TodayPage, { index, locale }),
    }),
  );
}
const textOf = (html: string): string =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
const attr = (html: string, re: RegExp): string => re.exec(html)?.[1]?.replace(/&amp;/g, "&") ?? "";
const count = (html: string, re: RegExp): number => html.match(re)?.length ?? 0;

/** a learner with two weak topics (wrong answers a week ago are mistakes due today), due reviews, an exam date */
function seeded(index: TodayIndex, examDate: string | null = "2026-11-30"): LearningRecord {
  let r: LearningRecord = { ...emptyRecord(), v2Since: ago(60) };
  const [a, b, c] = [index.topics[0]!, index.topics[1]!, index.topics[2]!];
  const ids = (t: { id: string }) => index.topicQuestionIds[t.id]!;
  ids(a)
    .slice(0, 6)
    .forEach((id, k) => (r = recordAttempt(r, id, "ア", k >= 3, ago(7))));
  ids(b)
    .slice(0, 5)
    .forEach((id, k) => (r = recordAttempt(r, id, "ア", k >= 1, ago(7))));
  ids(c)
    .slice(0, 4)
    .forEach((id) => (r = recordAttempt(r, id, "ア", true, ago(8)))); // box 2, due yesterday
  if (examDate) r = setSetting(r, "examDate", examDate, ago(1));
  return r;
}

describe("TodayPage — header", () => {
  it("date tag + 今天的学习 heading", () => {
    state.record = seeded(idx("zh"));
    const zh = render("zh");
    expect(textOf(attr(zh, /(<span[^>]*data-date-tag=""[^>]*>[\s\S]*?<\/span>)/))).toBe("10月23日（五）");
    expect(zh).toMatch(/<h1[^>]*>今天的学习<\/h1>/);
    expect(textOf(/<span[^>]*data-exam-date=""[^>]*>[\s\S]*?<\/span>/.exec(zh)![0])).toBe("考试 11月30日");
    state.record = seeded(idx("ja"));
    const ja = render("ja");
    expect(textOf(/<span[^>]*data-date-tag=""[^>]*>[\s\S]*?<\/span>/.exec(ja)![0])).toBe("10月23日（金）");
    expect(ja).toMatch(/<h1[^>]*>今日の学習<\/h1>/);
    state.record = seeded(idx("en"));
    const en = render("en");
    expect(textOf(/<span[^>]*data-date-tag=""[^>]*>[\s\S]*?<\/span>/.exec(en)![0])).toBe("Fri, Oct 23");
    expect(textOf(/<span[^>]*data-exam-date=""[^>]*>[\s\S]*?<\/span>/.exec(en)![0])).toBe("Exam Nov 30");
  });

  it("no exam date → 设定考试日 link, no countdown; a past date hides the countdown too", () => {
    state.record = seeded(idx("zh"), null);
    const none = render("zh");
    expect(none).toMatch(/<a href="\/settings"[^>]*>设定考试日<\/a>/);
    expect(none).not.toContain("data-countdown");
    expect(none).not.toContain("data-exam-date");
    // 已做 x / 2900 stays
    expect(none).toMatch(/data-answered="15\/2900"/);
    expect(textOf(/<div id="today-countdown-title"[^>]*>([\s\S]*?)<\/div>/.exec(none)![1]!)).toBe("学习进度");
    expect(none).toMatch(/<div[^>]*data-progress-only=""/);

    state.record = seeded(idx("zh"));
    const set = render("zh");
    expect(textOf(/<div[^>]*data-countdown="38"[^>]*>[\s\S]*?<\/div>/.exec(set)![0])).toContain("38 天");
    expect(textOf(set)).toContain("过去问 15 / 2,900 题");

    state.record = seeded(idx("zh"), "2026-10-01");
    const past = render("zh");
    expect(past).not.toContain("data-countdown");
    expect(past).toMatch(/<a href="\/settings"/);
  });
});

describe("TodayPage — tasks", () => {
  it("主按钮「从第 1 项开始」 links to the first task", () => {
    const index = idx("zh");
    const r = seeded(index);
    state.record = r;
    const html = render("zh");
    const plan = dailyPlan(r, poolFromIndex(index), TODAY, toLocalDay, DK);
    const start = startOfDayPlan(r, poolFromIndex(index), TODAY, toLocalDay, DK);
    const tasks = todayTasks(plan, r, index, weakTopicRows(r, index)[0]!.topicId, start);
    expect(tasks.map((t) => t.kind)).toEqual(["mistakes", "due", "new", "unit"]);
    const primary = /<a[^>]*data-primary=""[^>]*>([\s\S]*?)<\/a>/.exec(html)!;
    expect(textOf(primary[1]!)).toBe("从第 1 项开始");
    expect(attr(primary[0], /href="([^"]+)"/)).toBe(tasks[0]!.href);
    expect(tasks[0]!.href).toMatch(/^\/practice\?ids=[^&]+&from=today&kind=mistakes$/);
    // one row per task, in order, with tag, title, minutes; the mistakes detail names topics (JP)
    const rows = [...html.matchAll(/<li[^>]*data-task="([a-z]+)"[^>]*>([\s\S]*?)<\/li>/g)];
    expect(rows.map((m) => m[1])).toEqual(["mistakes", "due", "new", "unit"]);
    expect(textOf(rows[0]![2]!)).toMatch(/^错题 错题本 4 题 .* 约 4 分钟$/);
    expect(rows[0]![2]).toContain(`lang="ja">${index.topics[0]!.name_jp} 3`);
    // due: topic 0's and topic 1's right answers a week ago (box 2 → due today) + topic 2's
    expect(textOf(rows[1]![2]!)).toContain("到期复习 11 题");
    expect(textOf(rows[3]![2]!)).toContain(tasks[3]!.unit!.title);
    expect(rows[3]![2]).toContain(`href="/textbook/${tasks[3]!.unit!.id}"`);
    // the secondary link; no 模拟考试 in Phase 1
    expect(html).toMatch(/<a href="\/practice"[^>]*>自己选范围练习<\/a>/);
  });

  it("模拟考试 link hidden in Phase 1", () => {
    for (const l of LOCALES) {
      state.record = seeded(idx(l));
      const html = render(l);
      expect(html).not.toMatch(/模拟考试|模擬試験|mock exam/i);
      expect(html).not.toMatch(/href="\/mock/);
      state.record = emptyRecord();
      expect(render(l)).not.toMatch(/模拟考试|模擬試験|mock exam/i);
    }
  });

  it("new user sees 先做 20 题摸底 and empty-state lines", () => {
    const index = idx("zh");
    const html = render("zh");
    const primary = /<a[^>]*data-primary=""[^>]*>([\s\S]*?)<\/a>/.exec(html)!;
    expect(textOf(primary[1]!)).toBe("先做 20 题摸底");
    const href = attr(primary[0], /href="([^"]+)"/);
    const ids = baselineIds(emptyRecord(), index, DK);
    expect(href).toBe(`/practice?ids=${ids.join(",")}&from=today&kind=fresh`);
    expect(ids.length).toBeGreaterThanOrEqual(20);
    // without kind= the practice page could not tell the baseline group is today's new questions
    expect(todayKind(emptyRecord(), poolFromIndex(index), ids, TODAY, toLocalDay, DK)).toBeNull();
    // no task rows (the 10 new questions of the plan would contradict the baseline button)
    expect(html).not.toContain("data-task=");
    for (const k of ["tasks", "weak", "areas"]) expect(html).toContain(`data-empty="${k}"`);
    expect(textOf(html)).toContain("还没有学习记录");
    for (const l of ["ja", "en"] as const) {
      expect(render(l)).toMatch(/data-primary=""[^>]*>(まず 20 問で実力チェック|Start with a 20-question baseline)</);
    }
  });

  it("all done today → no primary button, the done line", () => {
    const index = idx("zh");
    let r: LearningRecord = { ...emptyRecord(), v2Since: ago(60) };
    r = setSetting(r, "dailyNewTarget", 1, ago(2));
    const id = index.topicQuestionIds[index.topics[0]!.id]![0]!;
    r = recordAttempt(r, id, "ア", true, ago(8));
    r = recordAttempt(r, id, "ア", true, NOW - 60_000); // the due review, done this morning
    const fresh = dailyPlan(r, poolFromIndex(index), TODAY, toLocalDay, DK).fresh;
    for (const q of fresh) r = recordAttempt(r, q, "ア", true, NOW - 30_000);
    state.record = r;
    const html = render("zh");
    expect(html).not.toContain("data-primary");
    expect(textOf(html)).toContain("今天的任务都完成了");
    const rows = [...html.matchAll(/<li[^>]*data-task="([a-z]+)"[^>]*data-done="([a-z]+)"[^>]*>/g)];
    expect(rows.map((m) => [m[1], m[2]])).toEqual([
      ["due", "true"],
      ["new", "true"],
    ]);
  });
});

describe("TodayPage — weak topics, area rates, terms", () => {
  it("weak table has 练 10 题 and AI 分析 links per row", () => {
    const index = idx("zh");
    const r = seeded(index);
    state.record = r;
    const html = render("zh");
    const table = /<table[^>]*data-weak=""[^>]*>[\s\S]*?<\/table>/.exec(html)![0];
    const head = textOf(/<thead>[\s\S]*?<\/thead>/.exec(table)![0]);
    expect(head).toBe("领域 分野 頻出度 正答率 操作"); // the last header is sr-only
    const rows = [...table.matchAll(/<tr[^>]*data-weak-row="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/g)];
    const weak = weakTopicRows(r, index);
    expect(weak.map((w) => w.topicId).sort()).toEqual([index.topics[0]!.id, index.topics[1]!.id].sort());
    expect(rows.map((m) => m[1])).toEqual(weak.map((w) => w.topicId));
    for (const [, id, body] of rows) {
      expect(body).toMatch(new RegExp(`<a href="/practice\\?topic=${id}&amp;n=10&amp;order=rand"[^>]*>练 10 题</a>`));
      expect(body).toMatch(new RegExp(`<a href="/practice/browse/${id}\\?review=1"[^>]*>AI 分析</a>`));
    }
    const t0 = index.topics[0]!;
    const row0 = rows.find((m) => m[1] === t0.id)![2]!;
    expect(textOf(row0)).toContain(t0.name_jp);
    expect(textOf(row0)).toContain("50%");
    const catLabel = { strategy: "ストラテジ系", management: "マネジメント系", technology: "テクノロジ系" }[t0.category];
    expect(row0).toContain(`lang="ja">${catLabel}<`);
  });

  it("pass line text 600/1000 and 300 each", () => {
    const want = {
      ja: "合格基準：総合 600/1000 以上、かつ各分野 300/1000 以上",
      zh: "合格线：总分 600/1000，且每个分野 300/1000 以上",
      en: "Pass: 600/1000 overall and at least 300/1000 in each field",
    };
    for (const l of LOCALES) {
      state.record = seeded(idx(l));
      expect(render(l)).toContain(`>${want[l]}<`);
      state.record = emptyRecord();
      expect(render(l)).toContain(`>${want[l]}<`);
    }
  });

  it("three-category bars: the share of right latest answers; — for a field with none", () => {
    const index = idx("zh");
    state.record = seeded(index);
    const html = render("zh");
    const bars = [...html.matchAll(/data-area="([a-z]+)" data-rate="([^"]*)"/g)].map((m) => [m[1], m[2]]);
    const cat = (i: number) => index.topics[i]!.category;
    // topic 0: 3/6, topic 1: 4/5, topic 2: 4/4 — tally by category
    const tally: Record<string, [number, number]> = { strategy: [0, 0], management: [0, 0], technology: [0, 0] };
    for (const [i, right, all] of [
      [0, 3, 6],
      [1, 4, 5],
      [2, 4, 4],
    ] as const) {
      tally[cat(i)]![0] += right;
      tally[cat(i)]![1] += all;
    }
    expect(bars).toEqual(
      (["strategy", "management", "technology"] as const).map((c) => [
        c,
        tally[c]![1] === 0 ? "" : String(Math.round((tally[c]![0] / tally[c]![1]) * 100)),
      ]),
    );
  });

  it("「今天的 3 个用语」 = the first task's first question's topic; none in the payload → no box", () => {
    const index = idx("zh");
    const r = seeded(index);
    state.record = r;
    const html = render("zh");
    const box = /<section[^>]*data-terms=""[^>]*>[\s\S]*?<\/section>/.exec(html)![0];
    expect(textOf(box)).toContain("今天的 3 个用语");
    const links = [...box.matchAll(/<a href="\/glossary\/([^"]+)"/g)].map((m) => m[1]);
    const firstId = dailyPlan(r, poolFromIndex(index), TODAY, toLocalDay, DK).mistakes[0]!;
    const firstTopic = Object.keys(index.topicQuestionIds).find((t) => index.topicQuestionIds[t]!.includes(firstId))!;
    expect([index.topics[0]!.id, index.topics[1]!.id]).toContain(firstTopic);
    expect(links).toEqual(index.topicTerms[firstTopic]!.map((c) => c.id));
    expect(links.length).toBeGreaterThan(0);
    expect(links.length).toBeLessThanOrEqual(3);
    // the dictionary-free payload (dictionary load failed) → no terms box
    const bare: TodayIndex = { ...index, topicTerms: Object.fromEntries(index.topics.map((t) => [t.id, []])) };
    expect(render("zh", bare)).not.toContain("data-terms");
  });
});

describe("TodayPage — before the record loads", () => {
  it("blocks keep their place, no numbers and no new-user state", () => {
    state.loaded = false;
    state.record = emptyRecord();
    for (const l of LOCALES) {
      const html = render(l);
      expect(html).toMatch(/<h1[^>]*>/);
      expect(count(html, /data-pending=""/g)).toBeGreaterThanOrEqual(4);
      expect(html).not.toContain("data-date-tag");
      expect(html).not.toContain("data-task=");
      expect(html).not.toContain("data-primary");
      expect(html).not.toContain("data-empty");
      expect(html).not.toContain("data-countdown");
      expect(html).not.toContain("data-answered");
      expect(html).not.toMatch(/\d+%/);
      // the countdown box has no title yet (no 「距离考试」 → 「学习进度」 flash once the record loads)
      expect(textOf(/<div id="today-countdown-title"[^>]*>([\s\S]*?)<\/div>/.exec(html)![1]!)).toBe("");
    }
  });
});

describe("Today messages", () => {
  it("ja / zh / en define the same Today keys", () => {
    const keys = (l: string) => Object.keys((messagesFor(l).Today ?? {}) as Messages).sort();
    expect(keys("ja").length).toBeGreaterThan(20);
    expect(keys("zh")).toEqual(keys("ja"));
    expect(keys("en")).toEqual(keys("ja"));
  });
});
