#!/usr/bin/env node
// D-217 H1-6 — the IPA leak gate on out/ (run after the export build, before every deploy; H6):
//   node scripts/scan-out.ts [out-dir] [--json report.json]      (default out-dir: out)
// Exit 0 only when every rule of src/lib/export/outScan.ts has 0 findings. Rule (c) needs the
// gitignored IPA source material (data/ip/exams, data/ip/sources PDFs via pdftotext, data/ip/syllabus):
// when any of it is missing the scan fails — it never passes on an empty source set.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  checkAnalytics,
  checkForbidden,
  checkLimits,
  checkPaths,
  confirmCandidates,
  type Finding,
  SourceIndex,
  stringLeaves,
  TEXT_EXT,
  walkOut,
} from "../src/lib/export/outScan.ts";

const args = process.argv.slice(2);
const jsonAt = args.indexOf("--json");
const jsonOut = jsonAt >= 0 ? args[jsonAt + 1] : undefined;
const positional = args.filter((a, i) => !a.startsWith("--") && (jsonAt < 0 || i !== jsonAt + 1));
const outDir = path.resolve(positional[0] ?? "out");
const REPO = path.resolve(import.meta.dirname, "../../..");
const IP = path.join(REPO, "data/ip");
const t0 = Date.now();

function files(dir: string, re: RegExp, recursive = true): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (recursive) out.push(...files(p, re));
    } else if (re.test(e.name)) out.push(p);
  }
  return out;
}

function jsonLeaves(file: string): string[] {
  try {
    return stringLeaves(JSON.parse(readFileSync(file, "utf-8")));
  } catch {
    return [readFileSync(file, "utf-8")]; // not JSON (jsonl, a partial tmp file): the raw text
  }
}

// ---- (c) sources and corpora --------------------------------------------------------------------
const SOURCE_DIRS = ["exams", "sources", "syllabus"].map((d) => path.join(IP, d));
for (const d of SOURCE_DIRS) {
  if (!existsSync(d)) {
    console.error(`scan-out: IPA source dir missing: ${d} — rule (c) cannot run, refusing to pass`);
    process.exit(2);
  }
}
const sourceJson = [...files(path.join(IP, "exams"), /\.json$/), ...files(path.join(IP, "syllabus"), /\.json$/)];
const pdfs = files(path.join(IP, "sources"), /\.pdf$/i);
if (sourceJson.length === 0 || pdfs.length === 0) {
  console.error(`scan-out: no IPA source files (json ${sourceJson.length}, pdf ${pdfs.length}) — refusing to pass`);
  process.exit(2);
}
function pdfText(file: string): string {
  try {
    return execFileSync("pdftotext", ["-enc", "UTF-8", file, "-"], { maxBuffer: 256 * 1024 * 1024 }).toString("utf-8");
  } catch (err) {
    console.error(`scan-out: pdftotext failed on ${file} (${(err as Error).message}) — refusing to pass`);
    process.exit(2);
  }
}

