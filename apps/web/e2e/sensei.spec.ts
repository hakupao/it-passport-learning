// D-181 Task A4 — the 「AI 先生に聞く」 entry and the AI 先生 panel, against a fake Anthropic API
// (helpers/fakeAnthropic.ts). Stage 7 Task 15: on the new pages — the practice group
// (/ja/practice?ids=…, one question per screen; the button sits in the explanation pane), the
// single-question page (/ja/practice/q/<qid>, the reference view: anchor `<qid>:reveal`), the topic
// page (/ja/practice/browse/<topic>, the review) and the today page (「AI 分析」). The three theme
// shells are gone, and with them their nav / phone-width tests.
// No test reaches the real API: a beforeEach guard routes every request to api.anthropic.com in
// EVERY test; a request the fake does not answer (or any request in a test without the fake) is
// recorded and aborted, and each test ends by asserting that list is empty.
//
// Covered:
//   1. The button appears only after answering; no key → KeySettings in the
//      panel and Send disabled while the typed question stays; save the key →
//      ask → 「考え中…」 then the reply; the request carries the key header, the
//      browser-access header and the question anchor (#id, 正解, the learner's
//      choice) in `system`; markdown links obey §0-7; Esc closes and focus
//      returns to the button; after a reload (the group restored) the same choice
//      reopens the same thread, another choice (a new group, `&run=`) opens a fresh
//      one (§0-4); the key is in no localStorage value but its own key and no
//      /api/learning request is made (non-owner); no CSP violation with the panel open.
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
//   6. Move to another question of the group while the first reply is in flight and
//      ask there → each thread keeps only its own messages and its own title in the index.
//      Digits / arrows typed in the panel input reach the input, never the group (§0-14). The
//      ask button exists only once the question is answered, so the check is that no second
//      attempt is stored and ← / → did not move the group.
//   7. (only with E2E_OWNER_KEY, local server — see learning-owner.spec.ts) the
//      owner's /api/learning PUT bodies never contain the key.
//   8. /sensei key settings: how to get a key (console link) while none is saved;
//      save shows only "…" + the last 4 ("…" alone for a short key), survives a
//      reload, delete clears it; a refused storage write keeps the typed key and
//      shows the failure notice; the free-question input is enabled, its Send
//      disabled until a key is saved.
//   9. /sensei thread list: threads made on the practice page, newest first, each
//      linking to /practice/q/<question_id>; delete removes the row and its storage;
//      the empty state once none is left.
//
// Runs against a local prod build (the production CSP is then active, so a
// request to api.anthropic.com also proves connect-src allows it):
//   npm run build && npx next start -p 3015
//   PLAYWRIGHT_BASE_URL=http://localhost:3015 npx playwright test e2e/sensei.spec.ts --retries=0

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { test, expect, type Page } from "@playwright/test";

import en from "../messages/en.json";
import ja from "../messages/ja.json";
import zh from "../messages/zh.json";
import { encodeRecord, emptyRecord } from "../src/lib/learning/record";
import { termId } from "../src/lib/glossary/termId";
import { fakeAnthropic, guardAnthropic, type FakeAnthropic, type FakeRequest } from "./helpers/fakeAnthropic";
import {
  attemptsOf,
  choiceButton as letterButton,
  LETTERS,
  localDate,
  recordWith,
  seedV2,
  waitForRecord,
} from "./helpers/learning";

const S = ja.Sensei;
const KEY = "sk-ant-test-0000000000000000wxyz";
const KEY_STORAGE = "itp:sensei:key:v1";
const OWNER_KEY = process.env.E2E_OWNER_KEY ?? "";

/** technology-14-36 (データ構造): 2009h21a-q054 keyed イ, 2011h23tokubetsu-q058 keyed イ; neither in a 中問 group. */
const Q1 = "2009h21a-q054";
const Q2 = "2011h23tokubetsu-q058";
const GROUP = [Q1, Q2];
const SET_URL = `/ja/practice?ids=${GROUP.join(",")}`;
/** the single-question page: the explanation unanswered, anchor `<qid>:reveal` */
const Q1_PAGE = `/ja/practice/q/${Q1}`;
/** questions.json source_label (the thread title in the index). */
const Q1_LABEL = "平成21年度 秋期 ITパスポート試験 問54";
const Q2_LABEL = "平成23年度 特別試験 ITパスポート試験 問58";
const REPLY_MARK = "後入れ先出し（LIFO）です。";

