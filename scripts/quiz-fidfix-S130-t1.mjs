#!/usr/bin/env node
// Stage 6 / Quiz — S130 **T1** (D-150 §4 段 3、訳層照合: B track 13 exam の 1298 題) の採用差分を是正する。
// 源: S130 の訳層照合 run (Sonnet、batch 5、画像なし)。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/t1_tr_fidelity_sn.json
//     マニフェスト = data/ip/quiz/.phase2/t1_tr_input.json (1298 題、zh/en は適用前の sidecar と 12,980 field 一致を確認済)
//     CLEAN 1282 / DISCREPANT 16 / 差分 32 (evidence/quiz_T1_tr_fix_S130.md §2)
//
// 層・方針は quiz-fidfix-S127-a2b と同じ (MARK 冪等 / key_guard は final のみ・round1 不可触 /
// translations sidecar は再 merge 禁止 → sidecar と .phase1 tr_ の両方に同じ置換 (.phase1 に無い文字列は skip) /
// expl は .phase2 expl_tr_ が真相源 → phase2-merge で再生成)。jp 3 層 (questions / question_bank / by_year) は読まない・書かない
// (note の page 番号を出すため question_bank を読むだけ)。置換は subN (出現数 n を厳密に要求、0 回なら skip)。
//
// ── 採用差分 (evidence §4) ──
//   2009h21a 中問B q093〜q096 zh/en  表の商品名「商品甲〜癸」/「Product A〜J」→「商品あ〜こ」/「Product あ〜こ」
//                     (q094 の選択肢・jp 源の図 [バブルチャート、ラベル 商品く/え/こ/か] が kana のまま。表を kana に揃える。
//                      q096 は agent の見落とし [同じ表]。前文は sidecar 直書きで、chumon probe [先頭 40 字] は表に掛からない)
//                     解説 q093 (商品甲 / Product A) と q096 (丁/丙/甲/癸、D/C/A/J) も追随
//   2009h21a-q009 ウ zh  「职务制组织」→「职能制组织」(corpus 多数派、解説 ウ・points[1] も追随)
//   2009h21a-q098 zh/en 題幹の jp 混入「（取引先担当者表）」/「(取引先担当者)」を除去、en は図 1 の表名「customer contact person table」に
//   2009h21a-q099 zh   「名称」→「姓名」(jp「名前」= 担当者の名前、図 1 の列名「姓名」)
//   2009h21h-q091 zh   欠落していた 2 文 (流れ図を書いて考える / X に入る字句を問う設問文) を .phase1 tr_ の訳文で補う
//   2009h21h-q098 zh   「网购业务」→「邮购业务」(jp「通販業務」、前段・前文と同じ訳語)
//   2010h22a-q100 en ア〜エ「operation 2」→「operation ②」(表の作業番号 ①〜⑧ と解説の表記に揃える)
//   2010h22h-q016 zh   題幹「企业经营理念与价值观」→「企业对经营的信念与价值观」(正解肢エ「经营理念」が題幹に漏れていた)
//   2012h24a-q096 en   形式の ①②③ ラベルが (1)(2)(3) になり手順番号と衝突 → ①②③
//   2013h25a-q099 en   施策 ①〜③ が (1)〜(3) になり〔要望事項〕(1)〜(4) (= 選択肢) と衝突 → ①〜③ (解説も追随)
//   2013h25h-q090 / q092 zh 「财务部」→「会计部」(jp「経理部」、前文 [probe 含む] の訳語。q090 は agent の見落とし)
//   2014h26a-q100 zh/en 「何時間」の単位と「平均」申請回数を補う (選択肢は数値のみ)
//   2014h26h-q048 ア zh/en 「实际内容」/「actual content」→ jp「実施内容」に合わせる (解説 ア の引用も追随)
// ── 不採用 ──
//   2010h22h-q063 ア en "(\")": " という文字そのものを指す (A2b D-151 除外 2010h22h-q063 ア と同じ扱い。en の ASCII " は ⑨-c)
//
// Run: node scripts/quiz-fidfix-S130-t1.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S130-t1.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs <exam>  (対象 exam ごと)
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

