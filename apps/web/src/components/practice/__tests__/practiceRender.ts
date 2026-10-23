// Stage 7 Phase 1 Task 8 — shared SSR helpers for the practice component tests (NOT a test file).
// Callers must vi.mock("@/i18n/navigation") themselves (TermChip renders a Link).

import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";

import { SenseiHost } from "@/components/sensei/AskSensei";
import type { TermCard } from "@/lib/glossary/dictionary";
import type { ChoiceLetter } from "@/lib/learning/record";
import type { QuizQuestion } from "@/lib/quiz/quizModel";

import { AnswerBar } from "../AnswerBar";
import { ExplanationPane } from "../ExplanationPane";
import { PracticeQuestion, type PracticeQuestionProps } from "../PracticeQuestion";
import { fieldText } from "./fidelityBaseline";

export type Messages = Record<string, unknown>;
const catalogs = new Map<string, Messages>();
export function messagesFor(locale: string): Messages {
  let m = catalogs.get(locale);
  if (!m) {
    m = JSON.parse(readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8")) as Messages;
    catalogs.set(locale, m);
  }
  return m;
}

function withIntl(locale: string, child: React.ReactElement): string {
  return renderToStaticMarkup(
    h(NextIntlClientProvider, { locale, messages: messagesFor(locale), timeZone: "Asia/Tokyo", children: h(SenseiHost, { children: child }) }),
  );
}

export function renderFace(q: QuizQuestion, locale: string, over: Partial<PracticeQuestionProps> = {}): string {
  const props: PracticeQuestionProps = {
    q,
    locale,
    picked: null,
    onPick: () => {},
    recent: [],
    stars: 2,
    showTranslation: false,
    onToggleTranslation: () => {},
    preambleChars: null,
    foldPreamble: false,
    ...over,
  };
  return withIntl(locale, h(PracticeQuestion, props));
}

export function renderPane(
  q: QuizQuestion,
  locale: string,
  picked: ChoiceLetter | null,
  termCards: Record<string, TermCard> = {},
  isOwner = false,
): string {
  return withIntl(locale, h(ExplanationPane, { q, locale, picked, termCards, isOwner }));
}

export function renderAnswerBar(q: QuizQuestion, locale: string): string {
  return withIntl(locale, h(AnswerBar, { q }));
}

const VOID = new Set(["img", "br", "hr", "input", "meta", "link", "source", "wbr", "area", "col", "embed"]);

export interface FidMatch {
  /** the element's opening tag */
  open: string;
  /** inner HTML ("" for a void element) */
  inner: string;
  /** offset of the opening tag in the document */
  at: number;
}

/**
 * Every element whose data-fid (space-separated tokens) contains `fid`, in document order.
 * Inner HTML is cut at the matching close tag by counting nested same-name tags.
 */
export function fidAll(html: string, fid: string): FidMatch[] {
  const out: FidMatch[] = [];
  const openRe = /<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\sdata-fid="([^"]*)"[^>]*>/g;
  for (let m = openRe.exec(html); m; m = openRe.exec(html)) {
    if (!m[2]!.split(" ").includes(fid)) continue;
    const tag = m[1]!.toLowerCase();
    const start = m.index + m[0].length;
    if (VOID.has(tag) || m[0].endsWith("/>")) {
      out.push({ open: m[0], inner: "", at: m.index });
      continue;
    }
    const tagRe = new RegExp(`<(/?)${tag}\\b[^>]*>`, "gi");
    tagRe.lastIndex = start;
    let depth = 1;
    let end = -1;
    for (let t = tagRe.exec(html); t; t = tagRe.exec(html)) {
      depth += t[1] ? -1 : 1;
      if (depth === 0) {
        end = t.index;
        break;
      }
    }
    if (end < 0) throw new Error(`unclosed <${tag}> for data-fid=${fid}`);
    out.push({ open: m[0], inner: html.slice(start, end), at: m.index });
  }
  return out;
}

/** The single element carrying `fid`, or null; throws when it occurs more than once. */
export function fidOne(html: string, fid: string): FidMatch | null {
  const all = fidAll(html, fid);
  if (all.length > 1) throw new Error(`data-fid=${fid} occurs ${all.length} times`);
  return all[0] ?? null;
}

/** Decoded value of an attribute in an opening tag ("" when absent). */
export function attr(openTag: string, name: string): string {
  const v = new RegExp(`\\s${name}="([^"]*)"`).exec(openTag)?.[1] ?? "";
  return v
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Visible text of an HTML fragment (Task 1's fieldText without its #sig line: tags out, entities decoded). */
export function textOf(html: string): string {
  const f = fieldText(html);
  return f.slice(0, f.lastIndexOf("\n#sig "));
}
