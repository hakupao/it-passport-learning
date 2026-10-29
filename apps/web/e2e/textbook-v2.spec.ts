// Stage 7 Phase 3 Task 9 Step 4 (D-196 §0-9 / §0-11) — the real v2 pilot units in the browser.
//
// Which unit / term has a `steps` figure and which has the `network` widget is read from the unit
// JSONs (data/ip/textbook/units/management-10-27-u0{1,2,3}.json), never hard-coded.
//   - steps: 次へ advances the aria-live caption and the n / N counter; 前へ on step 1 is
//     aria-disabled and keeps focus; もう一度 returns to step 1; the first scroll into view
//     (motion allowed) plays the figure once; a press stops that playback. The playback timer is
//     driven by page.clock (paused after hydration), so no step depends on wall time.
//   - reduced motion: the figure shows its last step and stays there after scrolling into view.
//   - network: a new duration changes the total and the critical path; 100 / "x" are flagged
//     (aria-invalid + visible error) and the total keeps the last valid numbers.
//   - every unit of TEXTBOOK_E2E_UNITS (comma list of v2 unit ids; default = the three pilot units;
//     batch B4: a batch sets it to its own units) × ja / zh / en: 200, block order goals → overview →
//     articles → key points → #confirm → 読了, no raw inline markup in the page text, no horizontal page
//     scroll at 390px; each of their terms' dictionary pages is 200 and markup-free.
//   The steps / network interaction tests always use the pilot units.
// No LLM call (guarded), non-owner.

import { readFileSync } from "node:fs";
import path from "node:path";

import { test, expect, type Locator, type Page } from "@playwright/test";

import en from "../messages/en.json";
import ja from "../messages/ja.json";
import zh from "../messages/zh.json";
import { termId } from "../src/lib/glossary/termId";
import { NETWORK_DAYS_MAX } from "../src/lib/textbook/figureSpec";
import { guardAnthropic } from "./helpers/fakeAnthropic";
import { waitForRecord } from "./helpers/learning";

interface PilotFig {
  kind: string;
  mode: string;
  data: { acts?: { name?: string; days: number; dummy?: boolean }[] };
  steps?: { caption_jp: string }[];
}
interface PilotUnit {
  unit_id: string;
  terms: { term: string; fig?: PilotFig | null }[];
}

const PILOT_IDS = ["management-10-27-u01", "management-10-27-u02", "management-10-27-u03"] as const;
const PILOTS: PilotUnit[] = PILOT_IDS.map(
  (id) =>
    JSON.parse(
      readFileSync(path.resolve(__dirname, `../../../data/ip/textbook/units/${id}.json`), "utf-8"),
    ) as PilotUnit,
);

/** Units of the per-unit loops: env TEXTBOOK_E2E_UNITS (comma-separated v2 unit ids), default the pilot. */
const E2E_IDS = (process.env.TEXTBOOK_E2E_UNITS ?? PILOT_IDS.join(","))
  .split(",")
  .map((s) => s.trim())
  .filter((s) => s !== "");
const E2E_UNITS: PilotUnit[] = E2E_IDS.map((id) => {
  if (!/^[a-z]+-\d{2}-\d{2}-u\d{2}$/.test(id)) throw new Error(`TEXTBOOK_E2E_UNITS: bad unit id ${JSON.stringify(id)}`);
  const u = JSON.parse(readFileSync(path.resolve(__dirname, `../../../data/ip/textbook/units/${id}.json`), "utf-8")) as PilotUnit & {
    schema_version: string;
  };
  if (u.schema_version !== "textbook-unit-v2") throw new Error(`TEXTBOOK_E2E_UNITS: ${id} is not a v2 unit`);
  return u;
});

/** The first term (unit order, then term order) whose figure matches. */
function findFig(match: (f: PilotFig) => boolean): { unitId: string; term: string; fig: PilotFig } {
  for (const u of PILOTS)
    for (const t of u.terms) if (t.fig && match(t.fig)) return { unitId: u.unit_id, term: t.term, fig: t.fig };
  throw new Error("no pilot figure matches");
}

