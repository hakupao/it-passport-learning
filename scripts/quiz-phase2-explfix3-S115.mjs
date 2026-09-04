#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — explfix3 S115: `2009h21h-q057` 選択肢ア 解説の陳腐化補足を除去。
//
// 生成時、選択肢アの表示テキストは `..¥.¥D2¥D4¥a` (ドット 1 個脱落) の状態だった。
// 生成器はそれを察知して「原典の表記は…」と源の形で説明したうえで、
// **腐敗版で読んだ場合も誤答肢のままである**ことを補足で丁寧に論証していた
// (指定方法(2) が「.」= カレントディレクトリ = D3 と定義しているため、
//  「..」で D1 へ上がった直後に D3 へ戻ってしまい D2 へ進めない、という筋)。
//
// fidfix-S115c で選択肢アを源の `..¥..¥D2¥D4¥a` に戻したので:
//   - 「原典の表記は」という前置きは不要 (表示テキスト = 原典になった)
//   - 腐敗版についての補足は**存在しない状態への注記**になり陳腐化した
// 本文は源の形に対する説明として完結しているので、前置きの言い換えと補足の除去だけ行う。
//
// なお、この補足の論証は主 context にとって有用だった: 双 pass の保真核験は
// 一般のファイルシステム流儀 (「.」= 留まる) で読んで answer_affecting (二重正解) と
// 判定していたが、設問の指定方法(2) を厳密に読むとそうならない。
// **生成器の解説のほうが慎重だった**ため、explfix2-S115 で裁決注記を訂正した。
//
// Run: node scripts/quiz-phase2-explfix3-S115.mjs
//   (then: node scripts/quiz-phase2-merge.mjs 2009h21h → verify-result)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = path.join(ROOT, "data/ip/quiz/.phase2");
const ID = "2009h21h-q057";

const EDITS = [
  {
    file: "jp", letter: "ア", field: "why_wrong_jp",
    from: "原典の表記は「..¥..¥D2¥D4¥a」で、「..」が 2 回続いている。",
    to: "本肢は「..¥..¥D2¥D4¥a」で、「..」が 2 回続いている。",
  },
  {
    file: "jp", letter: "ア", field: "why_wrong_jp",
    from: "上がるのは 1 階層だけでよい。（補足: 入力データ側では OCR により 2 つ目のドットが 1 個脱落して「..¥.¥D2¥D4¥a」と記録されている場合があるが、この表記でも指定方法(2)が「.」をカレントディレクトリ＝D3 と定義しているため、途中の「.」は D3 を指すことになり、「..」で D1 へ上がった直後に D3 へ戻ってしまって D1 配下の D2 へ進めない。いずれの表記で読んでも ア は正しい経路にならない。）",
    to: "上がるのは 1 階層だけでよい。",
  },
  {
    file: "tr", letter: "ア", field: "zh",
    from: "原题中的写法是「..¥..¥D2¥D4¥a」，",
    to: "本项是「..¥..¥D2¥D4¥a」，",
  },
  {
    file: "tr", letter: "ア", field: "zh",
    from: "向上只需一层即可。（补充：输入数据中由于 OCR 使第二个「..」少了一个点，可能被记录成「..¥.¥D2¥D4¥a」；但即便按这种写法，因为指定方法(2)把「.」定义为当前目录＝D3，中间的「.」就指向 D3，于是在用「..」上到 D1 之后又立刻回到 D3，无法前进到 D1 之下的 D2。无论按哪种写法解读，ア 都不构成正确的路径。）",
    to: "向上只需一层即可。",
  },
  {
    file: "tr", letter: "ア", field: "en",
    from: "In the original exam text this option is 「..¥..¥D2¥D4¥a」, with",
    to: "This option is 「..¥..¥D2¥D4¥a」, with",
  },
  {
    file: "tr", letter: "ア", field: "en",
    from: " (Note: in the input data an OCR error may have dropped one dot from the second 「..」, recording it as 「..¥.¥D2¥D4¥a」. Even read that way, method (2) defines 「.」 as the current directory, that is D3, so the middle 「.」 points back to D3: after going up to D1 with 「..」 you immediately return to D3 and cannot proceed to D2 under D1. Under either reading, ア does not form a valid path.)",
    to: "",
  },
];

let n = 0;
for (const e of EDITS) {
  const fp = path.join(P2, `expl_${e.file}_${ID}.json`);
  const doc = JSON.parse(readFileSync(fp, "utf-8"));
  const arr = e.file === "jp" ? doc.distractors_jp : doc.distractors;
  const hit = arr.find((x) => x.letter === e.letter);
  if (!hit) throw new Error(`${ID}: letter ${e.letter} not found`);
  const cur = hit[e.field];
  if (typeof cur !== "string") throw new Error(`${ID}: ${e.field} not a string`);
  if (!cur.includes(e.from)) { console.log(`  = ${ID} ${e.file}.${e.field}: 既に適用済 → skip`); continue; }
  const c = cur.split(e.from).length - 1;
  if (c !== 1) throw new Error(`${ID} ${e.file}.${e.field}: from occurs ${c} times`);
  hit[e.field] = cur.replace(e.from, e.to).replace(/\s{2,}/g, " ").trim();
  writeFileSync(fp, JSON.stringify(doc, null, 2) + "\n");
  n++;
  console.log(`  ✓ ${ID} ${e.file}.${e.field}: «${e.from.slice(0, 28)}…» を書き換え`);
}
console.log(`✓ quiz-phase2-explfix3-S115: ${n} 箇所`);
