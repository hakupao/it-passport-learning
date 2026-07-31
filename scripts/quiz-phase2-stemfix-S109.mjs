#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 SCALE batch S109 (D-137 / D-140) — drift-proof STEM + CHOICES
// OCR corruption fixes for 2015h27h (平成27 春期).
//
// Same contract as quiz-phase2-stemfix-S102..S108.mjs: every fix below was adjudicated by
// 主 context against the source page (q052 protocol / D-小6 full-page authority). All
// key-invariant (correct_answer unchanged). STEM substring fixes assert `from` occurs
// EXACTLY ONCE in stem_jp; CHOICE fixes assert `from` occurs EXACTLY ONCE in the letter's
// choices_jp value (strip/swap only, idempotent). build-quiz-corpus.mjs then regenerates
// questions.json. correct_answer / quiz_index / translations untouched here.
//
// S109 note: q062 / q017 エ / q017 イ were NOT flagged by the generator's key-guard — they
// are semantically-plausible substitutions (both the corrupted and the true text are
// well-formed and, for q062, both are mathematically TRUE), so no contradiction signal
// existed. They surfaced only from 主 context source reads. q062 ウ is the CORRECT choice,
// so its displayed text mattered even though the key letter never moved.
//
// Run:  node scripts/quiz-phase2-stemfix-S109.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");

// STEM fixes = {id, from, to}. `from` must occur EXACTLY ONCE in stem_jp.
const STEM_FIXES = [
  // 2015h27h-q091 (source page-40 問91): 「Aさんは〔Zプロジェクトの状況〕の(5)が，開発スケジュール
  //   の遅延の原因になると考え」. Raw dropped the Z and turned 「(5)が」into 「(5)で」+ spurious
  //   comma after 「Aさんは」. Cosmetic (key イ=35万円 unchanged); clean fixed in trfix-S109.
  { id: "2015h27h-q091", from: "Aさんは,〔プロジェクトの状況〕の(5)で,開発", to: "Aさんは〔Zプロジェクトの状況〕の(5)が,開発", why: "Z脱落 + (5)で→(5)が + 余分な読点 (source page-40)" },
  { id: "2015h27h-q091", from: "可能性があるときに,回避策を実施し,図1", to: "可能性があるとした場合,回避策を実施して,図1", why: "「とした場合…実施して」に復元 (source page-40)" },
  // 2015h27h-q092 (source page-40 問92): 「AさんはBさんから，〔Zプロジェクトの状況〕の(5)以外にも」
  //   / 「〔Zプロジェクトの状況〕の(1)～(4)のうちで」. Raw OCR B→d, Z脱落 ×2, 「うちで」→「うち」.
  //   Cosmetic (key ア unchanged). NOTE: q092 also sits in the 中問B linkage-gap cluster —
  //   that gap is a SEPARATE backlog track and is not resolved by this text fix.
  { id: "2015h27h-q092", from: "Aさんはdさんから，〔プロジェクトの状況〕の(5)以外", to: "AさんはBさんから，〔Zプロジェクトの状況〕の(5)以外", why: "OCR d→B + Z脱落 (source page-40)" },
  { id: "2015h27h-q092", from: "〔プロジェクトの状況〕の(1)～(4)のうち，", to: "〔Zプロジェクトの状況〕の(1)～(4)のうちで，", why: "Z脱落 + 「うち」→「うちで」 (source page-40)" },
];