const STEPS = findFig((f) => f.mode === "steps");
const NETWORK = findFig((f) => f.kind === "network" && f.mode === "widget");
const N = STEPS.fig.steps!.length;

const MESSAGES = { ja, zh, en } as const;
const F = ja.Figure;
/** StepStage AUTO_MS (ms per step of the first-view playback) */
const AUTO_MS = 1800;
const MARKUP = ["**", "[[jp:", "]]"];

let unhandled: string[] = [];

test.beforeEach(async ({ page }) => {
  unhandled = await guardAnthropic(page);
});

test.afterEach(() => {
  expect(unhandled, "requests to api.anthropic.com").toEqual([]);
});

const stage = (page: Page): Locator => page.locator(`article#${termId(STEPS.term)} div[role="group"]`);
const caption = (s: Locator): Locator => s.locator('p[aria-live="polite"]');
const counter = (s: Locator): Locator => s.locator("span").filter({ hasText: /^\d+ \/ \d+$/ });
const btn = (s: Locator, name: string): Locator => s.getByRole("button", { name, exact: true });

/** Open the steps unit with page.clock installed, wait for hydration, then freeze the clock. */
async function openStepsUnit(page: Page): Promise<Locator> {
  await page.clock.install();
  const res = await page.goto(`/ja/textbook/${STEPS.unitId}`);
  expect(res?.status()).toBe(200);
  await waitForRecord(page);
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
  return stage(page);
}

test(`steps figure (${STEPS.unitId} / ${STEPS.term}): 次へ / 前へ / もう一度 move the caption and the counter`, async ({
  page,
}) => {
  const s = await openStepsUnit(page);
  // first paint = the last step (no playback has run: the stage has not been in view)
  await expect(counter(s)).toHaveText(`${N} / ${N}`);
  await expect(btn(s, F.replay)).toBeVisible();

  await btn(s, F.replay).click(); // a press: the playback never starts afterwards
  await expect(counter(s)).toHaveText(`1 / ${N}`);
  const first = await caption(s).innerText();
  expect(first.length).toBeGreaterThan(0);

  // 前へ on step 1: aria-disabled but not disabled (Playwright treats aria-disabled as disabled, so
  // the press goes by keyboard and by a forced click); it does nothing and keeps focus
  const prev = btn(s, F.prev);
  await expect(prev).toHaveAttribute("aria-disabled", "true");
  expect(await prev.evaluate((b) => (b as HTMLButtonElement).disabled)).toBe(false);
  await prev.focus();
  await page.keyboard.press("Enter");
  await expect(prev).toBeFocused();
  await prev.click({ force: true });
  await expect(prev).toBeFocused();
  await expect(counter(s)).toHaveText(`1 / ${N}`);
  await expect(caption(s)).toHaveText(first);

  // 次へ walks to the last step, the caption changing each time
  const seen = [first];
  for (let i = 2; i <= N; i++) {
    await btn(s, F.next).click();
    await expect(counter(s)).toHaveText(`${i} / ${N}`);
    await expect(caption(s)).not.toHaveText(seen[seen.length - 1]!);
    seen.push(await caption(s).innerText());
  }
  expect(new Set(seen).size).toBe(N);
  await expect(prev).not.toHaveAttribute("aria-disabled", "true");

  // last step: 次へ became もう一度 → step 1
  await expect(btn(s, F.next)).toHaveCount(0);
  await btn(s, F.replay).click();
  await expect(counter(s)).toHaveText(`1 / ${N}`);
  await expect(caption(s)).toHaveText(first);

  // the clock is frozen, but even a long run plays nothing after a press
  await page.clock.runFor(AUTO_MS * (N + 1));
  await expect(counter(s)).toHaveText(`1 / ${N}`);
});

test(`steps figure: the first scroll into view plays it once; a press stops the playback`, async ({ page }) => {
  const s = await openStepsUnit(page);
  await expect(counter(s)).toHaveText(`${N} / ${N}`);

  await s.scrollIntoViewIfNeeded();
  await expect(counter(s)).toHaveText(`1 / ${N}`); // jumped to step 1
  await page.clock.runFor(AUTO_MS);
  await expect(counter(s)).toHaveText(`2 / ${N}`); // playing

  // a press stops the playback for good
  await btn(s, F.prev).click(); // step 2: 前へ is live
  await expect(counter(s)).toHaveText(`1 / ${N}`);
  await page.clock.runFor(AUTO_MS * (N + 1));
  await expect(counter(s)).toHaveText(`1 / ${N}`);
});