// subN: 出現数 n を厳密に要求して全置換。0 回なら skip (冪等)、n と違えば中断。
// 事後確認は to 出現数が「置換前 − from 内に含まれていた分 + n」と完全一致 (to が from の部分列のときも成り立つ形)。
function subN(obj, key, from, to, n, where) {
  const s = obj?.[key];
  if (typeof s !== "string") throw new Error(`${where}: field ${key} missing`);
  const k = s.split(from).length - 1;
  if (k === 0) { skipped++; return false; }
  if (k !== n) throw new Error(`${where}: 「${from}」 occurs ${k}× (expected ${n}) — abort`);
  const next = s.split(from).join(to);
  const cnt = (x, y) => x.split(y).length - 1;
  if (cnt(next, to) !== cnt(s, to) - n * cnt(from, to) + n || next.includes(from)) throw new Error(`${where}: 置換後の事後確認に失敗 — abort`);
  obj[key] = next; applied++; log.push(`  ✓ ${where}: 「${from.slice(0, 40)}」→「${to.slice(0, 40)}」 ×${n}`); return true;
}

// 中問B の表: 行ラベルは「| 商品甲 |」「| Product A |」の形でだけ置換する (列名の I / 前文の Company 等に触れない)
const KANA = ["あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ"];
const TABLE_ROWS = [
  ...[..."甲乙丙丁戊己庚辛壬癸"].map((c, i) => ["zh", "stem", `| 商品${c} |`, `| 商品${KANA[i]} |`, 1]),
  ...[..."ABCDEFGHIJ"].map((c, i) => ["en", "stem", `| Product ${c} |`, `| Product ${KANA[i]} |`, 1]),
];

