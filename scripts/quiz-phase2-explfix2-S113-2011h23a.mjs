#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — explfix2 S113 (2011h23a): Rule A + trsweep の medium 是正。
//
// 出所: Rule A `wf_d44c9544-e8f` (medium 2) + trsweep `wf_debccb8a-294` (medium 3、
// unfaithful は 0 だが所見として浮上)。いずれも主 context が図/源/corpus 実測で裏取り。
//
// (1) q099 = **本 session 自身が作った連鎖断裂** (S112 q004 の教訓の再現):
//     stemfix-S113-2011h23a で stem/choices を ①②③ → (1)(2)(3) に是正したのに、
//     生成済みの解説本体は ①②③ のままだった。学習者の画面に ① は一切現れないので
//     解説の指示対象が接続しない。**是正のスコープは設問レコード全体 (stem/choices/
//     解説/points) でなければならない**という教訓の 2 例目。jp/zh/en 一括置換。
//
// (2) q092 = 訳文が図と矛盾 (Rule A accurate=false の唯一件):
//     figure 実読 (figures/2011h23a-q092.png) で画像①の白帯は **中央の第4列 1 列のみ**
//     (行2〜6)。画像②の白帯 (第4行・列2〜6) と 90 度回転で対応する。
//     zh「中央的4列」/ en「the four central columns」は『4 本の列』と読め図と矛盾し、
//     さらに白列が 4 本なら横ランが伸びて解説自身の 93 文字とも自己矛盾する。
//     JP「中央の4列」も同義に読めるため **三語とも「第4列」と明示**する (JP 起点の是正)。
//
// (3) q004 zh = 労働者派遣の用語逆転 (trsweep medium ×2):
//     JP「派遣先」を zh が「派遣单位」と訳しているが、PRC 労働契約法では
//     劳务派遣单位 = 派遣**元**、用工单位 = 派遣**先**。そのまま読むと結論が反転する。
//     **corpus 実測: 用工单位 36 件 vs 派遣单位 19 件** で用工单位 が優勢。
//     **選択肢 zh 自身も同じ逆転を含む**ため translations 側も同一パスで是正
//     (S112 q004「用語是正は設問レコード全体をスコープにせよ」)。
//     「派遣方」(=派遣元) は用工单位 と対にすれば曖昧でないため不動 (最小スコープ)。
//
// (4) q069 en = 成績ラベルの置換 (trsweep medium):
//     源の成績は 優/良/可/不可。en が "grade A to B to C to F" と英語式評点に置換して
//     いるが、同一文が表計算の**列 B/C/D** を論じており記号が衝突する。zh は
//     优→良→可→不可 と源ラベルを保持しており en だけの逸脱 → 源ラベル+英語注記へ。
//
// 主 context が当てたパッチのため、**別 subagent_type による再核験を後段で必ず回す** (Rule D)。
//
// Run: node scripts/quiz-phase2-explfix2-S113-2011h23a.mjs
//      (then: node scripts/quiz-phase2-merge.mjs 2011h23a && build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);
const E = "2011h23a";
let edits = 0;

const loadP2 = (f) => ({ p: P2(f), doc: JSON.parse(readFileSync(P2(f), "utf-8")) });
const save = (p, doc) => writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
const replaceOnce = (s, from, to, where) => {
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`${where}: expected 1 occurrence of «${from}», found ${n}`);
  return s.replace(from, to);
};

// ---------- (1) q099: ①②③ → (1)(2)(3) in explanation body (jp/zh/en) ----------
{
  const NUM = { "①": "(1)", "②": "(2)", "③": "(3)" };
  const renum = (s) => s.replace(/[①②③]/g, (c) => NUM[c]);

  const jp = loadP2(`expl_jp_${E}-q099.json`);
  let n = 0;
  const before = jp.doc.correct_jp;
  jp.doc.correct_jp = renum(jp.doc.correct_jp);
  if (jp.doc.correct_jp !== before) n++;
  for (const d of jp.doc.distractors_jp) {
    const b = d.why_wrong_jp;
    d.why_wrong_jp = renum(d.why_wrong_jp);
    if (d.why_wrong_jp !== b) n++;
  }
  for (const p of jp.doc.points_jp ?? []) {
    if (typeof p === "string") continue;
    const b = p.jp ?? "";
    if (p.jp) { p.jp = renum(p.jp); if (p.jp !== b) n++; }
  }
  // key_guard note keeps its historical text (audit trail) — do not renumber.
  save(jp.p, jp.doc);

  const tr = loadP2(`expl_tr_${E}-q099.json`);
  for (const lang of ["zh", "en"]) {
    const b = tr.doc.correct[lang];
    tr.doc.correct[lang] = renum(tr.doc.correct[lang]);
    if (tr.doc.correct[lang] !== b) n++;
  }
  for (const d of tr.doc.distractors) {
    for (const lang of ["zh", "en"]) {
      const b = d[lang];
      d[lang] = renum(d[lang]);
      if (d[lang] !== b) n++;
    }
  }
  for (const p of tr.doc.points ?? []) {
    for (const lang of ["zh", "en"]) {
      if (!p[lang]) continue;
      const b = p[lang];
      p[lang] = renum(p[lang]);
      if (p[lang] !== b) n++;
    }
  }
  save(tr.p, tr.doc);

  const leftJp = JSON.stringify({ c: jp.doc.correct_jp, d: jp.doc.distractors_jp }).match(/[①②③]/g);
  const leftTr = JSON.stringify(tr.doc).match(/[①②③]/g);
  if (leftJp || leftTr) throw new Error("q099: ①②③ remain after renumber");
  console.log(`  ✓ q099 解説の項目番号 ①②③→(1)(2)(3): ${n} フィールド (jp/zh/en)`);
  edits += n;
}

