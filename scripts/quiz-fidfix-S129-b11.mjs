#!/usr/bin/env node
// Stage 6 / Quiz — S129 B track **B11** (2010h22a、100 問 / Sonnet 5 単 pass、D-150 §3) の差分を是正する。
// 源: S129 の workflow `wf_89b7bdcd-c23`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b11_2010h22a_sn.json
//     マニフェスト = data/ip/quiz/.phase2/b11_fidelity_input_2010h22a.json (precrop 74/100、q062 / q063 は page-24 に patch 済みの版)
//     機械 diff (S128 L1a 改修版) = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 462 / AGENT_MISSED 26 / QUOTE_ASCII 4 (q079) / TRANSCRIPT_PREFIX 0 / VERDICT_CONFLICT 0
//                 実残差 = q018 (表の「ならば，」の読点)、q061 (式の演算子 − ＋ ／)。
//                 q015 / q065 (選択肢表の一行化)・q023 / q048 / q072 (図の言語化)・中問前文 (q091 / q092 / q094) は不変。
//
// 層・方針は quiz-fidfix-S122-u3a 〜 S129-b9 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2010h22a の sidecar のキーは `stem` / `choices` / `stem_jp_clean`。`choices_jp_clean` は無い → 選択肢は raw 3 層が出荷層。
// 中問 3 組 (mqA / mqB / mqC) は抽出組で前文埋め込み済み。registry の probe (先頭 40 字) に掛かる是正は無い。
// 読点: 補う読点は同じ field の既存字種に揃え、「、」だけの field は源の「，」にする (S129 裁定)。
//
// 採用した差分 (evidence §6。源 crop / 源ページを原寸で独立実読して確認):
//   q003 stem  (p03) 「オフショアウトソーシング」→ 源「オフショアアウトソーシング」(B4 q004 と同型)、読点「、」→「，」。解説の 2 箇所も追随
//   q010 イ    (p06) 「派遣先A社」→「派遣先A 社」(源・同題他肢の「A 社」「B 社」に揃える)
//   q016 stem  (p08) 「」→ 源 “財務”，“内部ビジネスプロセス”及び“学習と成長”(区切りは field の字種「,」)
//   q018 stem  (p08) 表の評価基準セル: 源「…ならば，110 点」の読点を補う (machdiff 実残差)
//   q021 stem  (p09) 「」→ 源 “営業活動”，“投資活動”，“財務活動”(区切りは field の字種「,」)
//   q031 ア〜エ (p13) 選択肢表の断片 (見出し行・記号の混入) → 見出し付きの 1 行表「[表]\n| 業務プロセスモデル | データモデル |…」(**アは正解肢**)
//   q033 ウ / エ (p14) 「。 」の空白
//   q061 stem  (p23) 全角数字「３けた」等 → 源「3 けた」、読点「、」×5 → 源「，」。選択肢ア〜エ (jp / zh / en) の演算子 − ＋ ／ → ASCII (D-162、**ウは正解肢**)、
//              区切りの「，」は原典どおり。解説の式・計算の演算子も追随 (列挙の「0／9／8／3」は区切りで不変)
//   q062 / q063 bank page pointer page-23 → 源 page-24 (question_bank / by_year の source.page_image / page_number)
//   q066 ア〜エ (p25) 選択肢の図の言語化 (辺の書き下し + 末尾判定「…不正解図。」「…正解図。」= 答え漏洩) →「図ア」〜「図エ」(jp / zh / en、D-163 / B10 q088 裁定、**エは正解肢**)
//   q069 stem  (p27) 「いくら」→ 源「幾ら」
//   q078 ア    (p30) 「ab」→ 源「a，b」(字種は同題他肢「a, b, d」の「, 」)
//   q079 stem / ア〜エ (p30) 「」/ ASCII " → 源 “”(選択肢は「→ 」の空白も源どおり、**イは正解肢**)。解説 correct の選択肢引用も追随
//   q084 / q087 stem (p32 / p34) 「」→ 源 “”
//   q085 stem  (p33) 「」→ 源 “”、読点「、」×8 → 源「，」
//   q086 stem  (p33) 「また、」→ 源「また，」
//   q089〜q092 前文 (p35 / p36) 「欄「予想出力」」→ 源 “予想出力”(jp)。表2 の「予想出力」行に置かれた b / c (源では表外の矢印で列 5 / 列 6 を指す) を
//              表下の矢印行に移す (jp / zh / en)。a (列 3、予想出力の空欄) は不変
//   q094 stem  (p40) 設問文末の「ここで，表は…“×” で示す。」(前文の文の複写、源の問94 に無い) を削除 (jp / zh / en)
//   q095 stem  (p41) 設問文・図1 の読点「、」×15 → 源「，」、「課長」→ 源 “課長”
//
// Run: node scripts/quiz-fidfix-S129-b11.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S129-b11.mjs --apply
//      FIDFIX_STAGE=<dir> node scripts/quiz-fidfix-S129-b11.mjs   (dry-run の書込み予定ファイルを <dir>/<相対パス> に出す)
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2010h22a
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
// 全出現を置換する。expect を渡すと件数を assert する (想定外の出現に当たったら止める)。0 件は skip (適用済み)。
function subAll(obj, key, from, to, where, expect) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; return false; }
  if (expect !== undefined && n !== expect) throw new Error(`${where}: 「${from}」 が ${n}× (想定 ${expect}×) — abort`);
  obj[key] = s.split(from).join(to); applied++; log.push(`  ✓ ${where}: 「${from}」→「${to}」 ×${n}`); return true;
}

