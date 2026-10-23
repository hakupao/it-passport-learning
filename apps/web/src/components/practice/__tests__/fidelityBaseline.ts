// Stage 7 Phase 1 Task 1 (S132) — display-fidelity baseline of the current quiz renderer.
//
// Shared by the capture test (Task 1) and the fidelity test of the new practice view (Task 8),
// so both sides normalize and hash with exactly the same code. NOT a test file.
//
// Rows hold hashes / booleans / letter indexes only — never question text (IPA copyright).
// Imports only QuizRichText + quizModel/quizReader (QuizSet is deleted by a later task).

import { createHash } from "node:crypto";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ChoiceBody, StemBlocks } from "@/components/quiz/QuizRichText";
import {
  CHOICE_LETTERS,
  loadAllQuestions,
  localizedChoices,
  localizedExplanation,
  localizedStem,
  type QuizQuestion,
} from "@/lib/quiz/quizReader";

const ROOT = path.resolve(__dirname, "../../../../../..");
export const BASELINE_PATH = path.join(ROOT, "evidence/phase5/stage_07_ui/baseline.jsonl");

export type BaselineLocale = "ja" | "zh" | "en";
export const BASELINE_LOCALES: readonly BaselineLocale[] = ["ja", "zh", "en"];

type Four<T> = [T, T, T, T];

export interface BaselineRow {
  qid: string;
  locale: BaselineLocale;
  /** textHash of source_label */
  source: string;
  /** StemBlocks(stem_jp) — identical on all three locale rows */
  stemJp: string;
  /** ChoiceBody(JP choice) per ア..エ */
  choicesJp: Four<string>;
  /** StemBlocks(localizedStem); null on ja rows */
  stemTr: string | null;
  /** ChoiceBody(localizedChoices) per ア..エ; all null on ja rows */
  choicesTr: Four<string | null>;
  /** imageHash(src) of the question figure (basename only), or null */
  figure: string | null;
  /** imageHash of each choice's <img> as rendered for the row locale, or null */
  choiceFigures: Four<string | null>;
  /** textHash of localizedExplanation().correct, or null (no explanation) */
  explCorrect: string | null;
  /** [letter index 0–3, textHash] per distractor, canonical order */
  explDistractors: [number, string][];
  points: string[];
  suspect: boolean;
}

const SIG_TAGS = ["pre", "table", "tr", "th", "td", "img", "br", "ul", "li"] as const;
// Opening/closing tags of these become a line break; th/td become a space (cells stay apart).
const BLOCK_TAGS = new Set([
  "p", "div", "pre", "table", "thead", "tbody", "tfoot", "tr", "caption",
  "ul", "ol", "li", "dl", "dt", "dd",
]);
const CELL_TAGS = new Set(["th", "td"]);

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
};

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (m, ent: string) => {
    if (ent[0] === "#") {
      const cp = ent[1] === "x" || ent[1] === "X" ? parseInt(ent.slice(2), 16) : parseInt(ent.slice(1), 10);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : m;
    }
    return NAMED_ENTITIES[ent] ?? m;
  });
}

/**
 * Visible text of rendered HTML + a tag signature.
 * Text nodes are kept verbatim (entities decoded; no whitespace collapse, so <pre> indentation and
 * blank lines count). `<br>` → `\n`. A block boundary (open or close) adds `\n` only when the text
 * so far does not already end with `\n`; a th/td boundary adds a space only when it does not already
 * end with whitespace — synthetic separators never stack, so extra wrapper elements change nothing.
 * The whole field is trimmed, then `\n#sig pre=N table=N tr=N th=N td=N img=N br=N ul=N li=N`
 * (opening-tag counts) is appended.
 */
