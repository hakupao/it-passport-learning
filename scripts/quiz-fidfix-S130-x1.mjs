#!/usr/bin/env node
// Stage 6 / Quiz — S130 X track **X1** (母数外 excluded 105 題: 2015h27a 32 / 2016h28a 16 / 2016h28h 34 / 2017h29a 8 / 2017h29h 15、
// Sonnet 5 単 pass) の差分を是正する。
// 源: S130 の workflow `wf_6ee4ff5a-693`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/x1_fidelity_multi_sn.json
//     マニフェスト = data/ip/quiz/.phase2/x1_fidelity_input_multi.json (precrop 93/105、next_page_png 105/105)
//     機械 diff = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 494 / AGENT_MISSED 26 / REPORTED 4 / TRANSCRIPT_PREFIX 1 (未裁定) / QUOTE_ASCII 0 / VERDICT_CONFLICT 0 (exit 1)
//                 実残差 = 2015h27a-q100 題幹末尾の選択肢行の重複 (agent は挿入段落だけ報告)。
//                 他は既知型: [表] 一行化の a: 列 (q055 / 2016h28a-q093 / 2017h29a-q076)、空欄枠 [ a ] (q075)、
//                 図・前文の言語化 (q008 / q048 / q085 / q086 row 0 / q096 @0 / 2016h28a-q025 / 2017h29a-q097)、
//                 2016h28h-q054 選択肢末尾「。」(exam 全体の型、⑨)、2016h28h-q078 図の言語化 (+155、allowlist は PHASE 2)。
//
// 層・方針は quiz-fidfix-S122-u3a 〜 S129-b13 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 5 exam とも sidecar のキーは `stem` / `choices` / `stem_jp_clean` (`choices_jp_clean` は無い → 選択肢は raw 3 層が出荷層)。
// 中問 (2015h27a mqA〜mqD) は前文 (registry probe / 共通接頭) に触らない。q085 (共通接頭 577 字の後) と q100 (同 649 字の後) は設問文側。
// 読点「、」: X1 5 exam では exam 全体の型 (母数側も U4 / U9 / U11 で許容表記揺れ)。本 unit で是正する field (q064 / q074 / q096) のみ
//   源の「，」に揃え、それ以外は ⑨ (evidence §9、lead 判断)。ASCII「, 」も exam の型で不変 (q100 の設問文側は是正 field 内で「，」に揃える)。
//
// 採用した差分 (evidence §4。源 crop / 源ページを原寸で独立実読して確認):
//   2015h27a-q100 題幹 (p45 / p47) 源に無い AI 挿入段落 (HDD 内蔵 2 台の特定) + 末尾の選択肢行重複を削除 (**semantic**、D-168 趣旨、zh / en も)
//   2016h28h-q022 題幹 (p11) B案 保守欄の複写セル「←（左に同じ）」を除去 (**semantic**、B8 q004 / S113 の結合セル非展開、括弧の配置記述は残す)
//   引用符 「」→“” (D-155): 2015h27a-q048 (比較の “xか?” 等、? は源の半角) / q064 (‘東館’ は源の ‘’) / q072 / 2016h28a-q074 / q082 / 2016h28h-q096 (選択肢の ASCII " も)
//     / 2017h29a-q092 (en 2016h28a-q082 も D-156)
//   2017h29a-q092 選択肢 ア〜エ の「ー」(長音) → 凡例の「－」(エ = **正解肢**)
//   2016h28h-q080 選択肢 ア〜エ の ＊ ／ → * / (D-162、ウ = **正解肢**、zh / en・解説も)
//   2015h27a-q026 表の AI 見出し行「| 項目 | 値 |」を削除 (D-158、源は見出しなしの 2 列表)
//   2015h27a-q085 「図1は、…ワークシートである。」→ 源の図題「図 1　…ワークシート」
//   2017h29a-q018 図題の「」(源は括弧なし、zh “” / en ASCII " も)
//   2016h28h-q054 イ 読点の脱落 (完了によって，売上)     2016h28h-q045 題幹「。 購買」の空白 (源は同一行)
//   CLEAN 抽検で検出: 2015h27a-q090 選択肢イ〜エ の − (U+2212) → - (D-162、イ = **正解肢**、zh / en・解説も)
//                     2016h28h-q020 表の「法人税、住民税」→「，」
//
// Run: node scripts/quiz-fidfix-S130-x1.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S130-x1.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs <exam> (2015h27a 2016h28a 2016h28h 2017h29a)
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

