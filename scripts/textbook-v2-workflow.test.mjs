// Task 9 Step 2 — textbook-v2.workflow.mjs run against a fake runtime (agent / pipeline / log):
// the four §0-13 roles with model opus, JP review ≤ 2 rounds with the writer revising in between,
// the prompts name the part file + the validate / parity commands, a JP rejection stops before
// localisation, and the workflow returns counts / verdicts only. Also: meta is a pure literal and
// the script avoids what the runtime forbids (fs, Date.now, Math.random).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const SRC = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "textbook-v2.workflow.mjs"), "utf-8");
const AsyncFunction = (async () => {}).constructor;
const UNIT = "management-10-27-u02";
const COUNTS = { terms: 4, figs: 3, steps: 7, points: 5, pairs: 1, key_points: 4, goals: 3 };

/** Run the script with a fake agent; verdicts = { jp: [...], loc: [...] } per review round. */
async function runWf(verdicts, args = { unit: UNIT }) {
  const calls = [];
  const logs = [];
  const agent = async (prompt, opts) => {
    calls.push({ prompt, opts });
    const m = /^(write|rewrite|review|localize|relocalize|tr-review):(.+)#(\d+)$/.exec(opts.label);
    const [, kind, unit, n] = m;
    const round = Number(n);
    const part = (stage) => `/x/${unit}.${stage}.r${round}.json`;
    if (kind === "write" || kind === "rewrite") return { unit_id: unit, stage: "jp", round, part: part("jp"), counts: COUNTS, validate_issues: 0 };
    if (kind === "localize" || kind === "relocalize") return { unit_id: unit, stage: "loc", round, jp_round: 0, part: part("loc"), counts: COUNTS, validate_issues: 0, parity_diff: 0 };
    const v = (kind === "review" ? verdicts.jp : verdicts.loc)[round - 1];
    return { unit_id: unit, stage: kind === "review" ? "jp-review" : "loc-review", round, reviewed_round: round - 1, verdict: v, issues: v === "PASS" ? [] : [{ severity: "high", where: "terms[0].detail_jp", rule: "D-195 §1", detail_jp: "x", fix_jp: "y" }] };
  };
  const pipeline = async (items, ...stages) => Promise.all(items.map(async (it, i) => { let v = it; for (const s of stages) v = await s(v, it, i); return v; }));
  const parallel = async (thunks) => Promise.all(thunks.map((t) => t()));
  const body = SRC.replace(/^export const meta =/m, "const meta =");
  const fn = new AsyncFunction("args", "agent", "pipeline", "parallel", "log", "phase", "budget", "workflow", body);
  const ret = await fn(args, agent, pipeline, parallel, (s) => logs.push(s), () => {}, { total: null }, null);
  return { ret, calls, logs };
}

