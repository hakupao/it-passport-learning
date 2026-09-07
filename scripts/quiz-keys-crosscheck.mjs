#!/usr/bin/env node
// Stage 6 / Quiz — S117: 正解 key と成果物の交叉核対 (決定的、LLM なし)。
//
// 背景: S98/S99/S110/S111/S116 で correct_answer を 3 層 (question_bank / answer_keys / by_year) + 派生
// questions.json にまたがって是正してきた。S116 は「交叉核対 mismatch 0/2900」を keyfix script の中で
// その場限りに確認していただけで、常設ゲートが無かった (backlog ⑥)。本 script はそれを常設化する。
//
// ══ Layer A: committed data だけで走る (CI で常時) ══
//   A1 questions.json: 2900 問・id 一意・correct_answer ∈ {ア,イ,ウ,エ}・choices_jp が 4 肢揃う
//   A2 explanations/<exam>.json: 全問にエントリ・distractors の字母集合 == 非正解 3 肢・key_guard.suspect が boolean
//   A3 translations/<exam>.json: 全問にエントリ・choices の字母集合 == questions の 4 肢
//   A4 quiz_index.json: stats.questions == 2900・exams 29・各 exam の question_count == 実数
//   A5 D-142 禁止語: zh (quiz sidecar + textbook units) に 主机托管 / 服务器托管 / 托管（hosting） が無い
//   A6 D-144 段 2 choice_figures: 4 肢揃う・figure は null・WebP が apps/web/public/quiz-figures に実在・choices_jp は「図L」・訳文も 图L / Figure L
//   A7 D-144 段 3/5 中問の共有前文: registry data/ip/quiz/chumon_groups.json の全組・全メンバーについて、表示 stem
//      (translations の stem_jp_clean / stem.zh / stem.en) が空白除去後に組の前文 probe (先頭 40 字) を含む。
//      member は questions.json に実在し exam_id が一致・組をまたいで重複しない・counts が実数と一致。
//      S117 §28h の教訓: linkage-gap scanner は偽陰性を出す。「登録組の全メンバーに前文が届いているか」が真の不変式。
//      registry が空/縮んだ時に無条件 GREEN にならないよう組数・member 数の床も持つ。exceptions は reason 必須。
//      registry の再生成は scripts/quiz-chumon-groups-build.mjs (--check で差分検出。vitest からも走る)。
//   A2 には sidecar top-level の suspect_count / stem_corruption_count と実数の一致も含む
//
// ══ Layer B: raw (gitignored) がある時だけ走る (ローカル gate) ══
//   B1 questions.correct_answer == question_bank.correct_answer
//   B2 questions.correct_answer == answer_keys[exam].answers[n]
//   B3 questions.correct_answer == by_year/<exam>.json の correct_answer
//   B4 explanations の key_guard が .phase2/generate_result から決定的に導かれる状態にある (round1 は差分時のみ publish かつ一致、
//      final の derived フィールド一致、stem_corruption_suspected / suspect は union 則) — D-143: explfix は round1 に触れない
//   raw が無い環境では Layer B を「skipped (raw absent)」と明示して exit 0 — ただし --require-raw を付けると exit 1。
//
// Run:  node scripts/quiz-keys-crosscheck.mjs [--committed-only] [--require-raw]
//   B5 stem_jp / choices_jp が questions == question_bank == by_year の 3 層で一致し、かつ by_year に行が存在する (S117: by_year 284 問の
//      旧 OCR 残存を見逃していた穴。merge-question-bank を再実行すると退行するため、是正は必ず最上流まで入れる)
//   B6 図メタデータ (has_figure / figure_path / figure_bbox_pct / figure_type / source / choice_figure_paths) が question_bank == by_year
//      (S117: 2010h22a-q091 の by_year に問89 用の旧 bbox が残り、bbox 再裁断で誤図が戻る状態だった)

