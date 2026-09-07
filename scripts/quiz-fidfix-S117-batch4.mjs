#!/usr/bin/env node
// Stage 6 / Quiz — S117 ① 本番 batch 4 (最終: 2017h29a / 2017h29h / 2023r05 / 2026r08) の保真核験差分を是正する。
// 源: S117 log §19 の 10 workflow (A = s7x 双 pass 38 問、B-note = 2017h29h 6 問)。差分 17 記録 (双 pass verdict 全一致; 記録 1 件は cr 側が q027「運用費用→運用費」を別記録に細分したもので、是正内容としては両側一致)。
// 層・方針は quiz-fidfix-S117-batch3.mjs と同じ (translations 再 merge 禁止 / explanations は .phase2 → 再 merge / note は差し替え文に token を含めず marker 冪等 / page 番号は source から)。
// 追加 (監査差分表に無いが源画像で確定したもの):
//   - 2017h29h-q027 stem「キャンセルなどは，」→「キャンセルなど，」(主 context が page-12 実読で確認; 双 pass とも源を「など，」と書き起こしながら差分未計上)
//   - 2017h29h-q027 raw stem_jp「会場費として講師代として」(OCR 重複; clean 側は「会場費と」) → 源「会場費及び講師代として」に raw/clean とも統一
//   - 2017h29h-q034 ア/ウ の引用符崩れ (`“強み”", "弱み", 機会", "脅威 の` 等) → 源は全て “…” 対。双 pass とも「体裁差」として非計上だったが表示品質欠陥なので是正
// 2017h29a は差分 0 (是正なし)。
// Run: node scripts/quiz-fidfix-S117-batch4.mjs [--dry-run] → node scripts/quiz-phase2-merge.mjs {2017h29h,2023r05,2026r08}

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
let applied = 0, skipped = 0; const log = [];

function sub(obj, key, from, to, where) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  if (to && to.includes(from) && s.includes(to)) { skipped++; return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; return false; }
  if (n > 1) throw new Error(`${where}: 「${from}」 occurs ${n}× — abort`);
  obj[key] = s.replace(from, to); applied++; log.push(`  ✓ ${where}: 「${from.slice(0, 36)}」→「${to.slice(0, 36)}」`); return true;
}

const FIX = {
  // 2017h29h — A 側
  "2017h29h-q027": {
    jp: [
      ["stem", "条件以外は考えないものとする", "条件以外は考慮しないものとする"],
      ["stem", "固定費用と受講者", "固定費と受講者"],
      ["stem", "運用費用である", "運用費である"],
      ["stem", "会場費として講師代として", "会場費及び講師代として"], // raw 層 (OCR 重複)
      ["stem", "会場費と講師代として", "会場費及び講師代として"],     // clean 層
      ["stem", "キャンセルなどは，記載", "キャンセルなど，記載"],       // 主 context 実読で追加
    ],
    zh: [["stem", "60 万日元的固定费用，以及每名受训者 2,000 日元的运营费用", "60 万日元的固定费，以及每名受训者 2,000 日元的运营费"]],
  },
  "2017h29h-q057": {
    jp: [["イ", "接続し、二つのディスプレイにまたがる広い領域を1台のPCの画面として表示帯域にする。", "接続して、二つのディスプレイ画面にまたがる広い領域を一つの連続した表示領域にする。"]],
    zh: [["イ", "将横跨两台显示器的宽广区域作为这一台 PC 的画面进行显示。", "将横跨两台显示器画面的宽广区域变为一个连续的显示区域。"]],
    en: [["イ", "use the wide area spanning both displays as the screen of that one PC.", "make the wide area spanning both display screens into a single continuous display area."]],
  },
  // 2017h29h — B-note 側
  "2017h29h-q029": { jp: [["ア", "対処方法を者えておくこと", "対処方法を考えておくこと"]] },
  "2017h29h-q033": { jp: [["ア", "1C タグでの利用", "IC タグでの利用"]] },
  "2017h29h-q079": { jp: [["エ", "負荷分散装置を導入する。ぜい", "負荷分散装置を導入する。"]] },
  "2017h29h-q084": { jp: [["エ", "結ぶボネットワーク", "結ぶネットワーク"]] },
  // 2017h29h — 付随 (引用符崩れ、源は “…” 対)
  "2017h29h-q034": {
    jp: [
      ["ア", '事業を“強み”", "弱み", 機会", "脅威 の四つ', "事業を“強み”, “弱み”, “機会”, “脅威”の四つ"],
      ["ウ", '“導入期", "成長期", “成熟期", “衰退期" のどの', "“導入期”, “成長期”, “成熟期”, “衰退期”のどの"],
      ["ウ", "製品が “導入期”", "製品が“導入期”"], // Rule D 審閲 NIT-6: 旧腐敗文由来の余分な空白 (源・ア と不揃い)
    ],
  },
  // 2023r05
  "2023r05-q037": { jp: [["イ", "b: 被監査者側の", "b: 被監査側の"]] },
  "2023r05-q056": {
    jp: [
      ["イ", "管理策が適切に実施されていることを認証する", "管理策が適切に導入，実施されていることを認証する"],
      // by_year 層だけが旧 OCR 腐敗文のまま残っていた (questions/question_bank は過去の explfix で部分是正済) → 源文に統一
      ["イ", "適切に実施，実施されていることを認証するものを認証する組織はない。", "適切に導入，実施されていることを認証するものである。"],
    ],
    zh: [["イ", "管理措施已被恰当实施这一情况", "管理措施已被恰当导入并实施这一情况"]],
    en: [["イ", "have been appropriately implemented.", "have been appropriately introduced and implemented."]],
  },
  // 2026r08
  "2026r08-q039": {
    jp: [["イ", "予定期日と予定終了日", "予定開始日と予定終了日"], ["ウ", "ための作業の作業を階層的に", "ための作業を階層的に"]],
    zh: [["イ", "预定日期和预定完成日期", "预定开始日期和预定完成日期"]],
    en: [["イ", "the scheduled dates and scheduled completion dates", "the scheduled start dates and scheduled completion dates"]],
  },
  "2026r08-q057": {
    jp: [["ア", '"学生"表の学生番号と"成績"表の学生番号', '"学生"表の学生番号，"成績"表の学生番号']],
    zh: [["ア", '"学生"表的学生编号与"成绩"表的学生编号', '"学生"表的学生编号，"成绩"表的学生编号']],
    en: [["ア", 'The Student No. in the "Student" table and the Student No. in the "Grade" table', 'The Student No. in the "Student" table, the Student No. in the "Grade" table']],
  },
  "2026r08-q085": { jp: [["stem", "関数 isPrime は isPrime(2) として", "関数 isPrime を isPrime(2) として"]] },
};

