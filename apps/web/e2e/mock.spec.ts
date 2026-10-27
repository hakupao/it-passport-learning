// Stage 7 Phase 2 Task 4 — the mock exam (/[locale]/mock, /mock/run; DESIGN §6.7, D-192, D-193 §0-2〜§0-8).
//
//   1. exam 2025r07: answer 3, mark 1, reload → same question, answers, mark, time left < 120:00
//      (Review Focus 1: resume); 回答見直し shows 3 / 97 / 1; 試験終了 → the in-page confirmation
//      (未回答 97 問) → the result; the answers are in itp:learn:v2 once each, src mock, at = endedAt
//      (unanswered: nothing); the wrong one is in the mistakes book and its single-question history.
//   2. random: the setup's 「ランダム 100 問」 → ?ids= with 100 ids → question 1.
//   3. setup: an unfinished mock is offered (continue / discard); discard brings back the choices.
//   4. expired: page.clock — 121 minutes later the result shows by itself; the attempt is at the
//      deadline (Review Focus 1: expired while away).
//   5. two tabs: A finishes → B shows the result within 3 s; the batch is in the record once
//      (Review Focus 2).
//   6. bad URLs: unknown exam → 404; 99 valid ids → back to /mock (Review Focus 5).
//   7. phone 360 / 390: no horizontal scroll on the exam and the result; 回答見直し has 5 columns.
//
// Fixture keys from data/ip/quiz/questions.json (2025r07: q001 ウ, q002 ウ, q003 イ). Non-owner (no
// /api/learning request); no LLM call (guarded).

import { test, expect, type Page } from "@playwright/test";

import ja from "../messages/ja.json";
import { MOCK_MS } from "../src/lib/mock/mockModel";
import { MOCK_STORAGE_KEY, parseMock, type MockState } from "../src/lib/mock/mockStore";
import { guardAnthropic } from "./helpers/fakeAnthropic";
import {
  answerChoice,
  choiceButton,
  fill,
  rawStored,
  storedAttempts,
  storedV2,
  trackLearningRequests,
  waitForRecord,
} from "./helpers/learning";

const M = ja.Mock;
const EXAM = "2025r07";
const RUN = `/ja/mock/run?exam=${EXAM}`;
const Q = (n: number): string => `${EXAM}-q${String(n).padStart(3, "0")}`;

const run = (page: Page) => page.locator("main[data-mock-run]");
const qno = (page: Page) => page.locator("main article [data-qno]");
const result = (page: Page) => page.locator("[data-mock-result]");

async function storedMock(page: Page): Promise<MockState | null> {
  return parseMock(await rawStored(page, MOCK_STORAGE_KEY));
}

/** Every stored attempt with src mock, as [qid, at]. */
async function mockAttempts(page: Page): Promise<[string, number][]> {
  const r = await storedV2(page);
  if (!r) return [];
  return Object.entries(r.attempts).flatMap(([qid, list]) =>
    list.filter((a) => a.src === "mock").map((a) => [qid, a.at] as [string, number]),
  );
}

async function finish(page: Page): Promise<void> {
  await page.locator("[data-finish]").click();
  await expect(page.locator("[data-confirm]")).toBeVisible();
  await page.locator("[data-confirm-yes]").click();
  await expect(result(page)).toBeVisible();
}

let unhandled: string[] = [];

test.beforeEach(async ({ page }) => {
  unhandled = await guardAnthropic(page);
});

test.afterEach(() => {
  expect(unhandled, "requests to api.anthropic.com").toEqual([]);
});

