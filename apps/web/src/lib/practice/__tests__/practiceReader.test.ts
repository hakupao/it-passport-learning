// Stage 7 Phase 1 (D-190 §0-21) — practice disk layer: the derived
// data/ip/textbook/unit_minutes.json must equal its generator's output, and the
// loaders resolve ids / minutes against the committed corpus.
import { spawnSync } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { loadReaderIndex } from "../../textbook/reader";
import { loadQuestionsByIds, loadTodayIndex, loadUnitMinutes } from "../practiceReader";

const REPO_ROOT = path.resolve(__dirname, "../../../../../..");
const MINUTES_BUILD = path.join(REPO_ROOT, "scripts/textbook-unit-minutes-build.mjs");

describe("unit_minutes.json (scripts/textbook-unit-minutes-build.mjs)", () => {
  it("unit_minutes.json は生成器の出力と一致する (--check)", () => {
    const r = spawnSync(process.execPath, [MINUTES_BUILD, "--check"], { encoding: "utf-8" });
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(r.stdout).toMatch(/は生成結果と一致/);
  });

  it("every unit in unit_index has minutes > 0", async () => {
    const [index, minutes] = await Promise.all([loadReaderIndex(), loadUnitMinutes()]);
    const units = index.topics.flatMap((t) => t.unit_order);
    expect(units).toHaveLength(244);
    for (const id of units) {
      const m = minutes[id];
      expect(typeof m === "number" && Number.isFinite(m) && m > 0, id).toBe(true);
    }
    expect(Object.keys(minutes).sort()).toEqual([...units].sort());
  });
});

describe("loaders", () => {
  it("loadQuestionsByIds keeps input order and drops unknown ids", async () => {
    const qs = await loadQuestionsByIds(["2026r08-q100", "nope", "2009h21a-q001", "2026r08-q100"]);
    expect(qs.map((x) => x.id)).toEqual(["2026r08-q100", "2009h21a-q001", "2026r08-q100"]);
    expect(await loadQuestionsByIds([])).toEqual([]);
  });

  it("TodayIndex units carry localized titles and unit_minutes", async () => {
    const [ja, en, index, minutes] = await Promise.all([
      loadTodayIndex("ja"),
      loadTodayIndex("en"),
      loadReaderIndex(),
      loadUnitMinutes(),
    ]);
    expect(await loadTodayIndex("ja")).toBe(ja); // memoized per locale
    const t0 = index.topics[0]!;
    const meta = ja.topics.find((t) => t.id === t0.topic_id)!;
    expect(meta.units.map((u) => u.id)).toEqual(t0.unit_order);
    const u0 = t0.units.find((u) => u.unit_id === t0.unit_order[0])!;
    expect(meta.units[0]!.title).toBe(u0.title_jp);
    expect(en.topics.find((t) => t.id === t0.topic_id)!.units[0]!.title).toBe(u0.title_en);
    expect(meta.units[0]!.minutes).toBe(minutes[u0.unit_id]);
    expect(ja.exams["2026r08"]).toMatch(/令和8年度/);
  });
});
