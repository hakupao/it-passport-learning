// D-217 H1-5 / D-219 — out/_redirects: `/` → /ja and the locale-less sections, no catch-all.
import { describe, expect, it } from "vitest";

import { redirectsFile, ruleSources, sectionsOf } from "../redirects";

const SECTIONS = ["glossary", "mock", "practice", "quiz", "record", "sensei", "settings", "textbook"];

describe("out/_redirects (lib/export/redirects)", () => {
  const file = redirectsFile(SECTIONS);
  const rules = file.split("\n").filter((l) => l && !l.startsWith("#")).map((l) => l.split(" "));

  it("sends / to /ja (302) and each section, bare and below, to its /ja form (301)", () => {
    expect(rules[0]).toEqual(["/", "/ja", "302"]);
    for (const s of SECTIONS) {
      expect(rules).toContainEqual([`/${s}`, `/ja/${s}`, "301"]);
      expect(rules).toContainEqual([`/${s}/*`, `/ja/${s}/:splat`, "301"]);
    }
    expect(rules).toHaveLength(1 + 2 * SECTIONS.length);
  });

  it("static rules come before dynamic ones and stay within 2,000 static / 100 dynamic", () => {
    const dyn = rules.map((r) => /[*:]/.test(r[0]!));
    expect(dyn.indexOf(true)).toBeGreaterThan(dyn.lastIndexOf(false));
    expect(dyn.filter(Boolean).length).toBeLessThanOrEqual(100);
    expect(dyn.filter((d) => !d).length).toBeLessThanOrEqual(2000);
  });

  it("never redirects a locale path or a static file tree (no catch-all source)", () => {
    for (const src of ruleSources(file)) {
      expect(src).not.toBe("/*");
      expect(src).not.toMatch(/^\/(ja|zh|en|_next|data|quiz-figures)(\/|$)/);
    }
  });

  it("derives the sections from out/ja (dirs + .html), ignoring other files", () => {
    expect(
      sectionsOf([
        { name: "practice", isDir: true },
        { name: "practice.html", isDir: false },
        { name: "practice.txt", isDir: false },
        { name: "sensei.html", isDir: false },
        { name: "Weird_Name.html", isDir: false },
      ]),
    ).toEqual(["practice", "sensei"]);
  });
});