test("mock exam 2025r07: answer, mark, reload resumes, 回答見直し, confirm, result, record once", async ({ page }) => {
  const learning = trackLearningRequests(page);
  await page.goto(RUN);
  await expect(run(page)).toBeVisible();
  await expect(qno(page)).toHaveAttribute("data-qno", "1");

  // q001 (keyed ウ): ア, wrong — nothing on the page says so
  await answerChoice(page, "ア");
  await expect(page.locator('main article li[data-letter="ア"]')).toHaveAttribute("data-state", "picked");
  await expect(page.locator("main article")).not.toContainText("○");
  await expect(page.locator("main article")).not.toContainText("×");
  await answerChoice(page, "イ"); // re-pick allowed
  await answerChoice(page, "ア");
  await expect(choiceButton(page, "イ")).toHaveAttribute("aria-pressed", "false");

  await page.locator('[data-nav="next"]').click();
  await expect(qno(page)).toHaveAttribute("data-qno", "2");
  await answerChoice(page, "ウ"); // q002 keyed ウ
  await page.locator('[data-nav="next"]').click();
  await expect(qno(page)).toHaveAttribute("data-qno", "3");
  await answerChoice(page, "イ"); // q003 keyed イ
  await page.locator("[data-flag]").check();
  await expect(page.locator("[data-flag]")).toBeChecked();

  // reload: same question, same answers and mark, time keeps running from startedAt
  const before = (await storedMock(page))!;
  await page.reload();
  await expect(run(page)).toBeVisible();
  await expect(qno(page)).toHaveAttribute("data-qno", "3");
  await expect(choiceButton(page, "イ")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-flag]")).toBeChecked();
  const after = (await storedMock(page))!;
  expect(after.startedAt).toBe(before.startedAt);
  expect(after.answers).toEqual({ [Q(1)]: "ア", [Q(2)]: "ウ", [Q(3)]: "イ" });
  expect(after.flagged).toEqual([Q(3)]);
  await expect(async () => {
    const left = (await page.locator("[data-timer]").textContent()) ?? "";
    expect(left).toMatch(/^\d{2,3}:\d{2}$/);
    expect(left < "120:00").toBe(true);
  }).toPass();
  await page.locator('[data-nav="prev"]').click();
  await expect(qno(page)).toHaveAttribute("data-qno", "2");
  await expect(choiceButton(page, "ウ")).toHaveAttribute("aria-pressed", "true");

  // 回答見直し: 3 answered / 97 unanswered / 1 marked; a cell jumps to its question
  await page.locator("[data-review-toggle]").click();
  const review = page.locator("[data-review]");
  await expect(review.locator("[data-count-answered]")).toHaveAttribute("data-count-answered", "3");
  await expect(review.locator("[data-count-unanswered]")).toHaveAttribute("data-count-unanswered", "97");
  await expect(review.locator("[data-count-flagged]")).toHaveAttribute("data-count-flagged", "1");
  await expect(review.locator('[data-answered="true"]')).toHaveCount(3);
  await expect(review.locator('[data-flagged="true"]')).toHaveCount(1);
  await review.locator('[data-cell="3"]').click();
  await expect(qno(page)).toHaveAttribute("data-qno", "3");

  // 試験終了: in-page confirmation (no dialog), 戻る keeps the exam, then end it
  await page.locator("[data-finish]").click();
  await expect(page.locator("[data-confirm]")).toContainText(fill(M.confirmUnanswered, { n: 97 }));
  await expect(page.locator('dialog[open], [role="dialog"], [role="alertdialog"]')).toHaveCount(0);
  await page.getByRole("button", { name: M.confirmNo }).click();
  await expect(page.locator("[data-confirm]")).toHaveCount(0);
  await finish(page);

  await expect(page.getByRole("heading", { level: 1, name: M.resultTitle })).toBeVisible();
  await expect(result(page).locator("[data-total]")).toHaveAttribute("data-total", "20"); // 2 / 100
  await expect(result(page)).toContainText(M.failed);
  await expect(result(page).locator("[data-result-row]")).toHaveCount(100);
  await expect(result(page).locator(`[data-result-row="${Q(1)}"]`)).toHaveAttribute("data-result", "wrong");
  await expect(result(page).locator(`[data-result-row="${Q(2)}"]`)).toHaveAttribute("data-result", "right");
  await expect(result(page).locator(`[data-result-row="${Q(4)}"]`)).toHaveAttribute("data-result", "none");
  await expect(result(page).locator(`[data-result-row="${Q(1)}"] a`)).toHaveAttribute("href", `/ja/practice/q/${Q(1)}`);

  // the record: the 3 answered, once each, src mock, at = endedAt; unanswered nothing
  await expect.poll(async () => (await storedMock(page))?.recorded).toBe(true);
  const ended = (await storedMock(page))!;
  await expect.poll(async () => (await mockAttempts(page)).length).toBe(3);
  expect((await mockAttempts(page)).sort()).toEqual([
    [Q(1), ended.endedAt],
    [Q(2), ended.endedAt],
    [Q(3), ended.endedAt],
  ]);
  expect(await storedAttempts(page, Q(1))).toEqual([{ at: ended.endedAt, choice: "ア", correct: false, src: "mock" }]);
  expect(await storedAttempts(page, Q(4))).toEqual([]);

  // a reload of the result shows it again, still recorded once
  await page.reload();
  await expect(result(page)).toBeVisible();
  expect((await mockAttempts(page)).length).toBe(3);

  // 今日に戻る; the wrong answer is in the mistakes book and in the question's history
  await result(page).getByRole("link", { name: M.backToday }).click();
  await expect(page).toHaveURL(/\/ja$/);
  await page.goto("/ja/practice/mistakes");
  await waitForRecord(page);
  await expect(page.locator(`[data-mistake-row="${Q(1)}"]`)).toHaveCount(1);
  await expect(page.locator(`[data-mistake-row="${Q(2)}"]`)).toHaveCount(0);
  await page.goto(`/ja/practice/q/${Q(1)}`);
  await waitForRecord(page);
  await expect(page.locator(`[data-history-at="${ended.endedAt}"]`)).toHaveCount(1);

  // today's mistakes row takes a mistake from the next day (Phase 1 §0-6): tomorrow noon it is there
  const now = new Date();
  await page.clock.setFixedTime(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0));
  await page.goto("/ja");
  await waitForRecord(page);
  await expect(page.locator('[data-task="mistakes"] a').first()).toHaveAttribute(
    "href",
    new RegExp(`ids=[^&]*${Q(1)}[^&]*&from=today&kind=mistakes`),
  );
  expect(learning).toEqual([]);
});

