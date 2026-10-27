// Stage 6 (D-179 / D-180 §0-3) Task 8 — textbook term anchors + link to the glossary.
// Stage 7 Phase 3 Task 2 (D-196 §0-4〜§0-6): the D-195 skeleton order on a v1 unit.
// Same SSR approach as the glossary *.ssr.test.ts files (node env,
// renderToStaticMarkup, createElement instead of JSX, real message catalogs).
// UnitReader is an async server component: it is awaited to an element first,
// with next-intl/server's getTranslations served by createTranslator.
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { createTranslator, NextIntlClientProvider } from "next-intl";
import { readFileSync } from "node:fs";
import path from "node:path";

function messages(locale: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8"));
}

vi.mock("next-intl/server", () => ({
  getTranslations: async ({ locale, namespace }: { locale: string; namespace: string }) =>
    createTranslator({ locale, messages: messages(locale), namespace: namespace as never }),
}));

// Stand-in for next-intl's Link (see GlossaryList.ssr.test.ts): localePrefix
// "always", so the explicit `locale` prop becomes the path prefix.
vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    locale,
    children,
    className,
  }: {
    href: string;
    locale?: string;
    children: React.ReactNode;
    className?: string;
  }) => h("a", { href: `/${locale ?? "_"}${href}`, className }, children),
  useRouter: () => ({ push: () => {} }),
}));

import { UnitReader } from "../UnitReader";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import { termId } from "@/lib/glossary/termId";
import { loadChumonMembers } from "@/lib/practice/chumonMembers";
import { pastCount, pickConfirm } from "@/lib/textbook/confirm";
import {
  loadAllUnits,
  loadReaderIndex,
  loadUnit,
  neighbors,
  normalizeUnit,
  unitPlace,
} from "@/lib/textbook/reader";
import type { TextbookUnitV2 } from "@/lib/textbook/types";

// A real unit whose terms include 機能要件 (committed corpus); terms 3 and 4 carry a figure.
const UNIT_ID = "management-08-25-u01";

async function element(locale: "ja" | "zh" | "en"): Promise<React.ReactElement> {
  const [raw, index, members] = await Promise.all([loadUnit(UNIT_ID), loadReaderIndex(), loadChumonMembers()]);
  const unit = normalizeUnit(raw, members);
  return UnitReader({
    unit,
    place: unitPlace(index, UNIT_ID, locale),
    neighbors: neighbors(index, UNIT_ID),
    locale,
    senseiAnchorText: "ANCHOR",
    confirm: pickConfirm(unit, members),
  });
}

// The 読了 button and 「AI 先生に聞く」 are client islands: the page mounts the provider + messages.
async function render(locale: "ja" | "zh" | "en"): Promise<string> {
  return renderToStaticMarkup(
    h(NextIntlClientProvider, {
      locale,
      messages: messages(locale),
      children: h(LearningRecordProvider, { isOwner: false, children: await element(locale) }),
    }),
  );
}

const tb = (locale: string) => messages(locale).Textbook as Record<string, string>;
const at = (out: string, needle: string): number => {
  const i = out.indexOf(needle);
  expect(i, needle).toBeGreaterThanOrEqual(0);
  return i;
};

