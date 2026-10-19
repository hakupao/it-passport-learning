#!/usr/bin/env node
// Stage 6 / Quiz — S126 ⑤-2 全量保真掃引 **U10** (2025r07、80 問 / Sonnet 5 単 pass) の差分を是正する。
// 源: S126 の workflow `wf_5a64e0c3-6dc`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u10_2025r07_sn.json
//     マニフェスト = data/ip/quiz/.phase2/u10_fidelity_input_2025r07.json (precrop 80/80)
//     機械 diff = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 398 / AGENT_MISSED 2 (q005 = agent の source_text 断片による整列ずれ、q072 = 空欄枠の描画補助 [ a ]) / VERDICT_CONFLICT 0
//
// 層・方針は quiz-fidfix-S122-u3a 〜 S125-u9 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される
//   - explanations は .phase2 (expl_jp_ / expl_tr_) が真相源 → 是正後に quiz-phase2-merge で再生成 (D-143)
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2025r07 の sidecar のキーは `stem` / `choices` / `stem_jp_clean` (57 題) で、**`choices_jp_clean` は存在しない** (実測)。
// 選択肢は raw 3 層がそのまま出荷層 → 下記の選択肢是正はすべて**学習者に見えていた**腐敗。
// q088 は stem_jp_clean を持たない (raw stem が出荷層)。
//
// U9 からの変更 (U9 Rule D NIT-2 / NIT-3 と U9 ⑨「EXPL と LITSUB の独立 rj()」の反映。それ以外の適用ループは U9 から流用):
//   (1) NIT-2: 最上位の引用符ヘルパ名 `q` と FIX ループの設問変数 `q` の同名をやめ、ループ側を `qq` に改名 (本 unit は引用符ヘルパ自体が不要)
//   (2) NIT-3: subN の事後確認を「置換前の to 出現数 + n と一致」に強化
//   (3) ⑨: expl ファイルは `expl(id)` で**1 回だけ**読み、全ループで同じ object を共有して最後にまとめて wj する
//       (同じ id が複数ループに入っても前の編集が失われない)
//
// 採用した差分 (14 題 / evidence §6。源 crop / 源ページを原寸〜4 倍で独立実読して確認):
//   q005 stem   (p03) clean「「期首棚卸高＋…期末棚卸高」」→ 源 “…” (raw の ASCII " は「十」「一」の崩れと同居 → N5 据置)
//   q009 ア     (p05) 「育定派」→ 源「肯定派」
//   q014 stem   (p07) clean「現状の強み」→ 源「現状の俯瞰」(s975 再構成の推測語。raw は「佑典」で N5。zh「优势」/ en "strengths" も追随)
//   q024 イ     (p11) 「搬送かなど」→ 源「搬送など」
//   q033 stem   (p15) clean「レベル1」「レベル5」「条件付運転自動化」「レベル3」の「」→ 源 “” (raw は ASCII 混在の崩れで N5)
//   q052 イ     (p24) 末尾の「␠×11「」除去
//   q070 stem   (p33) clean「修正する」→ 源「是正する」(raw「量正」は N5。zh「修复」/ en "fix" は語義上同値で不変)
//   q072 stem   (p34) clean「[四つの原則]」(raw「[四つの原則]〕」) → 源〔四つの原則〕(zh〔四个原则〕、en [Four principles] 据置)
//   q078 stem   (p37) raw「[プログラム]」→ 源〔プログラム〕(指示で名指し。clean / sidecar zh は既に〔〕、.phase1 zh [程序]→〔程序〕)
//   q085 stem   (p40) clean「現在の正解率が89%…90%を超える」→ 源「30%…35%」(s975 再構成の捏造数値。zh / en・解説全面追随)
//   q088 stem   (p41) raw の閉じ引用符 ASCII " ×4 → 源 ”
//   q091 ア     (p42) 末尾の「␠×12「」除去 / エ (**正解肢**) 末尾の「に」除去
//   q095 ウ     (p44) 「項目問」→ 源「項目間」(**正解肢**)
//   q098 stem   (p45) clean / raw「[手順]」→ 源〔手順〕(zh は既に〔步骤〕、en [Procedure] 据置)
//
// Run: node scripts/quiz-fidfix-S126-u10.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S126-u10.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2025r07
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

