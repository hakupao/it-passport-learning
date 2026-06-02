// Stage 4 step3 — schema-verification harness data loader.
//
// Reads the pilot textbook data straight from the (gitignored) repo data dir at
// server request time. No copy into apps/web; no public/ static assets. Only this
// harness code is committed — the data stays gitignored (Release model intact).
//
// Root resolution mirrors the existing FsDataSource DATA_PATH pattern:
//   TEXTBOOK_DATA_ROOT env  →  <cwd=apps/web>/../../data/ip  (default)
// textbook content lives under <root>/textbook, exam-origin assets under <root>/exams.

import { promises as fs } from "node:fs";
import path from "node:path";

import type { TextbookUnit, UnitIndex } from "./types";

function dataRoot(): string {
  return (
    process.env.TEXTBOOK_DATA_ROOT ??
    path.resolve(process.cwd(), "../../data/ip")
  );
}

export function textbookRoot(): string {
  return path.join(dataRoot(), "textbook");
}

export function examsRoot(): string {
  return path.join(dataRoot(), "exams");
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(file, "utf-8")) as T;
}

// Path-traversal guards. `unitId` arrives from the [unitId] URL route param
// (user-controlled), so it is allowlisted to the strict unit-id slug shape
// (`category-nn-nn-uNN`) — no `.`, `/`, or NUL can pass. The figure paths come
// from our own unit JSON, but we additionally confine the resolved path to its
// root (defense-in-depth) and treat any escape as "unresolved" (→ null).
const UNIT_ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

function confineToRoot(root: string, rel: string): string | null {
  const resolved = path.resolve(root, rel);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) return null;
  return resolved;
}

export async function loadUnitIndex(): Promise<UnitIndex> {
  return readJson<UnitIndex>(path.join(textbookRoot(), "unit_index.pilot.json"));
}

export async function loadUnit(unitId: string): Promise<TextbookUnit> {
  if (!UNIT_ID_RE.test(unitId)) {
    throw new Error(`invalid unitId: ${JSON.stringify(unitId)}`);
  }
  return readJson<TextbookUnit>(
    path.join(textbookRoot(), "units", `${unitId}.json`),
  );
}

/** Units in the index's declared order (unit_order, flattened across topics). */
export async function loadAllUnits(): Promise<TextbookUnit[]> {
  const idx = await loadUnitIndex();
  const ids = idx.topics.flatMap((t) => t.unit_order);
  return Promise.all(ids.map((id) => loadUnit(id)));
}

/** Inline a generated Mermaid SVG (data/ip/textbook/<svgPath>). null if missing/escaping/unreadable. */
export async function loadGeneratedSvg(svgPath: string): Promise<string | null> {
  const file = confineToRoot(textbookRoot(), svgPath);
  if (!file) return null;
  try {
    return await fs.readFile(file, "utf-8");
  } catch {
    return null;
  }
}

/** base64 data-URI for a source exam PNG (data/ip/exams/<figurePath>). null if missing/escaping. */
export async function loadSourcePngDataUri(
  figurePath: string,
): Promise<string | null> {
  const file = confineToRoot(examsRoot(), figurePath);
  if (!file) return null;
  try {
    const buf = await fs.readFile(file);
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

let qbIdCache: Set<string> | null = null;

/** Set of every question_bank id, for inline_quiz / challenge resolution checks. */
export async function loadQuestionBankIds(): Promise<Set<string>> {
  if (qbIdCache) return qbIdCache;
  const qb = await readJson<{ questions: Array<{ id: string }> }>(
    path.join(examsRoot(), "question_bank.json"),
  );
  qbIdCache = new Set(qb.questions.map((q) => q.id));
  return qbIdCache;
}