const FIX = {
  // ── 題幹 ────────────────────────────────────────────────────────────────────
  // q003: 源 p03「オフショアアウトソーシング」(ア 1 字脱落、B4 q004 と同型)。「、」だけの field → 源「，」。zh / en は訳語で可。
  "2010h22a-q003": { jp: [["stem", "オフショアウトソーシングの事例として、適切な", "オフショアアウトソーシングの事例として，適切な"]] },
  // q016 / q021: 源は “” と語間の「，」。field の既存読点は ASCII「,」なので補う区切りもそれに揃える。zh「」は ⑨-c、en は不追随 (D-151 / D-156)。
  "2010h22a-q016": { jp: [["stem", "ものは,「財務」「内部ビジネスプロセス」及び「学習と成長」と", "ものは,“財務”,“内部ビジネスプロセス”及び“学習と成長”と"]] },
  // q018: 源 p08 の評価基準セルは行ごとに「2%以上ならば，110 点」。表示は行区切りを「，」にして行内の「，」を落としていた → 行内の読点を補う。zh / en は訳文で可。
  "2010h22a-q018": {
    jp: [
      ["stem", "2%以上ならば110点，1%以上2%未満ならば100点，0%を超え1%未満ならば90点，", "2%以上ならば，110点，1%以上2%未満ならば，100点，0%を超え1%未満ならば，90点，"],
      ["stem", "2件以上ならば110点，1件ならば100点，", "2件以上ならば，110点，1件ならば，100点，"],
      ["stem", "1ランク以上向上すれば100点，", "1ランク以上向上すれば，100点，"],
    ],
  },
  "2010h22a-q021": { jp: [["stem", "うち,「営業活動」「投資活動」「財務活動」の", "うち,“営業活動”,“投資活動”,“財務活動”の"]] },
  // q061: 源 p23「3 けた」「1 けた」「2 けた」「1 の位」、読点「，」。raw も同じ腐敗を持つが文面が異なる (非出荷) → clean のみ (下の ALL)。
  "2010h22a-q061": {
    jp: [
      ["ア", "10−整数部(A2／100)＋剰余(整数部(A2／10)，10)", "10-整数部(A2/100)+剰余(整数部(A2/10)，10)"],
      ["イ", "剰余(10−整数部(A2／100)＋整数部(A2／10)，10)", "剰余(10-整数部(A2/100)+整数部(A2/10)，10)"],
      ["ウ", "剰余(整数部(A2／100)＋剰余(整数部(A2／10)，10)，10)", "剰余(整数部(A2/100)+剰余(整数部(A2/10)，10)，10)"],
      ["エ", "整数部((整数部(A2／100)＋整数部(A2／10))／10)", "整数部((整数部(A2/100)+整数部(A2/10))/10)"],
    ],
    zh: [
      ["ア", "10−取整(A2/100)＋取余(", "10-取整(A2/100)+取余("],
      ["イ", "取余(10−取整(A2/100)＋取整(", "取余(10-取整(A2/100)+取整("],
      ["ウ", "取整(A2/100)＋取余(", "取整(A2/100)+取余("],
      ["エ", "取整(A2/100)＋取整(", "取整(A2/100)+取整("],
    ],
    en: [["ア", "10 − INT(", "10 - INT("], ["イ", "MOD(10 − INT(", "MOD(10 - INT("]],
  },
  // q069: 源 p27「幾らになるか」。zh / en は可。
  "2010h22a-q069": { jp: [["stem", "x の値はいくらになるか。", "x の値は幾らになるか。"]] },
  // q079: 源 p30 は “業者”表 等 (stem・選択肢)。選択肢は ASCII " を “” に、「→」の後の空白も源どおり。
  //   表の下線説明の括弧書きは源の下線の事実記述 (描画補助、B9 q057) で不変。zh / en は不追随 (D-151 / D-156、⑨)。
  "2010h22a-q079": {
    jp: [
      ["stem", "管理された「業者」表，「仕入明細」表及び「商品」表がある。", "管理された“業者”表，“仕入明細”表及び“商品”表がある。"],
      ["ア", "\"業者\"表 →\"仕入明細\"表 →\"商品\"表", "“業者”表 → “仕入明細”表 → “商品”表"],
      ["イ", "\"業者\"表 →\"商品\"表 →\"仕入明細\"表", "“業者”表 → “商品”表 → “仕入明細”表"],
      ["ウ", "\"仕入明細\"表 →\"商品\"表 →\"業者\"表", "“仕入明細”表 → “商品”表 → “業者”表"],
      ["エ", "\"商品\"表 →\"業者\"表 →\"仕入明細\"表", "“商品”表 → “業者”表 → “仕入明細”表"],
    ],
  },
  "2010h22a-q084": { jp: [["stem", "管理している「商品」表及び「売上」表を", "管理している“商品”表及び“売上”表を"]] },
  "2010h22a-q085": {
    jp: [["stem",
      "図1の場合、3×3個の画素を左上から1行ずつ右方向へ1画素ずつ読み取り、黒なら B、白なら W と書くと「BWBBBBBWB」(9文字)となる。次に、B や W が n 文字連続する場合を「Bn」、「Wn」と表す(n は2以上の整数)と、図1は「BWB5WB」(6文字)と表現でき、このときの圧縮率を 6/9=66.7% であると定義する。図2の5×5の図形について同じ手法で表現すると、圧縮率",
      "図1の場合，3×3個の画素を左上から1行ずつ右方向へ1画素ずつ読み取り，黒なら B，白なら W と書くと“BWBBBBBWB”(9文字)となる。次に，B や W が n 文字連続する場合を“Bn”，“Wn”と表す(n は2以上の整数)と，図1は“BWB5WB”(6文字)と表現でき，このときの圧縮率を 6/9=66.7% であると定義する。図2の5×5の図形について同じ手法で表現すると，圧縮率"]],
  },
  // q086: 「処理依頼」「処理される」は源どおり (S98 failure、不触)。読点のみ。
  "2010h22a-q086": { jp: [["stem", "という。また、システム", "という。また，システム"]] },
  // q087: 源 p34 は “部署”表 等。下線説明の括弧書き (選択肢の下線を含む) は源の下線の事実記述 (描画補助) で不変。
  "2010h22a-q087": { jp: [["stem", "「部署」表，「都道府県」表及び「社員」表を結合して，A 表を作成した。結合した「社員」表はどれか。", "“部署”表，“都道府県”表及び“社員”表を結合して，A 表を作成した。結合した“社員”表はどれか。"]] },
  // q094: 源 p40 の問94 は「…最低何行必要か。」で終わる。後続の「ここで，表は…で示す。」は前文 (p38) の文の複写 → 削除 (jp / zh / en)。
  "2010h22a-q094": {
    jp: [["stem", "最低何行必要か。ここで，表は施設に対して入室を許可する対象区分を “○”，入室を許可しない対象区分を “×” で示す。", "最低何行必要か。"]],
    zh: [["stem", "最少需要多少行？此处，表中以 “○” 表示允许进入设施的对象类别，以 “×” 表示不允许进入的对象类别。", "最少需要多少行？"]],
    en: [["stem", "including the line that describes Format 1? Here, the table indicates with “○” the person categories permitted to enter a facility, and with “×” the person categories not permitted to enter.", "including the line that describes Format 1?"]],
  },
  // ── 選択肢 ──────────────────────────────────────────────────────────────────
  // q010: 源は 4 肢とも「A 社」「B 社」。イだけ空白が無い → 同題他肢に揃える。zh / en は可。
  "2010h22a-q010": { jp: [["イ", "派遣先A社の業務責任者", "派遣先A 社の業務責任者"]] },
  // q031: 源 p13 は 2 列の選択肢表 (業務プロセスモデル / データモデル)。表示はア に見出し行と記号、イ〜エ に記号が混入 → 見出し付きの 1 行表
//   (同 exam q093 の選択肢表の形。quizRichText.parseChoice が table として描画することを確認済み)。zh / en は既に「列：値」形の散文で可。
  "2010h22a-q031": {
    jp: [
      ["ア", "[表] | | 業務プロセスモデル | データモデル | | ア | DFD | E-R 図 |", "[表]\n| 業務プロセスモデル | データモデル |\n|---|---|\n| DFD | E-R 図 |"],
      ["イ", "[表] | イ | DFD | PERT |", "[表]\n| 業務プロセスモデル | データモデル |\n|---|---|\n| DFD | PERT |"],
      ["ウ", "[表] | ウ | E-R 図 | DFD |", "[表]\n| 業務プロセスモデル | データモデル |\n|---|---|\n| E-R 図 | DFD |"],
      ["エ", "[表] | エ | E-R 図 | PERT |", "[表]\n| 業務プロセスモデル | データモデル |\n|---|---|\n| E-R 図 | PERT |"],
    ],
  },
  "2010h22a-q033": { jp: [["ウ", "ダウンした。 故障した", "ダウンした。故障した"], ["エ", "ダウンした。 原因を", "ダウンした。原因を"]] },
  // q066 (D-163 (1)、B10 q088 の主 context 裁定と同じ処置): 選択肢は源では図 4 枚 (choice_figures 未整備)。表示は辺の集合 {A→B, …} を書き下し、
  //   末尾に判定文「…不正解図。」「…正解図。」まで付いていた (答え漏洩)。辺の書き下し自体も「(X, Y) を矢印 X→Y として図から読む」という
  //   この題の技能を文字列照合で迂回させる → corpus 規約の「図ア」〜「図エ」に置換 (zh「图ア」/ en "Figure ア")。
  //   添付図 (quiz-figures/2010h22a-q066.webp) に 4 肢がア〜エのラベル付きで載っていることを確認済み。解説は図から読んだ矢印を述べており選択肢を引用していない → 不変。
  "2010h22a-q066": {
    jp: [
      ["ア", "有向グラフ {A→B, C→A, D→B}(A左上・B右上・C左下・D中央下)。C→A と D→B が向きを誤った不正解図。", "図ア"],
      ["イ", "有向グラフ {A→B, A→C, D→B}(A左上・B右上・C左下・D中央下)。D→B が (B,D) の向きを逆にした不正解図。", "図イ"],
      ["ウ", "有向グラフ {B→A, A→C, B→D}(A左上・B右上・C左下・D右中央下)。B→A が (A,B) の向きを逆にした不正解図。", "図ウ"],
      ["エ", "有向グラフ {A→B, A→C, B→D}(A左上・B右上・C左下・D右中央下)。3組の順序関係(A,B)(A,C)(B,D)を正しく示す正解図。", "図エ"],
    ],
    zh: [
      ["ア", "有向图 {A→B, C→A, D→B}（A 左上、B 右上、C 左下、D 中下）。C→A 与 D→B 方向画错的错误图。", "图ア"],
      ["イ", "有向图 {A→B, A→C, D→B}（A 左上、B 右上、C 左下、D 中下）。D→B 把 (B, D) 的方向画反的错误图。", "图イ"],
      ["ウ", "有向图 {B→A, A→C, B→D}（A 左上、B 右上、C 左下、D 右中下）。B→A 把 (A, B) 的方向画反的错误图。", "图ウ"],
      ["エ", "有向图 {A→B, A→C, B→D}（A 左上、B 右上、C 左下、D 右中下）。正确表示三组顺序关系 (A, B)、(A, C)、(B, D) 的正解图。", "图エ"],
    ],
    en: [
      ["ア", "Directed graph {A→B, C→A, D→B} (A top-left, B top-right, C bottom-left, D bottom-center). Incorrect figure: C→A and D→B have the wrong direction.", "Figure ア"],
      ["イ", "Directed graph {A→B, A→C, D→B} (A top-left, B top-right, C bottom-left, D bottom-center). Incorrect figure: D→B reverses the direction of (B, D).", "Figure イ"],
      ["ウ", "Directed graph {B→A, A→C, B→D} (A top-left, B top-right, C bottom-left, D center-right). Incorrect figure: B→A reverses the direction of (A, B).", "Figure ウ"],
      ["エ", "Directed graph {A→B, A→C, B→D} (A top-left, B top-right, C bottom-left, D center-right). Correct figure showing the three ordered pairs (A, B), (A, C), (B, D).", "Figure エ"],
    ],
  },
  // q078: 源 p30「a，b」。字種は同題他肢「a, b, d」の「, 」。zh / en は可。
  "2010h22a-q078": { jp: [["ア", "ab", "a, b"]] },
};

