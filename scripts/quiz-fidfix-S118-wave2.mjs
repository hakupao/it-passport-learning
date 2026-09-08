#!/usr/bin/env node
// Stage 6 / Quiz — S118 ⑤-2 全量保真核験 **波 2** (2016h28h 66 問 / 2017h29a 92 問、gp/cr 双 pass = 316 agent) の差分を是正する。
// 源: S118 log §36 の 4 workflow。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_S118_<exam>_<gp|cr>.json
//     機械 diff = scripts/quiz-fidelity-machdiff.mjs (S117 §22b) → AGENT_MISSED から 6 題を追加審査、うち 5 題 (10 field) を採用。
//
// 層・方針は quiz-fidfix-S118-strat53.mjs と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - explanations は .phase2 (expl_jp_/expl_tr_) が真相源 → 是正後に quiz-phase2-merge で再生成 (D-143)
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等。page 番号は question_bank.source から
//   - zh/en は語義が変わった分のみ追随
//
// 採用した差分 (源 PNG を原寸で全件実読して確定):
//   2016h28h-q009 stem+エ 「4社」→ 源「A社」(page-05)。親事業者は A 社 1 社。解説 correct/points も 4 社前提だったため三語書換
//   2016h28h-q040 stem    節見出し 〔報告ルール〕 の括弧 (page-19)。raw は非対称 `[報告ルール〕`、clean は `[報告ルール]`
//   2016h28h-q051 stem    節見出し 〔条件〕 (page-24)。**machdiff 由来** (双 pass 齊漏)
//   2016h28h-q060 stem    源本文に無い図の代替テキスト段落を 3 言語から削除 (page-28)。
//                         has_figure=true / figure_path=figures/2016h28h-q060.png / apps/web/public/quiz-figures/2016h28h-q060.webp 実在 =
//                         図は表示されるので代替テキストは不要 (波 1 の 2015h27a-q066 と同一規則)
//   2016h28h-q067 ア/ウ   ア 末尾「とする。」の脱落を復元 / ウ「メンデテナンス」→「メンテナンス」(page-31)
//   2016h28h-q089 ア〜エ  **machdiff 由来**。4 肢すべてで第 1 節後の読点と文末句点が脱落 (page-40 実読)。**正解肢エ を含む**
//   2016h28h-q094 stem    “仕入一覧” “仕入” “商品” の引用符が 「」 に置換されていた (page-42)
//   2017h29a-q001 stem    表の結合ヘッダ「技術者」「製品」が markdown 化で消えていた → 各セルに展開 (page-02)。
//                         あわせて「単位：万円／日」→ 源「単位　万円／日」。raw stem_jp の Z 行 6→8 も源どおりに是正 (key_guard 既知の raw 腐敗)
//   2017h29a-q012 ア/イ   ア 混入「(」を除去 (**正解肢**) / イ「上位19人」→ 源「上位10人」(page-06)
//   2017h29a-q020 stem    「単位：百万円」→ 源「単位　百万円」(page-10)。q001 と同族、主 context が実読して追加
//   2017h29a-q022 ウ      「暴風や雨」→ 源「曇りや雨」(page-11)。腐敗版は損害保険の記述に読めるため解説ウが誤った論拠になっていた → 三語書換
//   2017h29a-q047 イ      「電話で内容を代替した」→ 源「電話で内容を伝えた」(page-20)。zh/en は既に「传达/conveyed」で忠実、jp と解説のみ
//   2017h29a-q078 ウ      「鋼線ケーブル」→ 源「銅線ケーブル」(page-30)。zh/en の「金属线/metal cable」も銅線へ精密化
//   2017h29a-q079 stem    節見出し 〔送信先〕 (page-30)。**machdiff 由来**
//   2017h29a-q096 stem    節見出し 〔事例〕 (page-37)。**machdiff 由来**
//   2017h29a-q098 ア〜エ  検索式の空白を源どおり `(not A ) and ( B and C )` 形に復元 (page-39)。**正解肢イ を含む**。
//                         S118 の「検索式・正規表現・URL は空白が構文」規則。式は言語非依存なので zh/en も同一文字列に揃える
//
// 見送り (evidence に理由を明記):
//   2017h29a-q020 表の「-20」(U+002D) vs 源のタイポグラフィックなマイナス — 走査画像から U+2212 と U+FF0D を判別できないため
//                 字形クラス (N6-b) に登記。ASCII "-" は語義的に等価で誤読を生まない
//   2017h29a-q079 〔送信先〕の 3 行 (To/Cc/Bcc) が 1 行に連結されている — 改行/空白正規化クラス。machdiff の盲点、双 pass とも CLEAN 判定
//   clean 保有題の raw stem_jp 残存腐敗 (q060「as こ c」「-ローー」/ q094 の引用符崩れ / q051「a~ー d」/ q020 の最終行欠落) — N5 系列 (§28 LOW-1)
//
// Run: node scripts/quiz-fidfix-S118-wave2.mjs [--dry-run]
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2016h28h && node scripts/quiz-phase2-merge.mjs 2017h29a

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
let applied = 0, skipped = 0; const log = [];

