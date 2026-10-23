// Stage 7 Phase 1 Task 15 — legacy /quiz links keep working (DESIGN §4, D-190 §0-17, Task 13).
// /[locale]/quiz is a static client redirect page (the `#<question_id>` fragment never reaches the
// server); each shape must land on its practice page, locale kept:
//
//   /quiz#<qid>                         → /practice/q/<qid>            (also with ?mode=exam&id=…, the old
//                                                                         glossary / /sensei link shape)
//   /quiz?mode=topic&id=X&review=1      → /practice/browse/X, the AI 先生 review panel opens; nothing is
//                                          sent (a bookmark writes no click intent; no key is saved either)
//   /quiz?mode=topic&id=X&thread=<date> → /practice/browse/X, that dated review thread opens, nothing sent
//                                          (wins over review=1)
//   /quiz?mode=topic&id=X               → /practice?topic=X&prefill=1  (setup panel, topic pre-selected)
//   /quiz?mode=exam&id=Y                → /practice?exam=Y&prefill=1   (setup panel, exam pre-selected)
//   /quiz                               → /practice/browse
//
// On the topic page the ReviewLauncher strips review / thread from the URL with replaceState once the
// record has loaded, so the final URL is asserted, not the intermediate one. No LLM call (guarded).

import { test, expect, type Page } from "@playwright/test";

import ja from "../messages/ja.json";
import { guardAnthropic } from "./helpers/fakeAnthropic";
import { trackLearningRequests } from "./helpers/learning";

const QID = "2009h21a-q054";
const TOPIC = "technology-14-36"; // データ構造
const EXAM = "2024r06";
const PAST = "2026-01-05";

let unhandled: string[] = [];
let learning: string[] = [];

test.beforeEach(async ({ page }) => {
  unhandled = await guardAnthropic(page);
  learning = trackLearningRequests(page);
});

test.afterEach(() => {
  expect(unhandled, "requests to api.anthropic.com").toEqual([]);
  expect(learning, "/api/learning requests").toEqual([]);
});

const panel = (page: Page) => page.getByRole("dialog");

for (const [label, from, locale] of [
  ["#qid", `/ja/quiz#${QID}`, "ja"],
  ["?mode=exam&id=…#qid", `/ja/quiz?mode=exam&id=2009h21a#${QID}`, "ja"],
  ["#qid (zh)", `/zh/quiz#${QID}`, "zh"],
] as const) {
  test(`legacy ${label} → the single-question page`, async ({ page }) => {
    const res = await page.goto(from);
    expect(res?.status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`/${locale}/practice/q/${QID}$`));
    await expect(page.locator(`article[id="${QID}"]`)).toBeVisible();
  });
}

test("legacy ?mode=topic&id=X&review=1 → the topic page with the review panel open, nothing sent", async ({ page }) => {
  await page.goto(`/ja/quiz?mode=topic&id=${TOPIC}&review=1`);
  await expect(panel(page)).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/ja/practice/browse/${TOPIC}$`));
  await expect(page.locator(`main[data-topic="${TOPIC}"]`)).toBeVisible();
  await expect(panel(page).getByRole("button", { name: ja.Sensei.reviewOpener })).toBeVisible(); // a suggestion
  expect(await page.evaluate(() => sessionStorage.getItem("itp:sensei:review-intent"))).toBeNull();
});

test("legacy ?mode=topic&id=X&thread=<date> → the topic page with that dated thread open (wins over review=1)", async ({
  page,
}) => {
  const anchorId = `${TOPIC}:${PAST}`;
  const id = `review.${encodeURIComponent(anchorId)}`;
  await page.addInitScript(
    ({ id, anchorId }) => {
      if (localStorage.getItem("itp:sensei:index:v1") !== null) return;
      localStorage.setItem(
        "itp:sensei:index:v1",
        JSON.stringify({ v: 1, threads: [{ id, kind: "review", anchorId, title: "データ構造", updatedAt: "2026-01-05T09:00:00.000Z" }] }),
      );
      localStorage.setItem(
        `itp:sensei:thread:${id}:v1`,
        JSON.stringify({
          version: 1,
          updatedAt: "2026-01-05T09:00:00.000Z",
          messages: [
            { id: "u1", role: "user", parts: [{ type: "text", text: "この分野の弱点を復習したい" }] },
            { id: "a1", role: "assistant", parts: [{ type: "text", text: "過去の復習の返答です。" }] },
          ],
        }),
      );
    },
    { id, anchorId },
  );
  await page.goto(`/ja/quiz?mode=topic&id=${TOPIC}&review=1&thread=${PAST}`);
  await expect(panel(page)).toBeVisible();
  await expect(panel(page).getByTestId("sensei-log")).toContainText("過去の復習の返答です。");
  await expect(page).toHaveURL(new RegExp(`/ja/practice/browse/${TOPIC}$`));
});

test("legacy ?mode=topic&id=X → the setup panel with the topic pre-selected", async ({ page }) => {
  await page.goto(`/ja/quiz?mode=topic&id=${TOPIC}`);
  await expect(page).toHaveURL(new RegExp(`/ja/practice\\?topic=${TOPIC}&prefill=1$`));
  const setup = page.locator("main[data-setup]");
  await expect(setup).toBeVisible();
  await expect(setup.locator('input[name="scope"][value="topic"]')).toBeChecked();
  await expect(setup.locator(`[data-topic-input="${TOPIC}"]`)).toBeChecked();
  await expect(setup.locator("[data-topic-input]:checked")).toHaveCount(1);
});

test("legacy ?mode=exam&id=Y → the setup panel with the exam pre-selected", async ({ page }) => {
  await page.goto(`/ja/quiz?mode=exam&id=${EXAM}`);
  await expect(page).toHaveURL(new RegExp(`/ja/practice\\?exam=${EXAM}&prefill=1$`));
  const setup = page.locator("main[data-setup]");
  await expect(setup.locator('input[name="scope"][value="exam"]')).toBeChecked();
  await expect(setup.getByLabel(ja.Practice.examPick)).toHaveValue(EXAM);
});

for (const from of ["/ja/quiz", "/ja/quiz?mode=nope&id=x", "/en/quiz?mode=topic&id=..%2Fx"]) {
  test(`legacy ${from} → the browse page`, async ({ page }) => {
    const locale = from.split("/")[1]!;
    await page.goto(from);
    await expect(page).toHaveURL(new RegExp(`/${locale}/practice/browse$`));
    await expect(page.locator("main[data-browse]")).toBeVisible();
  });
}
