// D-181 Task A4 — the quiz 「AI 先生に聞く」 entry and the AI 先生 panel, against a
// fake Anthropic API (helpers/fakeAnthropic.ts). No test reaches the real API:
// every request to api.anthropic.com is answered by the fake or recorded as
// unhandled, and each test ends by asserting the unhandled list is empty.
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
//   4. Refusal → the refusal notice, the question back in the input.
//   5. Clear while a reply is in flight → reload → the thread is empty. This checks
//      the visible result only: the fake holds the whole response (see
//      helpers/fakeAnthropic.ts), so the clear lands before any chunk. The race of a
//      chunk arriving after the clear is proven by the threadChat unit test
//      ("clearThread() while streaming …"), not here.
//   6. Switch to another question's panel while the first reply is in flight →
//      each thread keeps only its own messages.
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
//
// Runs against a local prod build (the production CSP is then active, so a
// request to api.anthropic.com also proves connect-src allows it):
//   npm run build && npx next start -p 3200
//   PLAYWRIGHT_BASE_URL=http://localhost:3200 npx playwright test e2e/sensei.spec.ts --retries=0

import { test, expect, type Page } from "@playwright/test";

import ja from "../messages/ja.json";
import { fakeAnthropic, type FakeAnthropic } from "./helpers/fakeAnthropic";

const S = ja.Sensei;
const KEY = "sk-ant-test-0000000000000000wxyz";
const KEY_STORAGE = "itp:sensei:key:v1";
const OWNER_KEY = process.env.E2E_OWNER_KEY ?? "";

/** quiz_index.json → technology-14-36 (データ構造, 7 問): 2009h21a-q054 keyed イ, 2011h23tokubetsu-q058 keyed イ. */
const SET_URL = "/ja/quiz?mode=topic&id=technology-14-36";
const Q1 = "2009h21a-q054";
const Q2 = "2011h23tokubetsu-q058";
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

/** Set by each test that installs the fake; reset before every test so a test
 *  without one never reads the previous test's fake. */
let fake: FakeAnthropic | undefined;

test.beforeEach(() => {
  fake = undefined;
});

test.afterEach(() => {
  expect(fake?.unhandled ?? [], "requests to api.anthropic.com not answered by the fake").toEqual([]);
});

test("ask about an answered question: key setup, streamed reply, anchor in system, thread kept per choice", async ({
  page,
}) => {
  fake = await fakeAnthropic(page, { mode: "ok", delayMs: 800 });
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

