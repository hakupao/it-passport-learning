#!/usr/bin/env node
// Stage 6 / Quiz — S129 B track **B13** (2009h21a、100 問 / Sonnet 5 単 pass、D-150 §3、B track 最終 exam) の差分を是正する。
// 源: S129 の workflow `wf_c0386502-b77`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b13_2009h21a_sn.json
//     マニフェスト = data/ip/quiz/.phase2/b13_fidelity_input_2009h21a.json (precrop 56/100、q093 は page-37 / prev page-36 に patch 済みの版)
//     機械 diff (S128 L1a 改修版) = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 467 / AGENT_MISSED 11 / REPORTED 22 / TRANSCRIPT_PREFIX 0 / QUOTE_ASCII 0 / VERDICT_CONFLICT 0 / UNREADABLE 0 (exit 0)
//                 実残差 = q017 表の 〇 (源 ○)。q060 ア〜エ は表セルの 1 列ずれ (値は源と 4/4 一致)、q089 DFD 言語化、
//                 q090〜q092 / q094 / q099 は中問前文 (前文頁不可視の既知型)。
//
// 層・方針は quiz-fidfix-S122-u3a 〜 S129-b12 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2009h21a の sidecar のキーは `stem` / `choices` / `stem_jp_clean`。`choices_jp_clean` は無い → 選択肢は raw 3 層が出荷層。
// 中問 3 組 (A q089〜q092 / B q093〜q096 / C q097〜q100) は前文埋め込み済み (抽出組)。前文領域は触らず、from は設問文側の部分一致。
// 読点: この exam の出荷層は ASCII「, 」の題が多い (⑨、不変)。「、」は源の「，」に、field の既存字種に揃える (B8 規則)。
//
// 適用ループは B10 から流用し、bank page pointer (B11) と解説の一括置換 subAll (B11) を足した。
//
// 採用した差分 (evidence §4。源 crop / 源ページを原寸で独立実読して確認):
//   q008 エ (p05) 生産委託 → 生産受託 (意味が逆、zh / en・解説も追随)     q018 ア〜エ (p08) OCR 残骸 4 肢 (エ = **正解肢**)
//   q073 イ (p27) パックドア → バックドア     q086 イ (p31) 2 系続 → 2 系統 (**正解肢**)
//   q048 ア〜エ (p18) 図の言語化 + 解釈の括弧 →「図ア」〜「図エ」(B10 q088 と同じ扱い、添付図に 4 肢、ア = **正解肢**)
//   q005 ア (**正解肢**) / イ (crop) 末尾の残骸     q015 イ (crop) 納品まで → 納品するまで
//   q017 表の 〇 → ○ (p08、zh / en・解説も)     q044 題幹 「」→“”・区切り「，」、付加文「手順は次の流れになっている。」削除 (D-158、zh / en も)
//   q060 題幹 「」→“”・「、」→「，」 (選択肢の表題「味覚符号表（行ア）:」は不変、下記)     q062 題幹「tmb」→“tmb”
//   q082 エ 5000 → 5,000 (zh / en・解説も)     q093 ア〜エ ／ ＊ → / * (D-162、イ = **正解肢**、zh / en・解説も)
//   q094 ア〜エ “商品え” 等の引用符 (ウ = **正解肢**)     q095〔条件〕(3) I2＋H3 → I2+H3 (D-162、zh / en も)
//   q089 題幹の DFD 言語化の記号種別ラベル除去 (D-168、zh / en も)     q007 / q096 題幹の空白 (源は同一行)     q093 bank page pointer page-36 → page-37 (question_bank / by_year)
//
// Run: node scripts/quiz-fidfix-S129-b13.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S129-b13.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2009h21a
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

