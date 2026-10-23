// Stage 7 Phase 1 Task 1 (S132) — display-fidelity baseline of the current quiz renderer.
//
// Shared by the capture test (Task 1) and the fidelity test of the new practice view (Task 8),
// so both sides normalize and hash with exactly the same code. NOT a test file.
//
// Rows hold hashes / booleans / letter indexes only — never question text (IPA copyright).
// Imports only QuizRichText + quizModel/quizReader (QuizSet is deleted by a later task).

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
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
  /** imageHash of the question figure (alt = Quiz.figureAlt of the row locale), or null */
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
 * Normalized visible text of rendered HTML + a tag signature.
 * Tags stripped, `<br>` and block boundaries → `\n`, th/td boundaries → space, entities decoded,
 * runs of non-newline whitespace → one space, each line trimmed, empty lines dropped; then
 * `\n#sig pre=N table=N tr=N th=N td=N img=N br=N ul=N li=N` (opening-tag counts).
 */
export function fieldText(html: string): string {
  const counts = Object.fromEntries(SIG_TAGS.map((t) => [t, 0])) as Record<string, number>;
  const stripped = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (_m, close: string, name: string) => {
      const tag = name.toLowerCase();
      if (!close && tag in counts) counts[tag]! += 1;
      if (tag === "br" || BLOCK_TAGS.has(tag)) return "\n";
      if (CELL_TAGS.has(tag)) return " ";
      return "";
    });
  const text = decodeEntities(stripped)
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/g, " ").trim())
    .filter((line) => line !== "")
    .join("\n");
  const sig = SIG_TAGS.map((t) => `${t}=${counts[t]}`).join(" ");
  return `${text}\n#sig ${sig}`;
}

function sha16(s: string): string {
  return createHash("sha256").update(s, "utf8").digest("hex").slice(0, 16);
}

/** sha256(fieldText(html)), first 16 hex. */
export function textHash(html: string): string {
  return sha16(fieldText(html));
}

/** sha256(basename(src) + "|" + alt), first 16 hex. The basename keeps its extension (x.webp). */
export function imageHash(src: string, alt: string): string {
  return sha16(`${path.posix.basename(src)}|${alt}`);
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

function figureAlt(locale: BaselineLocale): string {
  const file = path.join(ROOT, `apps/web/messages/${locale}.json`);
  return (JSON.parse(readFileSync(file, "utf-8")) as { Quiz: { figureAlt: string } }).Quiz.figureAlt;
}

const four = <T>(f: (letter: string, i: number) => T): Four<T> =>
  CHOICE_LETTERS.map((L, i) => f(L, i)) as Four<T>;

function rowsFor(q: QuizQuestion, alts: Record<BaselineLocale, string>): BaselineRow[] {
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
      figure: q.figure ? imageHash(`/quiz-figures/${q.figure}.webp`, alts[locale]) : null,
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
  const questions = await loadAllQuestions();
  const alts = { ja: figureAlt("ja"), zh: figureAlt("zh"), en: figureAlt("en") };
  return questions.flatMap((q) => rowsFor(q, alts));
}
