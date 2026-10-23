// D-180 Task 11 / D-190 — provider / hook contract under SSR (effects do not
// run, so no window access): the record starts as the v2 emptyRecord() on the
// server, both hooks work inside LearningRecordProvider and throw a clear error
// outside it. The actions themselves are pinned through makeLearningActions
// (the factory the provider uses) with an in-memory state and a fake clock.
import { describe, expect, it } from "vitest";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { emptyRecord, type LearningRecord } from "@/lib/learning/record";

import {
  exposedLoaded,
  LearningRecordProvider,
  makeLearningActions,
  useLearningActions,
  useLearningRecord,
} from "../useLearningRecord";

function ReadsRecord(): React.ReactElement {
  const { record, answer, readUnit } = useLearningRecord();
  return h("pre", null, `${JSON.stringify(record)}|${typeof answer}|${typeof readUnit}`);
}

function WritesOnly(): React.ReactElement {
  const actions = useLearningActions();
  return h("i", null, Object.keys(actions).sort().join(","));
}

describe("LearningRecordProvider (SSR)", () => {
  it("serves the v2 emptyRecord() plus the actions to useLearningRecord()", () => {
    const out = renderToStaticMarkup(h(LearningRecordProvider, { isOwner: true, children: h(ReadsRecord) }));
    expect(out).toBe(
      `<pre>${JSON.stringify({ v: 2, attempts: {}, unitsRead: {}, settings: {} }).replace(/"/g, "&quot;")}|function|function</pre>`,
    );
  });

  it("loaded is false on the server (the local record is merged in after mount)", () => {
    function ReadsLoaded(): React.ReactElement {
      const { loaded } = useLearningRecord();
      return h("b", null, String(loaded));
    }
    for (const isOwner of [false, true]) {
      const out = renderToStaticMarkup(h(LearningRecordProvider, { isOwner, children: h(ReadsLoaded) }));
      expect(out).toBe("<b>false</b>");
    }
  });

  it("exposedLoaded: an owner's readers also wait for the initial GET to settle (no local-only flash)", () => {
    // non-owner: only the local load matters
    expect(exposedLoaded(false, false, false)).toBe(false);
    expect(exposedLoaded(true, false, false)).toBe(true);
    expect(exposedLoaded(true, false, true)).toBe(true);
    // owner: local load AND remote settled
    expect(exposedLoaded(true, true, false)).toBe(false);
    expect(exposedLoaded(false, true, true)).toBe(false);
    expect(exposedLoaded(true, true, true)).toBe(true);
  });

  it("useLearningActions() exposes only answer + readUnit + setSetting", () => {
    const out = renderToStaticMarkup(h(LearningRecordProvider, { isOwner: false, children: h(WritesOnly) }));
    expect(out).toBe("<i>answer,readUnit,setSetting</i>");
  });

  it("both hooks throw outside the provider", () => {
    expect(() => renderToStaticMarkup(h(ReadsRecord))).toThrow(/LearningRecordProvider/);
    expect(() => renderToStaticMarkup(h(WritesOnly))).toThrow(/LearningRecordProvider/);
  });
});

describe("makeLearningActions (what the provider's actions do)", () => {
  /** Actions over a plain variable, with a settable clock. */
  function harness() {
    const box = { record: emptyRecord() as LearningRecord, now: 1_000 };
    const actions = makeLearningActions(
      (fn) => {
        box.record = fn(box.record);
      },
      () => box.now,
    );
    return { box, actions };
  }

  it("answer stores a practice attempt at the current time (src overridable)", () => {
    const { box, actions } = harness();
    actions.answer("2024r06-q001", "ウ", false);
    box.now = 2_000;
    actions.answer("2024r06-q001", "ア", true, "mock");
    expect(box.record.attempts["2024r06-q001"]).toEqual([
      { at: 2_000, choice: "ア", correct: true, src: "mock" },
      { at: 1_000, choice: "ウ", correct: false, src: "practice" },
    ]);
  });

  it("readUnit keeps the first read", () => {
    const { box, actions } = harness();
    actions.readUnit("t-01-01");
    box.now = 5_000;
    actions.readUnit("t-01-01");
    expect(box.record.unitsRead).toEqual({ "t-01-01": 1_000 });
  });

  it("setSetting action stores LWW value", () => {
    const { box, actions } = harness();
    box.now = 10_000;
    actions.setSetting("dailyReviewCap", 40);
    expect(box.record.settings.dailyReviewCap).toEqual({ value: 40, at: 10_000 });
    // a later re-set on a clock that went backwards still wins (at = previous + 1)
    box.now = 9_000;
    actions.setSetting("dailyReviewCap", 60);
    expect(box.record.settings.dailyReviewCap).toEqual({ value: 60, at: 10_001 });
    box.now = 20_000;
    actions.setSetting("examDate", "2026-12-20");
    actions.setSetting("transDefault", "shown");
    expect(box.record.settings).toEqual({
      dailyReviewCap: { value: 60, at: 10_001 },
      examDate: { value: "2026-12-20", at: 20_000 },
      transDefault: { value: "shown", at: 20_000 },
    });
  });
});
