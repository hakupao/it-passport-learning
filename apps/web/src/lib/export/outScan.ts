// D-217 H1-6 — the IPA leak gate on the deployable output: the whole out/ tree, as Cloudflare will
// serve it (replaces the S131 gate `find .next -name '*.nft.json' … data/ip/(exams|sources|syllabus)/`,
// which only applied to a server bundle). Four rules, each a list of findings (0 = pass):
//   (a) paths  every file is under an expected path (PATH_RULES); the two detail families have no .txt
//   (b) keys   no FORBIDDEN_KEYS / FORBIDDEN_TEXT (staticData/forbidden): JSON files are parsed (no such
//              key anywhere); other text files are matched on the quoted key, plain and escaped (the
//              flight payload inside HTML is a JS string: \"key\":). Precise rule for the generic keys
//              (GENERIC_KEYS: stats, count, pages, page): a hit is the key in object position with a
//              non-string value — the corpus forms are objects / numbers / arrays, while a string value
//              is UI text (the i18n message Textbook.stats = "{topics} topics · …" is in every page's
//              messages). Every other key is forbidden in any quoted occurrence.
//   (c) source text  no run of ≥ 20 characters that is in the IPA source material (data/ip/exams,
//              sources, syllabus) but in none of the corpora the site is built from (SourceIndex)
//   (d) limits ≤ 20,000 files, each ≤ 25 MiB (Cloudflare Workers Free static assets, per version)
//   (e) analytics  the Web Analytics beacon appears in the pages iff the CSP in _headers allows it
// Pure functions + a file walk; the CLI (scripts/scan-out.ts) reads the sources and prints the report.
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

import { FORBIDDEN_KEYS, FORBIDDEN_TEXT } from "../staticData/forbidden.ts";

export type Rule = "a" | "b" | "c" | "d" | "e";
export type Finding = { rule: Rule; path: string; detail: string };
export type OutFile = { rel: string; size: number };

export const MAX_FILES = 20_000;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MIN_RUN = 20;

/** Every file under outDir, relative with "/" separators. */
export function walkOut(outDir: string): OutFile[] {
  const out: OutFile[] = [];
  const walk = (rel: string): void => {
    for (const e of readdirSync(path.join(outDir, rel), { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(r);
      else out.push({ rel: r, size: statSync(path.join(outDir, r)).size });
    }
  };
  walk("");
  return out.sort((a, b) => (a.rel < b.rel ? -1 : 1));
}

const L = "(?:ja|zh|en)";
const QID = String.raw`\d{4}[a-z0-9]{1,16}-q\d{3}`;
const TERM = "t[0-9a-f]{16}";

/** (a) The expected paths of out/. Anything else is a finding. */
export const PATH_RULES: { name: string; re: RegExp }[] = [
  { name: "root files", re: /^(?:404\.html|index\.html|_headers|_redirects|robots\.txt|sitemap(?:-\d+)?\.xml|favicon\.ico)$/ },
  // create-next-app leftovers in public/ (unused; listed by name so nothing else slips in)
  { name: "public svg", re: /^(?:file|globe|next|vercel|window)\.svg$/ },
  { name: "locale index", re: new RegExp(`^${L}\\.(?:html|txt)$`) },
  { name: "question page", re: new RegExp(`^${L}/practice/q/${QID}\\.html$`) },
  { name: "term page", re: new RegExp(`^${L}/glossary/${TERM}\\.html$`) },
  // every other page (+ its RSC payload); the two detail directories are excluded here
  { name: "page", re: new RegExp(`^${L}/(?!practice/q/|glossary/)(?:[a-z0-9-]+/)*[a-z0-9-]+\\.(?:html|txt)$`) },
  { name: "static data", re: /^data\/(?:quiz|quiz-expl|glossary|practice|sensei|textbook)\/[a-z0-9.-]+\.json$/ },
  { name: "quiz figure", re: new RegExp(`^quiz-figures/${QID}(?:-c[A-D])?\\.webp$`) },
  { name: "next static", re: /^_next\/static\/(?:chunks|media|[A-Za-z0-9_-]{8,})\/[A-Za-z0-9_.~-]+\.(?:js|css|json|woff2|ico|svg|png|webp)$/ },
];

export function checkPaths(files: readonly OutFile[]): Finding[] {
  return files.filter((f) => !PATH_RULES.some((r) => r.re.test(f.rel))).map((f) => ({ rule: "a", path: f.rel, detail: "unexpected path" }));
}

/** (d) */
export function checkLimits(files: readonly OutFile[]): { findings: Finding[]; total: number; bytes: number; headroom: number; largest: OutFile | null } {
  const findings: Finding[] = [];
  if (files.length > MAX_FILES) findings.push({ rule: "d", path: ".", detail: `${files.length} files > ${MAX_FILES}` });
  for (const f of files) if (f.size > MAX_FILE_BYTES) findings.push({ rule: "d", path: f.rel, detail: `${f.size} bytes > 25 MiB` });
  const largest = files.reduce<OutFile | null>((m, f) => (m === null || f.size > m.size ? f : m), null);
  return { findings, total: files.length, bytes: files.reduce((s, f) => s + f.size, 0), headroom: MAX_FILES - files.length, largest };
}

export const TEXT_EXT = /\.(?:html|txt|js|css|json|xml|svg)$|^_headers$|^_redirects$/;
export const GENERIC_KEYS = ["stats", "count", "pages", "page"] as const;

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const KEY_RES = FORBIDDEN_KEYS.map((k) => {
  const q = String.raw`\\{0,3}"`; // ", \", \\\" …
  const key = `${q}${escapeRe(k)}${q}`;
  const generic = (GENERIC_KEYS as readonly string[]).includes(k);
  // generic: in object position ({ or , before) with a value that is not a string literal
  return { key: k, re: generic ? new RegExp(String.raw`[{,]\s*${key}\s*:\s*(?!\\{0,3}")`) : new RegExp(key) };
});

function allKeys(value: unknown, into: Set<string>): void {
  if (Array.isArray(value)) for (const v of value) allKeys(v, into);
  else if (value !== null && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      into.add(k);
      allKeys(v, into);
    }
  }
}

/** (b) one text file. */
export function checkForbidden(rel: string, text: string): Finding[] {
  const out: Finding[] = [];
  for (const t of FORBIDDEN_TEXT) {
    const i = text.indexOf(t);
    if (i >= 0) out.push({ rule: "b", path: rel, detail: `text ${JSON.stringify(t)} … ${JSON.stringify(text.slice(Math.max(0, i - 40), i + 40))}` });
  }
  if (rel.endsWith(".json")) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return [...out, { rule: "b", path: rel, detail: "JSON does not parse" }];
    }
    const keys = new Set<string>();
    allKeys(parsed, keys);
    for (const k of FORBIDDEN_KEYS) if (keys.has(k)) out.push({ rule: "b", path: rel, detail: `key ${k}` });
    return out;
  }
  for (const { key, re } of KEY_RES) {
    const m = re.exec(text);
    if (m) out.push({ rule: "b", path: rel, detail: `key ${key} … ${JSON.stringify(text.slice(Math.max(0, m.index - 40), m.index + 60))}` });
  }
  return out;
}

