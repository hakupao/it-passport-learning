// Stage 7 Phase 2 Task 4 (D-193 §0-2, Review Focus 5) — the exam page's URL → mock scope.
// Invalid parts are dropped; a random list that is not 100 questions → null (back to the setup
// page); an unknown exam → null (the page answers 404 since `exam=` was given).

import { describe, expect, it } from "vitest";

import { MOCK_N } from "../mockModel";
import { mockRunHref, parseMockScope } from "../mockScope";

const ID = (i: number): string => `2024r06-q${String(i).padStart(3, "0")}`;
const VALID = new Set(Array.from({ length: 200 }, (_, i) => ID(i + 1)));
const EXAMS = new Set(["2024r06", "2025r07"]);
const range = (from: number, n: number): string[] => Array.from({ length: n }, (_, i) => ID(from + i));

describe("parseMockScope", () => {
  it("exam= wins over ids=; a known exam → exam scope", () => {
    expect(parseMockScope({ exam: "2025r07", ids: range(1, 100).join(",") }, VALID, EXAMS)).toEqual({
      kind: "exam",
      examId: "2025r07",
    });
    expect(parseMockScope({ exam: ["2024r06", "x"] }, VALID, EXAMS)).toEqual({ kind: "exam", examId: "2024r06" });
  });

  it("an unknown exam → null (the page answers 404)", () => {
    expect(parseMockScope({ exam: "1999h11a" }, VALID, EXAMS)).toBeNull();
    expect(parseMockScope({ exam: "1999h11a", ids: range(1, 100).join(",") }, VALID, EXAMS)).toBeNull();
  });

  it("100 valid ids → random scope in URL order", () => {
    const ids = range(1, 100).reverse();
    expect(parseMockScope({ ids: ids.join(",") }, VALID, EXAMS)).toEqual({ kind: "random", ids });
  });

  it("an unknown id leaving 99 → null", () => {
    const ids = [...range(1, 99), "9999x-q001"];
    expect(parseMockScope({ ids: ids.join(",") }, VALID, EXAMS)).toBeNull();
  });

  it("150 ids → the first 100", () => {
    const s = parseMockScope({ ids: range(1, 150).join(",") }, VALID, EXAMS);
    expect(s).toEqual({ kind: "random", ids: range(1, MOCK_N) });
  });

  it("repeated ids are dropped (and then counted)", () => {
    const twice = [...range(1, 100), ID(5), ID(6)];
    expect(parseMockScope({ ids: twice.join(",") }, VALID, EXAMS)).toEqual({ kind: "random", ids: range(1, 100) });
    const short = [...range(1, 99), ID(1)];
    expect(parseMockScope({ ids: short.join(",") }, VALID, EXAMS)).toBeNull();
  });

  it("nothing usable → null", () => {
    expect(parseMockScope({}, VALID, EXAMS)).toBeNull();
    expect(parseMockScope({ ids: "" }, VALID, EXAMS)).toBeNull();
  });
});

describe("mockRunHref", () => {
  it("exam → ?exam=, random → ?ids= (round-trips through parseMockScope)", () => {
    expect(mockRunHref({ kind: "exam", examId: "2025r07" })).toBe("/mock/run?exam=2025r07");
    const ids = range(1, 100);
    const href = mockRunHref({ kind: "random", ids });
    expect(href).toBe(`/mock/run?ids=${ids.join(",")}`);
    const sp = Object.fromEntries(new URL(href, "http://x").searchParams);
    expect(parseMockScope(sp, VALID, EXAMS)).toEqual({ kind: "random", ids });
  });
});
