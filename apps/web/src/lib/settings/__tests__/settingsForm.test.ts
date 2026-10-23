// Stage 7 Phase 1 Task 12 (DESIGN §6.8) — the settings form's pure layer: record → form values,
// form → the setSetting calls (clamped like record.setSetting) and the values shown after saving.
import { describe, expect, it, vi } from "vitest";

import { emptyRecord, setSetting, settingValue, type LearningRecord } from "../../learning/record";
import { formValuesOf, planSettingsSave, submitSettings, type SettingsFormValues } from "../settingsForm";

const T0 = Date.UTC(2026, 9, 23, 1);

const stored = (): LearningRecord => {
  let r = emptyRecord();
  r = setSetting(r, "examDate", "2026-11-30", T0);
  r = setSetting(r, "dailyReviewCap", 40, T0);
  r = setSetting(r, "dailyNewTarget", 5, T0);
  r = setSetting(r, "transDefault", "shown", T0);
  return r;
};

const form = (over: Partial<SettingsFormValues> = {}): SettingsFormValues => ({
  examDate: "",
  dailyReviewCap: "30",
  dailyNewTarget: "10",
  transDefault: "hidden",
  ...over,
});

describe("formValuesOf", () => {
  it("empty record → defaults 30 / 10 / hidden, no exam date", () => {
    expect(formValuesOf(emptyRecord())).toEqual(form());
  });
  it("stored settings → their values as strings", () => {
    expect(formValuesOf(stored())).toEqual({
      examDate: "2026-11-30",
      dailyReviewCap: "40",
      dailyNewTarget: "5",
      transDefault: "shown",
    });
  });
});

describe("planSettingsSave", () => {
  it("unchanged defaults → nothing written (no LWW stamp that would override another device)", () => {
    expect(planSettingsSave(form(), emptyRecord())).toEqual({ writes: [], values: form(), examDateKept: false });
    expect(planSettingsSave(formValuesOf(stored()), stored()).writes).toEqual([]);
  });

  it("numbers are rounded and clamped into SETTING_RANGES; the clamped values are shown", () => {
    const p = planSettingsSave(form({ dailyReviewCap: "150", dailyNewTarget: "-3" }), emptyRecord());
    expect(p.writes).toEqual([
      ["dailyReviewCap", 100],
      ["dailyNewTarget", 0],
    ]);
    expect(p.values).toMatchObject({ dailyReviewCap: "100", dailyNewTarget: "0" });
    const q = planSettingsSave(form({ dailyReviewCap: "4", dailyNewTarget: "12.6" }), emptyRecord());
    expect(q.writes).toEqual([
      ["dailyReviewCap", 10],
      ["dailyNewTarget", 13],
    ]);
    expect(q.values).toMatchObject({ dailyReviewCap: "10", dailyNewTarget: "13" });
  });

  it("an empty / non-numeric number field keeps the current value", () => {
    const p = planSettingsSave(form({ dailyReviewCap: "", dailyNewTarget: "abc" }), stored());
    expect(p.writes.map(([k]) => k)).not.toContain("dailyReviewCap");
    expect(p.writes.map(([k]) => k)).not.toContain("dailyNewTarget");
    expect(p.values).toMatchObject({ dailyReviewCap: "40", dailyNewTarget: "5" });
  });

  it("exam date: a real date is written; empty with none stored → nothing; empty with one stored → kept + hint", () => {
    expect(planSettingsSave(form({ examDate: "2026-12-20" }), emptyRecord()).writes).toEqual([["examDate", "2026-12-20"]]);
    const none = planSettingsSave(form({ examDate: "" }), emptyRecord());
    expect(none.writes).toEqual([]);
    expect(none.examDateKept).toBe(false);
    const kept = planSettingsSave({ ...formValuesOf(stored()), examDate: "" }, stored());
    expect(kept.writes).toEqual([]);
    expect(kept.examDateKept).toBe(true);
    expect(kept.values.examDate).toBe("2026-11-30");
    // not a calendar date (a browser date input never sends one; guarded anyway) → kept as well
    const bad = planSettingsSave({ ...formValuesOf(stored()), examDate: "2026-02-30" }, stored());
    expect(bad.writes).toEqual([]);
    expect(bad.values.examDate).toBe("2026-11-30");
  });

  it("translation default: shown / hidden written only when it changes", () => {
    expect(planSettingsSave(form({ transDefault: "shown" }), emptyRecord()).writes).toEqual([["transDefault", "shown"]]);
    expect(planSettingsSave({ ...formValuesOf(stored()), transDefault: "hidden" }, stored()).writes).toEqual([["transDefault", "hidden"]]);
  });
});

describe("submitSettings", () => {
  it("settings save calls setSetting with clamped values (each changed key once) and returns the shown values", () => {
    const spy = vi.fn();
    const res = submitSettings(
      form({ examDate: "2026-12-20", dailyReviewCap: "50", dailyNewTarget: "80", transDefault: "shown" }),
      emptyRecord(),
      spy,
    );
    expect(spy.mock.calls).toEqual([
      ["examDate", "2026-12-20"],
      ["dailyReviewCap", 50],
      ["dailyNewTarget", 50],
      ["transDefault", "shown"],
    ]);
    expect(res.values).toEqual({ examDate: "2026-12-20", dailyReviewCap: "50", dailyNewTarget: "50", transDefault: "shown" });
    // applying the same calls through record.setSetting gives the same values back
    let r = emptyRecord();
    for (const [k, v] of spy.mock.calls as [never, never][]) r = setSetting(r, k, v, T0);
    expect(formValuesOf(r)).toEqual(res.values);
    expect(settingValue(r, "dailyNewTarget")).toBe(50);
  });
});
