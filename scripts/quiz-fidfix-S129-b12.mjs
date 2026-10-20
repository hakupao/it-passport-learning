#!/usr/bin/env node
// Stage 6 / Quiz — S129 B track **B12** (2009h21h、100 問 / Sonnet 5 単 pass、D-150 §3) の差分を是正する。
// 源: S129 の workflow `wf_cb2b1b72-fad`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b12_2009h21h_sn.json
//     マニフェスト = data/ip/quiz/.phase2/b12_fidelity_input_2009h21h.json (precrop 77/100、skip 23 = page_mismatch 21 (中問 12 + 短見出し型 9) + merged_preamble 2 (q007 / q048))
//     機械 diff (S128 L1a 改修版) = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 480 / AGENT_MISSED 8 / TRANSCRIPT_PREFIX 1 (q080、棒グラフの表化) / QUOTE_ASCII 0 / VERDICT_CONFLICT 0
//                 実残差 = q072 (図1 / 図2 キャプションの AI 付加括弧)。q057 (ASCII 図、agent 報告済み)・q080 (表化、値は源の棒グラフと一致)・
//                 中問前文 (q091〜q096、前文頁が source / prev に無い既知型) は不変。
//
// 層・方針は quiz-fidfix-S122-u3a 〜 S129-b9 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2009h21h の sidecar のキーは `stem` / `choices` / `stem_jp_clean` (clean は一部の題のみ)。`choices_jp_clean` は無い → 選択肢は raw 3 層が出荷層。
// 中問 3 組 (A = mqA q089-092 / B = mqB q093-096 / C = mqC q097-100) は抽出組で前文埋め込み済み。前文は触らず、from は設問文側の部分一致
// (q090 の 2 箇所・q098 en はどちらも設問文。registry probe の「Mさんの部署では…」「通信販売を行っているF社には…」は不変)。
// 読点: この exam の出荷層は ASCII「, 」の題が多い (⑨、不変)。補う区切りは同じ field の既存字種に揃える (S129 裁定)。
//
// 採用した差分 (evidence §6。源 crop / 源ページを原寸で独立実読して確認):
//   q085 stem  (p32) 参照列「A，B，C，D，E，A，F，E，A，B，F」→ 源「A，B，C，D，B，A，E，A，B，F」(raw = 出荷層、zh / en 追随)。
//              源の列で LRU を再導出 → 退避 C→D、最後は D = ウ = stored key (一致)。解説 correct + ア / イ / エ (jp / zh / en) は
//              誤った列でトレースしているので **源の列で全面再導出して書き直す** (Rule A 規模、evidence §4b に記録)。points は一般論で不変
//   q050 イ    (p19) 「フローダイアグラム」→ 源「アローダイアグラム」(jp 3 層、zh「箭线图（arrow diagram）」、en "Arrow diagram")。解説イ も書き直す
//   q040 ア    (p16) 「例外使用しないように」→ 源「例外使用をしないように」(zh / en は可)
//   q090 stem  (p35) 設問文「追究」→ 源「追及」、「出力できるかも確認」→ 源「出力できるかをも確認」(clean のみ。raw は源どおり)
//   q002 stem  (p03) ASCII "個人情報" → 源 “個人情報”
//   q038 stem  (p16) 「要件定義」「システム設計」… → 源 “要件定義”, “システム設計”, …(区切りは field の字種「, 」)
//   q057 stem  (p22) 〔指定方法〕(1)〜(5) の「」→ 源 “”(¥ は源どおり据え置き)、ASCII 図の前の AI 見出し〔ディレクトリ構造（図）〕を削除 (D-158、jp / zh / en)。
//              図の後の（注：…）は stem の事実の言い直しで推論を含まない描画補助 → 不変
//   q072 stem  (p28) 図の言語化のキャプション「図1（ボックスの動作）」「図2（ボックスを2個直列に接続）」の AI 付加括弧を削除 (源は「図1」「図2」、D-158、jp / zh / en)
//   q087 stem / 選択肢 (p33) D-162: 表 B 列と選択肢イ〜エの式の「＋」「－」→ ASCII、選択肢の範囲記号「〜」→ 源「～」(jp、zh は演算子のみ)。**アは正解肢** (範囲記号のみ)
//   q098 en    (p43) 設問文の Ms. A / Ms. B → 前文・q097 / q099 / q100 と同じ Mr. A / Mr. B (源は「A さん」)
//
// Run: node scripts/quiz-fidfix-S129-b12.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S129-b12.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2009h21h
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = !process.argv.includes("--apply") || process.argv.includes("--dry-run");
const STAGE = process.env.FIDFIX_STAGE;
const P = (...s) => path.join(ROOT, ...s);
const LOADED = new Map();
const rj = (f) => { const d = JSON.parse(readFileSync(f, "utf-8")); LOADED.set(f, JSON.stringify(d, null, 2)); return d; };
const written = [];
const wj = (f, d) => {
  const next = JSON.stringify(d, null, 2);
  if (LOADED.get(f) === next) return;
  const rel = path.relative(ROOT, f);
  written.push(rel);
  if (STAGE) { const sf = path.join(STAGE, rel); mkdirSync(path.dirname(sf), { recursive: true }); writeFileSync(sf, next + "\n"); }
  else if (!DRY) writeFileSync(f, next + "\n");
};
let applied = 0, skipped = 0; const log = [];

