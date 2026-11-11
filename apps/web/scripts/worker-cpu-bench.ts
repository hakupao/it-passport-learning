// D-217 H3 — local CPU proxy for the Workers Free budget (10 ms CPU / request): runs the bundled
// Worker (`wrangler deploy --dry-run --outdir worker-dist` → worker-dist/index.js, the code that
// would be uploaded) in this Node process and measures process.cpuUsage() around each fetch.
//
// Upstash is a canned `fetch` (GET → the precomputed base64 REST envelope of the stored record,
// SET → {"result":"OK"} without parsing the body), so the timed region holds only the Worker's own
// work: owner check (sha256), body read, JSON.parse, the client's base64 decode + auto-deserialize,
// parseRecord / mergeRecords / encodeRecord, JSON.stringify of the SET command and the response.
// Network wait is not CPU on Workers either. This is a proxy: V8 in Node ≠ workerd on Cloudflare's
// hardware; the real number is the Workers Logs CPU time on the preview (H4).
//
//   node scripts/worker-cpu-bench.ts --bundle worker-dist/index.js [--iter 300] [--json out.json]

import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";

const { values } = parseArgs({
  options: { bundle: { type: "string" }, iter: { type: "string", default: "300" }, json: { type: "string" } },
});
if (!values.bundle) {
  console.error("usage: node scripts/worker-cpu-bench.ts --bundle worker-dist/index.js");
  process.exit(2);
}
const ITER = Number(values.iter);
const WARMUP = 30;

const KEY = "bench-owner-key";
const UPSTASH = "https://bench-upstash.invalid";
Object.assign(process.env, {
  OWNER_KEY: KEY,
  UPSTASH_REDIS_REST_URL: "",
  UPSTASH_REDIS_REST_TOKEN: "",
  KV_REST_API_URL: UPSTASH,
  KV_REST_API_TOKEN: "bench-token",
  UPSTASH_DISABLE_TELEMETRY: "1",
});
const COOKIE = `itp_owner=${createHash("sha256").update(KEY).digest("hex")}`;

type WireAttempt = [number, number, number, string];

/** A v2 wire record: `questions` question ids × `perQ` attempts (newest first), every unit read, two settings. */
function makeRecord(questions: number, perQ: number, bump = 0): string {
  const a: Record<string, WireAttempt[]> = {};
  const base = 1_762_000_000_000;
  for (let i = 0; i < questions; i++) {
    // id shape of the bank: <yyyy><era><yy><season>-q<nnn>, e.g. 2016h28h-q033
    const exam = 2009 + Math.floor(i / 100);
    const id = `${exam}r${String(exam - 2018).padStart(2, "0")}a-q${String((i % 100) + 1).padStart(3, "0")}`;
    const list: WireAttempt[] = [];
    for (let k = 0; k < perQ; k++) {
      list.push([base + bump + i * 997 + (perQ - k) * 86_400_000, (i + k) % 4, (i + k) % 3 === 0 ? 0 : 1, k % 5 === 0 ? "m" : "p"]);
    }
    a[id] = list;
  }
  const u: Record<string, number> = {};
  for (let i = 0; i < 244; i++) u[`technology-${String(i % 30).padStart(2, "0")}-${String(i).padStart(2, "0")}-u0${i % 9}`] = base + i;
  return JSON.stringify({ v: 2, a, u, s: { dailyReviewCap: [40, base], examDate: ["2027-04-18", base] }, since: base });
}

const toB64 = (s: string): string => Buffer.from(s, "utf8").toString("base64");

let stored = "";
let getEnvelope = "";
function setStored(doc: string): void {
  stored = doc;
  getEnvelope = JSON.stringify([{ result: toB64(doc) }]);
}
const OK = JSON.stringify([{ result: "OK" }]);
const OK_SINGLE = JSON.stringify({ result: "OK" });

globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input instanceof Request ? input.url : input);
  if (!url.startsWith(UPSTASH)) throw new TypeError(`bench: unexpected fetch ${url}`);
  const body = typeof init?.body === "string" ? init.body : "";
  const pipeline = url.endsWith("/pipeline");
  const isSet = body.startsWith('[["set"') || body.startsWith('["set"');
  const text = isSet ? (pipeline ? OK : OK_SINGLE) : pipeline ? getEnvelope : JSON.stringify({ result: toB64(stored) });
  return new Response(text, { status: 200, headers: { "Content-Type": "application/json" } });
}) as typeof fetch;