test("mock random: 「ランダム 100 問」 → ?ids= with 100 ids → question 1", async ({ page }) => {
  await page.goto("/ja/mock");
  const btn = page.locator("[data-start-random]");
  await expect(btn).toBeEnabled();
  await btn.click();
  await expect(page).toHaveURL(/\/ja\/mock\/run\?ids=/);
  const ids = new URL(page.url()).searchParams.get("ids")!.split(",");
  expect(ids).toHaveLength(100);
  expect(new Set(ids).size).toBe(100);
  await expect(run(page)).toBeVisible();
  await expect(qno(page)).toHaveAttribute("data-qno", "1");
  await expect(page.locator("main article")).toHaveAttribute("id", ids[0]!);
});

test("mock setup: an unfinished mock is offered (continue / discard)", async ({ page }) => {
  await page.goto(RUN);
  await answerChoice(page, "ア");
  await page.goto("/ja/mock");
  const resume = page.locator("[data-resume-link]");
  await expect(resume).toHaveText(fill(M.resume, { min: 120 }));
  await expect(page.locator("[data-start-random]")).toHaveCount(0);
  await resume.click();
  await expect(run(page)).toBeVisible();
  await expect(choiceButton(page, "ア")).toHaveAttribute("aria-pressed", "true");

  await page.goto("/ja/mock");
  await page.locator("[data-discard-running]").click();
  await expect(page.locator("[data-start-random]")).toBeVisible();
  await expect(page.locator(`[data-start-exam="${EXAM}"]`)).toBeVisible();
  expect(await rawStored(page, MOCK_STORAGE_KEY)).toBeNull();
});

