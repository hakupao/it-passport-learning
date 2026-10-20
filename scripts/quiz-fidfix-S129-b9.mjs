#!/usr/bin/env node
// Stage 6 / Quiz — S129 B track **B9** (2011h23a、100 問 / Sonnet 5 単 pass、D-150 §3) の差分を是正する。
// 源: S129 の workflow `wf_a88e4db5-ddf`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b9_2011h23a_sn.json
//     マニフェスト = data/ip/quiz/.phase2/b9_fidelity_input_2011h23a.json (precrop 86/100、skip 14 = page_mismatch 12 (中問) + merged_preamble 2 (q007 / q045))
//     機械 diff (S128 L1a 改修版) = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 472 / AGENT_MISSED 19 / TRANSCRIPT_PREFIX 1 (q032、図の言語化) / QUOTE_ASCII 0 / VERDICT_CONFLICT 0
//                 実残差 = q094 (「(1) 1 作業者」の 1)、q100 (「販売促進策は、どれか」の読点)。
//                 q005 (選択肢表の一行化)・q007 / q045 / q064 / q032 (図の言語化)・q057 (選択肢の図の言語化)・中問前文 (q090〜q092 / q095 / q096) は不変。
//
// 層・方針は quiz-fidfix-S122-u3a 〜 S129-b8 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2011h23a の sidecar のキーは `stem` / `choices` / `stem_jp_clean`。`choices_jp_clean` は無い → 選択肢は raw 3 層が出荷層。
// 中問 3 組 (A = q089-copy / B = q093-copy / C = mqC) は前文埋め込み済み。B / C の前文は触らず、from は設問文側の部分一致。
// 読点: この exam の出荷層は ASCII「, 」の題が多い (⑨、不変)。補う読点は同じ field / 同題の既存字種に揃え、
//       「、」だけの field は源の「，」にする (S129 裁定)。
//
// **D-165 (中問A `2011h23a-q089-copy`)**: 前文 (q089〜q092 の 4 題で byte 同一) を GROUP_A で**前文ブロックごと**置換する
//   (「、」→「，」、「」→ “”、図1 キャプションの AI 凡例「（■＝黒、□＝白）」を削除 (D-158))。jp の probe (先頭 40 字) が変わるので、
//   COPY 表の cut marker 付け替え (`data/ip/quiz/.phase2/b9_chumon_copy_patch.diff`) と registry 再生成を同じ lock 内で行う。
//   GROUP_A の 4 題 × 3 層は **n===0 の無言 skip を許さない** (S127 attempt_1 で A7 が落ちた原因の型)。
//   zh の「」(⑨-c) / 顿号はそのまま。zh / en は凡例と「问 89 」「Q89 」の除去だけ。
//
// 採用した差分 (evidence §6。源 crop / 源ページを原寸で独立実読して確認):
//   q012 stem  (p06) 読点「、」×3 → 源「，」
//   q014 ア    (p07) 「始点終点」→ 源「始点／終点」(読点は field の字種「, 」のまま)
//   q019 stem  (p08) 「ベルトコンベヤ」→ 源「ベルトコンベア」
//   q021 stem  (p09) 「電子商 取引」の空白、「BtoC」→ 源「B to C」(raw = 出荷層)
//   q030 イ / エ (p12) 「ab」「a c」→ 源「a，b」「a，c」(字種は同題ウ「a, b, c」の「, 」、**イは正解肢**)
//   q032 stem  (p13) 設問文の読点「、」×2 → 源「，」(図の言語化部分は不変)
//   q033 stem  (p13) 読点「、」→ 源「，」
//   q034 stem  (p14) 「。\n使用性」→ 源は行折返し (raw = 出荷層、zh / en 追随)
//   q036 ア    (p14) 「a,b」→「a, b」(同題の字種、**正解肢**)
//   q045 stem  (p17) 組織図を言い換えた AI 段落 (「位置 b は社長に直属する」を含む) を削除 (jp / zh / en、図の ASCII 描画と webp は残す)
//   q046 stem  (p18) 「。 可用性」の空白 (raw = 出荷層)
//   q051 エ    (p19) 「c,d」→「c, d」(同題の字種、**正解肢**)
//   q057 stem  (p21) 「」→ 源 “社員” “部署”
//   q080 stem  (p30) 源 “可用性” の引用符を補う
//   q081 stem  (p30) 「パスワードを定期的に」→ 源「パスワードは定期的に」
//   q084 stem  (p31) 記述 a / b / c を源どおり 3 行に (zh / en 追随)
//   q089〜q092 前文 (p33 / p34) GROUP_A (上記 D-165)。q089 は stem 途中の見出し「問 89 」(zh「问 89 」/ en「Q89 」) を除去し、
//              設問文の読点と引用符を源「29 文字目から 41 文字目が，“w,b,w,w,w,b,w”」に
//   q091 stem  (p35) 図3 の後の AI 付加文「回転前の画像を…流れ図は次のとおり。」を削除 (jp / zh / en)
//   q093 stem / 選択肢 (p38) 図の箱の「」と注記の AI 付加「（「□」）」を削除 (jp / zh)、選択肢 ①〜④ → 源 (1)〜(4) (jp / zh / en、**ウは正解肢**)、
//              解説の ①〜⑤ (メモ番号) も (1)〜(5) に
//   q094 stem  (p38) 〔条件〕(1) の余分な「1 」を削除 (en "One worker" → "A worker")
//   q096 stem  (p40) 表2 の結合セル「(2)」の複写を除去 (S113、jp / zh / en)
//   q098 stem  (p42) 設問文の読点「、」→ 源「，」
//   q100 stem  (p43) 設問文の読点「、」×6 → 源「，」、「販売促進策は、どれか」→ 源「販売促進策はどれか」
//
// Run: node scripts/quiz-fidfix-S129-b9.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S129-b9.mjs --apply
//      FIDFIX_STAGE=<dir> node scripts/quiz-fidfix-S129-b9.mjs   (dry-run の書込み予定ファイルを <dir>/<相対パス> に出す = registry 再生成の模擬用)
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2011h23a
//   → patch -p1 < data/ip/quiz/.phase2/b9_chumon_copy_patch.diff && node scripts/quiz-chumon-groups-build.mjs
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
// 全出現を置換する (q093 解説の ①〜⑤ 用)。件数を log に出し、0 件は skip。
function subAll(obj, key, from, to, where) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; return false; }
  obj[key] = s.split(from).join(to); applied++; log.push(`  ✓ ${where}: 「${from}」→「${to}」 ×${n}`); return true;
}