test(`steps figure: an untouched playback runs to the last step and stops there`, async ({ page }) => {
  const s = await openStepsUnit(page);
  await s.scrollIntoViewIfNeeded();
  await expect(counter(s)).toHaveText(`1 / ${N}`);
  for (let i = 2; i <= N; i++) {
    await page.clock.runFor(AUTO_MS);
    await expect(counter(s)).toHaveText(`${i} / ${N}`);
  }
  await page.clock.runFor(AUTO_MS * 3);
  await expect(counter(s)).toHaveText(`${N} / ${N}`);
  await expect(btn(s, F.replay)).toBeVisible();

  // scrolled away and back: it never plays a second time
  await page.evaluate(() => window.scrollTo(0, 0));
  await s.scrollIntoViewIfNeeded();
  await page.clock.runFor(AUTO_MS * 3);
  await expect(counter(s)).toHaveText(`${N} / ${N}`);
});

test("reduced motion: the steps figure shows its last step and stays there in view", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const s = await openStepsUnit(page);
  await expect(counter(s)).toHaveText(`${N} / ${N}`);
  const last = await caption(s).innerText();
  await s.scrollIntoViewIfNeeded();
  // fast-forward the frozen clock well past two playback steps (no real-time wait), then poll the final state
  await page.clock.runFor(AUTO_MS * 2 + 500);
  await expect.poll(() => counter(s).innerText()).toBe(`${N} / ${N}`);
  await expect(caption(s)).toHaveText(last);
  await expect(btn(s, F.replay)).toBeVisible();
});

test(`network widget (${NETWORK.unitId} / ${NETWORK.term}): a new duration recomputes; bad input is flagged`, async ({
  page,
}) => {
  await page.goto(`/ja/textbook/${NETWORK.unitId}`);
  await waitForRecord(page);
  const fig = page.locator(`article#${termId(NETWORK.term)} figure[data-fig="network"]`);
  const result = fig.locator('[aria-live="polite"]');
  const total = result.locator("p").first();
  const crit = result.locator("p").nth(1);
  const totalBefore = await total.innerText();
  const critBefore = await crit.innerText();
  expect(totalBefore).toMatch(/\d+/);

  // Shorten the activity on the critical path whose shortening moves the path: try each real
  // activity at 0 days until both the total and the path text change (the data decides which).
  const acts = NETWORK.fig.data.acts!.filter((a) => !a.dummy);
  const inputs = fig.locator("input[type=number]");
  await expect(inputs).toHaveCount(acts.length);
  let changed = -1;
  for (let i = 0; i < acts.length && changed < 0; i++) {
    const input = inputs.nth(i);
    await input.fill("0");
    if ((await total.innerText()) !== totalBefore && (await crit.innerText()) !== critBefore) changed = i;
    else await input.fill(String(acts[i]!.days));
  }
  expect(changed, "some activity at 0 days changes both the total and the critical path").toBeGreaterThanOrEqual(0);
  await expect(total).not.toHaveText(totalBefore);
  await expect(crit).not.toHaveText(critBefore);
  const totalAfter = await total.innerText();

  // invalid entries: aria-invalid + a visible error, the total keeps the last valid numbers
  const input = inputs.nth(changed);
  for (const bad of ["100", "x"]) {
    await input.fill("");
    if (bad === "x") await input.pressSequentially(bad);
    else await input.fill(bad);
    await expect(input).toHaveAttribute("aria-invalid", "true");
    const errId = (await input.getAttribute("aria-describedby"))!;
    await expect(page.locator(`[id="${errId}"]`)).toBeVisible();
    await expect(page.locator(`[id="${errId}"]`)).toHaveText(F.invalid.replace("{max}", String(NETWORK_DAYS_MAX)));
    await expect(total).toHaveText(totalAfter);
  }

  // 元に戻す restores the data's numbers
  await fig.getByRole("button", { name: F.reset }).click();
  await expect(total).toHaveText(totalBefore);
  await expect(crit).toHaveText(critBefore);
  await expect(input).not.toHaveAttribute("aria-invalid", "true");
});