export function fieldText(html: string): string {
  const counts = Object.fromEntries(SIG_TAGS.map((t) => [t, 0])) as Record<string, number>;
  let out = "";
  const tagRe = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  let last = 0;
  for (let m = tagRe.exec(html); m; m = tagRe.exec(html)) {
    out += decodeEntities(html.slice(last, m.index));
    last = tagRe.lastIndex;
    const name = m[2];
    if (!name) continue; // comment
    const tag = name.toLowerCase();
    if (!m[1] && tag in counts) counts[tag]! += 1;
    if (tag === "br") out += "\n";
    else if (BLOCK_TAGS.has(tag)) {
      if (!out.endsWith("\n")) out += "\n";
    } else if (CELL_TAGS.has(tag)) {
      if (!/\s$/.test(out)) out += " ";
    }
  }
  out += decodeEntities(html.slice(last));
  const sig = SIG_TAGS.map((t) => `${t}=${counts[t]}`).join(" ");
  return `${out.trim()}\n#sig ${sig}`;
}

function sha16(s: string): string {
  return createHash("sha256").update(s, "utf8").digest("hex").slice(0, 16);
}

/** sha256(fieldText(html)), first 16 hex. */
export function textHash(html: string): string {
  return sha16(fieldText(html));
}

/**
 * Image field, first 16 hex of sha256. The basename keeps its extension (x.webp).
 * With `alt` (choice figures — the alt carries the choice text): sha256(basename + "|" + alt).
 * Without (question figure — its alt is a generic i18n label): sha256(basename).
 */
export function imageHash(src: string, alt?: string): string {
  const base = path.posix.basename(src);
  return sha16(alt === undefined ? base : `${base}|${alt}`);
}

/** A plain string (source label, explanation text) hashed as React would render it as text. */
function plainHash(text: string): string {
  return textHash(renderToStaticMarkup(h("span", null, text)));
}

/** The <img> ChoiceBody rendered (choice_figures questions), as imageHash, or null. */
function renderedImageHash(html: string): string | null {
  const img = /<img\b[^>]*>/.exec(html)?.[0];
  if (!img) return null;
  const attr = (name: string) => decodeEntities(new RegExp(`\\s${name}="([^"]*)"`).exec(img)?.[1] ?? "");
  return imageHash(attr("src"), attr("alt"));
}

const four = <T>(f: (letter: string, i: number) => T): Four<T> =>
  CHOICE_LETTERS.map((L, i) => f(L, i)) as Four<T>;

function rowsFor(q: QuizQuestion): BaselineRow[] {
  const stemJp = textHash(renderToStaticMarkup(h(StemBlocks, { stem: q.stem_jp })));
  const choiceHtml = (text: string, letter: string) =>
    renderToStaticMarkup(
      h(ChoiceBody, { text, jpText: q.choices_jp[letter], figure: q.choice_figures?.[letter] }),
    );
  const jpHtml = four((L) => choiceHtml(q.choices_jp[L] ?? "", L));

  return BASELINE_LOCALES.map((locale): BaselineRow => {
    const isJa = locale === "ja";
    const trHtml = isJa ? null : localizedChoices(q, locale).map((c) => choiceHtml(c.text, c.letter));
    const shownHtml = trHtml ?? jpHtml;
    const ex = localizedExplanation(q, locale);
    return {
      qid: q.id,
      locale,
      source: plainHash(q.source_label),
      stemJp,
      choicesJp: four((_L, i) => textHash(jpHtml[i]!)),
      stemTr: isJa ? null : textHash(renderToStaticMarkup(h(StemBlocks, { stem: localizedStem(q, locale) }))),
      choicesTr: four((_L, i) => (trHtml ? textHash(trHtml[i]!) : null)),
      figure: q.figure ? imageHash(`/quiz-figures/${q.figure}.webp`) : null,
      choiceFigures: four((_L, i) => renderedImageHash(shownHtml[i]!)),
      explCorrect: ex ? plainHash(ex.correct) : null,
      explDistractors: ex
        ? ex.distractors.map((d): [number, string] => [
            (CHOICE_LETTERS as readonly string[]).indexOf(d.letter),
            plainHash(d.text),
          ])
        : [],
      points: ex ? ex.points.map(plainHash) : [],
      suspect: ex ? ex.suspect : false,
    };
  });
}

/** Baseline rows for every question (loader order) × ja/zh/en, from the current renderer. */
export async function baselineRows(): Promise<BaselineRow[]> {
  return (await loadAllQuestions()).flatMap(rowsFor);
}