const threadKey = (anchorId: string) => `itp:sensei:thread:question.${encodeURIComponent(anchorId)}:v1`;
/** the question on screen */
const face = (page: Page) => page.locator("main article[id]").first();
/** ア = 0, イ = 1, … */
const choiceButton = (page: Page, i: number) => letterButton(page, LETTERS[i]!);
/** the explanation pane's 「AI 先生に聞く」 (one question on screen → one button) */
const askButton = (page: Page) => page.getByTestId("ask-sensei");
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

/** Practice group: move to `id` (←/→), answer it with choice `i` unless the restored group already
 *  did, then open the panel. "reveal": the single-question page is on screen, just open the panel. */
async function openPanel(page: Page, id: string, choiceIndex: number | "reveal"): Promise<void> {
  if (choiceIndex !== "reveal") {
    await expect(async () => {
      const at = GROUP.indexOf((await face(page).getAttribute("id")) ?? "");
      const want = GROUP.indexOf(id);
      if (at !== want) await page.keyboard.press(at < want ? "ArrowRight" : "ArrowLeft");
      await expect(face(page)).toHaveAttribute("id", id, { timeout: 500 });
    }).toPass();
    const btn = choiceButton(page, choiceIndex);
    if ((await btn.getAttribute("aria-pressed")) !== "true") {
      await expect(async () => {
        await btn.click();
        await expect(btn).toHaveAttribute("aria-pressed", "true", { timeout: 500 });
      }).toPass();
    }
  }
  await askButton(page).click();
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
  await expect(face(page)).toHaveAttribute("id", Q1);
  await expect(askButton(page)).toHaveCount(0); // not before answering

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
  await expect(askButton(page)).toBeFocused();
  await expect(face(page)).toHaveAttribute("id", Q1); // Esc / the panel's keys never moved the group
  expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
  expect(consoleCsp).toEqual([]);

  // reload: the group is restored (イ still picked) and reopens the same thread
  await page.reload();
  await openPanel(page, Q1, 1);
  await expect(log(page)).toContainText("なぜイが正解なのですか？");
  await expect(log(page)).toContainText(REPLY_MARK);

  // the key is in no localStorage value except its own key; no /api/learning traffic
  const stored = await page.evaluate(() =>
    Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k) ?? ""])),
  );
  expect(Object.keys(stored)).toEqual(
    expect.arrayContaining([KEY_STORAGE, "itp:sensei:index:v1", threadKey(`${Q1}:イ`), "itp:learn:v2"]),
  );
  for (const [k, v] of Object.entries(stored)) {
    if (k !== KEY_STORAGE) expect(v, k).not.toContain(KEY);
  }
  expect(learning).toEqual([]);

  // another choice (ア, in a new group) is another thread (§0-4)
  await page.keyboard.press("Escape");
  await page.goto(`${SET_URL}&run=1`);
  await openPanel(page, Q1, 0);
  await expect(log(page)).toContainText(S.emptyHint);
  await expect(log(page)).not.toContainText("なぜイが正解なのですか？");
  expect(fake.requests).toHaveLength(1);
});