test("mock expired: 121 minutes later the result shows by itself; recorded at the deadline", async ({ page }) => {
  await page.clock.install();
  await page.goto(RUN);
  await answerChoice(page, "ウ"); // q001 keyed ウ
  const started = (await storedMock(page))!.startedAt;
  await page.clock.fastForward(121 * 60_000);
  await expect(result(page)).toBeVisible();
  await expect.poll(async () => (await storedMock(page))?.recorded).toBe(true);
  expect((await storedMock(page))!.endedAt).toBe(started + MOCK_MS);
  expect(await storedAttempts(page, Q(1))).toEqual([{ at: started + MOCK_MS, choice: "ウ", correct: true, src: "mock" }]);
});

test("mock two tabs: A finishes → B shows the result within 3 s; the batch is recorded once", async ({ context }) => {
  const a = await context.newPage();
  const b = await context.newPage();
  const ua = await guardAnthropic(a);
  const ub = await guardAnthropic(b);
  await a.goto(RUN);
  await answerChoice(a, "ア");
  await a.locator('[data-nav="next"]').click();
  await answerChoice(a, "ウ");
  await b.goto(RUN);
  await expect(run(b)).toBeVisible();
  await expect(qno(b)).toHaveAttribute("data-qno", "2"); // resumed A's mock
  await waitForRecord(b);

  await finish(a);
  await expect(result(b)).toBeVisible({ timeout: 3_000 });
  await expect.poll(async () => (await storedMock(a))?.recorded).toBe(true);
  await b.waitForTimeout(1_500); // give B every chance to write a second batch
  const ended = (await storedMock(a))!.endedAt;
  for (const p of [a, b]) {
    expect((await mockAttempts(p)).sort()).toEqual([
      [Q(1), ended],
      [Q(2), ended],
    ]);
  }
  expect([...ua, ...ub]).toEqual([]);
});

test("mock bad URLs: unknown exam → 404; 99 valid ids → back to /mock", async ({ page }) => {
  const res = await page.goto("/ja/mock/run?exam=1999h11a");
  expect(res?.status()).toBe(404);
  const ids = Array.from({ length: 99 }, (_, i) => Q(i + 1)).join(",");
  await page.goto(`/ja/mock/run?ids=${ids},9999x-q001`);
  await expect(page).toHaveURL(/\/ja\/mock$/);
  await expect(page.locator("[data-mock-setup]")).toBeVisible();
});