const FIX = {
  // ── 題幹 ────────────────────────────────────────────────────────────────────
  "2011h23a-q012": { jp: [["stem", "投資プロジェクト A〜D のうち、最も早く投資を回収できるものはどれか。ここで、毎年の維持管理費用として、初期投資", "投資プロジェクト A〜D のうち，最も早く投資を回収できるものはどれか。ここで，毎年の維持管理費用として，初期投資"]] },
  // q019: 源 p08 は「ベルトコンベア」。zh「传送带」/ en は可 → 不追随。
  "2011h23a-q019": { jp: [["stem", "ベルトコンベヤ方式", "ベルトコンベア方式"]] },
  // q021: clean 無し (raw = 出荷層)。「電子商 取引」は改行由来の空白 (R8b)、源は「B to C」。zh / en の BtoC は訳語として可 → 不追随。
  "2011h23a-q021": {
    jp: [
      ["stem", "電子商 取引の活用", "電子商取引の活用"],
      ["stem", "電子商取引のうち, BtoCに当たる", "電子商取引のうち, B to C に当たる"],
    ],
  },
  // q032: 設問文の読点のみ。「図: …」以下は図の言語化 (源に対応文なし) で不変 (B7 q021 / B8 q097 と同じ描画補助)。
  "2011h23a-q032": { jp: [["stem", "月別に集計したところ、図のようなグラフになった。このグラフにおける要因Aに該当する保守作業のうち、最も適切", "月別に集計したところ，図のようなグラフになった。このグラフにおける要因Aに該当する保守作業のうち，最も適切"]] },
  "2011h23a-q033": { jp: [["stem", "顧客検索を、次期システム", "顧客検索を，次期システム"]] },
  // q034: clean 無し (raw = 出荷層)。源 p14 の改行は行折返し。zh / en も同じ改行を持つので追随。
  "2011h23a-q034": {
    jp: [["stem", "などに分けられる。\n使用性に", "などに分けられる。使用性に"]],
    zh: [["stem", "可移植性等。\n属于易用性", "可移植性等。属于易用性"]],
    en: [["stem", "and so on.\nWhich of the following", "and so on. Which of the following"]],
  },
  // q045: 源 p17 は設問文 + 組織図のみ。clean の説明段落は図を言い換えた AI 付加で、「位置 b は社長に直属する」は正解イ (b) の根拠を先取りする。
  //   図の事実は直後の ASCII 描画と添付 webp が担う → 段落だけ削除 (B7 q080 / D-163 (1))。correct_answer=イ は図から再導出一致。
  "2011h23a-q045": {
    jp: [["stem", "次の組織図において, 「社長」の上位に位置 a がある。位置 b は社長に直属する。社長の下に「経理部」「営業部」「情報システム部」の三つの部があり, 位置 c は経理部の中に, 位置 d は情報システム部の中にある。\n\n", ""]],
    zh: [["stem", "在下面的组织结构图中，位置 a 位于「社长」之上。位置 b 直接隶属于社长。社长之下设有「会计部」「营业部」「信息系统部」三个部门，位置 c 位于会计部内，位置 d 位于信息系统部内。\n\n", ""]],
    en: [["stem", "In the following organizational chart, position a is above the President (社長). Position b reports directly to the President. Below the President there are three departments: Accounting Department (経理部), Sales Department (営業部), and Information Systems Department (情報システム部). Position c is inside the Accounting Department, and position d is inside the Information Systems Department.\n\n", ""]],
  },
  // q046: clean 無し (raw = 出荷層)。改行由来の空白。
  "2011h23a-q046": { jp: [["stem", "分けられる。 可用性に", "分けられる。可用性に"]] },
  // q057: 源は “社員” “部署”。zh「」は ⑨-c、en «» は ⑨ (記録のみ)。raw の ASCII " は非出荷 (B7 規則で resolved)。
  //   選択肢は源では図 (choice_figures 未整備)。表示の意味ラベル「（1対1）」等は 4 肢対称でも、この題が問う「記法を読んで多重度を判定する」
  //   推論を文字で代替する → 3 層 × 4 肢から削除 (S129 主 context 裁定 D-161、D-163 (1) の趣旨)。表下の下線説明の括弧書きは描画補助で不変。
  "2011h23a-q057": {
    jp: [
      ["stem", "「社員」表と「部署」表の関係", "“社員”表と“部署”表の関係"],
      ["ア", "社員―部署（1対1）", "社員―部署"], ["イ", "社員→部署（1対多）", "社員→部署"], ["ウ", "社員←部署（多対1）", "社員←部署"], ["エ", "社員←→部署（多対多）", "社員←→部署"],
    ],
    zh: [["ア", "员工―部门（1 对 1）", "员工―部门"], ["イ", "员工→部门（1 对多）", "员工→部门"], ["ウ", "员工←部门（多对 1）", "员工←部门"], ["エ", "员工←→部门（多对多）", "员工←→部门"]],
    en: [["ア", "Employee — Department (1-to-1)", "Employee — Department"], ["イ", "Employee → Department (1-to-many)", "Employee → Department"], ["ウ", "Employee ← Department (many-to-1)", "Employee ← Department"], ["エ", "Employee ←→ Department (many-to-many)", "Employee ←→ Department"]],
  },
  // q080: 源は “可用性”。raw の「可用性" 」は非出荷 (clean が出荷層)。zh / en は不追随 (D-151 / D-156)。
  "2011h23a-q080": { jp: [["stem", "情報セキュリティにおける可用性の説明", "情報セキュリティにおける“可用性”の説明"]] },
  // q081: 源 p30 記述 c は「パスワードは」。clean は raw の OCR「パスワードはに」から「を」と誤って再構成。zh / en は可 → 不追随。
  "2011h23a-q081": { jp: [["stem", "c パスワードを定期的に変更する", "c パスワードは定期的に変更する"]] },
  // q084: 源 p31 は記述 a / b / c が 3 行。zh / en も 1 行に連結されている → 追随。
  "2011h23a-q084": {
    jp: [["stem", "a 共通鍵暗号方式の共通鍵 b 公開鍵暗号方式の公開鍵 c 公開鍵暗号方式の秘密鍵", "a 共通鍵暗号方式の共通鍵\nb 公開鍵暗号方式の公開鍵\nc 公開鍵暗号方式の秘密鍵"]],
    zh: [["stem", "a 共享密钥加密方式的共享密钥　b 公开密钥加密方式的公开密钥　c 公开密钥加密方式的私钥", "a 共享密钥加密方式的共享密钥\nb 公开密钥加密方式的公开密钥\nc 公开密钥加密方式的私钥"]],
    en: [["stem", "a The shared key in symmetric-key cryptography  b The public key in public-key cryptography  c The private key in public-key cryptography", "a The shared key in symmetric-key cryptography\nb The public key in public-key cryptography\nc The private key in public-key cryptography"]],
  },
  // q091: 源 p35 は設問文・図3 (回転前後の画像 + 流れ図)・選択肢のみ。図3 キャプション後の説明文は AI 付加 → 削除 (jp / zh / en)。
  "2011h23a-q091": {
    jp: [["stem", "回転前の画像を右に90度回転すると回転後の画像になる。流れ図は次のとおり。\n\n", ""]],
    zh: [["stem", "将旋转前的图像向右旋转90度后即得到旋转后的图像。流程图如下。\n\n", ""]],
    en: [["stem", "Rotating the image before rotation 90 degrees to the right yields the image after rotation. The flow diagram is as follows.\n\n", ""]],
  },
  // q093: 源 p38 の図は網掛けの箱 4 つと a の枠箱。表示の「」は源に無い。注記の「（「□」）」は AI 付加。a の枠は同 exam q091 の [ a ] 表記に揃える。
  //   en は [ box ] を図の語として本文・注記・解説で一貫して使っているので stem の行・注記は不変 (選択肢のみ)。
  "2011h23a-q093": {
    jp: [
      ["stem", "「□」 → 「 a 」 → 「□」 → 「□」 → (5)", "□ → [ a ] → □ → □ → (5)"],
      ["stem", "（注記）網掛けの部分（「□」）は，表示していない。", "（注記）網掛けの部分は，表示していない。"],
      ["ア", "①", "(1)"], ["イ", "②", "(2)"], ["ウ", "③", "(3)"], ["エ", "④", "(4)"],
    ],
    zh: [
      ["stem", "「□」 → 「 a 」 → 「□」 → 「□」 → (5)", "□ → [ a ] → □ → □ → (5)"],
      ["stem", "（注）带网格底纹的部分（「□」）未予显示。", "（注）带网格底纹的部分未予显示。"],
      ["ア", "①", "(1)"], ["イ", "②", "(2)"], ["ウ", "③", "(3)"], ["エ", "④", "(4)"],
    ],
    en: [["ア", "①", "(1)"], ["イ", "②", "(2)"], ["ウ", "③", "(3)"], ["エ", "④", "(4)"]],
  },
  // q094: 源 p38 〔条件〕(1)「作業者は1日当たり8ページ」。「1 」は raw「(1 作業者」の OCR 残渣。en "One worker" はその残渣の訳 → "A worker"。zh は可。
  "2011h23a-q094": {
    jp: [["stem", "(1) 1 作業者は 1 日当たり", "(1) 作業者は 1 日当たり"]],
    en: [["stem", "(1) One worker writes 8 pages per day.", "(1) A worker writes 8 pages per day."]],
  },
  // q096: 源 p40 表2 の「(2)」は 2 行にまたがる結合セル → 2 行目の複写を除去 (S113 / B6 q086 / B8 q004)。
  "2011h23a-q096": {
    jp: [["stem", "| (2) | X社のテスト報告書 | ③ |", "|  | X社のテスト報告書 | ③ |"]],
    zh: [["stem", "| (2) | X公司的测试报告书 | ③ |", "|  | X公司的测试报告书 | ③ |"]],
    en: [["stem", "| (2) | Company X's test report | ③ |", "|  | Company X's test report | ③ |"]],
  },
  "2011h23a-q098": { jp: [["stem", "インタビュー調査の進め方として、適切なもの", "インタビュー調査の進め方として，適切なもの"]] },
  // q100: 設問文 (前文の後) のみ。前文 (中問C) は源どおりの「，」で不変。
  "2011h23a-q100": { jp: [["stem", "A さんは、会員顧客を対象にした販促活動を行うことを検討している。そこで、表1 に示す四つの販売促進策を考え、それぞれの費用と効果の金額を見込んだ。効果に関しては、期待できる効果が大の場合、中の場合、小の場合に分け、それぞれの場合が発生する確率を 0.2、0.5、0.3 と推測した。この推測に従って実施すると予想利益が最大になる販売促進策は、どれか。ここで、予想利益", "A さんは，会員顧客を対象にした販促活動を行うことを検討している。そこで，表1 に示す四つの販売促進策を考え，それぞれの費用と効果の金額を見込んだ。効果に関しては，期待できる効果が大の場合，中の場合，小の場合に分け，それぞれの場合が発生する確率を 0.2，0.5，0.3 と推測した。この推測に従って実施すると予想利益が最大になる販売促進策はどれか。ここで，予想利益"]] },
  // ── 選択肢 ──────────────────────────────────────────────────────────────────
  // q014: 源「始点／終点」。／ は散文の区切りで演算子ではない (D-162 の対象外)。zh / en は可。
  "2011h23a-q014": { jp: [["ア", "作業の始点終点を丸印", "作業の始点／終点を丸印"]] },
  // q030 / q036 / q051: 区切りは同題の他肢「a, b, c」の字種「, 」に揃える (源は「，」)。zh / en は既に区切りあり。
  "2011h23a-q030": { jp: [["イ", "ab", "a, b"], ["エ", "a c", "a, c"]] },
  "2011h23a-q036": { jp: [["ア", "a,b", "a, b"]] },
  "2011h23a-q051": { jp: [["エ", "c,d", "c, d"]] },
};