import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const Q = path.join(ROOT, "data/ip/quiz");
const RAW = path.join(ROOT, "data/ip/exams");
const LETTERS = ["ア", "イ", "ウ", "エ"];
const COMMITTED_ONLY = process.argv.includes("--committed-only");
const REQUIRE_RAW = process.argv.includes("--require-raw");

const problems = [];
function bad(layer, msg) { problems.push(`[${layer}] ${msg}`); }
const rj = (p) => JSON.parse(readFileSync(p, "utf-8"));

// ───────────────────────── Layer A ─────────────────────────
const questions = rj(path.join(Q, "questions.json")).questions;
const byExam = new Map();
{
  const ids = new Set();
  for (const q of questions) {
    if (ids.has(q.id)) bad("A1", `${q.id}: duplicate id`);
    ids.add(q.id);
    if (!LETTERS.includes(q.correct_answer)) bad("A1", `${q.id}: correct_answer '${q.correct_answer}' not in ア/イ/ウ/エ`);
    const ck = Object.keys(q.choices_jp ?? {}).sort().join("");
    if (ck !== LETTERS.slice().sort().join("")) bad("A1", `${q.id}: choices_jp letters = ${ck}`);
    if (!byExam.has(q.exam_id)) byExam.set(q.exam_id, []);
    byExam.get(q.exam_id).push(q);
  }
  if (questions.length !== 2900) bad("A1", `questions.json has ${questions.length} questions (expected 2900)`);
}

for (const [exam, qs] of byExam) {
  // A2 explanations
  const ef = path.join(Q, "explanations", `${exam}.json`);
  if (!existsSync(ef)) { bad("A2", `${exam}: explanations sidecar missing`); }
  else {
    const e = rj(ef);
    for (const q of qs) {
      const ent = e.questions[q.id];
      if (!ent) { bad("A2", `${q.id}: no explanation entry`); continue; }
      const want = LETTERS.filter((L) => L !== q.correct_answer).join("");
      const got = Object.keys(ent.distractors ?? {}).sort().join("");
      if (got !== want) bad("A2", `${q.id}: distractors=${got} but non-correct letters=${want} (key=${q.correct_answer})`);
      if (typeof ent.key_guard?.suspect !== "boolean") bad("A2", `${q.id}: key_guard.suspect not boolean`);
    }
    if (e.count !== qs.length) bad("A2", `${exam}: sidecar count=${e.count} vs ${qs.length}`);
    const nSus = Object.values(e.questions).filter((x) => x.key_guard?.suspect === true).length;
    const nSc = Object.values(e.questions).filter((x) => x.key_guard?.stem_corruption_suspected === true).length;
    if (e.suspect_count !== nSus) bad("A2", `${exam}: suspect_count=${e.suspect_count} but ${nSus} entries have suspect=true`);
    if (e.stem_corruption_count !== nSc) bad("A2", `${exam}: stem_corruption_count=${e.stem_corruption_count} but ${nSc} entries have stem_corruption_suspected=true`);
  }
  // A3 translations
  const tf = path.join(Q, "translations", `${exam}.json`);
  if (!existsSync(tf)) { bad("A3", `${exam}: translations sidecar missing`); }
  else {
    const t = rj(tf);
    for (const q of qs) {
      const ent = t.questions[q.id];
      if (!ent) { bad("A3", `${q.id}: no translation entry`); continue; }
      const got = Object.keys(ent.choices ?? {}).sort().join("");
      if (got !== LETTERS.slice().sort().join("")) bad("A3", `${q.id}: translation choices letters=${got}`);
    }
  }
}

// A4 quiz_index
{
  const idx = rj(path.join(Q, "quiz_index.json"));
  if (idx.stats?.questions !== questions.length) bad("A4", `quiz_index.stats.questions=${idx.stats?.questions} vs ${questions.length}`);
  if ((idx.exams ?? []).length !== byExam.size) bad("A4", `quiz_index.exams=${idx.exams?.length} vs ${byExam.size}`);
  for (const ex of idx.exams ?? []) {
    const n = byExam.get(ex.exam_id)?.length ?? 0;
    if (ex.question_count !== n) bad("A4", `${ex.exam_id}: quiz_index question_count=${ex.question_count} vs ${n}`);
  }
}

