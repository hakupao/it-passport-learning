// D-181 Task A4 — the quiz 「AI 先生に聞く」 entry and the AI 先生 panel, against a
// fake Anthropic API (helpers/fakeAnthropic.ts). No test reaches the real API:
// a beforeEach guard routes every request to api.anthropic.com in EVERY test; a
// request the fake does not answer (or any request in a test without the fake)
// is recorded and aborted, and each test ends by asserting that list is empty.
//
// Covered:
//   1. The button appears only after answering; no key → KeySettings in the
//      panel and Send disabled while the typed question stays; save the key →
//      ask → 「考え中…」 then the reply; the request carries the key header, the
//      browser-access header and the question anchor (#id, 正解, the learner's
//      choice) in `system`; markdown links obey §0-7; Esc closes and focus
//      returns to the button; after a reload the same choice reopens the same
//      thread, another choice opens a fresh one (§0-4); the key is in no
//      localStorage value but its own key and no /api/learning request is
//      made (non-owner); no CSP violation with the panel open.
//   2. Layout: full-screen drawer at phone width, right drawer when wide.
//   3. 401 → 「key が無効です」, settings open, the question back in the input;
//      re-sending after a fix sends that question once (the failed turn is dropped);
//      a later 401 turn is not persisted (after a reload the thread holds only the
//      successful turn).
//   4. Refusal → the refusal notice, the question back in the input; a refused turn
//      is not persisted (after a reload the thread holds only the successful turn).
//   5. Clear while a reply is in flight → reload → the thread is empty. This checks
//      the visible result only: the fake holds the whole response (see
//      helpers/fakeAnthropic.ts), so the clear lands before any chunk. The race of a
//      chunk arriving after the clear is proven by the threadChat unit test
//      ("clearThread() while streaming …"), not here.
//   6. Switch to another question's panel while the first reply is in flight →
//      each thread keeps only its own messages and its own title in the index.
//   7. (only with E2E_OWNER_KEY, local server — see learning-owner.spec.ts) the
//      owner's /api/learning PUT bodies never contain the key.
//   8. /sensei key settings: how to get a key (console link) while none is saved;
//      save shows only "…" + the last 4 ("…" alone for a short key), survives a
//      reload, delete clears it; a refused storage write keeps the typed key and
//      shows the failure notice; the free-question input is disabled (近日公開).
//   9. /sensei thread list: threads made on the quiz page, newest first, each
//      linking to /quiz?mode=exam&id=<exam_id>#<question_id>; delete removes the
//      row and its storage; the empty state once none is left.
//  10. Navigation: each of the three shells shows the AI 先生 item → /ja/sensei.
//  11. Phone width (390×844), each shell × each locale × each nav page: no
//      horizontal page scroll, both switchers (theme, locale) inside the viewport,
//      the current page's tab scrolled into view inside its nav row (page not
//      scrolled), an overflowing row marked for the edge fade; Tab onto the last
//      nav item keeps it inside the row with its focus ring drawn inside its box.
//
// Runs against a local prod build (the production CSP is then active, so a
// request to api.anthropic.com also proves connect-src allows it):
//   npm run build && npx next start -p 3200
//   PLAYWRIGHT_BASE_URL=http://localhost:3200 npx playwright test e2e/sensei.spec.ts --retries=0

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { test, expect, type Locator, type Page } from "@playwright/test";

import en from "../messages/en.json";
import ja from "../messages/ja.json";
import zh from "../messages/zh.json";
import { termId } from "../src/lib/glossary/termId";
import { fakeAnthropic, guardAnthropic, type FakeAnthropic, type FakeRequest } from "./helpers/fakeAnthropic";

const S = ja.Sensei;
const KEY = "sk-ant-test-0000000000000000wxyz";
const KEY_STORAGE = "itp:sensei:key:v1";
const OWNER_KEY = process.env.E2E_OWNER_KEY ?? "";

/** quiz_index.json → technology-14-36 (データ構造, 7 問): 2009h21a-q054 keyed イ, 2011h23tokubetsu-q058 keyed イ. */
const SET_URL = "/ja/quiz?mode=topic&id=technology-14-36";
const Q1 = "2009h21a-q054";
const Q2 = "2011h23tokubetsu-q058";
/** questions.json source_label (the thread title in the index). */
const Q1_LABEL = "平成21年度 秋期 ITパスポート試験 問54";
const Q2_LABEL = "平成23年度 特別試験 ITパスポート試験 問58";
const REPLY_MARK = "後入れ先出し（LIFO）です。";

const threadKey = (anchorId: string) => `itp:sensei:thread:question.${encodeURIComponent(anchorId)}:v1`;
const card = (page: Page, id: string) => page.locator(`article[id="${id}"]`);
/** ア = 0, イ = 1, … */
const choice = (page: Page, id: string, i: number) =>
  card(page, id).getByRole("listitem").getByRole("button").nth(i);
const askButton = (page: Page, id: string) => card(page, id).getByRole("button", { name: S.askButton });
const panel = (page: Page) => page.getByRole("dialog");
const log = (page: Page) => panel(page).getByTestId("sensei-log");
const input = (page: Page) => panel(page).getByLabel(S.inputLabel);

declare global {
  interface Window {
    __cspViolations?: string[];
  }
}

async function presetKey(page: Page): Promise<void> {
  await page.addInitScript(
    ([k, key]) =>
      localStorage.setItem(k, JSON.stringify({ provider: "anthropic", apiKey: key, savedAt: "2026-10-01T00:00:00.000Z" })),
    [KEY_STORAGE, KEY] as const,
  );
}

async function openPanel(page: Page, id: string, choiceIndex: number | "reveal"): Promise<void> {
  if (choiceIndex === "reveal") await card(page, id).getByRole("button", { name: ja.Quiz.showAnswer }).click();
  else await choice(page, id, choiceIndex).click();
  await askButton(page, id).click();
  await expect(panel(page)).toBeVisible();
}

async function ask(page: Page, text: string): Promise<void> {
  await input(page).fill(text);
  await panel(page).getByRole("button", { name: S.send }).click();
}

/** The text of each stored message of a thread, as "role:text". */
async function storedTexts(page: Page, anchorId: string): Promise<string[] | null> {
  const raw = await page.evaluate((k) => localStorage.getItem(k), threadKey(anchorId));
  if (raw === null) return null;
  const env = JSON.parse(raw) as { messages: { role: string; parts: { type: string; text?: string }[] }[] };
  return env.messages.flatMap((m) => {
    const text = m.parts.map((p) => (p.type === "text" ? (p.text ?? "") : "")).join("");
    return text === "" ? [] : [`${m.role}:${text}`];
  });
}

/** Set by each test that installs the fake. */
let fake: FakeAnthropic | undefined;
/** Requests to api.anthropic.com that reached the guard (fresh per test). */
let unhandled: string[] = [];

test.beforeEach(async ({ page }) => {
  fake = undefined;
  unhandled = await guardAnthropic(page);
});

