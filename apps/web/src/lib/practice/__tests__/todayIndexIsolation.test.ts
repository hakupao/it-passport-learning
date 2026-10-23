// Stage 7 Phase 1 (D-190 §0-20) — the today payload must not parse the quiz
// translation / explanation sidecars (~30 MB): it needs only questions.json,
// chumon_groups.json, the textbook index + units and unit_minutes.json.
// Own file so every module memo starts empty.
import { promises as fs } from "node:fs";

import { afterAll, describe, expect, it, vi } from "vitest";

vi.mock("../../quiz/quizReader", async (importOriginal) => {
  const m = await importOriginal<typeof import("../../quiz/quizReader")>();
  return {
    ...m,
    loadAllQuestions: vi.fn(m.loadAllQuestions),
    loadTranslations: vi.fn(m.loadTranslations),
    loadExplanations: vi.fn(m.loadExplanations),
  };
});

const { loadAllQuestions, loadExplanations, loadTranslations } = await import("../../quiz/quizReader");
const { loadChumonRegistry, loadTodayIndex } = await import("../practiceReader");

const readFile = vi.spyOn(fs, "readFile");
const readdir = vi.spyOn(fs, "readdir");
afterAll(() => {
  readFile.mockRestore();
  readdir.mockRestore();
});

const touched = () =>
  [...readFile.mock.calls, ...readdir.mock.calls].map((c) => String(c[0])).filter((p) => /[\\/]quiz[\\/]/.test(p));

describe("loadTodayIndex reads no quiz sidecars", () => {
  it("never calls loadAllQuestions / loadTranslations / loadExplanations nor opens translations/ or explanations/", async () => {
    const today = await loadTodayIndex("zh");
    expect(today.topics).toHaveLength(63);
    expect(vi.mocked(loadAllQuestions)).not.toHaveBeenCalled();
    expect(vi.mocked(loadTranslations)).not.toHaveBeenCalled();
    expect(vi.mocked(loadExplanations)).not.toHaveBeenCalled();
    const quizPaths = touched();
    expect(quizPaths.some((p) => p.endsWith("questions.json"))).toBe(true); // the spy does see quiz reads
    expect(quizPaths.filter((p) => /[\\/](translations|explanations)([\\/]|$)/.test(p))).toEqual([]);
  });

  it("loadChumonRegistry: 50 groups, members sorted, groups equal the today payload's", async () => {
    const registry = await loadChumonRegistry();
    expect(Object.keys(registry)).toHaveLength(50);
    for (const [k, ids] of Object.entries(registry)) expect([...ids].sort(), k).toEqual(ids);
    expect((await loadTodayIndex("zh")).groups).toEqual(registry);
  });
});
