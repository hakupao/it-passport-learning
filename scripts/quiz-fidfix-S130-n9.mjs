#!/usr/bin/env node
// Stage 6 / Quiz — S130 **⑨ cleanup** (n9-fixer): S130 で ⑨ に登記した小口 4 件を是正する。
// (⑨-(a) page pointer の tracked 決定記録は本 script ではなく evidence/phase5/stage_06_quiz_fidelity/pagefix_S129_backfill_decisions.json
//  + quiz-pagefix-apply.mjs が担う。evidence/quiz_n9_cleanup_S130.md §1)
//
// 層・方針は quiz-fidfix-S130-t2 / -x1 と同じ (subN で出現数を厳密に要求・0 回なら skip / sidecar と .phase1 tr_ の両方に当てる
// (.phase1 が sidecar と乖離していれば不触で記録) / expl は .phase2 expl_jp_ / expl_tr_ を直して phase2-merge で再生成 /
// D-143 note は final に純粋後置・round1 不可触)。
//
// ── 是正 (evidence §2〜§5。源ページを原寸で実読して確認) ──
//   (b) 2015h27a-q021 解説: 誤答肢エ MBO を「目標による管理 (Management by Objectives)」と説明していたのを、本問の文脈の
//       Management Buyout (経営陣による自社買収) に是正 (jp / zh / en、エの why_wrong と points[1])。選択肢 BCP / CSR / M&A / MBO は
//       企業活動・経営戦略の用語群で、M&A と並ぶ MBO は corpus の先例 (2013h25h-q006 / 2017h29a-q021 の解説) と同じく買収の手法。
//       同じ略語が人事の目標管理も指すことは 1 文で残す (2014h26a-q022 / 2018h30h-q028 の解説と同じ扱い)。correct_answer=イ 不変。
//   (c) 2009h21a-q098 final note: 【S116 裁決】の末尾「key ア 不変」は S116 note の転記誤り (quiz-phase2-explfix-S116.mjs:55。
//       同 script の他 23 題の「key X 不変」はすべて correct_answer と一致、q098 だけ不一致)。correct_answer=ウ は全層・全履歴で ウ、
//       源 p40 前文 + 図1 / p41 から ウ を再導出。旧文は書き換えず訂正 note を後置 (D-143)。
//   (d) 2016h28h-q096 zh 題幹: 「成绩」/「%」→ “成绩”/“%” (D-151、選択肢の “%子” 等と題内で字形を揃える)。
//       .phase1 tr_ の zh 題幹は ASCII " で sidecar と乖離 → 不触 (出荷層は sidecar)。
//   (e) 2015h27a-q100 表示層 (stem_jp_clean) の表見出し「処理速度(バイト/分)」→ 源 p47「処理速度（バイト／分）」
//       (単位表記で D-162 の式中演算子ではない)。raw 3 層の stem_jp は表を持たない。zh / en は不変。
//
// ── 追加 (lead 範囲追加、S130 解説監査 pilot evidence/phase5/stage_06_quiz_phase2/ruleA_result_S130_eaudit_pilot.json の指摘) ──
//   (f) 2011h23tokubetsu-q093 誤答肢ウの解説: 第 1 の理由が反例 J＝−5 を使い、題幹の「J，K は 0 以上の整数」と矛盾していた。
//       J，K≧0 なら和 ≦20 で各値も ≦20 になるので、ウの本当の欠陥は逆向きで、正当な注文 (J＝15，K＝10) を L＝−1 で弾くこと。
//       第 1 の理由をそれに差し替え、後段 (割引枝がほぼ死ぬ) と結論は残す (jp / zh / en)。
//   (g) アンチパスバックの zh 訳「防尾随」→「反潜回」(門禁業界の定着語)。「尾随」は同じ題の「共連れ」の訳語で、方式名と
//       それが防ぐ不正が同じ語になる (2022r04-q074 では正解肢ア「防尾随」が題幹の「防止…尾随」と字面で直結 = 答えの手掛かり)。
//       corpus の jp「アンチパスバック」4 題 (2016h28a-q098 / 2022r04-q074 / 2025r07-q077 + 解説だけの 2021r03-q058) に当てる。
//       jp「共連れ防止」の訳としての「防尾随」(2022r04-q074 解説イ・要点 2) は正しい訳なので不触 (field 単位で列挙)。
//   (h) 2020r02o-q094 誤答肢アの解説: ア は ②完全性 に加えて ③機密性 も誤り (③ は完全性)。「②が誤り」で終わり ③ を正と読める
//       のを、③ も誤りと書き足す (jp / zh / en)。
//   (i) 2011h23tokubetsu-q095: d＝0.9×(3,000×15＋1,000×15)＝54,000、e は K＝30＞20 で −1 → イ を再導出 (一致)。
//       監査の key_guard_valid=false は round1 の stem_corruption_suspected / figure_derivable=false が残り suspect=true のため。
//       これは D-143 §4/§5 の union 則 (anti-masking) による仕様で、flag は触らず note で解消済を明記する。
//       正解解説が学習者に見えない「図1 の流れ図」(本問の題幹に無い) を根拠にしていたのを〔処理内容〕(1) に差し替え、
//       zh 末尾の「正解」(日式) を「正确答案」に揃える。
//
// Run: node scripts/quiz-fidfix-S130-n9.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S130-n9.mjs --apply    (D-152 lock 取得後のみ)
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs <exam>  (2009h21a 2011h23tokubetsu 2015h27a 2016h28a 2016h28h 2020r02o 2021r03 2022r04 2025r07)
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