test.afterEach(() => {
  expect(unhandled, "requests to api.anthropic.com not answered by the fake").toEqual([]);
});

test("ask about an answered question: key setup, streamed reply, anchor in system, thread kept per choice", async ({
  page,
}) => {
  fake = await fakeAnthropic(page, { mode: "ok", delayMs: 1500 });
  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener("securitypolicyviolation", (e) => {
      window.__cspViolations?.push(`${e.effectiveDirective} ${e.blockedURI}`);
    });
  });
  const consoleCsp: string[] = [];
  page.on("console", (msg) => {
    if (/Content[- ]Security[- ]Policy|unsafe-eval/i.test(msg.text())) consoleCsp.push(msg.text());
  });
  const learning: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/learning")) learning.push(`${r.method()} ${r.postData() ?? ""}`);
  });

  await page.goto(SET_URL);
  await expect(card(page, Q1)).toBeVisible();
  await expect(askButton(page, Q1)).toHaveCount(0); // not before answering

  await openPanel(page, Q1, 1); // イ — correct
  const p = panel(page);
  await expect(p.getByTestId("sensei-key-missing")).toBeVisible();
  await expect(p.getByTestId("sensei-key-settings")).toBeVisible();
  await input(page).fill("なぜイが正解なのですか？");
  await expect(p.getByRole("button", { name: S.send })).toBeDisabled();

  await p.getByLabel(S.keyLabel).fill(KEY);
  await p.getByRole("button", { name: S.keySave }).click();
  await expect(p.getByTestId("sensei-key-settings")).toHaveCount(0); // hasKey refreshed in the same tab
  await expect(input(page)).toHaveValue("なぜイが正解なのですか？");

  await p.getByRole("button", { name: S.send }).click();
  await expect(p.getByTestId("sensei-thinking")).toHaveText(S.thinking);
  await expect(p.getByRole("button", { name: S.stop })).toBeVisible();
  await expect(log(page)).toContainText(REPLY_MARK);
  await expect(p.getByTestId("sensei-thinking")).toHaveCount(0);
  await expect(log(page)).toHaveAttribute("aria-live", "polite");

  // the request: key + browser-direct header, the question anchor in `system`
  expect(fake.requests).toHaveLength(1);
  const req = fake.requests[0]!;
  expect(req.headers["x-api-key"]).toBe(KEY);
  expect(req.headers["anthropic-dangerous-direct-browser-access"]).toBe("true");
  expect(req.body.model).toBe("claude-sonnet-5-5");
  const system = JSON.stringify(req.body.system);
  expect(system).toContain(`問題 ID: #${Q1}`);
  expect(system).toContain("正解: イ");
  expect(system).toContain("学習者の解答: イ（正解）");
  expect(JSON.stringify(req.body.messages)).toContain("なぜイが正解なのですか？");

  // §0-7 links: https opens a new tab, javascript: loses its href, site-relative stays
  const external = log(page).locator("a", { hasText: "外部資料" });
  await expect(external).toHaveAttribute("href", "https://example.com/a");
  await expect(external).toHaveAttribute("target", "_blank");
  await expect(external).toHaveAttribute("rel", "noopener noreferrer");
  expect(await log(page).locator("a", { hasText: "危険なリンク" }).getAttribute("href")).toBeNull();
  await expect(log(page).locator("a", { hasText: "辞典" })).toHaveAttribute("href", "/ja/glossary");
  await expect(log(page).locator("strong", { hasText: "結論" })).toBeVisible();
  await expect(log(page).locator("table td", { hasText: "LIFO" })).toBeVisible(); // GFM table

  // Esc closes; focus returns to the button
  await page.keyboard.press("Escape");
  await expect(panel(page)).toHaveCount(0);
  await expect(askButton(page, Q1)).toBeFocused();
  expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
  expect(consoleCsp).toEqual([]);

  // reload: the same choice reopens the same thread
  await page.reload();
  await openPanel(page, Q1, 1);
  await expect(log(page)).toContainText("なぜイが正解なのですか？");
  await expect(log(page)).toContainText(REPLY_MARK);

  // the key is in no localStorage value except its own key; no /api/learning traffic
  const stored = await page.evaluate(() =>
    Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k) ?? ""])),
  );
  expect(Object.keys(stored)).toEqual(expect.arrayContaining([KEY_STORAGE, "itp:sensei:index:v1", threadKey(`${Q1}:イ`)]));
  for (const [k, v] of Object.entries(stored)) {
    if (k !== KEY_STORAGE) expect(v, k).not.toContain(KEY);
  }
  expect(learning).toEqual([]);

  // another choice (ア) is another thread (§0-4)
  await page.keyboard.press("Escape");
  await page.reload();
  await openPanel(page, Q1, 0);
  await expect(log(page)).toContainText(S.emptyHint);
  await expect(log(page)).not.toContainText("なぜイが正解なのですか？");
  expect(fake.requests).toHaveLength(1);
});

test("panel layout: full-screen drawer on a phone, right drawer when wide", async ({ page }) => {
  fake = await fakeAnthropic(page);
  await presetKey(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(SET_URL);
  await openPanel(page, Q1, "reveal");
  const phone = await panel(page).boundingBox();
  expect(phone).toEqual({ x: 0, y: 0, width: 390, height: 844 });

  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1280, height: 800 });
  await askButton(page, Q1).click();
  const wide = (await panel(page).boundingBox())!;
  expect(wide.height).toBe(800);
  expect(wide.width).toBeLessThan(500);
  expect(wide.x + wide.width).toBe(1280);
});

test("401: 「key が無効です」, settings open, the question stays; the retry sends it once", async ({ page }) => {
  fake = await fakeAnthropic(page, { mode: "401" });
  await presetKey(page);
  await page.goto(SET_URL);
  await openPanel(page, Q1, 0);
  await expect(panel(page).getByTestId("sensei-key-settings")).toHaveCount(0);

  await ask(page, "401 のときの質問");
  await expect(panel(page).getByTestId("sensei-error")).toHaveText(S.errorAuth);
  await expect(panel(page).getByTestId("sensei-key-settings")).toBeVisible();
  await expect(input(page)).toHaveValue("401 のときの質問");
  expect(await panel(page).getByTestId("sensei-error").textContent()).not.toContain(KEY);

  fake.mode = "ok";
  await panel(page).getByRole("button", { name: S.send }).click();
  await expect(log(page)).toContainText(REPLY_MARK);
  await expect(panel(page).getByTestId("sensei-error")).toHaveCount(0);
  expect(fake.requests).toHaveLength(2);
  const users = (fake.requests[1]!.body.messages ?? []).filter((m) => m.role === "user");
  expect(users).toHaveLength(1);
  const okTurn = ["user:401 のときの質問", `assistant:${fake.reply.join("")}`];
  expect(await storedTexts(page, `${Q1}:ア`)).toEqual(okTurn);

  // a failed turn is not persisted: after a reload the thread holds only the successful turn
  fake.mode = "401";
  await ask(page, "保存されない質問");
  await expect(panel(page).getByTestId("sensei-error")).toHaveText(S.errorAuth);
  await page.reload();
  expect(await storedTexts(page, `${Q1}:ア`)).toEqual(okTurn);
  await openPanel(page, Q1, 0);
  await expect(log(page)).toContainText("401 のときの質問");
  await expect(log(page)).not.toContainText("保存されない質問");
  expect(fake.requests).toHaveLength(3);
});