describe("UnitReader layout (SSR, D-196 §0-5 / §0-6)", () => {
  it("orders breadcrumb → h1 → meta → term index → articles → key points → #confirm → 読了", async () => {
    const out = await render("ja");
    const marks = [
      'data-part="breadcrumb"',
      "<h1",
      'data-part="meta"',
      'data-part="term-index"',
      "<article",
      'data-part="key-points"',
      'id="confirm"',
      'data-part="topic-past"',
      'data-part="read"',
    ].map((m) => at(out, m));
    expect(marks).toEqual([...marks].sort((a, b) => a - b));
    expect(out.lastIndexOf("</article>")).toBeLessThan(at(out, 'data-part="key-points"'));
  });

  it("breadcrumb: 分野 › 中分類 › topic › 単元 n / N", async () => {
    const [index, out] = await Promise.all([loadReaderIndex(), render("ja")]);
    const place = unitPlace(index, UNIT_ID, "ja")!;
    const nav = out.match(/<nav[^>]*data-part="breadcrumb"[^>]*>([\s\S]*?)<\/nav>/)![1]!;
    const text = nav.replace(/<[^>]+>/g, "");
    const parts = [tb("ja").cat_management!, place.medium, place.topicName, `単元 ${place.n} / ${place.total}`];
    let from = 0;
    for (const p of parts) {
      const i = text.indexOf(p, from);
      expect(i, p).toBeGreaterThanOrEqual(from);
      from = i + p.length;
    }
    expect(nav).toContain('href="/_/textbook#management"');
    // an ordered list; the unit itself is the current page
    expect(nav).toMatch(/^<ol[^>]*>/);
    expect(nav).toMatch(new RegExp(`<li aria-current="page">[\\s\\S]*?単元 ${place.n} / ${place.total}</li>`));
    expect(out).toMatch(new RegExp(`<nav aria-label="${tb("ja").pager}"`));
  });

  it("meta shows badge, minutes, term count and the unit's past-question count", async () => {
    const [raw, members, out] = await Promise.all([loadUnit(UNIT_ID), loadChumonMembers(), render("ja")]);
    const n = pastCount(normalizeUnit(raw, members));
    const meta = out.match(/<p[^>]*data-part="meta"[^>]*>([\s\S]*?)<\/p>/)![1]!;
    expect(meta).toContain(raw.overview.freq_badge);
    expect(meta).toContain(`約 ${raw.overview.est_minutes} 分`);
    expect(meta).toContain(`${raw.terms.length} 用語`);
    expect(meta).toContain(`過去問 ${n} 題`);
  });

  it("term index links every term to its article, in order", async () => {
    const [raw, out] = await Promise.all([loadUnit(UNIT_ID), render("ja")]);
    const idx = out.match(/data-part="term-index"[\s\S]*?<\/ul>/)![0];
    const hrefs = [...idx.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(raw.terms.map((t) => termId(t.term)));
  });

  it("each article: one → fig → detail → analogy / hook → the term's past questions", async () => {
    const [raw, members, out] = await Promise.all([loadUnit(UNIT_ID), loadChumonMembers(), render("ja")]);
    const unit = normalizeUnit(raw, members);
    const articles = [...out.matchAll(/<article[\s\S]*?<\/article>/g)].map((m) => m[0]);
    expect(articles).toHaveLength(unit.terms.length);
    articles.forEach((a, i) => {
      const t = unit.terms[i]!;
      expect(t.quiz.length, t.term).toBeGreaterThan(0); // every term of this unit has past questions
      const order = ["one", ...(t.fig ? ["fig"] : []), "detail", "analogy", "hook", "term-past"].map((p) =>
        at(a, `data-part="${p}"`),
      );
      expect(order, t.term).toEqual([...order].sort((x, y) => x - y));
      expect(a).toContain(tb("ja").termPast!.replace("{n}", String(t.quiz.length)));
      // from=unit link without a run (the run is made at click time, §0-2)
      expect(a).toContain(`href="/_/practice?ids=${t.quiz.join(",")}&amp;from=unit&amp;unit=${UNIT_ID}&amp;at=${t.id}"`);
      // the link's accessible text names the term (as 用語集で開く does)
      expect(a).toMatch(new RegExp(`data-part="term-past"[\\s\\S]*?<span class="sr-only"> ${t.term}</span>`));
    });
    expect(articles.some((a) => a.includes('data-part="fig"'))).toBe(true);
    // a figure carries its natural width for the phone-width minimum (reader.module.css --fig-w)
    for (const a of articles.filter((x) => x.includes('data-part="fig"'))) {
      expect(a).toMatch(/<figure data-part="fig" class="[^"]*" style="--fig-w:\d+px"/);
    }
  });

  it("drops the overview intro, the memory-hook list and the on-mount read marker", async () => {
    const raw = await loadUnit(UNIT_ID);
    const out = await render("ja");
    expect(out).not.toContain(raw.overview.intro_jp);
    for (const hook of raw.summary.memory_hooks_jp) expect(out).not.toContain(hook);
    for (const kp of raw.summary.key_points_jp) expect(out).toContain(kp);
    for (const k of ["memoryHooks", "overview", "summary", "back", "pastQuestions"]) expect(tb("ja")[k]).toBeUndefined();
  });

  it("keeps a secondary link to every past question of the topic under #confirm", async () => {
    const out = await render("ja");
    const link = out.match(/data-part="topic-past"[^>]*><a href="([^"]*)"[^>]*>([^<]*)</);
    expect(link?.[1]).toBe("/_/practice/browse/management-08-25");
    expect(link?.[2]).toBe(tb("ja").topicPast);
  });

  it("the confirm section lists pickConfirm's questions", async () => {
    const [raw, members, out] = await Promise.all([loadUnit(UNIT_ID), loadChumonMembers(), render("ja")]);
    const ids = pickConfirm(normalizeUnit(raw, members), members);
    const sec = out.match(/<section[^>]*id="confirm"[\s\S]*?<\/section>/)![0];
    expect(sec).toContain(tb("ja").confirmCount!.replace("{n}", String(ids.length)));
    expect(sec).toContain(`href="/_/practice?ids=${ids.join(",")}&amp;from=unit&amp;unit=${UNIT_ID}"`);
  });
});

