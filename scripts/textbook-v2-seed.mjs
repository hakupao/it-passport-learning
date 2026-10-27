#!/usr/bin/env node
// Stage 7 Phase 3 Task 9 (S135 u02 attempt 2) — the seed of a seeded workflow run: an earlier run's JP
// part plus the JP review of exactly that part, taken from that run's journal.
//
// Run: node scripts/textbook-v2-seed.mjs --part <seed jp / loc part.json> --journal <seed run's journal.jsonl> --review-round <n>
// The review is the "jp-review" ("loc-review" for a loc part, batch B5) row with round = n whose reviewed_sha256
// = the seed file's sha256 (a review of other bytes is refused: the seed must be the reviewed draft). Prints
//   seed_sha256 <hex>
//   jp_part <path> / jp_sha256 <hex>   (loc part only: the JP part it was localised from = <seed dir>/<unit>.jp.r<jp_round>.json,
//                                       whose sha256 must equal the journal's loc row jp_sha256 → reused as-is)
//   review <stage>#<n> <verdict> <k> issue(s)
//   the review issues as JSON
// The workflow's seeded round-0 writer runs this, revises the seed with these issues and returns
// seed_sha256 / seed_review_round (journal provenance; merge approval still needs a PASS review of the
// final part's own sha256).
// Exit: 0 = seed + review found, 1 = no matching review / JP part changed / not a jp or loc part, 2 = usage / missing file.

import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { parseArgs, readJournal, readJson, sha256File } from "./lib/textbook-v2.mjs";

/** { sha256, review, jp? } for the seed, or { error }. */
export function seedOf(partFile, journalFile, reviewRound) {
  const part = readJson(partFile);
  if (part.stage !== "jp" && part.stage !== "loc") return { error: `${partFile}: stage ${JSON.stringify(part.stage)}, a seed is a "jp" or "loc" part` };
  const stage = `${part.stage}-review`;
  const sha256 = sha256File(partFile);
  const rows = readJournal(journalFile).results;
  const reviews = rows.filter((r) => r?.stage === stage && r.unit_id === part.unit_id);
  const review = reviews.filter((r) => r.round === reviewRound && r.reviewed_sha256 === sha256).at(-1);
  if (!review) {
    const seen = reviews.map((r) => `#${r.round} of ${String(r.reviewed_sha256).slice(0, 12)}…`).join(", ") || "none";
    return { error: `no ${stage} #${reviewRound} of ${sha256.slice(0, 12)}… (${path.basename(partFile)}) in the journal (reviews: ${seen})` };
  }
  if (part.stage === "jp") return { unit_id: part.unit_id, sha256, review };
  // B5: the JP part the seed was localised from, unchanged since (the journal's loc row recorded its sha256)
  const locRow = rows.filter((r) => r?.stage === "loc" && r.unit_id === part.unit_id && r.sha256 === sha256).at(-1);
  if (!locRow) return { error: `no "loc" row of ${sha256.slice(0, 12)}… in the journal (the JP part it was made from is unknown)` };
  const jpPart = path.join(path.dirname(partFile), `${part.unit_id}.jp.r${part.jp_round}.json`);
  if (!existsSync(jpPart)) return { error: `JP part ${jpPart} (jp_round ${part.jp_round}) not found` };
  const jpSha = sha256File(jpPart);
  if (jpSha !== locRow.jp_sha256) return { error: `JP part ${path.basename(jpPart)} sha256 ${jpSha.slice(0, 12)}… ≠ the loc row's jp_sha256 ${String(locRow.jp_sha256).slice(0, 12)}… — not the JP part the seed was made from` };
  return { unit_id: part.unit_id, sha256, review, jp: { part: jpPart, sha256: jpSha } };
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
  if (s.jp) {
    console.log(`jp_part ${s.jp.part}`);
    console.log(`jp_sha256 ${s.jp.sha256}`);
  }
  console.log(`review ${s.review.stage}#${s.review.round} ${s.review.verdict} ${s.review.issues?.length ?? 0} issue(s)`);
  console.log(JSON.stringify(s.review.issues ?? [], null, 1));
}
