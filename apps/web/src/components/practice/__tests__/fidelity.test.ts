// Stage 7 Phase 1 Task 8 (D-189 §9, Rule A) — display fidelity of the new practice view vs the
// frozen baseline of the old renderer (evidence/phase5/stage_07_ui/baseline.jsonl, Task 1).
//
// For 2900 questions × ja/zh/en, render PracticeQuestion + ExplanationPane + AnswerBar in the answered
// state (picked = keyed answer; zh/en with the translation shown; explanation language = the row
// locale), cut every data-fid field out of the HTML and hash it with Task 1's own helpers
// (fieldText / textHash / imageHash / renderedImageHash / plainHash). Every field must equal the
// baseline: 0 differences. The baseline is never regenerated here.
//
// Field mapping (baseline ← data-fid):
//   source ← source · stemJp ← stem · stemTr ← stem-tr · choicesJp[i] ← choice-i ·
//   choicesTr[i] ← choice-tr-i · figure ← figure (img src basename) ·
//   choiceFigures[i] ← choice-figure-i (the img inside, basename|alt) · explCorrect ← expl-correct ·
//   explDistractors [i, h] ← expl-i · points[i] ← point-i · suspect ← presence of suspect.
// A choice_figures question renders ONE <img> per choice whose alt follows the shown language; the
// wrapper carries choice-i, choice-tr-i (when shown) and choice-figure-i, so all three fields read it.
//
// 中問 fold (Review Focus 4): the full pass renders stems unfolded (exact hash). A second pass folds
// every member of every group with a fold point and checks text(stem-preamble) + J + text(stem) ===
// text(full baseline stem), where text = fieldText minus its #sig line and J is the paragraph break
// the fold cuts: "\n\n" inside a text block, " \n" after a table (a cell separator + row break that
// fieldText trims at a field's edge). The tag signatures must add up to the full stem's.
//
// Evidence / failure output carries ids, field names and counts only — never question text.

import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    h("a", { href, className }, children),
}));

import { StemBlocks } from "@/components/quiz/QuizRichText";
import type { TermCard } from "@/lib/glossary/dictionary";
import type { ChoiceLetter } from "@/lib/learning/record";
import { loadChumonGroups } from "@/lib/practice/practiceReader";
import type { ChumonGroup } from "@/lib/practice/practiceIndex";
import { loadAllQuestions, type QuizQuestion } from "@/lib/quiz/quizReader";

import {
  BASELINE_LOCALES,
  BASELINE_PATH,
  fieldText,
  imageHash,
  plainHash,
  renderedImageHash,
  textHash,
  type BaselineLocale,
  type BaselineRow,
} from "./fidelityBaseline";
import { attr, fidAll, renderAnswerBar, renderFace, renderPane } from "./practiceRender";

let QS: QuizQuestion[] = [];
let GROUPS: ChumonGroup[] = [];
let BASE = new Map<string, BaselineRow>();
beforeAll(async () => {
  [QS, GROUPS] = await Promise.all([loadAllQuestions(), loadChumonGroups()]);
  const rows = readFileSync(BASELINE_PATH, "utf-8").trim().split("\n").map((l) => JSON.parse(l) as BaselineRow);
  BASE = new Map(rows.map((r) => [`${r.qid}|${r.locale}`, r]));
}, 60_000);

interface Diff {
  qid: string;
  locale: BaselineLocale;
  field: string;
}

/** Fake dictionary cards for every term of the question, so the key-term highlight runs on all 2900. */
const cardsFor = (q: QuizQuestion): Record<string, TermCard> =>
  Object.fromEntries(
    q.terms.map((t) => [t, { id: `t-${t}`, term: t, gloss: t, definition: "", memoryHook: "", senseCount: 1, questionCount: 1 }]),
  );

/** One element per fid (throws on duplicates); undefined when absent. */
function one(html: string, fid: string): string | undefined {
  const all = fidAll(html, fid);
  if (all.length > 1) throw new Error(`data-fid=${fid} occurs ${all.length} times`);
  return all[0]?.inner;
}

const body = (html: string): { text: string; sig: string } => {
  const f = fieldText(html);
  const k = f.lastIndexOf("\n#sig ");
  return { text: f.slice(0, k), sig: f.slice(k + 6) };
};
const sigSum = (a: string, b: string): string =>
  a
    .split(" ")
    .map((kv, i) => {
      const [k, v] = kv.split("=");
      return `${k}=${Number(v) + Number(b.split(" ")[i]!.split("=")[1])}`;
    })
    .join(" ");

