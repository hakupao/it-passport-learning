// D-224 monthly check (S154 H6, DEPLOY_cloudflare.md §9): read-only.
//   1. Upstash `STRLEN learn:owner:v2` (and v1) — the owner's sync record size. The value is never read.
//      Credentials: apps/web/.env.local KV_REST_API_URL + KV_REST_API_READ_ONLY_TOKEN, read inside this
//      script only (production DB; never echoed).
//   2. Cloudflare GraphQL `workersInvocationsAdaptive` for script `itlearn`, per day: requests, errors,
//      subrequests, CPU p50 / p99 / max. Token on stdin (never an argument, never printed):
//        cd apps/web && pnpm exec wrangler auth token | node scripts/cf-monitor.ts --account <account id> [--days 30]
//      (or CLOUDFLARE_ACCOUNT_ID instead of --account; the id is in the dashboard URL).
//   3. Verdict (lib/release/monitor): exit 1 + "ASK USER" when the record > 200 KB, any error, or p50 ≥ 10 ms
//      → ask the user: Workers Paid (A) or splitting the sync (B) (D-224). exit 0 otherwise, 2 on a read failure.
// Errors print a status code only — never URLs, headers, bodies or tokens.
import { readFileSync } from "node:fs";
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

const env = parseDotEnv(readFileSync(path.join(import.meta.dirname, "../.env.local"), "utf8"));
const kvUrl = env.KV_REST_API_URL;
const kvToken = env.KV_REST_API_READ_ONLY_TOKEN;
if (!kvUrl || !kvToken) fail(".env.local lacks KV_REST_API_URL / KV_REST_API_READ_ONLY_TOKEN");

async function strlen(key: string): Promise<number> {
  const r = await fetch(kvUrl!, {
    method: "POST",
    headers: { Authorization: `Bearer ${kvToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(["STRLEN", key]),
  }).catch(() => fail("Upstash unreachable"));
  if (!r.ok) fail(`Upstash HTTP ${r.status}`);
  const j = (await r.json()) as { result?: unknown };
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
const g = (await r.json()) as {
  data?: { viewer?: { accounts?: { workersInvocationsAdaptive?: InvocationRow[] }[] } };
  errors?: { message?: string }[];
};
if (g.errors?.length) fail(`Cloudflare GraphQL error: ${g.errors.map((e) => e.message ?? "?").join("; ").slice(0, 300)}`);
const rows = g.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive;
if (!rows) fail("Cloudflare GraphQL: no data for this account");

const v2 = await strlen("learn:owner:v2");
const v1 = await strlen("learn:owner:v1");
const summary = summarizeDays(rows);
console.log(`record learn:owner:v2 = ${v2} B (limit ${RECORD_LIMIT_BYTES} B), learn:owner:v1 = ${v1} B`);
console.log(`Worker itlearn ${day(start)}..${day(end)} (UTC, Worker invocations only = /api/*)`);
console.log("date\trequests\terrors\tsubreq\tp50 ms\tp99 ms\tmax ms");
for (const d of summary) console.log([d.date, d.requests, d.errors, d.subrequests, d.p50Ms, d.p99Ms, d.maxMs].join("\t"));
const v = verdict(v2, summary);
for (const n of v.notes) console.log(`note: ${n}`);
if (v.askUser) {
  console.log(`ASK USER (D-224: A Workers Paid / B split the sync): ${v.reasons.join("; ")}`);
  process.exit(1);
}
console.log("OK (D-224: stay on Free)");
