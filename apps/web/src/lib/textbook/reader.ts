// Stage 6 (Session 85, D-133) — production textbook reader data layer.
//
// Reads the in-repo full corpus (data/ip/textbook/, un-gitignored per D-133):
//   - unit_index.json  → ReaderIndex   (full 244-unit ToC, G4 schema)
//   - units/{id}.json  → TextbookUnit  (schema "stage4-unit-v1-trilingual")
//   - figures/*.svg    → inlined self-generated Mermaid SVG
//
// Per-locale (single-language) rendering: routes use locale "ja" but the corpus
// uses the field suffix "jp" — toDataLang() bridges that. The pure helpers
// (buildNav / neighbors / toDataLang / pick*) are unit-tested in
// __tests__/reader.test.ts.
//
// SELF-CONTAINED filesystem layer (deliberately does NOT import ./loader): the
// harness loader.ts also reads data/ip/exams (source PNGs / question_bank), and
// pulling it into the textbook route's import graph makes nft trace the entire
// (gitignored, 1.2 GB, IPA-copyrighted) exams tree into the serverless bundle.
// Keeping the reader's fs footprint to data/ip/textbook keeps that boundary clean
// (Session 85, Rule D follow-up).

import { promises as fs } from "node:fs";
import path from "node:path";

import { cache } from "react";

import type { TextbookUnit } from "./types";

export type DataLang = "jp" | "zh" | "en";

/** App locale → corpus field suffix. Routing uses "ja" where the corpus uses "jp". */
export function toDataLang(locale: string): DataLang {
  return locale === "zh" ? "zh" : locale === "en" ? "en" : "jp";
}

// ---- full unit_index.json (subset we consume) -----------------------------

export interface ReaderIndexUnitRef {
  unit_id: string;
  title_jp: string;
  title_zh: string;
  title_en: string;
  node_freq_badge: string;
  term_count: number;
}

export interface ReaderIndexTopic {
  topic_id: string;
  category: string;
  major: string;
  major_zh: string;
  major_en: string;
  medium: string;
  medium_zh: string;
  medium_en: string;
  // The 小分類 name is JP-only across the corpus (and the IPA syllabus); it has
  // no translation, so the reader shows it in JP for every locale (OQ-03).
  name_jp: string;
  unit_order: string[];
  units: ReaderIndexUnitRef[];
}

export interface ReaderIndex {
  schema_version: string;
  stats: { topics: number; units: number; terms: number };
  topics: ReaderIndexTopic[];
}

// ---- nav model (pure, testable) -------------------------------------------

export interface NavUnit {
  unit_id: string;
  /** Unit title in the active locale (zh/en fall back to jp upstream). */
  title: string;
  badge: string;
  term_count: number;
}
export interface NavTopic {
  topic_id: string;
  /** major / medium group labels in the active locale; name is JP-only (OQ-03). */
  major: string;
  medium: string;
  name_jp: string;
  units: NavUnit[];
}
export interface NavCategory {
  category: string;
  topics: NavTopic[];
}

/** D-114 recommended learning path: technology → management → strategy. */
export const CATEGORY_ORDER: readonly string[] = [
  "technology",
  "management",
  "strategy",
] as const;

/** Pick the active-locale member of a `{jp,zh,en}` triple (jp as the fallback). */
function localized(
  jp: string,
  zh: string,
  en: string,
  locale: string,
): string {
  const dl = toDataLang(locale);
  const v = dl === "zh" ? zh : dl === "en" ? en : jp;
  return v && v.trim() !== "" ? v : jp;
}

/**
 * Group topics by category (CATEGORY_ORDER first, unknowns appended in encounter
 * order), preserving index order within a category and unit_order within a topic,
 * and resolving every label to `locale`. A unit_id in unit_order with no matching
 * `units` entry is dropped (defensive). Pure (no I/O) — unit-tested.
 */