// ---------- (2) q092: 中央の第4列 (jp/zh/en) ----------
{
  const jp = loadP2(`expl_jp_${E}-q092.json`);
  jp.doc.correct_jp = replaceOnce(jp.doc.correct_jp,
    "中央の4列だけが縦につながった白帯で",
    "中央の第4列だけが縦につながった白帯で", "q092 jp");
  save(jp.p, jp.doc);
  const tr = loadP2(`expl_tr_${E}-q092.json`);
  tr.doc.correct.zh = replaceOnce(tr.doc.correct.zh,
    "只有中央的4列构成纵向连成一片的白色条带",
    "只有中央的第4列构成纵向连成一片的白色条带", "q092 zh");
  tr.doc.correct.en = replaceOnce(tr.doc.correct.en,
    "only the four central columns form a white band connected vertically",
    "only the central column (column 4) forms a white band connected vertically", "q092 en");
  save(tr.p, tr.doc);
  console.log("  ✓ q092 画像① 白帯 = 中央の第4列 (figure 実読で確定、jp/zh/en 3 フィールド)");
  edits += 3;
}

// ---------- (3) q004 zh: 派遣单位 → 用工单位 (explanation + choice) ----------
{
  const tr = loadP2(`expl_tr_${E}-q004.json`);
  const dw = tr.doc.distractors.find((x) => x.letter === "ウ");
  if (!dw) throw new Error("q004 distractor ウ missing");
  const c1 = dw.zh.split("派遣单位").length - 1;
  if (c1 !== 4) throw new Error(`q004 distractors.ウ.zh: expected 4 occurrences of 派遣单位, found ${c1}`);
  dw.zh = dw.zh.replaceAll("派遣单位", "用工单位");
  const p1 = tr.doc.points[1];
  const c2 = p1.zh.split("派遣单位").length - 1;
  if (c2 !== 1) throw new Error(`q004 points[1].zh: expected 1, found ${c2}`);
  p1.zh = p1.zh.replaceAll("派遣单位", "用工单位");
  save(tr.p, tr.doc);
  console.log("  ✓ q004 解説 zh 派遣单位→用工单位 ×5 (PRC 労働契約法: 用工单位=派遣先)");

  const trPath = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);
  const trDoc = JSON.parse(readFileSync(trPath, "utf-8"));
  const ch = trDoc.questions[`${E}-q004`].choices["ウ"];
  ch.zh = replaceOnce(ch.zh, "在派遣单位（客户处）", "在用工单位（客户处）", "q004 choice ウ zh");
  writeFileSync(trPath, JSON.stringify(trDoc, null, 2) + "\n");
  console.log("  ✓ q004 選択肢ウ zh も同一パスで是正 (連鎖断裂の予防、S112 q004 教訓)");
  edits += 6;
}

// ---------- (4) q069 en: 成績ラベルを源のまま ----------
{
  const tr = loadP2(`expl_tr_${E}-q069.json`);
  tr.doc.correct.en = replaceOnce(tr.doc.correct.en,
    "must shift from grade A to B to C to F",
    "must shift from 優 (excellent) to 良 (good) to 可 (pass) to 不可 (fail)", "q069 en grades");
  tr.doc.correct.en = replaceOnce(tr.doc.correct.en,
    "how many students earned grade B in English",
    "how many students earned 良 (good) in English", "q069 en C103 example");
  save(tr.p, tr.doc);
  console.log("  ✓ q069 en 成績ラベルを源 (優/良/可/不可) へ復元 — 列記号 B/C/D との衝突を解消");
  edits += 2;
}

console.log(`✓ quiz-phase2-explfix2-S113-2011h23a: ${edits} フィールド`);
console.log(`  next: node scripts/quiz-phase2-merge.mjs ${E} && node scripts/build-quiz-corpus.mjs`);
console.log(`  Rule D: 主 context パッチにつき別 subagent_type による再核験を必ず回すこと`);