// subN: 出現数 n を厳密に要求して全置換。0 回なら skip (冪等)、n と違えば中断。
// NIT-3: 事後確認は「置換前の to 出現数 + n」と完全一致。
function subN(obj, key, from, to, n, where) {
  const s = obj?.[key];
  if (typeof s !== "string") throw new Error(`${where}: field ${key} missing`);
  const k = s.split(from).length - 1;
  if (k === 0) { skipped++; return false; }
  if (k !== n) throw new Error(`${where}: 「${from}」 occurs ${k}× (expected ${n}) — abort`);
  const before = s.split(to).length - 1;
  const next = s.split(from).join(to);
  if (next.split(to).length - 1 !== before + n) throw new Error(`${where}: 置換後の to 「${to}」 の出現数が ${before}+${n} と一致しない — abort`);
  obj[key] = next; applied++; log.push(`  ✓ ${where}: 「${from}」→「${to}」 ×${n}`); return true;
}

const FIX = {
  // ── 題幹 ────────────────────────────────────────────────────────────────────
  "2025r07-q005": { jp: [["stem", "売上原価を「期首棚卸高＋当期商品仕入高－期末棚卸高」で計算", "売上原価を“期首棚卸高＋当期商品仕入高－期末棚卸高”で計算"]] },
  "2025r07-q014": {
    jp: [["stem", "現状の強みや将来展望", "現状の俯瞰や将来展望"]],
    zh: [["stem", "并将现状的优势和未来展望等分析结果", "并将对现状的俯瞰和未来展望等分析结果"]],
    en: [["stem", "such as current strengths and future outlook", "such as a bird's-eye view of the current situation and future outlook"]],
  },
  "2025r07-q033": {
    jp: [
      ["stem", "一般的に「レベル1」から「レベル5」に分けられている。「条件付運転自動化」と呼ばれる「レベル3」が示す", "一般的に“レベル1”から“レベル5”に分けられている。“条件付運転自動化”と呼ばれる“レベル3”が示す"],
    ],
  },
  "2025r07-q070": { jp: [["stem", "脆弱性を修正するセキュリティパッチ", "脆弱性を是正するセキュリティパッチ"]] },
  // q072: clean「[四つの原則]」、raw「[四つの原則]〕」(崩れ)。どちらも〔〕へ (U9 q062 precedent)。
  "2025r07-q072": {
    jp: [["stem", "[四つの原則]〕", "〔四つの原則〕"], ["stem", "[四つの原則]", "〔四つの原則〕"]],
    zh: [["stem", "[四个原则]", "〔四个原则〕"]],
  },
  // q078: raw のみ (clean / sidecar zh は既に〔〕)。.phase1 zh「[程序]」は sidecar に揃える。
  "2025r07-q078": {
    jp: [["stem", "[プログラム]", "〔プログラム〕"]],
    zh: [["stem", "[程序]", "〔程序〕"]],
  },
  // q085: clean の数値は s975 再構成の推測 (raw は「399%%」「359%」の崩れで N5)。源 30% / 35%。
  "2025r07-q085": {
    jp: [["stem", "現在の正解率が89%であるとき, 正解率が90%を超える", "現在の正解率が30%であるとき, 正解率が35%を超える"]],
    zh: [["stem", "当前正确率为 89% 时，为使正确率超过 90%", "当前正确率为 30% 时，为使正确率超过 35%"]],
    en: [["stem", "When the current accuracy rate is 89%, at least how many more rounds of learning are needed for the accuracy rate to exceed 90%?", "When the current accuracy rate is 30%, at least how many more rounds of learning are needed for the accuracy rate to exceed 35%?"]],
  },
  // q088: clean 無し → raw stem が出荷層。閉じ引用符の ASCII " ×4 → ” (subN、下の STEMN)。
  "2025r07-q098": { jp: [["stem", "[手順]", "〔手順〕"]] },
  // ── 選択肢 ──────────────────────────────────────────────────────────────────
  "2025r07-q009": { jp: [["ア", "育定派と否定派", "肯定派と否定派"]] },
  "2025r07-q024": { jp: [["イ", "組立てや搬送かなどに", "組立てや搬送などに"]] },
  "2025r07-q052": { jp: [["イ", `プロジェクトマネージャ${" ".repeat(11)}「`, "プロジェクトマネージャ"]] },
  // q091: エ は **正解肢** (correct_answer=エ は不変)。
  "2025r07-q091": { jp: [["ア", `保有の順番で進める。${" ".repeat(12)}「`, "保有の順番で進める。"], ["エ", "リスク低減に該当する。に", "リスク低減に該当する。"]] },
  // q095: ウ は **正解肢** (correct_answer=ウ は不変)。
  "2025r07-q095": { jp: [["ウ", "項目問の関連", "項目間の関連"]] },
};
// raw stem の多重出現 (subN、3 層): q088 閉じ引用符。
const STEMN = { "2025r07-q088": [["対策\"", "対策”", 4]] };

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  q085 のみ: 題幹の数値 (89/90) に基づく導出を源の数値 (30/35) で書き直す (field 全文の assert-once 置換)。
//    誤り率 70% → 1 回後 0.70×0.95=0.665 (正解率 33.5%、35% 超えず) → 2 回後 0.70×0.9025=0.63175 (正解率 36.825%、35% 超)。答えイ (2 回) 不変。
//    ア の誤解説明は「11%-5%=6%」の引き算型が 30/35 では成立しない (引き算でも正解率ちょうど 35% で超えない) ため、
//    「正解率が 5 ポイント上がる」誤解に書き換えた (evidence §4b、**Rule D 確認点**)。エ は数値を含まず不変。
const EXPL = {
  "2025r07-q085": {
    correct: {
      jp: ["「正解率が90%を超える」=「誤り率が10%未満になる」と言い換えるのが要点です。現在の正解率89%なので誤り率は11%(=0.11)。1回学習するごとに誤り率は前回の95%(×0.95)になります。n回後の誤り率は 0.11×0.95ⁿ。1回後は 0.11×0.95=0.1045(=10.45%)で誤り率はまだ10%以上、正解率は89.55%で90%を超えません。2回後は 0.11×0.95²=0.11×0.9025≒0.0993(=9.93%)で初めて誤り率が10%を下回り、正解率は約90.07%となって90%を超えます。よって少なくとも2回が必要で、正解はイです。",
        "「正解率が35%を超える」=「誤り率が65%未満になる」と言い換えるのが要点です。現在の正解率30%なので誤り率は70%(=0.70)。1回学習するごとに誤り率は前回の95%(×0.95)になります。n回後の誤り率は 0.70×0.95ⁿ。1回後は 0.70×0.95=0.665(=66.5%)で誤り率はまだ65%以上、正解率は33.5%で35%を超えません。2回後は 0.70×0.95²=0.70×0.9025=0.63175(=63.175%)で初めて誤り率が65%を下回り、正解率は36.825%となって35%を超えます。よって少なくとも2回が必要で、正解はイです。"],
      zh: ["要点是把「正确率超过 90%」换算成「错误率低于 10%」。当前正确率为 89%，所以错误率为 11%(=0.11)。每学习一次，错误率会变成上一次的 95%(×0.95)。n 次之后的错误率为 0.11×0.95ⁿ。1 次之后为 0.11×0.95=0.1045(=10.45%)，错误率仍在 10% 以上，正确率为 89.55%，未超过 90%。2 次之后为 0.11×0.95²=0.11×0.9025≈0.0993(=9.93%)，错误率首次低于 10%，正确率约为 90.07%，超过了 90%。因此至少需要 2 次，正确答案为イ。",
        "要点是把「正确率超过 35%」换算成「错误率低于 65%」。当前正确率为 30%，所以错误率为 70%(=0.70)。每学习一次，错误率会变成上一次的 95%(×0.95)。n 次之后的错误率为 0.70×0.95ⁿ。1 次之后为 0.70×0.95=0.665(=66.5%)，错误率仍在 65% 以上，正确率为 33.5%，未超过 35%。2 次之后为 0.70×0.95²=0.70×0.9025=0.63175(=63.175%)，错误率首次低于 65%，正确率为 36.825%，超过了 35%。因此至少需要 2 次，正确答案为イ。"],
      en: ["The key is to rephrase “accuracy rate exceeds 90%” as “error rate falls below 10%”. The current accuracy rate is 89%, so the error rate is 11% (=0.11). Each round of learning makes the error rate 95% of the previous value (×0.95). The error rate after n rounds is 0.11×0.95ⁿ. After 1 round it is 0.11×0.95=0.1045 (=10.45%), so the error rate is still 10% or more and the accuracy rate is 89.55%, not exceeding 90%. After 2 rounds it is 0.11×0.95²=0.11×0.9025≈0.0993 (=9.93%), so the error rate falls below 10% for the first time and the accuracy rate becomes about 90.07%, exceeding 90%. Therefore at least 2 rounds are needed, and the correct answer is イ.",
        "The key is to rephrase “accuracy rate exceeds 35%” as “error rate falls below 65%”. The current accuracy rate is 30%, so the error rate is 70% (=0.70). Each round of learning makes the error rate 95% of the previous value (×0.95). The error rate after n rounds is 0.70×0.95ⁿ. After 1 round it is 0.70×0.95=0.665 (=66.5%), so the error rate is still 65% or more and the accuracy rate is 33.5%, not exceeding 35%. After 2 rounds it is 0.70×0.95²=0.70×0.9025=0.63175 (=63.175%), so the error rate falls below 65% for the first time and the accuracy rate becomes 36.825%, exceeding 35%. Therefore at least 2 rounds are needed, and the correct answer is イ."],
    },
    dist: {
      ア: {
        jp: ["1回では 0.11×0.95=0.1045(誤り率10.45%、正解率89.55%)で、まだ90%を超えません。誤り率5%低下を「11%-5%=6%」のような単純な引き算と誤解すると1回で足りると見えますが、実際は前回の95%を掛ける比例的な減少なので不足です。",
          "1回では 0.70×0.95=0.665(誤り率66.5%、正解率33.5%)で、まだ35%を超えません。誤り率5%低下を「正解率が5ポイント上がる(30%→35%)」と誤解すると1回で届くように見えますが、それでも正解率はちょうど35%で「超える」条件を満たしません。実際は前回の95%を掛ける比例的な減少で、1回後の正解率は33.5%にとどまるので不足です。"],
        zh: ["1 次时为 0.11×0.95=0.1045(错误率 10.45%，正确率 89.55%)，仍未超过 90%。若把错误率下降 5% 误解为「11%-5%=6%」这样简单的减法，就会以为 1 次就够，但实际上是乘以上一次的 95% 的比例性下降，所以不够。",
          "1 次时为 0.70×0.95=0.665(错误率 66.5%，正确率 33.5%)，仍未超过 35%。若把错误率下降 5% 误解为「正确率提高 5 个百分点(30%→35%)」，似乎 1 次就能达到，但即便如此正确率也只是恰好 35%，并不满足「超过」的条件。实际上是乘以上一次的 95% 的比例性下降，1 次之后的正确率只有 33.5%，所以不够。"],
        en: ["After 1 round it is 0.11×0.95=0.1045 (error rate 10.45%, accuracy rate 89.55%), still not exceeding 90%. If you misinterpret the 5% drop in error rate as simple subtraction like “11%-5%=6%”, you might think 1 round is enough, but in reality it is a proportional decrease of multiplying by 95% of the previous value, so it is insufficient.",
          "After 1 round it is 0.70×0.95=0.665 (error rate 66.5%, accuracy rate 33.5%), still not exceeding 35%. If you misinterpret the 5% drop in error rate as “the accuracy rate rises by 5 points (30%→35%)”, 1 round may seem enough, but even then the accuracy rate would be exactly 35%, which does not satisfy “exceeds”. In reality it is a proportional decrease of multiplying by 95% of the previous value, so the accuracy rate after 1 round is only 33.5%, which is insufficient."],
      },
      ウ: {
        jp: ["2回後に既に誤り率約9.93%(正解率約90.07%)で条件を満たすため", "2回後に既に誤り率63.175%(正解率36.825%)で条件を満たすため"],
        zh: ["在 2 次之后错误率已约为 9.93%(正确率约 90.07%)满足条件", "在 2 次之后错误率已为 63.175%(正确率 36.825%)满足条件"],
        en: ["After 2 rounds the error rate is already about 9.93% (accuracy rate about 90.07%), satisfying", "After 2 rounds the error rate is already 63.175% (accuracy rate 36.825%), satisfying"],
      },
    },
    points: [
      { idx: 0, jp: ["「正解率90%超」を「誤り率10%未満」に", "「正解率35%超」を「誤り率65%未満」に"],
        zh: ["把「正确率超过 90%」替换成「错误率低于 10%」", "把「正确率超过 35%」替换成「错误率低于 65%」"],
        en: ["Think of “accuracy rate exceeds 90%” by replacing it with “error rate falls below 10%”.", "Think of “accuracy rate exceeds 35%” by replacing it with “error rate falls below 65%”."] },
      { idx: 1, jp: ["0.11×0.95ⁿ で求め、10%を下回る最小のn", "0.70×0.95ⁿ で求め、65%を下回る最小のn"],
        zh: ["用 0.11×0.95ⁿ 求出 n 次之后的错误率，依次计算找出使其低于 10% 的最小 n", "用 0.70×0.95ⁿ 求出 n 次之后的错误率，依次计算找出使其低于 65% 的最小 n"],
        en: ["using 0.11×0.95ⁿ, and compute step by step to find the smallest n that makes it fall below 10%.", "using 0.70×0.95ⁿ, and compute step by step to find the smallest n that makes it fall below 65%."] },
    ],
  },
};

