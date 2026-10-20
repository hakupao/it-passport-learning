#!/usr/bin/env node
// Stage 6 / Quiz — S127 A track **A2b** (D-150 §4 段 3、訳層照合 226 題) の採用差分 + **D-151** (zh 訳層の ASCII " → “”) を是正する。
// 源: S127 の workflow `wf_78b23338-93c` (Sonnet、batch 5、画像なし)。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/a2b_tr_fidelity_sn.json
//     マニフェスト = data/ip/quiz/.phase2/a2b_tr_input.json (226 題、zh/en は適用前の sidecar と 2,260 field 一致を確認済)
//     CLEAN 222 / DISCREPANT 4 / 差分 9 (evidence/quiz_A2b_S127.md §2)
//
// 層・方針は quiz-fidfix-S127-a2a と同じ (MARK 冪等 / key_guard は final のみ・round1 不可触 /
// translations sidecar は再 merge 禁止 → sidecar と .phase1 tr_ の両方に同じ置換 / expl は .phase2 expl_tr_ が真相源 → phase2-merge で再生成)。
// A2a からの変更点:
//   - jp は ⑤-2 / A2a で源照合済 = 正。本 unit は jp 3 層 (questions / question_bank / by_year) を**読まない・書かない**
//   - 置換は subN (出現数 n を厳密に要求) に統一。0 回なら skip (冪等)
//   - D-151 は決定的な変換 (下の quoteZh)。対象 field を列挙せず、sidecar の zh 全 field を走査する
//
// ── 仕事 1: A2b の採用差分 (evidence §4) ──
//   2016h28h-q009 zh   「甲公司」→「A公司」(stem + ア〜エ + 解説 3 箇所)。corpus の zh は「X公司」732 箇所 / 206 題、「甲乙丙丁公司」は本題だけ
//   2015h27a-q042 イ en「integration test」→「system test」(総合テスト = システムテスト。結合テスト = integration。解説 イ も追随)
//   2021r03-q024 ウ zh/en「（BYOD，自带设备办公）」「 (BYOD)」除去 (jp に無い用語名。誤答肢の概念名を明かす = 消去法の手掛かり。解説の BYOD は据置)
//   2023r05-q094 en   stem「Information Security Basic Policy」→「information security policy」(jp「情報セキュリティ方針」に無い「基本」。corpus の小文字表記に揃える)
//                     解説 correct.en の初出に「(Information Security Basic Policy)」の同一視を残す (jp / zh 解説の橋渡しに揃える、Rule D MINOR)
//   2023r05-q044 en   stem「A Company's IT department」→「Company A's IT department」(CLEAN 抽検で見つけた見落とし、同 stem 内の Company A と不統一)
//
// ── 仕事 2: D-151 (evidence §6) ──
//   範囲: translations sidecar の zh (stem / choices)。.phase1 tr_ は sidecar と同じ field に ASCII " を持つものだけ同時に変換 (再 merge 退行防止)。
//         .phase1 だけが ASCII " を持つ field (sidecar は既に「」等で .phase1 が旧版のまま乖離) は触らない (evidence §6c に一覧)。
//         解説 (expl_tr_ / explanations) の zh は実測で ASCII " 0 件 → 対象なし。en は対象外 (⑨-c)。
//   変換: field 内の ASCII " を出現順に “ / ” 交互に置く。奇数個・開きの直後が空白・閉じの直前が空白なら throw (手で裁定)。
//         事後確認: ASCII " 0 個、“ と ” が各 n/2 個増える。
//   除外: " が式・検索式・パターン・プログラムの中にある (+ / = / IF( / AND・OR / SQL の %) か、" という文字そのものを指す field (QUOTE_EXCLUDE)。
//         jp もこれらの field では ASCII " (源の表記) で、zh はそれに揃える。
//   D-143: D-151 は字種だけの機械変換なので note_jp は追記しない (正解肢に当たる field は evidence §6 に列挙)。
//
// Run: node scripts/quiz-fidfix-S127-a2b.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S127-a2b.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs <exam>  (対象 exam ごと)
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
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

