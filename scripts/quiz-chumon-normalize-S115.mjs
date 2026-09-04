#!/usr/bin/env node
// Stage 6 / Quiz — 中問グループ member の「旧前文 剥がし」 (D-141 の前処理, Session 115)
//
// ══ なぜ必要か ══
// D-141 の適用スクリプト `quiz-chumon-preamble-apply.mjs` は、原典から起こした共有前文を
// グループ全設問の表示層に **前置** する。冪等判定は preamble の先頭 40 文字が既存 stem に
// 含まれるかで行うため、**言い換え版・見出し付き版の前文を既に持つ設問**は判定をすり抜け、
// 前文が二重に載ってしまう。
//
// S115 の 2 exam では、この「既に前文を持つが原典と一致しない」member が 6 問あった:
//
//   2010h22a-q089  中問A 前文あり。ただし見出しが「…問89に答えよ。」= 源の「問89 〜 92 に
//                  答えよ。」を **問89 だけに狭めた** 誤り (この見出し自体 corpus 規約では非前置)。
//   2010h22a-q090  中問A 前文の **書き換え版**。見出し「〔中問A〕…次の記述を読む。」は源に無い
//                  文、句読点も源の ，。 でなく 、。 に変換され、さらに表2 の注に
//                  「（bおよびcは列5、列6の予想出力欄を指す）」という **源に無い説明**が加筆。
//   2010h22a-q092  中問A の 表2 を設問文の後ろに **重複掲載**。前文側にも同じ表が入るため、
//                  前置すると同一の表が 1 問に 2 回出る。
//   2010h22a-q094  中問B 前文の **全面言い換え版** (s7x 保真核験 双 pass が 12 箇所を検出、
//                  主 context が page-38 実読で全件確認)。状況設定段落と「表 許可区分の設定」は
//                  そもそも欠落。加えて末尾に **選択肢が漏出** (「ア 4　　イ 5　　ウ 6　　エ 7」)。
//   2010h22a-q097  中問C 前文あり。ただし「情報システム部では」→「部門で」/「計画している」→
//                  「計画した」の置換 (双 pass 一致) + 源の分野見出し〔ストラテジ〕と設問番号
//                  「問97」が混入 (corpus 規約は両方とも非前置)。
//   2009h21h-q097  中問C 前文あり。見出し「〔通信販売業務に関する次の記述を読んで，問97に
//                  答えよ。〕」は源の「中問C …問97 〜 100 に答えよ。」を **問97 だけに狭めた**
//                  うえ 〔〕 で囲った、原典に無い形。
//
// そこで本スクリプトで先に **設問固有のテキストだけ**に切り詰め、そのうえで
// quiz-chumon-preamble-apply.mjs が原典逐字の前文 (Extract→Verify 双 agentType, 6/6 PASS) を
// 全 member に一様に前置する。結果として上記 6 問の欠陥は「前文の差し替え」で同時に解消される。
//
// ══ 操作 ══
//   keep_from   : anchor 以降を残す (anchor より前を捨てる)  — 前文・見出し・設問番号の除去
//   keep_before : anchor より前を残す (anchor 以降を捨てる)  — 重複表・漏出選択肢の除去
// いずれも「anchor がちょうど 1 回出現」「切り取りが実際に発生する」ことを assert する。
// jp は translations の stem_jp_clean、zh/en は stem.zh / stem.en を対象 (raw の stem_jp は
// 非表示層なので触らない = D-141 §1)。
//
// Run: node scripts/quiz-chumon-normalize-S115.mjs
//   then: node scripts/quiz-chumon-preamble-apply.mjs <workflow_output>

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TR_DIR = path.join(ROOT, "data/ip/quiz/translations");