test("refusal: the refusal notice, the question back in the input", async ({ page }) => {
  fake = await fakeAnthropic(page, { mode: "refusal" });
  await presetKey(page);
  await page.goto(SET_URL);
  await openPanel(page, Q1, "reveal");
  await ask(page, "答えられない質問");
  await expect(panel(page).getByTestId("sensei-error")).toHaveText(S.errorRefusal);
  await expect(input(page)).toHaveValue("答えられない質問");
  expect(await storedTexts(page, `${Q1}:reveal`)).toBeNull(); // the refused turn is not saved

  // after a successful turn, a later refusal leaves the stored thread as it was
  fake.mode = "ok";
  await panel(page).getByRole("button", { name: S.send }).click();
  await expect(log(page)).toContainText(REPLY_MARK);
  const okTurn = ["user:答えられない質問", `assistant:${fake.reply.join("")}`];
  expect(await storedTexts(page, `${Q1}:reveal`)).toEqual(okTurn);
  fake.mode = "refusal";
  await ask(page, "拒否される二つ目の質問");
  await expect(panel(page).getByTestId("sensei-error")).toHaveText(S.errorRefusal);
  await page.reload();
  expect(await storedTexts(page, `${Q1}:reveal`)).toEqual(okTurn);
  await openPanel(page, Q1, "reveal");
  await expect(log(page)).toContainText("答えられない質問");
  await expect(log(page)).not.toContainText("拒否される二つ目の質問");
});

test("clear while a reply is in flight: after a reload the thread is empty", async ({ page }) => {
  fake = await fakeAnthropic(page, { mode: "ok" });
  await presetKey(page);
  await page.goto(SET_URL);
  await openPanel(page, Q1, 1);

  await ask(page, "一つ目の質問");
  await expect(log(page)).toContainText(REPLY_MARK);
  expect(await storedTexts(page, `${Q1}:イ`)).toHaveLength(2);

  fake.delayMs = 1500;
  await ask(page, "消える質問");
  await expect(panel(page).getByTestId("sensei-thinking")).toBeVisible();
  await panel(page).getByRole("button", { name: S.clear }).click();
  await expect(log(page)).toContainText(S.emptyHint);
  await page.waitForTimeout(2000); // past the held reply
  await expect(log(page)).toContainText(S.emptyHint);
  await expect(log(page)).not.toContainText(REPLY_MARK);

  await page.reload();
  expect(await storedTexts(page, `${Q1}:イ`)).toBeNull();
  await openPanel(page, Q1, 1);
  await expect(log(page)).toContainText(S.emptyHint);
  await expect(log(page)).not.toContainText("一つ目の質問");
  await expect(log(page)).not.toContainText("消える質問");
});

test("switch to another question while the first reply is in flight: each thread keeps its own messages", async ({
  page,
}) => {
  fake = await fakeAnthropic(page, { mode: "ok", delayMs: 2000 });
  await presetKey(page);
  await page.goto(SET_URL);

  await openPanel(page, Q1, 1);
  await ask(page, "問1 の質問");
  await expect(panel(page).getByTestId("sensei-thinking")).toBeVisible();
  await page.keyboard.press("Escape");

  fake.delayMs = 0;
  await openPanel(page, Q2, 0);
  await expect(log(page)).toContainText(S.emptyHint); // Q2's own (empty) thread
  await ask(page, "問2 の質問");
  await expect(log(page)).toContainText(REPLY_MARK);
  await page.waitForTimeout(2500); // past Q1's held reply

  expect(await storedTexts(page, `${Q1}:イ`)).toEqual(["user:問1 の質問"]); // stopped on switch, saved in its own thread
  expect(await storedTexts(page, `${Q2}:ア`)).toEqual([
    "user:問2 の質問",
    `assistant:${fake.reply.join("")}`,
  ]);
  await expect(log(page)).not.toContainText("問1 の質問");
  // each thread keeps its own title: Q1's reply finished (aborted) after Q2 was opened (I1)
  const index = JSON.parse((await page.evaluate(() => localStorage.getItem("itp:sensei:index:v1"))) ?? "null") as {
    threads: { anchorId: string; title: string }[];
  };
  expect(Object.fromEntries(index.threads.map((t) => [t.anchorId, t.title]))).toEqual({
    [`${Q1}:イ`]: Q1_LABEL,
    [`${Q2}:ア`]: Q2_LABEL,
  });

  await page.keyboard.press("Escape");
  await page.reload();
  await openPanel(page, Q1, 1);
  await expect(log(page)).toContainText("問1 の質問");
  await expect(log(page)).not.toContainText("問2 の質問");
  await expect(log(page)).not.toContainText(REPLY_MARK);
});

const SENSEI_URL = "/ja/sensei";
const keyStatus = (page: Page) => page.getByTestId("sensei-key-status");
const savedAs = (masked: string) => S.keySaved.replace("{masked}", masked);

test("/sensei key settings: how to get a key, masked display, reload persists, delete clears", async ({ page }) => {
  fake = await fakeAnthropic(page);
  await page.goto(SENSEI_URL);
  await expect(page.getByRole("heading", { level: 1, name: S.panelTitle })).toBeVisible();
  await expect(keyStatus(page)).toHaveText(S.keyNone);
  const howto = page.getByTestId("sensei-key-howto");
  await expect(howto).toBeVisible();
  const consoleLink = howto.getByRole("link", { name: S.keyHowToLink });
  await expect(consoleLink).toHaveAttribute("href", "https://console.anthropic.com/settings/keys");
  await expect(consoleLink).toHaveAttribute("target", "_blank");
  await expect(consoleLink).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByTestId("sensei-threads-empty")).toHaveText(S.threadsEmpty);
  await expect(page.getByTestId("sensei-coming-soon")).toHaveText(S.comingSoon);
  await expect(page.getByLabel(S.freeLabel)).toBeDisabled();
  await expect(page.getByRole("button", { name: S.send })).toBeDisabled();

  await page.getByLabel(S.keyLabel).fill(KEY);
  await page.getByRole("button", { name: S.keySave }).click();
  await expect(keyStatus(page)).toHaveText(savedAs("…wxyz"));
  await expect(page.getByLabel(S.keyLabel)).toHaveValue("");
  await expect(howto).toHaveCount(0);
  expect(await page.getByTestId("sensei-key-settings").textContent()).not.toContain(KEY.slice(0, -4));

  await page.reload();
  await expect(keyStatus(page)).toHaveText(savedAs("…wxyz"));

  await page.getByRole("button", { name: S.keyDelete }).click();
  await expect(keyStatus(page)).toHaveText(S.keyNone);
  await expect(page.getByTestId("sensei-key-howto")).toBeVisible();
  expect(await page.evaluate((k) => localStorage.getItem(k), KEY_STORAGE)).toBeNull();

  // a key shorter than 8 characters is shown as "…" only
  await page.getByLabel(S.keyLabel).fill("abc12");
  await page.getByRole("button", { name: S.keySave }).click();
  await expect(keyStatus(page)).toHaveText(savedAs("…"));
  expect(fake.requests).toEqual([]);
});

