// D-180 §0-7 / D-190 — owner sync state machine (Phase 3 fix wave items 2 / 3 / 5 / 7),
// on record v2: the client GETs /api/learning?v=2 and PUTs v2 wire. Stage 7 Task 15: on the new
// pages (the practice group /ja/practice?ids=…, the topic page /ja/practice/browse/<topic>).
//
// Hermetic: every /api/learning request is answered by `page.route` from an
// in-test "server" (a fixed remote record, merged with each v2 PUT body and
// answered in v2 wire exactly as the real route's v2 path does), so no Redis
// is touched. Run it against a LOCAL prod
// build whose `next start` has OWNER_KEY set and every KV_* / UPSTASH_* var set
// to the empty string (empty, not unset: .env.local may define them), e.g.
//
//   OWNER_KEY=k KV_REST_API_URL= KV_REST_API_TOKEN= UPSTASH_REDIS_REST_URL= \
//     UPSTASH_REDIS_REST_TOKEN= npx next start -p 3100
//   E2E_OWNER_KEY=k PLAYWRIGHT_BASE_URL=http://localhost:3100 \
//     npx playwright test e2e/learning-owner.spec.ts
//
// playwright.config.ts ignores this spec unless E2E_OWNER_KEY is set, and the
// spec refuses any base URL that is not localhost / 127.0.0.1.
// `E2E_OWNER_KEY` must equal the server's OWNER_KEY: each test first opens
// `/ja/glossary?owner_key=<key>` once so the middleware sets the itp_owner cookie.
//
// Asserted:
//   (a) one GET per page load;
//   (b) no PUT before the GET settles (the GET is held while the user answers);
//   (c) debounced PUT body = merge(local, remote); on page hide the PUT is sent
//       at once and carries only the delta since the last synced record;
//   (d) once the PUT response is merged back, no further PUT;
//   item 7: while the GET is pending an owner's topic-page accuracy stays
//       empty (no local-only flash), then shows counts including the remote record.
//   v1 (Review Focus 1): an `itp:learn:v1` an old tab left on the owner's device is upgraded and
//       goes up in the v2 PUT (src "1"); the v1 key is untouched. A v1 *client's* own GET / PUT
//       against the real route is pinned by src/app/api/learning/__tests__/v1ClientCompat.test.ts —
//       this spec stays hermetic (the local server has no Redis, so the real route would answer 503).

import { test, expect, type Page, type Route } from "@playwright/test";

import {
  emptyRecord,
  encodeRecord,
  mergeRecords,
  parseRecord,
  type LearningRecord,
  type WireRecordV2,
} from "../src/lib/learning/record";

const OWNER_KEY = process.env.E2E_OWNER_KEY ?? "";

/** quiz_index.json → technology-14-36 (データ構造, 7 問); 2009h21a-q054 is in it, keyed イ. */
const TOPIC_ID = "technology-14-36";
const QUESTION_ID = "2009h21a-q054";
const SET_URL = `/ja/practice?ids=${QUESTION_ID}`;
const TOPIC_URL = `/ja/practice/browse/${TOPIC_ID}`;

/** The fixed "server copy": one answer outside the topic + one unit read. */
const REMOTE: LearningRecord = {
  ...emptyRecord(),
  attempts: { "2024r06-q001": [{ at: 1_000, choice: "イ", correct: true, src: "practice" }] },
  unitsRead: { "management-08-25-u01": 500 },
};

interface Sync {
  gets: number;
  /** URL of every GET (asserted after the fact — an expect inside the route handler would only hang). */
  getUrls: string[];
  /** PUT bodies as sent (v2 wire). */
  puts: WireRecordV2[];
  /** PUTs that arrived while the GET was still held. */
  putsBeforeGetSettled: number;
  releaseGet(): void;
}

