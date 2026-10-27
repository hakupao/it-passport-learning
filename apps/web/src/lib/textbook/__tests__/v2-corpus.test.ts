// Stage 7 Phase 3 (whole-branch Rule D MEDIUM ①) — every committed v2 unit passes validateV2 and the
// three-language parity check, with a context built only from committed data (no .planning):
//   - index      = data/ip/textbook/unit_index.json (loadReaderIndex)
//   - questions  = data/ip/quiz/questions.json (loadBaseQuestions)
//   - members    = data/ip/quiz/chumon_groups.json (loadChumonMembers)
//   - v1Terms    = __fixtures__/v2-units.v1terms.json: the pre-rewrite v1 glosses {term, term_zh, term_en}
//                  of each v2 unit (unit_index.json has no term_zh / term_en; validateV2 must not take them
//                  from the file it validates). A new v2 unit adds its v1 glosses here before it is committed.
// Parity = scripts/lib/textbook-v2.mjs parityDiff (the script the pipeline runs), imported, not copied.
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { beforeAll, describe, expect, it } from "vitest";

import { loadChumonMembers } from "../../practice/chumonMembers";
import { loadBaseQuestions } from "../../quiz/quizReader";
import { loadAllUnits, loadReaderIndex } from "../reader";
import { V2_SCHEMA, type TextbookUnitV2 } from "../types";
import { v2Context, validateV2, type V2Issue } from "../validateV2";

type V1Terms = Record<string, { term: string; term_zh: string; term_en: string }[]>;
const V1TERMS = JSON.parse(readFileSync(path.join(__dirname, "..", "__fixtures__", "v2-units.v1terms.json"), "utf-8")) as V1Terms;
// a non-literal specifier: the .mjs has no types, its parityDiff is typed here
const LIB = pathToFileURL(path.resolve(__dirname, "../../../../../../scripts/lib/textbook-v2.mjs")).href;

let units: TextbookUnitV2[] = [];
let issuesOf: (u: TextbookUnitV2) => V2Issue[];
let parityDiff: (u: unknown) => [string, { jp: number; zh: number; en: number }][];

beforeAll(async () => {
  const [all, index, questions, members, lib] = await Promise.all([
    loadAllUnits(),
    loadReaderIndex(),
    loadBaseQuestions(),
    loadChumonMembers(),
    import(/* @vite-ignore */ LIB) as Promise<{ parityDiff: typeof parityDiff }>,
  ]);
  units = all.filter((u) => u.schema_version === V2_SCHEMA) as unknown as TextbookUnitV2[];
  parityDiff = lib.parityDiff;
  issuesOf = (u) => {
    const ctx = v2Context(index as never, questions, u.unit_id, V1TERMS[u.unit_id] ?? [], members);
    if (!ctx) throw new Error(`${u.unit_id}: not in unit_index.json`);
    return validateV2(u, ctx);
  };
});

describe("committed v2 units", () => {
  it("exist (the pilot) and each has its v1 glosses in the fixture", () => {
    expect(units.length).toBeGreaterThan(0);
    for (const u of units) expect(V1TERMS[u.unit_id], u.unit_id).toBeDefined();
  });

  it("validateV2: 0 issues each", () => {
    const bad = units.map((u) => [u.unit_id, issuesOf(u)] as const).filter(([, is]) => is.length > 0);
    expect(bad.map(([id, is]) => `${id}: ${is.map((i) => `${i.code} ${i.field} ${i.message}`).join(" | ")}`)).toEqual([]);
  });

  it("parity: the same structure in jp / zh / en", () => {
    const bad = units.map((u) => [u.unit_id, parityDiff(u)] as const).filter(([, d]) => d.length > 0);
    expect(bad.map(([id, d]) => `${id}: ${d.map(([loc, c]) => `${loc} jp=${c.jp} zh=${c.zh} en=${c.en}`).join(" | ")}`)).toEqual([]);
  });
});