test("panel layout: full-screen drawer on a phone, right drawer when wide", async ({ page }) => {
  fake = await fakeAnthropic(page);
  await presetKey(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(Q1_PAGE);
  await openPanel(page, Q1, "reveal");
  const phone = await panel(page).boundingBox();
  expect(phone).toEqual({ x: 0, y: 0, width: 390, height: 844 });

  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1280, height: 800 });
  await askButton(page).click();
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
  await page.goto(Q1_PAGE);
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

test("move to another question while the first reply is in flight: each thread keeps its own messages", async ({
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
  await openPanel(page, Q2, 0); // → moves the group to Q2, answers ア
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
  await openPanel(page, Q1, 1); // the restored group is on Q2: ← back to Q1
  await expect(log(page)).toContainText("問1 の質問");
  await expect(log(page)).not.toContainText("問2 の質問");
  await expect(log(page)).not.toContainText(REPLY_MARK);
});

test("keys typed in the panel input never act on the practice group", async ({ page }) => {
  fake = await fakeAnthropic(page);
  await presetKey(page);
  await page.goto(SET_URL);
  await openPanel(page, Q1, 1); // イ
  await input(page).focus();
  for (const k of ["1", "4", "ArrowRight", "ArrowLeft"]) await page.keyboard.press(k);
  await expect(input(page)).toHaveValue("14"); // the digits reached the input
  await page.keyboard.press("Escape");
  await expect(panel(page)).toHaveCount(0);
  await expect(face(page)).toHaveAttribute("id", Q1); // → / ← did not move the group
  await expect(choiceButton(page, 1)).toHaveAttribute("aria-pressed", "true");
  for (const i of [0, 2, 3]) await expect(choiceButton(page, i)).toHaveAttribute("aria-pressed", "false");
  const answers = await page.evaluate(() => {
    const raw = localStorage.getItem("itp:learn:v2");
    return raw ? (JSON.parse(raw) as { a: Record<string, unknown[]> }).a : {};
  });
  expect(answers[Q1]).toHaveLength(1); // only the one click
  expect(answers[Q2]).toBeUndefined();
  expect(fake.requests).toEqual([]);
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
  await expect(page.getByLabel(S.freeLabel)).toBeEnabled();
  await page.getByLabel(S.freeLabel).fill("機能要件とは？");
  await expect(page.getByRole("button", { name: S.send })).toBeDisabled();
  await expect(page.getByRole("button", { name: S.send })).toHaveAccessibleDescription(S.keyMissing);

  await page.getByLabel(S.keyLabel).fill(KEY);
  await page.getByRole("button", { name: S.keySave }).click();
  await expect(keyStatus(page)).toHaveText(savedAs("…wxyz"));
  await expect(page.getByLabel(S.keyLabel)).toHaveValue("");
  await expect(howto).toHaveCount(0);
  await expect(page.getByRole("button", { name: S.send })).toBeEnabled();
  await expect(page.getByRole("button", { name: S.send })).not.toHaveAttribute("aria-describedby");
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
  const q2Href = `/ja/practice/q/${Q2}`;
  const q1Href = `/ja/practice/q/${Q1}`;
  await expect(rows.nth(0).getByRole("link")).toHaveAttribute("href", q2Href); // newest first
  await expect(rows.nth(1).getByRole("link")).toHaveAttribute("href", q1Href);
  for (const row of [rows.nth(0), rows.nth(1)]) {
    await expect(row).toContainText(S.kind_question);
    await expect(row.locator("time")).toHaveAttribute("datetime", /^\d{4}-\d{2}-\d{2}T/);
  }

  // the link lands on the question's own page
  await rows.nth(1).getByRole("link").click();
  await expect(page).toHaveURL(new RegExp(`${q1Href}$`));
  await expect(page.locator(`article[id="${Q1}"]`)).toBeInViewport();

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


// Owner sync is only reachable on a local server with OWNER_KEY (see learning-owner.spec.ts);
// without E2E_OWNER_KEY this test is not registered (a plain run never sets the owner cookie).
if (OWNER_KEY) {
  test("owner: /api/learning PUT bodies never contain the key", async ({ page, baseURL }) => {
    const host = baseURL ? new URL(baseURL).hostname : "";
    expect(["localhost", "127.0.0.1"]).toContain(host);
    fake = await fakeAnthropic(page);
    const bodies: string[] = [];
    // a predicate, not "**/api/learning": the v2 client's GET is /api/learning?v=2
    await page.route((url) => url.pathname === "/api/learning", async (route) => {
      const req = route.request();
      if (req.method() === "PUT") bodies.push(req.postData() ?? "");
      await route.fulfill({ status: 200, json: req.method() === "PUT" ? req.postDataJSON() : encodeRecord(emptyRecord()) });
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


// ── D-181 Phase B: weak-topic review (today 「AI 分析」 → topic page, AI 先生 opens) ──
//
//  10. Today page: the weak-topic row of a seeded record (≥ 5 answers, not all correct) with its
//      「AI 分析」 link; the today page loads no AI SDK chunk. Clicking it (click intent in
//      sessionStorage) opens the topic page /practice/browse/<topic>?review=1 → the flag is removed
//      from the URL (no RSC refetch), the panel opens and sends the opener exactly once; the
//      request's anchor holds only that topic's question ids, re-judged answers, the learner's
//      distractor notes and the not-yet-answered questions with their terms; an in-dialog
//      `#sensei-input` link leaves the panel open, a `#<question_id>` link closes it, scrolls to that
//      question's row and focuses it. A reload and a second 「AI 分析」 click (same day → same thread,
//      not empty) send nothing; /sensei links the review thread back to the topic page with its date
//      (`?thread=`), never the flag.
//  11. Arriving without a key: nothing is sent until the key is saved, then the opener goes out
//      once; closing / reopening / toggling settings never re-sends.
//  12. Empty record: the today page's weak-topic empty line; the topic page's launcher opens the
//      review thread without sending anything.
//  13. `?review=1` without a click intent (bookmark / copied link / a legacy /quiz review link): the
//      panel opens with the opener as a suggestion chip, 0 requests.
//  14. A past day's review thread: its /sensei row (`?thread=<date>`) opens that thread on the topic
//      page with its history, the parameter removed, 0 requests.

const REVIEW_TOPIC = "technology-14-36"; // データ構造, 7 問
const REVIEW_URL = `/ja/practice/browse/${REVIEW_TOPIC}`;
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
const SEED: [string, (typeof LETTERS)[number], boolean][] = [
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
  // technology-20-53: 0/4 — fewer than 5 answers, never a weak topic
  ["2011h23tokubetsu-q098", "ア", false],
  ["2012h24h-q072", "ア", false],
  ["2012h24h-q084", "ア", false],
  ["2013h25h-q054", "イ", false],
];

/** Seed `itp:learn:v2` with SEED (answered in 2023), once. */
const seedRecord = (page: Page): Promise<void> =>
  seedV2(page, recordWith({ attempts: attemptsOf(SEED, 1_700_000_000_000) }));

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

const weakRow = (page: Page) => page.locator(`[data-weak-row="${REVIEW_TOPIC}"]`);
const aiReview = (page: Page) => weakRow(page).getByRole("link", { name: ja.Today.aiReview });
const launcher = (page: Page) => page.getByTestId("review-launcher");

test("review: today's 「AI 分析」 opens the topic page and AI 先生 speaks first, once", async ({ page }) => {
  fake = await fakeAnthropic(page, { mode: "ok" });
  fake.reply = [
    "**誤りの傾向**: スタックとキューの取り違えが多いです。",
    `\n\n- [問題を開く](#${REVIEW_TARGET})`,
    "\n- [質問を書く](#sensei-input)",
  ];
  await presetKey(page);
  await seedRecord(page);
  const scripts = trackScripts(page);
  // RSC fetches of the topic page that are not prefetches: the link's navigation only
  // (removing ?review=1 uses history.replaceState, which refetches nothing)
  const topicFetches: string[] = [];
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (u.pathname === REVIEW_URL && r.headers()["rsc"] === "1" && !r.headers()["next-router-prefetch"]) {
      topicFetches.push(r.url());
    }
  });

  await page.goto("/ja");
  await waitForRecord(page);
  await expect(weakRow(page)).toContainText("データ構造");
  await expect(weakRow(page)).toContainText("20%");
  await expect(page.locator('[data-weak-row="technology-20-53"]')).toHaveCount(0); // < 5 answers
  await expect(aiReview(page)).toHaveAttribute("href", `${REVIEW_URL}?review=1`);
  await page.waitForLoadState("networkidle");
  expect(scripts.length).toBeGreaterThan(0);
  expect(await sdkChunks(scripts), "AI SDK chunk loaded on the today page").toEqual([]);

  await aiReview(page).click();
  await expect(panel(page)).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`${REVIEW_URL}$`)); // flag removed
  await expect(log(page).locator('[data-role="user"]')).toHaveText(`${S.you}: ${S.reviewOpener}`);
  await expect(log(page)).toContainText("スタックとキューの取り違えが多いです。");
  expect((await sdkChunks(scripts)).length, "positive control: the panel loads the SDK").toBeGreaterThan(0);

  // exactly one request, even after the dust settles
  await page.waitForTimeout(1500);
  expect(fake.requests).toHaveLength(1);
  expect(topicFetches, "RSC fetches of the topic page").toHaveLength(1);
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

  // the recommended #id link: the panel closes, that question's row is scrolled into view and focused
  await log(page).getByRole("link", { name: "問題を開く" }).click();
  await expect(panel(page)).toHaveCount(0);
  const targetRow = page.locator(`tr[id="${REVIEW_TARGET}"]`);
  await expect(targetRow).toBeInViewport();
  await expect(targetRow).toBeFocused();

  // a reload never re-sends
  await page.reload();
  await expect(targetRow).toBeVisible();
  await page.waitForTimeout(1500);
  await expect(panel(page)).toHaveCount(0);
  expect(fake.requests).toHaveLength(1);

  // /sensei: the review thread links back to the topic page with its date, without the flag
  await page.goto(SENSEI_URL);
  const row = page.getByTestId("sensei-thread").filter({ hasText: S.kind_review });
  await expect(row).toHaveCount(1);
  const today = localDate(await page.evaluate(() => Date.now()));
  await expect(row.getByRole("link", { name: "データ構造" })).toHaveAttribute("href", `${REVIEW_URL}?thread=${today}`);

  // 「AI 分析」 again (same day → same thread, not empty): the history, no new request
  await page.goto("/ja");
  await waitForRecord(page);
  await aiReview(page).click();
  await expect(panel(page)).toBeVisible();
  await expect(log(page)).toContainText("スタックとキューの取り違えが多いです。");
  await expect(page).toHaveURL(new RegExp(`${REVIEW_URL}$`));
  await page.waitForTimeout(1500);
  expect(fake.requests).toHaveLength(1);
});

test("review without a key: nothing is sent until the key is saved, then the opener once", async ({ page }) => {
  fake = await fakeAnthropic(page, { mode: "ok" });
  await seedRecord(page);
  await page.goto("/ja");
  await waitForRecord(page);
  await aiReview(page).click();
  const p = panel(page);
  await expect(p.getByTestId("sensei-key-missing")).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`${REVIEW_URL}$`));
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
  await expect(launcher(page)).toBeFocused();
  await launcher(page).click();
  await expect(log(page)).toContainText(REPLY_MARK);
  await page.waitForTimeout(1000);
  expect(fake.requests).toHaveLength(1);
  expect(JSON.stringify(fake.requests[0]!.body.messages)).toContain(S.reviewOpener);
});

test("review with an empty record: the today page's empty line; the topic page's launcher sends nothing", async ({
  page,
}) => {
  fake = await fakeAnthropic(page, { mode: "ok" });
  await presetKey(page);
  await page.goto("/ja");
  await waitForRecord(page);
  await expect(page.locator('[data-empty="weak"]')).toHaveText(ja.Today.weakEmpty);
  await expect(page.locator("[data-weak-row]")).toHaveCount(0);

  await page.goto(REVIEW_URL);
  await expect(launcher(page)).toBeEnabled(); // disabled until the record has loaded
  await launcher(page).click();
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
  await page.goto(`${REVIEW_URL}?review=1`);
  await expect(panel(page)).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`${REVIEW_URL}$`)); // flag removed
  await expect(log(page)).toContainText(S.reviewEmptyHint);
  await expect(panel(page).getByRole("button", { name: S.reviewOpener })).toBeVisible(); // a suggestion chip
  await page.waitForTimeout(1500);
  expect(fake.requests).toHaveLength(0);

  // a stale intent (> 30 s) for this topic does not count either
  await page.keyboard.press("Escape");
  await page.evaluate((topicId) => {
    sessionStorage.setItem("itp:sensei:review-intent", JSON.stringify({ topicId, at: Date.now() - 31_000 }));
  }, REVIEW_TOPIC);
  await page.goto(`${REVIEW_URL}?review=1`);
  await expect(panel(page)).toBeVisible();
  await page.waitForTimeout(1500);
  expect(fake.requests).toHaveLength(0);
  expect(await page.evaluate(() => sessionStorage.getItem("itp:sensei:review-intent"))).toBeNull(); // consumed

  // today's 「AI 分析」 (a fresh intent) sends exactly one request
  await page.goto("/ja");
  await waitForRecord(page);
  await aiReview(page).click();
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
  await expect(link).toHaveAttribute("href", `${REVIEW_URL}?thread=${PAST}`);
  await link.click();
  await expect(panel(page)).toBeVisible();
  await expect(log(page)).toContainText("過去の復習の返答です。");
  await expect(page).toHaveURL(new RegExp(`${REVIEW_URL}$`)); // parameter removed
  await page.waitForTimeout(1500);
  expect(fake.requests).toHaveLength(0);

  // a malformed date opens nothing
  await page.goto(`${REVIEW_URL}?thread=2026-02-30`);
  await expect(launcher(page)).toBeEnabled();
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
  term_zh: string;
  definition_jp: string;
  explanation_jp: string;
  memory_hook_jp: string;
  analogy_jp: string;
  definition_en: string;
  analogy_en: string;
  definition_zh: string;
  explanation_zh: string;
  memory_hook_zh: string;
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


// ── D-181 Phase C (Task C2): the free question on /sensei ──
//
//  19. No AI SDK chunk on /sensei until the free-question input is focused. A question
//      naming dictionary terms → one GET /api/sensei/terms with their ids (order of
//      appearance) → the panel opens and sends the question once; the anchor holds
//      every sense of those terms (JP definition, explanation and memory hook — ≤ 3
//      terms — under the unit titles); the thread is kind "free", anchorId free:<base36>,
//      title = the question. Reopened from its /sensei row (a button, no link) after
//      a reload: the stored conversation shows, the anchor is derived again from the
//      first question, and the follow-up request's system text equals the first's.
//  20. A question naming no term: no term request, the anchor says
//      「該当する教材の項目なし」 with the general-knowledge allowance; a second
//      question is a second free thread.
//  21. The term request fails: while it is pending the input is read-only and the form
//      aria-busy; then a notice, the question stays, nothing is sent.
//  21b. A free thread row whose first question is not stored: its own notice (not the
//      terms-load one), no panel, no request.
//  22. /zh: a zh spelling found only in E-R図's second dictionary sense (the strategy
//      unit's 「E-R 图」; technology senses come first) matches; the request carries locale=zh and the anchor holds both senses, each
//      with its JP original and zh definition, explanation and memory hook.

const ISO_TERM = "ISO/IEC 27000";

/** Every unit's sense of `term` with that unit's JP title (corpus files in name order). */
function corpusSenseUnits(term: string): { titleJp: string; t: CorpusTerm }[] {
  return readdirSync(UNITS_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .flatMap((f) => {
      const u = corpusUnit(f.slice(0, -".json".length));
      return u.terms.filter((t) => t.term === term).map((t) => ({ titleJp: u.title_jp, t }));
    });
}
const freeInput = (page: Page) => page.getByLabel(S.freeLabel);
const freeSend = (page: Page) => page.getByTestId("sensei-free-send");

/** URLs of the /api/sensei/terms requests the page makes. */
function trackTermRequests(page: Page): string[] {
  const urls: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname === "/api/sensei/terms") urls.push(r.url());
  });
  return urls;
}

async function senseiIndex(page: Page): Promise<{ kind: string; anchorId: string; title: string }[]> {
  const raw = await page.evaluate(() => localStorage.getItem("itp:sensei:index:v1"));
  const index = JSON.parse(raw ?? "null") as { threads: { kind: string; anchorId: string; title: string }[] };
  return index.threads.map(({ kind, anchorId, title }) => ({ kind, anchorId, title }));
}

test("free question: no AI SDK before focus; matched definitions in the anchor; reopening sends the same anchor", async ({
  page,
}) => {
  fake = await fakeAnthropic(page);
  await presetKey(page);
  const scripts = trackScripts(page);
  const termRequests = trackTermRequests(page);

  await page.goto(SENSEI_URL);
  await expect(freeSend(page)).toBeDisabled(); // nothing typed yet
  await page.waitForLoadState("networkidle");
  expect(await sdkChunks(scripts), "AI SDK loaded before focus").toEqual([]);
  await freeInput(page).focus();
  await expect.poll(async () => (await sdkChunks(scripts)).length, "AI SDK chunk after focus").toBeGreaterThan(0);

  const question = `${TERM}と ${ISO_TERM} の関係は？`;
  await freeInput(page).fill(question);
  await freeSend(page).click();
  await expect(panel(page)).toBeVisible();
  await expect(log(page)).toContainText(REPLY_MARK);
  await expect(log(page).locator('[data-role="user"]')).toHaveText([`${S.you}: ${question}`]);

  expect(termRequests).toHaveLength(1);
  const params = new URL(termRequests[0]!).searchParams;
  expect(params.get("ids")).toBe([TERM_ID, termId(ISO_TERM)].join(","));
  expect(params.get("locale")).toBe("ja");

  expect(fake.requests).toHaveLength(1);
  const first = systemText(fake.requests[0]!);
  expect(first).toContain("回答言語: 日本語");
  expect(first).toContain("## 自由質問");
  expect(first).toContain("### 関連用語（2 語、質問に出てきた順）");
  expect(first).toContain(`#### 1. ${TERM}`);
  expect(first).toContain(`#### 2. ${ISO_TERM}`);
  // 機能要件 is taught in 2 units: both senses, each under its unit's JP title
  const senses = corpusSenseUnits(TERM);
  expect(senses).toHaveLength(2);
  // 2 terms (≤ 3): each sense carries its explanation and memory hook too
  const jpSense = ({ titleJp, t }: { titleJp: string; t: CorpusTerm }) =>
    `単元「${titleJp}」\n定義（日本語原文）: ${t.definition_jp}\n解説（日本語原文）: ${t.explanation_jp}\n覚え方（日本語原文）: ${t.memory_hook_jp}`;
  for (const sense of senses) expect(first).toContain(jpSense(sense));
  const iso = corpusSenseUnits(ISO_TERM);
  expect(iso).toHaveLength(1);
  expect(first).toContain(jpSense(iso[0]!));
  expect(first).not.toContain("定義（英語）");
  expect(first).not.toContain("定義だけを示します");
  expect(first).not.toContain("該当する教材の項目なし");

  await page.keyboard.press("Escape");
  await expect(panel(page)).toHaveCount(0);
  await expect(freeInput(page)).toBeFocused();
  await expect(freeInput(page)).toHaveValue("");
  const threads = await senseiIndex(page);
  expect(threads).toHaveLength(1);
  expect(threads[0]!.kind).toBe("free");
  expect(threads[0]!.anchorId).toMatch(/^free:[0-9a-z]+$/);
  expect(threads[0]!.title).toBe(question);
  // the list was re-read on close
  await expect(page.getByTestId("sensei-thread")).toHaveCount(1);

  // reopen after a reload: in place, from the row's button
  await page.reload();
  const row = page.getByTestId("sensei-thread");
  await expect(row).toHaveCount(1);
  await expect(row).toContainText(S.kind_free);
  await expect(row.getByRole("link")).toHaveCount(0);
  await row.getByTestId("sensei-thread-open").click();
  await expect(panel(page)).toBeVisible();
  await expect(log(page)).toContainText(question);
  await expect(log(page)).toContainText(REPLY_MARK);
  expect(termRequests).toHaveLength(2);
  expect(termRequests[1]).toBe(termRequests[0]);

  await ask(page, "もう少し詳しく教えてください");
  await expect(log(page).locator('[data-role="assistant"]')).toHaveCount(2);
  expect(fake.requests).toHaveLength(2);
  expect(systemText(fake.requests[1]!)).toBe(first);
  expect(fake.requests[1]!.body.messages?.map((m) => m.role)).toEqual(["user", "assistant", "user"]);

  await page.keyboard.press("Escape");
  await expect(row.getByTestId("sensei-thread-open")).toBeFocused();
  expect((await senseiIndex(page)).map((t) => t.anchorId)).toEqual([threads[0]!.anchorId]);
});

test("free question without a dictionary term: 「該当する教材の項目なし」 anchor, no term request; each question is a new thread", async ({
  page,
}) => {
  fake = await fakeAnthropic(page);
  await presetKey(page);
  const termRequests = trackTermRequests(page);

  await page.goto(SENSEI_URL);
  await freeInput(page).fill("今日はいい天気ですね");
  await freeSend(page).click();
  await expect(log(page)).toContainText(REPLY_MARK);
  expect(termRequests).toEqual([]);
  expect(fake.requests).toHaveLength(1);
  const system = systemText(fake.requests[0]!);
  expect(system).toContain("## 自由質問");
  expect(system).toContain("該当する教材の項目なし");
  expect(system).toContain("一般的な知識で答えてかまいません");
  expect(system).not.toContain("#### 1.");

  await page.keyboard.press("Escape");
  await freeInput(page).fill("こんにちは");
  await freeSend(page).click();
  await expect(log(page).locator('[data-role="user"]')).toHaveText([`${S.you}: こんにちは`]);
  await expect(log(page)).toContainText(REPLY_MARK);
  await page.keyboard.press("Escape");
  const threads = await senseiIndex(page);
  expect(threads.map((t) => t.title)).toEqual(["こんにちは", "今日はいい天気ですね"]);
  expect(new Set(threads.map((t) => t.anchorId)).size).toBe(2);
  expect(fake.requests).toHaveLength(2);
});

test("free question: a failed term request shows a notice, keeps the question and sends nothing", async ({ page }) => {
  fake = await fakeAnthropic(page);
  await presetKey(page);
  let release!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/api/sensei/terms?**", async (route) => {
    await held;
    await route.fulfill({ status: 500, body: "{}" });
  });

  await page.goto(SENSEI_URL);
  await freeInput(page).fill(`${TERM}とは？`);
  await freeSend(page).click();
  // while the terms load: read-only input, busy form (C2 M2)
  await expect(freeInput(page)).toHaveAttribute("readonly", "");
  await expect(page.locator("form").filter({ has: freeInput(page) })).toHaveAttribute("aria-busy", "true");
  release();
  await expect(page.getByTestId("sensei-free-failed")).toHaveText(S.freeTermsFailed);
  await expect(freeInput(page)).not.toHaveAttribute("readonly");
  await expect(page.locator("form").filter({ has: freeInput(page) })).toHaveAttribute("aria-busy", "false");
  await expect(freeInput(page)).toHaveValue(`${TERM}とは？`);
  await expect(panel(page)).toHaveCount(0);
  expect(fake.requests).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem("itp:sensei:index:v1"))).toBeNull();
});