describe("UnitReader AI 先生 entry (SSR, D-181 Phase C)", () => {
  it("renders the 「AI 先生に聞く」 button under the title; no panel before a click", async () => {
    const out = await render("en");
    const button = out.match(/<button[^>]*data-testid="ask-sensei"[^>]*>([^<]*)<\/button>/);
    expect(button?.[1]).toBe((messages("en").Sensei as Record<string, string>).askButton);
    expect(out.indexOf("data-testid=\"ask-sensei\"")).toBeGreaterThan(out.indexOf("</h1>"));
    expect(out.indexOf("data-testid=\"ask-sensei\"")).toBeLessThan(out.indexOf("<article"));
    expect(out).not.toContain("role=\"dialog\"");
    expect(out).not.toContain("ANCHOR");
  });
});

describe("UnitReader term anchors (SSR)", () => {
  it("gives the 機能要件 article id=termId and links it to /<locale>/glossary/<same id>", async () => {
    const id = termId("機能要件");
    const out = await render("ja");
    expect(out).toMatch(new RegExp(`<article[^>]*\\bid="${id}"`));
    expect(out).toContain(`href="/ja/glossary/${id}"`);
    expect(out).toContain("用語集で開く");
  });

  it("keeps the glossary link out of the h3; its accessible text names the term", async () => {
    const id = termId("機能要件");
    const out = await render("ja");
    const heads = [...out.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => m[1] ?? "");
    expect(heads.length).toBeGreaterThan(0);
    for (const inner of heads) {
      expect(inner).not.toContain("<a");
      expect(inner).not.toContain("用語集で開く");
    }
    expect(heads.some((inner) => inner.includes("機能要件"))).toBe(true);

    const link = out.match(new RegExp(`<a[^>]*href="/ja/glossary/${id}"[^>]*>([\\s\\S]*?)</a>`));
    expect(link).not.toBeNull();
    const inner = link![1] ?? "";
    expect(inner).toContain("用語集で開く");
    expect(inner).toMatch(/<span class="sr-only">\s*機能要件<\/span>/);
    expect(inner).toContain('<span aria-hidden="true"> →</span>');
    // Accessible text (tags stripped, aria-hidden arrow dropped) = label + term.
    const name = inner.replace(/<span aria-hidden="true">[^<]*<\/span>/g, "").replace(/<[^>]+>/g, "");
    expect(name.trim()).toBe("用語集で開く 機能要件");
  });

  it("uses the active locale for the link prefix and label", async () => {
    const id = termId("機能要件");
    const out = await render("zh");
    expect(out).toContain(`href="/zh/glossary/${id}"`);
    expect(out).toContain("在术语表中打开");
  });

  it("anchors and links every term of the unit, ids matching termId(term)", async () => {
    const unit = await loadUnit(UNIT_ID);
    const out = await render("en");
    const articleIds = [...out.matchAll(/<article[^>]*\bid="([^"]*)"/g)].map((m) => m[1] ?? "");
    const ids = unit.terms.map((tm) => termId(tm.term));
    expect(articleIds).toEqual(ids);
    for (const id of ids) expect(out).toContain(`href="/en/glossary/${id}"`);
  });
});