export function buildNav(index: ReaderIndex, locale: string): NavCategory[] {
  const byCat = new Map<string, NavTopic[]>();

  for (const t of index.topics) {
    const byId = new Map((t.units ?? []).map((u) => [u.unit_id, u]));
    const units: NavUnit[] = (t.unit_order ?? [])
      .map((id) => byId.get(id))
      .filter((u): u is ReaderIndexUnitRef => Boolean(u))
      .map((u) => ({
        unit_id: u.unit_id,
        title: localized(u.title_jp, u.title_zh, u.title_en, locale),
        badge: u.node_freq_badge,
        term_count: u.term_count,
      }));
    const topic: NavTopic = {
      topic_id: t.topic_id,
      major: localized(t.major, t.major_zh, t.major_en, locale),
      medium: localized(t.medium, t.medium_zh, t.medium_en, locale),
      name_jp: t.name_jp,
      units,
    };
    const arr = byCat.get(t.category) ?? [];
    arr.push(topic);
    byCat.set(t.category, arr);
  }

  const ordered: NavCategory[] = [];
  const seen = new Set<string>();
  for (const cat of CATEGORY_ORDER) {
    const topics = byCat.get(cat);
    if (topics) {
      ordered.push({ category: cat, topics });
      seen.add(cat);
    }
  }
  for (const [cat, topics] of byCat) {
    if (!seen.has(cat)) ordered.push({ category: cat, topics });
  }
  return ordered;
}

/** Prev/next unit within a topic, by unit_order. null at the ends or if absent. */
export interface UnitNeighbors {
  topicName: string;
  prev: { unit_id: string; title_jp: string } | null;
  next: { unit_id: string; title_jp: string } | null;
}
export function neighbors(index: ReaderIndex, unitId: string): UnitNeighbors {
  for (const t of index.topics) {
    const order = t.unit_order ?? [];
    const i = order.indexOf(unitId);
    if (i === -1) continue;
    const byId = new Map((t.units ?? []).map((u) => [u.unit_id, u]));
    const ref = (id: string | undefined) => {
      const u = id ? byId.get(id) : undefined;
      return u ? { unit_id: u.unit_id, title_jp: u.title_jp } : null;
    };
    return {
      topicName: t.name_jp,
      prev: ref(order[i - 1]),
      next: ref(order[i + 1]),
    };
  }
  return { topicName: "", prev: null, next: null };
}

// ---- per-locale field pickers (pure) --------------------------------------

/** Pick a trilingual `{base}_{jp|zh|en}` string field for the active locale. */
export function pick(
  obj: Record<string, unknown>,
  base: string,
  locale: string,
): string {
  const v = obj[`${base}_${toDataLang(locale)}`];
  return typeof v === "string" ? v : "";
}

/** Pick a trilingual `{base}_{lang}` string-array field for the active locale. */
export function pickList(
  obj: Record<string, unknown>,
  base: string,
  locale: string,
): string[] {
  const v = obj[`${base}_${toDataLang(locale)}`];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

/** Term headword in the active locale (jp uses the bare `term` key). */
export function pickTerm(
  t: { term: string; term_zh: string; term_en: string },
  locale: string,
): string {
  const dl = toDataLang(locale);
  return dl === "jp" ? t.term : dl === "zh" ? t.term_zh : t.term_en;
}

// ---- textbook-only filesystem layer (self-contained) ----------------------

// Resolve straight to data/ip/textbook (no data/ip intermediate): build-time
// file tracing (nft) latches onto the resolvable base dir, so pointing at the
// textbook dir directly keeps the sibling exams/ + sources/ IPA trees out of the
// route bundle. TEXTBOOK_DATA_ROOT (pointing at data/ip) stays supported.
function textbookRoot(): string {
  const env = process.env.TEXTBOOK_DATA_ROOT;
  return env
    ? path.join(env, "textbook")
    : path.resolve(process.cwd(), "../../data/ip/textbook");
}

// `unitId` arrives from the [unitId] URL route param (user-controlled): allowlist
// it to the strict unit-id slug shape so no `.`, `/`, or NUL can reach a path join.
const UNIT_ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

/** Confine a (pipeline-controlled) relative path to its root; null on escape. */
function confineToRoot(root: string, rel: string): string | null {
  const resolved = path.resolve(root, rel);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) return null;
  return resolved;
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(file, "utf-8")) as T;
}

async function loadUnitRaw(unitId: string): Promise<TextbookUnit> {
  if (!UNIT_ID_RE.test(unitId)) {
    throw new Error(`invalid unitId: ${JSON.stringify(unitId)}`);
  }
  return readJson<TextbookUnit>(
    path.join(textbookRoot(), "units", `${unitId}.json`),
  );
}

/**
 * Per-request memoized unit loader: the unit route reads the same unit in both
 * generateMetadata and the page body, so cache() collapses them to one disk
 * read + parse within a single request render (Rule D LOW, Session 85).
 */
export const loadUnit = cache(loadUnitRaw);

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

export async function loadReaderIndex(): Promise<ReaderIndex> {
  return readJson<ReaderIndex>(path.join(textbookRoot(), "unit_index.json"));
}

export type { TextbookUnit };