test("v2 units at 390px: no horizontal page scroll", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const unit of E2E_UNITS) {
    await page.goto(`/ja/textbook/${unit.unit_id}`);
    await waitForRecord(page);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), unit.unit_id).toBeLessThanOrEqual(390);
  }
});

// S137 (user, b02 u10 at 390px): the term table squeezed its text columns to one character a line
// (width 100% + nowrap term column never overflows, so the scroll box never scrolled). On a phone the
// table stacks into one block per term; the pair table's aspect column keeps a readable width.
test("v2 units at 390px: term-table and pair-table text cells are readable, not one character a line", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const unit of E2E_UNITS) {
    for (const locale of ["ja", "zh", "en"] as const) {
      await page.goto(`/${locale}/textbook/${unit.unit_id}`);
      await page.evaluate(() => document.fonts.ready);
      const r = await page.evaluate(() => {
        const ov = document.querySelector('[data-part="overview"] table')!;
        const box = ov.getBoundingClientRect().width;
        const ovMin = Math.min(...[...ov.querySelectorAll("tbody td")].map((c) => c.getBoundingClientRect().width));
        const aspect = [...document.querySelectorAll('[data-part="pair"] table tbody th')].map((c) => c.getBoundingClientRect().width);
        return { box, ovMin, aspectMin: aspect.length ? Math.min(...aspect) : Infinity };
      });
      const where = `${unit.unit_id} /${locale}`;
      expect(r.ovMin, `${where} term table cell`).toBeGreaterThanOrEqual(r.box * 0.6);
      expect(r.aspectMin, `${where} pair aspect column`).toBeGreaterThanOrEqual(56);
    }
  }
});

function expectNoMarkup(text: string, where: string): void {
  for (const m of MARKUP) expect(text.includes(m), `${where}: raw ${JSON.stringify(m)} in the page text`).toBe(false);
}

for (const unit of E2E_UNITS) {
  for (const locale of ["ja", "zh", "en"] as const) {
    test(`${unit.unit_id} /${locale}: 200, goals → overview → articles → key points → #confirm → 読了, no raw markup`, async ({
      page,
    }) => {
      const res = await page.goto(`/${locale}/textbook/${unit.unit_id}`);
      expect(res?.status()).toBe(200);
      await waitForRecord(page);
      const order = await page.evaluate(() => {
        const main = document.querySelector("main:has(article)")!;
        const sel =
          '[data-part="goals"], [data-part="overview"], article, [data-part="key-points"], section#confirm, [data-part="read"]';
        const out: string[] = [];
        for (const el of main.querySelectorAll(sel)) {
          const tag = el.tagName === "ARTICLE" ? "article" : el.id === "confirm" ? "confirm" : el.getAttribute("data-part")!;
          if (out[out.length - 1] !== tag) out.push(tag);
        }
        return out;
      });
      expect(order).toEqual(["goals", "overview", "article", "key-points", "confirm", "read"]);
      await expect(page.locator("main:has(article) article")).toHaveCount(unit.terms.length);
      await expect(page.locator('main:has(article) button[data-part="read"]')).toHaveText(
        MESSAGES[locale].Textbook.readDone,
      );
      expectNoMarkup(await page.locator("body").innerText(), `${unit.unit_id} /${locale}`);
    });
  }

  test(`${unit.unit_id}: every term's dictionary page is 200 and markup-free (ja / zh / en)`, async ({ page }) => {
    for (const { term } of unit.terms) {
      for (const locale of ["ja", "zh", "en"] as const) {
        const res = await page.goto(`/${locale}/glossary/${termId(term)}`);
        expect(res?.status(), `${term} /${locale}`).toBe(200);
        await expect(page.locator("h1")).toContainText(term);
        expectNoMarkup(await page.locator("body").innerText(), `glossary ${term} /${locale}`);
      }
    }
  });
}