// subN: 出現数 n を厳密に要求して全置換。0 回なら skip (冪等)、n と違えば中断。事後確認つき (quiz-fidfix-S130-t2 と同じ)。
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

// ── (b) 2015h27a-q021 解説 ──
const Q021 = "2015h27a-q021";
const Q021_JP = [
  ["d:エ", "MBO (Management by Objectives＝目標による管理) は、従業員が上司と話し合って自ら目標を設定し、その達成度で評価する人事・組織マネジメント手法。社内の目標管理の仕組みであり、社会課題への取り組みという企業理念ではないので誤り。",
    "MBO (Management Buyout＝経営陣による自社買収) は、経営陣が自社の株式や事業部門を買い取って経営権を取得する、M&A の手法の一つ。資本・所有を移す取引の手法であり、社会課題への取り組みという企業理念ではないので誤り。なお同じ略語の MBO は人事の目標管理 (Management by Objectives) も指すが、M&A と並ぶ本問の文脈では経営陣による買収を指す。", 1],
  ["p:1", "MBO＝目標による管理。", "MBO＝経営陣による自社買収 (マネジメントバイアウト)。", 1],
];
const Q021_TR = [
  ["d:エ", "zh", "MBO（Management by Objectives＝目标管理）是指员工与上司协商后自行设定目标、并按目标达成度进行评价的人事与组织管理手段。它是公司内部的目标管理机制，并非应对社会课题的企业理念，因此错误。",
    "MBO（Management Buyout＝管理层收购）是指管理层买下本公司的股份或业务部门、取得经营权的手段，属于 M&A 的一种。它是转移资本与所有权的交易手段，并非应对社会课题的企业理念，因此错误。另外，同一缩写 MBO 也指人事上的目标管理（Management by Objectives），但在与 M&A 并列的本题语境中指管理层收购。", 1],
  ["d:エ", "en", "MBO (Management by Objectives) is a human-resource and organizational management technique in which employees set their own goals through discussion with their supervisors and are evaluated by how well they achieve them. It is an in-house goal-management mechanism, not a corporate ideal of addressing social issues, so it is wrong.",
    "MBO (Management Buyout) is a form of M&A in which a company's management buys the company's shares or a business division and acquires control of it. It is a technique for transferring capital and ownership, not a corporate ideal of addressing social issues, so it is wrong. The same abbreviation MBO can also mean Management by Objectives in human-resource management, but listed alongside M&A in this question it refers to the management buyout.", 1],
  ["p:1", "zh", "MBO＝目标管理。", "MBO＝管理层收购。", 1],
  ["p:1", "en", "MBO = management by objectives.", "MBO = management buyout.", 1],
];

