#!/usr/bin/env node
// Stage 7 Phase 3 batch B1 (D-201 §0-1) — the batch order of the v2 rewrite as docs/phase5/batch_order.md.
//
// Run: node scripts/textbook-v2-batch-order.mjs [--out <file>] [--check] [--data-root <dir>]
//   Topics except the pilot topic (management-10-27, already v2), by question count desc (questions.json
//   rows with that topic_id; ties by topic_id). A topic with > 5 units is split by unit order into
//   batches of ≤ 5; others are one batch. Batch ids b01… in that order.
//   The status column is hand-maintained (§2 step 6: commit / attempts / usage): a rewrite keeps the
//   status cell of every batch id whose units are unchanged ("todo" otherwise).
//   --check: exit 1 when the file differs from what would be written (status cells kept).
// Exit: 0 = written / current, 1 = --check found a difference, 2 = usage error.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { dataPaths, parseArgs, readJson, REPO } from "./lib/textbook-v2.mjs";

export const PILOT_TOPIC = "management-10-27";
export const BATCH_MAX = 5;
const OUT = path.join(REPO, "docs/phase5/batch_order.md");

/** [{id, topic_id, name_jp, part ("" | "k/n"), units: [unit_id], questions, terms}] in batch order. */
export function batchOrder(index, questions) {
  const count = new Map();
  for (const q of questions) count.set(q.topic_id, (count.get(q.topic_id) ?? 0) + 1);
  const topics = index.topics
    .filter((t) => t.topic_id !== PILOT_TOPIC)
    .map((t) => ({ t, n: count.get(t.topic_id) ?? 0 }))
    .sort((a, b) => b.n - a.n || (a.t.topic_id < b.t.topic_id ? -1 : a.t.topic_id > b.t.topic_id ? 1 : 0));
  const out = [];
  for (const { t, n } of topics) {
    const units = [...t.units].sort((a, b) => (a.unit_id < b.unit_id ? -1 : 1));
    const k = units.length > BATCH_MAX ? Math.ceil(units.length / BATCH_MAX) : 1;
    for (let i = 0; i < k; i++) {
      const us = units.slice(i * BATCH_MAX, k === 1 ? units.length : (i + 1) * BATCH_MAX);
      out.push({
        id: `b${String(out.length + 1).padStart(2, "0")}`,
        topic_id: t.topic_id,
        name_jp: t.name_jp,
        part: k === 1 ? "" : `${i + 1}/${k}`,
        units: us.map((u) => u.unit_id),
        questions: n,
        terms: us.reduce((a, u) => a + u.terms.length, 0),
      });
    }
  }
  return out;
}

const unitsCell = (b) => b.units.map((u) => u.slice(b.topic_id.length + 1)).join(" ");

/** Status cells of an existing doc: batch id → {units, status}. */
export function readStatus(md) {
  const out = new Map();
  for (const line of md.split("\n")) {
    const m = /^\| (b\d+) \| [^|]* \| [^|]* \| ([^|]*) \|(?: [^|]* \|){2} (.*) \|$/.exec(line);
    if (m) out.set(m[1], { units: m[2].trim(), status: m[3].trim() });
  }
  return out;
}

export function renderMarkdown(batches, status) {
  const topics = new Set(batches.map((b) => b.topic_id));
  const split = new Set(batches.filter((b) => b.part !== "").map((b) => b.topic_id));
  const units = batches.reduce((a, b) => a + b.units.length, 0);
  const terms = batches.reduce((a, b) => a + b.terms, 0);
  const rows = batches.map((b) => {
    const prev = status.get(b.id);
    const st = prev && prev.units === unitsCell(b) && prev.status !== "" ? prev.status : "todo";
    const name = b.part ? `${b.name_jp} (${b.part})` : b.name_jp;
    return `| ${b.id} | ${b.topic_id} | ${name} | ${unitsCell(b)} | ${b.questions} | ${b.terms} | ${st} |`;
  });
  return [
    "# 教科书 v2 批量重写 — 批次顺序 (D-201 §0-1)",
    "",
    "> 由 `node scripts/textbook-v2-batch-order.mjs` 生成（`--check` 校验）。除 status 列外不要手改；status 列重生成时按批 id 保留。",
    `> 试点 topic \`${PILOT_TOPIC}\` 已为 v2（冻结基线），不在表内。questions = 该 topic 的过去问题数（排序键，同数按 topic_id）；拆批 = 单元数 > ${BATCH_MAX} 的 topic 按单元顺序每 ${BATCH_MAX} 个一批。`,
    "",
    `合计：${topics.size} topic / ${units} 单元 / ${terms} 用语 / ${batches.length} 批（拆批 topic ${split.size} 个）。`,
    "",
    "| batch | topic | names | units | questions | terms | status |",
    "|---|---|---|---|---|---|---|",
    ...rows,
    "",
  ].join("\n");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let opt;
  try {
    opt = parseArgs(process.argv.slice(2), { out: "string", check: "bool", "data-root": "string" });
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exit(2);
  }
  const P = dataPaths(opt["data-root"]);
  const out = path.resolve(opt.out ?? OUT);
  const batches = batchOrder(readJson(P.index), readJson(P.questions).questions);
  const prev = existsSync(out) ? readFileSync(out, "utf-8") : null;
  const text = renderMarkdown(batches, readStatus(prev ?? ""));
  if (opt.check) {
    if (prev !== text) {
      console.error(`✗ ${path.relative(process.cwd(), out)} is not current (run without --check)`);
      process.exit(1);
    }
    console.log(`✓ ${path.relative(process.cwd(), out)} current (${batches.length} batches)`);
    process.exit(0);
  }
  if (prev !== text) writeFileSync(out, text);
  console.log(`${prev === text ? "=" : "✓"} ${path.relative(process.cwd(), out)}: ${batches.length} batches`);
}
