#!/usr/bin/env node
// Stage 6 / Quiz — S129 B track **B8** (2011h23tokubetsu、100 問 / Sonnet 5 単 pass、D-150 §3) の差分を是正する。
// 源: S129 の workflow `wf_ee9ed363-965`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b8_2011h23tokubetsu_sn.json
//     マニフェスト = data/ip/quiz/.phase2/b8_fidelity_input_2011h23tokubetsu.json (precrop 69/100、skip 31 = page_mismatch 31 (OI-1、小問 19 + 中問 12))
//     機械 diff (S128 L1a 改修版) = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 477 / AGENT_MISSED 10 / QUOTE_ASCII 0 / TRANSCRIPT_PREFIX 0 / VERDICT_CONFLICT 0
//                 実残差 = q032 ア (読点の脱落)。q015 ア〜エ (選択肢の図の言語化)・q097 (図1 の言語化)・中問前文 (q094 / q095 / q099 / q100) は不変。
//
// 層・方針は quiz-fidfix-S122-u3a 〜 S129-b7 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2011h23tokubetsu の sidecar のキーは `stem` / `choices` / `stem_jp_clean`。`choices_jp_clean` は無い → 選択肢は raw 3 層が出荷層。
// 中問 3 組 (A〜C) は前文埋め込み済み。前文領域は触らず、from は設問文側の部分一致。
// 読点: この exam の出荷層は ASCII「, 」の題が多い (⑨、不変)。脱落した読点を補うときは同じ field の既存の字種に揃え、
//       field に読点が無い / 「、」だけの field は源の「，」にする。
//
// 適用ループは B7 から流用し、解説 correct の zh / en 置換 2 行と points の置換 (q098) だけを追加した。
//
// 採用した差分 (evidence §6。源 crop / 源ページを原寸で独立実読して確認):
//   q001 stem  (p03) 「著作権の侵害」→ 源「著作権侵害」
//   q004 stem  (p04) 最下段のベンダ列に複写された「契約締結」を除去 (S113、括弧書きの配置記述は残す (S129 裁定)、zh / en 追随)
//   q020 エ    (p09) 「知りながら」→ 源「知っていながら」(**正解肢**)
//   q022 stem  (p09) 「2400 万円」→ 源「2,400 万円」(zh 追随)
//   q024 stem  (p10) 読点「、」×3 → 源「，」
//   q025 エ    (p10) 「パリュー」→ 源「バリュー」(解説エの注記を削除)
//   q027 イ    (p11) 「ガパナンス」→ 源「ガバナンス」(解説イの注記を削除)
//   q029 エ    (p11) 末尾の「「」を削除
//   q032 ア    (p12) 「販売し落札者」→ 源「販売し，落札者」(field の字種「, 」)
//   q033 ア    (p13) 「場合.,」→「場合,」
//   q035 stem  (p13) 「。 IT」の空白
//   q041 stem  (p15) 読点「、」×2 → 源「，」
//   q044 stem  (p16) 「是正や新しい」→ 源「是正や，新しい」(field の字種「, 」)
//   q049 stem  (p18) 読点「、」→ 源「，」
//   q052 stem  (p19) 「適 切」の空白
//   q054 stem  (p19) 「場合 システム」→ 源「場合，システム」(field の字種「, 」)
//   q059 / q062 / q073 stem (p21 / p22 / p26) 「」→ 源 “”
//   q060 stem  (p21) 「何回 実行」の空白
//   q087 stem  (p30) 「機能に当たらないもの」→ 源「機能にないもの」
//   q094 stem  (p37) 読点「、」×7 → 源「，」
//   q096 stem  (p38) 「1日券,2日券」→ 源「，」、「〔処理内容〕の②」→ 源「(2)」、見出し〔配列の値〕を補う (zh / en 追随)
//   q098 エ    (p40) 「1200dpi」→ 源「1,200dpi」(zh / en も)
//   q100 stem  (p42) 〔ファイルの指定方法〕(1)〜(5) の「」→ 源 “” (￥ / . の字幅は不変、S129 裁定)、
//                    HTML の src="…" は源の ASCII " (D-155、jp / zh / en と解説 correct)、zh の〔技术类〕を除去
//
// Run: node scripts/quiz-fidfix-S129-b8.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S129-b8.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2011h23tokubetsu
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
  // q001: clean 無し (raw = 出荷層)。源 p03 は「著作権侵害」。zh / en は源の意味で可 → 不追随。
  "2011h23tokubetsu-q001": { jp: [["stem", "著作権の侵害となるもの", "著作権侵害となるもの"]] },
  // q004: 源 p04 の最下段「契約締結」はユーザ・ベンダ両枠にまたがる 1 箱。表への起こしは他の段が図と一致 → 体裁として不変。
  //   ベンダ列の「契約締結」は結合セルの複写 → 除去 (S113 結合セルは展開しない)。「（ユーザ・ベンダ両者にまたがる）」は複写セル除去で失われる
  //   配置情報を 1 回だけ担う事実記述 (推論ではない) → 残す (S129 主 context 裁定)。
  "2011h23tokubetsu-q004": {
    jp: [["stem", "| 契約締結（ユーザ・ベンダ両者にまたがる） | 契約締結 |", "| 契約締結（ユーザ・ベンダ両者にまたがる） |  |"]],
    zh: [["stem", "| 签订合同（横跨用户与供应商双方） | 签订合同 |", "| 签订合同（横跨用户与供应商双方） |  |"]],
    en: [["stem", "| Conclude contract (spans both User and Vendor) | Conclude contract |", "| Conclude contract (spans both User and Vendor) |  |"]],
  },
  // q022: 源 p09 は「2,400 万円」。「／」「％」の字幅と ASCII 読点は exam 全体の型で不変。en は "24 million yen" で可。
  "2011h23tokubetsu-q022": {
    jp: [["stem", "初期投資額は 2400 万円", "初期投資額は 2,400 万円"]],
    zh: [["stem", "初期投资额为 2400 万日元", "初期投资额为 2,400 万日元"]],
  },
  "2011h23tokubetsu-q024": { jp: [["stem", "大規模な災害などによって、企業活動を支える重要な情報システムに障害が発生したような場合でも、企業活動の継続を可能にするために、あらかじめ", "大規模な災害などによって，企業活動を支える重要な情報システムに障害が発生したような場合でも，企業活動の継続を可能にするために，あらかじめ"]] },
  // q035 / q052 / q060: 改行由来の空白 (R8b)。q052 / q060 は clean 無し (raw = 出荷層)。
  "2011h23tokubetsu-q035": { jp: [["stem", "報告された。 IT サービス", "報告された。IT サービス"]] },
  "2011h23tokubetsu-q041": { jp: [["stem", "生産性であるとき、20日以下で作業を完了するためには、少なくとも", "生産性であるとき，20日以下で作業を完了するためには，少なくとも"]] },
  // q044 / q054: 脱落した読点を field の既存字種「, 」で補う。raw の「是正や。 新しい」は非出荷 (N5)。
  "2011h23tokubetsu-q044": { jp: [["stem", "障害の是正や新しい要件", "障害の是正や, 新しい要件"]] },
  "2011h23tokubetsu-q049": { jp: [["stem", "行う場合、システムの機能", "行う場合，システムの機能"]] },
  "2011h23tokubetsu-q052": { jp: [["stem", "最も適 切なもの", "最も適切なもの"]] },
  "2011h23tokubetsu-q054": { jp: [["stem", "行う場合 システムテストの目的", "行う場合, システムテストの目的"]] },
  // q059 / q062 / q073: 源は “”。zh「」は ⑨-c、en は既に “”。raw の ASCII " は非出荷 (B7 規則で resolved)。
  "2011h23tokubetsu-q059": { jp: [["stem", "管理された「社員」表から選択した結果が，「高橋二郎」を含む", "管理された“社員”表から選択した結果が，“高橋二郎”を含む"]] },
  "2011h23tokubetsu-q060": { jp: [["stem", "何回 実行できるか", "何回実行できるか"]] },
  "2011h23tokubetsu-q062": { jp: [["stem", "「空港」表と「ダイヤ」表がある", "“空港”表と“ダイヤ”表がある"]] },
  "2011h23tokubetsu-q073": { jp: [["stem", "改行コード「CR」を使用", "改行コード“CR”を使用"]] },
  // q087: 源 p30 は「機能にないもの」(太字)。clean の「当たらない」は raw の OCR「たない」からの再構成。zh「不属于」/ en "NOT a feature" は可 → 不追随。
  "2011h23tokubetsu-q087": { jp: [["stem", "USB 2.0 の機能に当たらないものはどれか", "USB 2.0 の機能にないものはどれか"]] },
  // q094: 源 p37 は「，」。表1 の「J＋K」は q093 の ＋ 群と揃ったまま不変 (⑨)。
  "2011h23tokubetsu-q094": {
    jp: [
      ["stem", "関数のテストを行うために、条件", "関数のテストを行うために，条件"],
      ["stem", "網掛けの部分は、表示していない。", "網掛けの部分は，表示していない。"],
      ["stem", "Yは条件に該当し、Nは条件に該当しない。Xは処理を実行し、－は処理を実行しない。例えば①の場合、三つの", "Yは条件に該当し，Nは条件に該当しない。Xは処理を実行し，－は処理を実行しない。例えば①の場合，三つの"],
      // PHASE 2 の残存語走査で追加 (注記2 後半の 2 か所)。
      ["stem", "結果が、Y，Y，Yとなったとき、合計金額", "結果が，Y，Y，Yとなったとき，合計金額"],
    ],
  },
  // q096: 源 p38 は「1 日券，2 日券」「〔処理内容〕の (2)」、配列値の前に見出し〔配列の値〕。「J=10, K=20」・TP 列の読点は式の体裁で不変。
  "2011h23tokubetsu-q096": {
    jp: [
      ["stem", "1日券,2日券といった", "1日券，2日券といった"],
      ["stem", "〔処理内容〕の②及び", "〔処理内容〕の(2)及び"],
      ["stem", "チケット金額を決定する。\nTP(1, 1)", "チケット金額を決定する。\n〔配列の値〕\nTP(1, 1)"],
    ],
    zh: [
      ["stem", "〔处理内容〕的②及", "〔处理内容〕的(2)及"],
      ["stem", "来确定票价。\nTP(1, 1)", "来确定票价。\n〔数组的值〕\nTP(1, 1)"],
    ],
    en: [
      ["stem", "the specifications of ② in the [processing details]", "the specifications of (2) in the [processing details]"],
      ["stem", "to determine the ticket price.\nTP(1, 1)", "to determine the ticket price.\n[Array values]\nTP(1, 1)"],
    ],
  },
  // q100: 〔ファイルの指定方法〕の引用符のみ源 “” に。￥ / . の字幅は S129 裁定 (B2 2014h26h-q068 / B7 q063) どおり不変。
  //   src="…" は HTML の構文で源も ASCII " → D-166 (コード片・HTML 属性内の引用符は源の ASCII " を保つ) で jp / zh / en とも ASCII "。
  //   zh の〔技术类〕は jp / en に無い分野見出しの残り (S117 normalize で除去済みの型) → 除去。zh (1)〜(5) の「」は ⑨-c、en は既に “”。
  "2011h23tokubetsu-q100": {
    jp: [
      ["stem", "src=「ファイル名」で指定した", "src=\"ファイル名\"で指定した"],
      ["stem", "(1)　ファイルは，「ディレクトリ名￥…￥ディレクトリ名￥ファイル名」のように，経路上のディレクトリを順に「￥」で区切って並べた後に「￥」とファイル名", "(1)　ファイルは，“ディレクトリ名￥…￥ディレクトリ名￥ファイル名”のように，経路上のディレクトリを順に“￥”で区切って並べた後に“￥”とファイル名"],
      ["stem", "(2)　カレントディレクトリは「.」で表す。", "(2)　カレントディレクトリは“.”で表す。"],
      ["stem", "(3)　1階層上のディレクトリは「..」で表す。", "(3)　1階層上のディレクトリは“..”で表す。"],
      ["stem", "(4)　始まりが「￥」のときは", "(4)　始まりが“￥”のときは"],
      ["stem", "(5)　始まりが「￥」，「.」，「..」のいずれでもないときは，左端にカレントディレクトリ配下であることを示す「.￥」が", "(5)　始まりが“￥”，“.”，“..”のいずれでもないときは，左端にカレントディレクトリ配下であることを示す“.￥”が"],
      ["stem", "<img src=「 　　a　　 ￥s01.jpeg 」 … >", "<img src=\" 　　a　　 ￥s01.jpeg \" … >"],
    ],
    zh: [
      ["stem", "\n\n〔技术类〕\n", "\n\n"],
      ["stem", "由 src=「文件名」 所指定", "由 src=\"文件名\" 所指定"],
      ["stem", "<img src=「 　　a　　 ￥s01.jpeg 」 … >", "<img src=\" 　　a　　 ￥s01.jpeg \" … >"],
    ],
    en: [
      ["stem", "specified by src=“file name”.", "specified by src=\"file name\"."],
      ["stem", "<img src=「 　　a　　 ￥s01.jpeg 」 … >", "<img src=\" 　　a　　 ￥s01.jpeg \" … >"],
    ],
  },
  // ── 選択肢 ──────────────────────────────────────────────────────────────────
  // q020: **正解肢**。zh「明知」/ en "knowing" は源の意味で可 → 不追随。
  "2011h23tokubetsu-q020": { jp: [["エ", "知りながら，自社で使用した", "知っていながら，自社で使用した"]] },
  "2011h23tokubetsu-q025": { jp: [["エ", "パリューチェーン分析", "バリューチェーン分析"]] },
  "2011h23tokubetsu-q027": { jp: [["イ", "IT ガパナンス", "IT ガバナンス"]] },
  "2011h23tokubetsu-q029": { jp: [["エ", "広告が表示される。「", "広告が表示される。"]] },
  // q032: field に読点が無いので同題ウの字種「, 」に揃える (源は「，」)。
  "2011h23tokubetsu-q032": { jp: [["ア", "商品を販売し落札者から", "商品を販売し, 落札者から"]] },
  "2011h23tokubetsu-q033": { jp: [["ア", "追加する場合., クリティカル", "追加する場合, クリティカル"]] },
  "2011h23tokubetsu-q098": {
    jp: [["エ", "1200dpi", "1,200dpi"]],
    zh: [["エ", "1200dpi", "1,200dpi"]],
    en: [["エ", "1200dpi", "1,200dpi"]],
  },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  q025 エ / q027 イ: why_wrong の括弧書きは是正前の選択肢の OCR 崩れ (パリュー / ガパナンス) を説明している → 是正後は不整合なので削除 (jp / zh / en)。
