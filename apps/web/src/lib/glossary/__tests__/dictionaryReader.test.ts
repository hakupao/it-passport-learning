// Stage 6 (D-179) Task 7 fix — loadDictionary memo must not pin a rejection:
// a failed load is retried on the next call; a successful one stays memoized.
import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  loadReaderIndex: vi.fn(),
  loadAllUnits: vi.fn(),
  loadBaseQuestions: vi.fn(),
  buildDictionary: vi.fn(),
}));

vi.mock("../../textbook/reader", () => ({
  loadReaderIndex: m.loadReaderIndex,
  loadAllUnits: m.loadAllUnits,
}));
vi.mock("../../quiz/quizReader", () => ({ loadBaseQuestions: m.loadBaseQuestions }));
vi.mock("../dictionary", () => ({ buildDictionary: m.buildDictionary }));

describe("loadDictionary memo", () => {
  beforeEach(() => {
    vi.resetModules();
    for (const f of Object.values(m)) f.mockReset();
    m.loadReaderIndex.mockResolvedValue({ topics: [] });
    m.loadAllUnits.mockResolvedValue([]);
    m.loadBaseQuestions.mockResolvedValue([]);
  });

  it("propagates a rejection, then retries on the next call", async () => {
    const { loadDictionary } = await import("../dictionaryReader");
    const boom = new Error("units unreadable");
    const dict = { entries: [] };
    m.loadAllUnits.mockRejectedValueOnce(boom);
    m.buildDictionary.mockReturnValue(dict);

    await expect(loadDictionary()).rejects.toBe(boom);
    await expect(loadDictionary()).resolves.toBe(dict);
    expect(m.loadAllUnits).toHaveBeenCalledTimes(2);
    expect(m.buildDictionary).toHaveBeenCalledTimes(1);
  });

  it("memoizes a successful load", async () => {
    const { loadDictionary } = await import("../dictionaryReader");
    const dict = { entries: [] };
    m.buildDictionary.mockReturnValue(dict);

    expect(await loadDictionary()).toBe(dict);
    expect(await loadDictionary()).toBe(dict);
    expect(m.loadAllUnits).toHaveBeenCalledTimes(1);
    expect(m.buildDictionary).toHaveBeenCalledTimes(1);
  });
});