describe("textbook terms on the real corpus", () => {
  it("every term is a dictionary headword whose senses include its unit, unique per unit", async () => {
    const [dict, units] = await Promise.all([loadDictionary(), loadAllUnits()]);
    for (const unit of units) {
      const ids = unit.terms.map((tm) => termId(tm.term));
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) {
        const entry = dict.byId.get(id);
        expect(entry, `${unit.unit_id}: ${id}`).toBeDefined();
        expect(entry!.senses.map((s) => s.unitId)).toContain(unit.unit_id);
      }
    }
  });
});

// ---- Stage 7 Phase 3 Task 8 (D-196 §0-9, D-195 §3〜§8): a v2 unit -------------------------
// The hand-written v2 sample (management-10-27-u03, every figure kind) fed straight into the
// reader: 目標 → 総表 → terms (一句話 → 図 → 展開 → たとえ / 覚え方 → 考点 → この用語の過去問)
// → each 易混 pair after its later term → 要点 → 確認問題 → 読了.

const V2 = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../../lib/textbook/__fixtures__/v2-sample.json"), "utf-8"),
) as TextbookUnitV2;

async function renderV2(locale: "ja" | "zh" | "en"): Promise<string> {
  const [index, members] = await Promise.all([loadReaderIndex(), loadChumonMembers()]);
  const unit = normalizeUnit(V2, members);
  const el = await UnitReader({
    unit,
    place: unitPlace(index, V2.unit_id, locale),
    neighbors: neighbors(index, V2.unit_id),
    locale,
    senseiAnchorText: "ANCHOR",
    confirm: pickConfirm(unit, members),
  });
  return renderToStaticMarkup(
    h(NextIntlClientProvider, {
      locale,
      messages: messages(locale),
      children: h(LearningRecordProvider, { isOwner: false, children: el }),
    }),
  );
}

const articlesOf = (out: string) => [...out.matchAll(/<article[\s\S]*?<\/article>/g)].map((m) => m[0]);
const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;