const OPS = [
  // ─────────── 2010h22a 中問A (q089〜092) ───────────
  {
    id: "2010h22a-q089", op: "keep_from",
    why: "中問A 前文 + 見出し「ソフトウェアのテストに関する次の記述を読んで，問89に答えよ。」を除去。源の見出しは「問89 〜 92 に答えよ。」であり問89 だけに狭めた誤り。前文は原典逐字版を前置し直す",
    jp: "M さんがプログラムのテストに使うデータを準備するために表2の出力結果表を作成した理由として，",
    zh: "M 先生为了准备程序测试所用的数据而编制了表2的输出结果表，",
    en: "Which of the following is the most appropriate reason why Mr. M created",
  },
  {
    id: "2010h22a-q090", op: "keep_from",
    why: "中問A 前文の書き換え版 (源に無い見出し「〔中問A〕…次の記述を読む。」/ 句読点変換 / 表2 注への加筆「（bおよびcは列5、列6の予想出力欄を指す）」) を除去",
    jp: "表2の出力結果表のaに入る予想出力はどれか。",
    zh: "表 2 输出结果表中，填入 a 处的预想输出是哪一项？",
    en: "In the output result table of Table 2, which of the following is the predicted output",
  },
  {
    id: "2010h22a-q092", op: "keep_before",
    why: "設問文の後ろに重複掲載されていた 表2 出力結果表 を除去 (前文側が原典逐字の表2 を供給する。b/c の列同定は前文の 予想出力 行で保たれる)",
    jp: "\n\n表2　出力結果表",
    zh: "\n\n表2　输出结果表",
    en: "\n\nTable 2  Output result table",
  },

  // ─────────── 2010h22a 中問B (q093〜096) ───────────
  {
    id: "2010h22a-q094", op: "keep_from",
    why: "中問B 前文の全面言い換え版を除去 (s7x 双 pass が 12 箇所検出・page-38 実読で確認)。原典逐字版を前置し直す",
    jp: "次の表に示す許可区分の設定について，ポリシの許可区分を DENY にしたとき",
    zh: "对于下表所示的许可类别设置，当策略的许可类别设为 DENY 时，",
    en: "For the permission configuration shown in the table below, when the Policy permission is set to DENY",
  },
  {
    id: "2010h22a-q094", op: "keep_before",
    why: "stem 末尾に漏出していた選択肢行「ア 4　　イ 5　　ウ 6　　エ 7」を除去 (choices_jp に ア:4 / イ:5 / ウ:6 / エ:7 として正しく格納済み = 完全な重複)",
    jp: "\n\nア 4　　イ 5　　ウ 6　　エ 7",
    zh: "\n\nア 4　　イ 5　　ウ 6　　エ 7",
    en: "\n\nア 4　　イ 5　　ウ 6　　エ 7",
  },

  // ─────────── 2010h22a 中問C (q097〜100) ───────────
  {
    id: "2010h22a-q097", op: "keep_from",
    why: "中問C 前文 (「情報システム部門で」/「計画した」= 源は「情報システム部では」/「計画している」、双 pass 一致) と 中問見出し・分野見出し〔ストラテジ〕・設問番号「問97」を除去。原典逐字版を前置し直す",
    jp: "F さんは，全体の作業時間を求めるために表の内容を整理することにした。",
    zh: "F 为了求出整体的作业时间，决定整理表的内容。",
    en: "To find the total work time, F decided to organize the contents of the table.",
  },

  // ─────────── 2009h21h 中問C (q097〜100) ───────────
  {
    id: "2009h21h-q097", op: "keep_from",
    why: "中問C 前文と、原典に無い見出し「〔通信販売業務に関する次の記述を読んで，問97に答えよ。〕」(源は「中問C …問97 〜 100 に答えよ。」) を除去。原典逐字版を前置し直す",
    jp: "A さんが 1 人で通販業務を行う場合，",
    zh: "当 A 一个人承担邮购业务时，",
    en: "When Mr. A handles the mail-order operations alone,",
  },
];

const docs = new Map();
const loadDoc = (examId) => {
  if (!docs.has(examId)) {
    const p = path.join(TR_DIR, `${examId}.json`);
    docs.set(examId, { p, doc: JSON.parse(readFileSync(p, "utf-8")) });
  }
  return docs.get(examId);
};

const apply = (text, op, anchor, where) => {
  const n = text.split(anchor).length - 1;
  if (n !== 1) throw new Error(`${where}: anchor «${anchor.slice(0, 40)}…» occurs ${n} times (need exactly 1)`);
  const i = text.indexOf(anchor);
  if (op === "keep_from") {
    if (i === 0) throw new Error(`${where}: anchor already at position 0 — nothing to strip`);
    return text.slice(i).trimStart();
  }
  if (i + anchor.length >= text.length && op === "keep_before") {
    // anchor is the very tail with nothing after it — still a valid cut
  }
  return text.slice(0, i).trimEnd();
};

let count = 0;
for (const o of OPS) {
  const examId = o.id.split("-")[0];
  const { doc } = loadDoc(examId);
  const t = doc.questions[o.id];
  if (!t) throw new Error(`${o.id}: not in translations sidecar`);
  if (!t.stem_jp_clean) throw new Error(`${o.id}: no stem_jp_clean (表示層が raw のため本操作は不可)`);

  const before = { jp: t.stem_jp_clean.length, zh: t.stem.zh.length, en: t.stem.en.length };
  t.stem_jp_clean = apply(t.stem_jp_clean, o.op, o.jp, `${o.id} jp`);
  t.stem.zh = apply(t.stem.zh, o.op, o.zh, `${o.id} zh`);
  t.stem.en = apply(t.stem.en, o.op, o.en, `${o.id} en`);
  const after = { jp: t.stem_jp_clean.length, zh: t.stem.zh.length, en: t.stem.en.length };
  count++;
  console.log(`  ✓ ${o.id} [${o.op}] jp ${before.jp}→${after.jp} / zh ${before.zh}→${after.zh} / en ${before.en}→${after.en}`);
  console.log(`      ${o.why}`);
}

for (const { p, doc } of docs.values()) writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
console.log(`✓ quiz-chumon-normalize-S115: ${count} 操作 / ${docs.size} sidecar 更新`);
console.log(`  next: node scripts/quiz-chumon-preamble-apply.mjs <workflow_output>`);
