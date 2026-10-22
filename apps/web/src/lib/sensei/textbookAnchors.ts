// D-181 Phase C (§0-9) — the term and unit anchors: deterministic plain text built
// by the glossary term page and the textbook unit page (server components) and
// handed to the 「AI 先生に聞く」 button as a string. Pure (no I/O).
//
// Server-only by import: the fields are read with lib/textbook/reader's pick /
// pickTerm / toDataLang, and reader.ts imports node:fs, so a client module must not
// import this one (the quiz anchors in ./anchors stay client-safe).
//
// Same rules as ./anchors: JP original + the UI-locale translation only (ja → JP
// only); fields are read by name and lists follow their array order (senses in
// dictionary order, terms in unit order), so the text never depends on object key
// order. Each term carries its definition, explanation and memory hook — no
// analogy, no inline quiz, no past-exam list (a `#<question_id>` link only resolves
// on a quiz page). An empty translation drops that line rather than repeating the
// JP text.

import type { AppLocale } from "@/i18n/routing";
import type { DictEntry } from "@/lib/glossary/dictionary";
import { pick, pickTerm, toDataLang } from "@/lib/textbook/reader";
import type { TextbookUnit, UnitTerm } from "@/lib/textbook/types";

import { answerLanguageLine, LANGUAGE_NAME } from "./anchors";

const rec = (o: object) => o as unknown as Record<string, unknown>;

/** `label: value` lines for the non-empty fields of `t` in `locale`. */
function fieldLines(t: UnitTerm, locale: string, withName: boolean): string[] {
  const lines: string[] = [];
  const add = (label: string, value: string) => {
    if (value.trim() !== "") lines.push(`${label}: ${value}`);
  };
  if (withName) add("用語名", pickTerm(t, locale));
  add("定義", pick(rec(t), "definition", locale));
  add("解説", pick(rec(t), "explanation", locale));
  add("覚え方", pick(rec(t), "memory_hook", locale));
  return lines;
}

/** The JP block, then (zh / en) the UI-locale block, under `####` headings. */
function termBody(t: UnitTerm, locale: AppLocale): string[] {
  const out = ["#### 日本語原文", ...fieldLines(t, "ja", false)];
  const dl = toDataLang(locale);
  if (dl !== "jp") {
    const tr = fieldLines(t, locale, true);
    if (tr.length > 0) out.push(`#### ${LANGUAGE_NAME[dl]}`, ...tr);
  }
  return out;
}

/**
 * The glossary term anchor: the headword and every sense (one per textbook unit
 * that teaches it, in dictionary order), each under its unit's JP title
 * (`unitTitlesJp`: unitId → title_jp; the unit id when absent).
 */
export function termAnchor(entry: DictEntry, locale: AppLocale, unitTitlesJp: Record<string, string>): string {
  const n = entry.senses.length;
  const out: string[] = [
    "# 教材",
    answerLanguageLine(locale),
    "",
    "## 用語",
    "学習者はいま辞典でこの用語を見ています。",
    `用語: ${entry.term}`,
  ];
  if (n > 1) out.push(`この用語は ${n} つの単元で扱われています。各単元での意味をすべて示します。`);
  entry.senses.forEach((s, i) => {
    const title = Object.prototype.hasOwnProperty.call(unitTitlesJp, s.unitId) ? unitTitlesJp[s.unitId] : undefined;
    out.push("", `### 意味 ${i + 1}: 単元「${title ?? s.unitId}」`, ...termBody(s.term, locale));
  });
  return out.join("\n");
}

/** The textbook unit anchor: the unit's title and summary, then every term in unit order. */
export function unitAnchor(unit: TextbookUnit, locale: AppLocale): string {
  const dl = toDataLang(locale);
  const head = (lang: string): string[] => {
    const lines: string[] = [];
    const title = pick(rec(unit), "title", lang);
    const summary = pick(rec(unit), "unit_summary", lang);
    if (title.trim() !== "") lines.push(`単元名: ${title}`);
    if (summary.trim() !== "") lines.push(`概要: ${summary}`);
    return lines;
  };
  const out: string[] = [
    "# 教材",
    answerLanguageLine(locale),
    "",
    "## 単元",
    "学習者はいま教科書でこの単元を読んでいます。",
    `単元 ID: ${unit.unit_id}`,
    "",
    "### 日本語原文",
    ...head("ja"),
  ];
  if (dl !== "jp") {
    const tr = head(locale);
    if (tr.length > 0) out.push("", `### ${LANGUAGE_NAME[dl]}`, ...tr);
  }
  out.push("", `## この単元の用語（${unit.terms.length} 語、単元での順）`);
  unit.terms.forEach((t, i) => {
    out.push("", `### ${i + 1}. ${t.term}`, ...termBody(t, locale));
  });
  return out.join("\n");
}