// [lang, field (stem | ア〜エ), from, to, n] — sidecar と .phase1 tr_ の両方に当てる
const FIX = {
  "2009h21a-q093": TABLE_ROWS,
  "2009h21a-q094": TABLE_ROWS,
  "2009h21a-q095": TABLE_ROWS,
  "2009h21a-q096": TABLE_ROWS,
  "2009h21a-q009": [["zh", "ウ", "职务制组织", "职能制组织", 1]],
  "2009h21a-q098": [["zh", "stem", "图1中的客户负责人表（取引先担当者表）记录", "图1中的客户负责人表记录", 1],
                    ["en", "stem", "the client contact (取引先担当者) table in Figure 1", "the customer contact person table in Figure 1", 1]],
  "2009h21a-q099": [["zh", "stem", "交易方代码、名称、部门名", "交易方代码、姓名、部门名", 1]],
  // 文言は .phase1 tr_ (前文埋め込み前の訳、2 文あり) のものをそのまま戻す。from に挿入点の前後を含めて to ⊅ from にする
  "2009h21h-q091": [["zh", "stem", "且 PC1 未发生故障。\n\n另外，下面这张流程图尚处于绘制途中。",
                     "且 PC1 未发生故障。\n\nM 先生决定把确定故障原因的步骤画成流程图来思考。此时，下图中 X 处应填入的适当字句是哪一个？\n另外，下面这张流程图尚处于绘制途中。", 1]],
  "2009h21h-q098": [["zh", "stem", "网购业务", "邮购业务", 6]],
  "2010h22a-q100": [["en", "ア", "Shorten operation 2 by", "Shorten operation ② by", 1], ["en", "イ", "Shorten operation 4 by", "Shorten operation ④ by", 1],
                    ["en", "ウ", "Shorten operation 5 by", "Shorten operation ⑤ by", 1], ["en", "エ", "Shorten operation 6 by", "Shorten operation ⑥ by", 1]],
  "2010h22h-q016": [["zh", "stem", "展示企业经营理念与价值观的事物", "展示企业对经营的信念与价值观的事物", 1]],
  "2012h24a-q096": [["en", "stem", "| (1) Digit-count information | (2) Separator information | (3) Run-length information |",
                     "| ① Digit-count information | ② Separator information | ③ Run-length information |", 1],
                    ["en", "stem", "\n(1) Digit-count information: represented", "\n① Digit-count information: represented", 1],
                    ["en", "stem", "\n(2) Separator information: the separator", "\n② Separator information: the separator", 1],
                    ["en", "stem", "\n(3) Run-length information: n", "\n③ Run-length information: n", 1],
                    ["en", "stem", "when m is 5, (1) is (5-2)", "when m is 5, ① is (5-2)", 1]],
  "2013h25a-q099": [["en", "stem", "\n(1) Issue user cards with built-in RFID", "\n① Issue user cards with built-in RFID", 1],
                    ["en", "stem", "\n(2) Install RFID (Radio Frequency Identification) readers on the shelf boards", "\n② Install RFID (Radio Frequency Identification) readers on the shelf boards", 1],
                    ["en", "stem", "\n(3) Install an RFID (Radio Frequency Identification) reader at the return post", "\n③ Install an RFID (Radio Frequency Identification) reader at the return post", 1],
                    ["en", "stem", "the effects of measures (1) to (3), Mr. B", "the effects of measures ① to ③, Mr. B", 1]],
  "2013h25h-q090": [["zh", "stem", "作为 F 公司财务部能够", "作为 F 公司会计部能够", 1]],
  "2013h25h-q092": [["zh", "stem", "未能满足财务部对新系统", "未能满足会计部对新系统", 1]],
  "2014h26a-q100": [["zh", "stem", "求 A 公司每月整体的作业缩短时间，最合适的是哪一个？这里，A 公司每月的营业日为 20 天，每天的申请处理件数为 10 次。",
                     "求 A 公司每月整体的作业缩短时间是多少小时？这里，A 公司每月的营业日为 20 天，A 公司每天的平均申请次数为 10 次。", 1],
                    ["en", "stem", "which is the most appropriate value for company A's total monthly reduction in work time? Here, company A has 20 business days per month, and the number of applications processed per day is 10.",
                     "how many hours is company A's total monthly reduction in work time? Here, company A has 20 business days per month, and its average number of applications per day is 10.", 1]],
  "2014h26h-q048": [["zh", "ア", "基于服务的实际内容来证明", "基于服务的实施内容来证明", 1],
                    ["en", "ア", "based on the actual content of the service.", "based on the services actually performed.", 1]],
  // ── 仕事 2 (lead 指示 D-169): en の丸数字ラベル。jp の ①② が同じ問の中で参照される / 別の (n) 列と衝突するときだけ ①② に戻す ──
  // 2010h22h-q095: 候補 ①〜④ (選択肢 d/e/f が参照) が、条件・手続・貸出処理・返却処理・概要の (1)〜(4) と同じ記法だった
  "2010h22h-q095": [["en", "stem", "\n\n(1) Display 'Available for loan'\n(2) Display 'On loan'\n(3) Search the loan table by document number and extract loan records whose return date is a blank value\n(4) Search the loan table",
                     "\n\n① Display 'Available for loan'\n② Display 'On loan'\n③ Search the loan table by document number and extract loan records whose return date is a blank value\n④ Search the loan table", 1],
                    ["en", "ア", "d: (3) e: (1) f: (2)", "d: ③ e: ① f: ②", 1], ["en", "イ", "d: (3) e: (2) f: (1)", "d: ③ e: ② f: ①", 1],
                    ["en", "ウ", "d: (4) e: (1) f: (2)", "d: ④ e: ① f: ②", 1], ["en", "エ", "d: (4) e: (2) f: (1)", "d: ④ e: ② f: ①", 1]],
  // 2013h25a-q087: 契約項目 ①〜④ (選択肢が参照) が、状況説明の (1)〜(3) と同じ記法だった
  "2013h25a-q087": [["en", "stem", "(1) Contract amount  (2) Product specifications  (3) Delivery deadline  (4) Deliverables", "① Contract amount  ② Product specifications  ③ Delivery deadline  ④ Deliverables", 1],
                    ["en", "ア", "(1) and (2)", "① and ②", 1], ["en", "イ", "(1) and (3)", "① and ③", 1],
                    ["en", "ウ", "(2) and (4)", "② and ④", 1], ["en", "エ", "(3) and (4)", "③ and ④", 1]],
  // 2011h23a-q092: 図 4 (jp 画像) の 画像①〜③ を選択肢が参照。en だけ "Image (1)" で、処理概要の (1)〜(4) とも同じ記法だった
  "2011h23a-q092": [["en", "ア", "Image (1), Image (2), Image (3)", "Image ①, Image ②, Image ③", 1], ["en", "イ", "Image (1), Image (3), Image (2)", "Image ①, Image ③, Image ②", 1],
                    ["en", "ウ", "Image (2), Image (1), Image (3)", "Image ②, Image ①, Image ③", 1], ["en", "エ", "Image (2), Image (3), Image (1)", "Image ②, Image ③, Image ①", 1]],
  // 2013h25a-mqC q093〜q096 (共有前文): 表 1 の表記ルール ①〜③ が、前文の箇条 (1)〜(6) と同じ記法だった (解説 q094 の "rule (3)" 等は箇条側)
  ...Object.fromEntries(["093", "094", "095", "096"].map((n) => [`2013h25a-q${n}`, [
    ["en", "stem", "| Notation rules | (1) Characters enclosed", "| Notation rules | ① Characters enclosed", 1],
    ["en", "stem", "<br>(2) yymm is the year and month", "<br>② yymm is the year and month", 1],
    ["en", "stem", "<br>(3) “+” is a symbol", "<br>③ “+” is a symbol", 1]]])),
};
// [where (correct | d:ア〜エ | p:idx), lang, from, to, n] — .phase2 expl_tr_ (phase2-merge で explanations を再生成)
const EXPL = {
  "2009h21a-q093": [["correct", "zh", "（商品甲）", "（商品あ）", 1], ["correct", "en", "(Product A)", "(Product あ)", 1],
                    ["d:ウ", "zh", "商品甲", "商品あ", 2], ["d:ウ", "en", "Product A", "Product あ", 2],
                    ["d:エ", "zh", "商品甲", "商品あ", 1], ["d:エ", "en", "Product A", "Product あ", 1]],
  "2009h21a-q096": [["correct", "zh", "丁28.8% → 丙51.3%（28.8+22.5）→ 甲66.1%（+14.8）→ 癸76.9%（+10.8），累计落在70%以内的是「商品丁、商品丙、商品甲」",
                     "商品え 28.8% → 商品う 51.3%（28.8+22.5）→ 商品あ 66.1%（+14.8）→ 商品こ 76.9%（+10.8），累计落在70%以内的是「商品え、商品う、商品あ」", 1],
                    ["correct", "zh", "丁=9.2次、丙=12.0次、甲=14.4次，满足「10次以下」的只有商品丁", "商品え=9.2次、商品う=12.0次、商品あ=14.4次，满足「10次以下」的只有商品え", 1],
                    ["correct", "en", "D 28.8% → C 51.3% (28.8+22.5) → A 66.1% (+14.8) → J 76.9% (+10.8)",
                     "Product え 28.8% → Product う 51.3% (28.8+22.5) → Product あ 66.1% (+14.8) → Product こ 76.9% (+10.8)", 1],
                    ["correct", "en", "the three items Product D, Product C, and Product A", "the three items Product え, Product う, and Product あ", 1],
                    ["correct", "en", "D = 9.2 times, C = 12.0 times, A = 14.4 times, and only Product D meets",
                     "Product え = 9.2 times, Product う = 12.0 times, Product あ = 14.4 times, and only Product え meets", 1]],
  "2009h21a-q009": [["d:ウ", "zh", "职务制组织", "职能制组织", 1], ["p:1", "zh", "职务制组织", "职能制组织", 1]],
  "2013h25a-q099": [["correct", "en", "measures (1) to (3)", "measures ① to ③", 2], ["correct", "en", "measure (1) automates", "measure ① automates", 1],
                    ["correct", "en", "measure (2) automates", "measure ② automates", 1], ["correct", "en", "measure (3) automates", "measure ③ automates", 1],
                    ["d:ア", "en", "as in measure (1)", "as in measure ①", 1], ["d:イ", "en", "as in measure (2)", "as in measure ②", 1],
                    ["d:エ", "en", "as in measure (3)", "as in measure ③", 1]],
  "2013h25h-q090": [["correct", "zh", "财务部", "会计部", 1]],
  "2013h25h-q092": [["correct", "zh", "财务部", "会计部", 1]],
  "2014h26h-q048": [["d:ア", "zh", "基于服务的实际内容来证明", "基于服务的实施内容来证明", 1],
                    ["d:ア", "en", "based on the actual content of the service", "based on the services actually performed", 1]],
  // 仕事 2 (D-169) の解説追随。「matches (3) of [Overview…]」(概要の箇条) は候補ではないので不触
  "2010h22h-q095": [["correct", "en", "(d: (3) e: (1) f: (2))", "(d: ③ e: ① f: ②)", 1], ["correct", "en", "so either (3) or (4) — the ones", "so either ③ or ④ — the ones", 1],
                    ["correct", "en", "Therefore, if (3) “Search", "Therefore, if ③ “Search", 1], ["correct", "en", "so it is (1) Display", "so it is ① Display", 1],
                    ["correct", "en", "so it is (2) Display", "so it is ② Display", 1],
                    ["d:イ", "en", "d = (3) is correct", "d = ③ is correct", 1], ["d:イ", "en", "Placing (2) Display", "Placing ② Display", 1], ["d:イ", "en", "and (1) Display", "and ① Display", 1],
                    ["d:ウ", "en", "e = (1), f = (2)", "e = ①, f = ②", 1], ["d:ウ", "en", "placing (4) “extract", "placing ④ “extract", 1],
                    ["d:エ", "en", "placing (4) in d", "placing ④ in d", 1]],
  "2013h25a-q087": [["correct", "en", "(3) Delivery deadline", "③ Delivery deadline", 1], ["correct", "en", "(1) Contract amount", "① Contract amount", 1],
                    ["correct", "en", "combination of (1) and (3)", "combination of ① and ③", 1],
                    ["d:ア", "en", "(1) Contract amount", "① Contract amount", 1], ["d:ア", "en", "(2) Product specifications", "② Product specifications", 1],
                    ["d:ウ", "en", "(2) Product specifications", "② Product specifications", 1], ["d:ウ", "en", "(4) Deliverables", "④ Deliverables", 1],
                    ["d:ウ", "en", "both (1) and (3)", "both ① and ③", 1],
                    ["d:エ", "en", "(3) Delivery deadline", "③ Delivery deadline", 1], ["d:エ", "en", "(4) Deliverables", "④ Deliverables", 1],
                    ["d:エ", "en", "(1) Contract amount", "① Contract amount", 1]],
  "2011h23a-q092": [["correct", "en", "Image (1)", "Image ①", 6], ["correct", "en", "Image (2)", "Image ②", 6], ["correct", "en", "Image (3)", "Image ③", 6],
                    ["d:ア", "en", "Image (1)", "Image ①", 1], ["d:ア", "en", "Image (2)", "Image ②", 3], ["d:ア", "en", "Image (3)", "Image ③", 2],
                    ["d:ウ", "en", "Image (1)", "Image ①", 1], ["d:ウ", "en", "Image (2)", "Image ②", 2],
                    ["d:エ", "en", "Image (1)", "Image ①", 2], ["d:エ", "en", "Image (2)", "Image ②", 2], ["d:エ", "en", "Image (3)", "Image ③", 2]],
};