//  q098: 選択肢エの値の引用「1200dpi」→「1,200dpi」(correct / エ / points[1]、jp / zh / en)。
//  q100 correct: src=「…」/ src=“…” → 題幹と同じく ASCII " (コード片)。説明文中の「￥」等の引用は解説の地の文なので不変。
const EXPL = {
  "2011h23tokubetsu-q025": {
    dist: {
      エ: {
        // 2 本目は Rule D NIT-2: 括弧書き削除後に残った半角空白。
        jp: [[" (選択肢の表記「パリューチェーン分析」は「バリューチェーン分析」のこと)", ""], ["バリューチェーン分析 は、", "バリューチェーン分析は、"]],
        zh: ["（选项中印成的「パリューチェーン分析」实际是「バリューチェーン分析」，即价值链分析）", ""],
        en: [" (the choice is printed as パリューチェーン分析, which stands for バリューチェーン分析, value chain analysis)", ""],
      },
    },
  },
  "2011h23tokubetsu-q027": {
    dist: {
      イ: {
        jp: [[" (原文の「ガパナンス」は字形の誤り)", ""], ["IT ガバナンス を確立", "IT ガバナンスを確立"]],
        zh: [" (原文中的「ガパナンス」是「ガバナンス」的字形讹误)", ""],
        en: [" (the ガパナンス in the original text is a character-shape error for ガバナンス)", ""],
      },
    },
  },
  // q098: 解説が選択肢エの値「1200dpi」を引用している箇所を選択肢と同じ「1,200dpi」に (PHASE 2 の残存語走査で追加)。計算式の「1200²」は不変。
  "2011h23tokubetsu-q098": {
    correct: {
      jp: ["1200dpi では 18 × 1200²", "1,200dpi では 18 × 1200²"],
      zh: ["1200dpi 为 18 × 1200²", "1,200dpi 为 18 × 1200²"],
      en: ["and 1200dpi gives 18 × 1200²", "and 1,200dpi gives 18 × 1200²"],
    },
    dist: {
      エ: {
        jp: ["1200dpi では縦", "1,200dpi では縦"],
        zh: ["1200dpi 时为纵", "1,200dpi 时为纵"],
        en: ["At 1200dpi the image", "At 1,200dpi the image"],
      },
    },
    points: {
      1: {
        jp: ["1200dpi は 12² = 144 倍", "1,200dpi は 12² = 144 倍"],
        zh: ["1200dpi 是 12² = 144 倍", "1,200dpi 是 12² = 144 倍"],
        en: ["and 1200dpi is 12² = 144 times", "and 1,200dpi is 12² = 144 times"],
      },
    },
  },
  "2011h23tokubetsu-q100": {
    correct: {
      jp: ["src=「..￥..￥tgazou￥s01.jpeg」", "src=\"..￥..￥tgazou￥s01.jpeg\""],
      zh: ["src=「..￥..￥tgazou￥s01.jpeg」", "src=\"..￥..￥tgazou￥s01.jpeg\""],
      en: ["src=“..￥..￥tgazou￥s01.jpeg”", "src=\"..￥..￥tgazou￥s01.jpeg\""],
    },
  },
};