/** Serve /api/learning (any query) from memory. The GET is held until releaseGet() unless `holdGet` is false. */
async function mockServer(page: Page, remote: LearningRecord, holdGet: boolean): Promise<Sync> {
  let server = mergeRecords(remote, emptyRecord());
  let getSettled = false;
  let release!: () => void;
  const gate = holdGet ? new Promise<void>((r) => (release = r)) : Promise.resolve();
  const sync: Sync = { gets: 0, getUrls: [], puts: [], putsBeforeGetSettled: 0, releaseGet: () => release?.() };
  // a predicate, not "**/api/learning": globs match the query too, and the GET is ?v=2
  await page.route((url) => url.pathname === "/api/learning", async (route: Route) => {
    const req = route.request();
    if (req.method() === "GET") {
      sync.gets++;
      sync.getUrls.push(req.url());
      await gate;
      getSettled = true;
      await route.fulfill({ status: 200, json: encodeRecord(server) });
      return;
    }
    if (req.method() === "PUT") {
      const body = req.postDataJSON() as WireRecordV2;
      sync.puts.push(body);
      if (!getSettled) sync.putsBeforeGetSettled++;
      const incoming = parseRecord(body);
      if (!incoming) {
        await route.fulfill({ status: 400, json: { error: "invalid learning record" } });
        return;
      }
      server = mergeRecords(server, incoming);
      await route.fulfill({ status: 200, json: encodeRecord(server) });
      return;
    }
    await route.fulfill({ status: 405, json: { error: "unexpected method" } });
  });
  return sync;
}

/** The v2 client always asks for v2 (without ?v=2 the real route answers v1). */
function expectAllGetsV2(sync: Sync): void {
  expect(sync.getUrls.length).toBeGreaterThan(0);
  for (const u of sync.getUrls) expect(new URL(u).searchParams.get("v")).toBe("2");
}

// Never send the owner key anywhere but a local server (prod traces / retries would capture it).
test.beforeEach(({ baseURL }) => {
  const host = baseURL ? new URL(baseURL).hostname : "";
  if (host !== "localhost" && host !== "127.0.0.1") {
    throw new Error(
      `learning-owner.spec.ts runs only against a local server (PLAYWRIGHT_BASE_URL=http://localhost:<port>), got "${baseURL ?? ""}".`,
    );
  }
});

async function becomeOwner(page: Page): Promise<void> {
  if (!OWNER_KEY) {
    throw new Error("E2E_OWNER_KEY is not set — it must equal the local server's OWNER_KEY (see the header).");
  }
  // The glossary mounts no LearningRecordProvider (the today page `/ja` does), so this
  // visit issues no /api/learning request.
  await page.goto(`/ja/glossary?owner_key=${encodeURIComponent(OWNER_KEY)}`);
  await expect(page).toHaveURL(/\/ja\/glossary$/);
  const cookies = await page.context().cookies();
  expect(cookies.map((c) => c.name)).toContain("itp_owner");
}

const choice = (page: Page, letter: string) =>
  page.locator(`main[data-session] article[id="${QUESTION_ID}"] li[data-letter="${letter}"]`);

/** ア — wrong (keyed イ); retried until the session has hydrated and restored. */
async function answerFirstChoice(page: Page): Promise<void> {
  const btn = choice(page, "ア").locator("button");
  await expect(async () => {
    await btn.click();
    await expect(btn).toHaveAttribute("aria-pressed", "true", { timeout: 500 });
  }).toPass();
  await expect(choice(page, "イ")).toHaveAttribute("data-state", "correct");
}

/** Simulate the tab being hidden / the page being unloaded. */
const hidePage = (page: Page) =>
  page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("pagehide"));
  });

test("owner topic page: accuracy waits for the GET, then includes the remote record", async ({ page }) => {
  const remote: LearningRecord = {
    ...REMOTE,
    attempts: { ...REMOTE.attempts, [QUESTION_ID]: [{ at: 2_000, choice: "ア", correct: false, src: "practice" }] },
  };
  const sync = await mockServer(page, remote, true);
  await becomeOwner(page);

  await page.goto(TOPIC_URL);
  const acc = page.locator("[data-accuracy]");
  const row = page.locator(`[data-question-row="${QUESTION_ID}"] [data-result]`);
  await expect(acc).toHaveCount(1);
  await expect.poll(() => sync.gets).toBe(1); // issued after the local record was loaded
  expectAllGetsV2(sync);
  await page.waitForTimeout(500);
  await expect(acc).toHaveAttribute("data-accuracy", ""); // no local-only "0/0" while the GET is pending
  await expect(row).toHaveAttribute("data-result", "");
  await expect(page.getByTestId("review-launcher")).toBeDisabled();

  sync.releaseGet();
  await expect(acc).toHaveAttribute("data-accuracy", "0/1");
  await expect(row).toHaveAttribute("data-result", "wrong");
  await expect(page.getByTestId("review-launcher")).toBeEnabled();
  // The GET response equals the merged record, so nothing goes back up.
  await page.waitForTimeout(2 * 2000 + 500);
  expect(sync.gets).toBe(1);
  expect(sync.puts).toEqual([]);
});

