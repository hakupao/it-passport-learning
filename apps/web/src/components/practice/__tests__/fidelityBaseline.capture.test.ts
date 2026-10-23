// Stage 7 Phase 1 Task 1 (S132) — freeze the display baseline of the CURRENT quiz renderer.
//
// CAPTURE_BASELINE=1 → render 2900 questions × ja/zh/en with today's StemBlocks / ChoiceBody
// and write evidence/phase5/stage_07_ui/baseline.jsonl (hashes only, no question text).
// Otherwise → the frozen file must exist with 8700 rows and contain no kana / kanji.
// The later fidelity test (Task 8) reuses fidelityBaseline.ts so both sides hash identically.
import { describe, expect, it } from "vitest";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BASELINE_PATH, baselineRows, fieldText, imageHash, textHash } from "./fidelityBaseline";

describe("fieldText / hashes", () => {
  it("strips tags, keeps <br> and block boundaries as line breaks, appends a tag signature", () => {
    expect(fieldText("<p>a  b<br/>c</p><p> d </p>")).toBe(
      "a b\nc\nd\n#sig pre=0 table=0 tr=0 th=0 td=0 img=0 br=1 ul=0 li=0",
    );
  });

  it("decodes entities (incl. React's hex &#x27;) after stripping tags", () => {
    expect(fieldText("<span>&lt;br&gt; &amp; &quot;x&quot; &#x27;y&#39; &#65;</span>")).toBe(
      "<br> & \"x\" 'y' A\n#sig pre=0 table=0 tr=0 th=0 td=0 img=0 br=0 ul=0 li=0",
    );
  });

  it("a table flattened to a paragraph changes the hash even when the text matches", () => {
    const table = "<table><tbody><tr><td>A</td><td>B</td></tr></tbody></table>";
    expect(fieldText(table)).toBe("A B\n#sig pre=0 table=1 tr=1 th=0 td=2 img=0 br=0 ul=0 li=0");
    expect(textHash(table)).not.toBe(textHash("<p>A B</p>"));
    expect(textHash(table)).toMatch(/^[0-9a-f]{16}$/);
  });

  it("imageHash uses the src basename + alt", () => {
    expect(imageHash("/quiz-figures/x.webp", "Figure")).toBe(imageHash("x.webp", "Figure"));
    expect(imageHash("/quiz-figures/x.webp", "Figure")).not.toBe(imageHash("/quiz-figures/x.webp", "图"));
  });
});

describe("display baseline (2900 × ja/zh/en)", () => {
  if (process.env.CAPTURE_BASELINE === "1") {
    it("captures baseline.jsonl from the current renderer", async () => {
      const rows = await baselineRows();
      expect(rows).toHaveLength(8700);
      mkdirSync(path.dirname(BASELINE_PATH), { recursive: true });
      writeFileSync(BASELINE_PATH, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
    }, 120_000);
  } else {
    it("the frozen baseline exists, has 8700 rows and holds no question text", () => {
      expect(existsSync(BASELINE_PATH)).toBe(true);
      const body = readFileSync(BASELINE_PATH, "utf-8");
      const lines = body.split("\n").filter((l) => l !== "");
      expect(lines).toHaveLength(8700);
      expect(body).not.toMatch(/[ぁ-んァ-ン一-龥]/);
    });
  }
});
