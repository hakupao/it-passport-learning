#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — explanation fixes S113 (2011h23a), after stemfix-S113-2011h23a.
//
// (1) q027 誤答肢エ の stale OCR caveat を jp/zh/en から strip。
//     stemfix で「経貼」→「経由」を是正したので、注記は存在しない腐敗を語る死に注記に
//     なった (S106/S112 の distractor-caveat-strip pattern)。**体系 caveat スキャンが
//     捕捉** — S112b で省いて Rule A に捕まった手順を今回は explfix 前に実施した成果。
// (2) q085 zh の生体認証 誤り率 用語を corpus 慣例へ整合。
//     in-pipeline tr reviewer が medium で指摘 → corpus 実測で裏取り:
//     拒真率 24 件 / 认假率 24 件 vs 本人拒识率 0 件 / 他人误识率 0 件。
//     en は false rejection/acceptance rate で既に正しい。JP は原語のままで不変。
// (3) key_guard resolution notes (S110 §5(a): merge は FINAL を publish、
//     suspect は union(round1, final) で anti-masking)。
//
// Run: node scripts/quiz-phase2-explfix-S113-2011h23a.mjs  (then: quiz-phase2-merge.mjs 2011h23a)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);
const E = "2011h23a";

// ---- (1) q027 エ stale caveat strip ----
const STRIPS = [
  { file: `expl_jp_${E}-q027.json`, kind: "jp", letter: "エ",
    sentence: "なお本肢の「経貼」は「経由」の OCR 誤りである。", canary: "経貼" },
  { file: `expl_tr_${E}-q027.json`, kind: "zh", letter: "エ",
    sentence: "另外，本选项日文原文中的“経貼”是“経由”（经由）的 OCR 误识。", canary: "経貼" },
  { file: `expl_tr_${E}-q027.json`, kind: "en", letter: "エ",
    sentence: " Note also that 経貼 in this choice is an OCR error for 経由 (via).", canary: "経貼" },
];

for (const s of STRIPS) {
  const p = P2(s.file);
  const doc = JSON.parse(readFileSync(p, "utf-8"));
  const d = s.kind === "jp"
    ? doc.distractors_jp.find((x) => x.letter === s.letter)
    : doc.distractors.find((x) => x.letter === s.letter);
  if (!d) throw new Error(`q027 ${s.kind} distractor ${s.letter} missing`);
  const key = s.kind === "jp" ? "why_wrong_jp" : s.kind;
  if (!d[key].includes(s.sentence)) {
    if (d[key].includes(s.canary)) throw new Error(`q027 ${s.kind}: caveat text drifted — manual check`);
    console.log(`  = q027 caveat [${s.kind}] already stripped`);
    continue;
  }
  d[key] = d[key].replace(s.sentence, "").replace(/\s+$/, "");
  writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
  console.log(`  ✓ q027 caveat strip [${s.kind}]`);
}

// ---- (2) q085 zh FRR/FAR terminology → corpus convention ----
{
  const p = P2(`expl_tr_${E}-q085.json`);
  const doc = JSON.parse(readFileSync(p, "utf-8"));
  const d = doc.distractors.find((x) => x.letter === "ウ");
  if (!d) throw new Error("q085 distractor ウ missing");
  const FROM = "把本人误拒的本人拒识率与把他人误纳的他人误识率";
  const TO = "把本人误拒的拒真率（FRR）与把他人误纳的认假率（FAR）";
  if (d.zh.includes(TO)) {
    console.log("  = q085 zh terminology already aligned");
  } else {
    const n = d.zh.split(FROM).length - 1;
    if (n !== 1) throw new Error(`q085 zh: expected 1 occurrence of «${FROM}», found ${n}`);
    d.zh = d.zh.replace(FROM, TO);
    writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
    console.log("  ✓ q085 zh 拒真率(FRR)/认假率(FAR) へ整合 (corpus 24/24 vs 0/0)");
  }
}