const MARK = "fidfix-S129-b8";
const pg = (id) => { const b = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8")).questions.find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 語義是正 + 正解肢命中 + note が腐敗 / 是正対象の字句を述べている題。
//   語義: q001 q004 q020 q025 q027 q087 q096 / 正解肢命中: q020 (エ、語形)
//   note 言及: q001 (stem を引用) q004 (複写セルのある表を「矛盾しない」) q022 (2400 を引用) q024 (「、」の clean を引用) q025 / q027 (字形 OCR 誤り)
//              q032 (読点なしの推定文) q033 (「場合., 」) q035 / q052 / q060 (空白入りの stem を引用) q044 / q054 (読点の脱落した clean を引用)
//              q073 (「CR」と翻刻) q087 (「当たらない」を是正済みと記述) q096 (「②」) q098 (エ 1200dpi)
//   追記しない (字種のみで note に言及なし): q029 q041 q049 q059 q062 q094 q100
const NOTE_APPEND = {
  "2011h23tokubetsu-q001": (p) => `（S129 B8: ${p} 実読で 題幹の「著作権の侵害」を源の「著作権侵害」に是正（上記の引用は是正前の文言）。HTML ソースの流用による Web ページ作成 = 複製・翻案 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2011h23tokubetsu-q004": (p) => `（S129 B8: ${p} 実読で 表の最下段のベンダ列に複写された「契約締結」を除去（結合セルは展開しない。配置を示す括弧書きは残す。zh / en も追随）。RFP 作成の次・調達先候補の選定の前 = 調達先選定基準作成 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2011h23tokubetsu-q020": (p) => `（S129 B8: ${p} 実読で 選択肢エの「知りながら」を源の「知っていながら」に是正。エは**正解肢**だが語形のみの変更で、営業秘密と知って取得・使用 = 不正競争 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2011h23tokubetsu-q022": (p) => `（S129 B8: ${p} 実読で 題幹の「2400 万円」を源の「2,400 万円」に是正（zh も）。2,400 ÷ (1,200 − 240 − 360) = 4 年 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2011h23tokubetsu-q024": (p) => `（S129 B8: ${p} 実読で clean の読点「、」×3 を源の「，」に是正（上記の引用は是正前の字種）。事業継続計画 = BCP = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2011h23tokubetsu-q025": (p) => `（S129 B8: ${p} 実読で 上記の選択肢エの「パリューチェーン分析」を源の「バリューチェーン分析」に是正済み（解説エの表記注記も削除）。閲覧回数・移動履歴の分析 = アクセスログ分析 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2011h23tokubetsu-q027": (p) => `（S129 B8: ${p} 実読で 上記の選択肢イの「IT ガパナンス」を源の「IT ガバナンス」に是正済み（解説イの字形注記も削除）。ツールの使用・活用方法の研修 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2011h23tokubetsu-q032": (p) => `（S129 B8: ${p} 実読で 選択肢アの「販売し落札者から」に源の読点を補い「販売し, 落札者から」に是正（同題の字種に揃えた）。他人の ID・パスワードの無断使用 = 不正アクセス = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2011h23tokubetsu-q033": (p) => `（S129 B8: ${p} 実読で 上記の選択肢アの「場合., 」の余分な「.」を除去済み。クリティカルパス上の作業の遅延 = プロジェクト完了の遅延 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2011h23tokubetsu-q035": (p) => `（S129 B8: ${p} 実読で 題幹の「報告された。 IT」の空白を除去（上記の引用は是正前の文言）。インシデント管理 = 業務の早期回復 = 再起動手順の指示 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2011h23tokubetsu-q044": (p) => `（S129 B8: ${p} 実読で clean の「是正や新しい要件」に源の読点を補い「是正や, 新しい要件」に是正（上記の引用は是正前の文言）。稼働後の障害是正・機能拡張 = ソフトウェア保守 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2011h23tokubetsu-q052": (p) => `（S129 B8: ${p} 実読で 題幹の「最も適 切」の空白を除去（上記の引用は是正前の文言）。規模見積りの基礎 = 画面数と帳票数 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2011h23tokubetsu-q054": (p) => `（S129 B8: ${p} 実読で 題幹の「場合 システムテスト」に源の読点を補い「場合, システムテスト」に是正（上記の引用は是正前の文言）。開発者によるシステム全体の機能・性能の検証 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2011h23tokubetsu-q060": (p) => `（S129 B8: ${p} 実読で 題幹の「何回 実行」の空白を除去（上記の引用は是正前の文言）。1.6 GHz ÷ 4 = 4 億回 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2011h23tokubetsu-q073": (p) => `（S129 B8: ${p} 実読で 題幹の「CR」の引用符を源の “” に是正（上記の「「CR」と翻刻」は是正前の字種）。行内はカンマ・行末は CR = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2011h23tokubetsu-q087": (p) => `（S129 B8: ${p} 実読で clean の「機能に当たらないもの」を源（太字）の「機能にないもの」に是正（上記の「当たらない」で是正済みとの記述は源と異なる再構成）。USB はシリアル転送 = パラレル転送 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2011h23tokubetsu-q096": (p) => `（S129 B8: ${p} 実読で clean の「〔処理内容〕の②」を源の「(2)」に、「1日券,2日券」の読点を源の「，」に是正し、源の見出し〔配列の値〕を補った（zh / en も ② と見出しを追随）。(10×4,000 + 20×1,500) × 0.9 = 63,000 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2011h23tokubetsu-q098": (p) => `（S129 B8: ${p} 実読で 選択肢エの「1200dpi」を源の「1,200dpi」に是正（zh / en も）。200k バイト以下で最も高い解像度 = 100dpi = イという導出・correct_answer=イ は不変 — ${MARK}）`,
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
  if (ex.correct?.jp) sub(j, "correct_jp", ex.correct.jp[0], ex.correct.jp[1], `${id} expl_jp.correct`);
  if (ex.correct?.zh) sub(tr.correct, "zh", ex.correct.zh[0], ex.correct.zh[1], `${id} expl_tr.correct.zh`);
  if (ex.correct?.en) sub(tr.correct, "en", ex.correct.en[0], ex.correct.en[1], `${id} expl_tr.correct.en`);
  for (const [L, d] of Object.entries(ex.dist ?? {})) {
    const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    if (!dj || !dt) throw new Error(`${id} distractor ${L} missing`);
    if (d.jp) for (const [f, t] of Array.isArray(d.jp[0]) ? d.jp : [d.jp]) sub(dj, "why_wrong_jp", f, t, `${id} expl_jp.${L}`);
    if (d.zh) sub(dt, "zh", d.zh[0], d.zh[1], `${id} expl_tr.${L}.zh`);
    if (d.en) sub(dt, "en", d.en[0], d.en[1], `${id} expl_tr.${L}.en`);
  }
  for (const [i, d] of Object.entries(ex.points ?? {})) {
    if (d.jp) sub(j.points_jp, i, d.jp[0], d.jp[1], `${id} expl_jp.points.${i}`);
    if (d.zh) sub(tr.points[i], "zh", d.zh[0], d.zh[1], `${id} expl_tr.points.${i}.zh`);
    if (d.en) sub(tr.points[i], "en", d.en[0], d.en[1], `${id} expl_tr.points.${i}.en`);
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S129-b8: applied ${applied}, skipped ${skipped}`);