// A5 D-142 禁止語 — quiz sidecar の `.zh` と、教科書 unit の `*_zh` (文字列/文字列配列) の両方を見る
{
  const BAN = /主机托管|服务器托管|(?<![主机房服务器])托管（hosting）/; // D-142 禁止語 + gloss 無し「托管（hosting）」の再発
  const walkZh = (o, p, id, inheritZh = false) => {
    if (o && typeof o === "object") {
      for (const k of Object.keys(o)) {
        const isZh = inheritZh || k === "zh" || k.endsWith("_zh");
        const v = o[k];
        if (typeof v === "string") { if (isZh && BAN.test(v)) bad("A5", `${id} ${p}.${k}: D-142 禁止語 (主机托管/服务器托管)`); }
        else walkZh(v, p + "." + k, id, Array.isArray(v) && isZh);
      }
    }
  };
  for (const dir of ["translations", "explanations"]) {
    for (const f of readdirSync(path.join(Q, dir)).filter((x) => x.endsWith(".json"))) {
      const doc = rj(path.join(Q, dir, f));
      for (const [id, q] of Object.entries(doc.questions)) walkZh(q, "", id);
    }
  }
  const UNITS = path.join(ROOT, "data/ip/textbook/units");
  if (existsSync(UNITS)) for (const f of readdirSync(UNITS).filter((x) => x.endsWith(".json"))) walkZh(rj(path.join(UNITS, f)), "", `textbook/${f}`);
}

// A6 D-144 段 2 — 選択肢単位の図の整合 (committed 層で完結: questions.json + public/quiz-figures)
{
  const FIGS = path.join(ROOT, "apps/web/public/quiz-figures");
  for (const q of questions) {
    if (!q.choice_figures) continue;
    for (const L of ["ア", "イ", "ウ", "エ"]) {
      const b = q.choice_figures[L];
      if (typeof b !== "string" || !b) { bad("A6", `${q.id}: choice_figures.${L} missing`); continue; }
      if (!existsSync(path.join(FIGS, `${b}.webp`))) bad("A6", `${q.id}: /quiz-figures/${b}.webp missing (build-quiz-figures 未実行?)`);
      if (q.choices_jp?.[L] !== `図${L}`) bad("A6", `${q.id}: choices_jp.${L}=${JSON.stringify(q.choices_jp?.[L])} — 選択肢が図の問は中立テキスト「図${L}」であること (答えの漏洩防止)`);
    }
    if (q.figure !== null && q.figure_type !== "shared") bad("A6", `${q.id}: choice_figures があるのに figure=${q.figure} (複合図と二重表示になる; 中問の共有図 figure_type=shared のみ共存可)`);
    if (q.has_figure !== true) bad("A6", `${q.id}: choice_figures があるのに has_figure=${q.has_figure}`);
    // 訳文も中立ラベルであること (alt に訳文が入る。.phase1 入力層には旧テキスト「RAM（役割分担マトリクス）」等が残っているため、再 merge で退行すると alt から答えが漏れる — Rule D MEDIUM-1)
    const trf = path.join(Q, "translations", `${q.exam_id}.json`);
    const tr = existsSync(trf) ? rj(trf).questions?.[q.id] : null;
    for (const L of ["ア", "イ", "ウ", "エ"]) {
      if (tr?.choices?.[L]?.zh !== undefined && tr.choices[L].zh !== `图${L}`) bad("A6", `${q.id}: translations choices.${L}.zh=${JSON.stringify(tr.choices[L].zh)} — 「图${L}」であること`);
      if (tr?.choices?.[L]?.en !== undefined && tr.choices[L].en !== `Figure ${L}`) bad("A6", `${q.id}: translations choices.${L}.en=${JSON.stringify(tr.choices[L].en)} — 「Figure ${L}」であること`);
    }
  }
}