// 表示層 (stem_jp_clean) だけに当てる全出現置換。件数を assert する。
const ALL = {
  // q061: raw も全角数字・「、」を持つが文面が clean と異なる非出荷層 (N5)。
  "2010h22a-q061": [["、", "，", 5], ["は３けた", "は 3 けた", 1], ["の１けた", "の 1 けた", 1], ["位２けた", "位 2 けた", 1], ["の１の位", "の 1 の位", 1]],
  // q095: 前文 (中問B) に「、」「」は無い (assert)。「、」は設問文 11 + 図1 の対象区分セル 4。
  "2010h22a-q095": [["、", "，", 15], ["「課長」", "“課長”", 2]],
};

// ── 中問A 前文 (q089〜q092、4 題 × 3 層で同一) ─────────────────────────────
// jp の「欄「予想出力」」と、表2「予想出力」行の b / c (源では表外の矢印) を矢印行へ。無言 skip を許さない (当たらなければ throw)。
const GROUP_A = ["2010h22a-q089", "2010h22a-q090", "2010h22a-q091", "2010h22a-q092"];
const GA_ROW = {
  jp: ["| 予想出力（円） | | | | a | | b | c | … | |\n", "| 予想出力（円） | | | | a | | | | … | |\n| | | | | | | ↑ b | ↑ c | | |\n"],
  zh: ["| 预期输出（日元） | | | | a | | b | c | … | |\n", "| 预期输出（日元） | | | | a | | | | … | |\n| | | | | | | ↑ b | ↑ c | | |\n"],
  en: ["| Expected output (yen) | | | | a | | b | c | … | |\n", "| Expected output (yen) | | | | a | | | | … | |\n| | | | | | | ↑ b | ↑ c | | |\n"],
};
const GA_QUOTE = ["欄「予想出力」に記入", "欄“予想出力”に記入"];

