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
const TAG = "r1";
const DIR = `/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/textbook/.planning/v2/${UNIT}`;
const partPath = (unit, stage, round) => `/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/textbook/.planning/v2/${unit}/parts/${TAG}/${unit}.${stage}.r${round}.json`;

/**
 * Run the script with a fake agent; verdicts = { jp: [...], loc: [...] } per review round.
 * fake = { wrongPath, jpIssues, locIssues, parity } to steer the writers' reports.
 */
async function runWf(verdicts, args = { unit: UNIT, run_tag: TAG }, fake = {}) {
  const calls = [];
  const logs = [];
  const agent = async (prompt, opts) => {
    calls.push({ prompt, opts });
    const m = /^(seed-rewrite|seed-relocalize|write|rewrite|review|localize|relocalize|tr-review):(.+)#(\d+)$/.exec(opts.label);
    const [, kind, unit, n] = m;
    const round = Number(n);
    const part = (stage) => (fake.wrongPath ? `/elsewhere/${unit}.${stage}.json` : partPath(unit, stage, round));
    if (kind === "seed-rewrite") {
      if (fake.seedError) return { unit_id: unit, stage: "jp", round, part: "SEED-ERROR", sha256: "", counts: { ...COUNTS, terms: 0 }, validate_issues: 0, seed_part: "x", seed_sha256: "", seed_review_round: 2 };
      return { unit_id: unit, stage: "jp", round, part: part("jp"), sha256: "jp0", counts: COUNTS, validate_issues: 0, seed_part: "x", seed_sha256: "a".repeat(64), seed_review_round: 2 };
    }
    if (kind === "seed-relocalize") {
      if (fake.seedError) return { unit_id: unit, stage: "loc", round, jp_round: 0, part: "SEED-ERROR", sha256: "", jp_sha256: "", counts: COUNTS, validate_issues: 0, parity_diff: 0, jp_part: "", seed_part: "x", seed_sha256: "", seed_review_round: 2 };
      return { unit_id: unit, stage: "loc", round, jp_round: 1, part: part("loc"), sha256: "loc0", jp_sha256: "jpA", counts: COUNTS, validate_issues: fake.locIssues ?? 0, parity_diff: fake.parity ?? 0, jp_part: fake.jpPart ?? SEED_LOC_JP, seed_part: "x", seed_sha256: "c".repeat(64), seed_review_round: 2 };
    }
    if (kind === "write" || kind === "rewrite") return { unit_id: unit, stage: "jp", round, part: part("jp"), sha256: `jp${round}`, counts: COUNTS, validate_issues: fake.jpIssues ?? 0 };
    if (kind === "localize" || kind === "relocalize") return { unit_id: unit, stage: "loc", round, jp_round: 0, part: part("loc"), sha256: `loc${round}`, jp_sha256: "jp0", counts: COUNTS, validate_issues: fake.locIssues ?? 0, parity_diff: fake.parity ?? 0 };
    // a verdict is "PASS" / "REVISE" (issues [] / one high) or { verdict, sev: [...] } (issues of those severities)
    const e = (kind === "review" ? verdicts.jp : verdicts.loc)[round - 1];
    const v = typeof e === "string" ? e : e.verdict;
    const sevs = typeof e === "string" ? (e === "PASS" ? [] : ["high"]) : e.sev;
    const issues = sevs.map((severity) => ({ severity, where: "terms[0].detail_jp", rule: "D-195 §1", detail_jp: "x", fix_jp: "y" }));
    return { unit_id: unit, stage: kind === "review" ? "jp-review" : "loc-review", round, reviewed_round: round - 1, reviewed_sha256: "h", verdict: v, issues };
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
  const jp0 = partPath(UNIT, "jp", 0);
  const loc0 = partPath(UNIT, "loc", 0);
  assert.ok(w.includes(`${DIR}/manifest.json`) && w.includes(jp0));
  assert.ok(w.includes(`scripts/textbook-v2-validate.mjs --part ${jp0}`) && w.includes("sha256"));
  assert.ok(rv.includes(jp0) && rv.includes("D-195") && rv.includes("reviewed_sha256"));
  assert.ok(lz.includes(`--part ${loc0} --jp ${jp0}`) && lz.includes("textbook-v2-parity.mjs --part") && lz.includes("jp_sha256"));
  assert.ok(tr.includes(loc0) && tr.includes("reviewed_sha256"));
  // every role reads the original rule / type files (S135 M2); writer / critic / localiser get the copy ban (M3)
  for (const p of [w, rv, lz, tr]) for (const f of ["docs/decisions/D-195-textbook-writing-and-figure-rules.md", "apps/web/src/lib/textbook/types.ts", "apps/web/src/lib/textbook/figureSpec.ts"]) assert.ok(p.includes(f), f);
  for (const p of [w, lz]) assert.match(p, /写さない/);
  assert.match(rv, /写していないか/);
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
  assert.ok(rewrite.prompt.includes("D-195 §1") && rewrite.prompt.includes(partPath(UNIT, "jp", 0)), "revise prompt carries the review issues and the previous draft");
  assert.ok(rewrite.prompt.includes(partPath(UNIT, "jp", 1)), "the revision goes to a new round file");
  assert.ok(calls[3].prompt.includes(partPath(UNIT, "jp", 1)), "review #2 reads the revised draft");
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
  const { ret } = await runWf({ jp: ["PASS"], loc: ["PASS"] }, { units: [UNIT], run_tag: TAG });
  assert.deepEqual(ret.units.map((u) => u.unit), [UNIT]);
  await assert.rejects(runWf({ jp: [], loc: [] }, { unit: "../etc", run_tag: TAG }), /unit ids/);
  await assert.rejects(runWf({ jp: [], loc: [] }, {}), /need args/);
  await assert.rejects(runWf({ jp: [], loc: [] }, { unit: UNIT }), /run_tag/);
  await assert.rejects(runWf({ jp: [], loc: [] }, { unit: UNIT, run_tag: "a/b" }), /run_tag/);
});