// assert-once: 対象文字列がちょうど 1 回だけ出ることを要求し、2 回以上なら中断 (誤爆防止)。
// 冪等: to ⊃ from で既に to が入っている、または from が 0 回なら skip。
function sub(obj, key, from, to, where) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  if (to && to.includes(from) && s.includes(to)) { skipped++; return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; return false; }
  if (n > 1) throw new Error(`${where}: 「${from}」 occurs ${n}× — abort`);
  obj[key] = s.replace(from, to); applied++; log.push(`  ✓ ${where}: 「${from.slice(0, 36)}」→「${to.slice(0, 36)}」`); return true;
}

// 2016h28h-q060: 源に無い図の代替テキスト段落 (3 言語)。sidecar の stem_jp_clean / stem.zh / stem.en のみに存在する。
const Q060_JP = "\n\n（構成 a：装置 2 台を直列に接続。構成 b：装置 1 台を直列に接続した後、装置 2 台を並列に接続。構成 c：装置 3 台を並列に接続。）";
const Q060_ZH = "\n\n（配置 a：2 台装置串联连接。配置 b：1 台装置串联连接后，再接 2 台装置并联连接。配置 c：3 台装置并联连接。）";
const Q060_EN = "\n\n(Configuration a: two devices connected in series. Configuration b: one device in series, followed by two devices connected in parallel. Configuration c: three devices connected in parallel.)";