test("/sensei key settings: a refused storage write keeps the typed key and shows the notice", async ({ page }) => {
  fake = await fakeAnthropic(page);
  await page.addInitScript((k) => {
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === k) throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
      return set.call(this, key, value);
    };
  }, KEY_STORAGE);
  await page.goto(SENSEI_URL);
  await page.getByLabel(S.keyLabel).fill(KEY);
  await page.getByRole("button", { name: S.keySave }).click();
  await expect(page.getByTestId("sensei-key-save-failed")).toHaveText(S.keySaveFailed);
  await expect(page.getByLabel(S.keyLabel)).toHaveValue(KEY);
  await expect(keyStatus(page)).toHaveText(S.keyNone);
});

test("/sensei thread list: newest first, links back to the question, delete removes it", async ({ page }) => {
  fake = await fakeAnthropic(page);
  await presetKey(page);
  await page.goto(SET_URL);
  await openPanel(page, Q1, 1);
  await ask(page, "問1 の質問");
  await expect(log(page)).toContainText(REPLY_MARK);
  await page.keyboard.press("Escape");
  await openPanel(page, Q2, 0);
  await ask(page, "問2 の質問");
  await expect(log(page)).toContainText(REPLY_MARK);
  await page.keyboard.press("Escape");

  await page.goto(SENSEI_URL);
  const rows = page.getByTestId("sensei-thread");
  await expect(rows).toHaveCount(2);
  const q2Href = "/ja/quiz?mode=exam&id=2011h23tokubetsu#2011h23tokubetsu-q058";
  const q1Href = "/ja/quiz?mode=exam&id=2009h21a#2009h21a-q054";
  await expect(rows.nth(0).getByRole("link")).toHaveAttribute("href", q2Href); // newest first
  await expect(rows.nth(1).getByRole("link")).toHaveAttribute("href", q1Href);
  for (const row of [rows.nth(0), rows.nth(1)]) {
    await expect(row).toContainText(S.kind_question);
    await expect(row.locator("time")).toHaveAttribute("datetime", /^\d{4}-\d{2}-\d{2}T/);
  }

  // the link lands on the question in its exam set
  await rows.nth(1).getByRole("link").click();
  await expect(page).toHaveURL(new RegExp(`${q1Href.replace(/[?#]/g, "\\$&")}$`));
  await expect(card(page, Q1)).toBeInViewport();

  await page.goto(SENSEI_URL);
  await expect(rows).toHaveCount(2);
  const title = (await rows.nth(0).getByRole("link").textContent()) ?? "";
  await rows.nth(0).getByRole("button", { name: S.threadDeleteLabel.replace("{title}", title) }).click();
  await expect(rows).toHaveCount(1);
  await expect(rows.nth(0).getByRole("link")).toHaveAttribute("href", q1Href);
  expect(await storedTexts(page, `${Q2}:ア`)).toBeNull();

  await page.reload();
  await expect(rows).toHaveCount(1);
  await rows.nth(0).getByRole("button", { name: S.threadDelete }).click();
  await expect(page.getByTestId("sensei-threads-empty")).toBeVisible();
  expect(await storedTexts(page, `${Q1}:イ`)).toBeNull();
  const index = await page.evaluate(() => localStorage.getItem("itp:sensei:index:v1"));
  expect(JSON.parse(index ?? "null")).toEqual({ v: 1, threads: [] });
  expect(fake.requests).toHaveLength(2);
});

for (const theme of ["gamified", "retro", "terminal"] as const) {
  test(`nav (${theme} shell): the AI 先生 item links to /ja/sensei`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem("itp:theme:v1", t), theme);
    await page.goto("/ja/glossary");
    const shell = page.locator(`[data-shell="${theme}"]`);
    await expect(shell).toBeVisible();
    // by href + text: Retro underlines the first character in its own span, so its
    // accessible name reads "A I 先生" while the text content is the label
    const items = shell.locator("nav a");
    await expect(items).toHaveCount(4);
    const item = items.nth(3);
    await expect(item).toHaveAttribute("href", SENSEI_URL);
    await expect(item).toHaveText(ja.Nav.sensei);
    await item.click();
    await expect(page).toHaveURL(new RegExp(`${SENSEI_URL}$`));
    await expect(page.locator(`[data-shell="${theme}"] nav a[href="${SENSEI_URL}"]`)).toHaveAttribute("aria-current", "page");
  });
}

const LOCALE_MESSAGES = { ja, zh, en } as const;

/** "inside" when `inner`'s box lies within `outer`'s (1px tolerance), else both boxes. */
async function insideOf(inner: Locator, outer: Locator): Promise<string> {
  const a = await inner.boundingBox();
  const b = await outer.boundingBox();
  if (!a || !b) return `no box: ${JSON.stringify({ a, b })}`;
  const ok =
    a.x >= b.x - 1 && a.x + a.width <= b.x + b.width + 1 && a.y >= b.y - 1 && a.y + a.height <= b.y + b.height + 1;
  return ok ? "inside" : JSON.stringify({ item: a, container: b });
}

const NAV_PAGES = ["/textbook", "/quiz", "/glossary", "/sensei"] as const;