// ── bank page pointer (q062 / q063: page-23 → page-24) ─────────────────────
const PAGE_FIX = { "2010h22a-q062": 24, "2010h22a-q063": 24 };

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  q003: 解説本文が題幹の誤記「オフショアウトソーシング」を 2 回使う → 題幹に合わせる (B9 q019 と同型)。
//  q061: 選択肢の式の引用と計算例の演算子 − ＋ ／ を D-162 で ASCII に (B7 q086 / q088 と同型)。
//        ／ は式中の位置 (「(A2／」「(値／」「)／10」「(…／10)」) だけを置換し、列挙の「0／9／8／3」等は区切りなので不変。
//  q079: correct の選択肢引用「「業者」表 → …」を選択肢の字形 “” に。zh「」は ⑨-c。
const EXPL = {
  "2010h22a-q003": { all: [["オフショアウトソーシング", "オフショアアウトソーシング"]] },
  "2010h22a-q061": { all: [["−", "-"], ["＋", "+"], ["(A2／", "(A2/"], ["(値／", "(値/"], [")／10", ")/10"], ["(…／10)", "(…/10)"]] },
  "2010h22a-q079": { correct: { jp: ["正解は イ (「業者」表 → 「商品」表 → 「仕入明細」表)。", "正解は イ (“業者”表 → “商品”表 → “仕入明細”表)。"] } },
};