// q018: 源 p08。4 肢とも OCR 残骸 (語の誤読 + 「ーー」「「」「.」「・」等)。field の読点字種「, 」は保つ (⑨)。
const Q018 = {
  "ア": ["一会肝期間ごとに決算を行い, 貸借対了表や損益計算書などの財務諸表の作成が   ーー強制される。                   「-                         .", "一会計期間ごとに決算を行い, 貸借対照表や損益計算書などの財務諸表の作成が強制される。"],
  "イ": ["企業の経営者が, 株主や債権者などの企業外部の利害関係者に対して会計報告を ・行う。         「", "企業の経営者が, 株主や債権者などの企業外部の利害関係者に対して会計報告を行う。"],
  "ウ": ["凡務賭表規則や企業会計原則, 各種会計基準などの会計法規に準拠した会計処理 「ーーー     を行う必要がある。", "財務諸表規則や企業会計原則, 各種会計基準などの会計法規に準拠した会計処理を行う必要がある。"],
  "エ": ["部門, 製品, 地域別などの予算統制, 利益管理, 業績評価など, 経営判断のため .の内部報告書を作成する。ここる ーー", "部門, 製品, 地域別などの予算統制, 利益管理, 業績評価など, 経営判断のための内部報告書を作成する。"],
};
// q048: 源 p18 の選択肢はグラフ 4 枚 (文字なし)。言語化の括弧は「設計から運用に向けて対応費用が増加」等と本問の判断 (後工程ほど修正費用増)
//   をそのまま文章で与え、ウは図とも食い違う (V の底は製造とテストの間) → B10 q088 と同じく「図ア」〜「図エ」に置換。
//   添付図 (quiz-figures/2009h21a-q048.webp) に 4 肢がア〜エのラベル付きで載っていることを確認済み。
const Q048 = {
  "ア": ["右肩上がりの曲線（設計から運用に向けて対応費用が増加）", "向右上扬的曲线（从设计到运行，对应费用逐渐增加）", "An upward-sloping curve (correction cost increases from design toward operation)"],
  "イ": ["右肩下がりの曲線（設計段階が最も高く運用に向けて減少）", "向右下降的曲线（设计阶段最高，向运行阶段逐渐减少）", "A downward-sloping curve (highest at the design stage, decreasing toward operation)"],
  "ウ": ["V字型の曲線（テスト段階が最も低い）", "V 字形曲线（测试阶段最低）", "A V-shaped curve (lowest at the test stage)"],
  "エ": ["階段状の曲線（運用段階で急増）", "阶梯状曲线（在运行阶段急剧上升）", "A step-shaped curve (rises sharply at the operation stage)"],
};
// q093: 源 p37 は C2／B2 等 (全角)。D-162 で式の演算子は ASCII。zh / en も同じ文字列。
const Q093 = { "ア": ["C2／B2", "C2/B2"], "イ": ["D2／B2", "D2/B2"], "ウ": ["D12／B12＊B2", "D12/B12*B2"], "エ": ["D2／D12", "D2/D12"] };