// ── (d) 2016h28h-q096 zh 題幹 ──
const Q096 = "2016h28h-q096";
const Q096_ZH = [["「成绩」表", "“成绩”表", 1], ["「%」表示", "“%”表示", 1]];

// ── (e) 2015h27a-q100 stem_jp_clean ──
const Q100 = "2015h27a-q100";
const Q100_JP = [["| 処理速度(バイト/分) |", "| 処理速度（バイト／分） |", 1]];

// ── 追加分の解説是正 [id, where (correct | d:ア〜エ | p:idx), lang (jp | zh | en), from, to, n] ──
const EXPL_ADD = [
  // (f)
  ["2011h23tokubetsu-q093", "d:ウ", "jp",
    "「0≦J＋K≦20」は和だけを縛る条件式で、J と K それぞれの値は制限されない。例えば J＝−5、K＝25 は和が 20 なので Yes となり、負の J や 20 を超える K がそのまま金額計算に使われてしまう。",
    "「0≦J＋K≦20」は和だけを縛る条件式で、購入条件「大人と子供それぞれ 20 枚まで」と一致しない。J，K は 0 以上の整数なので和が 20 以下なら各値も 20 以下になるが、逆に条件を満たす正当な注文まで拒んでしまう。例えば J＝15、K＝10 はそれぞれ 20 枚以内で購入できるのに、和が 25 なので No となり L＝−1 が返される。", 1],
  ["2011h23tokubetsu-q093", "d:ウ", "zh",
    "「0≦J＋K≦20」是只约束和的条件表达式，J 和 K 各自的值并不受限制。例如 J＝−5、K＝25 时和为 20，所以为 Yes，于是为负的 J 和超过 20 的 K 会被原样用于金额计算。",
    "「0≦J＋K≦20」是只约束和的条件表达式，与「成人票和儿童票各自最多 20 张」的购买条件不一致。由于 J、K 是 0 以上的整数，和在 20 以下时各自的值也在 20 以下，但反过来会把满足条件的正当订单也拒绝掉。例如 J＝15、K＝10 各自都在 20 张以内、本可购买，但和为 25，所以为 No，返回 L＝−1。", 1],
  ["2011h23tokubetsu-q093", "d:ウ", "en",
    "“0≦J＋K≦20” is a conditional expression that constrains only the sum, and it does not limit the individual values of J and K. For example, J＝−5 and K＝25 give a sum of 20, so the decision is Yes, and a negative J and a K greater than 20 are used for the amount calculation as they are.",
    "“0≦J＋K≦20” is a conditional expression that constrains only the sum, which does not match the purchase condition of at most 20 adult tickets and at most 20 child tickets. Because J and K are integers of 0 or more, a sum of 20 or less also keeps each value at 20 or less, but conversely the condition rejects valid orders that meet the purchase condition. For example, J＝15 and K＝10 are each within 20 tickets and could be bought, but their sum is 25, so the decision is No and L＝−1 is returned.", 1],
  // (h)
  ["2020r02o-q094", "d:ア", "jp", "「機密性」の侵害である。②が誤り。",
    "「機密性」の侵害である。さらに③を「機密性」としているが、③は不具合で誤ったデータが記録された=データの正確さが損なわれたので「完全性」の侵害である。②と③が誤り。", 1],
  ["2020r02o-q094", "d:ア", "zh", "属于对「机密性」的侵害。②有误。",
    "属于对「机密性」的侵害。此外把③判定为「机密性」，但③是因故障记录了错误的数据＝数据的准确性受损，属于对「完整性」的侵害。②和③有误。", 1],
  ["2020r02o-q094", "d:ア", "en", "information became known to unauthorized persons. ② is wrong.",
    "information became known to unauthorized persons. In addition, this treats ③ as confidentiality, but ③ is incorrect data being recorded because of a malfunction = the accuracy of the data is lost, so it is a violation of integrity. ② and ③ are wrong.", 1],
  // (i)
  ["2011h23tokubetsu-q095", "correct", "jp", "中問B の〔処理内容〕および 図1 の流れ図のとおり、", "中問B の〔処理内容〕のとおり、", 1],
  ["2011h23tokubetsu-q095", "correct", "jp", "流れ図の No 側で L=−1 が代入されて終了する", "〔処理内容〕(1) により L=−1 が代入されて終了する", 1],
  ["2011h23tokubetsu-q095", "correct", "zh", "B 组大题的〔处理内容〕以及图1的流程图，", "B 组大题的〔处理内容〕，", 1],
  ["2011h23tokubetsu-q095", "correct", "zh", "而是在流程图的 No 一侧给 L 赋 −1 并结束", "而是按〔处理内容〕(1) 给 L 赋 −1 并结束", 1],
  ["2011h23tokubetsu-q095", "correct", "zh", "因此イ是正解。", "因此イ是正确答案。", 1],
  ["2011h23tokubetsu-q095", "correct", "en", "Following the [Processing details] of question group B and the flowchart in Figure 1, ", "Following the [Processing details] of question group B, ", 1],
  ["2011h23tokubetsu-q095", "correct", "en", "it takes the No side of the flowchart, assigns −1 to L, and ends", "under [Processing details] (1) it assigns −1 to L and ends", 1],
];
// (g) 「防尾随」→「反潜回」: jp「アンチパスバック」に対応する field だけ (件数固定)
const AP_FROM = "防尾随", AP_TO = "反潜回";
const AP_EXPL = [
  ["2016h28a-q098", "correct", 1], ["2016h28a-q098", "d:ア", 1], ["2016h28a-q098", "d:ウ", 1], ["2016h28a-q098", "d:エ", 1], ["2016h28a-q098", "p:0", 1], ["2016h28a-q098", "p:1", 1],
  ["2022r04-q074", "correct", 2], ["2022r04-q074", "p:0", 1], // 解説イ・要点 2 の「防尾随」は jp「共連れ防止」の訳 → 不触
  ["2025r07-q077", "d:ウ", 1], ["2025r07-q077", "p:1", 1],
  ["2021r03-q058", "p:1", 1],
];
const AP_TR = [["2016h28a-q098", "stem", 2], ["2022r04-q074", "ア", 1], ["2025r07-q077", "ウ", 1]]; // sidecar zh (+ .phase1 tr_)


