#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — explfix2 S115: 是正完了後の **陳腐化 caveat 除去** + 裁決注記の訂正。
//
// 常設順序 ⑥「すべての是正が終わってから caveat 除去を 1 回で行う」に従い、
// fidfix-S115 / S115b / S115c / S115d をすべて適用し verify-result が GREEN になってから実施する。
//
// ══ (A) 陳腐化 caveat の除去 (学習者に見える本文) ══
// 是正後の表示テキストでは成り立たなくなった「原文には OCR 誤字があり…」型の注記。
// merge 後の sidecar (`explanations/<exam>.json`) の correct / distractors / points を
// 走査したところ **2 問 6 フィールド**だけ残っていた (他の hit は誤答解説の通常表現
// 「〜は誤り」「正しくは 24 通り」等で、表示テキストの破損には言及していない偽陽性)。
//
// ══ (B) 主 context の裁決注記の訂正 — 2009h21h-q057 ══
// explfix-S115 で私は q057 を「二重正解になっていた」と断定して書いたが、**言い過ぎ**だった。
// 設問の〔指定方法〕(2) は「カレントディレクトリは『.』で表す」と定義しており、
// これを厳密に読むと腐敗版 `..¥.¥D2¥D4¥a` の中間の「.」は **D3 を指す**ので
// 「D1 へ上がった直後に D3 へ戻る」となり D2 へは進めない = 誤答肢のままである。
// 一方、一般のファイルシステム流儀 (「.」= その時点の位置に留まる) で読むと
// D1 → 留まる → D2 → D4 → a と解決され、正解肢イと等価になる。
// **双 pass はいずれも後者の流儀で読んで answer_affecting と判定した**。
// どちらの読みでも「源の表記へ戻す」是正が正しいことは変わらないが、
// 「二重正解であった」と断定はできない。注記を実態に合わせて書き直す。
// (生成器の解説本文も両方の読みを検討したうえで「いずれの読みでもアは誤り」と
//  結論しており、そちらの記述のほうが慎重だった。)
//
// Run: node scripts/quiz-phase2-explfix2-S115.mjs
//   (then: node scripts/quiz-phase2-merge.mjs <exam> ごと → verify-result)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = path.join(ROOT, "data/ip/quiz/.phase2");

// ─────────── (A) 陳腐化 caveat: **merge の入力ファイル**から除去 ───────────
// merge は `data/ip/quiz/.phase2/expl_jp_<id>.json` / `expl_tr_<id>.json` を読んで
// sidecar を再生成するので、sidecar だけを直すと次の merge で巻き戻る。**入力側を直す**。
// (S114 は merge 後の sidecar を fidfix-repair で直していたが、その方式だと
//  再 merge で復活する。本 session で入力側を直す方式に改めた。)
const CAVEATS = [
  {
    id: "2010h22a-q060", file: "jp", path: "correct_jp",
    from: "心配されていた IP アドレスの枯渇 (データ側では OCR 誤字で「枯渦」と表記されているが、正しくは「枯渇」) が回避できる",
    to: "心配されていた IP アドレスの枯渇が回避できる",
    why: "選択肢イの「枯渦」を fidfix-S115c で「枯渇」に是正済のため注記が陳腐化",
  },
  {
    id: "2010h22a-q060", file: "tr", path: "correct.zh",
    from: "因此此前所担忧的 IP 地址枯竭（数据中因 OCR 误字写成「枯渦」，正确写法是「枯渇」）得以避免",
    to: "因此此前所担忧的 IP 地址枯竭得以避免",
    why: "同上 (zh)",
  },
  {
    id: "2010h22a-q060", file: "tr", path: "correct.en",
    from: "the feared depletion of IP addresses (in the source data an OCR typo writes it as 「枯渦」, but the correct word is 「枯渇」) can be avoided",
    to: "the feared depletion of IP addresses can be avoided",
    why: "同上 (en)",
  },
  {
    id: "2009h21h-q022", file: "jp", path: "distractors_jp[letter=ウ].why_wrong_jp",
    from: "なお選択肢中の「ピジョン」は「ビジョン」の表記ゆれ (OCR 由来) です。",
    to: "",
    why: "選択肢ウの「ピジョン」を fidfix-S115c で「ビジョン」に是正済のため注記が陳腐化",
  },
  {
    id: "2009h21h-q022", file: "tr", path: "distractors[letter=ウ].zh",
    from: "另外，选项中的「ピジョン」是「ビジョン」（愿景）的写法偏差，来自 OCR。",
    to: "",
    why: "同上 (zh)",
  },
  {
    id: "2009h21h-q022", file: "tr", path: "distractors[letter=ウ].en",
    from: "Note that ピジョン in the choice text is a spelling variation of ビジョン (vision) that came from OCR.",
    to: "",
    why: "同上 (en)",
  },
];

