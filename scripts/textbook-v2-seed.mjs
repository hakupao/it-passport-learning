#!/usr/bin/env node
// Stage 7 Phase 3 Task 9 (S135 u02 attempt 2) — the seed of a seeded workflow run: an earlier run's JP
// part plus the JP review of exactly that part, taken from that run's journal.
//
// Run: node scripts/textbook-v2-seed.mjs --part <seed jp part.json> --journal <seed run's journal.jsonl> --review-round <n>
// The review is the "jp-review" row with round = n whose reviewed_sha256 = the seed file's sha256 (a review
// of other bytes is refused: the seed must be the reviewed draft). Prints
//   seed_sha256 <hex>
//   review jp-review#<n> <verdict> <k> issue(s)
//   the review issues as JSON
// The workflow's seeded round-0 writer runs this, revises the seed with these issues and returns
// seed_sha256 / seed_review_round (journal provenance; merge approval still needs a PASS review of the
// final part's own sha256).
// Exit: 0 = seed + review found, 1 = no matching review / not a JP part, 2 = usage / missing file.

import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { parseArgs, readJournal, readJson, sha256File } from "./lib/textbook-v2.mjs";

/** { sha256, review } for the seed, or { error }. */
export function seedOf(partFile, journalFile, reviewRound) {
  const part = readJson(partFile);
  if (part.stage !== "jp") return { error: `${partFile}: stage ${JSON.stringify(part.stage)}, a seed is a "jp" part` };
  const sha256 = sha256File(partFile);
  const reviews = readJournal(journalFile).results.filter((r) => r?.stage === "jp-review" && r.unit_id === part.unit_id);
  const review = reviews.filter((r) => r.round === reviewRound && r.reviewed_sha256 === sha256).at(-1);
  if (!review) {
    const seen = reviews.map((r) => `#${r.round} of ${String(r.reviewed_sha256).slice(0, 12)}…`).join(", ") || "none";
    return { error: `no jp-review #${reviewRound} of ${sha256.slice(0, 12)}… (${path.basename(partFile)}) in the journal (reviews: ${seen})` };
  }
  return { unit_id: part.unit_id, sha256, review };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let opt;
  try {
    opt = parseArgs(process.argv.slice(2), { part: "string", journal: "string", "review-round": "string" });
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exit(2);
  }
  const round = Number(opt["review-round"]);
  if (!opt.part || !opt.journal || !Number.isInteger(round) || round < 1) {
    console.error("usage: textbook-v2-seed.mjs --part <jp part.json> --journal <journal.jsonl> --review-round <n ≥ 1>");
    process.exit(2);
  }
  for (const f of [opt.part, opt.journal]) {
    if (!existsSync(f)) {
      console.error(`✗ not found: ${f}`);
      process.exit(2);
    }
  }
  const s = seedOf(path.resolve(opt.part), path.resolve(opt.journal), round);
  if (s.error) {
    console.error(`✗ ${s.error}`);
    process.exit(1);
  }
  console.log(`seed_sha256 ${s.sha256}`);
  console.log(`review jp-review#${s.review.round} ${s.review.verdict} ${s.review.issues?.length ?? 0} issue(s)`);
  console.log(JSON.stringify(s.review.issues ?? [], null, 1));
}
