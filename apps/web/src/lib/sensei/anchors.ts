// D-181 §0-4 — anchor context: deterministic plain text built from audited
// content already on the page. JP original + the UI-locale translation only
// (ja → JP only). Same input → byte-identical output: no timestamps, no random
// values, no object-key-order dependence (choices follow ア/イ/ウ/エ, terms follow
// the q.terms array), so the Anthropic prompt cache keeps hitting.
//
// The learner's choice is re-judged against the current correct_answer: the
// learning record's `correct` is the verdict at answer time (D-181 global
// constraint, Phase 3 申し送り (a)).

import type { TermCard } from "@/lib/glossary/dictionary";
import type { AppLocale } from "@/i18n/routing";
import {
  CHOICE_LETTERS,
  localizedChoices,
  localizedExplanation,
  localizedStem,
  toDataLang,
  type LocalizedExplanation,
  type QuizQuestion,
} from "@/lib/quiz/quizModel";

const LANGUAGE_NAME = { jp: "日本語", zh: "簡体字中国語", en: "英語" } as const;

function answerLanguageLine(locale: AppLocale): string {
  return `回答言語: ${LANGUAGE_NAME[toDataLang(locale)]}`;
}

function choiceLines(q: QuizQuestion, texts: Record<string, string>): string[] {
  return CHOICE_LETTERS.map((L) => {
    const text = texts[L]?.trim() || (q.choice_figures?.[L] ? "（図）" : "");
    return `${L}: ${text}`;
  });
}

function explanationLines(e: LocalizedExplanation, correct: string): string[] {
  const lines = [`正解（${correct}）の理由: ${e.correct}`];
  for (const d of e.distractors) lines.push(`${d.letter} が誤りの理由: ${d.text}`);
  for (const p of e.points) lines.push(`要点: ${p}`);
  return lines;
}

function termLines(q: QuizQuestion, termCards: Record<string, TermCard>): string[] {
  const lines: string[] = [];
  for (const term of q.terms) {
    const c = termCards[term];
    if (!c) continue;
    const head = c.gloss && c.gloss !== c.term ? `${c.term}（${c.gloss}）` : c.term;
    lines.push(`- ${head}: ${c.definition}`);
    if (c.memoryHook) lines.push(`  覚え方: ${c.memoryHook}`);
  }
  return lines;
}

export function questionAnchor(
  q: QuizQuestion,
  locale: AppLocale,
  ctx: { choice?: string; termCards: Record<string, TermCard> },
): string {
  const dl = toDataLang(locale);
  const label = LANGUAGE_NAME[dl];
  const translated = dl !== "jp";
  const out: string[] = [
    "# 教材",
    answerLanguageLine(locale),
    "",
    "## 過去問",
    `問題 ID: #${q.id}`,
    `出典: ${q.source_label}`,
  ];
  if (q.has_figure || q.choice_figures) {
    out.push("この問題には図があります（AI 先生は図を見られません）。");
  }

  out.push("", "### 問題文（日本語原文）", q.stem_jp);
  if (translated) out.push("", `### 問題文（${label}）`, localizedStem(q, locale));

  out.push("", "### 選択肢（日本語原文）", ...choiceLines(q, q.choices_jp));
  if (translated) {
    const texts: Record<string, string> = {};
    for (const c of localizedChoices(q, locale)) texts[c.letter] = c.text;
    out.push("", `### 選択肢（${label}）`, ...choiceLines(q, texts));
  }

  out.push("", `正解: ${q.correct_answer}`);
  if (q.explanation?.key_guard?.suspect) out.push("注意: 正解は確認中です（この問題の正解キーは検証できていません）。");
  const verdict = ctx.choice === undefined ? "未解答" : `${ctx.choice}（${ctx.choice === q.correct_answer ? "正解" : "不正解"}）`;
  out.push(`学習者の解答: ${verdict}`);

  const jpExpl = localizedExplanation(q, "ja");
  if (jpExpl) {
    out.push("", "### 解説（日本語原文）", ...explanationLines(jpExpl, q.correct_answer));
    const trExpl = translated ? localizedExplanation(q, locale) : null;
    if (trExpl) out.push("", `### 解説（${label}）`, ...explanationLines(trExpl, q.correct_answer));
  }

  const terms = termLines(q, ctx.termCards);
  if (terms.length > 0) out.push("", `### 関連用語（定義は${label}）`, ...terms);

  return out.join("\n");
}