describe("UnitReader v2 (SSR, D-196 §0-9 / D-195)", () => {
  it("orders goals → term table → articles → key points → #confirm → 読了; no v1 term index", async () => {
    const out = await renderV2("ja");
    const marks = ['data-part="goals"', 'data-part="overview"', "<article", 'data-part="key-points"', 'id="confirm"', 'data-part="read"'].map((m) =>
      at(out, m),
    );
    expect(marks).toEqual([...marks].sort((a, b) => a - b));
    expect(out).not.toContain('data-part="term-index"');
    expect(at(out, 'data-part="goals"')).toBeGreaterThan(at(out, "</h1>"));
  });

  it("goals: one item per goal, keywords as <strong>", async () => {
    const out = await renderV2("ja");
    const goals = out.match(/<section[^>]*data-part="goals"[\s\S]*?<\/section>/)![0];
    expect(count(goals, /<li/g)).toBe(V2.goals_jp.length);
    expect(goals).toContain("<strong");
    expect(goals).toMatch(/<strong[^>]*>回避<\/strong>/);
    expect(goals).toContain(tb("ja").goals);
  });

  it("term table: collapsible (open), the column headers, one row per term linking to its article", async () => {
    const out = await renderV2("zh");
    const table = out.match(/<details[^>]*data-part="overview"[\s\S]*?<\/details>/)![0];
    expect(table).toMatch(/<details[^>]*\bopen=""/);
    expect(table).toMatch(/<summary[^>]*>[\s\S]*?<\/summary>/);
    expect(table).toContain(tb("zh").overviewTable!.replace("{n}", String(V2.terms.length)));
    expect(table).toContain("定位");
    const hrefs = [...table.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(V2.terms.map((t) => termId(t.term)));
    expect(table).toContain("降低概率或影响");
    expect(count(table, /<tbody[\s\S]*?<\/tbody>/g)).toBe(1);
    expect(count(table.match(/<tbody[\s\S]*?<\/tbody>/)![0], /<tr/g)).toBe(V2.terms.length);
  });

  it("each article: one → fig → detail → analogy / hook → points → this term's past questions; id = termId", async () => {
    const out = await renderV2("ja");
    const arts = articlesOf(out);
    expect(arts).toHaveLength(V2.terms.length);
    arts.forEach((a, i) => {
      const t = V2.terms[i]!;
      expect(a).toMatch(new RegExp(`^<article[^>]*\\bid="${termId(t.term)}"`));
      const parts = [
        "one",
        "fig",
        "detail",
        ...(t.analogy_jp ? ["analogy"] : []),
        ...(t.hook_jp ? ["hook"] : []),
        "points",
        "term-past",
      ];
      const order = parts.map((p) => at(a, `data-part="${p}"`));
      expect(order, t.term).toEqual([...order].sort((x, y) => x - y));
      if (!t.analogy_jp) expect(a).not.toContain('data-part="analogy"');
      if (!t.hook_jp) expect(a).not.toContain('data-part="hook"');
      if (t.fig?.kind !== "svg") expect(a).toContain(`data-fig="${t.fig!.kind}"`);
    });
  });

  it("考点: one item per point with its 常考 / 易混 label", async () => {
    for (const locale of ["ja", "zh", "en"] as const) {
      const arts = articlesOf(await renderV2(locale));
      arts.forEach((a, i) => {
        const pts = V2.terms[i]!.points;
        const box = a.match(/<aside[^>]*data-part="points"[\s\S]*?<\/aside>/)![0];
        expect(count(box, /data-point=/g)).toBe(pts.length);
        for (const p of pts) {
          expect(box).toContain(`data-point="${p.kind}"`);
          expect(box).toContain(tb(locale)[p.kind === "exam" ? "pointExam" : "pointMix"]);
        }
      });
    }
  });

  it("inline markup: keywords <strong>, JP originals lang=ja, no raw markers anywhere", async () => {
    const ja = await renderV2("ja");
    expect(articlesOf(ja)[0]).toMatch(/data-part="one"[^>]*>[\s\S]*?<strong[^>]*>不確実な事象<\/strong>/);
    const zh = await renderV2("zh");
    expect(articlesOf(zh)[0]).toMatch(/<span lang="ja" data-inline="jp"[^>]*>プロジェクトリスクマネジメント<\/span>/);
    for (const out of [ja, zh, await renderV2("en")]) {
      expect(out).not.toContain("**");
      expect(out).not.toContain("[[jp:");
      expect(out).not.toContain("]]");
    }
  });

  it("the 回避 / 軽減 pair comes right after 軽減 (the later term), before the next article", async () => {
    const out = await renderV2("ja");
    const pairAt = at(out, 'data-part="pair"');
    const genAt = at(out, `id="${termId("軽減")}"`);
    const nextAt = at(out, `id="${termId("受容")}"`);
    expect(pairAt).toBeGreaterThan(out.indexOf("</article>", genAt));
    expect(pairAt).toBeLessThan(nextAt);
    const pair = out.match(/<section[^>]*data-part="pair"[\s\S]*?<\/section>/)![0];
    expect(count(pair, /<tbody[\s\S]*?<tr/g)).toBeGreaterThan(0);
    expect(count(pair, /<tr[^>]*data-key="true"/g)).toBe(V2.pairs[0]!.rows.filter((r) => r.key).length);
    expect(pair).toContain("小さくなって残る");
    expect(count(out, /data-part="pair"/g)).toBe(V2.pairs.length);
  });

  it("ja / zh / en have the same structure (terms, figures, steps, points, pairs, key points, goals)", async () => {
    const shape = (out: string) => ({
      articles: count(out, /<article/g),
      figs: count(out, /data-part="fig"/g),
      dots: count(out, /data-dot=/g),
      points: count(out, /data-point=/g),
      pairs: count(out, /data-part="pair"/g),
      keyPoints: count(out.match(/data-part="key-points"[\s\S]*?<\/section>/)![0], /<li/g),
      goals: count(out.match(/data-part="goals"[\s\S]*?<\/section>/)![0], /<li/g),
    });
    const [ja, zh, en] = await Promise.all([renderV2("ja"), renderV2("zh"), renderV2("en")]);
    expect(shape(zh)).toEqual(shape(ja));
    expect(shape(en)).toEqual(shape(ja));
    expect(shape(ja)).toMatchObject({ articles: 6, figs: 6, pairs: 1, keyPoints: 4, goals: 3 });
  });
});