/** The texts the site is built from (D-217 H1-2 / lib readers) + the UI messages. */
const corpusFiles = [
  ...files(path.join(IP, "quiz"), /\.json$/, false),
  ...files(path.join(IP, "quiz/translations"), /\.json$/, false),
  ...files(path.join(IP, "quiz/explanations"), /\.json$/, false),
  path.join(IP, "textbook/unit_index.json"),
  ...files(path.join(IP, "textbook/units"), /\.json$/, false),
  ...files(path.join(IP, "textbook/figures"), /\.svg$/),
  ...files(path.resolve(import.meta.dirname, "../messages"), /\.json$/, false),
];
/** Corpus text as it is rendered too: markdown emphasis and the [[jp:…]] marker removed. */
function rendered(s: string): string {
  return s.replace(/\[\[jp:([^\]]*)\]\]/g, "$1").replace(/[*_~#`]/g, "");
}
/** Re-read per pass (not kept in memory, ~50 MB of JSON). */
function* corpusTexts(): Generator<string> {
  for (const f of corpusFiles) {
    const leaves = f.endsWith(".json") ? jsonLeaves(f) : [readFileSync(f, "utf-8")];
    for (const s of leaves) {
      yield s;
      yield rendered(s);
    }
  }
}

const index = new SourceIndex();
const sourceTexts: string[] = [];
for (const f of sourceJson) for (const s of jsonLeaves(f)) sourceTexts.push(s);
for (const f of pdfs) sourceTexts.push(pdfText(f));
for (const s of sourceTexts) index.addSource(s);
const sourceWindows = index.size;
for (const s of corpusTexts()) index.subtractCorpus(s);
const tIndex = Date.now();

// ---- walk out/ ----------------------------------------------------------------------------------
const all = walkOut(outDir);
const findings: Finding[] = [...checkPaths(all)];
const limits = checkLimits(all);
findings.push(...limits.findings);

const candidates = new Map<string, Set<string>>(); // window → files
let textFiles = 0;
let htmlPages = 0;
let beaconPages = 0;
for (const f of all) {
  const base = path.basename(f.rel);
  if (!TEXT_EXT.test(base)) continue;
  textFiles++;
  const text = readFileSync(path.join(outDir, f.rel), "utf-8");
  findings.push(...checkForbidden(f.rel, text));
  if (/^(?:ja|zh|en)(?:\/.*)?\.html$/.test(f.rel)) {
    htmlPages++;
    if (text.includes("static.cloudflareinsights.com/beacon.min.js")) beaconPages++;
  }
  for (const w of index.candidates(text)) {
    let s = candidates.get(w);
    if (!s) candidates.set(w, (s = new Set()));
    s.add(f.rel);
  }
}
const confirmed = confirmCandidates(new Set(candidates.keys()), sourceTexts, corpusTexts());
for (const w of confirmed) {
  const where = [...candidates.get(w)!];
  findings.push({ rule: "c", path: where[0]!, detail: `source-only text ${JSON.stringify(w)} in ${where.length} file(s)` });
}
findings.push(...checkAnalytics(readFileSync(path.join(outDir, "_headers"), "utf-8"), beaconPages, htmlPages));

// ---- report -------------------------------------------------------------------------------------
const byTop = new Map<string, { files: number; bytes: number }>();
for (const f of all) {
  const top = f.rel.includes("/") ? f.rel.split("/")[0]! + "/" : "(root)";
  const e = byTop.get(top) ?? { files: 0, bytes: 0 };
  e.files++;
  e.bytes += f.size;
  byTop.set(top, e);
}
const count = (re: RegExp): number => all.filter((f) => re.test(f.rel)).length;
const report = {
  outDir,
  pass: findings.length === 0,
  findings: { a: 0, b: 0, c: 0, d: 0, e: 0, ...Object.fromEntries(Object.entries(Object.groupBy(findings, (x) => x.rule)).map(([k, v]) => [k, v!.length])) },
  files: {
    total: limits.total,
    limit: 20_000,
    headroom: limits.headroom,
    bytes: limits.bytes,
    largest: limits.largest,
    byTop: Object.fromEntries([...byTop].sort()),
    families: {
      questionHtml: count(/^(?:ja|zh|en)\/practice\/q\/[^/]+\.html$/),
      termHtml: count(/^(?:ja|zh|en)\/glossary\/[^/]+\.html$/),
      detailTxt: count(/^(?:ja|zh|en)\/(?:practice\/q|glossary)\/[^/]+\.txt$/),
      otherHtml: count(/^(?:ja|zh|en)(?:\/.*)?\.html$/) - count(/^(?:ja|zh|en)\/(?:practice\/q|glossary)\/[^/]+\.html$/),
      otherTxt: count(/^(?:ja|zh|en)(?:\/.*)?\.txt$/) - count(/^(?:ja|zh|en)\/(?:practice\/q|glossary)\/[^/]+\.txt$/),
      data: count(/^data\//),
      quizFigures: count(/^quiz-figures\//),
      nextStatic: count(/^_next\//),
    },
  },
  sourceText: {
    sourceJsonFiles: sourceJson.length,
    sourcePdfs: pdfs.length,
    sourceChars: index.sourceChars,
    sourceWindows,
    idWindowsSkipped: index.idWindows,
    sourceOnlyWindows: index.size,
    corpusFiles: corpusFiles.length,
    textFilesScanned: textFiles,
    hashCandidates: candidates.size,
    confirmed: confirmed.size,
  },
  analytics: { htmlPages, beaconPages },
  seconds: { index: (tIndex - t0) / 1000, total: (Date.now() - t0) / 1000 },
  sample: findings.slice(0, 50),
};
if (jsonOut) writeFileSync(jsonOut, JSON.stringify({ ...report, sample: findings }, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
process.exit(report.pass ? 0 : 1);