for (const theme of ["gamified", "retro", "terminal"] as const) {
  for (const locale of ["ja", "zh", "en"] as const) {
    test(`phone width (${theme} shell, ${locale}): no horizontal scroll, switchers on screen, current tab in view`, async ({
      page,
    }) => {
      await page.addInitScript((t) => localStorage.setItem("itp:theme:v1", t), theme);
      await page.setViewportSize({ width: 390, height: 844 });
      for (const path of NAV_PAGES) {
        await page.goto(`/${locale}${path}`);
        const shell = page.locator(`[data-shell="${theme}"]`);
        await expect(shell).toBeVisible();
        const switchers = [
          shell.getByRole("combobox", { name: "Switch theme" }),
          shell.getByRole("combobox", { name: LOCALE_MESSAGES[locale].Locale.switcherLabel }),
        ];
        for (const sw of switchers) {
          await expect(sw).toBeVisible();
          const box = (await sw.boundingBox())!;
          expect(box.x, path).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width, path).toBeLessThanOrEqual(390);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBeLessThanOrEqual(390);

        // the current page's tab is scrolled into view inside its nav row, without scrolling the page
        const current = shell.locator('nav a[aria-current="page"]');
        const row = current.locator(".."); // the scrolling nav row in each shell
        await expect(current).toHaveAttribute("href", `/${locale}${path}`);
        await expect.poll(() => insideOf(current, row), { message: path }).toBe("inside");
        expect(await page.evaluate(() => window.scrollY), path).toBe(0);
        // an overflowing row marks the side(s) with more items (edge fade)
        const overflows = await row.evaluate((el) => el.scrollWidth > el.clientWidth + 1);
        if (overflows) await expect(row, path).toHaveAttribute("data-fade", /^(left|right|both)$/);
      }
    });
  }

  test(`phone width (${theme} shell): Tab onto the last nav item keeps it and its focus ring inside the row`, async ({
    page,
  }) => {
    await page.addInitScript((t) => localStorage.setItem("itp:theme:v1", t), theme);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/glossary");
    const items = page.locator(`[data-shell="${theme}"] nav a`);
    const row = items.first().locator(".."); // the scrolling nav row
    await expect(items).toHaveCount(NAV_PAGES.length);
    await items.nth(NAV_PAGES.length - 2).focus();
    await page.keyboard.press("Tab");
    const last = items.nth(NAV_PAGES.length - 1);
    await expect(last).toBeFocused();
    await expect.poll(() => insideOf(last, row)).toBe("inside");
    // the ring is drawn inside the item's own box, so the row's overflow cannot clip it
    const ring = await last.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { style: cs.outlineStyle, offset: parseFloat(cs.outlineOffset), width: parseFloat(cs.outlineWidth) };
    });
    expect(ring.style).not.toBe("none");
    expect(ring.offset + ring.width).toBeLessThanOrEqual(0);
  });
}

// Owner sync is only reachable on a local server with OWNER_KEY (see learning-owner.spec.ts);
// without E2E_OWNER_KEY this test is not registered, as playwright.config ignores that spec.
if (OWNER_KEY) {
  test("owner: /api/learning PUT bodies never contain the key", async ({ page, baseURL }) => {
    const host = baseURL ? new URL(baseURL).hostname : "";
    expect(["localhost", "127.0.0.1"]).toContain(host);
    fake = await fakeAnthropic(page);
    const bodies: string[] = [];
    await page.route("**/api/learning", async (route) => {
      const req = route.request();
      if (req.method() === "PUT") bodies.push(req.postData() ?? "");
      await route.fulfill({ status: 200, json: req.method() === "PUT" ? req.postDataJSON() : { v: 1, questions: {}, unitsRead: {} } });
    });
    await page.goto(`/ja/glossary?owner_key=${encodeURIComponent(OWNER_KEY)}`);
    await presetKey(page);
    await page.goto(SET_URL);
    await openPanel(page, Q1, 1);
    await ask(page, "owner の質問");
    await expect(log(page)).toContainText(REPLY_MARK);
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
      window.dispatchEvent(new Event("pagehide"));
    });
    await expect.poll(() => bodies.length).toBeGreaterThan(0);
    for (const b of bodies) expect(b).not.toContain(KEY);
    expect(bodies.join("")).toContain(Q1);
  });
}


// ── D-181 Phase B: weak-topic review (quiz landing card → topic set, AI 先生 opens) ──
//
//  12. Landing card: the weakest topics (≥ 5 answers, not all correct; lowest stored
//      accuracy first; top 3) from a seeded record; the landing loads no AI SDK chunk.
//      Clicking a row (click intent in sessionStorage) opens the topic set with
//      ?review=1 → the flag is removed from the URL, the panel opens and sends the
//      opener exactly once; the request's anchor holds only that topic's question ids,
//      re-judged answers, the learner's distractor notes and the not-yet-answered
//      questions with their terms; an in-dialog `#sensei-input` link leaves the panel
//      open, a `#<question_id>` link closes it, scrolls to that question and focuses
//      its <article>. A reload and a second click on the same card (same day → same
//      thread, not empty) send nothing; /sensei links the review thread back to the
//      topic set with its date (`&thread=`), never the flag.
//  13. Arriving without a key: nothing is sent until the key is saved, then the opener
//      goes out once; closing / reopening / toggling settings never re-sends.
//  14. Empty record: the per-topic 「1 つの分野で 5 題以上…」 hint and no intro; the set
//      page's launcher opens the review thread without sending anything.
//  15. `?review=1` without a click intent (bookmark / copied link): the panel opens
//      with the opener as a suggestion chip, 0 requests.
//  16. A past day's review thread: its /sensei row (`&thread=<date>`) opens that thread
//      on the set page with its history, the parameter removed, 0 requests.

const REVIEW_TOPIC = "technology-14-36"; // データ構造, 7 問
const REVIEW_TOPIC_IDS = [
  "2009h21a-q054",
  "2010h22h-q085",
  "2011h23tokubetsu-q058",
  "2016h28a-q092",
  "2018h30a-q076",
  "2018h30h-q096",
  "2019r01a-q062",
];
const REVIEW_TARGET = "2018h30h-q096"; // not yet answered in the seed
const QUESTION_ID_RE = /#(\d{4}[0-9a-z]+-q\d{3})/g;

/** [qid, choice, stored correct] — `correct` is what the record holds, not the current key. */
const SEED: [string, string, boolean][] = [
  // technology-14-36 データ構造: stored 1/5 = 20 %; re-judged 0/5 (q085 keyed ウ, stored as correct)
  ["2009h21a-q054", "ア", false], // keyed イ
  ["2010h22h-q085", "ア", true], // keyed ウ — a stale "correct"
  ["2011h23tokubetsu-q058", "ウ", false], // keyed イ
  ["2016h28a-q092", "ア", false], // keyed エ
  ["2018h30a-q076", "エ", false], // keyed イ
  // technology-21-54 データベース方式: 3/6 = 50 %
  ["2009h21h-q058", "ア", true],
  ["2011h23a-q053", "エ", true],
  ["2014h26a-q074", "エ", true],
  ["2016h28a-q077", "ア", false],
  ["2020r02o-q064", "ウ", false],
  ["2021r03-q075", "イ", false],
  // technology-14-39 その他の言語: 4/5 = 80 %
  ["2009h21h-q083", "ウ", true],
  ["2010h22a-q056", "エ", true],
  ["2010h22h-q063", "ウ", true],
  ["2012h24a-q059", "イ", true],
  ["2012h24h-q067", "イ", false],
  // technology-19-50: 4/5 = 80 %, same rate and count as 14-39 → after it by topic id (4th, hidden)
  ["2010h22a-q071", "エ", true],
  ["2011h23a-q062", "ウ", true],
  ["2015h27a-q061", "エ", true],
  ["2022r04-q033", "ア", true],
  ["2024r06-q068", "ア", false],
  // technology-20-53: 0/4 — fewer than 5 answers, never listed
  ["2011h23tokubetsu-q098", "ア", false],
  ["2012h24h-q072", "ア", false],
  ["2012h24h-q084", "ア", false],
  ["2013h25h-q054", "イ", false],
];

