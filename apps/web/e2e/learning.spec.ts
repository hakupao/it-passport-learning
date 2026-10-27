// Stage 7 Phase 1 Task 15 (rewrite of the D-180 Task 12 spec for record v2, D-190) — the learning
// record in the browser, as a non-owner (no /api/learning request may fire, and the route answers a
// non-owner 403 before it touches any store).
//
//   1. Textbook (Stage 7 Phase 3, D-196 §0-4): opening a unit does not mark it read; its 「読了」
//      button does (itp:learn:v2 unitsRead), one-way; the TOC shows the mark on that unit's row only
//      and a reload keeps it.
//   2. Two tabs of one browser on the practice page, both loaded before any answer, answer different
//      questions: both attempts land in itp:learn:v2 (saveLocal merges with what is stored).
//   3. A topic page open in tab A follows an answer made in tab B through the "storage" event, without
//      a reload.
//   4. v1 → v2 (Review Focus 1): an `itp:learn:v1` left by an old tab is upgraded on the today page —
//      itp:learn:v2 appears with its answers as src "1" and a v2Since, the v1 value is byte-identical
//      (never written, copied or removed), and a v1 answer that was wrong yesterday is today's mistake.
//   5. An old tab writing `itp:learn:v1` while a new tab is open: the new tab merges it (storage
//      event) into itp:learn:v2; the v1 value stays as the old tab wrote it.
//   6. /api/learning for a non-owner: GET (v1 / ?v=2) and PUT (v1 body / v2 body) → 403.

import { test, expect, type Page } from "@playwright/test";

import ja from "../messages/ja.json";
import { encodeRecord, emptyRecord } from "../src/lib/learning/record";
import { guardAnthropic } from "./helpers/fakeAnthropic";
import {
  answerChoice as answer,
  fill,
  rawStored,
  seedV1,
  storedAttempts,
  storedV2,
  trackLearningRequests,
  V1_KEY,
  waitForRecord,
  yesterday,
} from "./helpers/learning";

const UNIT_ID = "management-08-25-u01";
const OTHER_UNIT_ID = "management-08-25-u02";
/** technology-14-36 (データ構造, 7 問): q054 keyed イ, q085 keyed ウ. */
const TOPIC = "technology-14-36";
const QA = "2009h21a-q054";
const QB = "2010h22h-q085";

const article = (page: Page) => page.locator("main[data-session] article");

let unhandled: string[] = [];

test.beforeEach(async ({ page }) => {
  unhandled = await guardAnthropic(page);
});

test.afterEach(() => {
  expect(unhandled, "requests to api.anthropic.com").toEqual([]);
});