// A7 D-144 段 3/5 — 中問の共有前文が組の全メンバー・全 3 言語に届いているか (registry: data/ip/quiz/chumon_groups.json)
{
  const REG = path.join(Q, "chumon_groups.json");
  // 床: レジストリが空 / 削られた状態で A7 が「全部 OK」になるのを防ぐ (中身ゼロなら検査ゼロで GREEN になってしまう)。
  //     組を増やしたら **この 2 つの数も上げる** こと (S118 時点: 35 組 / 137 問)。
  const A7_MIN_GROUPS = 35, A7_MIN_MEMBERS = 137;
  const A7_PROBE_LEN = 40; // = scripts/quiz-chumon-groups-build.mjs の PROBE_LEN。短い probe は誤命中しやすいので下限も 40。
  if (!existsSync(REG)) bad("A7", "data/ip/quiz/chumon_groups.json が無い (scripts/quiz-chumon-groups-build.mjs で生成する)");
  else {
    const reg = rj(REG);
    const nsp = (s) => s.replace(/\s+/g, "");
    const qById = new Map(questions.map((q) => [q.id, q]));
    const trCache = new Map();
    const trDoc = (exam) => {
      if (!trCache.has(exam)) {
        const f = path.join(Q, "translations", `${exam}.json`);
        trCache.set(exam, existsSync(f) ? rj(f) : null);
      }
      return trCache.get(exam);
    };
    const owner = new Map();
    const regGroups = reg.groups ?? [];
    for (const g of regGroups) {
      for (const lang of ["jp", "zh", "en"]) {
        const p = g.probe?.[lang];
        if (typeof p !== "string" || p.length < A7_PROBE_LEN) bad("A7", `${g.key}: probe.${lang} が ${A7_PROBE_LEN} 字未満/無い (${JSON.stringify(p)})`);
      }
      // exceptions は「理由付きの文書化済み例外」だけを免除する。reason 無しの免除は穴になるので受け付けない。
      const exempt = new Set();
      for (const e of g.exceptions ?? []) {
        if (typeof e?.id !== "string" || !e.id) { bad("A7", `${g.key}: exceptions に id の無いエントリ`); continue; }
        if (typeof e.reason !== "string" || !e.reason.trim()) { bad("A7", `${g.key}/${e.id}: exceptions.reason が空 — 理由の無い免除は禁止`); continue; }
        exempt.add(e.id);
      }
      for (const id of g.member_ids ?? []) {
        if (owner.has(id)) { bad("A7", `${id}: registry で ${owner.get(id)} と ${g.key} に二重所属`); continue; }
        owner.set(id, g.key);
        const q = qById.get(id);
        if (!q) { bad("A7", `${id}: group ${g.key} のメンバーが questions.json に無い`); continue; }
        if (q.exam_id !== g.exam_id) bad("A7", `${id}: exam_id=${q.exam_id} but group ${g.key} は ${g.exam_id}`);
        if (exempt.has(id)) continue; // 文書化済みの例外 (exceptions[].reason)
        const ent = trDoc(g.exam_id)?.questions?.[id];
        if (!ent) { bad("A7", `${id}: translations にエントリが無い (group ${g.key})`); continue; }
        for (const [lang, v] of [["jp", ent.stem_jp_clean], ["zh", ent.stem?.zh], ["en", ent.stem?.en]]) {
          const p = g.probe?.[lang];
          if (typeof p !== "string" || p.length < A7_PROBE_LEN) continue; // probe 自体の異常は上で報告済
          if (typeof v !== "string") { bad("A7", `${id}: ${lang} stem が無い (group ${g.key})`); continue; }
          if (!nsp(v).includes(p)) bad("A7", `${id}: ${lang} stem lacks group ${g.key} preamble probe (前文欠落 or 訳文ずれ)`);
        }
      }
    }
    if (reg.counts?.groups !== regGroups.length) bad("A7", `counts.groups=${reg.counts?.groups} vs ${regGroups.length}`);
    if (reg.counts?.members !== owner.size) bad("A7", `counts.members=${reg.counts?.members} vs ${owner.size}`);
    if (regGroups.length < A7_MIN_GROUPS) bad("A7", `registry の組が ${regGroups.length} 組しかない (床 ${A7_MIN_GROUPS} — 組が消えている?)`);
    if (owner.size < A7_MIN_MEMBERS) bad("A7", `registry の member が ${owner.size} 問しかない (床 ${A7_MIN_MEMBERS} — member が消えている?)`);
  }
}