// path は「a.b」または「arr[letter=X].field」を解決する
const resolve = (obj, p) => {
  let cur = obj;
  for (const seg of p.split(".")) {
    const m = seg.match(/^([A-Za-z_]+)\[letter=(.+)\]$/);
    if (m) {
      const arr = cur[m[1]];
      if (!Array.isArray(arr)) throw new Error(`not an array: ${m[1]}`);
      const hit = arr.find((x) => x.letter === m[2]);
      if (!hit) throw new Error(`letter ${m[2]} not found in ${m[1]}`);
      cur = hit;
    } else cur = cur[seg];
    if (cur == null) throw new Error(`path segment missing: ${seg}`);
  }
  return cur;
};
const resolveParent = (obj, p) => {
  const ks = p.split(".");
  const last = ks.pop();
  return [ks.length ? resolve(obj, ks.join(".")) : obj, last];
};

let removed = 0;
for (const c of CAVEATS) {
  const fp = path.join(P2, `expl_${c.file}_${c.id}.json`);
  const doc = JSON.parse(readFileSync(fp, "utf-8"));
  const [parent, key] = resolveParent(doc, c.path);
  const cur = parent[key];
  if (typeof cur !== "string") throw new Error(`${c.id} ${c.path}: not a string`);
  if (!cur.includes(c.from)) { console.log(`  = ${c.id} ${c.path}: 既に除去済 → skip`); continue; }
  const n = cur.split(c.from).length - 1;
  if (n !== 1) throw new Error(`${c.id} ${c.path}: from occurs ${n} times`);
  parent[key] = cur.replace(c.from, c.to).replace(/\s{2,}/g, " ").trim();
  writeFileSync(fp, JSON.stringify(doc, null, 2) + "\n");
  removed++;
  console.log(`  \u2713 ${c.id} ${c.path}: ${c.why}`);
}

// ─────────── (B) 裁決注記の訂正 (generate_result 側) ───────────
const CORRECTED_Q057 =
  "【S115 裁決】選択肢ア `..¥.¥D2¥D4¥a` → 源 `..¥..¥D2¥D4¥a` に是正 (ドット 1 個の脱落、双 pass 一致)。" +
  "**severity の扱いに注意**: 双 pass はいずれも一般のファイルシステム流儀 (「.」= その時点の位置に留まる) で読み、" +
  "腐敗版が D3 → D1 → 留まる → D2 → D4 → a と解決されて正解肢イ `..¥D2¥D4¥a` と等価になる = 二重正解、" +
  "として **answer_affecting** と判定した。ただし設問の〔指定方法〕(2) は「カレントディレクトリは『.』で表す」" +
  "と定義しており、これを厳密に読むと中間の「.」は D3 を指すため「D1 へ上がった直後に D3 へ戻る」となり " +
  "D2 へは進めず、腐敗版でも誤答肢のままである。**したがって『二重正解であった』と断定はできない** " +
  "(explfix-S115 で主 context が断定的に書いたのは言い過ぎで、explfix2-S115 で訂正した)。" +
  "いずれの読みでも「源の表記に戻す」是正が正しいことは変わらない。zh / en も同じ壊れた文字列を持っていたため 3 言語是正 (fidfix-S115c)。key イ 不変。";

const p57 = path.join(P2, "generate_result_2009h21h.json");
const gr = JSON.parse(readFileSync(p57, "utf-8"));
const r57 = (gr.results ?? []).find((x) => x.id === "2009h21h-q057");
if (!r57?.key_guard) throw new Error("2009h21h-q057: no key_guard");
const note = String(r57.key_guard.note_jp ?? "");
const i = note.indexOf("【S115 裁決】");
if (i < 0) throw new Error("2009h21h-q057: 【S115 裁決】 が無い (explfix-S115 未適用?)");
r57.key_guard.note_jp = `${note.slice(0, i)}${CORRECTED_Q057}`.trim();
writeFileSync(p57, JSON.stringify(gr, null, 2) + "\n");
console.log(`  ✓ 2009h21h-q057: 裁決注記を訂正 (「二重正解と断定」→ 読み方に依存する旨を明記)`);

console.log(`✓ quiz-phase2-explfix2-S115: caveat 除去 ${removed} 箇所 / 注記訂正 1 件`);
console.log(`  next: node scripts/quiz-phase2-merge.mjs <exam> → verify-result`);
