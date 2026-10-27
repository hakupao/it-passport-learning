#!/usr/bin/env node
// Stage 7 Phase 3 Task 9 Step 3 (D-196 §0-9 / §0-13) — assemble the v2 unit from the workflow's
// final parts, write every v1-compat field deterministically, validate, and (with --write) replace
// data/ip/textbook/units/<id>.json.
//
// Run: node scripts/textbook-v2-merge.mjs --unit <id> (--journal <journal.jsonl> [--journal <more.jsonl> …] | --run-tag <tag>)
//        [--write] [--data-root <dir>]
//   Several --journal (a resumed / continued run): rows are read in order, one per unit / stage / round,
//   a later row replacing an earlier one.
//
// Which parts are final — the journal is the record (S121): textbook-v2.workflow.mjs agents return
// {unit_id, stage, round, part, sha256, counts, …} as StructuredOutput, the runtime logs it to journal.jsonl.
//   - final localised part = the "loc" row with the highest round; its JP part = the "jp" row whose
//     sha256 = loc.jp_sha256 (the bytes the localiser worked from). Each part file must hash to its
//     row's sha256 and match its unit / stage / round / structure counts — a part rewritten after
//     the agent returned, or a journal from another run, is refused (S135 M1).
//   - approved = a "jp-review" PASS whose reviewed_sha256 = that JP part's sha256 and a "loc-review"
//     PASS whose reviewed_sha256 = the loc part's sha256 (a review approves exactly what it hashed).
//   A seeded run's round-0 row carries seed_part / seed_sha256 / seed_review_round: printed as provenance,
//   never used for approval (the seed's own review was of other bytes).
//   Without --journal (dry-run only) the newest parts/<run-tag>/<unit>.{jp,loc}.r<N>.json are used, unapproved.
// The localised part must be the JP part plus zh / en only (lib locVsJp: structure, ids, Japanese).
//
// Assembly (lib assemble, the same as validate --part): new fields from the localised part; from the
// v1 original (manifest.v1): ids, titles, unit_summary_*, order_in_topic, prerequisites,
// source_figures, overview.freq_badge, term_zh / term_en (manifest.v1_terms) and the v1 `figure`
// object of an svg fig. Compat (validateV2's formulas): definition_* = stripInline(one_*),
// explanation_* = stripInline(detail_*), memory_hook_* = stripInline(hook_*) or "", inline_quiz =
// quiz, inline_fallback = false, figure = null unless fig.kind = svg, overview.intro_* =
// introOf(goals_*), summary.key_points_* = stripInline(key_points_*), summary.memory_hooks_* =
// hookLines(), lang_status = generated ×3, analogy_* stripped, overview.est_minutes = max(3,
// ceil(n / 80)), n = JP characters of one + detail + analogy + hook + 考点 + 易混 rows + key points +
// goals without markers / whitespace (lib estMinutes, S135 M4).
//
// Output: always <planning>/<id>/merged.json (dry-run). --write additionally, only when the journal
// is given, both reviews PASS, validate (validateV2 + svg files + copy guard) has 0 issues and parity 0 diff:
//   1. archive the v1 original to <planning>/<id>/v1-original.json (never overwritten; must equal
//      manifest.v1; a units file that is v1 but ≠ manifest.v1 means a stale manifest → refuse),
//   2. write data/ip/textbook/units/<id>.json.
//   Then run scripts/textbook-unit-minutes-build.mjs (copy-only) and its --check.
// Exit: 0 = merged (and written with --write), 1 = refused / issues, 2 = usage / input error.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { assemble, canon, dataPaths, jsonText, loadKit, locVsJp, parityDiff, parseArgs, partCounts, readJournal, readJson, RUN_TAG_RE, sha256File, V1_SCHEMA } from "./lib/textbook-v2.mjs";
import { validateUnit } from "./textbook-v2-validate.mjs";

class Refuse extends Error {}

/** Journal rows of all runs (journals in order), one per stage / round: a later row replaces an earlier one (resume). */
export function journalRows(files) {
  const byKey = new Map();
  for (const f of files) for (const r of readJournal(f).results) if (r && typeof r.stage === "string") byKey.set(`${r.unit_id}|${r.stage}|${r.round}`, r);
  return [...byKey.values()];
}

/** Final parts + approvals for `unit` from journal rows (or the run's parts dir when rows is null). */
export function pickFinal(unit, rows, partsDir) {
  if (rows) {
    const mine = rows.filter((r) => r.unit_id === unit);
    const last = (stage, pred = () => true) => mine.filter((r) => r.stage === stage && pred(r)).sort((a, b) => a.round - b.round).at(-1) ?? null;
    const loc = last("loc");
    if (!loc) throw new Refuse(`${unit}: no "loc" result in the journal`);
    // the JP part = the one the localiser hashed (validate --part … --jp prints jp_sha256)
    const jp = last("jp", (r) => typeof r.sha256 === "string" && r.sha256 === loc.jp_sha256);
    if (!jp) throw new Refuse(`${unit}: loc#${loc.round} was made from a JP part (sha256 ${loc.jp_sha256}) that is not a "jp" row of the journal`);
    // a review approves exactly the bytes it hashed
    const jpReview = last("jp-review", (r) => r.reviewed_sha256 === jp.sha256);
    const locReview = last("loc-review", (r) => r.reviewed_sha256 === loc.sha256);
    return { jp, loc, jpReview, locReview, fromJournal: true };
  }
  if (!partsDir) throw new Refuse(`${unit}: without --journal, name the run with --run-tag`);
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
  return { jp: { stage: "jp", round: locDoc.jp_round ?? 0, part: jpFile }, loc, jpReview: null, locReview: null, fromJournal: false };
}

