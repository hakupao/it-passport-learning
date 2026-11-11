#!/usr/bin/env node
// D-215 C2 (S153) — recompute the stored v1 compat fields of every committed v2 unit in place, from the
// unit's own v2 fields, with the same exported formulas validateV2 checks (inline.ts compatText, validateV2
// introOf / hookLines). Deviation from the plan's "merge で再 --write": a re-merge re-assembles titles, the
// v1 figure and challenge_questions from manifest.v1 (reverting C3 / C10 direct edits) and refuses the frozen
// pilot units; the committed v2 fields are the patched loc part, so this yields what a re-merge would.
// Run: node evidence/phase5/stage_07_ui/phase3/cleanup/C2_rederive.mjs [--write]   (default: dry-run, lists changes)
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../../../..");
const lib = await import(pathToFileURL(path.join(REPO, "scripts/lib/textbook-v2.mjs")).href);
const kit = await lib.loadKit();
const { compatText, introOf, hookLines } = kit;
const LANGS = ["jp", "zh", "en"];
const write = process.argv.includes("--write");
const TB = path.join(REPO, "data/ip/textbook");
const index = JSON.parse(readFileSync(path.join(TB, "unit_index.json"), "utf-8"));
const changes = [];
for (const id of index.topics.flatMap((t) => t.units.map((u) => u.unit_id))) {
  const file = path.join(TB, "units", `${id}.json`);
  const before = readFileSync(file, "utf-8");
  const u = JSON.parse(before);
  if (u.schema_version !== kit.V2_SCHEMA) throw new Error(`${id}: not v2`);
  const set = (obj, key, val, where) => {
    const old = obj[key];
    if (JSON.stringify(old) !== JSON.stringify(val)) changes.push({ unit: id, field: where, before: old, after: val });
    obj[key] = val;
  };
  u.terms.forEach((t, i) => {
    const w = `terms[${i}](${t.term})`;
    for (const l of LANGS) {
      set(t, `definition_${l}`, compatText(t[`one_${l}`] ?? "", l), `${w}.definition_${l}`);
      set(t, `explanation_${l}`, compatText(t[`detail_${l}`] ?? "", l), `${w}.explanation_${l}`);
      set(t, `memory_hook_${l}`, typeof t[`hook_${l}`] === "string" ? compatText(t[`hook_${l}`], l) : "", `${w}.memory_hook_${l}`);
    }
  });
  for (const l of LANGS) {
    set(u.overview, `intro_${l}`, Array.isArray(u[`goals_${l}`]) ? introOf(u[`goals_${l}`], l) : "", `overview.intro_${l}`);
    set(u.summary, `key_points_${l}`, Array.isArray(u[`key_points_${l}`]) ? u[`key_points_${l}`].map((x) => compatText(x, l)) : [], `summary.key_points_${l}`);
    set(u.summary, `memory_hooks_${l}`, hookLines(u, l), `summary.memory_hooks_${l}`);
  }
  const after = lib.jsonText(u);
  if (after !== before && !changes.some((c) => c.unit === id)) throw new Error(`${id}: bytes differ with no field change (formatting)`);
  if (write && after !== before) writeFileSync(file, after);
}
const units = new Set(changes.map((c) => c.unit));
console.log(JSON.stringify({ write, units: units.size, fields: changes.length, byField: Object.entries(changes.reduce((a, c) => ((a[c.field.replace(/^terms\[\d+\]\([^)]*\)\./, "terms[].")] = (a[c.field.replace(/^terms\[\d+\]\([^)]*\)\./, "terms[].")] ?? 0) + 1), a), {})) }, null, 1));
writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "C2_changes.json"), lib.jsonText(changes));