// [lang, field (stem | ア〜エ), from, to, n] — sidecar と .phase1 tr_ の両方に当てる
const FIX = {
  "2016h28h-q009": [["zh", "stem", "甲公司", "A公司", 1], ["zh", "ア", "甲公司", "A公司", 1], ["zh", "イ", "甲公司", "A公司", 1],
                    ["zh", "ウ", "甲公司", "A公司", 1], ["zh", "エ", "甲公司", "A公司", 1]],
  "2015h27a-q042": [["en", "イ", "in the integration test conducted", "in the system test conducted", 1]],
  "2021r03-q024": [["zh", "ウ", "用于办公室业务（BYOD，自带设备办公）", "用于办公室业务", 1],
                   ["en", "ウ", "with the company's permission (BYOD)", "with the company's permission", 1]],
  "2023r05-q094": [["en", "stem", "the Information Security Basic Policy in an ISMS", "the information security policy in an ISMS", 1]],
  "2023r05-q044": [["en", "stem", "A Company's IT department", "Company A's IT department", 1]],
  // 対象外の同型 (lead 振り分けで追加。jp「総合テスト」は源 p19 問51 c / p12 問35 エ で確認)
  "2011h23a-q051": [["en", "stem", "before the integration test begins.", "before the system test begins.", 1]],
  "2012h24h-q035": [["en", "エ", "from design through integration testing.", "from design through system testing.", 1]],
};
// [where (correct | d:ア〜エ | p:idx), lang, from, to, n] — .phase2 expl_tr_ (phase2-merge で explanations を再生成)
const EXPL = {
  "2016h28h-q009": [["correct", "zh", "甲公司", "A公司", 2], ["p:1", "zh", "甲公司", "A公司", 1]],
  "2015h27a-q042": [["d:イ", "en", "during the integration test of system development", "during the system test of system development", 1]],
  // 2012h24h-q035 の解説 エ en は既に「overall system testing」(総合) / 「integration testing」(結合) と訳し分けているので不触
  "2011h23a-q051": [["correct", "en", "before the integration test begins", "before the system test begins", 1]],
  "2023r05-q094": [["correct", "en", "The Information Security Basic Policy sits at the top", "The information security policy (Information Security Basic Policy) sits at the top", 1]],
};

// D-151 の除外 (id → field)。理由は evidence §6b。
const QUOTE_EXCLUDE = {
  "2010h22h-q063": ["ア"],                   // “"”で囲む — " という文字そのもの (奇数個)
  "2012h24h-q069": ["ア", "イ", "ウ", "エ"],  // 検索式 ("札幌" AND "函馆") OR …
  "2013h25a-q095": ["ア", "イ", "ウ", "エ"],  // 文字列連結の式 "关联_" + n + …
  "2016h28h-q096": ["ア", "イ", "エ"],        // SQL LIKE のパターン "%子"
  "2023r05-q075": ["ア", "イ", "ウ", "エ"],   // 表計算の式 IF(…, "合格", "不合格")
};

function quoteZh(s, where) {
  const n = s.split('"').length - 1;
  if (n % 2) throw new Error(`${where}: ASCII " が奇数 (${n}) — 手で裁定`);
  const o0 = s.split("“").length - 1, c0 = s.split("”").length - 1;
  let k = 0, out = "";
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '"') { out += s[i]; continue; }
    const open = k++ % 2 === 0;
    if (open && /\s/.test(s[i + 1] ?? " ")) throw new Error(`${where}: 開き " の直後が空白 @${i}`);
    if (!open && /\s/.test(s[i - 1] ?? " ")) throw new Error(`${where}: 閉じ " の直前が空白 @${i}`);
    out += open ? "“" : "”";
  }
  if (out.includes('"') || out.split("“").length - 1 !== o0 + n / 2 || out.split("”").length - 1 !== c0 + n / 2) throw new Error(`${where}: D-151 事後確認に失敗`);
  return { out, n };
}