/** (e) the beacon is in the HTML iff the CSP allows it. */
export function checkAnalytics(headers: string, beaconPages: number, htmlPages: number): Finding[] {
  const csp = /Content-Security-Policy: (.*)/.exec(headers)?.[1] ?? "";
  const allowed = csp.includes("https://static.cloudflareinsights.com/beacon.min.js") && csp.includes("https://cloudflareinsights.com");
  if (!csp) return [{ rule: "e", path: "_headers", detail: "no Content-Security-Policy" }];
  if (allowed && beaconPages !== htmlPages) return [{ rule: "e", path: "_headers", detail: `CSP allows the beacon but ${beaconPages}/${htmlPages} pages have it` }];
  if (!allowed && beaconPages > 0) return [{ rule: "e", path: "_headers", detail: `${beaconPages} pages have the beacon but the CSP does not allow it` }];
  return [];
}

// ---- (c) source text --------------------------------------------------------------------------

/** Undo the escapes text can carry in out/: JSON / JS string escapes (up to doubly escaped, as the
 *  flight payload in HTML) and the HTML entities React emits. */
export function decodeText(s: string): string {
  let t = s;
  for (let i = 0; i < 2; i++) {
    // one left-to-right pass per escape level, so `\\n` (an escaped backslash + n) stays `\n` until the next level
    t = t.replace(/\\(u[0-9a-fA-F]{4}|[^])/g, (_, e: string) =>
      e.length === 5 ? String.fromCharCode(parseInt(e.slice(1), 16)) : e === "n" || e === "r" || e === "t" ? "\n" : e,
    );
  }
  return t
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

/** Characters that end a run: markup, quoting, escapes and line breaks (a window never spans a
 *  field boundary in JSON or a tag in HTML) and the ASCII `:` `.` `(` `)` the site composes labels
 *  and fields with ("定義: …", "A vs. B", "RFP (…)"), so a window across them is not source text.
 *  Other ASCII punctuation (the OCR text's `, ` comma among it) stays inside a run.
 *  Spaces (ASCII, U+3000, NBSP) are dropped inside a run, so layout differences (pdftotext, HTML
 *  whitespace) do not hide a match. Full-width CJK punctuation does not break a run. */
const BREAKS = new Set([..."<>\"'{}[]\\&\n\r\t`:.()"].map((c) => c.charCodeAt(0)));
function isBreak(c: number): boolean {
  return BREAKS.has(c);
}
function isSpace(c: number): boolean {
  return c === 0x20 || c === 0x3000 || c === 0xa0;
}

const B1 = 0x01000193;
const B2 = 0x5bd1e995;
// base^(MIN_RUN-1) mod 2^32 for the rolling removal
function pow32(b: number, e: number): number {
  let r = 1;
  for (let i = 0; i < e; i++) r = Math.imul(r, b);
  return r;
}
const P1 = pow32(B1, MIN_RUN - 1);
const P2 = pow32(B2, MIN_RUN - 1);

/** Calls `onWindow(hash, run, start)` for every MIN_RUN-character window of every run in `input`
 *  (case-folded, spaces dropped; the window is run.slice(start, start + MIN_RUN)). */
export function forEachWindow(input: string, onWindow: (h: number, run: string, start: number) => void): void {
  let run = "";
  const flush = (): void => {
    if (run.length >= MIN_RUN) {
      let h1 = 0;
      let h2 = 0;
      for (let i = 0; i < run.length; i++) {
        const c = run.charCodeAt(i);
        if (i >= MIN_RUN) {
          const o = run.charCodeAt(i - MIN_RUN);
          h1 = (h1 - Math.imul(o, P1)) | 0;
          h2 = (h2 - Math.imul(o, P2)) | 0;
        }
        h1 = (Math.imul(h1, B1) + c) | 0;
        h2 = (Math.imul(h2, B2) + c) | 0;
        if (i >= MIN_RUN - 1) onWindow((h1 >>> 0) * 0x200000 + ((h2 >>> 0) & 0x1fffff), run, i - MIN_RUN + 1);
      }
    }
    run = "";
  };
  let buf: string[] = [];
  const text = input.toLowerCase(); // case-folded: the site derives lower-cased text (the glossary search keys)
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (isBreak(c)) {
      if (buf.length) {
        run = buf.join("");
        buf = [];
        flush();
      }
    } else if (!isSpace(c)) buf.push(text[i]!);
  }
  if (buf.length) {
    run = buf.join("");
    flush();
  }
}