function sub(obj, key, from, to, where) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  if (to && to.includes(from) && s.includes(to)) { skipped++; return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; return false; }
  if (n > 1) throw new Error(`${where}: 「${from}」 occurs ${n}× — abort`);
  const next = s.replace(from, to);
  if (to && !next.includes(to)) throw new Error(`${where}: 置換後に to 「${to.slice(0, 36)}」 が見つからない — abort`);
  obj[key] = next; applied++; log.push(`  ✓ ${where}: 「${from.slice(0, 40)}」→「${to.slice(0, 40)}」`); return true;
}
// 全出現を置換する (q087 解説の式の引用用)。件数を log に出し、0 件は skip。
function subAll(obj, key, from, to, where) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; return false; }
  obj[key] = s.split(from).join(to); applied++; log.push(`  ✓ ${where}: 「${from}」→「${to}」 ×${n}`); return true;
}
// 段落ごと書き直す (q085 / q050 の解説)。新文と同一なら skip (冪等)、旧文の目印が無ければ想定外として止める (無言 skip 禁止)。
function rewrite(obj, key, marker, text, where) {
  const s = obj?.[key];
  if (typeof s !== "string") throw new Error(`${where}: field ${key} missing — abort`);
  if (s === text) { skipped++; return false; }
  if (!s.includes(marker)) throw new Error(`${where}: 旧文の目印「${marker}」が無い — abort`);
  obj[key] = text; applied++; log.push(`  ✓ ${where}: 書き直し (${s.length} → ${text.length} 字、目印「${marker.slice(0, 24)}」)`); return true;
}

// q098 en の設問文 (前文の後)。Ms. → Mr. (前文・同組の他題と同じ敬称)。
const Q098_EN = "The relationship between working time and the weekly mail-order task progress rate when Ms. A and Ms. B each perform the mail-order task alone is represented by a graph like the one shown. The relationship between working time and progress rate when Ms. A works alone is shown by line segment a, and the relationship when Ms. B works alone is shown by line segment b.\n　When Ms. A and Ms. B perform the mail-order task together";