function subAll(obj, key, from, to, where, expect) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; return false; }
  if (expect !== undefined && n !== expect) throw new Error(`${where}: 「${from}」 が ${n}× (想定 ${expect}×) — abort`);
  obj[key] = s.split(from).join(to); applied++; log.push(`  ✓ ${where}: 「${from}」→「${to}」 ×${n}`); return true;
}

// 2015h27a-q100: 源 p47 の問100 は「Aさんが処分するPCにおいて，専用ソフトの説明書によって，…」から始まる。前文 (p45) の後に置かれた
//   「Aさんは,これまで…2台である。・8G…・40G…Aさんは,…処分する。」は源のどこにも無い AI 挿入で、HDD を内蔵する機器 (= 計算対象 2 台) を
//   特定してしまう (本問が問う読解の先取り、D-168 趣旨)。末尾の「ア 120　　イ 140 …」は選択肢の重複。設問文の ASCII「,」は源の「，」に。
const Q100_INS = {
  jp: "Aさんは,これまで使用していたPCを処分することにした。Aさんが処分する機器のうちHDDを内蔵するのは,次の2台である。\n・8GバイトのHDDを内蔵したデスクトップPC 1台\n・40GバイトのHDDを内蔵した液晶ディスプレイ一体型PC 1台\nAさんは,HDD内のデータを他人が読み取れないように専用ソフトで処理してから機器を処分する。",
  zh: "A先生决定处分一直以来使用的PC。A先生要处分的设备中，内置HDD的有以下2台。\n・内置8G字节HDD的台式PC 1台\n・内置40G字节HDD的液晶显示器一体型PC 1台\nA先生在用专用软件处理HDD内的数据使他人无法读取之后再处分设备。",
  en: "Mr. A has decided to dispose of the PCs he had been using. Among the equipment Mr. A will dispose of, the following 2 units contain a built-in HDD.\n- 1 desktop PC with a built-in 8 GB HDD\n- 1 liquid-crystal-display all-in-one PC with a built-in 40 GB HDD\nBefore disposing of the equipment, Mr. A processes the data on the HDDs with dedicated software so that others cannot read it. ",
};
// 2017h29a-q092: 選択肢の未設定記号が「ー」(長音、U+30FC)。題幹の凡例・源・zh は「－」(U+FF0D)。「グループ」の ー を巻き込まないよう「:ー」で置換。
const Q092_DASH = { "ア": 2, "イ": 2, "ウ": 2, "エ": 3 };
// 2016h28h-q080: 源 p36 の式は ＊ ／ (全角)。D-162 で算術演算子は ASCII。比較記号 ≧ ＞ ≦ ＜ は演算子ではなく原典どおり。
const Q080_OPS = { "ア": [2, 3], "イ": [2, 3], "ウ": [2, 3], "エ": [2, 3] };