// ── 中問A 前文 (D-165) ─────────────────────────────────────────────────────
// 4 題の前文 (stem 先頭〜〔画素データを圧縮する処理の概要〕(2) の圧縮結果) は 3 層とも 4 題で byte 同一であることを assert し、
// ブロックごと置換する。件数は現 data の実数 (jp: 、18 / 「 9 / 」9) を assert して、想定外の文字列に当たったら止める。
const GROUP_A = ["2011h23a-q089", "2011h23a-q090", "2011h23a-q091", "2011h23a-q092"];
const GA_END = "w2,b3,w3,b,w3,b,w2,b,w3,b,w2,b,w3,b,w2,b,w3,b,w2,b,w3,b,w3,b3,w2";
const count = (s, c) => s.split(c).length - 1;
const GA_FIX = {
  jp: (b) => {
    if (count(b, "、") !== 18 || count(b, "「") !== 9 || count(b, "」") !== 9 || count(b, "（■＝黒、□＝白）") !== 1) throw new Error("GROUP_A jp: 前文の字数が想定と異なる — abort");
    return b.replace("（■＝黒、□＝白）", "").replaceAll("、", "，").replaceAll("「", "“").replaceAll("」", "”");
  },
  zh: (b) => { if (count(b, "（■＝黑，□＝白）") !== 1) throw new Error("GROUP_A zh: 凡例が想定と異なる — abort"); return b.replace("（■＝黑，□＝白）", ""); },
  en: (b) => { if (count(b, " (■ = black, □ = white)") !== 1) throw new Error("GROUP_A en: 凡例が想定と異なる — abort"); return b.replace(" (■ = black, □ = white)", ""); },
};
// q089 の設問文 (前文の直後)。見出し「問 89 」の除去 + 源の読点・引用符。
const GA_Q089 = {
  jp: ["\n\n問 89 画素データを圧縮せずに出力した場合、29 文字目から 41 文字目が「w,b,w,w,w,b,w」になる", "\n\n画素データを圧縮せずに出力した場合，29 文字目から 41 文字目が，“w,b,w,w,w,b,w”になる"],
  zh: ["\n\n问 89 在不压缩像素数据直接输出的情况下", "\n\n在不压缩像素数据直接输出的情况下"],
  en: ["\n\nQ89 When the pixel data is output without compression", "\n\nWhen the pixel data is output without compression"],
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  q093: 選択肢を源の (1)〜(4) にしたので、解説のメモ番号 ①〜⑤ (メモ項目の参照のみ。他の用途なし) を (1)〜(5) に揃える。
//        先に「ウ（③）」型の書き出しを入れ子括弧にならない形にしてから全置換する。
const CIRCLED = [["①", "(1)"], ["②", "(2)"], ["③", "(3)"], ["④", "(4)"], ["⑤", "(5)"]];
//  q019: correct_jp が題幹を「設問の「ベルトコンベヤ…」」と引用している → 題幹に合わせる (PHASE 2 の残存語走査で検出)。zh / en は訳語で不変。
const EXPL = {
  "2011h23a-q019": { correct: { jp: ["設問の「ベルトコンベヤによる分業型", "設問の「ベルトコンベアによる分業型"] } },
  "2011h23a-q093": {
    correct: {
      jp: ["正解は「ウ（③）」です。", "正解は「ウ」(3) です。"],
      zh: ["正确答案是「ウ（③）」。", "正确答案是「ウ」(3)。"],
      en: ["The correct answer is ウ (③).", "The correct answer is ウ, (3)."],
    },
    all: CIRCLED,
  },
};

const MARK = "fidfix-S129-b9";
const pg = (id) => { const b = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8")).questions.find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 語義是正 + 正解肢命中 + note が腐敗 / 是正対象の字句を述べている題。
//   語義: q045 q081 q089 q091 / 正解肢命中: q030 (イ) q036 (ア) q051 (エ) q093 (ウ)
//   note 言及: q012 (「、」の clean を引用) q019 (「ベルトコンベヤ」を引用) q021 (「BtoC」) q030 (イ「ab」/ エ「a c」) q036 (ア「a,b」)
//              q051 (「エ c,d」) q080 (引用符を OCR ノイズとして除去済みと記述) q081 (「パスワードを」を是正済みと記述)
//              q093 (①〜⑤) q098 / q100 (「、」の clean を引用)
//   追記しない: q014 q032 q033 q034 q046 q057 q084 q090 q092 q094 q096 (字種・体裁のみで note に言及なし)
const NOTE_APPEND = {
  "2011h23a-q012": (p) => `（S129 B9: ${p} 実読で clean の読点「、」×3 を源の「，」に是正（上記の引用は是正前の字種）。2 年目で回収できるのは C = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2011h23a-q019": (p) => `（S129 B9: ${p} 実読で 題幹の「ベルトコンベヤ」を源の「ベルトコンベア」に是正（上記の引用は是正前の表記）。全工程を一人・少人数で担当 = セル生産方式 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2011h23a-q021": (p) => `（S129 B9: ${p} 実読で 題幹の「BtoC」を源の「B to C」に、「電子商 取引」の空白を除去。企業から一般消費者への取引 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2011h23a-q030": (p) => `（S129 B9: ${p} 実読で 選択肢イ「ab」/ エ「a c」を源の区切りどおり「a, b」/「a, c」に是正済み（上記の不統一の記述は是正前）。イは**正解肢**だが区切りのみの変更で、請負人の義務 = a, b = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2011h23a-q036": (p) => `（S129 B9: ${p} 実読で 選択肢ア「a,b」を同題の字種どおり「a, b」に是正（上記の引用は是正前）。アは**正解肢**だが区切りのみの変更で、適切なのは a, b = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2011h23a-q045": (p) => `（S129 B9: ${p} 実読で 源に無い組織図の説明段落（「位置 b は社長に直属する」等、jp / zh / en）を削除。図（ASCII 描画・webp）は不変。被監査部門から独立し社長直属の b = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2011h23a-q051": (p) => `（S129 B9: ${p} 実読で 選択肢エ「c,d」を同題の字種どおり「c, d」に是正（上記の引用は是正前）。エは**正解肢**だが区切りのみの変更で、進捗管理 = c, d = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2011h23a-q057": (p) => `（S129 B9: ${p} 実読で 源では図の選択肢に付いた意味ラベル「（1対1）」「（1対多）」「（多対1）」「（多対多）」（源に無い、jp / zh / en）を削除（記法を読む推論の先取りのため、S129 主 context 裁定）。題幹の引用符も源の “” に。1 人 1 部署・1 部署に複数社員 = 社員:部署 = 多対1 = 〔表記法〕の [a]◀——[b] = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2011h23a-q080": (p) => `（S129 B9: ${p} 実読で 源は “可用性” と引用符付きのため clean に “” を補った（上記の「除去済み」は raw の ASCII 引用符の崩れについての記述）。認められた利用者が必要なときにアクセスできる = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2011h23a-q081": (p) => `（S129 B9: ${p} 実読で clean の記述 c「パスワードを定期的に」を源の「パスワードは定期的に」に是正（上記の「パスワードを」で是正済みとの記述は源と異なる再構成）。適切なのは b, c, d = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2011h23a-q089": (p) => `（S129 B9 / D-165: ${p} 実読で stem 途中の見出し「問 89 」（zh「问 89 」/ en「Q89 」）を除去し、設問文を源の「29 文字目から 41 文字目が，“w,b,w,w,w,b,w”」に、前文の「、」「」を源の「，」“” に是正、図1 の凡例（源に無い）を削除。中問組 2011h23a-q089-copy の cut marker と registry も同時に更新。画素 15〜21 = 3 行目 □■□□□■□ = 9 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2011h23a-q091": (p) => `（S129 B9: ${p} 実読で 図3 の後の源に無い説明文（jp / zh / en）を削除し、前文を中問組どおり是正。(i, j) → (j, 8−i) = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2011h23a-q093": (p) => `（S129 B9: ${p} 実読で 選択肢 ①〜④ を源の (1)〜(4) に（zh / en も）、図の箱の「」と注記の「（「□」）」（源に無い）を削除。上記の ①〜⑤ はメモの (1)〜(5) を指す（解説も (1)〜(5) に揃えた）。ウは**正解肢**だが記法のみの変更で、(1) → (3) → (2) → (4) → (5) の 2 番目 = (3) = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2011h23a-q098": (p) => `（S129 B9: ${p} 実読で clean 設問文の読点「、」を源の「，」に是正（上記の引用は是正前の字種）。correct_answer=ウ は不変 — ${MARK}）`,
  "2011h23a-q100": (p) => `（S129 B9: ${p} 実読で clean 設問文の読点「、」×6 を源の「，」に、「販売促進策は、どれか」を源の「販売促進策はどれか」に是正（上記の引用は是正前の字種）。期待値 − 費用が最大 = 電子メール 4.5 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
};
// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set([...Object.keys(FIX), ...GROUP_A].map((id) => id.split("-q")[0]))];
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

// 中問A (D-165): sidecar の表示 3 層のみ (raw / .phase1 は前文を持たない)。無言 skip 禁止 = 当たらなければ throw。
{
  const tq = TR["2011h23a"].questions;
  const get = (id, L) => (L === "jp" ? tq[id].stem_jp_clean : tq[id].stem[L]);
  const put = (id, L, v) => { if (L === "jp") tq[id].stem_jp_clean = v; else tq[id].stem[L] = v; };
  for (const L of ["jp", "zh", "en"]) {
    const blocks = GROUP_A.map((id) => { const s = get(id, L); const i = s.indexOf(GA_END); return i < 0 ? null : s.slice(0, i + GA_END.length); });
    if (blocks.some((x) => x === null)) throw new Error(`GROUP_A ${L}: 前文の終端が見つからない member がある — abort`);
    if (!blocks.every((x) => x === blocks[0])) throw new Error(`GROUP_A ${L}: 4 題の前文が byte 同一でない — abort`);
    // 冪等: 凡例が無く (jp は「、」「」も無く) なっていれば適用済み → skip。
    if (!/（■|\(■/.test(blocks[0]) && (L !== "jp" || !/[、「」]/.test(blocks[0]))) { skipped += GROUP_A.length; continue; }
    const next = GA_FIX[L](blocks[0]);
    for (const id of GROUP_A) {
      const s = get(id, L);
      put(id, L, next + s.slice(blocks[0].length)); applied++;
      log.push(`  ✓ ${id} translations.${L === "jp" ? "stem_jp_clean" : `stem.${L}`}: 中問A 前文ブロック (${blocks[0].length} → ${next.length} 字)`);
    }
  }
  for (const L of ["jp", "zh", "en"]) {
    const [from, to] = GA_Q089[L]; const s = get("2011h23a-q089", L);
    if (s.includes(to) && !s.includes(from)) { skipped++; continue; }
    if (count(s, from) !== 1) throw new Error(`GROUP_A q089 ${L}: 設問文の from が 1 回でない — abort`);
    put("2011h23a-q089", L, s.replace(from, to)); applied++;
    log.push(`  ✓ 2011h23a-q089 translations.${L === "jp" ? "stem_jp_clean" : `stem.${L}`}: 「${from.trim().slice(0, 40)}」→「${to.trim().slice(0, 40)}」`);
  }
  // 是正後の不変式: jp 前文に「、」「」が残らない / 3 層とも凡例・見出しが無い / 4 題の前文が byte 同一。
  for (const L of ["jp", "zh", "en"]) {
    const heads = GROUP_A.map((id) => get(id, L).slice(0, get(id, L).indexOf(GA_END)));
    if (!heads.every((h) => h === heads[0])) throw new Error(`GROUP_A ${L}: 是正後の前文が 4 題で一致しない — abort`);
    if (/（■|\(■/.test(heads[0])) throw new Error(`GROUP_A ${L}: 凡例が残っている — abort`);
    if (L === "jp" && /[、「」]/.test(heads[0])) throw new Error("GROUP_A jp: 前文に「、」/「」が残っている — abort");
    if (/(問|问) 89 |Q89 /.test(get("2011h23a-q089", L))) throw new Error(`GROUP_A ${L}: q089 に見出しが残っている — abort`);
  }
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
  if (ex.correct?.jp) sub(j, "correct_jp", ex.correct.jp[0], ex.correct.jp[1], `${id} expl_jp.correct`);
  if (ex.correct?.zh) sub(tr.correct, "zh", ex.correct.zh[0], ex.correct.zh[1], `${id} expl_tr.correct.zh`);
  if (ex.correct?.en) sub(tr.correct, "en", ex.correct.en[0], ex.correct.en[1], `${id} expl_tr.correct.en`);
  for (const [from, to] of ex.all ?? []) {
    subAll(j, "correct_jp", from, to, `${id} expl_jp.correct`);
    for (const d of j.distractors_jp) subAll(d, "why_wrong_jp", from, to, `${id} expl_jp.${d.letter}`);
    j.points_jp.forEach((_, i) => subAll(j.points_jp, i, from, to, `${id} expl_jp.points[${i}]`));
    for (const L of ["zh", "en"]) {
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S129-b9: applied ${applied}, skipped ${skipped}`);