// CHOICE substring fixes = {id, letter, from, to}. strip/swap only (from ⊇ to, or
// from/to non-containing) so assert-replace is idempotent. `from` must occur EXACTLY ONCE.
const CHOICE_FIXES = [
  // 2015h27h-q017 (source page-07 問17, コモディティ化). key ア unchanged.
  //   ア (正解肢): 源「他社商品が追随して機能の差別化が失われ，最終的に低価格化競争に陥って」.
  //   Raw dropped 「が追随して」→「で」 and left the English word 「competition」 for 「競争」.
  //   The generator guessed 「他社商品との」 — WRONG; source read settled it as 「が追随して」.
  { id: "2015h27h-q017", letter: "ア", from: "他社商品で機能の差別化が失われ", to: "他社商品が追随して機能の差別化が失われ", why: "「が追随して」脱落 (source page-07、正解肢)" },
  { id: "2015h27h-q017", letter: "ア", from: "低価格化competition に陥って", to: "低価格化競争に陥って", why: "英単語混入 competition→競争 (source page-07、正解肢)" },
  //   イ: 源「既存の自社商品の売上が新商品に奪われて」. Raw dropped 「の売上」 (UNFLAGGED).
  { id: "2015h27h-q017", letter: "イ", from: "既存の自社商品が新商品に奪われて", to: "既存の自社商品の売上が新商品に奪われて", why: "「の売上」脱落 (source page-07、generator 未 flag)" },
  //   エ: 源「当初から頻繁に安売りしたことによって」. Raw reads 「頻繁に変更が生じたことによって」
  //   = semantic substitution (UNFLAGGED; both readings are well-formed Japanese).
  { id: "2015h27h-q017", letter: "エ", from: "当初から頻繁に変更が生じたことによって", to: "当初から頻繁に安売りしたことによって", why: "意味的 OCR 変更が生じた→安売りした (source page-07、generator 未 flag)" },
  // 2015h27h-q051 (source page-20 問51): choice ア (正解肢) 「同じ OS やアプリケーションソフト」.
  //   Classic 0S→05 字形 OCR. key ア unchanged; zh/en already read OS (no trfix needed).
  { id: "2015h27h-q051", letter: "ア", from: "同じ 05 やアプリケーション", to: "同じ OS やアプリケーション", why: "OCR 05→OS (source page-20、正解肢)" },
  // 2015h27h-q053 (source page-21 問53): choice エ 「リスクの大きいサービスから撤退した。」;
  //   raw has trailing OCR junk 「こう」. エ is the key — displayed text now clean. zh/en clean.
  { id: "2015h27h-q053", letter: "エ", from: "撤退した。こう", to: "撤退した。", why: "末尾 OCR junk「こう」strip (source page-21、正解肢)" },
  // 2015h27h-q062 (source page-24 問62, 集合). key ウ unchanged — but ALL THREE fixes below were
  //   UNFLAGGED, because the corrupted texts are themselves well-formed and (for ウ) TRUE.
  //   源 ア「（A∪B）は，（A∩B）でない集合の部分集合である。」 — raw dropped 「集合の」.
  { id: "2015h27h-q062", letter: "ア", from: "でない部分集合である", to: "でない集合の部分集合である", why: "「集合の」脱落 (source page-24、generator 未 flag)" },
  //   源 ウ「（A∩B）は，（A∪B）の部分集合である。」 — raw reads 「Bの部分集合である」. BOTH are
  //   mathematically true (A∩B ⊆ B and A∩B ⊆ A∪B), so no key-guard signal existed; only the
  //   source read distinguishes them. ウ is the CORRECT choice → explanation rewritten in explfix-S109.
  { id: "2015h27h-q062", letter: "ウ", from: "は，Bの部分集合である", to: "は，(A∪B)の部分集合である", why: "正解肢の意味的 OCR B→(A∪B) (source page-24、generator 未 flag)" },
  //   源 エ「（A∩B）は，Aでない集合の部分集合である。」 — raw dropped 「集合の」.
  { id: "2015h27h-q062", letter: "エ", from: "は，Aでない部分集合である", to: "は，Aでない集合の部分集合である", why: "「集合の」脱落 (source page-24、generator 未 flag)" },
  // 2015h27h-q064 (source page-25 問64, 信頼性設計). key ウ unchanged.
  //   源 ア「機器などに故障が発生した際に」 / イ「機器などの故障が発生する確率を下げていくことを
  //   フェールセーフという」. Raw dropped 「など」 ×2 and turned 「下げていく」into 「下げない」
  //   (the negation flip is the flagged one; the 「など」 drops were unflagged).
  { id: "2015h27h-q064", letter: "ア", from: "機器に故障が発生した際に", to: "機器などに故障が発生した際に", why: "「など」脱落 (source page-25)" },
  { id: "2015h27h-q064", letter: "イ", from: "機器の故障が発生する確率を下げないこと", to: "機器などの故障が発生する確率を下げていくこと", why: "「など」脱落 + 否定反転 下げない→下げていく (source page-25)" },
  // 2015h27h-q086 (source page-34 問86, 主キー). ANSWER-AFFECTING as displayed: the underline
  //   annotations for イ/ウ/エ were all wrong, so the corrupted エ 「(下線：社員番号, 区画番号)」
  //   read as the true composite key while the real key イ read as 「(下線：区画番号)」 alone.
  //   主 context 6x source read: ア=社員番号 / イ=社員番号+区画番号 / ウ=社員番号+許可区分 /
  //   エ=3列すべて. key イ unchanged and now matches its own displayed text. zh/en in trfix-S109.
  { id: "2015h27h-q086", letter: "イ", from: "（下線：区画番号）", to: "（下線：社員番号, 区画番号）", why: "下線注記是正 (source page-34 6x、正解肢、answer-affecting)" },
  { id: "2015h27h-q086", letter: "ウ", from: "（下線：許可区分）", to: "（下線：社員番号, 許可区分）", why: "下線注記是正 (source page-34 6x)" },
  { id: "2015h27h-q086", letter: "エ", from: "（下線：社員番号, 区画番号）", to: "（下線：社員番号, 区画番号, 許可区分）", why: "下線注記是正 (source page-34 6x)" },
  // 2015h27h-q087 (source page-35 問87): choice イ (正解肢) a 欄は源「入退室区分の値を合計」;
  //   raw paraphrased to 「入退室区分を集計」. The explanation already argues 「値を合計」.
  //   zh/en already read 「値を合計 / Sum the values」 (no trfix needed). key イ unchanged.
  { id: "2015h27h-q087", letter: "イ", from: "a: 入退室区分を集計", to: "a: 入退室区分の値を合計", why: "正解肢 a 欄を源文言に復元 (source page-35)" },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const questions = bank.questions ?? bank;
const byId = new Map(questions.map((q) => [q.id, q]));

let changed = 0;

for (const f of STEM_FIXES) {
  const q = byId.get(f.id);
  if (!q) throw new Error(`${f.id}: not in question_bank.json`);
  const cur = q.stem_jp;
  if (typeof cur !== "string") throw new Error(`${f.id}: stem_jp missing`);
  if (cur.includes(f.to) && !cur.includes(f.from)) {
    console.log(`  ~ ${f.id} stem: already fixed (${f.why}), skip`);
    continue;
  }
  const n = cur.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} stem: expected exactly 1 occurrence of "${f.from}" but found ${n} — aborting`);
  q.stem_jp = cur.replace(f.from, f.to);
  changed++;
  console.log(`  ✓ ${f.id} stem: ${f.why}`);
}

for (const f of CHOICE_FIXES) {
  const q = byId.get(f.id);
  if (!q) throw new Error(`${f.id}: not in question_bank.json`);
  const cur = q.choices_jp?.[f.letter];
  if (typeof cur !== "string") throw new Error(`${f.id} ${f.letter}: choice missing`);
  if (cur.includes(f.to) && !cur.includes(f.from)) {
    console.log(`  ~ ${f.id} ${f.letter}: already fixed (${f.why}), skip`);
    continue;
  }
  const n = cur.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} ${f.letter}: expected exactly 1 occurrence of "${f.from}" but found ${n} — aborting`);
  q.choices_jp[f.letter] = cur.replace(f.from, f.to);
  changed++;
  console.log(`  ✓ ${f.id} ${f.letter}: ${f.why}`);
}

if (changed) writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
console.log(`✓ quiz-phase2-stemfix-S109: ${changed} change(s) → run: node scripts/build-quiz-corpus.mjs`);
