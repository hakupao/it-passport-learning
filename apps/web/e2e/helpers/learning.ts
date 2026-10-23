// Stage 7 Phase 1 Task 15 — shared helpers for the specs that seed or read the learning record.
//
// Prod-safety: every spec starts from an empty browser context (Playwright gives each test a fresh
// one), seeds exactly the record it asserts on and never depends on what anybody answered on the
// server. A seed is an init script guarded by "only when the key is absent": an unguarded one would
// run again on every navigation and overwrite what the app itself wrote since (settings, attempts).
//
// Non-owner: no spec here sets the owner cookie (only learning-owner.spec.ts does, against a local
// server), so /api/learning is never called; trackLearningRequests lets a spec assert that.
//
// record.ts has relative imports only, so it is safe to import from a spec.

import { expect, type Locator, type Page } from "@playwright/test";

import {
  emptyRecord,
  encodeRecord,
  LEARNING_STORAGE_KEY,
  parseRecord,
  type Attempt,
  type ChoiceLetter,
  type LearningRecord,
} from "../../src/lib/learning/record";

export const V2_KEY = LEARNING_STORAGE_KEY; // "itp:learn:v2"
export const V1_KEY = "itp:learn:v1";

const HOUR_MS = 3_600_000;

/** 36 h ago: always on an earlier local calendar day than now, also across a DST change (23 / 25 h days). */
export const yesterday = (now: number = Date.now()): number => now - 36 * HOUR_MS;

/** One practice attempt per [qid, choice, correct], all at `at` (+ i ms, so they stay distinct). */
export function attemptsOf(rows: readonly (readonly [string, ChoiceLetter, boolean])[], at: number): Record<string, Attempt[]> {
  return Object.fromEntries(rows.map(([qid, choice, correct], i) => [qid, [{ at: at + i, choice, correct, src: "practice" as const }]]));
}

/** A record holding `parts` (attempts / unitsRead / settings) on top of the empty one. */
export const recordWith = (parts: Partial<LearningRecord>): LearningRecord => ({ ...emptyRecord(), ...parts });

/** Seed `itp:learn:v2` with `record` before the first page script runs — only while the key is absent. */
export async function seedV2(page: Page, record: LearningRecord): Promise<void> {
  await page.addInitScript(
    ([key, value]) => {
      if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
    },
    [V2_KEY, JSON.stringify(encodeRecord(record))] as const,
  );
}

/** Seed an old tab's `itp:learn:v1` value (the raw string, so a spec can compare it byte for byte). */
export async function seedV1(page: Page, raw: string): Promise<void> {
  await page.addInitScript(
    ([key, value]) => {
      if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
    },
    [V1_KEY, raw] as const,
  );
}

/** The raw value of a localStorage key on `page` (null when absent). */
export const rawStored = (page: Page, key: string): Promise<string | null> =>
  page.evaluate((k) => localStorage.getItem(k), key);

/** The parsed `itp:learn:v2` record on `page`, or null when absent / invalid. */
export async function storedV2(page: Page): Promise<LearningRecord | null> {
  const raw = await rawStored(page, V2_KEY);
  return raw === null ? null : parseRecord(JSON.parse(raw) as unknown);
}

/** The stored attempts of `qid` (empty when none). */
export async function storedAttempts(page: Page, qid: string): Promise<Attempt[]> {
  const r = await storedV2(page);
  return r && Object.prototype.hasOwnProperty.call(r.attempts, qid) ? r.attempts[qid]! : [];
}

/** Every /api/learning request `page` makes ("METHOD url"). A non-owner page must make none. */
export function trackLearningRequests(page: Page): string[] {
  const seen: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/learning")) seen.push(`${r.method()} ${r.url()}`);
  });
  return seen;
}

/** Minimal ICU stand-in — the catalogs only use simple `{name}` placeholders where the specs read them. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

/** Local YYYY-MM-DD of `at` in the browser's (= this process's) time zone. */
export function localDate(at: number): string {
  const d = new Date(at);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Wait until no block of the page is still waiting for the learning record. */
export async function waitForRecord(page: Page): Promise<void> {
  await page.locator("main").first().waitFor();
  await page.waitForFunction(() => document.querySelector("[data-pending]") === null);
}

/** The four choice letters, in ア〜エ order (key "1" = ア … "4" = エ). */
export const LETTERS = ["ア", "イ", "ウ", "エ"] as const;
export type Letter = (typeof LETTERS)[number];

/** `s` with every RegExp metacharacter escaped. */
export const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The choice button of `letter` on the question on screen (practice group or single-question page). */
export const choiceButton = (page: Page, letter: string): Locator =>
  page.locator(`main article[id] li[data-letter="${letter}"] button`).first();

/** Click a practice-group choice until it is taken (clicks are ignored until hydration + the session restore). */
export async function answerChoice(page: Page, letter: string): Promise<void> {
  const btn = choiceButton(page, letter);
  await expect(async () => {
    await btn.click();
    await expect(btn).toHaveAttribute("aria-pressed", "true", { timeout: 500 });
  }).toPass();
}