const FIX = {
  // ── 題幹 ────────────────────────────────────────────────────────────────────
  // q007: clean 無し (raw = 出荷層)。源 p05 は「…定期発注方式という。この定期発注方式で」と同一行。
  "2009h21a-q007": { jp: [["stem", "定期発注方式という。 この定期発注方式で", "定期発注方式という。この定期発注方式で"]] },
  // q017: 源 p08 の表の記号は ○ (U+25CB)。clean / zh / en とも 〇 (U+3007)。raw は OCR 崩れで別文 → 行の文脈付き from で skip させる。
  "2009h21a-q017": {
    jp: [
      ["stem", "を設置する施設 | 〇 |", "を設置する施設 | ○ |"],
      ["stem", "| 設置するコンピュータや通信機器 | 〇 |", "| 設置するコンピュータや通信機器 | ○ |"],
      ["stem", "業務アプリケーション |  | 〇 |", "業務アプリケーション |  | ○ |"],
    ],
    zh: [
      ["stem", "通信设备的场所 | 〇 |", "通信设备的场所 | ○ |"],
      ["stem", "| 所安放的计算机和通信设备 | 〇 |", "| 所安放的计算机和通信设备 | ○ |"],
      ["stem", "业务应用程序 |  | 〇 |", "业务应用程序 |  | ○ |"],
    ],
    en: [
      ["stem", "equipment are installed | 〇 |", "equipment are installed | ○ |"],
      ["stem", "equipment to be installed | 〇 |", "equipment to be installed | ○ |"],
      ["stem", "running on the computers |  | 〇 |", "running on the computers |  | ○ |"],
    ],
  },
  // q044: 源 p16 は “変更内容の評価”，“変更の指示”，“変更の反映”，“変更要求の受付”。「手順は次の流れになっている。」は源に無い付加文 (D-158)。
  //   箱 4 つの言語化「[　　] → [ A ] → …」は描画補助として不変。zh「」は ⑨-c、en は既に “”。
  "2009h21a-q044": {
    jp: [
      ["stem", "要素を「変更内容の評価」「変更の指示」「変更の反映」「変更要求の受付」としたとき", "要素を“変更内容の評価”，“変更の指示”，“変更の反映”，“変更要求の受付”としたとき"],
      ["stem", "どれか。\n\n手順は次の流れになっている。\n\n[　　]", "どれか。\n\n[　　]"],
    ],
    zh: [["stem", "哪一项？\n\n步骤的流程如下。\n\n[　　]", "哪一项？\n\n[　　]"]],
    en: [["stem", "procedure?\n\nThe procedure flows as follows.\n\n[　　]", "procedure?\n\n[　　]"]],
  },
  // q060: 源 p23 は “甘味”，“うま味”，… と「，」。clean は「」と「、」。「甘味」が 3 回出るので題幹全体を from にする (raw は ASCII " で別文 → skip)。
  //   選択肢の「[表] 味覚符号表（行ア）:」の表題は源に無い AI ラベル (D-158 候補、zh / en には無い) だが、apps/web の quizRichText.test.ts が
  //   caption 付き表の corpus 標本としてこの題を固定している → 本 unit では不変 (⑨、lead 判断)。表の値は源と 4/4 一致。
  "2009h21a-q060": {
    jp: [
      ["stem",
        "「甘味」「うま味」「塩味」「酸味」「苦味」の5種類の味覚を、6ビット（2進数で6けた）の数値で符号化する。これらを組み合わせた複合味を、数値の加減算で表現できるようにしたい。例えば、「甘味」と「酸味」を組み合わせた「甘酸っぱい」という複合味の符号を、それぞれの数値を加算して表現するとともに、逆に「甘酸っぱい」から「甘味」成分を取り除いた「酸味」を減算で表現できるようにしたい。味覚の符号として、適切なものはどれか。",
        "“甘味”，“うま味”，“塩味”，“酸味”，“苦味”の5種類の味覚を，6ビット（2進数で6けた）の数値で符号化する。これらを組み合わせた複合味を，数値の加減算で表現できるようにしたい。例えば，“甘味”と“酸味”を組み合わせた“甘酸っぱい”という複合味の符号を，それぞれの数値を加算して表現するとともに，逆に“甘酸っぱい”から“甘味”成分を取り除いた“酸味”を減算で表現できるようにしたい。味覚の符号として，適切なものはどれか。"],
    ],
  },
  // q062: 源 p24 は “tmb”。zh「」は ⑨-c、en は既に “”。
  "2009h21a-q062": { jp: [["stem", "結果が「tmb」であるとき", "結果が“tmb”であるとき"]] },
  // q089 (D-168): 題幹の DFD 言語化 (設問文の後、中問A 前文 = registry probe / 共通接頭 466 字の外) が a を「データストア」、b を「処理（プロセス）」と
  //   書き、本問が問う記号読解の答えを文字で与えている (B9 q057 / B10 q088 / B11 q066 の漏洩原則の題幹適用)。網掛けの要素の種別も交互配置から
  //   a / b の種別を推せるので一緒に外し、構造・接続・網掛けだけ残す。要素3 → 要素4 (上の網掛け) の接続は Rule D MINOR-1 で補った
  //   (2 番目の項は初回 apply 済みの表示に 1 行を足す追補、新規 HEAD では 1 番目の項だけで同じ結果になり skip)。源 p33 では最初のプロセスも網掛け → 要素1 に「網掛け・表示なし」を付す。
  "2009h21a-q089": {
    jp: [["stem", "図（DFD）:\n- 「顧客」→（注文依頼）→ 処理（プロセス）\n- その処理 → データストア「[ a ]」\n- データストア「[ a ]」→ 処理「[ b ]」（プロセス）\n- 処理「[ b ]」→ データストア（網掛け・表示なし）\n- そのデータストア → 処理（プロセス）\n- その処理 → データストア（網掛け・表示なし）\n- その処理 →（請求書）→「顧客」", "図（DFD、各要素の記号の形は添付図を参照）:\n- 「顧客」→（注文依頼）→ 要素1（網掛け・表示なし）\n- 要素1 →「[ a ]」\n- 「[ a ]」→「[ b ]」\n- 「[ b ]」→ 要素2（網掛け・表示なし）\n- 要素2 → 要素3（網掛け・表示なし）\n- 要素3 → 要素4（網掛け・表示なし）\n- 要素3 →（請求書）→「顧客」"],
      ["stem", "- 要素2 → 要素3（網掛け・表示なし）\n- 要素3 →（請求書）", "- 要素2 → 要素3（網掛け・表示なし）\n- 要素3 → 要素4（網掛け・表示なし）\n- 要素3 →（請求書）"]],
    zh: [["stem", "图（DFD）:\n- 「顾客」→（订货请求）→ 处理（过程）\n- 该处理 → 数据存储「[ a ]」\n- 数据存储「[ a ]」→ 处理「[ b ]」（过程）\n- 处理「[ b ]」→ 数据存储（带网格底纹·未显示）\n- 该数据存储 → 处理（过程）\n- 该处理 → 数据存储（带网格底纹·未显示）\n- 该处理 →（账单）→「顾客」", "图（DFD，各要素的符号形状请参见附图）:\n- 「顾客」→（订货请求）→ 要素1（带网格底纹·未显示）\n- 要素1 →「[ a ]」\n- 「[ a ]」→「[ b ]」\n- 「[ b ]」→ 要素2（带网格底纹·未显示）\n- 要素2 → 要素3（带网格底纹·未显示）\n- 要素3 → 要素4（带网格底纹·未显示）\n- 要素3 →（账单）→「顾客」"],
      ["stem", "- 要素2 → 要素3（带网格底纹·未显示）\n- 要素3 →（账单）", "- 要素2 → 要素3（带网格底纹·未显示）\n- 要素3 → 要素4（带网格底纹·未显示）\n- 要素3 →（账单）"]],
    en: [["stem", "Diagram (DFD):\n- 'Customer' -> (order request) -> Process\n- That process -> Data store '[ a ]'\n- Data store '[ a ]' -> Process '[ b ]'\n- Process '[ b ]' -> Data store (shaded; not shown)\n- That data store -> Process\n- That process -> Data store (shaded; not shown)\n- That process -> (invoice) -> 'Customer'", "Diagram (DFD; see the attached figure for the shape of each element):\n- 'Customer' -> (order request) -> Element 1 (shaded; not shown)\n- Element 1 -> '[ a ]'\n- '[ a ]' -> '[ b ]'\n- '[ b ]' -> Element 2 (shaded; not shown)\n- Element 2 -> Element 3 (shaded; not shown)\n- Element 3 -> Element 4 (shaded; not shown)\n- Element 3 -> (invoice) -> 'Customer'"],
      ["stem", "- Element 2 -> Element 3 (shaded; not shown)\n- Element 3 -> (invoice)", "- Element 2 -> Element 3 (shaded; not shown)\n- Element 3 -> Element 4 (shaded; not shown)\n- Element 3 -> (invoice)"]],
  },
  // q095: 源 p39〔条件〕(3)「計算式 I2＋H3」。D-162 で算術演算子は ASCII (設問文側、前文の外)。
  "2009h21a-q095": {
    jp: [["stem", "計算式I2＋H3を入力し", "計算式I2+H3を入力し"]],
    zh: [["stem", "计算式 I2＋H3，", "计算式 I2+H3，"]],
    en: [["stem", "enter the formula I2＋H3, and", "enter the formula I2+H3, and"]],
  },
  // q096: 源 p39 は「…重点商品としたい。対象となる商品は…」と同一行 (raw / clean 両方)。
  "2009h21a-q096": { jp: [["stem", "重点商品としたい。 対象となる商品", "重点商品としたい。対象となる商品"]] },
  // ── 選択肢 (raw = 出荷層) ───────────────────────────────────────────────────
  // q005: ア = **正解肢**。源 crop は「事業投資リスク」「情報漏えいリスク」。末尾の空白 + 記号は残骸。
  "2009h21a-q005": { jp: [["ア", "事業投資リスク    '", "事業投資リスク"], ["イ", "情報漏えいリスク .", "情報漏えいリスク"]] },
  // q008: 源 p05「生産受託するサービス」(EMS)。「委託」では向きが逆になる。zh / en も委託側の訳 → 受託に。
  "2009h21a-q008": {
    jp: [["エ", "一括して生産委託するサービス", "一括して生産受託するサービス"]],
    zh: [["エ", "一并承接的生产委托服务", "一并承接的受托生产服务"]],
    en: [["エ", "on a production-outsourcing basis", "on a contract-manufacturing basis"]],
  },
  // q015: 源 crop「納品するまでの時間」。zh / en は可。
  "2009h21a-q015": { jp: [["イ", "発注してから納品までの時間", "発注してから納品するまでの時間"]] },
  "2009h21a-q018": { jp: Object.entries(Q018).map(([L, [f, t]]) => [L, f, t]) },
  "2009h21a-q048": {
    jp: Object.entries(Q048).map(([L, [j]]) => [L, j, `図${L}`]),
    zh: Object.entries(Q048).map(([L, [, z]]) => [L, z, `图${L}`]),
    en: Object.entries(Q048).map(([L, [, , e]]) => [L, e, `Figure ${L}`]),
  },
  "2009h21a-q073": { jp: [["イ", "ログの消去やパックドアなどの", "ログの消去やバックドアなどの"]] },
  // q082: 源 p30「5,000」。zh / en も同じ字面。
  "2009h21a-q082": { jp: [["エ", "5000", "5,000"]], zh: [["エ", "5000", "5,000"]], en: [["エ", "5000", "5,000"]] },
  // q086: **正解肢**。源 crop「2 系統のコンピュータ」。zh「两套」/ en「two sets」は正。
  "2009h21a-q086": { jp: [["イ", "2 系続のコンピュータ", "2 系統のコンピュータ"]] },
  "2009h21a-q093": {
    jp: Object.entries(Q093).map(([L, [f, t]]) => [L, f, t]),
    zh: Object.entries(Q093).map(([L, [f, t]]) => [L, f, t]),
    en: Object.entries(Q093).map(([L, [f, t]]) => [L, f, t]),
  },
  // q094: 源 p38 は “商品え”は，… (ウ = **正解肢**)。zh / en は引用符なしで可。読点は field の字種「, 」(⑨)。
  "2009h21a-q094": { jp: [
    ["ア", "商品えは, 薄利多売", "“商品え”は, 薄利多売"],
    ["イ", "商品かは, 売上高", "“商品か”は, 売上高"],
    ["ウ", "商品くは, 売上高", "“商品く”は, 売上高"],
    ["エ", "商品こは, 販売数量", "“商品こ”は, 販売数量"],
  ] },
};

