#!/usr/bin/env node
// Stage 7 Phase 3 Task 9 Step 3 (D-196 §0-9 / §0-13) — assemble the v2 unit from the workflow's
// final parts, write every v1-compat field deterministically, validate, and (with --write) replace
// data/ip/textbook/units/<id>.json.
//
// Run: node scripts/textbook-v2-merge.mjs --unit <id> [--journal <journal.jsonl>] [--write] [--data-root <dir>]
//
// Which parts are final — the journal is the record (S121): textbook-v2.workflow.mjs agents return
// {unit_id, stage, round, part, counts, …} as StructuredOutput, the runtime logs it to journal.jsonl.
//   - final localised part = the "loc" result with the highest round; its JP part = the "jp" result
//     whose round = loc.jp_round. Each part file is checked against its journal row (unit, stage,
//     round, structure counts: a part rewritten after the agent returned is refused).
//   - approved = a "jp-review" PASS for that JP round and a "loc-review" PASS for that loc round.
//   Without --journal (dry-run only) the newest parts/<unit>.{jp,loc}.r<N>.json are used, unapproved.
// The localised part must be the JP part plus zh / en only (lib locVsJp: structure, ids, Japanese).
//
// Assembly (lib assemble, the same as validate --part): new fields from the localised part; from the
// v1 original (manifest.v1): ids, titles, unit_summary_*, order_in_topic, prerequisites,
// source_figures, overview.freq_badge, term_zh / term_en (manifest.v1_terms) and the v1 `figure`
// object of an svg fig. Compat (validateV2's formulas): definition_* = stripInline(one_*),
// explanation_* = stripInline(detail_*), memory_hook_* = stripInline(hook_*) or "", inline_quiz =
// quiz, inline_fallback = false, figure = null unless fig.kind = svg, overview.intro_* =
// introOf(goals_*), summary.key_points_* = stripInline(key_points_*), summary.memory_hooks_* =
// hookLines(), lang_status = generated ×3, overview.est_minutes = max(3, ceil(JP chars of
// 一句話 + 展開 / 80)) (lib estMinutes).
//
// Output: always <planning>/<id>/merged.json (dry-run). --write additionally, only when the journal
// is given, both reviews PASS, validate (validateV2 + svg files) has 0 issues and parity 0 diff:
//   1. archive the v1 original to <planning>/<id>/v1-original.json (never overwritten; must equal
//      manifest.v1; a units file that is v1 but ≠ manifest.v1 means a stale manifest → refuse),
//   2. write data/ip/textbook/units/<id>.json.
//   Then run scripts/textbook-unit-minutes-build.mjs (copy-only) and its --check.
// Exit: 0 = merged (and written with --write), 1 = refused / issues, 2 = usage / input error.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { assemble, canon, dataPaths, jsonText, loadKit, locVsJp, parityDiff, parseArgs, partCounts, readJournal, readJson, V1_SCHEMA } from "./lib/textbook-v2.mjs";
import { validateUnit } from "./textbook-v2-validate.mjs";

class Refuse extends Error {}

/** Final parts + approvals for `unit` from journal results (or the parts dir when results is null). */
export function pickFinal(unit, results, partsDir) {
  if (results) {
    const mine = results.filter((r) => r && r.unit_id === unit);
    const last = (stage, pred = () => true) => mine.filter((r) => r.stage === stage && pred(r)).sort((a, b) => a.round - b.round).at(-1) ?? null;
    const loc = last("loc");
    if (!loc) throw new Refuse(`${unit}: no "loc" result in the journal`);
    const jp = last("jp", (r) => r.round === loc.jp_round);
    if (!jp) throw new Refuse(`${unit}: loc#${loc.round} was made from jp#${loc.jp_round}, which is not in the journal`);
    const jpReview = last("jp-review", (r) => r.reviewed_round === jp.round);
    const locReview = last("loc-review", (r) => r.reviewed_round === loc.round);
    return { jp, loc, jpReview, locReview, fromJournal: true };
  }
  const files = existsSync(partsDir) ? readdirSync(partsDir) : [];
  const newest = (stage) => {
    const re = new RegExp(`^${unit}\\.${stage}\\.r(\\d+)\\.json$`);
    const hit = files.map((f) => [f, re.exec(f)]).filter(([, m]) => m).sort((a, b) => Number(a[1][1]) - Number(b[1][1])).at(-1);
    return hit ? { stage, round: Number(hit[1][1]), part: path.join(partsDir, hit[0]) } : null;
  };
  const loc = newest("loc");
  if (!loc) throw new Refuse(`${unit}: no ${unit}.loc.r<N>.json in ${partsDir}`);
  const locDoc = readJson(loc.part);
  const jpFile = path.join(partsDir, `${unit}.jp.r${locDoc.jp_round ?? 0}.json`);
  if (!existsSync(jpFile)) throw new Refuse(`${unit}: ${path.basename(jpFile)} (loc.jp_round) not found`);
  return { jp: { stage: "jp", round: locDoc.jp_round ?? 0, part: jpFile }, loc: { ...loc, jp_round: locDoc.jp_round ?? 0 }, jpReview: null, locReview: null, fromJournal: false };
}

/** Read a part named by a journal row / parts-dir pick, checking it is the row's part. */
function readPart(row, unit) {
  if (typeof row.part !== "string" || !existsSync(row.part)) throw new Refuse(`${row.stage}#${row.round}: part file ${row.part} not found`);
  const p = readJson(row.part);
  if (p.unit_id !== unit || p.stage !== row.stage || p.round !== row.round) {
    throw new Refuse(`${row.part}: unit/stage/round ${p.unit_id}/${p.stage}/${p.round} ≠ journal ${unit}/${row.stage}/${row.round}`);
  }
  if (row.counts && canon(partCounts(p)) !== canon(row.counts)) {
    throw new Refuse(`${row.part}: structure ${canon(partCounts(p))} ≠ journal counts ${canon(row.counts)} (part changed after the agent returned)`);
  }
  return p;
}

