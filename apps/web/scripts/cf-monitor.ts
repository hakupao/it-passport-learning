// D-224 monthly check (S154 H6, DEPLOY_cloudflare.md §10): read-only.
//   1. Upstash `STRLEN learn:owner:v2` (and v1) — the owner's sync record size. The value is never read.
//      Credentials: apps/web/.env.local KV_REST_API_URL + KV_REST_API_READ_ONLY_TOKEN, read inside this
//      script only (never echoed). 2026-11-12 D-228: the learning-record DB (Upstash via Vercel) is deleted,
//      so the record-size premise of D-224 is gone: when the file or either key is absent this part is
//      skipped with a message and the verdict uses the CPU part only. It runs again once a new DB's
//      REST URL + read-only token are put in .env.local. (Stale KV_* values of the deleted DB still in
//      .env.local make it fail with exit 2 — remove them.)
//   2. Cloudflare GraphQL `workersInvocationsAdaptive` for script `itlearn`, per day: requests, errors,
//      subrequests, CPU p50 / p99 / max. Token on stdin (never an argument, never printed):
//        cd apps/web && pnpm exec wrangler auth token | node scripts/cf-monitor.ts --account <account id> [--days 30]
//      (or CLOUDFLARE_ACCOUNT_ID instead of --account; the id is in the dashboard URL).
//   3. Verdict (lib/release/monitor): exit 1 + "ASK USER" when the record > 200 KB (if measured), any error,
//      or p50 ≥ 10 ms → ask the user: Workers Paid (A) or splitting the sync (B, only while a sync DB exists)
//      (D-224). exit 0 otherwise, 2 on a read failure.
// Errors print a status code only — never URLs, headers, bodies or tokens.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

import { type InvocationRow, parseDotEnv, RECORD_LIMIT_BYTES, summarizeDays, verdict } from "../src/lib/release/monitor.ts";

const { values } = parseArgs({ options: { account: { type: "string" }, days: { type: "string", default: "30" } } });
const account = values.account ?? process.env.CLOUDFLARE_ACCOUNT_ID;
const days = Number(values.days);
if (!account || !/^[0-9a-f]{32}$/.test(account) || !(days >= 1 && days <= 31)) {
  console.error("usage: wrangler auth token | node scripts/cf-monitor.ts --account <32-hex id> [--days 1..31]");
  process.exit(2);
}
function fail(what: string): never {
  console.error(`cf-monitor: ${what}`);
  process.exit(2);
}

const envFile = path.join(import.meta.dirname, "../.env.local");
const env = existsSync(envFile) ? parseDotEnv(readFileSync(envFile, "utf8")) : {};
const kvUrl = env.KV_REST_API_URL;
const kvToken = env.KV_REST_API_READ_ONLY_TOKEN;
const measureRecord = Boolean(kvUrl && kvToken);

async function strlen(key: string): Promise<number> {
  const r = await fetch(kvUrl!, {
    method: "POST",
    headers: { Authorization: `Bearer ${kvToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(["STRLEN", key]),
  }).catch(() => fail("Upstash unreachable (D-228: if these are the deleted DB's values, remove them from .env.local)"));
  if (!r.ok) fail(`Upstash HTTP ${r.status} (D-228: if these are the deleted DB's values, remove them from .env.local)`);
  const j = (await r.json().catch(() => fail("Upstash: reply is not JSON"))) as { result?: unknown };
  if (typeof j.result !== "number") fail("Upstash: unexpected STRLEN reply");
  return j.result;
}

const stdin = readFileSync(0, "utf8").trim().split(/\s+/).filter(Boolean);
const cfToken = stdin[stdin.length - 1];
if (!cfToken) fail("no Cloudflare token on stdin");

const QUERY = `query($a:String!,$s:Date!,$e:Date!){viewer{accounts(filter:{accountTag:$a}){
workersInvocationsAdaptive(limit:100,filter:{scriptName:"itlearn",date_geq:$s,date_leq:$e},orderBy:[date_ASC]){
sum{requests errors subrequests} quantiles{cpuTimeP50 cpuTimeP99} max{cpuTime} dimensions{date}}}}}`;
const end = new Date();
const start = new Date(end.getTime() - (days - 1) * 86_400_000);
const day = (d: Date) => d.toISOString().slice(0, 10);

const r = await fetch("https://api.cloudflare.com/client/v4/graphql", {
  method: "POST",
  headers: { Authorization: `Bearer ${cfToken}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: QUERY, variables: { a: account, s: day(start), e: day(end) } }),
}).catch(() => fail("Cloudflare GraphQL unreachable"));
if (!r.ok) fail(`Cloudflare GraphQL HTTP ${r.status}`);
const g = (await r.json().catch(() => fail("Cloudflare GraphQL: reply is not JSON"))) as {
  data?: { viewer?: { accounts?: { workersInvocationsAdaptive?: InvocationRow[] }[] } };
  errors?: { extensions?: { code?: unknown } }[];
};
// Only the count and extensions.code: messages may echo query input (Rule D LOW-5).
if (g.errors?.length) {
  const codes = g.errors.map((e) => (typeof e.extensions?.code === "string" ? e.extensions.code : "?"));
  fail(`Cloudflare GraphQL: ${g.errors.length} error(s), code ${codes.join(",").slice(0, 200)}`);
}
const rows = g.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive;
if (!rows) fail("Cloudflare GraphQL: no data for this account");

const v2 = measureRecord ? await strlen("learn:owner:v2") : null;
const v1 = measureRecord ? await strlen("learn:owner:v1") : null;
const summary = summarizeDays(rows);
if (v2 === null) {
  console.log("record: skipped — .env.local has no KV_REST_API_URL + KV_REST_API_READ_ONLY_TOKEN (D-228: sync DB deleted)");
} else {
  console.log(`record learn:owner:v2 = ${v2} B (limit ${RECORD_LIMIT_BYTES} B), learn:owner:v1 = ${v1} B`);
}
console.log(`Worker itlearn ${day(start)}..${day(end)} (UTC, Worker invocations only = /api/*)`);
console.log("date\trequests\terrors\tsubreq\tp50 ms\tp99 ms\tmax ms");
for (const d of summary) console.log([d.date, d.requests, d.errors, d.subrequests, d.p50Ms, d.p99Ms, d.maxMs].join("\t"));
const v = verdict(v2, summary);
for (const n of v.notes) console.log(`note: ${n}`);
if (v.askUser) {
  console.log(`ASK USER (D-224: A Workers Paid${v2 === null ? "" : " / B split the sync"}): ${v.reasons.join("; ")}`);
  process.exit(1);
}
console.log("OK (D-224: stay on Free)");
