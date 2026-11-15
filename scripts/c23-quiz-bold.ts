#!/usr/bin/env node
// S157 C23 — the quiz renderer has no bold: 2009h21a q097〜q100 (one shared stem) wrap the two figure captions in
// `**…**`, shown as literal asterisks. Drop the markers on those whole-line captions (`**X**` → `X`) in the
// translations sidecar (stem_jp_clean / stem.zh / stem.en), and in .phase1 tr_ / .phase1.5 stem_ when the same text is there.
// Each field must have exactly 2 such lines and no other `**`. Run: node --no-warnings scripts/c23-quiz-bold.ts [--apply]
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const APPLY = process.argv.includes("--apply");
const IDS = ["097", "098", "099", "100"].map((n) => `2009h21a-q${n}`);
const unbold = (s: string) => s.replace(/^\*\*([^*\n]+)\*\*$/gm, "$1");
const check = (id: string, k: string, v: string) => {
  const n = (v.match(/^\*\*[^*\n]+\*\*$/gm) ?? []).length;
  if (n !== 2 || unbold(v).includes("**")) throw new Error(`${id} ${k}: expected 2 whole-line bold captions and no other **`);
};
const sideFile = path.join(ROOT, "data/ip/quiz/translations/2009h21a.json");
const side = JSON.parse(readFileSync(sideFile, "utf-8"));
const out: Record<string, unknown>[] = [];
const layer = (file: string, edit: (d: Record<string, any>) => string[]) => {
  if (!existsSync(file)) return "no file";
  const raw = readFileSync(file, "utf-8");
  const d = JSON.parse(raw);
  const changed = edit(d);
  if (APPLY && changed.length) writeFileSync(file, `${JSON.stringify(d, null, raw.startsWith("{\n  ") ? 2 : 0)}${raw.endsWith("\n") ? "\n" : ""}`);
  return changed.length ? `fixed ${changed.join(",")}` : "differs (left)";
};
for (const id of IDS) {
  const q = side.questions[id];
  const before = { clean: q.stem_jp_clean, zh: q.stem.zh, en: q.stem.en } as Record<string, string>;
  for (const [k, v] of Object.entries(before)) check(id, k, v);
  q.stem_jp_clean = unbold(before.clean!);
  q.stem.zh = unbold(before.zh!);
  q.stem.en = unbold(before.en!);
  const p1 = layer(path.join(ROOT, "data/ip/quiz/.phase1", `tr_${id}.json`), (d) => {
    const c: string[] = [];
    if (d.stem_jp_clean === before.clean) { d.stem_jp_clean = q.stem_jp_clean; c.push("clean"); }
    for (const l of ["zh", "en"]) if (d.stem?.[l] === before[l]) { d.stem[l] = q.stem[l]; c.push(l); }
    return c;
  });
  const p15 = layer(path.join(ROOT, "data/ip/quiz/.phase1.5", `stem_${id}.json`), (d) => {
    const c: string[] = [];
    for (const [k, v] of Object.entries(d)) if (typeof v === "string" && v.includes("**") && Object.values(before).includes(v)) { d[k] = unbold(v); c.push(k); }
    return c;
  });
  out.push({ id, fields: ["stem_jp_clean", "stem.zh", "stem.en"], phase1: p1, phase1_5: p15 });
}
if (APPLY) writeFileSync(sideFile, `${JSON.stringify(side, null, 2)}\n`);
console.log(JSON.stringify({ mode: APPLY ? "apply" : "plan", out }, null, 1));