const EXPL = {
  "2023r05-q037": { distSub: { "イ": { jp: [["b の「被監査者側の」立場", "b の「被監査側の」立場"]] } } },
  "2023r05-q056": { correctSub: {
    jp: [["「クラウドサービス固有の管理策が適切に実施されていることを認証する制度である」とするイ", "「クラウドサービス固有の管理策が適切に導入，実施されていることを認証する制度である」とするイ"]],
    zh: [["「它是对云服务特有的管理措施已被恰当实施这一情况进行认证的制度」一项", "「它是对云服务特有的管理措施已被恰当导入并实施这一情况进行认证的制度」一项"]],
    en: [["「it certifies that controls specific to cloud services have been appropriately implemented」", "「it certifies that controls specific to cloud services have been appropriately introduced and implemented」"]],
  } },
  "2026r08-q039": { distSub: { "イ": {
    jp: [["主要な成果物の予定期日や終了日を記載したもの", "主要な成果物の予定開始日や予定終了日を記載したもの"]],
    zh: [["记载主要交付物的预定日期和预定完成日期的", "记载主要交付物的预定开始日期和预定完成日期的"]],
    en: [["Describing the scheduled dates and scheduled completion dates", "Describing the scheduled start dates and scheduled completion dates"]],
  } } },
};