/** Seed `itp:learn:v1` once (an init script runs on every load: only when absent). */
async function seedRecord(page: Page): Promise<void> {
  const questions = Object.fromEntries(SEED.map(([id, choice, correct], i) => [id, { choice, correct, at: 1_700_000_000_000 + i }]));
  await page.addInitScript((value) => {
    if (localStorage.getItem("itp:learn:v1") === null) localStorage.setItem("itp:learn:v1", value);
  }, JSON.stringify({ v: 1, questions, unitsRead: {} }));
}

/** Every same-origin JS chunk the page loads, with its body. */
function trackScripts(page: Page): { url: string; body: Promise<string> }[] {
  const scripts: { url: string; body: Promise<string> }[] = [];
  page.on("response", (r) => {
    if (/\/_next\/static\/.+\.js(\?|$)/.test(r.url())) scripts.push({ url: r.url(), body: r.text().catch(() => "") });
  });
  return scripts;
}

/** Chunks among `scripts` that carry the AI SDK's Anthropic provider. */
async function sdkChunks(scripts: { url: string; body: Promise<string> }[]): Promise<string[]> {
  const out: string[] = [];
  for (const s of scripts) if ((await s.body).includes("anthropic-dangerous-direct-browser-access")) out.push(s.url);
  return out;
}

const systemText = (req: FakeRequest): string =>
  ((req.body.system as { text?: string }[] | undefined) ?? []).map((b) => b.text ?? "").join("\n");

const reviewRows = (page: Page) => page.getByTestId("review-card").getByTestId("review-topic");

test("review: weakest topics on the landing; the card opens the set and AI 先生 speaks first, once", async ({ page }) => {
  fake = await fakeAnthropic(page, { mode: "ok" });
  fake.reply = [
    "**誤りの傾向**: スタックとキューの取り違えが多いです。",
    `\n\n- [問題を開く](#${REVIEW_TARGET})`,
    "\n- [質問を書く](#sensei-input)",
  ];
  await presetKey(page);
  await seedRecord(page);
  const scripts = trackScripts(page);
  // RSC fetches of the topic set that are not prefetches: the card's navigation only
  // (removing ?review=1 uses history.replaceState, which refetches nothing)
  const setFetches: string[] = [];
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (u.pathname === "/ja/quiz" && u.searchParams.get("mode") === "topic" && r.headers()["rsc"] === "1" && !r.headers()["next-router-prefetch"]) {
      setFetches.push(r.url());
    }
  });

  await page.goto("/ja/quiz");
  await expect(reviewRows(page)).toHaveCount(3);
  await expect(reviewRows(page).nth(0)).toHaveText(/^データ構造 正答率 20% · 5 題解答$/);
  await expect(reviewRows(page).nth(1)).toHaveText(/^データベース方式 正答率 50% · 6 題解答$/);
  await expect(reviewRows(page).nth(2)).toHaveText(/^その他の言語 正答率 80% · 5 題解答$/);
  await expect(reviewRows(page).nth(0).getByRole("link")).toHaveAccessibleName("データ構造 正答率 20% · 5 題解答");
  await expect(page.getByTestId("review-intro")).toBeVisible();
  await expect(reviewRows(page).nth(0).getByRole("link")).toHaveAttribute(
    "href",
    `/ja/quiz?mode=topic&id=${REVIEW_TOPIC}&review=1`,
  );
  await page.waitForLoadState("networkidle");
  expect(scripts.length).toBeGreaterThan(0);
  expect(await sdkChunks(scripts), "AI SDK chunk loaded on the quiz landing").toEqual([]);

  await reviewRows(page).nth(0).getByRole("link").click();
  await expect(panel(page)).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/ja/quiz\\?mode=topic&id=${REVIEW_TOPIC}$`)); // flag removed
  await expect(log(page).locator('[data-role="user"]')).toHaveText(`${S.you}: ${S.reviewOpener}`);
  await expect(log(page)).toContainText("スタックとキューの取り違えが多いです。");
  expect((await sdkChunks(scripts)).length, "positive control: the panel loads the SDK").toBeGreaterThan(0);

  // exactly one request, even after the dust settles
  await page.waitForTimeout(1500);
  expect(fake.requests).toHaveLength(1);
  expect(setFetches, "RSC fetches of the set").toHaveLength(1);
  const req = fake.requests[0]!;
  const users = (req.body.messages ?? []).filter((m) => m.role === "user");
  expect(users).toHaveLength(1);
  expect(JSON.stringify(users[0]!.content)).toContain(S.reviewOpener);

  // the anchor: only this topic's questions, re-judged, the learner's distractor notes only
  const system = systemText(req);
  expect(system).toContain("分野: データ構造");
  expect(system).toContain("この分野の過去問 7 問のうち 5 問に解答、現在の正解で判定すると 0 問正解・5 問不正解");
  const ids = [...new Set([...system.matchAll(QUESTION_ID_RE)].map((m) => m[1]!))];
  expect(ids.length).toBe(7); // 5 wrong + 2 not yet answered
  for (const id of ids) expect(REVIEW_TOPIC_IDS, id).toContain(id);
  const block = (id: string) => system.slice(system.indexOf(`### 問題 ID: #${id}`)).split("\n### ")[0]!;
  const q085 = block("2010h22h-q085");
  expect(q085).toContain("正解: ウ");
  expect(q085).toContain("学習者の解答: ア（不正解）"); // stored correct=true, re-judged
  expect(q085).toContain("ア が誤りの理由");
  expect(q085).not.toMatch(/[イエ] が誤りの理由/);
  const q054 = block("2009h21a-q054");
  expect(q054).toContain("ア が誤りの理由");
  expect(q054).not.toMatch(/[ウエ] が誤りの理由/);
  expect(system).toContain(`- #${REVIEW_TARGET}（`);
  expect(system).toContain("一覧にない問題 ID");
  expect(system).toContain("内容を推測して説明しない");
  // not-yet-answered lines carry their terms (2018h30h-q096: キュー)
  expect(system).toMatch(new RegExp(`^- #${REVIEW_TARGET}（[^）]+）用語: キュー$`, "m"));

  // an in-dialog #id that is not a question id is left alone: the panel stays open
  await log(page).getByRole("link", { name: "質問を書く" }).click();
  await expect(panel(page)).toBeVisible();

  // the recommended #id link: the panel closes, the question is scrolled into view and
  // its article (not choice ア, where Enter would answer) has the focus
  await log(page).getByRole("link", { name: "問題を開く" }).click();
  await expect(panel(page)).toHaveCount(0);
  await expect(card(page, REVIEW_TARGET)).toBeInViewport();
  await expect(card(page, REVIEW_TARGET)).toBeFocused();

  // a reload never re-sends
  await page.reload();
  await expect(card(page, REVIEW_TARGET)).toBeVisible();
  await page.waitForTimeout(1500);
  await expect(panel(page)).toHaveCount(0);
  expect(fake.requests).toHaveLength(1);

  // /sensei: the review thread links back to the topic set with its date, without the flag
  await page.goto(SENSEI_URL);
  const row = page.getByTestId("sensei-thread").filter({ hasText: S.kind_review });
  await expect(row).toHaveCount(1);
  const today = await page.evaluate(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  await expect(row.getByRole("link", { name: "データ構造" })).toHaveAttribute(
    "href",
    `/ja/quiz?mode=topic&id=${REVIEW_TOPIC}&thread=${today}`,
  );

  // the same card again (same day → same thread, not empty): the history, no new request
  await page.goto("/ja/quiz");
  await reviewRows(page).nth(0).getByRole("link").click();
  await expect(panel(page)).toBeVisible();
  await expect(log(page)).toContainText("スタックとキューの取り違えが多いです。");
  await expect(page).toHaveURL(new RegExp(`id=${REVIEW_TOPIC}$`));
  await page.waitForTimeout(1500);
  expect(fake.requests).toHaveLength(1);
});