test("owner practice: no PUT before the GET; debounced PUT = merge(local, remote); no second PUT", async ({
  page,
}) => {
  const sync = await mockServer(page, REMOTE, true);
  await becomeOwner(page);
  await page.goto(SET_URL);
  await expect.poll(() => sync.gets).toBe(1);
  expectAllGetsV2(sync);

  await answerFirstChoice(page); // while the GET is held
  await page.waitForTimeout(2000 + 1000); // past the debounce
  expect(sync.puts).toEqual([]);

  sync.releaseGet();
  await expect.poll(() => sync.puts.length, { timeout: 6000 }).toBe(1);
  expect(sync.putsBeforeGetSettled).toBe(0);
  const body = parseRecord(sync.puts[0]);
  expect(body).not.toBeNull();
  const answer = body!.attempts[QUESTION_ID]!;
  expect(answer).toHaveLength(1);
  expect(answer[0]).toMatchObject({ choice: "ア", correct: false, src: "practice" });
  const local: LearningRecord = { ...emptyRecord(), attempts: { [QUESTION_ID]: answer } };
  expect(body).toEqual(mergeRecords(local, REMOTE));

  // The response (= merged record) is merged back: no ping-pong.
  await page.waitForTimeout(2 * 2000 + 500);
  expect(sync.puts).toHaveLength(1);
  expect(sync.gets).toBe(1);
});

test("owner practice: page hide sends the delta at once; the debounce is cancelled", async ({ page }) => {
  const sync = await mockServer(page, REMOTE, false);
  await becomeOwner(page);
  await page.goto(SET_URL);
  await expect.poll(() => sync.gets).toBe(1);
  expectAllGetsV2(sync);
  await page.waitForTimeout(300); // let the GET response merge in (remoteSettled)

  await answerFirstChoice(page);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("itp:learn:v2"))).toContain(QUESTION_ID);
  expect(await page.evaluate(() => localStorage.getItem("itp:learn:v1"))).toBeNull(); // the v1 key is never written
  await hidePage(page); // well inside the 2000 ms debounce
  await expect.poll(() => sync.puts.length, { timeout: 1500 }).toBe(1);

  // Only what the server has not seen: the new answer, none of REMOTE's entries.
  const body = sync.puts[0]!;
  expect(body.v).toBe(2);
  expect(Object.keys(body.a)).toEqual([QUESTION_ID]);
  expect(body.a[QUESTION_ID]).toHaveLength(1);
  expect(body.a[QUESTION_ID]![0]!.slice(1)).toEqual([0, 0, "p"]); // ア, wrong, practice
  expect(body.u).toEqual({});

  // visibilitychange + pagehide sent one PUT; the pending debounced PUT was
  // cancelled and the merged-back response schedules none.
  await page.waitForTimeout(2 * 2000 + 500);
  expect(sync.puts).toHaveLength(1);
  expect(sync.gets).toBe(1);
});

test("owner + an old tab's itp:learn:v1: the upgraded answers go up in the v2 PUT; the v1 key is untouched", async ({
  page,
}) => {
  const V1_QID = "2024r06-q002";
  const v1 = JSON.stringify({ v: 1, questions: { [V1_QID]: { choice: "ウ", correct: false, at: 3_000 } }, unitsRead: {} });
  await page.addInitScript((value) => {
    if (localStorage.getItem("itp:learn:v1") === null) localStorage.setItem("itp:learn:v1", value);
  }, v1);
  const sync = await mockServer(page, REMOTE, false);
  await becomeOwner(page);
  await page.goto(SET_URL);
  await expect.poll(() => sync.gets).toBe(1);
  expectAllGetsV2(sync);

  // local (v1 upgraded) differs from the server copy → one debounced PUT, then quiet
  await expect.poll(() => sync.puts.length, { timeout: 6000 }).toBe(1);
  const body = sync.puts[0]!;
  expect(body.v).toBe(2);
  expect(body.a[V1_QID]).toEqual([[3_000, 2, 0, "1"]]); // ウ, wrong, src v1
  const merged = parseRecord(body)!;
  expect(merged.attempts["2024r06-q001"]).toEqual(REMOTE.attempts["2024r06-q001"]); // the server's own entry kept
  expect(merged.v2Since).toEqual(expect.any(Number));
  expect(await page.evaluate(() => localStorage.getItem("itp:learn:v1"))).toBe(v1);

  await page.waitForTimeout(2 * 2000 + 500);
  expect(sync.puts).toHaveLength(1);
  expect(sync.gets).toBe(1);
});