// ── D-143 note (final のみ後置、round1 不可触) ──
const MARK = "fidfix-S130-n9";
const pgOf = (bank, id) => `page-${String(bank.find((x) => x.id === id).source.page_number).padStart(2, "0")}`;
const NOTE_APPEND = {
  [Q021]: (p) => `（S130 ⑨: ${p} の解説（jp / zh / en）が誤答肢エ MBO を「目標による管理 (Management by Objectives)」と説明していたのを、本問の文脈の Management Buyout（経営陣による自社買収、M&A の手法）に是正（エの説明と要点 2）。選択肢 BCP / CSR / M&A / MBO は企業活動・経営戦略の用語群で、M&A と並ぶ MBO は corpus の先例（2013h25h-q006 / 2017h29a-q021）と同じく買収の手法。同じ略語が人事の目標管理を指すことは解説に 1 文で残した。正解肢イ CSR の導出・correct_answer=イ は不変 — ${MARK}）`,
  "2009h21a-q098": (p) => `（S130 ⑨ 訂正: 上記【S116 裁決】末尾の「key ア 不変」は S116 note の転記誤りで、正しくは「key ウ 不変」。correct_answer は全層・全履歴で ウ（answer_keys / question_bank 各世代 / questions.json 全 commit）、${p} と前文・図1（page-40）から、担当者は原則 1 人だが取引先によっては部署ごとに 1 人 = 取引先コード＋部署名で一意 = ウを再導出。S116 で key を変えた事実は無い — ${MARK}）`,
  "2011h23tokubetsu-q093": (p) => `（S130 ⑨ 解説監査: ${p} 誤答肢ウの解説（jp / zh / en）が反例 J＝−5, K＝25 を使い、題幹の「J，K は 0 以上の整数」と矛盾していたのを是正。J，K≧0 なら和 ≦20 で各値も ≦20 になるので、ウの欠陥は正当な注文（例 J＝15, K＝10）を L＝−1 で弾くことで、これに割引枝がほぼ働かない点が加わる。各々 0〜20 を and で結ぶ = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2016h28a-q098": (p) => `（S130 ⑨ 解説監査: ${p} の zh がアンチパスバックを「防尾随」と訳し、同じ題で「共連れ」の訳語「尾随」と方式名が同じ語になっていたのを、門禁の定着語「反潜回」に是正（題幹・解説、corpus のアンチパスバック 4 題で統一）。入室済み ID の再入室・退室済み ID の再退室を規制するので共連れ入室者は退室できない = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2022r04-q074": (p) => `（S130 ⑨ 解説監査: ${p} の zh 正解肢ア「防尾随（Anti-passback）」が題幹の「防止…尾随（共連れ）」と字面で直結し答えの手掛かりになっていたのを、門禁の定着語「反潜回（Anti-passback）」に是正（解説の方式名も、corpus のアンチパスバック 4 題で統一。jp「共連れ防止」の訳としての「防尾随」は残す）。アは**正解肢**だが訳語のみの変更で、入退室の順序整合で共連れを防ぐ = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  // Rule D NIT-1: 解説・誤答肢だけの訳語統一でも、corpus 4 題の統一を辿れるよう 1 行残す
  "2025r07-q077": (p) => `（S130 ⑨ 解説監査: ${p} の zh 誤答肢ウ・解説のアンチパスバックの訳語「防尾随」を「反潜回」に統一（corpus のアンチパスバック 4 題、2016h28a-q098 参照）。誤答肢の訳語のみで、監視して不正アクセスを発見・報告する = IDS = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2021r03-q058": (p) => `（S130 ⑨ 解説監査: ${p} の zh 解説（要点 2）のアンチパスバックの訳語「防尾随」を「反潜回」に統一（corpus のアンチパスバック 4 題、2016h28a-q098 参照）。解説の訳語のみで、一人ずつ通過させるサークル型セキュリティゲート = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2020r02o-q094": (p) => `（S130 ⑨ 解説監査: ${p} 誤答肢アの解説（jp / zh / en）が「②が誤り」で終わり ③ を正と読めたのを、③ を「機密性」とする点も誤り（③ は完全性）と書き足した。①可用性・②機密性・③完全性 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2011h23tokubetsu-q095": (p) => `（S130 ⑨ 解説監査: ${p} 再導出 — テスト2 は J＝15, K＝15 で条件を満たし J＋K≧20 なので d＝0.9×60,000＝54,000、テスト4 は K＝30＞20 で e＝−1 = イで、correct_answer=イ と一致。suspect=true と round1 の stem_corruption_suspected / figure_derivable=false は前文欠落時の判定で、【S114 裁決】の前文埋め込みで解消済（flag は union 則 D-143 §4/§5 により保持）。正解解説が本問に表示されない「図1 の流れ図」を根拠にしていたのを〔処理内容〕(1) に差し替え、zh 末尾「正解」を「正确答案」に揃えた — ${MARK}）`,
};

