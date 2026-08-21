#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — S112 post-generate adjudication fixes (2012h24a), raw bank layer.
//
// Every fix source-verified by 主 context (S112 §10 裁決: page-02 / 29 / 30 / 39 / 40 / 44
// 実読)。correct_answer untouched。特記:
//   q002 = 選択肢が図そのもの (S109 2014h26a q046 型) だが figure 未添付で、代替テキストが
//     表示の全て。イ の「データストア付きプロセス図」は DFD の決め手を名指しする**答えの
//     漏洩**なので、図の見た目だけを述べる中立記述へ差し替え (エ も実図 [特性要因図] を
//     誤描写していたため同時に是正)。図そのものの添付は 図再抽出 track へ登録。
//   q046 = **no-op と裁決**。generator は「内部の論理構造→プログラム構造の置換」と推定
//     したが page-17 実読で源自体が「プログラム内部のプログラム構造を分析し」と確認。
//     S109 q100 教訓 (generator の再構成は源が裏づけるまで仮説) の再演。
//   q096 raw = fidelity pass が見ない層 (表示は clean) に残っていた answer-affecting 級の
//     罠 ((3) 前提「白→黒」反転で literal 読みだと 30=イ になる / 「ランレングス0」の 0
//     脱落 / (2) n の定義「値」→「桁数」)。generate key-guard が捕捉、page-44 で確認済。
//
// Run: node scripts/quiz-phase2-stemfix-S112b.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2012h24a";
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

const FIXES = [
  { id: q(2), field: "choice:イ",
    from: "（図：円と矢印によるデータストア付きプロセス図）",
    to: "（図：円と平行な二重線を矢印で結んだ図）",
    why: "答えの漏洩解消: DFD の決め手「データストア」を名指ししない中立記述へ (page-02 実図に忠実)" },
  { id: q(2), field: "choice:エ",
    from: "（図：平行線と斜線による記号図）",
    to: "（図：水平の矢印に斜めの線が合流する図）",
    why: "実図 (特性要因図) の誤描写を是正 (page-02 実読)" },
  { id: q(77), field: "stem",
    from: "使用されるプ ロトコルはどれか。",
    to: "使用されるプロトコルはどれか。",
    why: "page-29: 行折り返し由来の語中空白" },
  { id: q(81), field: "stem",
    from: "プリンタはど れか。",
    to: "プリンタはどれか。",
    why: "page-30: 行折り返し由来の語中空白" },
  { id: q(91), field: "choice:エ",
    from: "計算ミスを修正することができる機能[マネジメント]〕",
    to: "計算ミスを修正することができる機能",
    why: "page-39: 分野見出し断片の混入を strip" },
  { id: q(92), field: "choice:エ",
    from: "利用区間から人金額を設定する機能を導入して, その自動化を図っていくこと画像データの符号化",
    to: "利用区間から金額を設定する機能を導入して, その自動化を図っていくこと",
    why: "page-40: 「人」1 字混入の削除 + 隣接問93 見出し断片「画像データの符号化」の strip" },
  { id: q(96), field: "stem",
    from: '，画像データが黒から始まるものとし，画像データが黒から始まる場合は，ランレングスの白があるとして先頭に"000"を補う。',
    to: '，画像データは必ず白から始まるものとし，もし，画像データが黒から始まる場合は，ランレングス0の白があるとして先頭に"000"を補う。',
    why: "page-44: 前提「白→黒」反転の復元 (literal 読みだと 30=イ になる罠) + 「必ず」「もし，」「0」復元。clean 既正・raw の罠除去" },
  { id: q(96), field: "stem",
    from: "ランレングスの値を2進数で表現したときの桁数を n とし，その n の桁数が m のとき",
    to: "ランレングスの値を2進数で表現したときの値 n に対して，その n の桁数が m のとき",
    why: "page-44: n の定義「値」→「桁数」の化けを復元 (clean 既正)" },
  { id: q(99), field: "stem",
    from: "員登録をする Web ページの仕組み}】の⑤",
    to: "員登録をする Web ページの仕組み〕の⑤",
    why: "括弧の混在・重複 (clean 既正・raw 併修)" },
  { id: q(99), field: "stem",
    from: "よる通信で利用する仕組 みとして, 適切な",
    to: "よる通信で利用する仕組みとして, 適切な",
    why: "語中空白 (clean 既正・raw 併修)" },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));

let edits = 0;
for (const f of FIXES) {
  const rec = byId.get(f.id);
  if (!rec) throw new Error(`${f.id}: not in question_bank`);
  const isChoice = f.field.startsWith("choice:");
  const letter = isChoice ? f.field.split(":")[1] : null;
  const cur = isChoice ? rec.choices_jp[letter] : rec.stem_jp;
  const n = cur.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} ${f.field}: expected exactly 1 occurrence of «${f.from.slice(0, 40)}», found ${n}`);
  const next = cur.replace(f.from, f.to);
  if (isChoice) rec.choices_jp[letter] = next;
  else rec.stem_jp = next;
  edits++;
  console.log(`  ✓ ${f.id} [${f.field}] ${f.why}`);
}

writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
console.log(`✓ quiz-phase2-stemfix-S112b: ${edits} edits`);
