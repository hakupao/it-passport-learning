// D-180 Task 11 — provider / hook contract under SSR (effects do not run, so no
// window access): the record starts as emptyRecord() on the server, both hooks
// work inside LearningRecordProvider and throw a clear error outside it.
import { describe, expect, it } from "vitest";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  exposedLoaded,
  LearningRecordProvider,
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
  it("serves emptyRecord() plus the actions to useLearningRecord()", () => {
    const out = renderToStaticMarkup(h(LearningRecordProvider, { isOwner: true, children: h(ReadsRecord) }));
    expect(out).toBe(
      `<pre>${JSON.stringify({ v: 1, questions: {}, unitsRead: {} }).replace(/"/g, "&quot;")}|function|function</pre>`,
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

  it("useLearningActions() exposes only answer + readUnit", () => {
    const out = renderToStaticMarkup(h(LearningRecordProvider, { isOwner: false, children: h(WritesOnly) }));
    expect(out).toBe("<i>answer,readUnit</i>");
  });

  it("both hooks throw outside the provider", () => {
    expect(() => renderToStaticMarkup(h(ReadsRecord))).toThrow(/LearningRecordProvider/);
    expect(() => renderToStaticMarkup(h(WritesOnly))).toThrow(/LearningRecordProvider/);
  });
});