const FIX = {
  // ── 題幹 ────────────────────────────────────────────────────────────────────
  // q002: clean 無し (raw = 出荷層)。源は “個人情報”(前後に空白なし)。zh は “” で処置済み、en の ASCII " は英文の通常の引用。
  "2009h21h-q002": { jp: [["stem", "において, \"個人情報\" の対象", "において, “個人情報”の対象"]] },
  // q038: clean が出荷層 (raw は OCR 崩れで非出荷)。源は “要件定義”，“システム設計”，“プログラミング”，“テスト”。区切りは同 field の「, 」。zh / en は可。
  "2009h21h-q038": { jp: [["stem", "「要件定義」「システム設計」「プログラミング」「テスト」の各工程", "“要件定義”, “システム設計”, “プログラミング”, “テスト”の各工程"]] },
  // q057: 源 p22 の〔指定方法〕は “”。¥ は源どおり (S129 裁定)。zh「」は ⑨-c、en は既に “”。
  //   〔ディレクトリ構造（図）〕は源に無い AI 見出し (D-158) → 3 層とも削除。（注：…）は stem の事実の言い直しで推論なし → 描画補助として不変。
  "2009h21h-q057": {
    jp: [
      ["stem", "(1) ファイルは，「ディレクトリ名¥…¥ディレクトリ名¥ファイル名」のように，経路上のディレクトリを順に「¥」で区切って並べた後に「¥」とファイル名", "(1) ファイルは，“ディレクトリ名¥…¥ディレクトリ名¥ファイル名”のように，経路上のディレクトリを順に“¥”で区切って並べた後に“¥”とファイル名"],
      ["stem", "(2) カレントディレクトリは「.」で表す。", "(2) カレントディレクトリは“.”で表す。"],
      ["stem", "(3) 1階層上のディレクトリは「..」で表す。", "(3) 1階層上のディレクトリは“..”で表す。"],
      ["stem", "(4) 始まりが「¥」のときは", "(4) 始まりが“¥”のときは"],
      ["stem", "(5) 始まりが「¥」，「.」，「..」のいずれでもないときは，左端にカレントディレクトリ配下であることを示す「.¥」が", "(5) 始まりが“¥”，“.”，“..”のいずれでもないときは，左端にカレントディレクトリ配下であることを示す“.¥”が"],
      ["stem", "\n\n〔ディレクトリ構造（図）〕\n```", "\n\n```"],
    ],
    zh: [["stem", "\n\n〔目录结构（图）〕\n```", "\n\n```"]],
    en: [["stem", "\n\n[Directory structure (figure)]\n```", "\n\n```"]],
  },
  // q072: 源 p28 のキャプションは「図1」「図2」のみ。括弧書きは AI 付加 (D-158、B9 q089 凡例と同じ扱い)。言語化本体と箱の「A1／A2の余り」は源どおり不変。
  "2009h21h-q072": {
    jp: [["stem", "図1（ボックスの動作）: ", "図1: "], ["stem", "図2（ボックスを2個直列に接続）: ", "図2: "]],
    zh: [["stem", "图1（方框的动作）：", "图1："], ["stem", "图2（将2个方框串联连接）：", "图2："]],
    en: [["stem", "Figure 1 (box behavior): ", "Figure 1: "], ["stem", "Figure 2 (two boxes connected in series): ", "Figure 2: "]],
  },
  // q085: clean 無し (raw = 出荷層)。源 p32 の参照列は 10 件「A，B，C，D，B，A，E，A，B，F」。表示は 11 件の別の列。zh / en も同じ誤りを持つ → 追随。
  "2009h21h-q085": {
    jp: [["stem", "ファイルがA，B，C，D，E，A，F，E，A，B，Fの順で", "ファイルがA，B，C，D，B，A，E，A，B，Fの順で"]],
    zh: [["stem", "按 A、B、C、D、E、A、F、E、A、B、F 的顺序", "按 A、B、C、D、B、A、E、A、B、F 的顺序"]],
    en: [["stem", "in the order A, B, C, D, E, A, F, E, A, B, F,", "in the order A, B, C, D, B, A, E, A, B, F,"]],
  },
  // q090: 設問文 (前文の後) のみ。clean の再構成で「追及」→「追究」、「かをも」→「かも」に崩れた (raw は源どおり → n===0 skip)。zh / en は可。
  "2009h21h-q090": { jp: [["stem", "障害の原因を追究するため，PC2 からプリンタに出力できるかを確認した。また，PC1 と PC2 をハブにつないでいるケーブル c と d をハブ側で差し替えた場合，PC2 からプリンタに出力できるかも確認した。", "障害の原因を追及するため，PC2 からプリンタに出力できるかを確認した。また，PC1 と PC2 をハブにつないでいるケーブル c と d をハブ側で差し替えた場合，PC2 からプリンタに出力できるかをも確認した。"]] },
  // q098: en の設問文だけ Ms.。源は「A さん」で性別なし。前文・q097 / q099 / q100 の Mr. に揃える (prep §3 別件)。
  "2009h21h-q098": { en: [["stem", Q098_EN, Q098_EN.replaceAll("Ms. ", "Mr. ")]] },
  // ── 選択肢 ──────────────────────────────────────────────────────────────────
  "2009h21h-q040": { jp: [["ア", "例外使用しないように", "例外使用をしないように"]] },
  // q050: 源 p19 は「アローダイアグラム」。誤りは 3 層とも。正解はウ (ガントチャート)。
  "2009h21h-q050": {
    jp: [["イ", "フローダイアグラム", "アローダイアグラム"]],
    zh: [["イ", "流程图（flow diagram）", "箭线图（arrow diagram）"]],
    en: [["イ", "Flow diagram", "Arrow diagram"]],
  },
};

