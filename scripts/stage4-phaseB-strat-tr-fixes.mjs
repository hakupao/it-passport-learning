#!/usr/bin/env node
/**
 * Stage 4 Phase B — 第三批 (strategy) 三語ゲート修正 (確定的)。
 *
 * ユーザー三語ゲート判定 (2026-06-08):
 *  (1) 翻訳 Rule A の唯一 terminology_natural=false:
 *      strategy-05-15-u01 センシング技術 zh「计测」→「测量」(本土標準形、日語漢語直輸入を是正)。
 *      faithful は維持 (意味は通じる)、自然さの本土化のみ。en は measure で正確=不変。
 *      → translation_{unit}.json の該当 term zh 字段を確定的置換 → 当該 unit re-merge。
 *  (2) EC (strategy-05-16-u01) analogy の日語原文が CtoC を「店舗の取引相手」で説明=概念的に不正確
 *      (CtoC=個人間取引で店舗/事業者の売り手は不在)。翻訳は原文を忠実再現=翻訳欠陥ではない (auditor ACCEPT)。
 *      ユーザー選択=「現在修日语原文+重译该unit」。
 *      → content_{unit}.json の analogy_jp を当事者ベースに是正 (確定的)。
 *        その後 re-assemble(明示args) → re-render → re-translate(workflow, Rule D) → re-merge で三語再生成。
 *
 * 確定的・LLM 不要 (D-132)。EC の再翻訳のみ workflow (translator=general-purpose ≠ reviewer=code-reviewer, Rule D)。
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PL = join(ROOT, "data/ip/textbook/.planning");
const FAILDIR = join(ROOT, "failures/stage_04_strat_fixes");
mkdirSync(FAILDIR, { recursive: true });

const applied = [], failed = [];

// ── (1) センシング技術 zh 计测→测量 (translation源, term zh 字段で replace-all) ──
{
  const p = join(PL, "translation_strategy-05-15-u01.json");
  const doc = JSON.parse(readFileSync(p, "utf8"));
  const t = doc.terms.find((x) => x.term_jp === "センシング技術");
  if (!t) { failed.push({ id: "05-15-u01", why: "term センシング技術 not found" }); }
  else {
    let n = 0;
    for (const f of ["definition", "explanation", "analogy", "memory_hook"]) {
      if (t[f] && typeof t[f].zh === "string" && t[f].zh.includes("计测")) {
        t[f].zh = t[f].zh.split("计测").join("测量");
        n += 1;
      }
    }
    if (n === 0) { failed.push({ id: "05-15-u01", why: "计测 not present (already fixed?)" }); }
    else { writeFileSync(p, JSON.stringify(doc, null, 2)); applied.push({ id: "strategy-05-15-u01", term: "センシング技術", field: `zh 计测→测量 x${n}field`, kind: "low-l10n" }); }
  }
}

// ── (2) EC analogy_jp 是正 (content源, 当事者ベースで CtoC を正す) ──
{
  const p = join(PL, "content_strategy-05-16-u01.json");
  const doc = JSON.parse(readFileSync(p, "utf8"));
  const t = doc.terms.find((x) => x.term === "EC");
  const before = "実店舗のレジでの売買を、そのままネット上に持ち込んだものが EC です。店舗が会社相手か個人相手かで BtoB・BtoC・CtoC と呼び分けます。";
  const after = "実店舗のレジでの売買を、そのままネット上に持ち込んだものが EC です。取引の当事者が会社どうしなら BtoB、会社と個人(消費者)なら BtoC、個人どうしなら CtoC と呼び分けます。";
  if (!t) { failed.push({ id: "05-16-u01", why: "term EC not found" }); }
  else if (t.analogy_jp === after) { /* already */ }
  else if (t.analogy_jp !== before) { failed.push({ id: "05-16-u01", why: "analogy_jp before mismatch", got: (t.analogy_jp || "").slice(0, 120) }); }
  else { t.analogy_jp = after; writeFileSync(p, JSON.stringify(doc, null, 2)); applied.push({ id: "strategy-05-16-u01", term: "EC", field: "analogy_jp (CtoC 当事者是正)", kind: "high-completeness-source" }); }
}

console.log("=== 第三批 strategy 三語ゲート修正 ===");
console.log(`applied=${applied.length} failed=${failed.length}`);
for (const a of applied) console.log(`  ✓ [${a.kind}] ${a.id}/${a.term} (${a.field})`);
for (const f of failed) console.log(`  ✗ FAIL ${f.id}: ${f.why}${f.got ? " | got: " + f.got : ""}`);
if (failed.length) { writeFileSync(join(FAILDIR, "tr_fix_before_mismatch.json"), JSON.stringify(failed, null, 2)); console.error("\n⚠ before 不一致 → failures/ 归档 (Rule B)。"); process.exit(1); }
console.log("\n次: (1) 05-15-u01 を re-merge。(2) 05-16-u01 を re-assemble(明示args)+re-render+re-translate(workflow)+re-merge。");