export async function merge({ unit, journal, write, paths }) {
  const mf = paths.manifest(unit);
  if (!existsSync(mf)) throw new Refuse(`manifest not found: ${mf} (run textbook-v2-prep.mjs --unit ${unit})`);
  const manifest = readJson(mf);
  const results = journal ? readJournal(journal).results : null;
  const fin = pickFinal(unit, results, paths.parts(unit));
  const jpPart = readPart(fin.jp, unit);
  const locPart = readPart(fin.loc, unit);
  if (locPart.jp_round !== undefined && locPart.jp_round !== jpPart.round) throw new Refuse(`loc part says jp_round ${locPart.jp_round}, journal ${jpPart.round}`);
  const structure = locVsJp(locPart, jpPart);
  if (structure.length > 0) throw new Refuse(`localised part ≠ JP part + zh/en:\n  ${structure.join("\n  ")}`);

  const kit = await loadKit();
  const body = { ...locPart };
  delete body.jp_round;
  const unitDoc = assemble(body, manifest, kit);
  const issues = await validateUnit(unitDoc, manifest, paths);
  const diff = parityDiff(unitDoc);
  const out = paths.merged(unit);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, jsonText(unitDoc));

  const approved = {
    jp: fin.jpReview?.verdict === "PASS",
    loc: fin.locReview?.verdict === "PASS",
  };
  const report = {
    unit,
    jp_round: jpPart.round,
    loc_round: locPart.round,
    from_journal: fin.fromJournal,
    approved,
    issues,
    parity_diff: diff,
    merged: out,
    written: false,
  };
  if (!write) return report;

  const why = [];
  if (!fin.fromJournal) why.push("--write needs --journal (the journal is the record of the final parts)");
  if (!approved.jp) why.push(`JP review of jp#${jpPart.round}: ${fin.jpReview?.verdict ?? "none"}`);
  if (!approved.loc) why.push(`translation review of loc#${locPart.round}: ${fin.locReview?.verdict ?? "none"}`);
  if (issues.length > 0) why.push(`${issues.length} validate issue(s)`);
  if (diff.length > 0) why.push(`${diff.length} parity difference(s)`);
  if (why.length > 0) throw new Refuse(`not written:\n  ${why.join("\n  ")}`);

  // 1. archive the v1 original (never overwritten)
  const unitFile = paths.unit(unit);
  const cur = readJson(unitFile);
  const arch = paths.v1Original(unit);
  if (cur.schema_version === V1_SCHEMA && canon(cur) !== canon(manifest.v1)) {
    throw new Refuse(`${unitFile} is v1 but differs from manifest.v1 — the manifest is stale, re-run prep`);
  }
  if (existsSync(arch)) {
    if (canon(readJson(arch)) !== canon(manifest.v1)) throw new Refuse(`${arch} exists and differs from manifest.v1 — not overwriting the archive`);
  } else {
    if (cur.schema_version !== V1_SCHEMA) throw new Refuse(`${unitFile} is not v1 and no v1-original.json exists — nothing safe to archive`);
    writeFileSync(arch, readFileSync(unitFile, "utf-8"));
  }
  // 2. replace the unit
  writeFileSync(unitFile, jsonText(unitDoc));
  report.written = true;
  return report;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let opt;
  try {
    opt = parseArgs(process.argv.slice(2), { unit: "string", journal: "string", write: "bool", "data-root": "string" });
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exit(2);
  }
  if (!opt.unit) {
    console.error("usage: textbook-v2-merge.mjs --unit <id> [--journal <journal.jsonl>] [--write] [--data-root <dir>]");
    process.exit(2);
  }
  if (opt.journal && !existsSync(opt.journal)) {
    console.error(`✗ journal not found: ${opt.journal}`);
    process.exit(2);
  }
  const paths = dataPaths(opt["data-root"]);
  try {
    const r = await merge({ unit: opt.unit, journal: opt.journal ? path.resolve(opt.journal) : null, write: !!opt.write, paths });
    if (!r.from_journal) console.log("? no --journal: newest part files used, reviews unknown (dry-run only)");
    console.log(`${r.issues.length + r.parity_diff.length === 0 ? "✓" : "✗"} ${r.unit}: jp#${r.jp_round} + loc#${r.loc_round} → ${path.relative(process.cwd(), r.merged)}`);
    console.log(`  reviews: jp ${r.approved.jp ? "PASS" : "not PASS"} / loc ${r.approved.loc ? "PASS" : "not PASS"}; validate ${r.issues.length} issue(s); parity ${r.parity_diff.length} diff`);
    for (const i of r.issues) console.log(`  ${i.code.padEnd(13)} ${i.field}  ${i.message}`);
    for (const [loc, c] of r.parity_diff) console.log(`  parity ${loc}  jp=${c.jp} zh=${c.zh} en=${c.en}`);
    console.log(r.written ? `✓ wrote ${path.relative(process.cwd(), paths.unit(r.unit))} (v1 archived at ${path.relative(process.cwd(), paths.v1Original(r.unit))})` : "  dry-run: units/ not touched (--write to replace)");
    process.exit(r.issues.length + r.parity_diff.length === 0 ? 0 : 1);
  } catch (e) {
    if (!(e instanceof Refuse)) throw e;
    console.error(`✗ ${opt.unit}: ${e.message}`);
    process.exit(1);
  }
}
