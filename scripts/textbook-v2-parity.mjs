#!/usr/bin/env node
// Stage 7 Phase 3 Task 9 (D-196 §0-13, Review Focus 7) — the three languages of a v2 unit have the
// same structure: per-language counts of goals, key points, 総表 columns / rows / cells, terms
// (一句話 + 展開), analogies, hooks, figures, figure labels, steps, 考点, 易混 pairs and pair rows.
// A count = items with non-empty text in that language (lib/textbook-v2.mjs parityCounts), so a
// dropped translation shows as a lower count for that language.
//
// Run (one of): --unit <id> (data/ip/textbook/units/<id>.json) | --file <unit.json> | --part <loc part.json>
//               [--data-root <dir>] [--verbose]  (--verbose prints every location, not only the diff)
// Exit: 0 = equal everywhere, 1 = differences (printed as `location  jp=… zh=… en=…`), 2 = usage.

import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { dataPaths, parityCounts, parseArgs, readJson } from "./lib/textbook-v2.mjs";

const line = ([loc, c]) => `${loc.padEnd(48)} jp=${c.jp} zh=${c.zh} en=${c.en}`;

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let opt;
  try {
    opt = parseArgs(process.argv.slice(2), { unit: "string", file: "string", part: "string", "data-root": "string", verbose: "bool" });
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exit(2);
  }
  const modes = ["unit", "file", "part"].filter((k) => opt[k]);
  if (modes.length !== 1) {
    console.error("usage: textbook-v2-parity.mjs (--unit <id> | --file <unit.json> | --part <loc-part.json>) [--data-root <dir>] [--verbose]");
    process.exit(2);
  }
  const file = opt.unit ? dataPaths(opt["data-root"]).unit(opt.unit) : path.resolve(opt.file ?? opt.part);
  if (!existsSync(file)) {
    console.error(`✗ not found: ${file}`);
    process.exit(2);
  }
  const doc = readJson(file);
  const rows = parityCounts(doc);
  const diff = rows.filter(([, c]) => !(c.jp === c.zh && c.zh === c.en));
  if (opt.verbose) for (const r of rows) console.log(`  ${line(r)}`);
  if (diff.length === 0) {
    console.log(`✓ ${doc.unit_id} parity: ${rows.length} locations, 0 diff`);
    process.exit(0);
  }
  console.log(`✗ ${doc.unit_id} parity: ${diff.length} location(s) differ`);
  for (const r of diff) console.log(`  ${line(r)}`);
  process.exit(1);
}
