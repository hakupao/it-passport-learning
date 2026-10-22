// D-181 §0-4 — anchor context: deterministic plain text built from audited
// content already on the page. JP original + the UI-locale translation only
// (ja → JP only). Same input → byte-identical output: no timestamps, no random
// values, no object-key-order dependence (choices follow ア/イ/ウ/エ, terms follow
// the q.terms array), so the Anthropic prompt cache keeps hitting.
//
// The learner's choice is re-judged against the current correct_answer: the
// learning record's `correct` is the verdict at answer time (D-181 global
// constraint, Phase 3 申し送り (a)).
//
// reviewAnchor (Phase B) is the topic-review anchor; its review task lines live in
// the anchor block, so SENSEI_SYSTEM_INSTRUCTION stays one byte-stable constant.

import type { TermCard } from "@/lib/glossary/dictionary";
import type { AppLocale } from "@/i18n/routing";
import type { LearningRecord, QuestionResult } from "@/lib/learning/record";
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

function termLines(terms: readonly string[], termCards: Record<string, TermCard>): string[] {
  const lines: string[] = [];
  for (const term of terms) {
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

  const terms = termLines(q.terms, ctx.termCards);
  if (terms.length > 0) out.push("", `### 関連用語（定義は${label}）`, ...terms);

  return out.join("\n");
}


// ── Phase B: topic review ────────────────────────────────────────────────────

export const REVIEW_MAX_WRONG = 5;
export const REVIEW_MAX_UNANSWERED = 10;

const REVIEW_TASK = [
  "## 依頼（この分野の弱点の復習）",
  "学習者はこの分野の弱点を復習したいと考えています。最初の回答では、次の三つをこの順で書いてください。",
  "1. 誤りの傾向：下の「間違えた過去問」から、どんな取り違えが多いかを短くまとめる。",
  "2. 重要な用語：傾向にかかわる用語を、下の「関連用語」の定義に沿って説明する。",
  "3. 次に解く過去問：実際の過去問を 2〜3 問勧める。勧めてよいのは、この教材ブロックに問題 ID が載っている問題（「間違えた過去問」と「まだ解いていない過去問」）だけです。各問題は [問題を開く](#問題ID) の形の Markdown リンクで示し、問題 ID は一覧のとおりに書いてください。一覧にない問題 ID を作ったり推測したりしてはいけません。",
  "まだ解いていない過去問は内容が載っていないので、内容を推測して説明しない。用語の重なりを手掛かりに選ぶ。",
  "間違えた過去問がないときはそのことを伝え、まだ解いていない過去問を勧めてください。",
  "この依頼への回答は 600 字（英語なら 300 words）以内を目安にしてください。",
];

const byId = (x: QuizQuestion, y: QuizQuestion): number => (x.id < y.id ? -1 : x.id > y.id ? 1 : 0);

// Exam ids in data/ip/quiz/questions.json: <year><era><NN><session>, e.g. 2009h21h
// (spring), 2011h23tokubetsu (the July 2011 special exam), 2009h21a (autumn),
// 2019h31h, 2019r01a, 2020r02o (October), 2021r03 … 2026r08 (CBT, one per year).
const SESSION_RANK: Record<string, number> = { h: 1, tokubetsu: 2, a: 3, o: 3, "": 3 };

/** Sortable recency of an exam id (bigger = newer); -1 for an unknown shape. */
export function examRecency(examId: string): number {
  const m = /^(\d{4})[hr]\d{2}(h|tokubetsu|a|o|)$/.exec(examId);
  return m ? Number(m[1]) * 10 + SESSION_RANK[m[2]!]! : -1;
}

function wrongQuestionLines(q: QuizQuestion, choice: string, locale: AppLocale): string[] {
  const dl = toDataLang(locale);
  const label = LANGUAGE_NAME[dl];
  const translated = dl !== "jp";
  const out: string[] = ["", `### 問題 ID: #${q.id}`, `出典: ${q.source_label}`];
  if (q.has_figure || q.choice_figures) out.push("この問題には図があります（AI 先生は図を見られません）。");
  out.push("", "#### 問題文（日本語原文）", q.stem_jp);
  if (translated) out.push("", `#### 問題文（${label}）`, localizedStem(q, locale));
  out.push("", "#### 選択肢（日本語原文）", ...choiceLines(q, q.choices_jp));
  if (translated) {
    const texts: Record<string, string> = {};
    for (const c of localizedChoices(q, locale)) texts[c.letter] = c.text;
    out.push("", `#### 選択肢（${label}）`, ...choiceLines(q, texts));
  }
  out.push("", `正解: ${q.correct_answer}`);
  if (q.explanation?.key_guard?.suspect) out.push("注意: 正解は確認中です（この問題の正解キーは検証できていません）。");
  out.push(`学習者の解答: ${choice}（不正解）`);

  // explanation.correct + the note for the learner's (wrong) choice + points only
  const section = (e: LocalizedExplanation | null, heading: string): string[] => {
    if (!e) return [];
    const lines = ["", heading, `正解（${q.correct_answer}）の理由: ${e.correct}`];
    for (const d of e.distractors) if (d.letter === choice) lines.push(`${d.letter} が誤りの理由: ${d.text}`);
    for (const p of e.points) lines.push(`要点: ${p}`);
    return lines;
  };
  out.push(...section(localizedExplanation(q, "ja"), "#### 解説（日本語原文）"));
  if (translated && q.explanation) out.push(...section(localizedExplanation(q, locale), `#### 解説（${label}）`));
  return out;
}

/**
 * The topic-review anchor: the learner's wrong answers in this topic (re-judged
 * against the current correct_answer, the REVIEW_MAX_WRONG = 5 most recent), each with its
 * explanation, the related term definitions, and REVIEW_MAX_UNANSWERED = 10
 * not-yet-answered questions (the only other ids the AI may recommend), each with
 * its id, source and JP terms only: ranked by the number of terms shared with the
 * listed wrong questions (desc), then exam recency (newest first), then id.
 * `questions` are the topic's questions; `topicLabel` names the topic.
 * Deterministic: no clock, wrong answers ordered by `at` then id.
 */
export function reviewAnchor(
  questions: QuizQuestion[],
  record: LearningRecord,
  locale: AppLocale,
  termCards: Record<string, TermCard>,
  topicLabel: string,
): string {
  const dl = toDataLang(locale);
  const wrong: { q: QuizQuestion; res: QuestionResult }[] = [];
  const unanswered: QuizQuestion[] = [];
  let answered = 0;
  for (const q of questions) {
    const res = Object.prototype.hasOwnProperty.call(record.questions, q.id) ? record.questions[q.id] : undefined;
    if (!res) {
      unanswered.push(q);
      continue;
    }
    answered++;
    if (res.choice !== q.correct_answer) wrong.push({ q, res });
  }
  const correct = answered - wrong.length;
  wrong.sort((x, y) => y.res.at - x.res.at || byId(x.q, y.q));
  const recent = wrong.slice(0, REVIEW_MAX_WRONG);

  const out: string[] = [
    "# 教材",
    answerLanguageLine(locale),
    "",
    ...REVIEW_TASK,
    "",
    "## 分野",
    `分野: ${topicLabel}`,
    `学習記録: この分野の過去問 ${questions.length} 問のうち ${answered} 問に解答、現在の正解で判定すると ${correct} 問正解・${wrong.length} 問不正解。`,
    "",
    `## 間違えた過去問（新しい順、最大 ${REVIEW_MAX_WRONG} 問）`,
  ];
  if (recent.length === 0) out.push("間違えた過去問はありません（現在の正解で判定）。");
  for (const { q, res } of recent) out.push(...wrongQuestionLines(q, res.choice, locale));

  const seen = new Set<string>();
  const terms: string[] = [];
  for (const { q } of recent) {
    for (const term of q.terms) {
      if (seen.has(term)) continue;
      seen.add(term);
      terms.push(term);
    }
  }

  out.push("", `## まだ解いていない過去問（用語の重なりが多い順・新しい試験順、最大 ${REVIEW_MAX_UNANSWERED} 問）`);
  const shared = (q: QuizQuestion): number => new Set(q.terms.filter((term) => seen.has(term))).size;
  const rest = unanswered
    .map((q) => ({ q, shared: shared(q), recency: examRecency(q.exam_id) }))
    .sort((x, y) => y.shared - x.shared || y.recency - x.recency || byId(x.q, y.q))
    .slice(0, REVIEW_MAX_UNANSWERED);
  if (rest.length === 0) out.push("（この分野の過去問はすべて解答済みです）");
  for (const { q } of rest) {
    out.push(`- #${q.id}（${q.source_label}）${q.terms.length > 0 ? `用語: ${q.terms.join(", ")}` : ""}`);
  }

  const termText = termLines(terms, termCards);
  if (termText.length > 0) out.push("", `## 関連用語（定義は${LANGUAGE_NAME[dl]}）`, ...termText);

  return out.join("\n");
}