// ───────────────────────── Layer B ─────────────────────────
let rawStatus = "skipped (--committed-only)";
if (!COMMITTED_ONLY) {
  const RB = path.join(RAW, "question_bank.json");
  const AK = path.join(RAW, "answer_keys.json");
  const BY = path.join(RAW, "by_year");
  const P2 = path.join(Q, ".phase2");
  const rawPresent = existsSync(RB) && existsSync(AK) && existsSync(BY);
  if (!rawPresent) {
    rawStatus = "skipped (raw absent)";
    if (REQUIRE_RAW) bad("B", "raw data absent but --require-raw given");
  } else {
    rawStatus = "ran";
    const bankFull = new Map((rj(RB).questions ?? rj(RB)).map((q) => [q.id, q]));
    const bank = new Map([...bankFull].map(([id, q]) => [id, q.correct_answer]));
    const byYearFull = new Map();
    const ak = rj(AK);
    const byYear = new Map();
    for (const exam of byExam.keys()) {
      const f = path.join(BY, `${exam}.json`);
      if (!existsSync(f)) { bad("B3", `${exam}: by_year file missing`); continue; }
      const d = rj(f);
      const arr = Array.isArray(d) ? d : (d.questions ?? Object.values(d));
      for (const r of arr) { byYear.set(r.id, r.correct_answer); byYearFull.set(r.id, r); }
    }
    for (const q of questions) {
      const [exam] = q.id.split("-q");
      const n = String(parseInt(q.id.slice(-3), 10));
      if (!bank.has(q.id)) bad("B1", `${q.id}: not in question_bank`);
      else if (bank.get(q.id) !== q.correct_answer) bad("B1", `${q.id}: questions=${q.correct_answer} question_bank=${bank.get(q.id)}`);
      const ans = ak[exam]?.answers ?? ak[exam];
      if (!ans) bad("B2", `${exam}: not in answer_keys`);
      else if (ans[n] !== q.correct_answer) bad("B2", `${q.id}: questions=${q.correct_answer} answer_keys=${ans[n]}`);
      if (!byYear.has(q.id)) bad("B3", `${q.id}: not in by_year (最上流から行が消えている — merge すると問が消滅する)`);
      else if (byYear.get(q.id) !== q.correct_answer) bad("B3", `${q.id}: questions=${q.correct_answer} by_year=${byYear.get(q.id)}`);
      // B6 図メタデータ bank == by_year (bbox 再裁断・再抽出の入力は by_year なので、ここがずれると是正済の図が戻る)
      { const yb = byYearFull.get(q.id), bb = bankFull.get(q.id);
        if (yb && bb) for (const k of ["has_figure", "figure_path", "figure_bbox_pct", "figure_type", "source", "choice_figure_paths"])
          if (JSON.stringify(yb[k] ?? null) !== JSON.stringify(bb[k] ?? null)) bad("B6", `${q.id}: ${k} differs between by_year and question_bank`); }
      // B5 表示テキスト 3 層一致 (stem_jp / choices_jp)
      for (const [layer, o] of [["question_bank", bankFull.get(q.id)], ["by_year", byYearFull.get(q.id)]]) {
        if (!o) continue;
        if (o.stem_jp !== q.stem_jp) bad("B5", `${q.id}: stem_jp differs in ${layer} (最上流まで是正が届いていない)`);
        for (const L of new Set([...Object.keys(q.choices_jp ?? {}), ...Object.keys(o.choices_jp ?? {})]))
          if (o.choices_jp?.[L] !== q.choices_jp?.[L]) bad("B5", `${q.id}: choices_jp.${L} differs in ${layer}`);
      }
    }
    // B4 key_guard integrity (D-143) — sidecar の key_guard は generate_result から決定的に導かれるはず。
    //   (i) round1 は「final と異なる時に限り必ず publish、かつ全フィールド一致」(merge の round1Differs 則を再計算)。
    //       → explfix が round1 を書き換えた / sidecar から round1 を削った、の両方を検出する。
    //   (ii) final の figure_derivable / derived_answer / matches_key / note_jp は generate_result と一致、
    //        stem_corruption_suspected は union(round1, final)、suspect は union 則 (matches_key=false or figure_derivable=false)。
    //        note_jp も比較する: D-143 §1 で explfix の書込先は generate_result のみ (sidecar 直編集禁止) なので、
    //        merge 済みの sidecar と一致しないのは「explfix 後に merge していない」か「sidecar を直に触った」のどちらか。
    //        ④ で是正した drift の主成分 (18 問) はまさに note_jp だった (reviewer 推奨)。
    if (existsSync(P2)) {
      const R1_FIELDS = ["figure_derivable", "derived_answer", "matches_key", "stem_corruption_suspected", "note_jp"];
      for (const exam of byExam.keys()) {
        const gr = path.join(P2, `generate_result_${exam}.json`);
        const ef = path.join(Q, "explanations", `${exam}.json`);
        if (!existsSync(gr) || !existsSync(ef)) continue;
        const byId = new Map(rj(gr).results.filter((r) => r?.id && r.key_guard).map((r) => [r.id, r]));
        for (const [id, ent] of Object.entries(rj(ef).questions)) {
          const r = byId.get(id);
          if (!r) { bad("B4", `${id}: no key_guard in generate_result`); continue; }
          const kgF = r.key_guard, kg1 = r.key_guard_round1 || kgF;
          const differs = kg1 !== kgF && R1_FIELDS.some((k) => kg1[k] !== kgF[k]);
          const pub = ent.key_guard ?? {};
          if (differs) {
            if (!pub.round1) bad("B4", `${id}: round1 differs from final in generate_result but sidecar publishes no round1 (削除 or 旧 merge)`);
            else for (const k of R1_FIELDS) if ((pub.round1[k] ?? null) !== (kg1[k] ?? null)) bad("B4", `${id}: round1.${k} differs from generate_result (explfix は round1 に触れない — D-143)`);
          } else if (pub.round1) bad("B4", `${id}: sidecar publishes round1 but generate_result round1 == final`);
          for (const k of ["figure_derivable", "derived_answer", "matches_key", "note_jp"]) {
            if ((pub[k] ?? null) !== (kgF[k] ?? null)) bad("B4", `${id}: final.${k}=${JSON.stringify(pub[k])} vs generate_result ${JSON.stringify(kgF[k])} (再 merge 未実施?)`);
          }
          const sc = kg1.stem_corruption_suspected === true || kgF.stem_corruption_suspected === true;
          if (pub.stem_corruption_suspected !== sc) bad("B4", `${id}: stem_corruption_suspected=${pub.stem_corruption_suspected} vs union ${sc}`);
          const sus = kg1.matches_key === false || kg1.figure_derivable === false || kgF.matches_key === false || kgF.figure_derivable === false;
          if (pub.suspect !== sus) bad("B4", `${id}: suspect=${pub.suspect} vs union ${sus}`);
        }
      }
    }
  }
}

// ───────────────────────── report ─────────────────────────
console.log(`quiz-keys-crosscheck: questions=${questions.length} exams=${byExam.size} layerB=${rawStatus}`);
if (problems.length) {
  console.error(`✗ ${problems.length} problem(s):`);
  for (const p of problems.slice(0, 200)) console.error(`  ${p}`);
  if (problems.length > 200) console.error(`  … +${problems.length - 200} more`);
  process.exit(1);
}
console.log(`✓ all invariants hold (A1–A7${rawStatus === "ran" ? ", B1–B6" : ""})`);