// ── bank page pointer (q093: page-36 → page-37) ─────────────────────────────
//  page-36 は中問B の前文 + 図 (ワークシート) だけで、問93 の設問・選択肢は page-37 (prep §0)。groups.json の mqB (page-36) は図の頁で正しい。
const PAGE_FIX = { "2009h21a-q093": [36, 37] };

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  q008: 誤答肢エの解説が選択肢を「…生産委託するサービス」と引用 → 受託 (jp / zh)。en は引用に委託の語を含まない。
//  q017: 解説本文の表記号 〇 → ○ (題幹の表と揃える、jp / zh / en)。
//  q048: 誤答肢ウ「テスト段階が最も低いV字型」は源図と食い違う (V の底は製造とテストの間) → 最小修正 (jp / zh / en、D-163 (2) の趣旨)。
//        他の解説は図の形を述べており、選択肢の言語化を引用していない → 不変。
//  q062: 解説の文字列「tmb」「tjh」→ 題幹の字形 “” に (jp。zh「」は ⑨-c、en は既に “”)。
//  q082: 誤答肢エの値「5000」→ 選択肢の字面「5,000」(jp / zh / en)。
//  q093: 式の引用の ／ ＊ → / * (D-162、B7 q086 / B11 q061 と同型)。q093 の解説の ／ はすべて式の中 (確認済み)。
const EXPL = {
  "2009h21a-q008": { dist: { "エ": {
    jp: ["一括して生産委託するサービス」", "一括して生産受託するサービス」"],
    zh: ["一并承接的生产委托服务」", "一并承接的受托生产服务」"],
  } } },
  "2009h21a-q017": { all: [["〇", "○"]] },
  "2009h21a-q048": { dist: { "ウ": {
    jp: ["テスト段階が最も低いV字型で", "製造とテストの間が最も低いV字型で"],
    zh: ["这是测试阶段最低的 V 字形", "这是在制造与测试之间最低的 V 字形"],
    en: ["This is a V-shaped curve with the test stage lowest", "This is a V-shaped curve that is lowest between the manufacturing and test stages"],
  } } },
  "2009h21a-q062": { allJp: [["「tmb」", "“tmb”"], ["「tjh」", "“tjh”"]] },
  "2009h21a-q082": { all: [["5000", "5,000"]] },
  "2009h21a-q093": { all: [["／", "/"], ["＊", "*"]] },
};