for (const width of [360, 390]) {
  test(`mock phone ${width}px: no horizontal scroll on the exam and the result; 回答見直し has 5 columns`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 360 ? 800 : 844 });
    await page.goto(RUN);
    await answerChoice(page, "ア");
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

    await page.locator("[data-review-toggle]").click();
    const cols = await page
      .locator("[data-review-grid]")
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length);
    expect(cols).toBe(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

    await finish(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

// ---- fix round 1 ----

/** Write the other tab's finished + recorded state of this page's mock behind its back (no storage event here). */
async function writeOtherTabsFinish(page: Page): Promise<MockState> {
  const mine = (await storedMock(page))!;
  const other: MockState = { ...mine, answers: { [Q(1)]: "ウ" }, endedAt: mine.startedAt + 60_000, recorded: true };
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [MOCK_STORAGE_KEY, JSON.stringify(other)] as const);
  return other;
}

test("mock missed event: the deadline tick does not overwrite another tab's finished + recorded state", async ({ page }) => {
  await page.clock.install();
  await page.goto(RUN);
  await answerChoice(page, "ア");
  const other = await writeOtherTabsFinish(page);
  await page.clock.fastForward(121 * 60_000);
  await expect(result(page)).toBeVisible();
  await page.waitForTimeout(500);
  expect(await storedMock(page)).toEqual(other); // adopted, not overwritten
  expect(await mockAttempts(page)).toEqual([]); // the other tab's batch is its own; this tab writes none
});

test("mock missed event: a manual finish adopts another tab's finished + recorded state", async ({ page }) => {
  await page.goto(RUN);
  await answerChoice(page, "ア");
  const other = await writeOtherTabsFinish(page);
  await finish(page);
  await page.waitForTimeout(500);
  expect(await storedMock(page)).toEqual(other);
  expect(await mockAttempts(page)).toEqual([]);
});

test("mock closed and reopened after the deadline: /mock offers only the result; recorded once at the deadline", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(RUN);
  await answerChoice(page, "ウ"); // q001 keyed ウ
  const started = (await storedMock(page))!.startedAt;
  await page.goto("/ja/settings"); // the exam page is gone
  await page.clock.fastForward(121 * 60_000);

  await page.goto("/ja/mock");
  const link = page.locator("[data-resume-link]");
  await expect(link).toHaveText(M.resumeResult);
  // its answers must reach the record: 結果を見る first, discard only behind a confirmation
  await expect(page.locator("[data-discard-running]")).toHaveCount(0);
  await expect(page.locator("[data-discard-confirm]")).toHaveCount(0);
  await expect(page.locator("[data-start-random]")).toHaveCount(0);
  await link.click();
  await expect(result(page)).toBeVisible();
  await expect.poll(async () => (await storedMock(page))?.recorded).toBe(true);
  expect(await mockAttempts(page)).toEqual([[Q(1), started + MOCK_MS]]);

  await page.goto(RUN); // the run URL again: the result, still recorded once
  await expect(result(page)).toBeVisible();
  await page.waitForTimeout(500);
  expect(await mockAttempts(page)).toEqual([[Q(1), started + MOCK_MS]]);
});

test("mock record write fails (storage full): not marked recorded; the next open records it once (OQ-12 M-1)", async ({
  page,
}) => {
  // setItem on the learning key throws while the flag is set (the mock key still writes)
  await page.addInitScript(() => {
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === "itp:learn:v2" && this.getItem("e2e:block-learn") === "1") {
        throw new DOMException("full", "QuotaExceededError");
      }
      return set.call(this, key, value);
    };
  });
  await page.goto(RUN);
  await page.evaluate(() => localStorage.setItem("e2e:block-learn", "1"));
  await answerChoice(page, "ウ"); // q001 keyed ウ
  await finish(page);
  await page.waitForTimeout(500);
  const ended = (await storedMock(page))!;
  expect(ended.endedAt).not.toBeNull();
  expect(ended.recorded).toBe(false);
  expect(await mockAttempts(page)).toEqual([]);

  await page.evaluate(() => localStorage.removeItem("e2e:block-learn"));
  await page.reload();
  await expect(result(page)).toBeVisible();
  await expect.poll(async () => (await storedMock(page))?.recorded).toBe(true);
  expect(await mockAttempts(page)).toEqual([[Q(1), ended.endedAt]]);
});

test("mock: opening another mock while one owes its record goes to that one first", async ({ page }) => {
  await page.clock.install();
  await page.goto(RUN);
  await answerChoice(page, "ウ");
  const started = (await storedMock(page))!.startedAt;
  await page.goto("/ja/settings");
  await page.clock.fastForward(121 * 60_000);

  await page.goto("/ja/mock/run?exam=2024r06");
  await expect(page).toHaveURL(new RegExp(`exam=${EXAM}$`));
  await expect(result(page)).toBeVisible();
  await expect.poll(async () => (await storedMock(page))?.recorded).toBe(true);
  expect(await mockAttempts(page)).toEqual([[Q(1), started + MOCK_MS]]);

  await page.goto("/ja/mock/run?exam=2024r06"); // recorded now: the new mock starts
  await expect(run(page)).toBeVisible();
  expect((await storedMock(page))!.examId).toBe("2024r06");
});

// ---- fix round 2: an owed save that cannot be opened any more ----

const HOUR = 3_600_000;