// ── 仕事 3 (lead 指示 D-161): 2009h21a-mqC (q097〜q100) の「取引先」訳語を組内で統一 ──
// corpus (mqC を除く、jp に「取引先」を含む field の zh / en、evidence §12):
//   zh 交易对象 8 field / 7 題 > 交易方 5 / 5 > 交易伙伴 3 / 3 > 客户 2 / 1 > 往来企业・往来客户 各 1 → 「交易对象」
//   en business partner 17 field / 16 題 > customer (顧客と併存の題を除くと 0) > client 3 / 2 > counterparty 1 → "business partner"
// 組内の現状: zh = 前文本文「业务往来方」/ 図 1「客户…」/ q099・q100「交易方…」、en = 本文 "business partner" / 図 1 "Customer …" / q098・q099 "Client"・"Customer contact table"
// 置換は組の 4 題の sidecar stem / choices、.phase1 tr_、.phase2 expl_tr_ の全 field に同じ規則を当てる。
// en の "corporate customers" (前文「企業に対して」= 顧客、取引先ではない) は除外。表名は図 1 の "… contact person table" に揃える。
// 事前に題ごとの置換数 (zh / en、sidecar + expl_tr) を MQC_EXPECT で固定し、違えば中断 (assert-before-replace)。0 回なら skip (冪等)。
const MQC_ZH = [[/业务往来方/g, "交易对象"], [/交易方/g, "交易对象"], [/客户/g, "交易对象"]];
const MQC_EN = [
  [/\bBusiness-partner\b/g, "Business partner"], [/\bbusiness-partner\b/g, "business partner"],
  [/\bCustomer contact (?:person )?table\b/g, "Business partner contact person table"], [/\bcustomer contact (?:person )?table\b/g, "business partner contact person table"],
  [/\bbusiness partner contact table\b/g, "business partner contact person table"],
  [/\bCustomer\b/g, "Business partner"], [/(?<!corporate )\bcustomers\b/g, "business partners"], [/\bcustomer\b/g, "business partner"],
  [/\bClient\b/g, "Business partner"], [/\bclients\b/g, "business partners"], [/\bclient\b/g, "business partner"],
];
const MQC_RESIDUAL = { zh: /业务往来方|交易方|客户/, en: /\b[Cc]lients?\b|\bCustomer\b|(?<!corporate )\bcustomers?\b|[Bb]usiness-partner|contact table/ };
const MQC_EXPECT = { "2009h21a-q097": [16, 16], "2009h21a-q098": [30, 27], "2009h21a-q099": [41, 38], "2009h21a-q100": [21, 18] };
// q098 エ en "position" → 図 1 の列名・解説と同じ "job title" (役職)
FIX["2009h21a-q098"].push(["en", "エ", "Name, position", "Name, job title", 1]);