// q087 (D-162): 表計算式の算術演算子は ASCII、範囲記号は原典どおり「～」。en は既に ASCII / "~"。
//   表 B 列 (jp raw / clean・zh) と選択肢 (jp: 演算子 + 範囲記号、zh: 演算子のみ)。アは**正解肢** (範囲記号のみ)。
{
  const cells = Array.from({ length: 9 }, (_, i) => [`| B${i + 1}＋A${i + 2} |`, `| B${i + 1}+A${i + 2} |`]);
  FIX["2009h21h-q087"] = {
    jp: [
      ...cells.map(([f, t]) => ["stem", f, t]),
      ["ア", "合計(A$1〜A10)", "合計(A$1～A10)"],
      ["イ", "合計(A$1〜A$10)－合計($A$1〜A10)", "合計(A$1～A$10)-合計($A$1～A10)"],
      ["ウ", "合計(A$1〜A$10)－合計($A$10〜A10)", "合計(A$1～A$10)-合計($A$10～A10)"],
      ["エ", "合計(A$1〜A$10)－合計($A$1〜A10)＋A10", "合計(A$1～A$10)-合計($A$1～A10)+A10"],
    ],
    zh: [
      ...cells.map(([f, t]) => ["stem", f, t]),
      ["イ", "合计(A$1～A$10)－合计($A$1～A10)", "合计(A$1～A$10)-合计($A$1～A10)"],
      ["ウ", "合计(A$1～A$10)－合计($A$10～A10)", "合计(A$1～A$10)-合计($A$10～A10)"],
      ["エ", "合计(A$1～A$10)－合计($A$1～A10)＋A10", "合计(A$1～A$10)-合计($A$1～A10)+A10"],
    ],
  };
}

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
// q085: 誤った参照列 (A,B,C,D,E,A,F,E,A,B,F) でトレースした correct / ア / イ / エ を、源の列 (A,B,C,D,B,A,E,A,B,F) で再導出して書き直す。
//   源の列: 5 B・6 A は机上 (時刻更新) → 7 E で C を退避 → 8 A・9 B は机上 → 10 F で D を退避。退避順 C→D、最後は D = ウ。A / B / E は一度も退避されない。
const Q085 = {
  correct: {
    jp: ["A,B,C,D,E,A,F,E,A,B,F", "この机のルールは「置けるのは4冊まで、5冊目を置きたいときは最後に参照してから最も時間が経過している (=最も長く使っていない) ファイルをしまう」というもので、これは LRU (Least Recently Used) 方式そのものです。参照列 A,B,C,D,B,A,E,A,B,F を順に追うと次のようになります。\n1回目 A / 2回目 B / 3回目 C / 4回目 D — ここで机上は A,B,C,D の4冊で満杯。\n5回目 B: すでに机上にあるのでしまう必要はなく、B の参照時刻だけが最新になる。\n6回目 A: 同様に机上にあるので退避なし、A の参照時刻が最新になる。\n7回目 E: 机上に無い。この時点の最終参照時刻は C が3回目、D が4回目、B が5回目、A が6回目なので、最も古いのは C → C をしまう。机上は A,B,D,E。\n8回目 A: 机上にあるので退避なし、A の参照時刻が最新になる。\n9回目 B: 机上にあるので退避なし、B の参照時刻が最新になる。\n10回目 F: 机上に無い。この時点の最終参照時刻は D が4回目、E が7回目、A が8回目、B が9回目なので、最も古いのは D → D をしまう。机上は A,B,E,F。\nしたがって引き出しにしまわれた順は C→D で、最後にしまうファイルは D となり、正解は「ウ」です。"],
    zh: ["A、B、C、D、E、A、F、E、A、B、F", "这张桌子的规则是“最多只能放 4 本，想放第 5 本时，就把自最后一次参照以来经过时间最长（即最久没有使用）的文件收进抽屉”，这正是 LRU（Least Recently Used，最近最少使用）方式本身。按 A、B、C、D、B、A、E、A、B、F 的顺序依次追踪如下。\n第 1 次 A / 第 2 次 B / 第 3 次 C / 第 4 次 D —— 此时桌上是 A、B、C、D 共 4 本，已经放满。\n第 5 次 B：已经在桌上，因此无需收起，只是 B 的参照时刻更新为最新。\n第 6 次 A：同样在桌上，因此不发生收起，A 的参照时刻更新为最新。\n第 7 次 E：桌上没有。此时各文件的最后参照时刻是 C 为第 3 次、D 为第 4 次、B 为第 5 次、A 为第 6 次，最早的是 C → 把 C 收起。桌上为 A、B、D、E。\n第 8 次 A：在桌上，不发生收起，A 的参照时刻更新为最新。\n第 9 次 B：在桌上，不发生收起，B 的参照时刻更新为最新。\n第 10 次 F：桌上没有。此时各文件的最后参照时刻是 D 为第 4 次、E 为第 7 次、A 为第 8 次、B 为第 9 次，最早的是 D → 把 D 收起。桌上为 A、B、E、F。\n因此收进抽屉的顺序是 C→D，最后收进抽屉的文件是 D，正确答案为 ウ。"],
    en: ["A, B, C, D, E, A, F, E, A, B, F", "The rule for this desk is “at most 4 files may be placed on it, and when you want to place a 5th one, you put away into the drawer the file that has gone the longest since it was last referenced (that is, the one unused for the longest time),” which is exactly the LRU (Least Recently Used) method itself. Tracing the reference sequence A, B, C, D, B, A, E, A, B, F in order gives the following.\n1st A / 2nd B / 3rd C / 4th D — at this point the desk is full with the 4 files A, B, C, D.\n5th, B: it is already on the desk, so nothing needs to be put away; only the reference time of B becomes the newest.\n6th, A: likewise it is on the desk, so no file is put away, and the reference time of A becomes the newest.\n7th, E: it is not on the desk. At this point the last reference times are the 3rd for C, the 4th for D, the 5th for B and the 6th for A, so the oldest is C → put C away. The desk holds A, B, D, E.\n8th, A: it is on the desk, so no file is put away, and the reference time of A becomes the newest.\n9th, B: it is on the desk, so no file is put away, and the reference time of B becomes the newest.\n10th, F: it is not on the desk. At this point the last reference times are the 4th for D, the 7th for E, the 8th for A and the 9th for B, so the oldest is D → put D away. The desk holds A, B, E, F.\nTherefore the order in which files were put into the drawer is C→D, the last file put away is D, and the correct answer is ウ."],
  },
  dist: {
    ア: {
      jp: ["5回目 E のとき", "A は6回目と8回目に再び参照されるため、退避判定が行われる7回目・10回目のどちらの時点でも最終参照時刻が新しく、追い出されません。A はこの参照列の間、一度も引き出しにしまわれないファイルです。"],
      zh: ["第 5 次参照 E 时", "A 在第 6 次和第 8 次又被参照，因此在进行收起判定的第 7 次和第 10 次这两个时点，它的最后参照时刻都比较新，不会被赶出去。在这个参照序列中，A 是一次也没有被收进抽屉的文件。"],
      en: ["at the 5th reference, E", "A is referenced again at the 6th and the 8th steps, so at both points where an eviction is decided (the 7th and the 10th) its last reference is recent and it is not pushed out. Throughout this reference sequence, A is a file that is never put into the drawer."],
    },
    イ: {
      jp: ["6回目 A のとき", "B は5回目と9回目に再び参照されるため、7回目の時点では C・D より新しく、10回目の時点では最も新しく参照されたファイルです。B はこの参照列の間、一度も引き出しにしまわれません。"],
      zh: ["第 6 次参照 A 的时候", "B 在第 5 次和第 9 次又被参照，因此在第 7 次时点比 C、D 更新，在第 10 次时点则是最近被参照的文件。在这个参照序列中，B 一次也没有被收进抽屉。"],
      en: ["at the 6th reference (A)", "B is referenced again at the 5th and the 9th steps, so at the 7th step it is newer than C and D, and at the 10th step it is the most recently referenced file. Throughout this reference sequence, B is never put into the drawer."],
    },
    エ: {
      jp: ["5回目に机上に載った", "E は7回目に C と入れ替わりで机上に載ったファイルで、10回目の時点の最終参照は7回目と、D (最終参照は4回目) より新しいため追い出されません。E はこの参照列の間、一度も引き出しにしまわれないファイルです。"],
      zh: ["第 5 次被放到桌上", "E 是在第 7 次替换 C 而放到桌上的文件，到第 10 次时点它的最后参照是第 7 次，比 D（最后参照是第 4 次）更新，不会被赶出去。在这个参照序列中，E 是一次也没有被收进抽屉的文件。"],
      en: ["placed on the desk at the 5th step", "E is placed on the desk at the 7th step in place of C, and at the 10th step its last reference (the 7th) is newer than that of D (the 4th), so it is not pushed out. Throughout this reference sequence, E is a file that is never put into the drawer."],
    },
  },
};
// q050: 選択肢イをアローダイアグラムにしたので、誤答理由イ (フローダイアグラムの説明) を書き直す。points の図の用途一覧は一般論として正しいので不変。
const Q050 = {
  dist: {
    イ: {
      jp: ["フローダイアグラムは", "アローダイアグラム (PERT図) は、作業を矢線、作業の区切り (結合点) を丸印で表し、作業の順序関係・依存関係とクリティカルパスを示すネットワーク図。工程管理には使われるが、矢線の長さは所要期間に比例せず、横軸に時間を取る形式でもないため、設問の図には当たらない。"],
      zh: ["流程图（flow diagram）是", "箭线图（arrow diagram，PERT 图）用箭线表示作业、用圆圈表示作业的分界点（结合点），是表示作业先后顺序、依赖关系和关键路径的网络图。它虽然也用于工程管理，但箭线的长度与所需工期不成比例，也不是以横轴取时间的形式，因此不是题目所说的图。"],
      en: ["A flow diagram shows", "An arrow diagram (PERT chart) is a network diagram that represents activities as arrows and the boundaries between activities (nodes) as circles, showing the order of and dependencies between activities and the critical path. It is used in process management, but the arrow lengths are not proportional to the required durations and it does not take time on a horizontal axis, so it is not the chart described in the question."],
    },
  },
};
// q087: 解説が選択肢の式・表 B 列をそのまま引用している箇所だけ選択肢と同じ字形に (B7 q088 と同じ範囲)。
//   解説独自の記法「合計(A1〜A_n)」等と地の文「セル A1 〜 A10」は引用ではないので不変 (⑨)。長い式から先に置換する。
const Q087_ALL = {
  jp: [
    ["合計(A$1〜A$10)－合計($A$1〜A10)＋A10", "合計(A$1～A$10)-合計($A$1～A10)+A10"],
    ["合計(A$1〜A$10)－合計($A$1〜A10)", "合計(A$1～A$10)-合計($A$1～A10)"],
    ["合計(A$1〜A$10)－合計($A$10〜A10)", "合計(A$1～A$10)-合計($A$10～A10)"],
    ["合計(A$1〜A10)", "合計(A$1～A10)"],
    ["B1＋A2", "B1+A2"], ["B9＋A10", "B9+A10"],
  ],
  zh: [
    ["合计(A$1～A$10)－合计($A$1～A10)＋A10", "合计(A$1～A$10)-合计($A$1～A10)+A10"],
    ["合计(A$1～A$10)－合计($A$1～A10)", "合计(A$1～A$10)-合计($A$1～A10)"],
    ["合计(A$1～A$10)－合计($A$10～A10)", "合计(A$1～A$10)-合计($A$10～A10)"],
    ["B1＋A2", "B1+A2"], ["B9＋A10", "B9+A10"],
  ],
};
const EXPL = { "2009h21h-q085": Q085, "2009h21h-q050": Q050, "2009h21h-q087": { all: Q087_ALL } };

