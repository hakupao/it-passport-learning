#!/usr/bin/env node
// Stage 7 Phase 3 Task 9 (D-196 §0-13) — run validateV2 (apps/web/src/lib/textbook/validateV2.ts, the
// same module the web tests use) on a v2 unit or on a writer part, with the prep manifest's
// v1Terms + chumon members, plus the checks validateV2 cannot do without fs / the manifest:
// svg files exist (code svg-file), and the copy guard (code copy, lib copyIssues: no run of 20+
// normalised characters of stored JP prose may occur in a manifest question's stem / choices /
// explanation — use the facts, write your own sentences).
//
// Run (exactly one of --unit / --file / --part):
//   node scripts/textbook-v2-validate.mjs --unit <id>          data/ip/textbook/units/<id>.json
//   node scripts/textbook-v2-validate.mjs --file <unit.json>   any v2 unit file (e.g. .planning/v2/<id>/merged.json)
//   node scripts/textbook-v2-validate.mjs --part <part.json> [--jp <jp-part.json>]
//        a workflow part, assembled exactly as the merge script does (compat fields derived):
//        - stage "jp" (JP only): zh / en are filled with copies of the Japanese and issues that only
//          concern zh / en are dropped (fields *_zh / *_en / .zh / .en; `sentences` reports without jp).
//          A pre-check for the writer; the merged unit (--file / --unit) is the authoritative gate.
//        - stage "loc" (all three languages): full validation; with --jp, also checks the localised
//          part is the JP part plus zh / en only (structure, ids, Japanese untouched).
//   [--manifest <manifest.json>]  default <data-root>/textbook/.planning/v2/<unit>/manifest.json
//   [--data-root <dir>]           default <repo>/data/ip
//   With --part, `counts {...}` (lib partCounts) and `sha256 <hex>` (the part file) are printed first,
//   with --jp also `jp_sha256 <hex>`: the workflow agents return them, merge recomputes and compares.
// Exit: 0 = no issues, 1 = issues (printed one per line as `code  field  message`), 2 = usage / input error.

import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  assemble,
  contextFor,
  copyIssues,
  dataPaths,
  jpOnlyIssues,
  loadKit,
  locVsJp,
  mirrorJp,
  parseArgs,
  partCounts,
  readJson,
  sha256File,
  svgProblems,
} from "./lib/textbook-v2.mjs";

/** Issues of a full v2 unit (validateV2 + svg files + copy guard). */
export async function validateUnit(unit, manifest, paths) {
  const kit = await loadKit();
  return [
    ...kit.v2.validateV2(unit, contextFor(kit.v2, paths, manifest)),
    ...svgProblems(unit, paths.tb),
    ...copyIssues(unit, manifest, kit.stripInline, unit.unit_id),
  ];
}

/** The unit a part assembles to (mirrored when JP-only). */
export async function unitOfPart(part, manifest) {
  const body = part.stage === "jp" ? mirrorJp(part) : part;
  return assemble(body, manifest, await loadKit());
}

/** Issues of a part (see header). */
export async function validatePart(part, manifest, paths, jpPart = null) {
  if (part.stage !== "jp" && part.stage !== "loc") return [{ unitId: part.unit_id, code: "part", field: "stage", message: `expected "jp" or "loc", got ${JSON.stringify(part.stage)}` }];
  if (part.unit_id !== manifest.unit_id) return [{ unitId: part.unit_id, code: "part", field: "unit_id", message: `≠ manifest ${manifest.unit_id}` }];
  const issues = await validateUnit(await unitOfPart(part, manifest), manifest, paths);
  const out = part.stage === "jp" ? jpOnlyIssues(issues) : issues;
  if (jpPart) for (const d of locVsJp(part, jpPart)) out.push({ unitId: part.unit_id, code: "loc-structure", field: d.split(":")[0], message: d });
  return out;
}

const fmt = (i) => `${i.code.padEnd(13)} ${i.field}  ${i.message}`;

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let opt;
  try {
    opt = parseArgs(process.argv.slice(2), { unit: "string", file: "string", part: "string", jp: "string", manifest: "string", "data-root": "string" });
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exit(2);
  }
  const modes = ["unit", "file", "part"].filter((k) => opt[k]);
  if (modes.length !== 1 || (opt.jp && !opt.part)) {
    console.error("usage: textbook-v2-validate.mjs (--unit <id> | --file <unit.json> | --part <part.json> [--jp <jp-part.json>]) [--manifest <m>] [--data-root <dir>]");
    process.exit(2);
  }
  const paths = dataPaths(opt["data-root"]);
  const file = opt.unit ? paths.unit(opt.unit) : path.resolve(opt.file ?? opt.part);
  if (!existsSync(file)) {
    console.error(`✗ not found: ${file}`);
    process.exit(2);
  }
  const doc = readJson(file);
  const unitId = doc.unit_id;
  const mf = opt.manifest ? path.resolve(opt.manifest) : paths.manifest(unitId);
  if (!existsSync(mf)) {
    console.error(`✗ manifest not found: ${mf} (run scripts/textbook-v2-prep.mjs --unit ${unitId} first)`);
    process.exit(2);
  }
  const manifest = readJson(mf);
  const issues = opt.part
    ? await validatePart(doc, manifest, paths, opt.jp ? readJson(path.resolve(opt.jp)) : null)
    : await validateUnit(doc, manifest, paths);
  const what = opt.part ? `part ${doc.stage}#${doc.round}` : "unit";
  // the workflow agents copy this line into their StructuredOutput; merge cross-checks it
  if (opt.part) {
    console.log(`counts ${JSON.stringify(partCounts(doc))}`);
    console.log(`sha256 ${sha256File(file)}`);
    if (opt.jp) console.log(`jp_sha256 ${sha256File(path.resolve(opt.jp))}`);
  }
  if (issues.length === 0) {
    console.log(`✓ ${unitId} ${what}: 0 issues (${path.relative(process.cwd(), file)})`);
    process.exit(0);
  }
  console.log(`✗ ${unitId} ${what}: ${issues.length} issue(s) (${path.relative(process.cwd(), file)})`);
  for (const i of issues) console.log(`  ${fmt(i)}`);
  process.exit(1);
}