const FIX = {
  // ── 題幹 ────────────────────────────────────────────────────────────────────
  // q026: 源 p11 の表は見出し行なしの 2 列 (項目名 | 値)。「| 項目 | 値 |」は AI が付けた見出し (D-158) → 1 行目を見出しに繰り上げる。
  "2015h27a-q026": {
    jp: [["stem", "| 項目 | 値 |\n|---|---|\n| 取得原価 | 480,000 円 |\n", "| 取得原価 | 480,000 円 |\n|---|---|\n"]],
    zh: [["stem", "| 项目 | 值 |\n|---|---|\n| 取得成本 | 480,000 日元 |\n", "| 取得成本 | 480,000 日元 |\n|---|---|\n"]],
    en: [["stem", "| Item | Value |\n|---|---|\n| Acquisition cost | 480,000 yen |\n", "| Acquisition cost | 480,000 yen |\n|---|---|\n"]],
  },
  // q048: 源 p20 は 比較（“xか?”，“yか?”，“zか?”）。? は源の半角。流れ図の言語化 (「開始」→「xか？」…) は源に対応文が無い描画補助 → 不変 (⑨)。
  "2015h27a-q048": { jp: [["stem", "比較（「xか？」，「yか？」，「zか？」）", "比較（“xか?”，“yか?”，“zか?”）"]] },
  // q064: 源 p26 は “入館履歴”表と“建物”表から，建物名が‘東館’を…ソートしたとき，。field の「、」も源の「，」に (是正 field)。
  "2015h27a-q064": { jp: [["stem",
    "関係データベースで管理している「入館履歴」表と「建物」表から、建物名が「東館」を条件に抽出した結果を日付の降順でソートしたとき、2番目のレコードの社員番号はどれか。",
    "関係データベースで管理している“入館履歴”表と“建物”表から，建物名が‘東館’を条件に抽出した結果を日付の降順でソートしたとき，2番目のレコードの社員番号はどれか。"]] },
  // q072: 源 p30 は “売上”表，“顧客”表及び“商品”表。zh「」は ⑨-c、en は既に “”。
  "2015h27a-q072": { jp: [["stem", "「売上」表，「顧客」表及び「商品」表がある。", "“売上”表，“顧客”表及び“商品”表がある。"]] },
  // q085: 源 p36 の図題は「図 1　アンケート集計表と評価集計表のワークシート」。表示は説明文に書き換えている (共通接頭 577 字の後 = 設問文側)。
  //   D-170: 前文 (「，」) と設問文 (「、」) で field の字形が割れる → 設問文側の「、」も源の「，」に (q095 / q098 も同じ。q090 の「、」は mqB 前文 = probe 範囲で不可触、D-167)。
  "2015h27a-q085": {
    jp: [
      ["stem", "図1は、アンケート集計表と評価集計表のワークシートである。", "図 1　アンケート集計表と評価集計表のワークシート"],
      ["stem", "図1の評価集計表のセルB208には、該当する度数を表示する式が入力されている。セルB208に入力されている式はどれか。ここで、セルB208の式は、セルB208〜G212に複写する。",
        "図1の評価集計表のセルB208には，該当する度数を表示する式が入力されている。セルB208に入力されている式はどれか。ここで，セルB208の式は，セルB208〜G212に複写する。"],
    ],
    zh: [["stem", "图1是问卷汇总表和评价汇总表的工作表。", "图1　问卷汇总表和评价汇总表的工作表"]],
    en: [["stem", "Figure 1 is a worksheet containing a survey tally table and an evaluation tally table.", "Figure 1  Worksheet of the survey tally table and the evaluation tally table"]],
  },
  // q095 / q098 (D-170): 前文は「，」、設問文だけ「、」(field 内で字形が割れる)。設問文 (共通接頭 177 / 664 字の後) を源の「，」に。
  "2015h27a-q095": { jp: [["stem",
    "工程1が予定日数どおりに完了した後、工程2の開始前に会社を休むことにした。工程2が予定日数どおりに完了すると仮定して、プロジェクトの進行に影響が出ないようにするためには、Pさんは工程2の開始前に最大何日間休むことができるか。ここで、休日の日数は考えないものとする。",
    "工程1が予定日数どおりに完了した後，工程2の開始前に会社を休むことにした。工程2が予定日数どおりに完了すると仮定して，プロジェクトの進行に影響が出ないようにするためには，Pさんは工程2の開始前に最大何日間休むことができるか。ここで，休日の日数は考えないものとする。"]] },
  "2015h27a-q098": { jp: [["stem",
    "〔Aさんが調べた結果〕に基づくと、Aさんが処分する機器の回収に伴う料金は総額で何円か。ここで、液晶ディスプレイ一体型PCだけに",
    "〔Aさんが調べた結果〕に基づくと，Aさんが処分する機器の回収に伴う料金は総額で何円か。ここで，液晶ディスプレイ一体型PCだけに"]] },
  "2015h27a-q100": {
    jp: [
      ["stem", Q100_INS.jp, ""],
      ["stem", "Aさんが処分するPCにおいて,専用ソフトの説明書によって,そのソフトウェアの処理速度", "Aさんが処分するPCにおいて，専用ソフトの説明書によって，そのソフトウェアの処理速度"],
      ["stem", "何分か。ここで,専用ソフトの処理以外", "何分か。ここで，専用ソフトの処理以外"],
      ["stem", "\n\nア 120　　イ 140　　ウ 220　　エ 240", ""],
    ],
    zh: [["stem", Q100_INS.zh, ""], ["stem", "\n\nア 120　　イ 140　　ウ 220　　エ 240", ""]],
    en: [["stem", Q100_INS.en, ""], ["stem", "\n\na) 120　　b) 140　　c) 220　　d) 240", ""]],
  },
  // 2016h28a-q074: 源 p27 は “気温”表の…間で，…抽出条件として，。field の「、」も「，」に。
  "2016h28a-q074": { jp: [["stem",
    "「気温」表の2011年の7月1日から8月31日までの間で、最高気温が35度以上のレコードを全て抽出したい。抽出条件として、適切なものはどれか。",
    "“気温”表の2011年の7月1日から8月31日までの間で，最高気温が35度以上のレコードを全て抽出したい。抽出条件として，適切なものはどれか。"]] },
  // 2016h28a-q082: 源 p30 は 計算式“IF(B2≧50,'合格',…)” / “合格”。式中の ' は文字列リテラル (D-166、原典どおり)。en の「」は D-156 で “”。
  "2016h28a-q082": {
    jp: [
      ["stem", "計算式「IF(B2≧50,'合格',IF(C2≧50,'合格','不合格'))」を", "計算式“IF(B2≧50,'合格',IF(C2≧50,'合格','不合格'))”を"],
      ["stem", "において「合格」と表示された", "において“合格”と表示された"],
    ],
    en: [["stem", "The formula 「IF(B2≧50,'Pass',IF(C2≧50,'Pass','Fail'))」 is", "The formula “IF(B2≧50,'Pass',IF(C2≧50,'Pass','Fail'))” is"]],
  },
  // 2016h28h-q022: 源 p11 の B案 年間費用は運用・保守の 2 列にまたがる結合セル「初期費用の15%」1 つ。保守欄の「←（左に同じ）」は源に無い複写で、
  //   15% を運用・保守それぞれに計上する読みを誘う (S113 / B8 q004: 結合セルは展開しない)。配置を示す括弧「（運用・保守の合算）」は残す (B8 q004 裁定)。
  "2016h28h-q022": {
    jp: [["stem", "| 初期費用の15%（運用・保守の合算） | ←（左に同じ） |", "| 初期費用の15%（運用・保守の合算） |  |"]],
    zh: [["stem", "| 初期费用的15%（运行与维护合计） | ←（同左） |", "| 初期费用的15%（运行与维护合计） |  |"]],
    en: [["stem", "| 15% of initial cost (operation & maintenance combined) | ← (same as left) |", "| 15% of initial cost (operation & maintenance combined) |  |"]],
  },
  // 2016h28h-q020 (CLEAN 抽検で検出): 源 p10 の表「法人税，住民税及び事業税」。field に他の読点は無く「，」に揃えても割れない (B8 規則)。zh「、」は中文の正。
  "2016h28h-q020": { jp: [["stem", "| 法人税、住民税及び事業税 |", "| 法人税，住民税及び事業税 |"]] },
  // 2016h28h-q045: clean 無し (raw = 出荷層)。源 p21 は「…統制活動のことをいう。購買業務システムなどの」と同一行。
  "2016h28h-q045": { jp: [["stem", "のことをいう。 購買業務システム", "のことをいう。購買業務システム"]] },
  // 2016h28h-q096: 源 p44 は “成績”表 / “%” / 読点「，」。field の「、」も「，」に。
  "2016h28h-q096": {
    jp: [
      ["stem",
        "関係データベースの「成績」表から学生を抽出するとき、選択される学生数が最も多い抽出条件はどれか。ここで、「%」は0文字以上の任意の文字列を表すものとする。また、数学及び国語は、それぞれ60点以上であれば合格とする。",
        "関係データベースの“成績”表から学生を抽出するとき，選択される学生数が最も多い抽出条件はどれか。ここで，“%”は0文字以上の任意の文字列を表すものとする。また，数学及び国語は，それぞれ60点以上であれば合格とする。"],
      // 選択肢: 源は 国語が合格で，かつ，氏名が“%子”に該当する学生。ASCII " は源に無い (D-151 / D-156 の検索式除外より原典字形 D-155 を優先、源が “”)。
      ["ア", "国語が合格で、かつ、氏名が \"%子\" に該当する学生", "国語が合格で，かつ，氏名が“%子”に該当する学生"],
      ["イ", "国語が合格で、かつ、氏名が \"子%\" に該当する学生", "国語が合格で，かつ，氏名が“子%”に該当する学生"],
      ["ウ", "数学、国語ともに合格の学生", "数学，国語ともに合格の学生"],
      ["エ", "数学が合格で、かつ、氏名が \"%子%\" に該当する学生", "数学が合格で，かつ，氏名が“%子%”に該当する学生"],
    ],
    // zh / en の題幹は既に “%” → 選択肢も同じ字形に揃える (題内の字形統一)。
    zh: [["ア", " \"%子\" 的", "“%子”的"], ["イ", " \"子%\" 的", "“子%”的"], ["エ", " \"%子%\" 的", "“%子%”的"]],
    en: [["ア", "\"%子\"", "“%子”"], ["イ", "\"子%\"", "“子%”"], ["エ", "\"%子%\"", "“%子%”"]],
  },
  // 2016h28h-q054 イ: 源 p26「完了によって，売上の増加」。選択肢末尾の「。」の省略は exam 全体の型 (⑨)。
  "2016h28h-q054": { jp: [["イ", "完了によって売上の増加", "完了によって，売上の増加"]] },
  // 2017h29a-q018: 源 p09 の図題「Webページにおける検索技術と分析機能の展望」は括弧なし。
  "2017h29a-q018": {
    jp: [["stem", "\n\n「Webページにおける検索技術と分析機能の展望」\n\n", "\n\nWebページにおける検索技術と分析機能の展望\n\n"]],
    zh: [["stem", "\n\n“Web页面中检索技术与分析功能的展望”\n\n", "\n\nWeb页面中检索技术与分析功能的展望\n\n"]],
    en: [["stem", "\n\n\"Outlook for search technology and analysis functions on web pages\"\n\n", "\n\nOutlook for search technology and analysis functions on web pages\n\n"]],
  },
  // 2017h29a-q092: 源 p35 は 設定内容は，“所有者”，“所有者と同じグループの利用者”(改行)“その他の利用者”の順で。2 語目と 3 語目の間は
  //   源では改行のみだが、1 行に起こすと区切りが要るので「，」は残す (evidence §4b)。「」 の後の空白は除く。zh「」は ⑨-c、en は既に “”。
  "2017h29a-q092": { jp: [["stem", "設定内容は，「所有者」，「所有者と同じグループの利用者」，「その他の利用者」 の順で", "設定内容は，“所有者”，“所有者と同じグループの利用者”，“その他の利用者”の順で"]] },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  2016h28h-q080: 式の引用の ＊ ／ → * / (D-162。解説の ＊ ／ はすべて式の中 = 確認済み、B7 q086 と同型)。
//  2015h27a-q090: 式の引用「(B2−C2)」「(B$2−C$2)」の − (U+2212) → - (D-162 / D-159: U+2212 は数値の負に限る)。散文の「(売価 − 原価) × 販売数」は式でなく不変。
const EXPL = {
  "2016h28h-q080": { all: [["＊", "*"], ["／", "/"]] },
  "2015h27a-q090": { all: [["2−C", "2-C"]] },
};

const MARK = "fidfix-S130-x1";

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 語義是正 + 正解肢命中 + note が是正対象の字句・是正前の表示に言及。
//   語義: 2015h27a-q100 2016h28h-q022 / 正解肢命中: 2016h28h-q080 (ウ) 2016h28h-q096 (エ) 2017h29a-q092 (エ)
//   note 言及: 2015h27a-q026 (表は完全一致) q064 / q072 / 2017h29a-q018 (stem_jp_clean は源と一致) 2015h27a-q100 (stem_jp_clean が容量を復元)
//   追記しない: 2015h27a-q048 q085 2016h28a-q074 q082 2016h28h-q045 q054 (字形・空白のみ、note が是正対象に言及しない)
const NOTE_APPEND = {
  "2015h27a-q026": (p) => `（S130 X1: ${p} 実読で 表の AI 見出し行「| 項目 | 値 |」を削除（源は見出しなしの 2 列表、上記の「完全一致」は見出し行を除く）。期首帳簿価額 180,000 × 0.625 = 112,500 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2015h27a-q064": (p) => `（S130 X1: ${p} 実読で 題幹の「」と読点「、」を源の “入館履歴”・“建物”・‘東館’ と「，」に是正（上記の「stem_jp_clean と完全一致」は字形を除く）。B002 の降順 2 番目 = S0004 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2015h27a-q072": (p) => `（S130 X1: ${p} 実読で 題幹の表名の「」を源の “売上”・“顧客”・“商品” に是正（上記の「stem_jp_clean は完全一致」は字形を除く）。作成可は a と c = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2015h27a-q100": (p) => `（S130 X1 / D-168 趣旨: ${p} 実読で 題幹（jp / zh / en）の前文の後に置かれた源に無い AI 挿入段落（「Aさんは,これまで…HDDを内蔵するのは,次の2台である。・8G…・40G…」= 計算対象の HDD 内蔵 2 台を特定する先取り）と末尾の選択肢行の重複を削除。容量 8G / 40G は前文〔Aさんが処分する機器〕(1)(3) から読む（上記の「stem_jp_clean が容量を完全に復元」は前文の記載を指すものとして有効）。40 + 100 = 140分 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2015h27a-q090": (p) => `（S130 X1: ${p} 実読で 選択肢イ〜エ（zh / en・解説の式の引用も）の減算記号 −（U+2212）を D-162 により ASCII の - に揃えた（上記の (B2−C2)*D2 は是正前の字形）。イは**正解肢**だが演算子の字形のみの変更で、(B2-C2)*D2 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2016h28h-q022": (p) => `（S130 X1: ${p} 実読で 表の B案 保守欄に複写された「←（左に同じ）」を除去（源の「初期費用の15%」は運用・保守の 2 列にまたがる結合セル 1 つ、zh / en も）。上記の「運用・保守合算」の読みのとおり B案 = 2億 + 3,000万 × 10 = 5億で、B案 > C案 > A案 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2016h28h-q080": (p) => `（S130 X1: ${p} 実読で 選択肢ア〜エ（zh / en・解説も）の式の演算子 ＊ ／ を D-162 により ASCII の * / に揃えた。ウは**正解肢**だが演算子の字形のみの変更で、上記の導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2016h28h-q096": (p) => `（S130 X1: ${p} 実読で 題幹・選択肢の引用符と読点を源の “成績”・“%”・“%子” 等と「，」に是正（選択肢の ASCII " も、zh / en の選択肢も題幹の “” に揃えた）。エは**正解肢**だが字形のみの変更で、H003 / H004 / H005 の 3 名 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2017h29a-q018": (p) => `（S130 X1: ${p} 実読で 図題の「」（源は括弧なし、zh “” / en " も）を除去（上記の「stem_jp_clean は源と一致」は括弧を除く）。ロードマップ = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2017h29a-q092": (p) => `（S130 X1: ${p} 実読で 題幹の「」を源の “所有者” 等に、選択肢ア〜エの未設定記号「ー」（長音）を凡例・源の「－」に是正。エは**正解肢**だが記号の字形のみの変更で、その他の利用者 R－W－X○ = エという導出・correct_answer=エ は不変 — ${MARK}）`,
};
// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set([...Object.keys(FIX), "2016h28h-q080", "2017h29a-q092"].map((id) => id.split("-q")[0]))];
const noteExams = [...new Set(Object.keys(NOTE_APPEND).map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(noteExams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));
const pg = (id) => `page-${String(Barr.find((x) => x.id === id).source.page_number).padStart(2, "0")}`;

const T1 = new Map();
const layers = (id) => {
  const exam = id.split("-q")[0];
  const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`);
  if (!T1.has(t1f)) T1.set(t1f, existsSync(t1f) ? rj(t1f) : null);
  return {
    raw: [[Qdoc.questions.find((x) => x.id === id), "questions"], [Barr.find((x) => x.id === id), "question_bank"], [BY[exam].questions.find((x) => x.id === id), "by_year"]],
    t: TR[exam].questions[id], t1: T1.get(t1f),
  };
};