const MARK = "fidfix-S130-t1";
const BANK = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8"));
const pg = (id) => { const b = (BANK.questions ?? BANK).find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 正解肢 (またはその参照先) に当たる是正 + semantic 是正。
//   追記しない: cosmetic で正解肢外のもの (q093 / q095 / q096 / q098 / q099 / 2012h24a-q096 / 2013h25h-q090・q092 / 2014h26a-q100 / 2014h26h-q048)
const NOTE_APPEND = {
  "2009h21a-q094": (p) => `（S130 T1: ${p} の jp 表・図・選択肢はいずれも「商品あ〜こ」だが、zh / en の表 (中問B 前文) だけが「商品甲〜癸」/「Product A〜J」で、選択肢「商品く」等と対応が取れなかったのを、表を「商品あ〜こ」/「Product あ〜こ」に揃えて是正（中問B 4 題とも）。ウは**正解肢**だが選択肢の文字列は不変で、商品回転率最大・利益率高・売上小 = 商品く = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2009h21a-q009": (p) => `（S130 T1: ${p} の jp 選択肢ウ「職能別組織」を zh が「职务制组织」(職務・役職) と訳していたのを、corpus の多数派「职能制组织」に是正（解説も追随）。誤答肢のため、複数の上司から指揮命令を受け目的別管理と職能的責任の調和を図る = マトリックス組織という導出・答え（エ）は不変 — ${MARK}）`,
  "2010h22h-q016": (p) => `（S130 T1: ${p} の jp 題幹「経営に対する信念や価値観」を zh が「经营理念与价值观」と訳し、正解肢エ「经营理念」の語が題幹に出て答えが漏れていたのを「对经营的信念与价值观」に是正。経営に対する信念や価値観を社員・顧客・社会に示すもの = 経営理念という導出・correct_answer=エ は不変 — ${MARK}）`,
  "2009h21h-q091": (p) => `（S130 T1: ${p} の jp 題幹「M さんは，障害の原因を特定するための手順を，流れ図に書いて考えてみることにした。このとき，次の図の X に入る適切な字句はどれか。」が zh で欠落し、設問文が無かったのを補った。判断2 で c・d をハブ側で差し替えても PC2 から出力できない = PC1 側ポートのソケット (ハブ) の障害という導出・correct_answer=ア は不変 — ${MARK}）`,
  "2009h21h-q098": (p) => `（S130 T1: ${p} の jp 題幹「通販業務」を zh がこの段落だけ「网购业务」(オンライン購入) と訳し、前文の「邮购业务」と別業務に見えていたのを「邮购业务」に統一。2 人一緒なら 1 時間あたり 1/36＋1/45＝1/20 を処理し 20 時間で 100 % に達する = 36 時間の点線より左で 100 % に届く線① = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2013h25a-q099": (p) => `（S130 T1: ${p} の jp 施策ラベル ①〜③ を en が (1)〜(3) と表記し、選択肢が指す〔要望事項〕(1)〜(4) と衝突していたのを ①〜③ に是正（解説も追随）。施策①〜③ はいずれも RFID の読取りで、予約者への連絡の手間 = 要望事項(3) は実現できないという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2010h22a-q100": (p) => `（S130 T1: ${p} の jp 選択肢ア〜エ「作業②」等の丸数字を en が「operation 2」等の算用数字にしていたのを、表の作業番号 ①〜⑧ に揃えて「operation ②」等に是正。イは**正解肢**だが番号表記のみの変更で、クリティカルパス上の作業④を 1.5 時間短縮すると全体が 1.5 時間短くなるという導出・correct_answer=イ は不変 — ${MARK}）`,
};

// 仕事 2 / 3 の note (いずれも正解肢の文字列が変わる。ラベル・訳語のみ)
Object.assign(NOTE_APPEND, {
  "2010h22h-q095": (p) => `（S130 T1 D-169: ${p} の jp 候補 ①〜④ を en が (1)〜(4) と表記し、条件・手続・処理仕様の (1)〜(4) と衝突していたのを、候補・選択肢 d/e/f・解説とも ①〜④ に是正。アは**正解肢**だが番号表記のみの変更で、返却日が空白値の貸出レコードを抽出 (③) し、無ければ貸出可能 (①)、有れば貸出中 (②) という導出・correct_answer=ア は不変 — ${MARK}）`,
  "2013h25a-q087": (p) => `（S130 T1 D-169: ${p} の jp 契約項目 ①〜④ を en が (1)〜(4) と表記し、状況説明の (1)〜(3) と衝突していたのを、項目・選択肢・解説とも ①〜④ に是正。イは**正解肢**だが番号表記のみの変更で、期間短縮 = 納期 (③) の前倒しと工数増に伴う契約金額 (①) の変更という導出・correct_answer=イ は不変 — ${MARK}）`,
  "2011h23a-q092": (p) => `（S130 T1 D-169: ${p} の図 4 の 画像①〜③ を en の選択肢・解説が "Image (1)" 等と表記し、処理概要の (1)〜(4) と同じ記法だったのを "Image ①" 等に是正。イは**正解肢**だが番号表記のみの変更で、回転前後の圧縮後文字数の差が 画像① +17 > 画像③ 0 > 画像② −17 という導出・correct_answer=イ は不変 — ${MARK}）`,
  "2009h21a-q098": (p) => `（S130 T1 D-161: ${p} の jp「取引先」の zh / en 訳語が中問C の中で 业务往来方・客户・交易方 / business partner・Customer・Client に割れていたのを、corpus の多数派「交易对象」/ "business partner" に組内で統一（題幹・図 1・選択肢・解説、4 題とも）。en 選択肢エの「役職」も図 1 の列名どおり "job title" に。ウは**正解肢**だが訳語のみの変更で、取引先ごとに部署ごと 1 人 = 取引先コード＋部署名で一意という導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2009h21a-q099": (p) => `（S130 T1 D-161: ${p} の jp「取引先」の zh / en 訳語を中問C の中で「交易对象」/ "business partner" に統一（選択肢の表名も図 1 と同じ「交易对象负责人表」「交易对象表」/ "Business partner contact person table" "Business partner table" に）。イは**正解肢**だが表名の訳語のみの変更で、明細は商品数 n 回・宛先は 1 回 = 販売単価表＝商品表≧取引先担当者表＝取引先表という導出・correct_answer=イ は不変 — ${MARK}）`,
  "2009h21a-q100": (p) => `（S130 T1 D-161: ${p} の jp「取引先コード」の zh / en 訳語を中問C の中で「交易对象代码」/ "Business partner code" に統一（選択肢ア〜エ・解説）。ウは**正解肢**だが列名の訳語のみの変更で、伝票番号で見出しと明細を結ぶ 2 表構成という導出・correct_answer=ウ は不変 — ${MARK}）`,
});

const exams = [...new Set([...Object.keys(FIX), ...Object.keys(EXPL), ...Object.keys(MQC_EXPECT)].map((id) => id.split("-q")[0]))].sort();
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const noteExams = [...new Set(Object.keys(NOTE_APPEND).map((id) => id.split("-q")[0]))];
const GR = Object.fromEntries(noteExams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));
const T1 = new Map();
const tr1 = (id) => { if (!T1.has(id)) { const f = P("data/ip/quiz/.phase1", `tr_${id}.json`); T1.set(id, { f, d: existsSync(f) ? rj(f) : null }); } return T1.get(id).d; };
const EX = new Map();
const expl = (id) => { if (!EX.has(id)) { const f = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`); EX.set(id, { f, d: rj(f) }); } return EX.get(id).d; };