const MARK = "fidfix-S129-b13";

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 語義是正 + 正解肢命中 + note が是正対象の字句・是正前の表示に言及。
//   語義: q008 q018 q048 q073 q086 q089 (D-168) / 正解肢命中: q005 (ア) q018 (エ) q048 (ア) q086 (イ) q093 (イ) q094 (ウ)
//   note 言及: q017 (〇 で表を記述) q018 (OCR ノイズの語を列挙) q060 / q062 (「stem_jp_clean は源と一致」) q086 (表示是正を提言) q093 (D2／B2)
//   追記しない: q007 q015 q044 q082 q095 q096 (字種・空白のみ、または note が是正対象に言及しない)
const NOTE_APPEND = {
  "2009h21a-q005": (p) => `（S129 B13: ${p} 実読で 選択肢アの末尾の残骸「    '」とイの末尾の「 .」を除去済み。アは**正解肢**だが残骸の除去のみで、提携による投資負担・損失の分散 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2009h21a-q008": (p) => `（S129 B13: ${p} 実読で 選択肢エの「生産委託するサービス」を源の「生産受託するサービス」(EMS) に是正（zh / en・解説も追随）。工場をもたず生産を委託する企業形態 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2009h21a-q017": (p) => `（S129 B13: ${p} 実読で 表の記号 〇 を源の ○ に是正（zh / en・解説も、上記の 〇 は是正前の字形）。施設と機器が A 社 = ホスティング = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2009h21a-q018": (p) => `（S129 B13: ${p} 実読で 上記の OCR ノイズを源どおりに是正（ア 一会計期間・貸借対照表、ウ 財務諸表規則、4 肢の「ーー」「「」「.」「・」「ここる」等の残骸を除去）。エは**正解肢**だが字句の復元のみで、内部報告 = 管理会計 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2009h21a-q048": (p) => `（S129 B13 / D-163: ${p} 実読で 選択肢ア〜エ（jp / zh / en）の図の言語化（括弧の「設計から運用に向けて対応費用が増加」等が本問の判断をそのまま与え、ウ「テスト段階が最も低い」は図とも食い違う = V の底は製造とテストの間）を「図ア」〜「図エ」に置換（B10 q088 と同じ扱い、添付図に 4 肢あり。解説ウの記述も源図に合わせた）。choice_figures 化は図 lane 待ち。アは**正解肢** で、後工程ほど修正費用が増す = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2009h21a-q060": (p) => `（S129 B13: ${p} 実読で 題幹の「」と読点「、」を源の “” と「，」に是正（上記の「stem_jp_clean は源文と一致」は字形を除く）。各味に独立した 1 ビット = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2009h21a-q062": (p) => `（S129 B13: ${p} 実読で 題幹の「tmb」の引用符を源の “” に是正（解説も追随、上記の「完全一致」は字形を除く）。復号 s k y = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2009h21a-q073": (p) => `（S129 B13: ${p} 実読で 選択肢イの「パックドア」を源の「バックドア」に是正済み。指示に従って PC を遠隔操作するプログラム = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2009h21a-q086": (p) => `（S129 B13: ${p} 実読で 上記の提言どおり選択肢イの「2 系続」を源の「2 系統」に是正済み。イは**正解肢**だが誤字の是正のみで、2 系統で同一処理を照合 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2009h21a-q089": (p) => `（S129 B13 / D-168: ${p} 実読で 題幹の DFD 言語化から記号の種別ラベル（a = データストア、b = 処理（プロセス）、網掛け要素の種別）を除去（本問が問う記号読解の答えを文字で与えていたため。構造・接続・網掛けは保持、記号の形は添付図）。zh / en も同じ。a = 受注管理ファイル、b = 出荷処理 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2009h21a-q093": (p) => `（S129 B13: ${p} 実読で 選択肢ア〜エ（zh / en・解説も）の式の演算子 ／ ＊ を D-162 により ASCII の / * に揃えた（上記の D2／B2 は是正前の字形）。bank の page pointer も page-36（前文 + 図の頁）→ 設問の頁 page-37 に是正。イは**正解肢**だが演算子の字形のみの変更で、売上総利益 ÷ 売上高 = D2/B2 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2009h21a-q094": (p) => `（S129 B13: ${p} 実読で 選択肢ア〜エの商品名に源の引用符 “商品え” 等を補った。ウは**正解肢**だが引用符の追加のみで、商品回転率最大・利益率高・売上小 = 商品く = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
};
// D-143 の純粋後置を守るため、既存の追記句の訂正は別の後置で行う (Rule D MINOR-1)。
const NOTE_CORR = {
  "2009h21a-q089": "（S129 B13 訂正: 上記 D-168 の追記時点の言語化は源 p33 の「要素3 → 上の網掛け要素」の接続を欠いていた（3 層とも）。「要素3 → 要素4（網掛け・表示なし）」を補い、構造・接続・網掛けの保持を事実どおりにした — fidfix-S129-b13-corr）",
};
// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set([...Object.keys(FIX), ...Object.keys(PAGE_FIX)].map((id) => id.split("-q")[0]))];
const noteExams = [...new Set(Object.keys(NOTE_APPEND).map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(noteExams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));

// bank page pointer: question_bank と by_year の source を両方。現値が旧値でも目標値でもなければ止める。
for (const [id, [from, page]] of Object.entries(PAGE_FIX)) {
  const exam = id.split("-q")[0];
  const pad = (n) => String(n).padStart(2, "0");
  for (const [o, w] of [[Barr.find((x) => x.id === id), "question_bank"], [BY[exam].questions.find((x) => x.id === id), "by_year"]]) {
    const img = `pages/${exam}/page-${pad(page)}.png`;
    if (o.source.page_number === page && o.source.page_image === img) { skipped++; continue; }
    if (o.source.page_number !== from || o.source.page_image !== `pages/${exam}/page-${pad(from)}.png`) throw new Error(`${id} ${w}: source が想定 (page-${pad(from)}) と異なる — abort`);
    o.source.page_number = page; o.source.page_image = img; applied++;
    log.push(`  ✓ ${id} ${w}.source: page-${pad(from)} → page-${pad(page)}`);
  }
}
// NOTE の頁は是正後の bank (メモリ上) から取る。
const pg = (id) => `page-${String(Barr.find((x) => x.id === id).source.page_number).padStart(2, "0")}`;

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
  for (const [L, d] of Object.entries(ex.dist ?? {})) {
    const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    if (!dj || !dt) throw new Error(`${id} distractor ${L} missing`);
    if (d.jp) sub(dj, "why_wrong_jp", d.jp[0], d.jp[1], `${id} expl_jp.${L}`);
    if (d.zh) sub(dt, "zh", d.zh[0], d.zh[1], `${id} expl_tr.${L}.zh`);
    if (d.en) sub(dt, "en", d.en[0], d.en[1], `${id} expl_tr.${L}.en`);
  }
  const jpAll = (from, to) => {
    subAll(j, "correct_jp", from, to, `${id} expl_jp.correct`);
    for (const d of j.distractors_jp) subAll(d, "why_wrong_jp", from, to, `${id} expl_jp.${d.letter}`);
    j.points_jp.forEach((_, i) => subAll(j.points_jp, i, from, to, `${id} expl_jp.points[${i}]`));
  };
  for (const [from, to] of ex.allJp ?? []) jpAll(from, to);
  for (const [from, to] of ex.all ?? []) {
    jpAll(from, to);
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
for (const [id, txt] of Object.entries(NOTE_CORR)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (r.key_guard.note_jp.includes("fidfix-S129-b13-corr")) { skipped++; continue; }
  if (!r.key_guard.note_jp.includes(MARK)) throw new Error(`${id}: 訂正の対象の追記が無い — abort`);
  r.key_guard.note_jp = `${r.key_guard.note_jp}${txt}`; applied++; log.push(`  ✓ ${id} final note: 訂正を後置 (round1 untouched)`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S129-b13: applied ${applied}, skipped ${skipped}`);