/** Windows that are question identifiers, not text: an exam id or question number fragment
 *  (2009h21a, r05h…, -q012 — the figure paths `figures/2009h21a-q012.png` in the source vs
 *  `/quiz-figures/2009h21a-q012.webp` on the site). Ids are published by design. */
export const ID_WINDOW = /\d{2}[hr]\d{2}|-q\d{2}/;

/** Windows of the source material minus the windows of the published corpora; out/ text is then
 *  matched against what is left. Hash hits are confirmed against the real window text (confirmCandidates). */
export class SourceIndex {
  private readonly windows = new Set<number>();
  sourceChars = 0;
  idWindows = 0;

  addSource(text: string): void {
    this.sourceChars += text.length;
    forEachWindow(text, (h, run, start) => {
      if (ID_WINDOW.test(run.slice(start, start + MIN_RUN))) this.idWindows++;
      else this.windows.add(h);
    });
  }

  /** Remove every window that also occurs in published corpus text. */
  subtractCorpus(text: string): void {
    forEachWindow(text, (h) => this.windows.delete(h));
  }

  get size(): number {
    return this.windows.size;
  }

  /** Candidate hits in one out/ text: the window strings whose hash is in the index. */
  candidates(text: string): string[] {
    const hits: string[] = [];
    forEachWindow(decodeText(text), (h, run, start) => {
      if (this.windows.has(h)) hits.push(run.slice(start, start + MIN_RUN));
    });
    return hits;
  }
}

/** Second pass: which candidate windows really occur in the source text and in no corpus text. */
export function confirmCandidates(candidates: ReadonlySet<string>, sources: Iterable<string>, corpora: Iterable<string>): Set<string> {
  const inSource = new Set<string>();
  for (const s of sources) {
    forEachWindow(s, (_h, run, start) => {
      const w = run.slice(start, start + MIN_RUN);
      if (candidates.has(w) && !ID_WINDOW.test(w)) inSource.add(w);
    });
  }
  for (const c of corpora) {
    forEachWindow(c, (_h, run, start) => {
      const w = run.slice(start, start + MIN_RUN);
      if (inSource.has(w)) inSource.delete(w);
    });
  }
  return inSource;
}

/** Every string leaf of a parsed JSON value (keys excluded: they are field names, not text). */
export function stringLeaves(value: unknown, into: string[] = []): string[] {
  if (typeof value === "string") into.push(value);
  else if (Array.isArray(value)) for (const v of value) stringLeaves(v, into);
  else if (value !== null && typeof value === "object") for (const v of Object.values(value)) stringLeaves(v, into);
  return into;
}