describe("display fidelity vs frozen baseline (2900 × ja/zh/en)", () => {
  it("every data-fid field equals the baseline; choices in ア〜エ order; 解答 letter = key", () => {
    const t0 = Date.now();
    const diffs: Diff[] = [];
    const perField: Record<string, number> = {};
    let compared = 0;
    let rendered = 0;
    const note = (qid: string, locale: BaselineLocale, field: string, ok: boolean): void => {
      compared++;
      if (ok) return;
      diffs.push({ qid, locale, field });
      perField[field] = (perField[field] ?? 0) + 1;
    };

    for (const q of QS) {
      for (const locale of BASELINE_LOCALES) {
        const b = BASE.get(`${q.id}|${locale}`);
        if (!b) {
          note(q.id, locale, "row-missing", false);
          continue;
        }
        const isJa = locale === "ja";
        const face = renderFace(q, locale, { picked: q.correct_answer as ChoiceLetter, showTranslation: !isJa });
        const pane = renderPane(q, locale, q.correct_answer as ChoiceLetter, cardsFor(q));
        const bar = renderAnswerBar(q, locale);
        rendered++;

        const src = one(face, "source");
        note(q.id, locale, "source", src !== undefined && textHash(src) === b.source);
        const stem = one(face, "stem");
        note(q.id, locale, "stem", stem !== undefined && textHash(stem) === b.stemJp);
        note(q.id, locale, "stem-preamble", fidAll(face, "stem-preamble").length === 0);
        const stemTr = one(face, "stem-tr");
        note(q.id, locale, "stem-tr", b.stemTr === null ? stemTr === undefined : stemTr !== undefined && textHash(stemTr) === b.stemTr);

        const order: number[] = [];
        for (let i = 0; i < 4; i++) {
          const c = fidAll(face, `choice-${i}`);
          note(q.id, locale, `choice-${i}`, c.length === 1 && textHash(c[0]!.inner) === b.choicesJp[i]);
          order.push(c[0]?.at ?? -1);
          const tr = one(face, `choice-tr-${i}`);
          const want = b.choicesTr[i];
          note(q.id, locale, `choice-tr-${i}`, want === null ? tr === undefined : tr !== undefined && textHash(tr) === want);
          const cf = one(face, `choice-figure-${i}`);
          const wantF = b.choiceFigures[i];
          note(q.id, locale, `choice-figure-${i}`, wantF === null ? cf === undefined : cf !== undefined && renderedImageHash(cf) === wantF);
        }
        note(q.id, locale, "choice-order", order.every((x, i) => x >= 0 && (i === 0 || x > order[i - 1]!)));

        const figs = fidAll(face, "figure");
        note(
          q.id,
          locale,
          "figure",
          b.figure === null ? figs.length === 0 : figs.length === 1 && imageHash(attr(figs[0]!.open, "src")) === b.figure,
        );

        const ec = one(pane, "expl-correct");
        note(q.id, locale, "expl-correct", b.explCorrect === null ? ec === undefined : ec !== undefined && textHash(ec) === b.explCorrect);
        const want = new Map(b.explDistractors);
        for (let i = 0; i < 4; i++) {
          const d = one(pane, `expl-${i}`);
          const w = want.get(i);
          note(q.id, locale, `expl-${i}`, w === undefined ? d === undefined : d !== undefined && textHash(d) === w);
        }
        for (let i = 0; i < 3; i++) {
          const p = one(pane, `point-${i}`);
          const w = b.points[i];
          note(q.id, locale, `point-${i}`, w === undefined ? p === undefined : p !== undefined && textHash(p) === w);
        }
        note(q.id, locale, "suspect", (one(pane, "suspect") !== undefined) === b.suspect);
        note(q.id, locale, "answer", one(bar, "answer") === q.correct_answer);
      }
    }

    const ms = Date.now() - t0;
    console.log(
      `[fidelity] rendered ${rendered} (q×locale), fields compared ${compared}, diffs ${diffs.length}, ` +
        `per-field ${JSON.stringify(perField)}, ${ms} ms`,
    );
    expect(rendered).toBe(8700);
    expect(diffs.slice(0, 20)).toEqual([]);
    expect(diffs.length).toBe(0);
  }, 240_000);

  it("suspect questions = 84, questions with 3 points = 22 (corpus anchors)", () => {
    expect(QS.filter((q) => q.explanation?.key_guard.suspect)).toHaveLength(84);
    expect(QS.filter((q) => q.explanation?.points.length === 3)).toHaveLength(22);
    const rows = [...BASE.values()];
    expect(rows.filter((r) => r.suspect)).toHaveLength(84 * 3);
    expect(rows.filter((r) => r.points.length === 3)).toHaveLength(22 * 3);
  });
});