const MARK = "fidfix-S129-b11";
const pg = (id) => { const b = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8")).questions.find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 語義是正 + 正解肢命中 + note が是正対象の字句を述べている題。
//   語義: q003 q066 q092 (q089〜q092 の表2 b / c、key に関わるのは q092) q094 / 正解肢命中: q031 (ア) q061 (ウ) q066 (エ) q079 (イ)
//   note 言及: q003 (「オフショアウトソーシング」) q016 / q021 (「」への正規化を記述) q018 (表と一字一句一致と記述) q061 (式の ／ ＋ を引用)
//   追記しない: q010 q033 q069 q078 q084 q085 q086 q087 q089 q090 q091 q095 (字種・体裁のみで note に言及なし)
const NOTE_APPEND = {
  "2010h22a-q003": (p) => `（S129 B11: ${p} 実読で 題幹の「オフショアウトソーシング」を源の「オフショアアウトソーシング」に、読点「、」を源の「，」に是正（上記の表記は是正前、解説本文も追随）。委託かつ委託先が海外 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2010h22a-q016": (p) => `（S129 B11: ${p} 実読で 源は “財務”，“内部ビジネスプロセス”及び“学習と成長” のため、clean の「」を源の “” と区切りに是正（上記の「」への正規化の記述は是正前）。残る視点は顧客 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2010h22a-q018": (p) => `（S129 B11: ${p} 実読で 表の評価基準セルの読点を源どおり「2%以上ならば，110点」等に補った（上記の「一字一句一致」は読点を除く）。55 + 30 + 0 = 85 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2010h22a-q021": (p) => `（S129 B11: ${p} 実読で 源は “営業活動”，“投資活動”，“財務活動” のため、clean の「」を源の “” と区切りに是正（上記の「鉤括弧に正規化」の記述は是正前）。三区分はキャッシュフロー計算書 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2010h22a-q031": (p) => `（S129 B11: ${p} 実読で 選択肢の表の断片（アに見出し行と記号、イ〜エに記号が混入）を見出し（業務プロセスモデル / データモデル）付きの 1 行表に是正。アは**正解肢**だが値は不変で、DFD / E-R 図 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2010h22a-q061": (p) => `（S129 B11: ${p} 実読で 選択肢ア〜エ（zh / en も）の式の演算子 − ＋ ／ を D-162 により ASCII の - + / に揃え（上記の式の引用は是正前の字形、解説も追随）、題幹の全角数字と読点「、」を源の「3 けた」「，」に是正。ウは**正解肢**だが演算子の字形のみの変更で、百の位 + 十の位の 1 の位 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2010h22a-q066": (p) => `（S129 B11 / D-163: ${p} 実読で 選択肢ア〜エ（jp / zh / en）の図の言語化（辺の集合の書き下しと、末尾の判定文「…不正解図。」「…正解図。」= 源に無い答え漏洩）を「図ア」〜「図エ」に置換（B10 q088 と同じ主 context 裁定、添付図に 4 肢あり。上記の ア={…} 等は図から読んだ矢印の記述）。choice_figures 化は図 lane 待ち。エは**正解肢** で、A→B, A→C, B→D = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2010h22a-q079": (p) => `（S129 B11: ${p} 実読で 題幹の「」と選択肢ア〜エの ASCII " を源の “” に是正（選択肢の「→ 」の空白も源どおり、解説 correct の引用も追随）。イは**正解肢**だが引用符の字形のみの変更で、業者 → 商品 → 仕入明細 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2010h22a-q092": (p) => `（S129 B11: ${p} 実読で 表2 の「予想出力」行に置かれていた b / c（源では表外の矢印で列 5 / 列 6 を指す）を表下の矢印行に移した（jp / zh / en、中問A の 4 題共通）。b = 列 5、c = 列 6 は不変で、A, 90, 10 / A, 90, 11 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2010h22a-q094": (p) => `（S129 B11: ${p} 実読で 設問文末の「ここで，表は…“×” で示す。」（前文の文の複写で源の問94 に無い、jp / zh / en）を削除。施設ごとに ACCEPT 1 行 × 4 + 形式1 の 1 行 = 5 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
};
// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set([...Object.keys(FIX), ...Object.keys(ALL), ...GROUP_A, ...Object.keys(PAGE_FIX)].map((id) => id.split("-q")[0]))];
const noteExams = [...new Set(Object.keys(NOTE_APPEND).map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(noteExams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));

// bank page pointer: question_bank と by_year の source を両方。現値が 23 でも目標値でもなければ止める。
for (const [id, page] of Object.entries(PAGE_FIX)) {
  const exam = id.split("-q")[0];
  for (const [o, w] of [[Barr.find((x) => x.id === id), "question_bank"], [BY[exam].questions.find((x) => x.id === id), "by_year"]]) {
    const img = `pages/${exam}/page-${String(page).padStart(2, "0")}.png`;
    if (o.source.page_number === page && o.source.page_image === img) { skipped++; continue; }
    if (o.source.page_number !== 23 || o.source.page_image !== `pages/${exam}/page-23.png`) throw new Error(`${id} ${w}: source が想定 (page-23) と異なる — abort`);
    o.source.page_number = page; o.source.page_image = img; applied++;
    log.push(`  ✓ ${id} ${w}.source: page-23 → page-${page}`);
  }
}

for (const id of [...new Set([...Object.keys(FIX), ...Object.keys(ALL)])]) {
  const fx = FIX[id] ?? {};
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
  // ALL: 表示層 (sidecar) と .phase1 の stem_jp_clean (前文を持たない設問文部分で件数は同じ)。
  if (ALL[id]) {
    if (id === "2010h22a-q095") { const s = t.stem_jp_clean, i = s.indexOf("次の表に示す許可区分"); if (i < 0 || /[、「」]/.test(s.slice(0, i))) throw new Error(`${id}: 前文に「、」「」がある / 設問文が見つからない — abort`); }
    for (const [from, to, n] of ALL[id]) {
      subAll(t, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`, n);
      if (t1?.stem_jp_clean) subAll(t1, "stem_jp_clean", from, to, `${id} .phase1 tr_.stem_jp_clean`, n);
    }
  }
  if (t1) wj(t1f, t1);
}

// 中問A: sidecar の表示 3 層のみ (raw / .phase1 は前文を持たない)。無言 skip 禁止 = 当たらなければ throw。
{
  const tq = TR["2010h22a"].questions;
  const get = (id, L) => (L === "jp" ? tq[id].stem_jp_clean : tq[id].stem[L]);
  const put = (id, L, v) => { if (L === "jp") tq[id].stem_jp_clean = v; else tq[id].stem[L] = v; };
  const once = (id, L, [from, to], what) => {
    const s = get(id, L);
    if (s.includes(to) && !s.includes(from)) { skipped++; return; }
    if (s.split(from).length - 1 !== 1) throw new Error(`GROUP_A ${id} ${L}: ${what} の from が 1 回でない — abort`);
    put(id, L, s.replace(from, to)); applied++;
    log.push(`  ✓ ${id} translations.${L === "jp" ? "stem_jp_clean" : `stem.${L}`}: ${what}`);
  };
  for (const id of GROUP_A) {
    once(id, "jp", GA_QUOTE, "欄「予想出力」→ “予想出力”");
    for (const L of ["jp", "zh", "en"]) once(id, L, GA_ROW[L], "表2 予想出力行の b / c → 矢印行");
  }
  // 是正後の不変式: 4 題の前文 (表2 の注まで) が 3 層とも一致、jp に「予想出力」の鉤括弧が無い、予想出力行に b / c が無い。
  for (const L of ["jp", "zh", "en"]) {
    const end = { jp: "注 網掛けの部分は，表示していない。", zh: "注 灰底部分未予显示。", en: "Note: The shaded portions are not shown." }[L];
    const heads = GROUP_A.map((id) => { const s = get(id, L), i = s.indexOf(end); if (i < 0) throw new Error(`GROUP_A ${id} ${L}: 注の行が見つからない — abort`); return s.slice(0, i); });
    if (!heads.every((h) => h === heads[0])) throw new Error(`GROUP_A ${L}: 是正後の前文が 4 題で一致しない — abort`);
    if (/\| a \| \| b \| c \|/.test(heads[0])) throw new Error(`GROUP_A ${L}: 予想出力行に b / c が残っている — abort`);
    if (L === "jp" && heads[0].includes("「予想出力」")) throw new Error("GROUP_A jp: 「予想出力」が残っている — abort");
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S129-b11: applied ${applied}, skipped ${skipped}`);
