// Stage 7 Phase 2 §0-1 (D-193) — GET /api/quiz/questions?topic=<topic_id>&ids=<id>,…: the full
// text (translations + explanations merged) of ≤ REVIEW_MAX_WRONG questions of one topic, for the
// AI 先生 review anchor. 0 ids or more than 5, an id that is not QUESTION_ID_RE-shaped or not in
// the topic, an unknown topic → 400. Always `no-store`. Reads the committed corpus.

import { describe, expect, it } from "vitest";

import { loadBaseQuestions } from "@/lib/quiz/quizReader";

import { GET } from "../route";

const TOPIC = "technology-14-36";
const OTHER = "technology-23-63";

const get = (qs: string): Promise<Response> => GET(new Request(`http://localhost/api/quiz/questions${qs}`));

async function idsOf(topic: string): Promise<string[]> {
  return (await loadBaseQuestions()).filter((q) => q.topic_id === topic).map((q) => q.id);
}

describe("GET /api/quiz/questions", () => {
  it("200 with the topic's questions in request order, explanations merged, no-store", async () => {
    const ids = (await idsOf(TOPIC)).slice(0, 2).reverse();
    const res = await get(`?topic=${TOPIC}&ids=${ids.join(",")}`);
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const body = (await res.json()) as { questions: { id: string; topic_id: string; explanation?: unknown; stem_zh?: string }[] };
    expect(body.questions.map((q) => q.id)).toEqual(ids);
    expect(body.questions[0]!.explanation).toBeTruthy();
    expect(body.questions.every((q) => q.topic_id === TOPIC)).toBe(true);
  });

  it("5 ids is fine, 6 → 400", async () => {
    const ids = await idsOf(TOPIC);
    expect(ids.length).toBeGreaterThanOrEqual(6);
    expect((await get(`?topic=${TOPIC}&ids=${ids.slice(0, 5).join(",")}`)).status).toBe(200);
    const res = await get(`?topic=${TOPIC}&ids=${ids.slice(0, 6).join(",")}`);
    expect(res.status).toBe(400);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("an id of another topic → 400", async () => {
    const [mine] = await idsOf(TOPIC);
    const [theirs] = await idsOf(OTHER);
    expect((await get(`?topic=${TOPIC}&ids=${mine},${theirs}`)).status).toBe(400);
  });

  it("no ids → 400", async () => {
    expect((await get(`?topic=${TOPIC}&ids=`)).status).toBe(400);
    expect((await get(`?topic=${TOPIC}`)).status).toBe(400);
    expect((await get(`?topic=${TOPIC}&ids=,,`)).status).toBe(400);
  });

  it("a malformed or unknown id → 400", async () => {
    const [mine] = await idsOf(TOPIC);
    expect((await get(`?topic=${TOPIC}&ids=${mine},../etc`)).status).toBe(400);
    expect((await get(`?topic=${TOPIC}&ids=2024r06-q999`)).status).toBe(400);
  });

  it("unknown or missing topic → 400", async () => {
    const [mine] = await idsOf(TOPIC);
    expect((await get(`?topic=nope-01-01&ids=${mine}`)).status).toBe(400);
    expect((await get(`?ids=${mine}`)).status).toBe(400);
  });
});