/** Read a part named by a journal row / parts-dir pick, checking it is the row's part (sha256, ids, counts). */
function readPart(row, unit) {
  if (typeof row.part !== "string" || !existsSync(row.part)) throw new Refuse(`${row.stage}#${row.round}: part file ${row.part} not found`);
  if (row.sha256 !== undefined && sha256File(row.part) !== row.sha256) {
    throw new Refuse(`${row.part}: sha256 ${sha256File(row.part)} ≠ journal ${row.sha256} (the part changed after the agent returned, or the journal is from another run)`);
  }
  const p = readJson(row.part);
  if (p.unit_id !== unit || p.stage !== row.stage || p.round !== row.round) {
    throw new Refuse(`${row.part}: unit/stage/round ${p.unit_id}/${p.stage}/${p.round} ≠ journal ${unit}/${row.stage}/${row.round}`);
  }
  if (row.counts && canon(partCounts(p)) !== canon(row.counts)) {
    throw new Refuse(`${row.part}: structure ${canon(partCounts(p))} ≠ journal counts ${canon(row.counts)} (part changed after the agent returned)`);
  }
  return p;
}

export async function merge({ unit, journals, runTag, write, paths }) {
  const mf = paths.manifest(unit);
  if (!existsSync(mf)) throw new Refuse(`manifest not found: ${mf} (run textbook-v2-prep.mjs --unit ${unit})`);
  const manifest = readJson(mf);
  const rows = journals?.length ? journalRows(journals) : null;
  const fin = pickFinal(unit, rows, runTag ? paths.parts(unit, runTag) : null);
  const jpPart = readPart(fin.jp, unit);
  const locPart = readPart(fin.loc, unit);
  if (locPart.jp_round !== undefined && locPart.jp_round !== jpPart.round) throw new Refuse(`loc part says jp_round ${locPart.jp_round}, its JP part is round ${jpPart.round}`);
  // the localiser may add zh / en only: compared with the JP part it hashed (= the reviewed one when approved)
  const structure = locVsJp(locPart, jpPart);
  if (structure.length > 0) throw new Refuse(`localised part ≠ JP part + zh/en:\n  ${structure.join("\n  ")}`);

  const kit = await loadKit();
  const unitDoc = assemble(locPart, manifest, kit);
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
    // a seeded run (workflow args.seed_*): provenance only — approval above is of the final part's own sha256
    seed: rows?.find((r) => r.unit_id === unit && r.stage === "jp" && typeof r.seed_sha256 === "string") ?? null,
  };
  if (!write) return report;

  const why = [];
  if (!fin.fromJournal) why.push("--write needs --journal (the journal is the record of the final parts)");
  if (!approved.jp) why.push(`JP review of jp#${jpPart.round}: ${fin.jpReview?.verdict ?? "none"}`);
  if (!approved.loc) why.push(`translation review of loc#${locPart.round}: ${fin.locReview?.verdict ?? "none"}`);
  if (issues.length > 0) why.push(`${issues.length} validate issue(s):`, ...issues.map((i) => `  ${i.code.padEnd(13)} ${i.field}  ${i.message}`));
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
    opt = parseArgs(process.argv.slice(2), { unit: "string", journal: "list", "run-tag": "string", write: "bool", "data-root": "string" });
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exit(2);
  }
  if (!opt.unit) {
    console.error("usage: textbook-v2-merge.mjs --unit <id> (--journal <journal.jsonl> [--journal <resumed run's journal.jsonl> …] | --run-tag <tag>) [--write] [--data-root <dir>]");
    process.exit(2);
  }
  for (const j of opt.journal ?? []) {
    if (!existsSync(j)) {
      console.error(`✗ journal not found: ${j}`);
      process.exit(2);
    }
  }
  if (opt["run-tag"] && !RUN_TAG_RE.test(opt["run-tag"])) {
    console.error(`✗ --run-tag must match ${RUN_TAG_RE}`);
    process.exit(2);
  }
  const paths = dataPaths(opt["data-root"]);
  try {
    const r = await merge({ unit: opt.unit, journals: (opt.journal ?? []).map((j) => path.resolve(j)), runTag: opt["run-tag"], write: !!opt.write, paths });
    if (!r.from_journal) console.log(`? no --journal: newest part files of run ${opt["run-tag"]} used, reviews unknown (dry-run only)`);
    console.log(`${r.issues.length + r.parity_diff.length === 0 ? "✓" : "✗"} ${r.unit}: jp#${r.jp_round} + loc#${r.loc_round} → ${path.relative(process.cwd(), r.merged)}`);
    if (r.seed) console.log(`  seed: ${r.seed.seed_part} (sha256 ${String(r.seed.seed_sha256).slice(0, 12)}…, jp-review #${r.seed.seed_review_round}) — provenance only`);
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