test("an agent reporting another part path stops the unit (S135 L4)", async () => {
  const { ret, calls, logs } = await runWf({ jp: ["PASS"], loc: ["PASS"] }, undefined, { wrongPath: true });
  assert.equal(calls.length, 1);
  assert.equal(ret.units[0].status, "part-path-mismatch");
  assert.ok(logs.some((l) => l.includes("expected")));
});

test("both reviews PASS but validate / parity issues left → needs-fix, not ready-to-merge (S135 L1)", async () => {
  for (const fake of [{ jpIssues: 1 }, { locIssues: 2 }, { parity: 1 }]) {
    const { ret } = await runWf({ jp: ["PASS"], loc: ["PASS"] }, undefined, fake);
    assert.equal(ret.units[0].status, "needs-fix", JSON.stringify(fake));
  }
});

const SEED_LOC_DIR = "/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/textbook/.planning/v2/management-10-27-u02/parts/s135u02a";
const SEED_LOC_PART = `${SEED_LOC_DIR}/management-10-27-u02.loc.r1.json`;
const SEED_LOC_JP = `${SEED_LOC_DIR}/management-10-27-u02.jp.r1.json`;
const SEED_LOC_ARGS = { unit: UNIT, run_tag: TAG, seed_loc_part: SEED_LOC_PART, seed_loc_journal: "data/ip/textbook/.planning/v2/management-10-27-u02/journal.s135u02a.jsonl", seed_loc_review_round: 2 };
const SEED_PART = "/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/textbook/.planning/v2/management-10-27-u02/parts/s135u02a/management-10-27-u02.jp.r1.json";
const SEED_ARGS = { unit: UNIT, run_tag: TAG, seed_part: SEED_PART, seed_journal: "data/ip/textbook/.planning/v2/management-10-27-u02/journal.s135u02a.jsonl", seed_review_round: 2 };

test("writer prompts carry the attempt-1 hardening; the critic checks it (S135 u02 attempt 2)", async () => {
  const { calls } = await runWf({ jp: ["REVISE", "PASS"], loc: ["PASS"] });
  const [w, rv, rw] = calls.map((c) => c.prompt);
  for (const p of [w, rw]) {
    assert.match(p, /二段階で書く/);
    assert.match(p, /questions \/ term_questions を\*\*開かない\*\*/);
    assert.match(p, /写しの基準 \(D-198\)/);
    assert.match(p, /正規化 12 字以上の連続一致/);
    assert.match(p, /写しでない = 標準的な定義・計算規則・原則を一般的な表現で述べること/);
    assert.doesNotMatch(p, /同義語に入れ替え|骨格/);
    assert.match(p, /「例えば」/);
    assert.match(p, /図の caption/);
    assert.match(p, /exam 考点は引用題と突き合わせる/);
    assert.match(p, /定義してから使う/);
    assert.match(p, /\[\[jp:…\]\] は zh \/ en 専用なので\*\*日本語の本文には使わない\*\*/);
  }
  assert.match(rv, /写しの基準 \(D-198\)/);
  assert.doesNotMatch(rv, /同義語に入れ替え|骨格/);
  assert.ok(rv.includes("/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/quiz/questions.json"), "the critic reads the cited qids from questions.json");
  for (const p of [w, rv, rw]) assert.doesNotMatch(p, /解説要約/);
  assert.match(rv, /考点と引用題の正解/);
  assert.match(rv, /定義してから使う/);
  assert.match(rv, /\[\[jp:…\]\]/);
});