const MARK = "fidfix-S129-b12";
const pg = (id) => { const b = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8")).questions.find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 語義是正 + 正解肢命中 + note が腐敗 / 是正対象の字句を述べている題。
//   語義: q040 q050 q085 q090 / 正解肢命中: q087 (ア、範囲記号のみ)
//   note 言及: q038 (clean の「」を引用) q040 (「例外使用しないように」を引用) q085 (誤った参照列でトレース) q090 (「追究」を含む clean を引用しうる)
//   追記しない: q002 q057 q072 q098 (字種・体裁・訳層のみで note に言及なし)
const NOTE_APPEND = {
  "2009h21h-q038": (p) => `（S129 B12: ${p} 実読で clean の「要件定義」「システム設計」「プログラミング」「テスト」を源の “要件定義”, “システム設計”, “プログラミング”, “テスト” に是正（上記の引用は是正前の字種）。工程を順に区切る = ウォーターフォールモデル = 進捗の把握が容易 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2009h21h-q040": (p) => `（S129 B12: ${p} 実読で 選択肢アを源の「例外使用をしないように」に是正（上記の「例外使用しないように」は是正前の脱字。源どおりの語句で、構成管理の説明）。インシデント管理 = サービスの迅速な回復 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2009h21h-q050": (p) => `（S129 B12: ${p} 実読で 選択肢イ「フローダイアグラム」を源の「アローダイアグラム」に是正（jp / zh / en、解説イも書き直し）。時間を横軸・タスクを縦軸・所要期間に比例した長さ = ガントチャート = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2009h21h-q085": (p) => `（S129 B12: ${p} 実読で 題幹の参照列が源と異なっていた（表示「A，B，C，D，E，A，F，E，A，B，F」→ 源「A，B，C，D，B，A，E，A，B，F」、jp / zh / en）。上記のトレースは是正前の列による。源の列で再導出: 5 B・6 A は机上 → 7 E で C を退避 → 8 A・9 B は机上 → 10 F で D を退避、最後にしまうのは D = ウ。correct_answer=ウ は不変（解説 correct・ア・イ・エも源の列で書き直し） — ${MARK}）`,
  "2009h21h-q087": (p) => `（S129 B12: ${p} 実読で D-162 により表 B 列と選択肢の式の「＋」「－」を ASCII に、選択肢の範囲記号「〜」を源の「～」に揃えた（zh は演算子のみ、解説の式の引用も同じ）。アは**正解肢**だが変更は範囲記号の字形のみで、A$1 を行固定し A10 側を相対参照にした累計 = 合計(A$1～A10) = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2009h21h-q090": (p) => `（S129 B12: ${p} 実読で clean 設問文の「追究」を源の「追及」に、「出力できるかも確認」を源の「出力できるかをも確認」に是正。両確認で PC2 から出力できれば原因はケーブル c = 1 個 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
};
// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set(Object.keys(FIX).map((id) => id.split("-q")[0]))];
const noteExams = [...new Set(Object.keys(NOTE_APPEND).map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(noteExams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));

for (const [id, fx] of Object.entries(FIX)) {
  const exam = id.split("-q")[0];
  const qq = Qdoc.questions.find((x) => x.id === id), b = Barr.find((x) => x.id === id), y = BY[exam].questions.find((x) => x.id === id), t = TR[exam].questions[id];
  const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;
  for (const [field, from, to] of fx.jp ?? []) {
    if (field === "stem") {
      for (const [o, w] of [[qq, "questions.stem_jp"], [b, "question_bank.stem_jp"], [y, "by_year.stem_jp"]]) sub(o, "stem_jp", from, to, `${id} ${w}`);
      if (t?.stem_jp_clean) sub(t, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`);
      if (t1?.stem_jp_clean) sub(t1, "stem_jp_clean", from, to, `${id} .phase1 tr_.stem_jp_clean`);
    } else for (const [o, w] of [[qq, "questions"], [b, "question_bank"], [y, "by_year"]]) sub(o.choices_jp, field, from, to, `${id} ${w}.choices_jp.${field}`);
  }
  for (const lang of ["zh", "en"]) for (const [field, from, to] of fx[lang] ?? []) {
    if (field === "stem") { sub(t.stem, lang, from, to, `${id} translations.stem.${lang}`); if (t1) sub(t1.stem, lang, from, to, `${id} .phase1 tr_.stem.${lang}`); }
    else { sub(t.choices[field], lang, from, to, `${id} translations.choices.${field}.${lang}`); if (t1) sub(t1.choices.find((c) => c.letter === field), lang, from, to, `${id} .phase1 tr_.choices.${field}.${lang}`); }
  }
  if (t1) wj(t1f, t1);
}
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

// expl は id ごとに 1 回だけ読み、全ループで共有する。
const EXPLDOC = new Map();
const expl = (id) => {
  if (!EXPLDOC.has(id)) {
    const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`);
    EXPLDOC.set(id, { jf, tf, j: rj(jf), tr: rj(tf) });
  }
  return EXPLDOC.get(id);
};
for (const [id, ex] of Object.entries(EXPL)) {
  const { j, tr } = expl(id);
  if (ex.correct?.jp) rewrite(j, "correct_jp", ...ex.correct.jp, `${id} expl_jp.correct`);
  for (const L of ["zh", "en"]) if (ex.correct?.[L]) rewrite(tr.correct, L, ...ex.correct[L], `${id} expl_tr.correct.${L}`);
  for (const [letter, d] of Object.entries(ex.dist ?? {})) {
    if (d.jp) rewrite(j.distractors_jp.find((x) => x.letter === letter), "why_wrong_jp", ...d.jp, `${id} expl_jp.${letter}`);
    for (const L of ["zh", "en"]) if (d[L]) rewrite(tr.distractors.find((x) => x.letter === letter), L, ...d[L], `${id} expl_tr.${letter}.${L}`);
  }
  for (const L of ["jp", "zh"]) for (const [from, to] of ex.all?.[L] ?? []) {
    if (L === "jp") {
      subAll(j, "correct_jp", from, to, `${id} expl_jp.correct`);
      for (const d of j.distractors_jp) subAll(d, "why_wrong_jp", from, to, `${id} expl_jp.${d.letter}`);
      j.points_jp.forEach((_, i) => subAll(j.points_jp, i, from, to, `${id} expl_jp.points[${i}]`));
    } else {
      subAll(tr.correct, L, from, to, `${id} expl_tr.correct.${L}`);
      for (const d of tr.distractors) subAll(d, L, from, to, `${id} expl_tr.${d.letter}.${L}`);
      for (const [i, pt] of tr.points.entries()) subAll(pt, L, from, to, `${id} expl_tr.points[${i}].${L}`);
    }
  }
}
for (const { jf, tf, j, tr } of EXPLDOC.values()) { wj(jf, j); wj(tf, tr); }

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk(pg(id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pg(id)}, round1 untouched)`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  files ${STAGE ? `staged to ${STAGE}` : DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S129-b12: applied ${applied}, skipped ${skipped}`);