// ── 適用 ──
const BANK = (() => { const b = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8")); return b.questions ?? b; })();
const T1 = new Map();
const tr1 = (id) => { if (!T1.has(id)) { const f = P("data/ip/quiz/.phase1", `tr_${id}.json`); T1.set(id, { f, d: existsSync(f) ? rj(f) : null }); } return T1.get(id).d; };
const TR = Object.fromEntries(["2015h27a", "2016h28h"].map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));

// (b)
{
  const jf = P("data/ip/quiz/.phase2", `expl_jp_${Q021}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${Q021}.json`);
  const j = rj(jf), tr = rj(tf);
  for (const [w, from, to, n] of Q021_JP) {
    if (w.startsWith("d:")) subN(j.distractors_jp.find((d) => d.letter === w.slice(2)), "why_wrong_jp", from, to, n, `${Q021} expl_jp.${w}`);
    else subN(j.points_jp, Number(w.slice(2)), from, to, n, `${Q021} expl_jp.points[${w.slice(2)}]`);
  }
  for (const [w, L, from, to, n] of Q021_TR) {
    const o = w.startsWith("d:") ? tr.distractors.find((d) => d.letter === w.slice(2)) : tr.points[Number(w.slice(2))];
    subN(o, L, from, to, n, `${Q021} expl_tr.${w}.${L}`);
  }
  wj(jf, j); wj(tf, tr);
}
// (d)
{
  const t = TR["2016h28h"].questions[Q096], t1 = tr1(Q096);
  for (const [from, to, n] of Q096_ZH) {
    subN(t.stem, "zh", from, to, n, `${Q096} translations.stem.zh`);
    if (t1?.stem?.zh?.includes(from)) subN(t1.stem, "zh", from, to, n, `${Q096} .phase1 tr_.stem.zh`);
    else if (t1) log.push(`    (${Q096} .phase1 tr_.stem.zh は sidecar と乖離 (「${from}」無し) — 不触)`);
  }
}
// (e)
{
  const t = TR["2015h27a"].questions[Q100], t1 = tr1(Q100);
  for (const [from, to, n] of Q100_JP) {
    subN(t, "stem_jp_clean", from, to, n, `${Q100} translations.stem_jp_clean`);
    if (t1?.stem_jp_clean?.includes(from)) subN(t1, "stem_jp_clean", from, to, n, `${Q100} .phase1 tr_.stem_jp_clean`);
    else if (t1) log.push(`    (${Q100} .phase1 tr_.stem_jp_clean に「${from}」無し — 不触)`);
  }
}
for (const e of Object.keys(TR)) wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]);