test("seeded start: round 0 revises the seed with its review (from the seed journal), then ≤ 2 reviews as usual", async () => {
  const { ret, calls } = await runWf({ jp: ["REVISE", "PASS"], loc: ["PASS"] }, SEED_ARGS);
  assert.deepEqual(calls.map((c) => c.opts.label).slice(0, 4), [`seed-rewrite:${UNIT}#0`, `review:${UNIT}#1`, `rewrite:${UNIT}#1`, `review:${UNIT}#2`]);
  const seed = calls[0];
  assert.equal(seed.opts.agentType, "general-purpose");
  assert.equal(seed.opts.model, "opus");
  assert.ok(seed.prompt.includes(`scripts/textbook-v2-seed.mjs --part ${SEED_PART} --journal /Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/textbook/.planning/v2/management-10-27-u02/journal.s135u02a.jsonl --review-round 2`));
  assert.ok(seed.prompt.includes(partPath(UNIT, "jp", 0)), "writes round 0 of the new run");
  assert.deepEqual(seed.opts.schema.required.slice(-3), ["seed_part", "seed_sha256", "seed_review_round"]);
  assert.ok(!calls[2].opts.schema.required.includes("seed_sha256"), "only round 0 is seeded");
  assert.equal(calls.filter((c) => c.opts.agentType === "oh-my-claudecode:critic").length, 2);
  assert.equal(ret.units[0].status, "ready-to-merge");
  assert.deepEqual(ret.units[0].seed, { part: SEED_PART, sha256: "a".repeat(64), review_round: 2 });
});

test("seeded start: a seed that does not verify stops the unit before any review", async () => {
  const { ret, calls } = await runWf({ jp: ["PASS"], loc: ["PASS"] }, SEED_ARGS, { seedError: true });
  assert.equal(calls.length, 1);
  assert.equal(ret.units[0].status, "seed-invalid");
});

test("seed args: all three or none, one unit, a seed from another run_tag", async () => {
  const { seed_review_round, ...partial } = SEED_ARGS;
  await assert.rejects(runWf({ jp: [], loc: [] }, partial), /go together/);
  await assert.rejects(runWf({ jp: [], loc: [] }, { ...SEED_ARGS, seed_review_round: 0 }), /integer ≥ 1/);
  await assert.rejects(runWf({ jp: [], loc: [] }, { ...SEED_ARGS, run_tag: "s135u02a" }), /new run_tag/);
  await assert.rejects(runWf({ jp: [], loc: [] }, { ...SEED_ARGS, unit: "management-10-27-u01" }), /JP part of/);
});

test("D-199 gate: low-only issues pass (whatever word the reviewer returned); one medium blocks", async () => {
  const lowOnly = { verdict: "REVISE", sev: ["low", "low"] };
  const a = await runWf({ jp: [lowOnly], loc: [{ verdict: "PASS", sev: ["low"] }] });
  assert.equal(a.ret.units[0].status, "ready-to-merge");
  assert.equal(a.ret.units[0].jp_verdict, "PASS");
  assert.deepEqual(a.ret.units[0].jp_issues, { low: 2 });
  assert.ok(a.logs.some((l) => /verdict REVISE .*D-199.*PASS/.test(l)), "the mismatch is logged");
  const med = { verdict: "PASS", sev: ["medium", "low"] };
  const b = await runWf({ jp: [med, med], loc: [] });
  assert.equal(b.ret.units[0].status, "jp-rejected");
  assert.equal(b.ret.units[0].jp_verdict, "REVISE");
  assert.equal(b.calls.filter((c) => c.opts.label.startsWith("rewrite")).length, 1, "a medium triggers the revision");
  const c = await runWf({ jp: ["PASS"], loc: [med, med] });
  assert.equal(c.ret.units[0].status, "loc-rejected");
});

test("D-199 in the prompts: reviewers return PASS with only low issues; revisers may leave lows but add no high / medium", async () => {
  const { calls } = await runWf({ jp: ["REVISE", "PASS"], loc: ["REVISE", "PASS"] });
  const byLabel = (re) => calls.find((x) => re.test(x.opts.label)).prompt;
  for (const p of [byLabel(/^review:/), byLabel(/^tr-review:/)]) {
    assert.match(p, /D-199/);
    assert.match(p, /low だけなら PASS/);
  }
  for (const p of [byLabel(/^rewrite:/), byLabel(/^relocalize:/)]) {
    assert.match(p, /low は直さなくてもよい/);
    assert.match(p, /新しい high \/ medium を生まない/);
  }
});

