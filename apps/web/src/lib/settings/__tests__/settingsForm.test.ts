// Stage 7 Phase 1 Task 12 (DESIGN §6.8) — the settings form's pure layer: record → form values,
// form → the setSetting calls (clamped like record.setSetting) and the values shown after saving.
import { describe, expect, it, vi } from "vitest";

import { emptyRecord, setSetting, settingValue, type LearningRecord } from "../../learning/record";
import { formValuesOf, planSettingsSave, resyncUntouched, submitSettings, type SettingsFormValues } from "../settingsForm";

const T0 = Date.UTC(2026, 9, 23, 1);

const stored = (): LearningRecord => {
  let r = emptyRecord();
  r = setSetting(r, "examDate", "2026-11-30", T0);
  r = setSetting(r, "dailyReviewCap", 40, T0);
  r = setSetting(r, "dailyNewTarget", 5, T0);
  r = setSetting(r, "transDefault", "shown", T0);
  return r;
};

/** the save with the baseline the form mounted with (default: the record's values at mount) */
const plan = (f: SettingsFormValues, r: LearningRecord, base: SettingsFormValues = formValuesOf(r)) =>
  planSettingsSave(f, base, r);

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
    expect(plan(form(), emptyRecord())).toEqual({ writes: [], values: form(), examDateKept: false, numberKept: false });
    expect(plan(formValuesOf(stored()), stored()).writes).toEqual([]);
  });

  it("numbers are rounded and clamped into SETTING_RANGES; the clamped values are shown", () => {
    const p = plan(form({ dailyReviewCap: "150", dailyNewTarget: "-3" }), emptyRecord());
    expect(p.writes).toEqual([
      ["dailyReviewCap", 100],
      ["dailyNewTarget", 0],
    ]);
    expect(p.values).toMatchObject({ dailyReviewCap: "100", dailyNewTarget: "0" });
    const q = plan(form({ dailyReviewCap: "4", dailyNewTarget: "12.6" }), emptyRecord());
    expect(q.writes).toEqual([
      ["dailyReviewCap", 10],
      ["dailyNewTarget", 13],
    ]);
    expect(q.values).toMatchObject({ dailyReviewCap: "10", dailyNewTarget: "13" });
  });

  it("an empty / non-numeric number field keeps the current value", () => {
    const p = plan(form({ dailyReviewCap: "", dailyNewTarget: "abc" }), stored());
    expect(p.writes.map(([k]) => k)).not.toContain("dailyReviewCap");
    expect(p.writes.map(([k]) => k)).not.toContain("dailyNewTarget");
    expect(p.values).toMatchObject({ dailyReviewCap: "40", dailyNewTarget: "5" });
    // fix round 1 (M3): reported like a kept exam date
    expect(p.numberKept).toBe(true);
    expect(plan(form({ dailyReviewCap: "45" }), emptyRecord()).numberKept).toBe(false);
  });

  it("exam date: a real date is written; empty with none stored → nothing; empty with one stored → kept + hint", () => {
    expect(plan(form({ examDate: "2026-12-20" }), emptyRecord()).writes).toEqual([["examDate", "2026-12-20"]]);
    const none = plan(form({ examDate: "" }), emptyRecord());
    expect(none.writes).toEqual([]);
    expect(none.examDateKept).toBe(false);
    const kept = plan({ ...formValuesOf(stored()), examDate: "" }, stored());
    expect(kept.writes).toEqual([]);
    expect(kept.examDateKept).toBe(true);
    expect(kept.values.examDate).toBe("2026-11-30");
    // not a calendar date (a browser date input never sends one; guarded anyway) → kept as well
    const bad = plan({ ...formValuesOf(stored()), examDate: "2026-02-30" }, stored());
    expect(bad.writes).toEqual([]);
    expect(bad.values.examDate).toBe("2026-11-30");
  });

  it("translation default: shown / hidden written only when it changes", () => {
    expect(plan(form({ transDefault: "shown" }), emptyRecord()).writes).toEqual([["transDefault", "shown"]]);
    expect(plan({ ...formValuesOf(stored()), transDefault: "hidden" }, stored()).writes).toEqual([["transDefault", "hidden"]]);
  });
});

describe("submitSettings", () => {
  it("settings save calls setSetting with clamped values (each changed key once) and returns the shown values", () => {
    const spy = vi.fn();
    const res = submitSettings(
      form({ examDate: "2026-12-20", dailyReviewCap: "50", dailyNewTarget: "80", transDefault: "shown" }),
      form(),
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

describe("fix round 1 (I-2): an untouched field never reverts a newer synced value", () => {
  it("baseline + a transDefault change, record with a newer cap → writes only transDefault, shows the newer cap", () => {
    const base = formValuesOf(emptyRecord()); // what the form mounted with: 30 / 10 / hidden
    const synced = setSetting(emptyRecord(), "dailyReviewCap", 60, T0); // another device, after mount
    const p = planSettingsSave({ ...base, transDefault: "shown" }, base, synced);
    expect(p.writes).toEqual([["transDefault", "shown"]]);
    expect(p.values).toEqual({ ...base, dailyReviewCap: "60", transDefault: "shown" });
  });
  it("a field the user changed is written even when the record moved too; a change back to the record's value writes nothing", () => {
    const base = formValuesOf(emptyRecord());
    const synced = setSetting(emptyRecord(), "dailyReviewCap", 60, T0);
    expect(planSettingsSave({ ...base, dailyReviewCap: "40" }, base, synced).writes).toEqual([["dailyReviewCap", 40]]);
    expect(planSettingsSave({ ...base, dailyReviewCap: "60" }, base, synced).writes).toEqual([]);
    // "30.2" normalises to the baseline 30 → untouched
    expect(planSettingsSave({ ...base, dailyReviewCap: "30.2" }, base, synced).writes).toEqual([]);
  });
  it("resyncUntouched: untouched fields follow the record, edited fields keep the user's text", () => {
    const base = formValuesOf(emptyRecord());
    const fresh = { ...base, dailyReviewCap: "60", examDate: "2026-11-30" };
    expect(resyncUntouched({ ...base, dailyNewTarget: "25" }, base, fresh)).toEqual({ ...fresh, dailyNewTarget: "25" });
    expect(resyncUntouched(base, base, fresh)).toEqual(fresh);
  });
});