test("free thread without a stored first question: the notice, no panel, no request (C2 M3)", async ({ page }) => {
  fake = await fakeAnthropic(page);
  await presetKey(page);
  const termRequests = trackTermRequests(page);
  await page.addInitScript(() => {
    if (localStorage.getItem("itp:sensei:index:v1") !== null) return;
    const thread = { id: "free.free%3Alost", kind: "free", anchorId: "free:lost", title: "失われた質問", updatedAt: "2026-10-01T00:00:00.000Z" };
    localStorage.setItem("itp:sensei:index:v1", JSON.stringify({ v: 1, threads: [thread] }));
  });

  await page.goto(SENSEI_URL);
  await page.getByTestId("sensei-thread-open").click();
  await expect(page.getByTestId("sensei-thread-missing")).toHaveText(S.threadMissing);
  await expect(page.getByTestId("sensei-reopen-failed")).toHaveCount(0);
  await expect(panel(page)).toHaveCount(0);
  expect(termRequests).toEqual([]);
  expect(fake.requests).toEqual([]);
});

test("free question (zh): a later sense's zh spelling matches; every sense with its JP original and zh definition", async ({
  page,
}) => {
  fake = await fakeAnthropic(page);
  await presetKey(page);
  const termRequests = trackTermRequests(page);
  const ER = "E-R図";
  const senses = corpusSenseUnits(ER);
  // corpus file order (strategy first); the dictionary puts the technology sense first
  expect(senses.map((s) => s.t.term_zh)).toEqual(["E-R 图", "E-R图（实体-关联图）"]);

  await page.goto("/zh/sensei");
  await page.getByLabel(zh.Sensei.freeLabel).fill("E-R 图是什么？");
  await freeSend(page).click();
  await expect(log(page)).toContainText(REPLY_MARK);

  expect(termRequests).toHaveLength(1);
  const params = new URL(termRequests[0]!).searchParams;
  expect(params.get("ids")).toBe(termId(ER));
  expect(params.get("locale")).toBe("zh");
  const system = systemText(fake.requests[0]!);
  expect(system).toContain("回答言語: 簡体字中国語");
  expect(system).toContain(`#### 1. ${ER}`);
  expect(system).toContain("この用語は 2 つの単元で扱われています。");
  for (const { titleJp, t } of senses) {
    expect(system).toContain(
      [
        `単元「${titleJp}」`,
        `定義（日本語原文）: ${t.definition_jp}`,
        `定義（簡体字中国語）: ${t.definition_zh}`,
        `解説（日本語原文）: ${t.explanation_jp}`,
        `解説（簡体字中国語）: ${t.explanation_zh}`,
        `覚え方（日本語原文）: ${t.memory_hook_jp}`,
        `覚え方（簡体字中国語）: ${t.memory_hook_zh}`,
      ].join("\n"),
    );
  }
});