for (const [id, list] of Object.entries(FIX)) {
  const t = TR[id.split("-q")[0]].questions[id], t1 = tr1(id);
  if (!t) throw new Error(`${id}: sidecar に無い`);
  for (const [L, field, from, to, n] of list) {
    if (field === "stem") { subN(t.stem, L, from, to, n, `${id} translations.stem.${L}`); if (t1) subN(t1.stem, L, from, to, n, `${id} .phase1 tr_.stem.${L}`); }
    else { subN(t.choices[field], L, from, to, n, `${id} translations.choices.${field}.${L}`); if (t1) subN(t1.choices.find((c) => c.letter === field), L, from, to, n, `${id} .phase1 tr_.choices.${field}.${L}`); }
  }
}
for (const [id, list] of Object.entries(EXPL)) {
  const tr = expl(id);
  for (const [w, L, from, to, n] of list) {
    const o = w === "correct" ? tr.correct : w.startsWith("d:") ? tr.distractors.find((d) => d.letter === w.slice(2)) : tr.points[Number(w.slice(2))];
    subN(o, L, from, to, n, `${id} expl_tr.${w}.${L}`);
  }
}

// 仕事 3: mqC。規則を順に当て、置換数を数える (書き換えは数が MQC_EXPECT と一致したときだけ)
const mqcApply = (s, rules) => { let k = 0; for (const [re, to] of rules) s = s.replace(re, () => { k++; return to; }); return [s, k]; };
for (const [id, [ez, ee]] of Object.entries(MQC_EXPECT)) {
  const t = TR["2009h21a"].questions[id], x = expl(id), t1 = tr1(id);
  const objs = [t.stem, ...Object.values(t.choices), x.correct, ...x.distractors, ...x.points];
  const plan = [];
  let kz = 0, ke = 0;
  for (const o of objs) for (const [L, rules] of [["zh", MQC_ZH], ["en", MQC_EN]]) {
    const [next, k] = mqcApply(o[L], rules);
    if (k) { plan.push([o, L, next]); if (L === "zh") kz += k; else ke += k; }
  }
  if (kz + ke === 0) { skipped++; }
  else if (kz !== ez || ke !== ee) throw new Error(`${id} mqC: 置換数 zh ${kz} / en ${ke} (expected ${ez} / ${ee}) — abort`);
  else { for (const [o, L, next] of plan) o[L] = next; applied++; log.push(`  ✓ ${id} mqC 取引先: zh ×${kz} / en ×${ke} (sidecar + expl_tr)`); }
  // .phase1 tr_ (設問固有部だけを持つ) にも同じ規則を当てる (数は報告のみ、事後に残存 0 を検査)
  if (t1) for (const o of [t1.stem, ...t1.choices]) for (const [L, rules] of [["zh", MQC_ZH], ["en", MQC_EN]]) {
    const [next, k] = mqcApply(o[L], rules);
    if (k) { o[L] = next; log.push(`  ✓ ${id} mqC 取引先 .phase1 tr_.${o.letter ?? "stem"}.${L}: ×${k}`); }
  }
  for (const o of [...objs, ...(t1 ? [t1.stem, ...t1.choices] : [])]) for (const L of ["zh", "en"])
    if (MQC_RESIDUAL[L].test(o[L])) throw new Error(`${id} mqC: ${L} に旧訳語が残存「${o[L].match(MQC_RESIDUAL[L])[0]}」`);
}

// 中問B: 4 題の zh / en 表に 甲〜癸 / Product A〜J の行ラベルが残っていないこと
for (const n of ["093", "094", "095", "096"]) {
  const t = TR["2009h21a"].questions[`2009h21a-q${n}`];
  if (/\| 商品[甲乙丙丁戊己庚辛壬癸] \|/.test(t.stem.zh) || /\| Product [A-J] \|/.test(t.stem.en)) throw new Error(`2009h21a-q${n}: 表に旧ラベルが残存`);
}

for (const { f, d } of T1.values()) if (d) wj(f, d);
for (const { f, d } of EX.values()) wj(f, d);
for (const e of exams) wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]);

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk(pg(id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pg(id)}, round1 untouched)`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  exams: ${exams.join(" ")}`);
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S130-t1: applied ${applied}, skipped ${skipped}`);
