// D-180 §0-7 — owner sync state machine (Phase 3 fix wave items 2 / 3 / 5 / 7).
//
// Hermetic: every /api/learning request is answered by `page.route` from an
// in-test "server" (a fixed remote record, merged with each PUT body exactly as
// the real route does), so no Redis is touched. Run it against a LOCAL prod
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
//   item 7: while the GET is pending an owner's quiz-landing progress stays
//       empty (no local-only flash), then shows counts including the remote record.

import { test, expect, type Page, type Route } from "@playwright/test";

import ja from "../messages/ja.json";
import { mergeRecords, type LearningRecord } from "../src/lib/learning/record";

const OWNER_KEY = process.env.E2E_OWNER_KEY ?? "";

/** quiz_index.json → technology-14-36 (データ構造, 7 問); 2009h21a-q054 is in it, keyed イ. */
const TOPIC_ID = "technology-14-36";
const QUESTION_ID = "2009h21a-q054";
const SET_URL = `/ja/quiz?mode=topic&id=${TOPIC_ID}`;

/** The fixed "server copy": one answer outside the topic + one unit read. */
const REMOTE: LearningRecord = {
  v: 1,
  questions: { "2024r06-q001": { choice: "イ", correct: true, at: 1_000 } },
  unitsRead: { "management-08-25-u01": 500 },
};

interface Sync {
  gets: number;
  puts: LearningRecord[];
  /** PUTs that arrived while the GET was still held. */
  putsBeforeGetSettled: number;
  releaseGet(): void;
}

/** Serve /api/learning from memory. The GET is held until releaseGet() unless `holdGet` is false. */
async function mockServer(page: Page, remote: LearningRecord, holdGet: boolean): Promise<Sync> {
  let server = remote;
  let getSettled = false;
  let release!: () => void;
  const gate = holdGet ? new Promise<void>((r) => (release = r)) : Promise.resolve();
  const sync: Sync = { gets: 0, puts: [], putsBeforeGetSettled: 0, releaseGet: () => release?.() };
  await page.route("**/api/learning", async (route: Route) => {
    const req = route.request();
    if (req.method() === "GET") {
      sync.gets++;
      await gate;
      getSettled = true;
      await route.fulfill({ status: 200, json: server });
      return;
    }
    if (req.method() === "PUT") {
      const body = req.postDataJSON() as LearningRecord;
      sync.puts.push(body);
      if (!getSettled) sync.putsBeforeGetSettled++;
      server = mergeRecords(server, body);
      await route.fulfill({ status: 200, json: server });
      return;
    }
    await route.fulfill({ status: 405, json: { error: "unexpected method" } });
  });
  return sync;
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
  // The glossary mounts no LearningRecordProvider (`/ja` redirects to the quiz
  // landing, which does), so this visit issues no /api/learning request.
  await page.goto(`/ja/glossary?owner_key=${encodeURIComponent(OWNER_KEY)}`);
  await expect(page).toHaveURL(/\/ja\/glossary$/);
  const cookies = await page.context().cookies();
  expect(cookies.map((c) => c.name)).toContain("itp_owner");
}

const answerFirstChoice = (page: Page) =>
  page.locator(`article[id="${QUESTION_ID}"]`).getByRole("listitem").getByRole("button").first().click(); // ア — wrong

/** Simulate the tab being hidden / the page being unloaded. */
const hidePage = (page: Page) =>
  page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("pagehide"));
  });

test("owner quiz landing: progress waits for the GET, then includes the remote record", async ({ page }) => {
  const remote: LearningRecord = {
    ...REMOTE,
    questions: { ...REMOTE.questions, [QUESTION_ID]: { choice: "ア", correct: false, at: 2_000 } },
  };
  const sync = await mockServer(page, remote, true);
  await becomeOwner(page);

  await page.goto("/ja/quiz");
  const row = page.locator(`a[href*="id=${TOPIC_ID}"]`);
  await expect(row).toHaveCount(1);
  await expect.poll(() => sync.gets).toBe(1); // issued after the local record was loaded
  await page.waitForTimeout(500);
  await expect(row).not.toContainText("/7"); // no local-only "0/7 解答" while the GET is pending

  sync.releaseGet();
  await expect(row).toContainText("1/7 解答 · 正答率 0%");
  // The GET response equals the merged record, so nothing goes back up.
  await page.waitForTimeout(2 * 2000 + 500);
  expect(sync.gets).toBe(1);
  expect(sync.puts).toEqual([]);
});

test("owner quiz set: no PUT before the GET; debounced PUT = merge(local, remote); no second PUT", async ({
  page,
}) => {
  const sync = await mockServer(page, REMOTE, true);
  await becomeOwner(page);
  await page.goto(SET_URL);
  await expect.poll(() => sync.gets).toBe(1);

  await answerFirstChoice(page); // while the GET is held
  await expect(page.locator(`article[id="${QUESTION_ID}"]`).getByText(`${ja.Quiz.correctLabel}: イ`)).toBeVisible();
  await page.waitForTimeout(2000 + 1000); // past the debounce
  expect(sync.puts).toEqual([]);

  sync.releaseGet();
  await expect.poll(() => sync.puts.length, { timeout: 6000 }).toBe(1);
  expect(sync.putsBeforeGetSettled).toBe(0);
  const body = sync.puts[0]!;
  const answer = body.questions[QUESTION_ID]!;
  expect(answer).toMatchObject({ choice: "ア", correct: false });
  const local: LearningRecord = { v: 1, questions: { [QUESTION_ID]: answer }, unitsRead: {} };
  expect(body).toEqual(mergeRecords(local, REMOTE));

  // The response (= merged record) is merged back: no ping-pong.
  await page.waitForTimeout(2 * 2000 + 500);
  expect(sync.puts).toHaveLength(1);
  expect(sync.gets).toBe(1);
});

test("owner quiz set: page hide sends the delta at once; the debounce is cancelled", async ({ page }) => {
  const sync = await mockServer(page, REMOTE, false);
  await becomeOwner(page);
  await page.goto(SET_URL);
  await expect.poll(() => sync.gets).toBe(1);
  await page.waitForTimeout(300); // let the GET response merge in (remoteSettled)

  await answerFirstChoice(page);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("itp:learn:v1"))).toContain(QUESTION_ID);
  await hidePage(page); // well inside the 2000 ms debounce
  await expect.poll(() => sync.puts.length, { timeout: 1500 }).toBe(1);

  // Only what the server has not seen: the new answer, none of REMOTE's entries.
  const body = sync.puts[0]!;
  expect(Object.keys(body.questions)).toEqual([QUESTION_ID]);
  expect(body.questions[QUESTION_ID]).toMatchObject({ choice: "ア", correct: false });
  expect(body.unitsRead).toEqual({});

  // visibilitychange + pagehide sent one PUT; the pending debounced PUT was
  // cancelled and the merged-back response schedules none.
  await page.waitForTimeout(2 * 2000 + 500);
  expect(sync.puts).toHaveLength(1);
  expect(sync.gets).toBe(1);
});
