#!/usr/bin/env node
// Stage 6 / Quiz — S129 B track **B7** (2012h24a、100 問 / Sonnet 5 単 pass、D-150 §3) の差分を是正する。
// 源: S129 の workflow `wf_4e1982d3-766`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b7_2012h24a_sn.json
//     マニフェスト = data/ip/quiz/.phase2/b7_fidelity_input_2012h24a.json (precrop 81/100、skip 19 = chumon 15 + page_mismatch 4 (q079〜q081 / q088))
//     機械 diff (S128 L1a 改修版) = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 470 / AGENT_MISSED 18 / QUOTE_ASCII 3 (q091 / q093 / q094、実残差) / TRANSCRIPT_PREFIX 1 (q021、図の言語化) / VERDICT_CONFLICT 0
//                 実残差 = q025 (単位行) / q088 (演算子・引用符、fixer 走査) / q091 / q093 / q094。q011 / q083 (選択肢表の一行化)・中問前文 (q087 / q088 / q095 / q096 / q098 / q099)・
//                 q063 / q065 / q080 (agent 報告済みの同箇所) は不変または §4 で裁定。
//
// 層・方針は quiz-fidfix-S122-u3a 〜 S129-b6 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2012h24a の sidecar のキーは `stem` / `choices` / `stem_jp_clean`。`choices_jp_clean` は無い → 選択肢は raw 3 層が出荷層。
// 中問 4 組 (mqA〜mqC、q098-copy) は前文埋め込み済み。前文領域は触らず、from は設問文側の部分一致。
//
// 適用ループ (sub / FIX / expl 単一読み / NOTE_APPEND) は B6 から流用 (変更なし)。
//
// 採用した差分 (evidence §6。源 crop / 源ページを原寸で独立実読して確認):
//   q004 stem  (p03) 「商店等」→ 源「商店街」(zh / en 追随)
//   q010 イ・ウ (p04) 読点「、」→ 源「，」
//   q020 ウ    (p08) 「危険」→ 源「危害」(解説ウの言い換えも追随)
//   q024 stem  (p09) 読点「、」→ 源「，」
//   q025 stem  (p10) 「（単位：百万円）」→ 源「単位　百万円」(B6 q001 の形)
//   q040 stem  (p15) 「当てはまる マネジメント」の空白
//   q058 stem  (p22) 「媒体の①」→ 源「媒体①」
//   q063 stem  (p24) 〔ファイルの指定方法〕の「」→ 源 “” (￥ / ． の字幅は不変)
//   q065 stem  (p25) 「商品値引き」→ 源 “商品値引き”
//   q070 ウ    (p27) 「“jpg'"」→ 源「“jpg”」(**正解肢**、en も “”)
//   q071 stem  (p27) 「」→ 源 “” (en も “”)
//   q072 stem  (p27) 「」→ 源 “”、読点「、」×2 → 源「，」
//   q074 ア    (p28) 「ネットワークにに」→ 源「ネットワークに」
//   q080 stem  (p30) 図に無い括弧書きを削除、〔在庫管理システム〕→ 源の図題「在庫管理システム」、「」→ “”、「、」→「，」(zh / en 追随)
//   q085 エ    (p34) 「和牛丼」→ 源「牛丼」(zh / en 追随、解説エの冒頭 1 文を削除)
//   q086 ア〜エ (p34) 式の「／」→「/」(D-162、PHASE 2 追加、**ウは正解肢**、zh / en・解説の引用も)
//   q088 stem・ア〜エ (p36 / p37) ASCII " → 源 “○” “×”、式の「－」→「-」(D-162、**ウは正解肢**、zh / en も)
//   q091 / q093 / q094 stem (p39 / p42 / p43) ASCII " → 源 “” (en も “”)
//   q096 stem  (p44) 「」×7 → 源 “”、（m－2）/（5－2）→ 源の半角括弧
//
// Run: node scripts/quiz-fidfix-S129-b7.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S129-b7.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2012h24a
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = !process.argv.includes("--apply") || process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const LOADED = new Map();
const rj = (f) => { const d = JSON.parse(readFileSync(f, "utf-8")); LOADED.set(f, JSON.stringify(d, null, 2)); return d; };
const written = [];
const wj = (f, d) => {
  const next = JSON.stringify(d, null, 2);
  if (LOADED.get(f) === next) return;
  written.push(path.relative(ROOT, f));
  if (!DRY) writeFileSync(f, next + "\n");
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


const FIX = {
  // ── 題幹 ────────────────────────────────────────────────────────────────────
  // q004: clean 無し (raw = 出荷層)。zh「商铺等」/ en "its shops and other businesses" も「等」の腐敗を訳している → 追随。
  "2012h24a-q004": {
    jp: [["stem", "商店等のプロモーション", "商店街のプロモーション"]],
    zh: [["stem", "对商铺等进行促销宣传", "对商业街进行促销宣传"]],
    en: [["stem", "to promote its shops and other businesses", "to promote the shopping district"]],
  },
  // q024: 源 p09 は「，」。raw は「, 」(別文字列) で n===0 skip。
  "2012h24a-q024": { jp: [["stem", "取決めがない場合、このソフトウェア", "取決めがない場合，このソフトウェア"]] },
  // q025: 源 p10 は表の右肩に「単位　百万円」(括弧なし)。B6 q001 の形。zh / en の単位行は訳の体裁 → 不追随。
  "2012h24a-q025": { jp: [["stem", "（単位：百万円）\n|", "単位　百万円\n|"]] },
  "2012h24a-q040": { jp: [["stem", "当てはまる マネジメント", "当てはまるマネジメント"]] },
  "2012h24a-q058": { jp: [["stem", "媒体の①〜⑤のうち", "媒体①〜⑤のうち"]] },
  // q063: 引用符のみ源 “” に。￥ / ． の字幅は B2 2014h26h-q068 の先例どおり不変 (選択肢・表・zh / en と揃ったまま)。
  //   末尾の図の言語化「（図：…）」は図と一致する描画補助として不変 (B5 q052 の扱い)。zh「」は ⑨-c、en は既に “”。
  "2012h24a-q063": {
    jp: [
      ["stem", "(1) 「ディレクトリ名￥ … ￥ディレクトリ名￥ファイル名」のように，経路上のディレクトリを順に「￥」で区切って並べた後に「￥」とファイル名を指定する。", "(1) “ディレクトリ名￥ … ￥ディレクトリ名￥ファイル名”のように，経路上のディレクトリを順に“￥”で区切って並べた後に“￥”とファイル名を指定する。"],
      ["stem", "カレントディレクトリは「．」で表す。", "カレントディレクトリは“．”で表す。"],
      ["stem", "1階層上のディレクトリは「．．」で表す。", "1階層上のディレクトリは“．．”で表す。"],
      ["stem", "始まりが「￥」のときは", "始まりが“￥”のときは"],
    ],
  },
  // q065: 表見出し「値引率（%）」は源どおり (agent の「値引き率」は誤報告)。表題「商品値引き」も源にある。
  "2012h24a-q065": { jp: [["stem", "「商品値引き」表に示すとおり", "“商品値引き”表に示すとおり"]] },
  "2012h24a-q071": {
    jp: [["stem", "「http://www.ipa.go.jp/」のような", "“http://www.ipa.go.jp/”のような"]],
    en: [["stem", "\"http://www.ipa.go.jp/\"?", "“http://www.ipa.go.jp/”?"]],
  },
  // q072: zh「」は ⑨-c、en は既に “”。
  "2012h24a-q072": {
    jp: [
      ["stem", "図に示すように、文字列", "図に示すように，文字列"],
      ["stem", "結果が「0110001010」であったとき、置換え前", "結果が“0110001010”であったとき，置換え前"],
    ],
  },
  // q080: 源 p30 は図 (図題「在庫管理システム」、〔〕なし)。表への起こしは値が源と一致 → 体裁として不変、【処理内容】も列見出しで担保。
  //   末尾の括弧書きは図に無い推論文 → 削除 (jp / zh / en)。読点「、」→ 源「，」、「在庫数」→ 源 “在庫数”。zh「」は ⑨-c。
  "2012h24a-q080": {
    jp: [
      ["stem", "ある在庫管理システムは、複数の入力を同時並行して処理し、在庫数を更新しているが、排他制御は行っていない。ある時点での在庫数が 100 であったとき、入力された二つの入力 A、B に応じて、図に示す処理が ① → ② → ③ → ④ の順序で実行された場合、処理④が", "ある在庫管理システムは，複数の入力を同時並行して処理し，在庫数を更新しているが，排他制御は行っていない。ある時点での在庫数が 100 であったとき，入力された二つの入力 A，B に応じて，図に示す処理が ① → ② → ③ → ④ の順序で実行された場合，処理④が"],
      ["stem", "〔在庫管理システム〕", "在庫管理システム"],
      ["stem", "① 「在庫数」を読み込み、入庫数の 50 を加える。<br>④ 結果を「在庫数」に書き込む。", "① “在庫数”を読み込み，入庫数の 50 を加える。<br>④ 結果を“在庫数”に書き込む。"],
      ["stem", "② 「在庫数」を読み込み、出庫数の 30 を引く。<br>③ 結果を「在庫数」に書き込む。", "② “在庫数”を読み込み，出庫数の 30 を引く。<br>③ 結果を“在庫数”に書き込む。"],
      ["stem", "\n\n（入力A・入力B のいずれの処理も、共有の「在庫数」を参照・更新する。）", ""],
    ],
    zh: [
      ["stem", "〔库存管理系统〕", "库存管理系统"],
      ["stem", "\n\n（输入A、输入B 的处理均会参照并更新共享的「库存数量」。）", ""],
    ],
    en: [
      ["stem", "[Inventory management system]", "Inventory management system"],
      ["stem", "\n\n(Both the Input A and Input B processes reference and update the shared “stock quantity”.)", ""],
    ],
  },
  // q088: 源 p36 は “○” “×”。自問のワークシート (表) の欠落は図 lane の担当 → 本是正器は起こさない。zh は既に “”。
  "2012h24a-q088": {
    jp: [["stem", "以上の場合は \"○\"，親子丼の粗利益未満の場合は \"×\" を，", "以上の場合は“○”，親子丼の粗利益未満の場合は“×”を，"]],
    en: [
      ["stem", "display \"○\" in cells", "display “○” in cells"],
      ["stem", "display \"×\". Which", "display “×”. Which"],
    ],
  },
  "2012h24a-q091": {
    jp: [["stem", "(5) の \"申請書類の計算ミスが多くて，承認までに時間が掛かっている。\" の原因", "(5) の“申請書類の計算ミスが多くて，承認までに時間が掛かっている。”の原因"]],
    en: [
      ["stem", "(5) states \"There are many calculation err", "(5) states “There are many calculation err"],
      ["stem", "takes a long time.\" Investigating", "takes a long time.” Investigating"],
    ],
  },
  "2012h24a-q093": {
    jp: [["stem", "4ビットの値 \"0100\" を補い", "4ビットの値“0100”を補い"]],
    en: [["stem", "4-bit value \"0100\" to each", "4-bit value “0100” to each"]],
  },
  "2012h24a-q094": {
    jp: [["stem", "常に \"白と黒\" の8ビット", "常に“白と黒”の8ビット"]],
    en: [["stem", "pair of \"white and black.\"", "pair of “white and black.”"]],
  },
  // q096: 源 p44 は “” と半角括弧 (m－2) / (5－2)。－ は式ではなく本文の算式なので D-162 の対象外 → 字形不変。zh「」は ⑨-c、en は既に “”。
  "2012h24a-q096": {
    jp: [
      ["stem", "①桁数の情報：（m－2）ビット", "①桁数の情報：(m－2)ビット"],
      ["stem", "場合は，「0」と表現", "場合は，“0”と表現"],
      ["stem", "区切りは「0」で表現", "区切りは“0”で表現"],
      ["stem", "値 n は「10100」となり", "値 n は“10100”となり"],
      ["stem", "①は（5－2）ビットの連続する1なので「111」となり，これに区切りの「0」と n をつなげ，結果は「111010100」となる。", "①は(5－2)ビットの連続する1なので“111”となり，これに区切りの“0”と n をつなげ，結果は“111010100”となる。"],
      ["stem", "先頭に「000」を補う", "先頭に“000”を補う"],
      // Rule D NIT-1: raw 側にだけ残る（5－2）(clean は上の行で是正済み → n===0 skip)。
      ["stem", "①は（5－2）ビット", "①は(5－2)ビット"],
    ],
  },
  // ── 選択肢 ──────────────────────────────────────────────────────────────────
  // q010: 源 p04 は「，」。選択肢は raw 3 層が出荷層。
  "2012h24a-q010": {
    jp: [
      ["イ", "価値観、思考・行動様式、信念", "価値観，思考・行動様式，信念"],
      ["ウ", "行われるように、経営を", "行われるように，経営を"],
    ],
  },
  // q020: zh「会危及人身安全」/ en "pose a risk to physical safety" は源の意味で可 → 不追随。
  "2012h24a-q020": { jp: [["ウ", "身体に危険を及ぼす", "身体に危害を及ぼす"]] },
  // q070: 正解肢、閉じ引用符の崩れ。読点「, 」は exam 全体の型 (⑨) で不変。zh は既に “”。
  "2012h24a-q070": {
    jp: [["ウ", "“jpg'\"の", "“jpg”の"]],
    en: [["ウ", "extension \"jpg\" are", "extension “jpg” are"]],
  },
  "2012h24a-q074": { jp: [["ア", "ネットワークにに接続", "ネットワークに接続"]] },
  // q085: 源 p34 は「牛丼」。zh / en も「和」を訳している → 追随 (en は同題ア / イの「Oyakodon (…)」形と解説の Gyudon に揃える)。
  "2012h24a-q085": {
    jp: [["エ", "和牛丼の粗利益", "牛丼の粗利益"]],
    zh: [["エ", "和牛盖饭的毛利", "牛肉盖饭的毛利"]],
    en: [["エ", "Wagyu beef rice bowl has", "Gyudon (beef rice bowl) has"]],
  },
};
// q088 選択肢: D-162 — 表計算式の算術演算子は ASCII。表示は * + が既に ASCII で － だけ全角 → -。'○' '×' / ≧ は源どおり不変。
//   ウは正解肢 (字形のみ)。zh / en の式も同じ文字列なので揃える。
{
  const F88 = {
    ア: "IF(((B$8－C$8)*$C12+(B$9－C$9)*B$13)≧$F$3,'○','×')",
    イ: "IF((($B8－$C8)*B$13+(B$9－C$9)*$C12)≧$F$3,'×','○')",
    ウ: "IF((($B$8－$C$8)*C$12+($B$9－$C$9)*$B13)≧$F$3,'○','×')",
    エ: "IF((($B$8－$C$8)*$C12+($B$9－$C$9)*B$13)≧$F$3,'×','○')",
  };
  const ops = Object.entries(F88).map(([L, s]) => [L, s, s.replaceAll("－", "-")]);
  FIX["2012h24a-q088"].jp = [...FIX["2012h24a-q088"].jp, ...ops];
  FIX["2012h24a-q088"].zh = ops;
  FIX["2012h24a-q088"].en = [...FIX["2012h24a-q088"].en, ...ops];
}

// q086 選択肢 (PHASE 2 追加): q088 と同じ中問A の表計算式で、源 p34 の ／ が表示に全角のまま残っていた → D-162 で / に揃える (q088 と題組内で一致)。
//   ウは正解肢 (字形のみ)。zh / en の式も同じ。解説が選択肢の式をそのまま引用している箇所 (correct / distractor、jp / zh / en) も揃える。
const S86 = ["F2／E2", "F2／F6", "F2／F$6", "F2／合計", "F2／合计", "F2／sum", "F3／F$6", "F4／F$6", "F5／F$6"].map((x) => [x, x.replace("／", "/")]);
{
  const C86 = { ア: "F2／E2", イ: "F2／F6", ウ: "F2／F$6" };
  const ops = Object.entries(C86).map(([L, s]) => [L, s, s.replace("／", "/")]);
  FIX["2012h24a-q086"] = {
    jp: [...ops, ["エ", "F2／合計(", "F2/合計("]],
    zh: [...ops, ["エ", "F2／合计(", "F2/合计("]],
    en: [...ops, ["エ", "F2／sum(", "F2/sum("]],
  };
}

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  q085 エ: why_wrong の冒頭 1 文は是正前の「和牛丼」(格納データの誤り) を説明している → 是正後は不整合なので削除 (jp / zh / en)。後続の「牛丼でも誤り」の論旨は不変。
//  q086: 選択肢の式の引用 ／ → / (D-162、上記)。対の配列 ([[from, to], …]) も受ける。
//  q020 ウ: why_wrong が選択肢ウの文言「身体に危険を及ぼす」を言い換えなしで用いている → 源の「危害」に揃える。
const EXPL = {
  "2012h24a-q085": {
    dist: {
      エ: {
        jp: ["まず図1 に掲載されているメニューは 牛丼・親子丼・カツ丼・カレー の 4 品だけで、「和牛丼」という行は存在しない (原典の印字は「牛丼」であり、格納データ側の文字認識の誤りとみられる)。そして原典どおり牛丼として読んでも、やはり誤りである。", ""],
        zh: ["首先，图1 中列出的菜品只有 牛肉盖饭、亲子盖饭、炸猪排盖饭、咖喱 4 种，并不存在「和牛盖饭」这一行（原始试题上印的是「牛肉盖饭」，可判断是本数据一侧的文字识别错误）。而且即便按原题读作牛肉盖饭，该选项依然错误。", ""],
        en: ["First, the only menu items listed in Figure 1 are Gyudon (beef rice bowl), Oyakodon (chicken and egg rice bowl), Katsudon (pork cutlet rice bowl), and Curry, four in all; there is no row for a “Wagyu beef rice bowl” (the original exam paper prints “beef rice bowl”, so this appears to be a character-recognition error on the stored-data side). And even if we read it as Gyudon, as the original prints it, the choice is still wrong. ", ""],
      },
    },
  },
  "2012h24a-q020": { dist: { ウ: { jp: ["身体に危険を及ぼすリコール対象製品の回収は", "身体に危害を及ぼすリコール対象製品の回収は"] } } },
  // Rule D MINOR-1: q088 解説が選択肢の式をそのまま引用している箇所 (correct = 正解ウの式、distractor イ の 2 項) を選択肢と同じく － → - に。地の文の算式「(単価－原価)」は式ではないので不変。
  "2012h24a-q088": {
    correct: Object.fromEntries(["jp", "zh", "en"].map((L) => [L, ["IF((($B$8－$C$8)*C$12+($B$9－$C$9)*$B13)", "IF((($B$8-$C$8)*C$12+($B$9-$C$9)*$B13)"]])),
    dist: { イ: Object.fromEntries(["jp", "zh", "en"].map((L) => [L, [["$B8－$C8", "$B8-$C8"], ["B$9－C$9", "B$9-C$9"]]])) },
  },
  "2012h24a-q086": { correct: { jp: S86, zh: S86, en: S86 }, dist: Object.fromEntries(["ア", "イ", "エ"].map((L) => [L, { jp: S86, zh: S86, en: S86 }])) },
};

const MARK = "fidfix-S129-b7";
const pg = (id) => { const b = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8")).questions.find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 語義是正 + 正解肢命中 + note が腐敗 / 原典一致 / 是正対象の字句を述べている題。
//   語義: q004 q020 q058 q074 q080 q085 / 正解肢命中: q070 (ウ、引用符) q086 / q088 (ウ、演算子の字形)
//   note 言及: q040 (「当てはまる マネジメント」) q063 (clean は原典と完全一致) q070 (“jpg'") q071 (引用符は clean で除去済み) q072 (完全に整合)
//              q074 (「にに」) q085 (和牛丼) q094 (逐語一致) q096 (既に源一致)
//   追記しない (字種・空白のみで note に言及なし): q010 q024 q025 q065 q091 q093
const NOTE_APPEND = {
  "2012h24a-q004": (p) => `（S129 B7: ${p} 実読で 題幹の「商店等のプロモーション」を源の「商店街のプロモーション」に是正（zh / en も追随）。顧客とのコミュニケーションを生む仕組み = SNS = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2012h24a-q020": (p) => `（S129 B7: ${p} 実読で 選択肢ウの「身体に危険を及ぼす」を源の「身体に危害を及ぼす」に是正（解説ウの言い換えも追随）。親会社への販促目的の提供は第三者提供で本人同意が必要 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2012h24a-q040": (p) => `（S129 B7: ${p} 実読で 題幹の「当てはまる マネジメント」の改行由来の空白を除去（上記の空白の記述は是正前の状態）。設置場所の標識を出さない物理的対策 = ファシリティマネジメント = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2012h24a-q058": (p) => `（S129 B7: ${p} 実読で 題幹の源に無い助詞「の」を除き「媒体①〜⑤のうち」に是正。不揮発性は ②④⑤ = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2012h24a-q063": (p) => `（S129 B7: ${p} 実読で 〔ファイルの指定方法〕(1)〜(4) の引用符「」を源の “” に是正（上記の「原典ページと完全に一致」は引用符の字種を除く。￥ / ． の字幅は不変）。カレント ￥A￥B￥A から 3 階層上がってルート直下の B = ..￥..￥..￥B￥f = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2012h24a-q070": (p) => `（S129 B7: ${p} 実読で 選択肢ウの閉じ引用符の崩れ「“jpg'"」を源の「“jpg”」に是正済み（上記の推定どおり。en も “”）。ウは**正解肢**だが変更は引用符の字形のみで、画像ファイルでもウイルス検査は要る = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2012h24a-q071": (p) => `（S129 B7: ${p} 実読で clean の引用符「」を源の “” に是正（en も “”）。情報の所在を表す記述方式 = URL = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2012h24a-q072": (p) => `（S129 B7: ${p} 実読で 題幹の引用符「」を源の “” に、読点「、」×2 を源の「，」に是正（上記の「完全に整合」は字種を除く）。0110001010 = 0 / 11 / 0 / 0 / 0 / 10 / 10 = ACAAABB = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2012h24a-q074": (p) => `（S129 B7: ${p} 実読で 上記の選択肢アの「ネットワークにに接続された」を源の「ネットワークに接続された」に是正済み。PC の画面で検索・ハイパリンクで閲覧できる説明機能 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2012h24a-q080": (p) => `（S129 B7: ${p} 実読で 図に無い末尾の括弧書き（両処理が共有の在庫数を参照・更新する旨）を削除し、図題の〔〕を除いて源の「在庫管理システム」に、「在庫数」を源の “在庫数” に、読点「、」を源の「，」に是正（zh / en も括弧書きと図題を追随）。① 100 読込 → ② 100 読込 → ③ 70 書込 → ④ 150 書込 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2012h24a-q085": (p) => `（S129 B7: ${p} 実読で 上記の選択肢エの「和牛丼」を源の「牛丼」に是正済み（zh「牛肉盖饭」/ en「Gyudon (beef rice bowl)」も追随、解説エの冒頭の和牛丼に関する 1 文を削除）。親子丼は売上高・粗利益とも最少 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2012h24a-q086": (p) => `（S129 B7 PHASE 2: ${p} 実読で 選択肢ア〜エの式中の全角「／」を D-162（表計算式の算術演算子は ASCII）により「/」に揃えた（同じ中問A の q088 と一致させる。zh / en と解説の式の引用も同じ）。ウは**正解肢**だが変更は演算子の字形のみで、分母を F$6 で行固定して G3〜G5 に複写できる = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2012h24a-q088": (p) => `（S129 B7: ${p} 実読で 題幹の ASCII " を源の “○” “×” に是正し、選択肢ア〜エの式中の全角「－」を D-162（表計算式の算術演算子は ASCII）により「-」に揃えた（zh / en も同じ）。ウは**正解肢**だが変更は演算子の字形のみで、$B$8 / $C$8 / C$12 / $B$9 / $C$9 / $B13 の参照形 = ウという導出・correct_answer=ウ は不変。自問のワークシート（表）の欠落は図 lane の担当で本是正の範囲外 — ${MARK}）`,
  "2012h24a-q094": (p) => `（S129 B7: ${p} 実読で 〔画像データの表現方法〕(2) の ASCII " を源の “白と黒” に是正（en も “”。上記の「逐語一致」は引用符の字種を除く）。40 ビット = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2012h24a-q096": (p) => `（S129 B7: ${p} 実読で clean の引用符「」×7 を源の “” に、（m－2）/（5－2）の括弧を源の半角 ( ) に是正（上記の「既に源一致」は引用符・括弧の字種を除く）。27 ビット = アという導出・correct_answer=ア は不変 — ${MARK}）`,
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
const pairs = (x) => (Array.isArray(x[0]) ? x : [x]);
for (const [id, ex] of Object.entries(EXPL)) {
  const { j, tr } = expl(id);
  if (ex.correct?.jp) for (const [a, b] of pairs(ex.correct.jp)) sub(j, "correct_jp", a, b, `${id} expl_jp.correct`);
  for (const lang of ["zh", "en"]) if (ex.correct?.[lang]) for (const [a, b] of pairs(ex.correct[lang])) sub(tr.correct, lang, a, b, `${id} expl_tr.correct.${lang}`);
  for (const [L, d] of Object.entries(ex.dist ?? {})) {
    const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    if (!dj || !dt) throw new Error(`${id} distractor ${L} missing`);
    if (d.jp) for (const [a, b] of pairs(d.jp)) sub(dj, "why_wrong_jp", a, b, `${id} expl_jp.${L}`);
    if (d.zh) for (const [a, b] of pairs(d.zh)) sub(dt, "zh", a, b, `${id} expl_tr.${L}.zh`);
    if (d.en) for (const [a, b] of pairs(d.en)) sub(dt, "en", a, b, `${id} expl_tr.${L}.en`);
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
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S129-b7: applied ${applied}, skipped ${skipped}`);