describe("中問 fold keeps the full stem text (Review Focus 4)", () => {
  it("stem-preamble + stem = the baseline stem for every folded member", () => {
    const byId = new Map(QS.map((q) => [q.id, q]));
    const diffs: { qid: string; why: string }[] = [];
    const joins: Record<string, number> = {};
    let members = 0;
    for (const g of GROUPS) {
      const n = g.preambleChars.jp;
      if (n === null) continue;
      for (const id of g.memberIds) {
        const q = byId.get(id)!;
        members++;
        const fullHtml = renderToStaticMarkup(h(StemBlocks, { stem: q.stem_jp }));
        if (textHash(fullHtml) !== BASE.get(`${id}|ja`)!.stemJp) diffs.push({ qid: id, why: "renderer≠baseline" });
        const face = renderFace(q, "ja", { picked: null, preambleChars: n, foldPreamble: true });
        const pre = one(face, "stem-preamble");
        const rest = one(face, "stem");
        if (pre === undefined || rest === undefined) {
          diffs.push({ qid: id, why: "not folded" });
          continue;
        }
        const F = body(fullHtml);
        const A = body(pre);
        const B = body(rest);
        const J = F.text.startsWith(A.text) && F.text.endsWith(B.text) ? F.text.slice(A.text.length, F.text.length - B.text.length) : null;
        if (J === null || (J !== "\n\n" && J !== " \n") || F.text.length !== A.text.length + J.length + B.text.length) {
          diffs.push({ qid: id, why: "text" });
          continue;
        }
        if (sigSum(A.sig, B.sig) !== F.sig) diffs.push({ qid: id, why: "sig" });
        joins[JSON.stringify(J)] = (joins[JSON.stringify(J)] ?? 0) + 1;
      }
    }
    console.log(`[fidelity] chumon folded members ${members}, joins ${JSON.stringify(joins)}, diffs ${diffs.length}`);
    expect(members).toBe(200);
    expect(diffs.slice(0, 20)).toEqual([]);
  }, 60_000);
});

describe("pre-wrap / pre survive (R3: the CSS module QuizRichText imports)", () => {
  it("qStem / dataTable cells / pairValue keep pre-wrap, qCode keeps pre", () => {
    const dir = path.resolve(__dirname, "../../quiz");
    const src = readFileSync(path.join(dir, "QuizRichText.tsx"), "utf-8");
    const imp = /import\s+styles\s+from\s+"([^"]+\.module\.css)"/.exec(src)?.[1];
    expect(imp).toBeDefined();
    const css = readFileSync(path.resolve(dir, imp!), "utf-8");
    const rule = (sel: RegExp): string => {
      const m = new RegExp(`(?:^|\\n|\\})\\s*${sel.source}\\s*\\{([^}]*)\\}`).exec(css);
      if (!m) throw new Error(`no rule ${sel.source}`);
      return m[1]!;
    };
    expect(rule(/\.qStem/)).toMatch(/white-space:\s*pre-wrap/);
    expect(rule(/\.qCode/)).toMatch(/white-space:\s*pre;/);
    expect(rule(/\.dataTable th,\s*\.dataTable td/)).toMatch(/white-space:\s*pre-wrap/);
    expect(rule(/\.pairValue/)).toMatch(/white-space:\s*pre-wrap/);
    // and the practice skin never overrides white-space
    expect(readFileSync(path.resolve(__dirname, "../practice.module.css"), "utf-8")).not.toMatch(/white-space\s*:/);
  });

  it("plainHash is the baseline's text rule (sanity: a source label hashes the same both ways)", () => {
    const q = QS[0]!;
    expect(plainHash(q.source_label)).toBe(BASE.get(`${q.id}|ja`)!.source);
  });
});