test("textbook: the 読了 button marks the unit read; the TOC shows it and a reload keeps it", async ({ page }) => {
  const requests = trackLearningRequests(page);
  const unitRow = (id: string) => page.locator(`a[href="/ja/textbook/${id}"]`);
  const readButton = page.locator('main button[data-part="read"]');

  await page.goto("/ja/textbook");
  await expect(unitRow(UNIT_ID)).toHaveCount(1);
  await expect(unitRow(UNIT_ID)).not.toContainText(ja.Textbook.read);

  await page.goto(`/ja/textbook/${UNIT_ID}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(readButton).toBeEnabled(); // the record has loaded
  await expect(readButton).toHaveText(ja.Textbook.readDone);
  expect(Object.keys((await storedV2(page))?.unitsRead ?? {})).toEqual([]); // opening is not reading

  await readButton.click();
  await expect.poll(async () => Object.keys((await storedV2(page))?.unitsRead ?? {})).toEqual([UNIT_ID]);
  await expect(readButton).toBeDisabled();
  await expect(readButton).toContainText(/^✓ 読了 \d{1,2}\/\d{1,2}$/);
  expect(await rawStored(page, V1_KEY)).toBeNull();

  await page.goto("/ja/textbook");
  await expect(unitRow(UNIT_ID)).toContainText(`✓ ${ja.Textbook.read}`);
  await expect(unitRow(OTHER_UNIT_ID)).toHaveCount(1);
  await expect(unitRow(OTHER_UNIT_ID)).not.toContainText(ja.Textbook.read);
  await expect(page.locator("a", { hasText: ja.Textbook.read })).toHaveCount(1);

  await page.goto(`/ja/textbook/${UNIT_ID}`);
  await page.reload();
  await expect(readButton).toBeDisabled();
  await expect(readButton).toContainText("✓ 読了");
  expect(Object.keys((await storedV2(page))?.unitsRead ?? {})).toEqual([UNIT_ID]);
  expect(requests).toEqual([]);
});

test("practice: two open tabs answering different questions both land in itp:learn:v2", async ({ context }) => {
  const url = `/ja/practice?ids=${QA},${QB}`;
  const a = await context.newPage();
  const b = await context.newPage();
  const requests = [a, b].map(trackLearningRequests);
  await a.goto(url);
  await b.goto(url); // both loaded before any answer
  await expect(article(a)).toHaveAttribute("id", QA);
  await expect(article(b)).toHaveAttribute("id", QA);

  await answer(a, "ア"); // QA wrong, in tab A
  await expect.poll(() => storedAttempts(a, QA).then((l) => l.length)).toBe(1);

  // tab B (its own sessionStorage group) skips to QB and answers it
  await expect(async () => {
    await b.keyboard.press("ArrowRight");
    await expect(article(b)).toHaveAttribute("id", QB, { timeout: 500 });
  }).toPass();
  await answer(b, "ウ"); // QB right
  await expect.poll(() => storedAttempts(b, QB).then((l) => l.length)).toBe(1);
  expect(await storedAttempts(b, QA)).toHaveLength(1); // B saved after A: A's answer is still there

  await a.reload();
  await expect(article(a)).toHaveAttribute("id", QA);
  const rec = await storedV2(a);
  expect(Object.keys(rec?.attempts ?? {}).sort()).toEqual([QA, QB].sort());
  expect(rec!.attempts[QA]![0]).toMatchObject({ choice: "ア", correct: false, src: "practice" });
  expect(rec!.attempts[QB]![0]).toMatchObject({ choice: "ウ", correct: true, src: "practice" });
  expect(requests.flat()).toEqual([]);
});

test("topic page: the accuracy follows an answer made in another tab, without a reload", async ({ context }) => {
  const a = await context.newPage();
  const b = await context.newPage();
  const requests = [a, b].map(trackLearningRequests);

  await a.goto(`/ja/practice/browse/${TOPIC}`);
  const acc = a.locator("[data-accuracy]");
  await expect(acc).toHaveAttribute("data-accuracy", "0/0"); // loaded first, so 1/1 can only come from the event
  await expect(acc).toHaveText(ja.Practice.accuracyNone);
  await a.evaluate(() => {
    (window as unknown as { __noReload: number }).__noReload = 1;
  });

  await b.goto(`/ja/practice?ids=${QA}`);
  await answer(b, "イ"); // right

  await expect(acc).toHaveAttribute("data-accuracy", "1/1");
  await expect(acc).toHaveText(fill(ja.Practice.accuracy, { pct: 100, answered: 1 }));
  await expect(a.locator(`[data-question-row="${QA}"] [data-result]`)).toHaveAttribute("data-result", "right");
  expect(await a.evaluate(() => (window as unknown as { __noReload?: number }).__noReload)).toBe(1);
  expect(requests.flat()).toEqual([]);
});

test("v1 → v2: an old tab's itp:learn:v1 is upgraded on the today page; the v1 value is untouched", async ({ page }) => {
  const requests = trackLearningRequests(page);
  const at = yesterday();
  const v1 = JSON.stringify({
    v: 1,
    questions: {
      [QA]: { choice: "ア", correct: false, at }, // wrong yesterday → today's mistake
      [QB]: { choice: "ウ", correct: true, at: at + 1 },
    },
    unitsRead: { [UNIT_ID]: at },
  });
  await seedV1(page, v1);

  await page.goto("/ja");
  await waitForRecord(page);
  await expect.poll(() => rawStored(page, "itp:learn:v2")).not.toBeNull();
  const rec = await storedV2(page);
  expect(rec).not.toBeNull();
  expect(rec!.attempts[QA]).toEqual([{ at, choice: "ア", correct: false, src: "v1" }]);
  expect(rec!.attempts[QB]).toEqual([{ at: at + 1, choice: "ウ", correct: true, src: "v1" }]);
  expect(rec!.unitsRead).toEqual({ [UNIT_ID]: at });
  expect(rec!.v2Since).toEqual(expect.any(Number));
  expect(await rawStored(page, V1_KEY)).toBe(v1); // byte-identical

  // the upgraded record drives the page: not a new user, QA is today's mistake
  await expect(page.locator('[data-empty="tasks"]')).toHaveCount(0);
  await expect(page.locator("[data-answered]")).toHaveAttribute("data-answered", "2/2900");
  await expect(
    page.locator('[data-task="mistakes"]').getByRole("link", { name: fill(ja.Today.title_mistakes, { n: 1 }) }),
  ).toHaveAttribute("href", `/ja/practice?ids=${QA}&from=today&kind=mistakes`);

  await page.reload();
  await waitForRecord(page);
  expect(await rawStored(page, V1_KEY)).toBe(v1);
  expect((await storedV2(page))!.attempts[QA]).toHaveLength(1); // merged once, not duplicated
  expect(requests).toEqual([]);
});

test("v1 → v2: an old tab writing itp:learn:v1 while a new tab is open is merged into itp:learn:v2", async ({
  context,
}) => {
  const fresh = await context.newPage();
  const old = await context.newPage();
  const requests = [fresh, old].map(trackLearningRequests);
  await fresh.goto(`/ja/practice?ids=${QB}`);
  await answer(fresh, "ウ");
  await expect.poll(() => storedAttempts(fresh, QB).then((l) => l.length)).toBe(1);

  // the "old tab": a page of this origin that writes the v1 key as a pre-Stage-7 bundle would
  await old.goto("/ja/glossary");
  const at = Date.now() - 60_000;
  const v1 = JSON.stringify({ v: 1, questions: { [QA]: { choice: "エ", correct: false, at } }, unitsRead: {} });
  await old.evaluate(([k, v]) => localStorage.setItem(k, v), [V1_KEY, v1] as const);

  await expect.poll(() => storedAttempts(fresh, QA)).toEqual([{ at, choice: "エ", correct: false, src: "v1" }]);
  expect(await storedAttempts(fresh, QB)).toHaveLength(1);
  expect(await rawStored(fresh, V1_KEY)).toBe(v1);
  expect(requests.flat()).toEqual([]);
});

test("/api/learning: a non-owner gets 403 for GET and for v1 / v2 PUT bodies", async ({ request }) => {
  expect((await request.get("/api/learning")).status()).toBe(403);
  expect((await request.get("/api/learning?v=2")).status()).toBe(403);
  const v1Body = { v: 1, questions: { [QA]: { choice: "ア", correct: false, at: 1_000 } }, unitsRead: {} };
  expect((await request.put("/api/learning", { data: v1Body })).status()).toBe(403);
  expect((await request.put("/api/learning", { data: encodeRecord(emptyRecord()) })).status()).toBe(403);
});
