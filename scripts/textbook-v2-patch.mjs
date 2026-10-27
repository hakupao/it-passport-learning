#!/usr/bin/env node
// Stage 7 Phase 3 batch B3 (D-201 §0-4) — wording patches of a v2 unit, replayed by textbook-v2-merge.mjs
// on the in-memory localised part (after the loc-vs-JP structure check, before assemble / validate), so the
// compat fields and est_minutes follow the patched text and the reviewed part files stay untouched.
//
// Patch file: <batch-dir>/patches/<unit>.json (default batch dir evidence/phase5/stage_07_ui/phase3/batch,
// committed). Own wording only — never past-question text.
//   { "unit_id": "<unit>", "patches": [ { "id": "p01", "status": "active" | "retired",
//       "base_sha256": "<sha256 of the loc part file the patch was written against>",
//       "field": "terms[2](回避).detail_zh",   // path into the loc part; (term) is checked against terms[i].term
//       "before": "…", "after": "…", "reason": "Rule A L3 / user 改 X …",
//       "retired_reason"?: "…" } ] }
// Replay, in file order, each active patch on the result of the previous ones:
//   base_sha256 ≠ the final loc part's sha256 → refused (the part was regenerated: retire the patch);
//   `before` occurs once in the field → replaced; `before` absent but `after` present → skipped (already in);
//   neither → refused; `before` more than once → refused (ambiguous).
// Strings only: a patch never adds / removes array items or changes structure (structural change = regenerate, §0-2).
//
// Frozen baseline (§0-4 N1): <batch-dir>/frozen_baseline.json lists units whose units/ file cannot be
// reproduced from their journal (the pilot: post-merge lowfix 7de5fb5 + D-200 cut 1cb8080); merge --write refuses them.
//
// Run:
//   node scripts/textbook-v2-patch.mjs --unit <id> --list
//   node scripts/textbook-v2-patch.mjs --unit <id> --register --part <final loc part.json> --field <path> --before <s> --after <s> --reason <s>
//   node scripts/textbook-v2-patch.mjs --unit <id> --retire <pNN> --reason <s>
//   [--batch-dir <dir>]
// Exit: 0 = ok, 1 = refused, 2 = usage error.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { jsonText, parseArgs, readJson, REPO, sha256File, UNIT_ID_RE } from "./lib/textbook-v2.mjs";

export const BATCH_DIR = path.join(REPO, "evidence/phase5/stage_07_ui/phase3/batch");
export const FROZEN_FILE = path.join(BATCH_DIR, "frozen_baseline.json");
export const patchFileOf = (batchDir, unit) => path.join(batchDir, "patches", `${unit}.json`);

export class PatchError extends Error {}

/** `terms[2](回避).detail_zh` → [{key:"terms"}, {index:2, term:"回避"}, {key:"detail_zh"}]. */
export function parseField(field) {
  if (typeof field !== "string" || field === "") throw new PatchError(`field ${JSON.stringify(field)}: empty`);
  const out = [];
  const re = /\.?([A-Za-z_][A-Za-z0-9_]*)|\[(\d+)\](?:\(([^)]*)\))?/y;
  let at = 0;
  while (at < field.length) {
    re.lastIndex = at;
    const m = re.exec(field);
    if (!m || (m[1] !== undefined && at === 0 && field[0] === ".")) throw new PatchError(`field ${JSON.stringify(field)}: cannot parse at ${at}`);
    if (m[1] !== undefined) out.push({ key: m[1] });
    else out.push(m[3] !== undefined ? { index: Number(m[2]), term: m[3] } : { index: Number(m[2]) });
    at = re.lastIndex;
  }
  return out;
}

/** The container + key of a field in the part (throws when the path does not exist or is not a string). */
function locate(part, field) {
  const steps = parseField(field);
  let cur = part;
  for (let i = 0; i < steps.length - 1; i++) {
    const s = steps[i];
    cur = s.key !== undefined ? cur?.[s.key] : Array.isArray(cur) ? cur[s.index] : undefined;
    if (cur === undefined || cur === null) throw new PatchError(`${field}: no such path in the part`);
    if (s.term !== undefined && cur.term !== s.term) throw new PatchError(`${field}: item ${s.index} is ${JSON.stringify(cur.term)}, not ${JSON.stringify(s.term)}`);
  }
  const last = steps.at(-1);
  const key = last.key ?? last.index;
  if (last.term !== undefined) throw new PatchError(`${field}: a patch targets a string, not a term`);
  if (typeof cur?.[key] !== "string") throw new PatchError(`${field}: not a string in the part`);
  return { obj: cur, key };
}

const occurrences = (s, sub) => (sub === "" ? 0 : s.split(sub).length - 1);