// ---- (3) key_guard resolution ----
const RESOLVES = {
  [`${E}-q015`]: "【S113 裁決】figure_derivable=false は概念問への benign over-flag (図は選択肢の再掲表)。腐敗なし・derived=イ=key 一致、是正不要 (no-op)。",
  [`${E}-q024`]: "【S113 裁決】raw stem の 3手目列「値引きする/広告する」は源 (page-10) の「広告する/広告しない」と食い違うが、**stem_jp_clean は源と一致** (広告しない 4 箇所を確認) し raw は非表示 (S107 q082 精神)。数値は無傷で literal 導出も 9=イ のまま = 答えを反転させる罠ではないため raw 不動 (raw 是正は answer-affecting な罠に限る、S112 の線)。",
  [`${E}-q027`]: "【S113 裁決】選択肢ウの余分な半角ピリオド・エの「経貼」→「経由」は page-11 実読で是正済 (stemfix-S113-2011h23a)。解説エの OCR caveat も三語 strip 済 (explfix-S113、体系スキャンで捕捉)。",
  [`${E}-q036`]: "【S113 裁決】選択肢イ「a, bc」は page-14 実読で「a, b, c」に是正済 (読点脱落、zh/en は元から正)。",
  [`${E}-q038`]: "【S113 裁決】選択肢ア の衍字「り」(過去のりリスク) は page-15 実読で是正済。",
  [`${E}-q090`]: "【S113 裁決】中問A 前提部 (圧縮ルール〔画素データを出力/圧縮する処理の概要〕と図1) の未取り込みで、本問単独では圧縮方式が未定義。**同一中問の q089 clean には前提部が現存する軽量ケース** (S112 q097/q099 と同型) だが注入はテキスト増殖を伴うため図/シナリオ再抽出 track に登録。key イ (39文字) は図2 実読の独立導出で一致。",
  [`${E}-q098`]: "【S113 裁決】figure_derivable=false は中問C 前文〔インタビュー調査の注意点〕の未取り込みによる (腐敗ではない)。解説側で注意点(1)〜(3) を明示し自己完結化済。中問C 再抽出 track に登録 (q097〜q100)。key ウ は page-41/42 実読の独立導出で一致。",
  [`${E}-q099`]: "【S113 裁決】〔店舗の課題と要望〕の角括弧と項目番号 ①〜③→(1)〜(3) (選択肢 4 肢 + zh/en 連帯) は page-43 実読で是正済 (stemfix-S113-2011h23a)。raw の「})」「①)」は clean 権威ゆえ不動。**中問C 共通記述 (S社設定+〔店舗の課題と要望〕本文) の欠落は残存** → 図/シナリオ再抽出 track (q097〜q100)。key イ は page-41 実読の独立導出で一致。",
};

// Fixed-and-nothing-remaining → corrupt=false. q024 (raw 腐敗残存) / q090・q099 (linkage-gap 残存)
// は true を維持 — 欠けているものは今も欠けている。
const FIXED_FLAGS = {
  [`${E}-q027`]: { derived_answer: "イ", matches_key: true, figure_derivable: true },
  [`${E}-q036`]: { derived_answer: "ア", matches_key: true, figure_derivable: true },
  [`${E}-q038`]: { derived_answer: "ア", matches_key: true, figure_derivable: true },
};

const grPath = P2(`generate_result_${E}.json`);
const gr = JSON.parse(readFileSync(grPath, "utf-8"));
let resolved = 0, flipped = 0;

for (const [id, note] of Object.entries(RESOLVES)) {
  const rec = gr.results.find((r) => r.id === id);
  if (!rec) throw new Error(`${id}: not in generate_result`);
  if (rec.key_guard.note_jp.includes("【S113 裁決】")) { console.log(`  = ${id} already resolved`); continue; }
  rec.key_guard.note_jp = `${rec.key_guard.note_jp}\n${note}`;
  resolved++;
  console.log(`  ✓ ${id} key_guard resolve`);
}

for (const [id, want] of Object.entries(FIXED_FLAGS)) {
  const rec = gr.results.find((r) => r.id === id);
  if (!rec) throw new Error(`${id}: not in generate_result`);
  const kg = rec.key_guard;
  if (kg.derived_answer !== want.derived_answer) throw new Error(`${id}: derived_answer ${kg.derived_answer} ≠ ${want.derived_answer}`);
  if (kg.matches_key !== true) throw new Error(`${id}: matches_key is not true`);
  if (kg.stem_corruption_suspected === false) { console.log(`  = ${id} flags already resolved`); continue; }
  kg.stem_corruption_suspected = false;
  kg.figure_derivable = want.figure_derivable;
  flipped++;
  console.log(`  ✓ ${id} final flags → corrupt=false`);
}

writeFileSync(grPath, JSON.stringify(gr, null, 2) + "\n");
console.log(`✓ quiz-phase2-explfix-S113-2011h23a: caveat strips 3 / zh terminology 1 / key_guard resolves ${resolved} / flag flips ${flipped}`);
console.log(`  next: node scripts/quiz-phase2-merge.mjs ${E}`);
