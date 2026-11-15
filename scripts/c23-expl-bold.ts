#!/usr/bin/env node
// S158 C23 follow-up (Rule D c23_review.md MEDIUM-1) — 2009h21a-q096 distractor イ explains the misreading with a bold
// `**以上**` / `**more**` (jp / zh / en); ExplanationPane renders no bold, so the asterisks showed. Drop the markers
// (keep the word) in the .phase2 sources (expl_jp distractors_jp[イ].why_wrong_jp, expl_tr distractors[イ].zh / .en),
// after checking quiz-phase2-merge reproduces the committed sidecar; rebuild and check the sidecar = before + these 3 values.
// Run: node --no-warnings scripts/c23-expl-bold.ts [--apply]
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const APPLY = process.argv.includes("--apply");
const EXAM = "2009h21a";
const QID = "2009h21a-q096";
const LETTER = "イ";
const SIDE = path.join(ROOT, "data/ip/quiz/explanations", `${EXAM}.json`);
const JP = path.join(ROOT, "data/ip/quiz/.phase2", `expl_jp_${QID}.json`);
const TR = path.join(ROOT, "data/ip/quiz/.phase2", `expl_tr_${QID}.json`);
const unbold = (s: string) => {
  const n = (s.match(/\*\*[^*\n]+\*\*/g) ?? []).length;
  const out = s.replace(/\*\*([^*\n]+)\*\*/g, "$1");
  if (n !== 1 || out.includes("**")) throw new Error(`expected exactly one **…** in «${s.slice(0, 40)}…»`);
  return out;
};
const write = (f: string, raw: string, d: unknown) => writeFileSync(f, `${JSON.stringify(d, null, raw.startsWith("{\n  ") ? 2 : 0)}${raw.endsWith("\n") ? "\n" : ""}`);

const sideRaw = readFileSync(SIDE, "utf-8");
const side = JSON.parse(sideRaw);
const sd = side.questions[QID].distractors[LETTER];
const plan = { jp: unbold(sd.jp), zh: unbold(sd.zh), en: unbold(sd.en) };
console.log(JSON.stringify({ mode: APPLY ? "apply" : "plan", qid: QID, letter: LETTER, before: { jp: sd.jp, zh: sd.zh, en: sd.en }, after: plan }, null, 1));
if (APPLY) {
  execFileSync("node", ["scripts/quiz-phase2-merge.mjs", EXAM], { cwd: ROOT, stdio: "pipe" });
  if (readFileSync(SIDE, "utf-8") !== sideRaw) { writeFileSync(SIDE, sideRaw); throw new Error("merge does not reproduce the sidecar (restored)"); }
  const jpRaw = readFileSync(JP, "utf-8");
  const jp = JSON.parse(jpRaw);
  const jd = jp.distractors_jp.find((x: { letter: string }) => x.letter === LETTER);
  if (jd.why_wrong_jp !== sd.jp) throw new Error(".phase2 jp ≠ sidecar");
  jd.why_wrong_jp = plan.jp;
  write(JP, jpRaw, jp);
  const trRaw = readFileSync(TR, "utf-8");
  const tr = JSON.parse(trRaw);
  const td = tr.distractors.find((x: { letter: string }) => x.letter === LETTER);
  if (td.zh !== sd.zh || td.en !== sd.en) throw new Error(".phase2 tr ≠ sidecar");
  td.zh = plan.zh;
  td.en = plan.en;
  write(TR, trRaw, tr);
  execFileSync("node", ["scripts/quiz-phase2-merge.mjs", EXAM], { cwd: ROOT, stdio: "pipe" });
  const want = JSON.parse(sideRaw);
  Object.assign(want.questions[QID].distractors[LETTER], plan);
  if (JSON.stringify(JSON.parse(readFileSync(SIDE, "utf-8"))) !== JSON.stringify(want)) throw new Error("rebuilt sidecar ≠ before + the 3 values");
}