const mod = (await import(pathToFileURL(path.resolve(values.bundle)).href)) as {
  default: { fetch(request: Request, env: unknown): Promise<Response> };
};
const worker = mod.default;

interface Stats {
  case: string;
  storedBytes: number;
  bodyBytes: number;
  status: number;
  coldMs: number;
  p50: number;
  p95: number;
  max: number;
  wallP50: number;
}

const q = (xs: number[], p: number): number => xs[Math.min(xs.length - 1, Math.floor(p * xs.length))]!;

async function measure(name: string, makeReq: () => Request, bodyBytes = 0): Promise<Stats> {
  const cpu: number[] = [];
  const wall: number[] = [];
  let status = 0;
  let coldMs = 0;
  for (let i = 0; i < WARMUP + ITER; i++) {
    const req = makeReq(); // built outside the timed region
    const t0 = performance.now();
    const c0 = process.cpuUsage();
    const res = await worker.fetch(req, {});
    await res.arrayBuffer(); // the response body is produced inside the handler; drain it
    const c = process.cpuUsage(c0);
    const w = performance.now() - t0;
    status = res.status;
    const ms = (c.user + c.system) / 1000;
    if (i === 0) coldMs = ms;
    if (i >= WARMUP) {
      cpu.push(ms);
      wall.push(w);
    }
  }
  cpu.sort((x, y) => x - y);
  wall.sort((x, y) => x - y);
  const r = (x: number): number => Math.round(x * 100) / 100;
  return {
    case: name,
    storedBytes: Buffer.byteLength(stored),
    bodyBytes,
    status,
    coldMs: r(coldMs),
    p50: r(q(cpu, 0.5)),
    p95: r(q(cpu, 0.95)),
    max: r(cpu.at(-1)!),
    wallP50: r(q(wall, 0.5)),
  };
}

const ORIGIN = "https://itlearn.bench";
const results: Stats[] = [];
const sizes: [string, number, number][] = [
  ["typical (1,000 q × 2)", 1000, 2],
  ["saturated bank (2,900 q × 10 = ATTEMPTS_K)", 2900, 10],
  ["~1 MiB (3,800 q × 10, beyond the current bank)", 3800, 10],
];

results.push(
  await measure("GET /api/owner (activation, correct key)", () => new Request(`${ORIGIN}/api/owner?key=${KEY}&next=%2Fja%2Fglossary`)),
);
results.push(await measure("GET /api/learning (403, no cookie)", () => new Request(`${ORIGIN}/api/learning?v=2`)));

for (const [label, nq, perQ] of sizes) {
  setStored(makeRecord(nq, perQ));
  results.push(await measure(`GET ?v=2 — ${label}`, () => new Request(`${ORIGIN}/api/learning?v=2`, { headers: { cookie: COOKIE } })));
  results.push(await measure(`GET v1 — ${label}`, () => new Request(`${ORIGIN}/api/learning`, { headers: { cookie: COOKIE } })));
  // the client PUTs its full record: same questions, every attempt shifted (nothing deduped away)
  const full = makeRecord(nq, perQ, 1);
  results.push(
    await measure(
      `PUT full record — ${label}`,
      () => new Request(`${ORIGIN}/api/learning`, { method: "PUT", headers: { cookie: COOKIE }, body: full }),
      Buffer.byteLength(full),
    ),
  );
  // the page-hide delta PUT: one new attempt
  const delta = JSON.stringify({ v: 2, a: { "2016h28h-q033": [[1_763_000_000_000, 1, 1, "p"]] }, u: {}, s: {} });
  results.push(
    await measure(
      `PUT delta (1 attempt) — ${label}`,
      () => new Request(`${ORIGIN}/api/learning`, { method: "PUT", headers: { cookie: COOKIE }, body: delta }),
      Buffer.byteLength(delta),
    ),
  );
}

console.log(`node ${process.version}, ${ITER} iterations after ${WARMUP} warm-up (cold = the first call), CPU ms (user+system)`);
console.table(results);
if (values.json) writeFileSync(values.json, JSON.stringify({ node: process.version, iter: ITER, warmup: WARMUP, results }, null, 2));