test("review without a key: nothing is sent until the key is saved, then the opener once", async ({ page }) => {
  fake = await fakeAnthropic(page, { mode: "ok" });
  await seedRecord(page);
  await page.goto("/ja/quiz");
  await reviewRows(page).nth(0).getByRole("link").click();
  const p = panel(page);
  await expect(p.getByTestId("sensei-key-missing")).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`id=${REVIEW_TOPIC}$`));
  await expect(log(page)).toContainText(S.reviewEmptyHint);
  await page.waitForTimeout(500);
  expect(fake.requests).toHaveLength(0);

  await p.getByLabel(S.keyLabel).fill(KEY);
  await p.getByRole("button", { name: S.keySave }).click();
  await expect(log(page)).toContainText(REPLY_MARK);
  expect(fake.requests).toHaveLength(1);

  // effect re-runs (settings toggled, key status re-read, close + reopen) never re-send
  await p.getByRole("button", { name: S.settings }).click();
  await p.getByRole("button", { name: S.settings }).click();
  await page.keyboard.press("Escape");
  await expect(panel(page)).toHaveCount(0);
  await expect(page.getByTestId("review-launcher")).toBeFocused();
  await page.getByTestId("review-launcher").click();
  await expect(log(page)).toContainText(REPLY_MARK);
  await page.waitForTimeout(1000);
  expect(fake.requests).toHaveLength(1);
  expect(JSON.stringify(fake.requests[0]!.body.messages)).toContain(S.reviewOpener);
});

test("review with an empty record: the hint on the landing; the set's launcher sends nothing", async ({ page }) => {
  fake = await fakeAnthropic(page, { mode: "ok" });
  await presetKey(page);
  await page.goto("/ja/quiz");
  await expect(page.getByTestId("review-empty")).toHaveText("1 つの分野で 5 題以上解くと弱点を分析します");
  await expect(reviewRows(page)).toHaveCount(0);
  await expect(page.getByTestId("review-intro")).toHaveCount(0);

  await page.goto(`/ja/quiz?mode=topic&id=${REVIEW_TOPIC}`);
  await page.getByTestId("review-launcher").click();
  await expect(panel(page)).toBeVisible();
  await expect(log(page)).toContainText(S.reviewEmptyHint);
  await expect(panel(page).getByRole("button", { name: S.reviewOpener })).toBeVisible(); // a suggestion, not sent
  await page.waitForTimeout(1000);
  expect(fake.requests).toHaveLength(0);
});

