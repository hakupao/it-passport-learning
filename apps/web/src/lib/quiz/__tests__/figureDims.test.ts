// OQ-14 (S135): the figure size manifest is the drift guard between public/quiz-figures/*.webp and
// the <img width height> the practice face renders — every served figure has its true size, and every
// figure the corpus references has an entry.
import { readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { figureDims } from "../figureDims";
import { loadAllQuestions } from "../quizReader";

const FIGURES = path.resolve(__dirname, "../../../../public/quiz-figures");

describe("figureDims (OQ-14)", () => {
  it("every public/quiz-figures/*.webp has its true width / height", async () => {
    const files = readdirSync(FIGURES).filter((f) => f.endsWith(".webp"));
    expect(files.length).toBeGreaterThan(500);
    for (const f of files) {
      const meta = await sharp(path.join(FIGURES, f)).metadata();
      expect([f, figureDims(f.slice(0, -".webp".length))]).toEqual([f, [meta.width, meta.height]]);
    }
  });

  it("every figure / choice_figures basename in the corpus has an entry", async () => {
    const missing = (await loadAllQuestions())
      .flatMap((q) => [q.figure, ...Object.values(q.choice_figures ?? {})])
      .filter((b): b is string => !!b && !figureDims(b));
    expect(missing).toEqual([]);
  });

  it("an unknown basename has no size", () => {
    expect(figureDims("no-such-figure")).toBeUndefined();
  });
});