/** Seed itp:mock:v1 (only while absent) with a mock that started 3 h ago and was never recorded. */
async function seedOwed(page: Page, kind: "exam" | "random", examId: string | null, ids: string[]): Promise<void> {
  const s: MockState = {
    v: 1,
    kind,
    examId,
    ids,
    answers: { [ids[0]!]: "ア" },
    flagged: [],
    pos: 0,
    startedAt: Date.now() - 3 * HOUR,
    endedAt: null,
    recorded: false,
  };
  await page.addInitScript(
    ([k, v]) => {
      if (localStorage.getItem(k) === null) localStorage.setItem(k, v);
    },
    [MOCK_STORAGE_KEY, JSON.stringify(s)] as const,
  );
}

test("mock owed save whose ids no longer match its exam: no redirect loop; confirmed discard starts the mock", async ({
  page,
}) => {
  const stale = Array.from({ length: 100 }, (_, i) => Q(100 - i)); // 2025r07 in reverse: not examMockIds' order
  await seedOwed(page, "exam", EXAM, stale);
  await page.goto("/ja/mock/run?exam=2024r06"); // another mock → goes to the owed one's URL once
  await expect(page).toHaveURL(new RegExp(`exam=${EXAM}$`));
  await expect(page.locator("[data-unopenable]")).toBeVisible();
  const url = page.url();
  await page.waitForTimeout(3_000);
  expect(page.url()).toBe(url); // stable: never redirects to itself
  await expect(page.locator("[data-unopenable]")).toBeVisible();

  await page.locator("[data-discard]").click();
  await expect(page.locator("[data-discard-confirm]")).toContainText(M.discardWarn);
  await expect(page.locator('dialog[open], [role="dialog"], [role="alertdialog"]')).toHaveCount(0);
  await page.locator("[data-discard-yes]").click();
  await expect(run(page)).toBeVisible();
  await expect(qno(page)).toHaveAttribute("data-qno", "1");
  const s = (await storedMock(page))!;
  expect(s.examId).toBe(EXAM);
  expect(s.ids[0]).toBe(Q(1));
  expect(s.answers).toEqual({});
  expect(await mockAttempts(page)).toEqual([]);
});

test("mock owed save of an unknown exam: /mock offers 結果を見る and a confirmed discard that works", async ({ page }) => {
  await seedOwed(page, "exam", "1999h11a", ["1999h11a-q001", "1999h11a-q002"]);
  await page.goto("/ja/mock");
  await expect(page.locator("[data-resume-link]")).toHaveText(M.resumeResult);
  await expect(page.locator("[data-start-random]")).toHaveCount(0);
  await page.locator("[data-discard]").click();
  await expect(page.locator("[data-discard-confirm]")).toContainText(M.discardWarn);
  await page.getByRole("button", { name: M.discardNo }).click(); // cancel keeps it
  await expect(page.locator("[data-discard-confirm]")).toHaveCount(0);
  expect(await rawStored(page, MOCK_STORAGE_KEY)).not.toBeNull();
  await page.locator("[data-discard]").click();
  await page.locator("[data-discard-yes]").click();
  await expect(page.locator("[data-start-random]")).toBeVisible();
  expect(await rawStored(page, MOCK_STORAGE_KEY)).toBeNull();
});

test("mock setup: 破棄 of a running mock that ran out while /mock sat open goes to the owed view", async ({ page }) => {
  await page.clock.install();
  await page.goto(RUN);
  await answerChoice(page, "ア");
  await page.goto("/ja/mock");
  await expect(page.locator("[data-discard-running]")).toBeVisible();
  await page.clock.fastForward(121 * 60_000);
  await page.locator("[data-discard-running]").click();
  await expect(page.locator("[data-resume-link]")).toHaveText(M.resumeResult);
  await expect(page.locator("[data-discard-running]")).toHaveCount(0);
  expect(await storedMock(page)).not.toBeNull(); // not discarded
});

// ---- final fix I-2: a different mock still in progress is never overwritten silently ----