const MARK = "fidfix-S126-u10";
const pg = (id) => { const b = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8")).questions.find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 語義是正 + 正解肢命中 (U3a〜U9 と同一方針)。
//   語義: q009 q014 q024 q070 q085 q095 / 正解肢命中: q091 (エ) / q095 (ウ、語義と重複)
//   追記しない (括弧・引用符・空白・残渣のみ、非正解肢): q005 q033 q052 q072 q078 q088 q098
const NOTE_APPEND = {
  "2025r07-q009": (p) => `（S126 ⑤-2 U10: ${p} 実読で 選択肢アの「育定派」を源の「肯定派」に是正。誤答肢（ディベートの説明）のため、短期間でプロトタイプを作成し成果を競う = ハッカソンという導出・答え（ウ）は不変 — ${MARK}）`,
  "2025r07-q014": (p) => `（S126 ⑤-2 U10: ${p} 実読で 題幹の「現状の強み」を源の「現状の俯瞰」に是正（上記「clean では『強み』に是正済み」は誤りで、『強み』は raw の OCR 誤り「佑典」からの推測語。zh / en も追随）。知財情報を経営情報に組み込んで分析し経営戦略に反映 = IP ランドスケープという導出・答え（イ）は不変 — ${MARK}）`,
  "2025r07-q024": (p) => `（S126 ⑤-2 U10: ${p} 実読で 選択肢イの「搬送かなど」を源の「搬送など」に是正（源に無い「か」の挿入）。誤答肢（産業用ロボットの説明）のため、ソフトウェアロボットで定型事務作業を自動化 = RPA という導出・答え（エ）は不変 — ${MARK}）`,
  "2025r07-q070": (p) => `（S126 ⑤-2 U10: ${p} 実読で 題幹の「脆弱性を修正する」を源の「脆弱性を是正する」に是正（上記「clean で『修正』に是正済」の『修正』は raw の OCR 誤り「量正」からの推測語で、源は「是正」）。語義は同等で、パッチ適用が最も有効 = バッファオーバーフローという導出・答え（エ）は不変 — ${MARK}）`,
  "2025r07-q085": (p) => `（S126 ⑤-2 U10: ${p} 実読で 題幹の「現在の正解率が89%」「90%を超える」を源の「30%」「35%」に是正（上記の 89% / 90% は stem_jp_clean の再構成が raw の崩れ「399%%」「359%」から推測した数値で、源と違う）。源の数値では 誤り率 70% → 1回後 0.70×0.95=0.665（正解率 33.5%、35% を超えない）→ 2回後 0.70×0.9025=0.63175（正解率 36.825%、35% 超）で少なくとも2回、導出字母イ・correct_answer=イ は不変。解説は jp / zh / en とも源の数値で書き直した — ${MARK}）`,
  "2025r07-q091": (p) => `（S126 ⑤-2 U10: ${p} 実読で 選択肢エ末尾の源に無い「に」と、選択肢ア末尾の空白・「「」（OCR 残渣）を除去。エは**正解肢**だが変更は文末の残渣のみで、持出し管理の厳重化 = リスク低減という導出・correct_answer=エ は不変 — ${MARK}）`,
  "2025r07-q095": (p) => `（S126 ⑤-2 U10: ${p} 実読で 選択肢ウの「項目問」を源の「項目間」に是正。ウは**正解肢**で、データ項目の洗い出しと項目間の関連の整理 = データ分析という導出・correct_answer=ウ は不変 — ${MARK}）`,
};

// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set([...Object.keys(FIX), ...Object.keys(STEMN)].map((id) => id.split("-q")[0]))];
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
for (const [id, list] of Object.entries(STEMN)) {
  const exam = id.split("-q")[0];
  const qq = Qdoc.questions.find((x) => x.id === id), b = Barr.find((x) => x.id === id), y = BY[exam].questions.find((x) => x.id === id), t = TR[exam].questions[id];
  if (t?.stem_jp_clean) throw new Error(`${id}: stem_jp_clean が在る — STEMN は raw 出荷層専用`);
  for (const [from, to, n] of list) for (const [o, w] of [[qq, "questions.stem_jp"], [b, "question_bank.stem_jp"], [y, "by_year.stem_jp"]]) subN(o, "stem_jp", from, to, n, `${id} ${w}`);
}
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

// ⑨ (U9): expl は id ごとに 1 回だけ読み、全ループで共有する。
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
  if (ex.correct) {
    const [cj, cz, ce] = [ex.correct.jp, ex.correct.zh, ex.correct.en];
    if (cj) sub(j, "correct_jp", cj[0], cj[1], `${id} expl_jp.correct_jp`);
    if (cz) sub(tr.correct, "zh", cz[0], cz[1], `${id} expl_tr.correct.zh`);
    if (ce) sub(tr.correct, "en", ce[0], ce[1], `${id} expl_tr.correct.en`);
  }
  for (const [L, d] of Object.entries(ex.dist ?? {})) {
    const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    if (!dj || !dt) throw new Error(`${id} distractor ${L} missing`);
    if (d.jp) sub(dj, "why_wrong_jp", d.jp[0], d.jp[1], `${id} expl_jp.${L}`);
    if (d.zh) sub(dt, "zh", d.zh[0], d.zh[1], `${id} expl_tr.${L}.zh`);
    if (d.en) sub(dt, "en", d.en[0], d.en[1], `${id} expl_tr.${L}.en`);
  }
  for (const p of ex.points ?? []) {
    if (p.jp) { const [f, t] = p.jp; const arr = j.points_jp; if (typeof arr?.[p.idx] !== "string") throw new Error(`${id} points_jp[${p.idx}] missing`);
      const box = { v: arr[p.idx] }; if (sub(box, "v", f, t, `${id} expl_jp.points[${p.idx}]`)) arr[p.idx] = box.v; }
    for (const L of ["zh", "en"]) if (p[L]) { const [f, t] = p[L]; if (typeof tr.points?.[p.idx]?.[L] !== "string") throw new Error(`${id} expl_tr.points[${p.idx}].${L} missing`);
      sub(tr.points[p.idx], L, f, t, `${id} expl_tr.points[${p.idx}].${L}`); }
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S126-u10: applied ${applied}, skipped ${skipped}`);