for (const [id, fx] of Object.entries(FIX)) {
  const { raw, t, t1 } = layers(id);
  for (const [field, from, to] of fx.jp ?? []) {
    if (field === "stem") {
      for (const [o, w] of raw) sub(o, "stem_jp", from, to, `${id} ${w}.stem_jp`);
      if (t?.stem_jp_clean) sub(t, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`);
      if (t1?.stem_jp_clean) sub(t1, "stem_jp_clean", from, to, `${id} .phase1 tr_.stem_jp_clean`);
    } else for (const [o, w] of raw) sub(o.choices_jp, field, from, to, `${id} ${w}.choices_jp.${field}`);
  }
  for (const lang of ["zh", "en"]) for (const [field, from, to] of fx[lang] ?? []) {
    if (field === "stem") { sub(t.stem, lang, from, to, `${id} translations.stem.${lang}`); if (t1) sub(t1.stem, lang, from, to, `${id} .phase1 tr_.stem.${lang}`); }
    else { sub(t.choices[field], lang, from, to, `${id} translations.choices.${field}.${lang}`); if (t1) sub(t1.choices.find((c) => c.letter === field), lang, from, to, `${id} .phase1 tr_.choices.${field}.${lang}`); }
  }
}

// 2017h29a-q092: 選択肢 jp の「:ー」→「:－」(raw 3 層)。
{
  const id = "2017h29a-q092"; const { raw } = layers(id);
  for (const [L, n] of Object.entries(Q092_DASH)) for (const [o, w] of raw) subAll(o.choices_jp, L, ":ー", ":－", `${id} ${w}.choices_jp.${L}`, n);
}
// 2015h27a-q090 (CLEAN 抽検で検出、中問B の設問側): 源 p40 の式 (B2－C2)*D2 等。表示の − (U+2212) は D-162 / D-159 で ASCII -。イ = **正解肢**。
{
  const id = "2015h27a-q090"; const { raw, t, t1 } = layers(id);
  for (const L of ["イ", "ウ", "エ"]) {
    for (const [o, w] of raw) subAll(o.choices_jp, L, "2−C", "2-C", `${id} ${w}.choices_jp.${L}`, 1);
    for (const lang of ["zh", "en"]) {
      subAll(t.choices[L], lang, "2−C", "2-C", `${id} translations.choices.${L}.${lang}`, 1);
      if (t1) subAll(t1.choices.find((c) => c.letter === L), lang, "2−C", "2-C", `${id} .phase1 tr_.choices.${L}.${lang}`, 1);
    }
  }
}
// 2016h28h-q080: 選択肢 ＊ ／ → * / (jp raw 3 層 + zh / en sidecar + .phase1)。
{
  const id = "2016h28h-q080"; const { raw, t, t1 } = layers(id);
  for (const [L, [nStar, nSlash]] of Object.entries(Q080_OPS)) {
    for (const [o, w] of raw) { subAll(o.choices_jp, L, "＊", "*", `${id} ${w}.choices_jp.${L}`, nStar); subAll(o.choices_jp, L, "／", "/", `${id} ${w}.choices_jp.${L}`, nSlash); }
    for (const lang of ["zh", "en"]) {
      const targets = [[t.choices[L], `translations.choices.${L}.${lang}`]];
      if (t1) targets.push([t1.choices.find((c) => c.letter === L), `.phase1 tr_.choices.${L}.${lang}`]);
      for (const [o, w] of targets) { subAll(o, lang, "＊", "*", `${id} ${w}`, nStar); subAll(o, lang, "／", "/", `${id} ${w}`, nSlash); }
    }
  }
}
for (const [f, d] of T1) if (d) wj(f, d);
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

for (const [id, ex] of Object.entries(EXPL)) {
  const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`);
  const j = rj(jf), tr = rj(tf);
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
  wj(jf, j); wj(tf, tr);
}

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk(pg(id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pg(id)}, round1 untouched)`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S130-x1: applied ${applied}, skipped ${skipped}`);