test("review: ?review=1 without a click intent (bookmark, copied link) opens the panel but sends nothing", async ({ page }) => {
  fake = await fakeAnthropic(page, { mode: "ok" });
  await presetKey(page);
  await seedRecord(page);
  await page.goto(`/ja/quiz?mode=topic&id=${REVIEW_TOPIC}&review=1`);
  await expect(panel(page)).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/ja/quiz\\?mode=topic&id=${REVIEW_TOPIC}$`)); // flag removed
  await expect(log(page)).toContainText(S.reviewEmptyHint);
  await expect(panel(page).getByRole("button", { name: S.reviewOpener })).toBeVisible(); // a suggestion chip
  await page.waitForTimeout(1500);
  expect(fake.requests).toHaveLength(0);

  // a stale intent (> 30 s) for this topic does not count either
  await page.keyboard.press("Escape");
  await page.evaluate((topicId) => {
    sessionStorage.setItem("itp:sensei:review-intent", JSON.stringify({ topicId, at: Date.now() - 31_000 }));
  }, REVIEW_TOPIC);
  await page.goto(`/ja/quiz?mode=topic&id=${REVIEW_TOPIC}&review=1`);
  await expect(panel(page)).toBeVisible();
  await page.waitForTimeout(1500);
  expect(fake.requests).toHaveLength(0);
  expect(await page.evaluate(() => sessionStorage.getItem("itp:sensei:review-intent"))).toBeNull(); // consumed

  // the card click (a fresh intent) sends exactly one request
  await page.goto("/ja/quiz");
  await reviewRows(page).nth(0).getByRole("link").click();
  await expect(log(page)).toContainText(REPLY_MARK);
  await page.waitForTimeout(1000);
  expect(fake.requests).toHaveLength(1);
});

test("review: a past day's thread is reachable from its /sensei row, without sending", async ({ page }) => {
  fake = await fakeAnthropic(page, { mode: "ok" });
  await presetKey(page);
  await seedRecord(page);
  const PAST = "2026-01-05";
  const anchorId = `${REVIEW_TOPIC}:${PAST}`;
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

  await page.goto(SENSEI_URL);
  const link = page.getByTestId("sensei-thread").getByRole("link", { name: "データ構造" });
  await expect(link).toHaveAttribute("href", `/ja/quiz?mode=topic&id=${REVIEW_TOPIC}&thread=${PAST}`);
  await link.click();
  await expect(panel(page)).toBeVisible();
  await expect(log(page)).toContainText("過去の復習の返答です。");
  await expect(page).toHaveURL(new RegExp(`/ja/quiz\\?mode=topic&id=${REVIEW_TOPIC}$`)); // parameter removed
  await page.waitForTimeout(1500);
  expect(fake.requests).toHaveLength(0);

  // a malformed date opens nothing
  await page.goto(`/ja/quiz?mode=topic&id=${REVIEW_TOPIC}&thread=2026-02-30`);
  await expect(page.getByTestId("review-launcher")).toBeEnabled();
  await page.waitForTimeout(1000);
  await expect(panel(page)).toHaveCount(0);
  expect(fake.requests).toHaveLength(0);
});


// ── D-181 Phase C: 「AI 先生に聞く」 on the glossary term page and the textbook unit page ──
//
//  17. Term page (/ja, 機能要件 — taught in 2 units): no AI SDK chunk until the button
//      is clicked; the request's anchor holds the JP definition / explanation / memory
//      hook of BOTH senses and no analogy; the thread is kind "term" with anchorId =
//      termId; Esc returns focus to the button; its /sensei row links back to
//      /ja/glossary/<termId>.
//  18. Unit page (/en, management-08-25-u01): no AI SDK chunk until the click; the
//      anchor holds the JP + English title, summary and every term's definition (JP +
//      English) and no analogy / zh text; the thread is kind "unit" with anchorId =
//      unitId; its /sensei row (title = the English unit title) links back to
//      /en/textbook/<unitId>.
// The expected strings are read from the committed corpus (data/ip/textbook/units).

const UNITS_DIR = path.resolve(__dirname, "../../../data/ip/textbook/units");

interface CorpusTerm {
  term: string;
  definition_jp: string;
  explanation_jp: string;
  memory_hook_jp: string;
  analogy_jp: string;
  definition_en: string;
  analogy_en: string;
  definition_zh: string;
}
interface CorpusUnit {
  unit_id: string;
  title_jp: string;
  title_en: string;
  title_zh: string;
  unit_summary_jp: string;
  unit_summary_en: string;
  terms: CorpusTerm[];
}

function corpusUnit(unitId: string): CorpusUnit {
  return JSON.parse(readFileSync(path.join(UNITS_DIR, `${unitId}.json`), "utf-8")) as CorpusUnit;
}

/** Every unit's sense of `term` (the corpus files in name order). */
function corpusSenses(term: string): CorpusTerm[] {
  return readdirSync(UNITS_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .flatMap((f) => corpusUnit(f.slice(0, -".json".length)).terms.filter((t) => t.term === term));
}

const TERM = "機能要件";
const TERM_ID = termId(TERM);
const UNIT = "management-08-25-u01";

test("term page: 「AI 先生に聞く」 sends every sense of the term; no AI SDK before the click; /sensei links back", async ({
  page,
}) => {
  fake = await fakeAnthropic(page);
  await presetKey(page);
  const scripts = trackScripts(page);

  await page.goto(`/ja/glossary/${TERM_ID}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(TERM);
  await page.waitForLoadState("networkidle");
  expect(await sdkChunks(scripts), "AI SDK loaded before the click").toEqual([]);

  const button = page.getByTestId("ask-sensei");
  await expect(button).toHaveText(S.askButton);
  await button.click();
  await expect(panel(page)).toBeVisible();
  await ask(page, "二つの単元での意味の違いは？");
  await expect(log(page)).toContainText(REPLY_MARK);
  expect((await sdkChunks(scripts)).length, "AI SDK chunk after the click").toBeGreaterThan(0);

  expect(fake.requests).toHaveLength(1);
  const system = systemText(fake.requests[0]!);
  const senses = corpusSenses(TERM);
  expect(senses).toHaveLength(2);
  expect(system).toContain("回答言語: 日本語");
  expect(system).toContain(`用語: ${TERM}`);
  for (const s of senses) {
    expect(system).toContain(s.definition_jp);
    expect(system).toContain(s.explanation_jp);
    expect(system).toContain(s.memory_hook_jp);
    expect(system).not.toContain(s.analogy_jp);
    expect(system).not.toContain(s.definition_en);
  }

  await page.keyboard.press("Escape");
  await expect(panel(page)).toHaveCount(0);
  await expect(button).toBeFocused();
  const index = JSON.parse((await page.evaluate(() => localStorage.getItem("itp:sensei:index:v1"))) ?? "null") as {
    threads: { kind: string; anchorId: string; title: string }[];
  };
  expect(index.threads.map(({ kind, anchorId, title }) => ({ kind, anchorId, title }))).toEqual([
    { kind: "term", anchorId: TERM_ID, title: TERM },
  ]);

  await page.goto(SENSEI_URL);
  const row = page.getByTestId("sensei-thread");
  await expect(row).toHaveCount(1);
  await expect(row).toContainText(S.kind_term);
  await expect(row.getByRole("link")).toHaveAttribute("href", `/ja/glossary/${TERM_ID}`);
  await row.getByRole("link").click();
  await expect(page).toHaveURL(new RegExp(`/ja/glossary/${TERM_ID}$`));
  expect(fake.requests).toHaveLength(1);
});

test("unit page (en): 「AI 先生に聞く」 sends the unit's title, summary and terms; no AI SDK before the click; /sensei links back", async ({
  page,
}) => {
  fake = await fakeAnthropic(page);
  await presetKey(page);
  const scripts = trackScripts(page);
  const unit = corpusUnit(UNIT);

  await page.goto(`/en/textbook/${UNIT}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(unit.title_en);
  await page.waitForLoadState("networkidle");
  expect(await sdkChunks(scripts), "AI SDK loaded before the click").toEqual([]);

  const button = page.getByTestId("ask-sensei");
  await expect(button).toHaveText(en.Sensei.askButton);
  await button.click();
  const p = panel(page);
  await expect(p).toBeVisible();
  await p.getByLabel(en.Sensei.inputLabel).fill("What is the difference between the two kinds of requirements?");
  await p.getByRole("button", { name: en.Sensei.send }).click();
  await expect(log(page)).toContainText(REPLY_MARK);
  expect((await sdkChunks(scripts)).length, "AI SDK chunk after the click").toBeGreaterThan(0);

  expect(fake.requests).toHaveLength(1);
  const system = systemText(fake.requests[0]!);
  expect(system).toContain("回答言語: 英語");
  expect(system).toContain(`単元 ID: ${UNIT}`);
  for (const s of [unit.title_jp, unit.title_en, unit.unit_summary_jp, unit.unit_summary_en]) expect(system).toContain(s);
  expect(system).not.toContain(unit.title_zh);
  expect(unit.terms.length).toBeGreaterThan(0);
  for (const t of unit.terms) {
    expect(system).toContain(t.definition_jp);
    expect(system).toContain(t.definition_en);
    expect(system).not.toContain(t.analogy_jp);
    expect(system).not.toContain(t.analogy_en);
    expect(system).not.toContain(t.definition_zh);
  }

  await page.keyboard.press("Escape");
  await expect(button).toBeFocused();
  const index = JSON.parse((await page.evaluate(() => localStorage.getItem("itp:sensei:index:v1"))) ?? "null") as {
    threads: { kind: string; anchorId: string; title: string }[];
  };
  expect(index.threads.map(({ kind, anchorId, title }) => ({ kind, anchorId, title }))).toEqual([
    { kind: "unit", anchorId: UNIT, title: unit.title_en },
  ]);

  await page.goto("/en/sensei");
  const row = page.getByTestId("sensei-thread");
  await expect(row).toHaveCount(1);
  await expect(row).toContainText(en.Sensei.kind_unit);
  await expect(row.getByRole("link")).toHaveAttribute("href", `/en/textbook/${UNIT}`);
  await expect(row.getByRole("link")).toHaveText(unit.title_en);
  expect(fake.requests).toHaveLength(1);
});