/** Write itp:mock:v1 behind the page's back (another tab; no storage event in this page). */
async function writeMock(page: Page, s: MockState): Promise<void> {
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [MOCK_STORAGE_KEY, JSON.stringify(s)] as const);
}

const running = (examId: string, ids: string[]): MockState => ({
  v: 1,
  kind: "exam",
  examId,
  ids,
  answers: { [ids[0]!]: "イ" },
  flagged: [],
  pos: 0,
  startedAt: Date.now(),
  endedAt: null,
  recorded: false,
});

test("mock: opening another mock while one is in progress shows a notice; resume returns; confirmed discard starts it", async ({
  page,
}) => {
  await page.goto(RUN);
  await answerChoice(page, "ア");
  const a = (await storedMock(page))!;

  await page.goto("/ja/mock/run?exam=2024r06");
  await expect(page.locator("[data-busy]")).toContainText(M.busy);
  await expect(run(page)).toHaveCount(0);
  await page.waitForTimeout(500);
  expect(await storedMock(page)).toEqual(a); // A's answers intact

  await page.locator("[data-busy-resume]").click();
  await expect(page).toHaveURL(new RegExp(`exam=${EXAM}$`));
  await expect(run(page)).toBeVisible();
  await expect(choiceButton(page, "ア")).toHaveAttribute("aria-pressed", "true");

  await page.goto("/ja/mock/run?exam=2024r06");
  await expect(page.locator("[data-busy]")).toBeVisible();
  await page.locator("[data-discard]").click();
  await expect(page.locator("[data-discard-confirm]")).toContainText(M.discardWarn);
  await page.locator("[data-discard-yes]").click();
  await expect(run(page)).toBeVisible();
  const b = (await storedMock(page))!;
  expect(b.examId).toBe("2024r06");
  expect(b.answers).toEqual({});
  expect(await mockAttempts(page)).toEqual([]);
});

test("mock: the in-progress notice's discard re-reads storage — a newer mock there is not removed", async ({ page }) => {
  await page.goto(RUN);
  await answerChoice(page, "ア");
  await page.goto("/ja/mock/run?exam=2024r06");
  await expect(page.locator("[data-busy]")).toBeVisible();
  await page.locator("[data-discard]").click();
  const c = running("2023r05", ["2023r05-q001", "2023r05-q002"]);
  await writeMock(page, c); // another tab started mock C meanwhile
  await page.locator("[data-discard-yes]").click();
  await expect(page.locator("[data-busy]")).toBeVisible();
  await expect(page.locator("[data-busy-resume]")).toHaveAttribute("href", /exam=2023r05$/);
  expect(await storedMock(page)).toEqual(c);
});

test("mock setup: start re-reads storage — a mock started meanwhile in another tab is offered, not removed", async ({
  page,
}) => {
  await page.goto("/ja/mock");
  await expect(page.locator(`[data-start-exam="${EXAM}"]`)).toBeVisible();
  const c = running("2023r05", ["2023r05-q001", "2023r05-q002"]);
  await writeMock(page, c);
  await page.locator(`[data-start-exam="${EXAM}"]`).click();
  await expect(page.locator("[data-resume-link]")).toHaveText(fill(M.resume, { min: 120 }));
  await expect(page).toHaveURL(/\/ja\/mock$/);
  expect(await storedMock(page)).toEqual(c);
});

test("mock setup: the owed save's confirmed discard re-reads storage — a different mock there is not removed", async ({
  page,
}) => {
  await seedOwed(page, "exam", "1999h11a", ["1999h11a-q001", "1999h11a-q002"]);
  await page.goto("/ja/mock");
  await page.locator("[data-discard]").click();
  const c = running("2023r05", ["2023r05-q001", "2023r05-q002"]);
  await writeMock(page, c);
  await page.locator("[data-discard-yes]").click();
  await expect(page.locator("[data-discard-running]")).toBeVisible();
  await expect(page.locator("[data-resume-link]")).toHaveText(fill(M.resume, { min: 120 }));
  expect(await storedMock(page)).toEqual(c);
});