test("meta is a pure literal; no fs / Date.now / Math.random", () => {
  const m = /^export const meta = (\{[\s\S]*?\n\})\n/m.exec(SRC);
  assert.ok(m);
  const meta = new Function(`return (${m[1]})`)();
  assert.equal(meta.name, "textbook-v2");
  assert.deepEqual(meta.phases.map((p) => p.title), ["Write", "Review", "Localize", "TrReview"]);
  assert.doesNotMatch(m[1], /\$\{|\.\.\.[A-Za-z_]/); // no interpolation / spread
  assert.doesNotMatch(SRC.replace(/^\s*\/\/.*$/gm, ""), /Date\.now|Math\.random|new Date\(\)|from "node:|require\(/);
});

test("happy path: write → critic PASS → localize → code-reviewer PASS; four roles, all opus", async () => {
  const { ret, calls } = await runWf({ jp: ["PASS"], loc: ["PASS"] });
  assert.deepEqual(calls.map((c) => c.opts.agentType), ["general-purpose", "oh-my-claudecode:critic", "oh-my-claudecode:writer", "oh-my-claudecode:code-reviewer"]);
  for (const c of calls) assert.equal(c.opts.model, "opus", c.opts.label);
  for (const c of calls) assert.ok(c.opts.schema?.type === "object", c.opts.label);
  const [w, rv, lz, tr] = calls.map((c) => c.prompt);
  const dir = `/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/textbook/.planning/v2/${UNIT}`;
  assert.ok(w.includes(`${dir}/manifest.json`) && w.includes(`${dir}/parts/${UNIT}.jp.r0.json`));
  assert.ok(w.includes(`scripts/textbook-v2-validate.mjs --part ${dir}/parts/${UNIT}.jp.r0.json`));
  assert.ok(rv.includes("/x/") && rv.includes("D-195"));
  assert.ok(lz.includes(`--part ${dir}/parts/${UNIT}.loc.r0.json --jp /x/${UNIT}.jp.r0.json`) && lz.includes("textbook-v2-parity.mjs --part"));
  assert.ok(tr.includes(`/x/${UNIT}.loc.r0.json`));
  const u = ret.units[0];
  assert.equal(u.status, "ready-to-merge");
  assert.equal(u.jp_rounds, 1);
  assert.equal(u.loc_rounds, 1);
  // counts / verdicts only: no prose fields came back
  assert.ok(JSON.stringify(ret).length < 600, JSON.stringify(ret));
  assert.doesNotMatch(JSON.stringify(ret), /detail_jp|fix_jp/);
});

test("JP review REVISE then PASS: the writer revises once (round 1), then localisation", async () => {
  const { ret, calls } = await runWf({ jp: ["REVISE", "PASS"], loc: ["PASS"] });
  assert.deepEqual(calls.map((c) => c.opts.label), [`write:${UNIT}#0`, `review:${UNIT}#1`, `rewrite:${UNIT}#1`, `review:${UNIT}#2`, `localize:${UNIT}#0`, `tr-review:${UNIT}#1`]);
  const rewrite = calls[2];
  assert.equal(rewrite.opts.agentType, "general-purpose");
  assert.ok(rewrite.prompt.includes("D-195 §1") && rewrite.prompt.includes(`/x/${UNIT}.jp.r0.json`), "revise prompt carries the review issues and the previous draft");
  assert.ok(calls[3].prompt.includes(`/x/${UNIT}.jp.r1.json`), "review #2 reads the revised draft");
  assert.equal(ret.units[0].jp_rounds, 2);
  assert.equal(ret.units[0].status, "ready-to-merge");
});

test("JP review REVISE twice: stops after 2 reviews, no localisation (Rule B)", async () => {
  const { ret, calls } = await runWf({ jp: ["REVISE", "REVISE"], loc: [] });
  assert.equal(calls.filter((c) => c.opts.agentType === "oh-my-claudecode:critic").length, 2);
  assert.ok(!calls.some((c) => c.opts.agentType === "oh-my-claudecode:writer"));
  assert.equal(ret.units[0].status, "jp-rejected");
  assert.deepEqual(ret.units[0].jp_issues, { high: 1 });
});

test("translation review REVISE then PASS: one re-localisation; REVISE twice → loc-rejected", async () => {
  const a = await runWf({ jp: ["PASS"], loc: ["REVISE", "PASS"] });
  assert.deepEqual(a.calls.slice(2).map((c) => c.opts.label), [`localize:${UNIT}#0`, `tr-review:${UNIT}#1`, `relocalize:${UNIT}#1`, `tr-review:${UNIT}#2`]);
  assert.equal(a.ret.units[0].status, "ready-to-merge");
  const b = await runWf({ jp: ["PASS"], loc: ["REVISE", "REVISE"] });
  assert.equal(b.ret.units[0].status, "loc-rejected");
});

test("args: {units: [...]} runs each; bad ids throw", async () => {
  const { ret } = await runWf({ jp: ["PASS"], loc: ["PASS"] }, { units: [UNIT, "management-10-27-u01"] });
  assert.deepEqual(ret.units.map((u) => u.unit), [UNIT, "management-10-27-u01"]);
  await assert.rejects(runWf({ jp: [], loc: [] }, { unit: "../etc" }), /unit ids/);
  await assert.rejects(runWf({ jp: [], loc: [] }, {}), /need args/);
});