/** Replay active patches on `part` (mutated). results: [{id, field, outcome: "applied" | "skipped"}]. */
export function applyPatches(part, patches, locSha) {
  const results = [];
  for (const p of patches ?? []) {
    if (p.status !== "active") continue;
    if (p.base_sha256 !== locSha) {
      throw new PatchError(
        `${p.id}: base_sha256 ${String(p.base_sha256).slice(0, 12)}… ≠ the final loc part ${locSha.slice(0, 12)}… — the part was regenerated; retire the patch (textbook-v2-patch.mjs --retire ${p.id}) and register again against the new part if still needed`,
      );
    }
    const { obj, key } = locate(part, p.field);
    const nb = occurrences(obj[key], p.before);
    if (nb > 1) throw new PatchError(`${p.id}: "before" occurs ${nb} times in ${p.field} — make it unique`);
    if (nb === 1) {
      obj[key] = obj[key].replace(p.before, () => p.after);
      results.push({ id: p.id, field: p.field, outcome: "applied" });
    } else if (occurrences(obj[key], p.after) > 0) results.push({ id: p.id, field: p.field, outcome: "skipped" });
    else throw new PatchError(`${p.id}: neither "before" nor "after" found in ${p.field}`);
  }
  return { part, results };
}

/** The patch file of a unit ({unit_id, patches: []} when none). */
export function readPatches(batchDir, unit) {
  const f = patchFileOf(batchDir, unit);
  if (!existsSync(f)) return { unit_id: unit, patches: [] };
  const doc = readJson(f);
  if (doc.unit_id !== unit || !Array.isArray(doc.patches)) throw new PatchError(`${f}: unit_id ${doc.unit_id} / patches not an array`);
  return doc;
}

/** frozen_baseline.json of a batch dir: unit → reason ({} when absent). */
export function readFrozen(batchDir) {
  const f = path.join(batchDir, "frozen_baseline.json");
  return existsSync(f) ? readJson(f).units ?? {} : {};
}

function writePatches(batchDir, doc) {
  const f = patchFileOf(batchDir, doc.unit_id);
  mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, jsonText(doc));
  return f;
}

/** Register a patch against the final loc part file (earlier active patches applied first). */
export function register(batchDir, unit, { part: partFile, field, before, after, reason }) {
  if (!before || typeof after !== "string" || before === after) throw new PatchError("--before must be non-empty and differ from --after");
  if (!reason) throw new PatchError("--reason is required");
  const part = readJson(partFile);
  if (part.unit_id !== unit || part.stage !== "loc") throw new PatchError(`${partFile}: not a loc part of ${unit}`);
  const sha = sha256File(partFile);
  const doc = readPatches(batchDir, unit);
  applyPatches(part, doc.patches, sha); // refuses stale actives
  const { obj, key } = locate(part, field);
  const n = occurrences(obj[key], before);
  if (n !== 1) throw new PatchError(`"before" occurs ${n} times in ${field} (after the earlier patches) — it must occur exactly once`);
  const id = `p${String(doc.patches.length + 1).padStart(2, "0")}`;
  doc.patches.push({ id, status: "active", base_sha256: sha, field, before, after, reason });
  return { id, file: writePatches(batchDir, doc) };
}

export function retire(batchDir, unit, id, reason) {
  if (!reason) throw new PatchError("--reason is required");
  const doc = readPatches(batchDir, unit);
  const p = doc.patches.find((x) => x.id === id);
  if (!p) throw new PatchError(`${unit}: no patch ${id}`);
  p.status = "retired";
  p.retired_reason = reason;
  return writePatches(batchDir, doc);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let opt;
  try {
    opt = parseArgs(process.argv.slice(2), {
      unit: "string", list: "bool", register: "bool", retire: "string", part: "string", field: "string", before: "string", after: "string", reason: "string", "batch-dir": "string",
    });
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exit(2);
  }
  const modes = ["list", "register", "retire"].filter((k) => opt[k]);
  if (!opt.unit || !UNIT_ID_RE.test(opt.unit) || modes.length !== 1 || (opt.register && (!opt.part || !opt.field || opt.before === undefined || opt.after === undefined))) {
    console.error("usage: textbook-v2-patch.mjs --unit <id> (--list | --register --part <loc part> --field <path> --before <s> --after <s> --reason <s> | --retire <pNN> --reason <s>) [--batch-dir <dir>]");
    process.exit(2);
  }
  const batchDir = path.resolve(opt["batch-dir"] ?? BATCH_DIR);
  try {
    if (opt.list) {
      const doc = readPatches(batchDir, opt.unit);
      if (doc.patches.length === 0) console.log(`${opt.unit}: no patches`);
      for (const p of doc.patches) console.log(`${p.id} ${p.status} base ${String(p.base_sha256).slice(0, 12)}… ${p.field}: ${JSON.stringify(p.before)} → ${JSON.stringify(p.after)} (${p.reason}${p.retired_reason ? `; retired: ${p.retired_reason}` : ""})`);
    } else if (opt.register) {
      if (!existsSync(opt.part)) throw new PatchError(`not found: ${opt.part}`);
      const r = register(batchDir, opt.unit, { part: path.resolve(opt.part), field: opt.field, before: opt.before, after: opt.after, reason: opt.reason });
      console.log(`✓ ${opt.unit} ${r.id} registered → ${path.relative(process.cwd(), r.file)}`);
    } else {
      const f = retire(batchDir, opt.unit, opt.retire, opt.reason);
      console.log(`✓ ${opt.unit} ${opt.retire} retired → ${path.relative(process.cwd(), f)}`);
    }
  } catch (e) {
    if (!(e instanceof PatchError)) throw e;
    console.error(`✗ ${opt.unit}: ${e.message}`);
    process.exit(1);
  }
}
