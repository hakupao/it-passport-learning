#!/usr/bin/env node
// D-149 (Session 126) — quiz feedback repair-loop CLI.
//
// Reads/updates the owner's per-question problem reports stored by
// POST /api/quiz/feedback in Upstash Redis (key layout: apps/web/src/lib/quiz/feedback.ts):
//   quiz:feedback:rec:<id>         record JSON
//   quiz:feedback:index            ZSET of ids by created ms
//   quiz:feedback:q:<question_id>  ZSET of ids by created ms
//
// Commands (run from repo root):
//   node scripts/quiz-feedback.mjs list [--status open|resolved|all]   (default: open)
//   node scripts/quiz-feedback.mjs pull                                 → data/ip/quiz/.feedback/open.json
//   node scripts/quiz-feedback.mjs resolve <id> --note "what was fixed"
//
// Credentials: UPSTASH_REDIS_REST_URL/TOKEN (preferred) or KV_REST_API_URL/TOKEN,
// from the process env first, else apps/web/.env.local (e.g. after `vercel env pull`).
// Secrets are never printed. @upstash/redis is resolved from apps/web (pnpm
// workspace) so (de)serialisation matches the app exactly.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENV_FILE = path.join(ROOT, "apps/web/.env.local");
const PULL_OUT = path.join(ROOT, "data/ip/quiz/.feedback/open.json");

const INDEX_KEY = "quiz:feedback:index";
const recKey = (id) => `quiz:feedback:rec:${id}`;

const USAGE = `usage:
  node scripts/quiz-feedback.mjs list [--status open|resolved|all]
  node scripts/quiz-feedback.mjs pull
  node scripts/quiz-feedback.mjs resolve <id> --note "<resolution note>"`;

function die(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function parseEnvFile(file) {
  if (!existsSync(file)) return {};
  const out = {};
  for (const line of readFileSync(file, "utf-8").split("\n")) {
    const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
  return out;
}

function loadCreds() {
  const file = parseEnvFile(ENV_FILE);
  const pick = (k) => process.env[k] || file[k] || "";
  const url = pick("UPSTASH_REDIS_REST_URL") || pick("KV_REST_API_URL");
  const token = pick("UPSTASH_REDIS_REST_TOKEN") || pick("KV_REST_API_TOKEN");
  if (!url || !token) {
    die(
      "Redis credentials not found. Set UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN " +
        "in the environment or apps/web/.env.local (values from the Vercel project env).",
    );
  }
  return { url, token };
}

function redisClient() {
  const require = createRequire(path.join(ROOT, "apps/web/package.json"));
  const { Redis } = require("@upstash/redis");
  return new Redis(loadCreds());
}

/** All records, newest first. */
async function fetchAll(redis) {
  const ids = await redis.zrange(INDEX_KEY, 0, -1, { rev: true });
  const out = [];
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    const recs = await redis.mget(...chunk.map(recKey));
    for (const r of recs) if (r) out.push(r);
  }
  return out;
}

function printTable(records) {
  if (records.length === 0) {
    console.log("(no records)");
    return;
  }
  const rows = records.map((r) => [
    r.id,
    r.created_at.replace("T", " ").slice(0, 16),
    r.status,
    r.question_id,
    r.locale,
    r.category,
    (r.status === "resolved" ? `[${r.resolution_note ?? ""}] ` : "") +
      (r.note ?? "").replace(/\s+/g, " ").slice(0, 60),
  ]);
  const head = ["id", "created (UTC)", "status", "question", "loc", "category", "note"];
  const widths = head.map((h, i) => Math.max(h.length, ...rows.map((row) => row[i].length)));
  const fmt = (row) => row.map((c, i) => (i === row.length - 1 ? c : c.padEnd(widths[i]))).join("  ");
  console.log(fmt(head));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const row of rows) console.log(fmt(row));
  console.log(`\n${records.length} record(s)`);
}

function flagValue(args, name) {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  const v = args[i + 1];
  if (v === undefined || v.startsWith("--")) die(`${name} needs a value`);
  return v;
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  if (!cmd || cmd === "--help" || cmd === "-h" || cmd === "help") {
    console.log(USAGE);
    return;
  }

  if (cmd === "list") {
    const status = flagValue(args, "--status") ?? "open";
    if (!["open", "resolved", "all"].includes(status)) die("--status must be open|resolved|all");
    const all = await fetchAll(redisClient());
    printTable(status === "all" ? all : all.filter((r) => r.status === status));
    return;
  }

  if (cmd === "pull") {
    const open = (await fetchAll(redisClient())).filter((r) => r.status === "open");
    mkdirSync(path.dirname(PULL_OUT), { recursive: true });
    writeFileSync(
      PULL_OUT,
      JSON.stringify({ pulled_at: new Date().toISOString(), count: open.length, records: open }, null, 2) + "\n",
    );
    console.log(`✓ ${open.length} open record(s) → ${path.relative(ROOT, PULL_OUT)}`);
    return;
  }

  if (cmd === "resolve") {
    const id = args[0];
    if (!id || id.startsWith("--")) die(`resolve needs an id\n${USAGE}`);
    const note = flagValue(args, "--note");
    if (!note || !note.trim()) die('resolve needs --note "<resolution note>"');
    const redis = redisClient();
    const rec = await redis.get(recKey(id));
    if (!rec) die(`no record with id ${id}`);
    const updated = {
      ...rec,
      status: "resolved",
      resolved_at: new Date().toISOString(),
      resolution_note: note.trim(),
    };
    await redis.set(recKey(id), updated);
    console.log(`✓ resolved ${id} (${updated.question_id}, ${updated.category})`);
    return;
  }

  die(`unknown command: ${cmd}\n${USAGE}`);
}

main().catch((err) => die(err instanceof Error ? err.message : String(err)));
