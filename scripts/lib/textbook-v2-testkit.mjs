// Test helpers for scripts/textbook-v2-*.test.mjs (node --test). Never touches the real data:
// every test gets a temp data root whose read-only inputs are symlinks into data/ip and whose
// units/ holds a copy of the v1 unit, so prep / merge write only under the temp dir.

import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { jsonText, LANGS, readJson, REPO, stripLangs } from "./textbook-v2.mjs";

export const FIXTURE = path.join(REPO, "apps/web/src/lib/textbook/__fixtures__/v2-sample.json");
export const FIXTURE_V1TERMS = path.join(REPO, "apps/web/src/lib/textbook/__fixtures__/v2-sample.v1terms.json");
export const UNIT = "management-10-27-u03"; // the fixture's unit
const REAL = path.join(REPO, "data/ip");

/** The fixture unit's v1 file: the live one while it is v1, the merge's archive once the pilot made it v2. */
function v1Source() {
  const live = path.join(REAL, `textbook/units/${UNIT}.json`);
  return readJson(live).schema_version === "textbook-unit-v2"
    ? path.join(REAL, `textbook/.planning/v2/${UNIT}/v1-original.json`)
    : live;
}

/** A temp data root: index / figures / quiz symlinked, units/<UNIT>.json copied (v1). */
export function tempRoot() {
  const root = mkdtempSync(path.join(tmpdir(), "tbv2-"));
  mkdirSync(path.join(root, "textbook/units"), { recursive: true });
  symlinkSync(path.join(REAL, "textbook/unit_index.json"), path.join(root, "textbook/unit_index.json"));
  symlinkSync(path.join(REAL, "textbook/figures"), path.join(root, "textbook/figures"));
  symlinkSync(path.join(REAL, "quiz"), path.join(root, "quiz"));
  copyFileSync(v1Source(), path.join(root, `textbook/units/${UNIT}.json`));
  return root;
}

/** Run a pipeline script; { code, out } (stdout + stderr). */
export function run(script, args) {
  const p = spawnSync(process.execPath, ["--no-warnings", path.join(REPO, "scripts", script), ...args], { encoding: "utf-8" });
  return { code: p.status, out: `${p.stdout}${p.stderr}` };
}

/** The v2 sample unit (the shared web fixture; its 考点 are own words since S135 M3). */
export const fixture = () => readJson(FIXTURE);

/** The localised part a workflow would produce for the fixture (all three languages). */
export function locPartOf(u, round = 0, jpRound = 0) {
  const p = { unit_id: u.unit_id, stage: "loc", round, jp_round: jpRound };
  for (const k of ["goals", "overview_cols"]) for (const l of LANGS) p[`${k}_${l}`] = u[`${k}_${l}`];
  p.overview_rows = u.overview_rows;
  p.terms = u.terms.map((t) => {
    const o = { term: t.term };
    for (const b of ["one", "detail", "analogy", "hook"]) for (const l of LANGS) if (t[`${b}_${l}`] !== undefined) o[`${b}_${l}`] = t[`${b}_${l}`];
    o.points = t.points;
    o.fig = t.fig;
    o.quiz = t.quiz;
    return o;
  });
  p.pairs = u.pairs;
  for (const l of LANGS) p[`key_points_${l}`] = u[`key_points_${l}`];
  p.challenge_questions = u.challenge_questions;
  return structuredClone(p);
}

/** The JP part the localised part was made from. */
export function jpPartOf(loc) {
  const p = stripLangs(loc);
  p.stage = "jp";
  p.round = loc.jp_round;
  delete p.jp_round;
  return p;
}

export const writeJson = (f, o) => {
  mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, jsonText(o));
  return f;
};

/** journal.jsonl rows in the runtime's format (started + result per agent). */
export function journalText(results) {
  const lines = [{ type: "launched" }];
  results.forEach((r, i) => {
    lines.push({ type: "started", key: `k${i}`, agentId: `a${i}`, label: `${r.stage}#${r.round}` });
    lines.push({ type: "result", key: `k${i}`, agentId: `a${i}`, result: r });
  });
  return `${lines.map((l) => JSON.stringify(l)).join("\n")}\n`;
}