const MARK = "fidfix-S127-a2b";
const BANK = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8"));
const pg = (id) => { const b = (BANK.questions ?? BANK).find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 語義是正 (誤答肢) + 正解肢命中。
//   追記しない: 2023r05-q094 / q044 (en の cosmetic、正解肢外) と D-151 (字種のみの機械変換)
const NOTE_APPEND = {
  "2016h28h-q009": (p) => `（S127 A2b: ${p} の jp「A社」を zh だけが「甲公司」と訳していた (B社は「B公司」) のを、jp と corpus の多数派どおり「A公司」に統一（題幹・選択肢ア〜エ・解説）。アは**正解肢**だが変更は社名ラベルのみで、親事業者 A 社は検査の終了にかかわらず受領日から 60 日以内に代金を支払う義務があるという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2015h27a-q042": (p) => `（S127 A2b: ${p} の jp「総合テスト」(= システムテスト) を en 選択肢イが「integration test」(= 結合テスト) と訳していたのを「system test」に是正（解説イも追随）。誤答肢のため、ウイルス定義ファイルの更新 = 運用中のソフトウェア保守という導出・答え（ア）は不変 — ${MARK}）`,
  "2011h23a-q051": (p) => `（S127 A2b: ${p} 実読で 記述 c の jp「総合テスト」(= システムテスト) を en が「integration test」(= 結合テスト) と訳していたのを「system test」に是正（解説も追随）。c は**正解（エ = c, d）に含まれる記述**だが、総合テストの開始までに成果物が納品されることの確認 = 進捗管理という導出・correct_answer=エ は不変 — ${MARK}）`,
  "2012h24h-q035": (p) => `（S127 A2b: ${p} 実読で 選択肢エの jp「総合テスト」(= システムテスト) を en が「integration testing」(= 結合テスト) と訳していたのを「system testing」に是正（解説は既に総合 = overall system testing と訳し分け済）。誤答肢のため、品質管理の基準はできる限り定量的に管理できるものにするという導出・答え（イ）は不変 — ${MARK}）`,
  "2021r03-q024": (p) => `（S127 A2b: ${p} の jp 選択肢ウに無い用語名「BYOD」を zh / en が括弧書きで付け足していたのを除去（誤答肢の概念名を明かすと消去法の手掛かりになる）。解説の BYOD は説明として据置。誤答肢のため、IT を活用した場所や時間にとらわれない柔軟な働き方 = テレワークという導出・答え（ア）は不変 — ${MARK}）`,
};

// ── 仕事 1 ─────────────────────────────────────────────────────────────────────
const exams1 = [...new Set([...Object.keys(FIX), ...Object.keys(EXPL)].map((id) => id.split("-q")[0]))];
const allExams = readdirSync(P("data/ip/quiz/translations")).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", "")).sort();
const TR = Object.fromEntries(allExams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
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

// ── 仕事 2: D-151 ─────────────────────────────────────────────────────────────
const q = { fields: 0, quotes: 0, p1fields: 0, excluded: [], p1only: [] };
for (const e of allExams) for (const [id, t] of Object.entries(TR[e].questions)) {
  const fl = [["stem", t.stem], ...Object.entries(t.choices ?? {})];
  for (const [field, o] of fl) {
    const s = o?.zh;
    if (typeof s !== "string" || !s.includes('"')) continue;
    if (QUOTE_EXCLUDE[id]?.includes(field)) { q.excluded.push(`${id} ${field}`); continue; }
    const t1 = tr1(id);
    const o1 = t1 ? (field === "stem" ? t1.stem : t1.choices.find((c) => c.letter === field)) : null;
    const { out, n } = quoteZh(s, `${id} translations.${field}.zh`);
    o.zh = out; applied++; q.fields++; q.quotes += n;
    log.push(`  ✓ D-151 ${id} ${field}: ×${n}  ${out.replace(/\n/g, "⏎").slice(0, 70)}`);
    if (o1?.zh?.includes('"')) { o1.zh = quoteZh(o1.zh, `${id} .phase1 tr_.${field}.zh`).out; q.p1fields++; }
  }
}
for (const QE of Object.entries(QUOTE_EXCLUDE)) for (const f of QE[1]) if (!q.excluded.includes(`${QE[0]} ${f}`)) {
  const t = TR[QE[0].split("-q")[0]].questions[QE[0]];
  if (!(f === "stem" ? t.stem.zh : t.choices[f].zh).includes('"')) throw new Error(`${QE[0]} ${f}: 除外指定だが ASCII " が無い`);
}
// .phase1 だけが ASCII " を持つ field (報告のみ)
for (const f of readdirSync(P("data/ip/quiz/.phase1")).filter((f) => f.startsWith("tr_"))) {
  const id = f.slice(3, -5), t1 = tr1(id);
  for (const [field, s] of [["stem", t1?.stem?.zh], ...(t1?.choices ?? []).map((c) => [c.letter, c.zh])])
    if (s?.includes('"') && !QUOTE_EXCLUDE[id]?.includes(field)) q.p1only.push(`${id} ${field}`);
}

for (const { f, d } of T1.values()) if (d) wj(f, d);
for (const { f, d } of EX.values()) wj(f, d);
for (const e of allExams) wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]);

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk(pg(id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pg(id)}, round1 untouched)`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  D-151: sidecar ${q.fields} field / ${q.quotes} 個 → “”、.phase1 同時 ${q.p1fields} field、除外 ${q.excluded.length} field、.phase1 のみ残存 (不触) ${q.p1only.length} field`);
console.log(`  除外: ${q.excluded.join(" / ")}`);
console.log(`  .phase1 のみ: ${q.p1only.join(" / ")}`);
console.log(`  exams (仕事 1): ${exams1.sort().join(" ")}`);
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S127-a2b: applied ${applied}, skipped ${skipped}`);