const EXP = new Map();
const explPair = (id) => {
  if (!EXP.has(id)) {
    const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`);
    EXP.set(id, { jf, tf, j: rj(jf), tr: rj(tf) });
  }
  return EXP.get(id);
};
const explField = (id, w, L) => {
  const { j, tr } = explPair(id);
  if (L === "jp") {
    if (w === "correct") return [j, "correct_jp"];
    if (w.startsWith("d:")) return [j.distractors_jp.find((d) => d.letter === w.slice(2)), "why_wrong_jp"];
    return [j.points_jp, Number(w.slice(2))];
  }
  const o = w === "correct" ? tr.correct : w.startsWith("d:") ? tr.distractors.find((d) => d.letter === w.slice(2)) : tr.points[Number(w.slice(2))];
  return [o, L];
};
for (const [id, w, L, from, to, n] of EXPL_ADD) { const [o, k] = explField(id, w, L); subN(o, k, from, to, n, `${id} expl_${L === "jp" ? "jp" : "tr"}.${w}.${L}`); }
for (const [id, w, n] of AP_EXPL) { const [o, k] = explField(id, w, "zh"); subN(o, k, AP_FROM, AP_TO, n, `${id} expl_tr.${w}.zh`); }
for (const { jf, tf, j, tr } of EXP.values()) { wj(jf, j); wj(tf, tr); }

const TR2 = {};
for (const [id, field, n] of AP_TR) {
  const e = id.split("-q")[0];
  TR2[e] ??= rj(P("data/ip/quiz/translations", `${e}.json`));
  const t = TR2[e].questions[id], t1 = tr1(id);
  if (field === "stem") { subN(t.stem, "zh", AP_FROM, AP_TO, n, `${id} translations.stem.zh`); if (t1) subN(t1.stem, "zh", AP_FROM, AP_TO, n, `${id} .phase1 tr_.stem.zh`); }
  else { subN(t.choices[field], "zh", AP_FROM, AP_TO, n, `${id} translations.choices.${field}.zh`); if (t1) subN(t1.choices.find((c) => c.letter === field), "zh", AP_FROM, AP_TO, n, `${id} .phase1 tr_.choices.${field}.zh`); }
}
for (const { f, d } of T1.values()) if (d) wj(f, d);
for (const e of Object.keys(TR2)) wj(P("data/ip/quiz/translations", `${e}.json`), TR2[e]);

// note (b) (c) (f) (g) (h) (i)
const GR = {};
for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const e = id.split("-q")[0];
  GR[e] ??= rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`));
  const r = GR[e].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk(pgOf(BANK, id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pgOf(BANK, id)}, round1 untouched)`);
}
for (const e of Object.keys(GR)) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S130-n9: applied ${applied}, skipped ${skipped}`);