const MARK = "fidfix-S117-batch4";
const pg = (id) => { const b = rj(P("data/ip/exams/question_bank.json")).questions.find((q) => q.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };
// Rule D 審閲 MINOR-3: q027 の差し替え文の直後に、削除済の「会場費として講師代として」記述を指していた
// 「…clean 側で解消しているため corruption フラグは立てない」が残り矛盾 → marker 後段で無条件除去 (冪等)。
const NOTE_PRUNE = { "2017h29h-q027": [/clean 側で解消しているため corruption フラグは立てない/] };
const NOTE_SENT = {
  "2017h29h-q027": { match: /会場費として講師代として/, replace: (p) => `stem の「会場費及び講師代」「固定費」「運用費」「考慮しない」「キャンセルなど，」は S117 に ${p} 実読 (双 pass 一致 + 主 context 確認) で raw/clean とも源どおりに是正済 (${MARK})` },
  "2017h29h-q029": { match: /者えておく/, replace: (p) => `選択肢アの「考えておく」の字形誤りは S117 に ${p} 実読 (双 pass 一致) で是正済 (${MARK})` },
  "2017h29h-q033": { match: /1C タグ/, replace: (p) => `選択肢アの「IC タグ」の英字→数字誤りは S117 に ${p} 実読 (双 pass 一致) で是正済 (${MARK})` },
  "2017h29h-q034": { match: /余分な引用符/, replace: (p) => `選択肢ア・ウの引用符崩れは S117 に ${p} 実読 (双 pass 一致) で源の “…” 対に是正済 (${MARK})` },
  "2017h29h-q079": { match: /OCR 残渣/, replace: (p) => `選択肢エ末尾の混入 2 字は S117 に ${p} 実読 (双 pass 一致) で除去済 (${MARK})` },
  "2017h29h-q084": { match: /ボネットワーク/, replace: (p) => `選択肢エの混入 1 字は S117 に ${p} 実読 (双 pass 一致) で除去済 (${MARK})` },
};
// 2023r05-q056: 腐敗した旧 choices_jp.イ を述べた 4 文 (別タスク要求を含む) を 1 文に差し替え
const NOTE_MULTI = { "2023r05-q056": { matches: [/なお腐敗は設問ではなく選択肢側にある/, /OCR 腐敗しており/, /別タスクが必要/, /解説本文は是正後の本来の文意/], replace: (p) => `選択肢イの表示文は S117 に ${p} 実読 (双 pass 一致) で源「適切に導入，実施されていることを認証するものである」へ是正済 (${MARK})` } };

// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set(Object.keys(FIX).map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));

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
  for (const [L, d] of Object.entries(ex.distSub ?? {})) { const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    for (const [f, t] of d.jp ?? []) sub(dj, "why_wrong_jp", f, t, `${id} expl_jp.${L}`); for (const [f, t] of d.zh ?? []) sub(dt, "zh", f, t, `${id} expl_tr.${L}.zh`); for (const [f, t] of d.en ?? []) sub(dt, "en", f, t, `${id} expl_tr.${L}.en`); }
  if (ex.correctSub) { for (const [f, t] of ex.correctSub.jp ?? []) sub(j, "correct_jp", f, t, `${id} expl_jp.correct_jp`); for (const [f, t] of ex.correctSub.zh ?? []) sub(tr.correct, "zh", f, t, `${id} expl_tr.correct.zh`); for (const [f, t] of ex.correctSub.en ?? []) sub(tr.correct, "en", f, t, `${id} expl_tr.correct.en`); }
  wj(jf, j); wj(tf, tr);
}

for (const [id, nf] of Object.entries(NOTE_SENT)) {
  const exam = id.split("-q")[0]; const r = GR[exam].results.find((x) => x.id === id); if (!r?.key_guard) throw new Error(id);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  const sents = r.key_guard.note_jp.split("。"); const idx = sents.findIndex((s) => nf.match.test(s));
  if (idx < 0) { log.push(`  ⚠ ${id}: note sentence not found`); skipped++; continue; }
  sents.splice(idx, 1, nf.replace(pg(id))); r.key_guard.note_jp = sents.join("。").replace(/。。/g, "。"); applied++; log.push(`  ✓ ${id} final note: 1 文差し替え (${pg(id)}, round1 untouched)`);
}
for (const [id, nf] of Object.entries(NOTE_MULTI)) {
  const exam = id.split("-q")[0]; const r = GR[exam].results.find((x) => x.id === id);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  let sents = r.key_guard.note_jp.split("。"); const idxs = nf.matches.map((m) => sents.findIndex((s) => m.test(s))).filter((i) => i >= 0).sort((a, b) => a - b);
  if (!idxs.length) { log.push(`  ⚠ ${id}: note sentences not found`); skipped++; continue; }
  sents = sents.filter((_, i) => !idxs.includes(i)); sents.splice(idxs[0], 0, nf.replace(pg(id)));
  r.key_guard.note_jp = sents.join("。").replace(/。。/g, "。"); applied++; log.push(`  ✓ ${id} final note: ${idxs.length} 文を 1 文に差し替え (${pg(id)}, round1 untouched)`);
}
for (const [id, pats] of Object.entries(NOTE_PRUNE)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  const before = r.key_guard.note_jp.split("。"); const after = before.filter((s) => !pats.some((p) => p.test(s)));
  if (after.length === before.length) { skipped++; continue; }
  r.key_guard.note_jp = after.join("。").replace(/。。/g, "。"); applied++; log.push(`  ✓ ${id} final note: 矛盾 ${before.length - after.length} 文を除去 (round1 untouched)`);
}
for (const e of exams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S117-batch4: applied ${applied}, skipped ${skipped}`);