test("D-200 in the writer and critic prompts: ≤ 3 考点 per term, JP ≤ 2 sentences / ≤ 100 characters", async () => {
  const { calls } = await runWf({ jp: ["REVISE", "PASS"], loc: ["PASS"] });
  for (const label of [/^write:/, /^review:/, /^rewrite:/]) {
    const p = calls.find((x) => label.test(x.opts.label)).prompt;
    assert.match(p, /D-200/);
    assert.match(p, /考点は 1 用語 3 個まで、各考点の日本語は 2 文以内・100 字以内/);
  }
});

test("loc seed (B5): no JP write / review; round 0 re-localises the seed with its translation review, the JP part reused as-is", async () => {
  const { ret, calls } = await runWf({ jp: [], loc: ["REVISE", "PASS"] }, SEED_LOC_ARGS);
  assert.deepEqual(calls.map((c) => c.opts.label), [`seed-relocalize:${UNIT}#0`, `tr-review:${UNIT}#1`, `relocalize:${UNIT}#1`, `tr-review:${UNIT}#2`]);
  assert.ok(!calls.some((c) => c.opts.agentType === "general-purpose" || c.opts.agentType === "oh-my-claudecode:critic"), "no JP writer / JP review");
  const seed = calls[0];
  assert.equal(seed.opts.agentType, "oh-my-claudecode:writer");
  assert.equal(seed.opts.model, "opus");
  assert.ok(seed.prompt.includes(`scripts/textbook-v2-seed.mjs --part ${SEED_LOC_PART} --journal /Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/textbook/.planning/v2/management-10-27-u02/journal.s135u02a.jsonl --review-round 2`));
  assert.ok(seed.prompt.includes(partPath(UNIT, "loc", 0)), "writes loc round 0 of the new run");
  assert.match(seed.prompt, /日本語は 1 文字も変えない|\*\*1 文字も変えない\*\*/);
  assert.match(seed.prompt, /jp_part/);
  assert.deepEqual(seed.opts.schema.required.slice(-4), ["jp_part", "seed_part", "seed_sha256", "seed_review_round"]);
  // the review and the re-localisation work against the reused JP part
  for (const c of calls.slice(1)) assert.ok(c.prompt.includes(SEED_LOC_JP), c.opts.label);
  assert.ok(calls[2].prompt.includes(`--part ${partPath(UNIT, "loc", 1)} --jp ${SEED_LOC_JP}`));
  assert.ok(!calls[2].opts.schema.required.includes("seed_sha256"), "only round 0 is seeded");
  const u = ret.units[0];
  assert.equal(u.status, "ready-to-merge");
  assert.equal(u.jp_rounds, 0);
  assert.equal(u.jp_verdict, "reused");
  assert.deepEqual(u.seed_loc, { part: SEED_LOC_PART, sha256: "c".repeat(64), review_round: 2, jp_part: SEED_LOC_JP });
});

test("loc seed: a seed that does not verify, or a JP part outside the seed's run, stops the unit", async () => {
  const a = await runWf({ jp: [], loc: ["PASS"] }, SEED_LOC_ARGS, { seedError: true });
  assert.equal(a.calls.length, 1);
  assert.equal(a.ret.units[0].status, "seed-invalid");
  const b = await runWf({ jp: [], loc: ["PASS"] }, SEED_LOC_ARGS, { jpPart: "/elsewhere/management-10-27-u02.jp.r1.json" });
  assert.equal(b.calls.length, 1);
  assert.equal(b.ret.units[0].status, "seed-invalid");
});

test("loc seed args: all three or none, not with a JP seed, one unit, a loc part of the unit from another run_tag", async () => {
  const { seed_loc_review_round, ...partial } = SEED_LOC_ARGS;
  await assert.rejects(runWf({ jp: [], loc: [] }, partial), /go together/);
  await assert.rejects(runWf({ jp: [], loc: [] }, { ...SEED_LOC_ARGS, seed_loc_review_round: 0 }), /integer ≥ 1/);
  await assert.rejects(runWf({ jp: [], loc: [] }, { ...SEED_LOC_ARGS, run_tag: "s135u02a" }), /new run_tag/);
  await assert.rejects(runWf({ jp: [], loc: [] }, { ...SEED_LOC_ARGS, unit: "management-10-27-u01" }), /loc part of/);
  await assert.rejects(runWf({ jp: [], loc: [] }, { ...SEED_LOC_ARGS, seed_loc_part: SEED_PART }), /loc part of/);
  await assert.rejects(runWf({ jp: [], loc: [] }, { ...SEED_LOC_ARGS, ...SEED_ARGS }), /not both/);
});
