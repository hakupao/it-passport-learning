// D-217 H1-3 — /mock/run's query, resolved in the browser (resolveMockView) over the static data
// files (the route handlers, real corpus), against what the former server page computed.
import { describe, expect, it } from "vitest";

import { loadChumonGroups } from "@/lib/practice/practiceReader";
import { topicStars } from "@/lib/practice/practiceIndex";
import { foldPlan } from "@/lib/practice/practiceSession";
import { loadBaseQuestions, loadQuizIndex, loadTranslations, localizedChoices, localizedStem, mergeTranslation } from "@/lib/quiz/quizReader";
import { routeData } from "@/lib/staticData/__tests__/routeData";

import { examMockIds, MOCK_N } from "../mockModel";
import { resolveMockView, type MockRunView } from "../mockView";

const data = routeData();

describe("resolveMockView", () => {
  it("?exam=<id> → that exam's questions (no explanation), labels, ★, folds = the former server page", async () => {
    const [index, base, tr, groups] = await Promise.all([loadQuizIndex(), loadBaseQuestions(), loadTranslations(), loadChumonGroups()]);
    const stars = topicStars(index);
    for (const locale of ["ja", "zh", "en"] as const) {
      for (const examId of ["2026r08", "2009h21a", "2011h23a"]) {
        const v = (await resolveMockView({ exam: examId }, locale, data)) as MockRunView;
        expect(v.kind).toBe("run");
        const ids = examMockIds(examId, base);
        expect(v.key).toBe(ids.join(","));
        expect(v.questions.map((q) => q.id)).toEqual(ids);
        expect(v.questions.every((q) => q.explanation === undefined)).toBe(true);
        const want = ids.map((id) => mergeTranslation(base.find((q) => q.id === id)!, tr.get(id)));
        expect(v.questions.map((q) => localizedStem(q, locale))).toEqual(want.map((q) => localizedStem(q, locale)));
        expect(v.questions.map((q) => localizedChoices(q, locale))).toEqual(want.map((q) => localizedChoices(q, locale)));
        expect(v.scopeKind).toBe("exam");
        expect(v.examId).toBe(examId);
        expect(v.examLabel).toBe(index.exams.find((e) => e.exam_id === examId)!.label_jp);
        expect(v.folds).toEqual(foldPlan(ids, groups));
        for (const q of v.questions) expect(v.stars[q.topic_id]).toBe(stars[q.topic_id]);
      }
    }
  });

  it("?ids=<100 ids> → a random mock in that order; 99 valid → replace back to /mock; an unknown exam → notFound", async () => {
    const base = await loadBaseQuestions();
    const ids = base.filter((_, i) => i % 29 === 0).slice(0, MOCK_N).map((q) => q.id);
    expect(ids).toHaveLength(MOCK_N);
    const v = (await resolveMockView({ ids: ids.join(",") }, "zh", data)) as MockRunView;
    expect(v.kind).toBe("run");
    expect(v.scopeKind).toBe("random");
    expect(v.examId).toBeNull();
    expect(v.examLabel).toBeNull();
    expect(v.questions.map((q) => q.id)).toEqual(ids);
    expect(await resolveMockView({ ids: `${ids.slice(0, 99).join(",")},9999x-q001` }, "ja", data)).toEqual({
      kind: "replace",
      href: "/mock",
    });
    expect(await resolveMockView({}, "ja", data)).toEqual({ kind: "replace", href: "/mock" });
    expect(await resolveMockView({ exam: "1999h11a" }, "ja", data)).toEqual({ kind: "notFound" });
    expect(await resolveMockView({ exam: "1999h11a", ids: ids.join(",") }, "ja", data)).toEqual({ kind: "notFound" });
  });

  it("fetches no explanation chunk", async () => {
    const d = routeData();
    await resolveMockView({ exam: "2026r08" }, "en", d);
    expect([...new Set(d.requests)].sort()).toEqual(["/data/quiz/2026r08.en.json", "/data/quiz/index.json"]);
  });
});