const FIX = {
  // ── 2016h28h ────────────────────────────────────────────────────────────
  "2016h28h-q009": {
    jp: [
      ["stem", "大手システム開発会社4社から", "大手システム開発会社A社から"],
      ["エ", "納品したプログラムに対する 4 社の検査", "納品したプログラムに対する A 社の検査"],
    ],
    // zh の ア/イ/ウ は A社 を「甲公司」と訳しているので、stem と エ も同じ語で揃える。
    zh: [
      ["stem", "B公司从4家大型系统开发公司受托承接程序的编制工作", "B公司从大型系统开发公司甲公司受托承接程序的编制工作"],
      ["エ", "接受4家公司对所交付程序的检查。", "接受甲公司对所交付程序的检查。"],
    ],
    en: [
      ["stem", "Company B is contracted to create programs by four major system development companies.", "Company B is contracted to create programs by Company A, a major system development company."],
      ["エ", "to undergo inspection of the delivered program by the four companies.", "to undergo inspection of the delivered program by Company A."],
    ],
  },
  // raw は `[報告ルール〕` (非対称)、clean は `[報告ルール]`。どちらも 〔…〕 に揃える。
  "2016h28h-q040": {
    jp: [
      ["stem", "[報告ルール〕", "〔報告ルール〕"],
      ["stem", "[報告ルール]", "〔報告ルール〕"],
    ],
  },
  "2016h28h-q051": { jp: [["stem", "[条件]", "〔条件〕"]] },
  "2016h28h-q060": { jp: [["stem", Q060_JP, ""]], zh: [["stem", Q060_ZH, ""]], en: [["stem", Q060_EN, ""]] },
  "2016h28h-q067": {
    // ア: 源は 3 行組で末尾「とする。」。zh/en は既に完結文なので不変。
    jp: [
      ["ア", "どの PC からでもアクセス可能", "どの PC からでもアクセス可能とする。"],
      ["ウ", "Web サーバのメンデテナンスを行う。", "Web サーバのメンテナンスを行う。"],
    ],
  },
  // machdiff 由来: 4 肢すべてで第 1 節後の読点と文末句点が脱落 (源 page-40 実読)。
  // 読点は本 exam の表示層の既定表記 ", " (ASCII + 空白) に合わせる (§28 LOW-2 の U+FF0C 混在を再発させない)。
  "2016h28h-q089": {
    jp: [
      ["ア", "管理を容易にするために入退室に使用するIDカードは個人ごとではなく部署ごとに発行する", "管理を容易にするために, 入退室に使用するIDカードは個人ごとではなく部署ごとに発行する。"],
      ["イ", "全従業員や来訪者に所在が分かるように入口に室名表示をする", "全従業員や来訪者に所在が分かるように, 入口に室名表示をする。"],
      ["ウ", "入退室の情報が漏えいすることを防止するために入退室の記録は取らない", "入退室の情報が漏えいすることを防止するために, 入退室の記録は取らない。"],
      ["エ", "不正行為を防止するために監督者がいないときはサーバ室で作業させない", "不正行為を防止するために, 監督者がいないときはサーバ室で作業させない。"],
    ],
  },
  // 源は “…” (U+201C/U+201D)。zh/en は各言語の引用符慣行に従うため不変。
  "2016h28h-q094": {
    jp: [["stem", "の「仕入一覧」表を正規化して，「仕入」表と「商品」表に分割したい", "の“仕入一覧”表を正規化して，“仕入”表と“商品”表に分割したい"]],
  },
  // ── 2017h29a ────────────────────────────────────────────────────────────
  // 源の表は「技術者」を A/B/C に、「製品」を X/Y/Z に結合したヘッダをもつ。markdown で結合セルは書けないので各セルに展開する。
  // raw stem_jp の Z 行 (6|7|8) は key_guard が既知としていた OCR 誤り。源 page-02 は 8|7|8 なので同時に是正する。
  "2017h29a-q001": {
    jp: [
      ["stem", "単位：万円／日", "単位　万円／日"],
      ["stem", "|  | A | B | C |", "|  | 技術者 A | 技術者 B | 技術者 C |"],
      ["stem", "| X | 6 | 6 | 5 |", "| 製品 X | 6 | 6 | 5 |"],
      ["stem", "| Y | 7 | 6 | 8 |", "| 製品 Y | 7 | 6 | 8 |"],
      ["stem", "| Z | 8 | 7 | 8 |", "| 製品 Z | 8 | 7 | 8 |"],
      ["stem", "| Z | 6 | 7 | 8 |", "| 製品 Z | 8 | 7 | 8 |"],
    ],
    zh: [
      ["stem", "|  | A | B | C |", "|  | 技术人员A | 技术人员B | 技术人员C |"],
      ["stem", "| X | 6 | 6 | 5 |", "| 产品X | 6 | 6 | 5 |"],
      ["stem", "| Y | 7 | 6 | 8 |", "| 产品Y | 7 | 6 | 8 |"],
      ["stem", "| Z | 8 | 7 | 8 |", "| 产品Z | 8 | 7 | 8 |"],
    ],
    en: [
      ["stem", "|  | A | B | C |", "|  | Engineer A | Engineer B | Engineer C |"],
      ["stem", "| X | 6 | 6 | 5 |", "| Product X | 6 | 6 | 5 |"],
      ["stem", "| Y | 7 | 6 | 8 |", "| Product Y | 7 | 6 | 8 |"],
      ["stem", "| Z | 8 | 7 | 8 |", "| Product Z | 8 | 7 | 8 |"],
    ],
  },
  "2017h29a-q012": {
    jp: [
      ["ア", "メールアドレスを(CC 欄に設定して", "メールアドレスを CC 欄に設定して"],
      ["イ", "購入額上位19人の顧客に対して", "購入額上位10人の顧客に対して"],
    ],
    zh: [["イ", "向邮购消费金额排名前 19 名的顾客", "向邮购消费金额排名前 10 名的顾客"]],
    en: [["イ", "to each of the top 19 customers by mail-order purchase amount", "to each of the top 10 customers by mail-order purchase amount"]],
  },
  "2017h29a-q020": { jp: [["stem", "単位：百万円", "単位　百万円"]] },
  "2017h29a-q022": {
    jp: [["ウ", "暴風や雨が多かったことが原因で", "曇りや雨が多かったことが原因で"]],
    zh: [["ウ", "对因暴风或多雨而产生的损失进行了金钱方面的补偿。", "对因阴天和雨天较多而产生的损失进行了金钱方面的补偿。"]],
    en: [["ウ", "Provided monetary compensation for losses caused by storms or heavy rainfall.", "Provided monetary compensation for losses caused by there being many cloudy and rainy days."]],
  },
  // zh「改用电话传达了内容」/ en「conveyed the content by phone」は既に源 (伝えた) に忠実 → jp と解説のみ。
  "2017h29a-q047": { jp: [["イ", "電話で内容を代替した。", "電話で内容を伝えた。"]] },
  "2017h29a-q078": {
    jp: [["ウ", "光ファイバと鋼線ケーブルを接続し", "光ファイバと銅線ケーブルを接続し"]],
    zh: [["ウ", "连接光纤与金属线缆", "连接光纤与铜线线缆"]],
    en: [["ウ", "It connects optical fiber and metal cable", "It connects optical fiber and copper cable"]],
  },
  "2017h29a-q079": {
    jp: [
      ["stem", "[送信先〕", "〔送信先〕"],
      ["stem", "[送信先]", "〔送信先〕"],
    ],
  },
  "2017h29a-q096": { jp: [["stem", "[事例]", "〔事例〕"]] },
  // 検索式は空白が構文 (S118 規則)。式は言語非依存なので 3 言語とも源と同一文字列に揃える。
  "2017h29a-q098": {
    jp: [
      ["ア", "(notA) and(BandC)", "(not A ) and ( B and C )"],
      ["イ", "(notA) and(BorC)", "(not A ) and ( B or C )"],
      ["ウ", "(notA) or(BandC)", "(not A ) or ( B and C )"],
      ["エ", "(notA) or(BorC)", "(not A ) or ( B or C )"],
    ],
    zh: [
      ["ア", "(not A) and (B and C)", "(not A ) and ( B and C )"],
      ["イ", "(not A) and (B or C)", "(not A ) and ( B or C )"],
      ["ウ", "(not A) or (B and C)", "(not A ) or ( B and C )"],
      ["エ", "(not A) or (B or C)", "(not A ) or ( B or C )"],
    ],
    en: [
      ["ア", "(not A) and (B and C)", "(not A ) and ( B and C )"],
      ["イ", "(not A) and (B or C)", "(not A ) and ( B or C )"],
      ["ウ", "(not A) or (B and C)", "(not A ) or ( B and C )"],
      ["エ", "(not A) or (B or C)", "(not A ) or ( B or C )"],
    ],
  },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
// q009: 腐敗値「4社」を前提に「大手4社が親事業者」「その1社である A社」と論じていた → 源 (A社 1 社) に合わせて三語書換。
// q012: 誤答肢イ の解説が「上位19人」を引用 → 「上位10人」。
// q022: 誤答肢ウ の解説が**腐敗した「暴風」を前提に**損害保険と論じていた。源の「曇りや雨」は天候デリバティブの典型例なので全文書換。
// q047: 誤答肢イ の解説が「電話で代替した」を引用 → 源の「電話で内容を伝えた」。
// q078: 誤答肢ウ の解説の「金属ケーブル/金属线缆/metal cable」を源の銅線に精密化。
const EXPL = {
  "2016h28h-q009": {
    correctSub: {
      jp: [["本問では大手4社が親事業者,プログラムを受託して作成する B社が下請事業者にあたり,その1社である A社は受領日から60日以内に,検査の終了にかかわらず代金を支払う義務を負う。",
            "本問では発注元の大手システム開発会社 A社が親事業者,プログラムを受託して作成する B社が下請事業者にあたり,A社は受領日から60日以内に,検査の終了にかかわらず代金を支払う義務を負う。"]],
      zh: [["本题中，4家大型公司为委托方，受托编制程序的B公司为分包方，其中一家甲公司有义务自收到之日起算的60日以内、无论检查是否结束都支付款项。",
            "本题中，发包方的大型系统开发公司甲公司为委托方，受托编制程序的B公司为分包方，甲公司有义务自收到之日起算的60日以内、无论检查是否结束都支付款项。"]],
      en: [["In this question the four major companies are the parent businesses, Company B, which is contracted to create the programs, is the subcontractor, and Company A, one of the four, is obligated to pay within 60 days from the date of receipt, regardless of whether the inspection has been completed.",
            "In this question the ordering major system development company, Company A, is the parent business, Company B, which is contracted to create the programs, is the subcontractor, and Company A is obligated to pay within 60 days from the date of receipt, regardless of whether the inspection has been completed."]],
    },
    pointSub: [
      { idx: 1,
        jp: ["役割整理: プログラム作成を発注する大手4社 (A社を含む) が親事業者,受託して作成する B社が下請事業者。支払義務を負うのは親事業者側である。",
             "役割整理: プログラム作成を発注する大手システム開発会社 A社が親事業者,受託して作成する B社が下請事業者。支払義務を負うのは親事業者側である。"],
        zh: ["角色梳理：发出程序编制订单的4家大型公司（含甲公司）为委托方，受托编制的B公司为分包方。承担支付义务的是委托方一方。",
             "角色梳理：发出程序编制订单的大型系统开发公司甲公司为委托方，受托编制的B公司为分包方。承担支付义务的是委托方一方。"],
        en: ["Role summary: the four major companies (including Company A) that order the program creation are the parent businesses, and Company B",
             "Role summary: the major system development company, Company A, that orders the program creation is the parent business, and Company B"] },
    ],
  },
  "2017h29a-q012": {
    distSub: {
      "イ": {
        jp: [["上位19人の顧客に1通ずつ個別のメールを作成して送っているため", "上位10人の顧客に1通ずつ個別のメールを作成して送っているため"]],
        zh: [["由于向排名前 19 名的顾客各自撰写并发送了一封单独的邮件", "由于向排名前 10 名的顾客各自撰写并发送了一封单独的邮件"]],
        en: [["Because an individual email is composed and sent to each of the top 19 customers one by one", "Because an individual email is composed and sent to each of the top 10 customers one by one"]],
      },
    },
  },
  "2017h29a-q022": {
    distSub: {
      "ウ": {
        jp: [["暴風や雨による損失に対して金銭で補償するのは「損害保険」の仕組み。あらかじめ保険料を払い、事故・災害時に補償を受けるものであり、不特定多数からの資金調達ではないため誤り。",
              "曇りや雨が多かったことによる損失を金銭で補償するのは「天候デリバティブ (天候保険)」の仕組み。あらかじめ定めた気象条件 (日照時間や降水量など) を指標に補償額が決まる金融商品・保険であり、不特定多数から資金を募る仕組みではないため誤り。"]],
        zh: [["对因暴风或多雨造成的损失以金钱进行补偿，是「财产保险（损害保险）」的机制。它是事先缴纳保险费、在发生事故或灾害时获得补偿，并非从不特定的众多人群筹集资金，因此错误。",
              "对因阴天和雨天较多造成的损失以金钱进行补偿，是「天气衍生品（天气保险）」的机制。它以事先约定的气象指标（日照时数、降水量等）来确定补偿金额，并非从不特定的众多人群筹集资金，因此错误。"]],
        en: [["Providing monetary compensation for losses caused by storms or heavy rainfall is the mechanism of “property (non-life) insurance.” You pay premiums in advance and receive compensation when an accident or disaster occurs; it is not fundraising from an unspecified large number of people, so it is incorrect.",
              "Providing monetary compensation for losses caused by there being many cloudy and rainy days is the mechanism of a “weather derivative (weather insurance).” The payout is determined by a pre-agreed meteorological index such as hours of sunshine or amount of rainfall; it is not fundraising from an unspecified large number of people, so it is incorrect."]],
      },
    },
  },
  "2017h29a-q047": {
    distSub: {
      "イ": {
        jp: [["ネットワーク障害でメールが送れないので電話で代替した、は", "ネットワーク障害でメールが送れないので電話で内容を伝えた、は"]],
      },
    },
  },
  "2017h29a-q078": {
    distSub: {
      "ウ": {
        jp: [["光ファイバと金属ケーブルを接続して信号を物理的に相互変換するのは", "光ファイバと銅線ケーブルを接続して信号を物理的に相互変換するのは"]],
        zh: [["连接光纤与金属线缆、对信号进行物理上的相互转换", "连接光纤与铜线线缆、对信号进行物理上的相互转换"]],
        en: [["Connecting optical fiber and metal cable and physically converting the signals between them", "Connecting optical fiber and copper cable and physically converting the signals between them"]],
      },
    },
  },
};

const MARK = "fidfix-S118-wave2";
const pg = (id) => { const b = rj(P("data/ip/exams/question_bank.json")).questions.find((q) => q.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ更新。round1 は不可触。
// 方針: 語義是正 / 正解肢命中 / 既存 note が「腐敗なし」と明言している題 に限り 1 文を追記する (MARK 冪等)。
// 括弧・引用符・「単位：」だけの表記是正 (q040 / q051 / q094 / q020 / q079 / q096) は追記しない — evidence に一覧化。
const NOTE_APPEND = {
  "2016h28h-q009": (p) => `（S118 ⑤-2 波2: ${p} 実読で stem と選択肢エ の「4社」を源の「A社」に是正。親事業者は A社 1 社なので解説の役割整理も三語で追随 — ${MARK}）`,
  "2016h28h-q060": (p) => `（S118 ⑤-2 波2: ${p} 実読で、源本文に無い図の代替テキスト段落「（構成 a：…）」を 3 言語の題幹から削除。図は figure_path 経由で表示されるため代替テキストは不要 — ${MARK}）`,
  "2016h28h-q067": (p) => `（S118 ⑤-2 波2: ${p} 実読で 選択肢ア の脱落「とする。」を復元し、選択肢ウ「メンデテナンス」を源の「メンテナンス」に是正 — ${MARK}）`,
  "2016h28h-q089": (p) => `（S118 ⑤-2 波2: ${p} 実読で 4 肢すべてに脱落していた読点と文末句点を復元（正解肢エ を含む）。双 pass は齊漏し machdiff が捕捉 — ${MARK}）`,
  "2017h29a-q001": (p) => `（S118 ⑤-2 波2: ${p} 実読で 表の結合ヘッダ「技術者」「製品」を各セルに展開し、「単位：」を源の「単位　」に是正。raw stem_jp の Z 行も源どおり 8/7/8 に是正済 — ${MARK}）`,
  "2017h29a-q012": (p) => `（S118 ⑤-2 波2: ${p} 実読で 選択肢ア の混入「(」を除去（正解肢）、選択肢イ「上位19人」を源の「上位10人」に是正し解説イも追随 — ${MARK}）`,
  "2017h29a-q022": (p) => `（S118 ⑤-2 波2: ${p} 実読で 選択肢ウ「暴風や雨」を源の「曇りや雨」に是正。腐敗版を前提に損害保険と論じていた解説ウを天候デリバティブへ三語書換 — ${MARK}）`,
  "2017h29a-q047": (p) => `（S118 ⑤-2 波2: ${p} 実読で 選択肢イ「電話で内容を代替した」を源の「電話で内容を伝えた」に是正。zh/en は既に忠実 — ${MARK}）`,
  "2017h29a-q078": (p) => `（S118 ⑤-2 波2: ${p} 実読で 選択肢ウ「鋼線ケーブル」を源の「銅線ケーブル」に是正し、解説ウ の三語も銅線へ精密化 — ${MARK}）`,
  "2017h29a-q098": (p) => `（S118 ⑤-2 波2: ${p} 実読で 4 肢の検索式の空白を源どおり「(not A ) and ( B or C )」形に復元（正解肢イ を含む）。検索式は空白が構文という S118 規則 — ${MARK}）`,
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
  const q = Qdoc.questions.find((x) => x.id === id), b = Barr.find((x) => x.id === id), y = BY[exam].questions.find((x) => x.id === id), t = TR[exam].questions[id];
  const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;
  for (const [field, from, to] of fx.jp ?? []) {
    if (field === "stem") {
      for (const [o, w] of [[q, "questions.stem_jp"], [b, "question_bank.stem_jp"], [y, "by_year.stem_jp"]]) sub(o, "stem_jp", from, to, `${id} ${w}`);
      if (t?.stem_jp_clean) sub(t, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`);
      if (t1?.stem_jp_clean) sub(t1, "stem_jp_clean", from, to, `${id} .phase1 tr_.stem_jp_clean`);
    } else for (const [o, w] of [[q, "questions"], [b, "question_bank"], [y, "by_year"]]) sub(o.choices_jp, field, from, to, `${id} ${w}.choices_jp.${field}`);
  }
  for (const lang of ["zh", "en"]) for (const [field, from, to] of fx[lang] ?? []) {
    if (field === "stem") { sub(t.stem, lang, from, to, `${id} translations.stem.${lang}`); if (t1) sub(t1.stem, lang, from, to, `${id} .phase1 tr_.stem.${lang}`); }
    else { sub(t.choices[field], lang, from, to, `${id} translations.choices.${field}.${lang}`); if (t1) sub(t1.choices.find((c) => c.letter === field), lang, from, to, `${id} .phase1 tr_.choices.${field}.${lang}`); }
  }
  if (t1) wj(t1f, t1);
}
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

for (const [id, ex] of Object.entries(EXPL)) {
  const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`); const j = rj(jf), tr = rj(tf);
  for (const [L, d] of Object.entries(ex.distSub ?? {})) {
    const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    for (const [f, t] of d.jp ?? []) sub(dj, "why_wrong_jp", f, t, `${id} expl_jp.${L}`);
    for (const [f, t] of d.zh ?? []) sub(dt, "zh", f, t, `${id} expl_tr.${L}.zh`);
    for (const [f, t] of d.en ?? []) sub(dt, "en", f, t, `${id} expl_tr.${L}.en`);
  }
  if (ex.correctSub) {
    for (const [f, t] of ex.correctSub.jp ?? []) sub(j, "correct_jp", f, t, `${id} expl_jp.correct_jp`);
    for (const [f, t] of ex.correctSub.zh ?? []) sub(tr.correct, "zh", f, t, `${id} expl_tr.correct.zh`);
    for (const [f, t] of ex.correctSub.en ?? []) sub(tr.correct, "en", f, t, `${id} expl_tr.correct.en`);
  }
  for (const p of ex.pointSub ?? []) {
    if (p.jp) { const [f, t] = p.jp; const arr = j.points_jp; if (typeof arr?.[p.idx] !== "string") throw new Error(`${id} points_jp[${p.idx}] missing`);
      const box = { v: arr[p.idx] }; if (sub(box, "v", f, t, `${id} expl_jp.points[${p.idx}]`)) arr[p.idx] = box.v; }
    if (p.zh) { const [f, t] = p.zh; sub(tr.points[p.idx], "zh", f, t, `${id} expl_tr.points[${p.idx}].zh`); }
    if (p.en) { const [f, t] = p.en; sub(tr.points[p.idx], "en", f, t, `${id} expl_tr.points[${p.idx}].en`); }
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S118-wave2: applied ${applied}, skipped ${skipped}`);
