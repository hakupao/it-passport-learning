// D-181 §0-9 — GET /api/sensei/terms?ids=<id>,…&locale=<ja|zh|en>: the free question's
// terms. Contract: at most 8 ids (else 400); ids that are not termId-shaped, or not in
// the dictionary, are skipped; repeated ids are returned once; terms come back in the
// requested order as { id, term, senses: [{ unitTitleJp, definitionJp,
// definitionLocale? }] } — every sense, the locale definition for zh / en only; a
// valid locale is required (400); no owner cookie is needed; nothing but the
// dictionary and the unit index is read (no LLM, no network). Both are small fixtures
// through the loader mocks.

import { readFileSync } from "node:fs";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildDictionary, type Dictionary } from "@/lib/glossary/dictionary";
import { termId } from "@/lib/glossary/termId";
import type { ReaderIndex } from "@/lib/textbook/reader";
import type { TextbookUnit, UnitTerm } from "@/lib/textbook/types";

const { dictHolder, indexHolder } = vi.hoisted(() => ({
  dictHolder: { current: null as Promise<Dictionary> | null },
  indexHolder: { current: null as Promise<ReaderIndex> | null },
}));

vi.mock("@/lib/glossary/dictionaryReader", () => ({
  loadDictionary: () => dictHolder.current!,
}));

vi.mock("@/lib/textbook/reader", async () => {
  const actual = await vi.importActual<typeof import("@/lib/textbook/reader")>("@/lib/textbook/reader");
  return { ...actual, loadReaderIndex: () => indexHolder.current! };
});

import { GET } from "../route";

const term = (jp: string, zh: string, en: string, def: string, over: Partial<UnitTerm> = {}): UnitTerm => ({
  term: jp,
  term_zh: zh,
  term_en: en,
  definition_jp: `${def}(jp)`,
  definition_zh: `${def}(zh)`,
  definition_en: `${def}(en)`,
  explanation_jp: "",
  explanation_zh: "",
  explanation_en: "",
  analogy_jp: "",
  analogy_zh: "",
  analogy_en: "",
  memory_hook_jp: `${def}-hook(jp)`,
  memory_hook_zh: `${def}-hook(zh)`,
  memory_hook_en: `${def}-hook(en)`,
  inline_quiz: [],
  inline_fallback: false,
  figure: null,
  ...over,
});

const unit = (unit_id: string, topic_id: string, category: string, terms: UnitTerm[]): TextbookUnit => ({
  schema_version: "stage4-unit-v1-trilingual",
  unit_id,
  topic_id,
  category,
  title_jp: "u",
  title_zh: "u",
  title_en: "u",
  unit_summary_jp: "",
  unit_summary_zh: "",
  unit_summary_en: "",
  order_in_topic: 1,
  prerequisites: [],
  overview: { intro_jp: "", intro_zh: "", intro_en: "", freq_badge: "標準", est_minutes: 15 },
  terms,
  summary: {
    memory_hooks_jp: [],
    memory_hooks_zh: [],
    memory_hooks_en: [],
    key_points_jp: [],
    key_points_zh: [],
    key_points_en: [],
  },
  challenge_questions: [],
  source_figures: [],
  lang_status: { jp: "done", zh: "done", en: "done" },
});

const UNITS: TextbookUnit[] = [
  unit("management-08-25-u01", "management-08-25", "management", [
    term("機能要件", "功能需求", "Functional requirement", "func", {
      explanation_jp: "func-expl(jp)",
      explanation_en: "func-expl(en)",
    }),
    term("非機能要件", "非功能需求", "Non-functional requirement", "nonfunc"),
    term("要件定義", "需求定义", "Requirements definition", "req", { definition_en: "", memory_hook_en: " " }),
  ]),
  unit("strategy-07-23-u01", "strategy-07-23", "strategy", [
    term("機能要件", "功能性需求", "Functional requirements", "S-func"),
  ]),
];

const topic = (topic_id: string, category: string, unit_id: string, title_jp: string) => ({
  topic_id,
  category,
  major: "m",
  major_zh: "m",
  major_en: "m",
  medium: "m",
  medium_zh: "m",
  medium_en: "m",
  name_jp: topic_id,
  unit_order: [unit_id],
  units: [{ unit_id, title_jp, title_zh: "zh", title_en: "en", node_freq_badge: "標準", term_count: 1 }],
});

const INDEX: ReaderIndex = {
  schema_version: "stage4-toc-v1",
  stats: { topics: 2, units: 2, terms: 4 },
  topics: [
    topic("strategy-07-23", "strategy", "strategy-07-23-u01", "要件定義の単元"),
    topic("management-08-25", "management", "management-08-25-u01", "開発プロセスの単元"),
  ],
};

const dict = buildDictionary(INDEX, UNITS, []);
const FUNC = termId("機能要件");
const NONFUNC = termId("非機能要件");
const REQ = termId("要件定義");
/** termId-shaped but not in the dictionary. */
const UNKNOWN = "t0123456789abcdef";

const get = (query: string, headers: Record<string, string> = {}) =>
  GET(new Request(`http://localhost/api/sensei/terms${query}`, { headers }));

const q = (ids: string[], locale = "ja") => `?${new URLSearchParams({ ids: ids.join(","), locale })}`;

let fetchSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  dictHolder.current = Promise.resolve(dict);
  indexHolder.current = Promise.resolve(INDEX);
  fetchSpy = vi.spyOn(globalThis, "fetch");
});

afterEach(() => {
  expect(fetchSpy, "the route makes no network call").not.toHaveBeenCalled();
  vi.restoreAllMocks();
});

type Body = { terms: { id: string; term: string; senses: Record<string, string>[] }[] };

describe("GET /api/sensei/terms", () => {
  it("returns every sense of each id, in the requested order, without an owner cookie (en: JP + English)", async () => {
    const res = await get(q([NONFUNC, FUNC], "en"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/json; charset=utf-8");
    const body = (await res.json()) as Body;
    expect(Object.keys(body)).toEqual(["terms"]);
    expect(body.terms).toEqual([
      {
        id: NONFUNC,
        term: "非機能要件",
        senses: [
          {
            unitTitleJp: "開発プロセスの単元",
            definitionJp: "nonfunc(jp)",
            definitionLocale: "nonfunc(en)",
            memoryHookJp: "nonfunc-hook(jp)",
            memoryHookLocale: "nonfunc-hook(en)",
          },
        ],
      },
      {
        // two units teach it: both senses, in dictionary (buildNav) order — management before strategy
        id: FUNC,
        term: "機能要件",
        senses: [
          {
            unitTitleJp: "開発プロセスの単元",
            definitionJp: "func(jp)",
            definitionLocale: "func(en)",
            explanationJp: "func-expl(jp)",
            explanationLocale: "func-expl(en)",
            memoryHookJp: "func-hook(jp)",
            memoryHookLocale: "func-hook(en)",
          },
          {
            unitTitleJp: "要件定義の単元",
            definitionJp: "S-func(jp)",
            definitionLocale: "S-func(en)",
            memoryHookJp: "S-func-hook(jp)",
            memoryHookLocale: "S-func-hook(en)",
          },
        ],
      },
    ]);
  });

  it("zh: the zh fields (an empty zh explanation is left out); ja: JP only (no *Locale)", async () => {
    const zh = (await (await get(q([FUNC], "zh"))).json()) as Body;
    expect(zh.terms[0]!.senses.map((s) => s.definitionLocale)).toEqual(["func(zh)", "S-func(zh)"]);
    expect(zh.terms[0]!.senses[0]).toEqual({
      unitTitleJp: "開発プロセスの単元",
      definitionJp: "func(jp)",
      definitionLocale: "func(zh)",
      explanationJp: "func-expl(jp)",
      memoryHookJp: "func-hook(jp)",
      memoryHookLocale: "func-hook(zh)",
    });
    const ja = (await (await get(q([FUNC], "ja"))).json()) as Body;
    expect(ja.terms[0]!.senses).toEqual([
      { unitTitleJp: "開発プロセスの単元", definitionJp: "func(jp)", explanationJp: "func-expl(jp)", memoryHookJp: "func-hook(jp)" },
      { unitTitleJp: "要件定義の単元", definitionJp: "S-func(jp)", memoryHookJp: "S-func-hook(jp)" },
    ]);
  });

  it("omits an empty (or blank) locale field (no JP repeated as the translation)", async () => {
    const body = (await (await get(q([REQ], "en"))).json()) as Body;
    expect(body.terms[0]!.senses).toEqual([
      { unitTitleJp: "開発プロセスの単元", definitionJp: "req(jp)", memoryHookJp: "req-hook(jp)" },
    ]);
  });

  it("200: cacheable at the edge (the data only changes on deploy); errors: no-store", async () => {
    const ok = await get(q([FUNC]));
    expect(ok.status).toBe(200);
    expect(ok.headers.get("cache-control")).toBe("public, s-maxage=86400, stale-while-revalidate=604800");
    const empty = await get(q(["nope"]));
    expect(empty.status).toBe(200);
    expect(empty.headers.get("cache-control")).toBe("public, s-maxage=86400, stale-while-revalidate=604800");
    expect((await get("?locale=ja")).headers.get("cache-control")).toBe("no-store");
    expect((await get(q([FUNC], "fr"))).headers.get("cache-control")).toBe("no-store");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    dictHolder.current = Promise.reject(new TypeError("x"));
    expect((await get(q([FUNC]))).headers.get("cache-control")).toBe("no-store");
    log.mockRestore();
  });

  it("drops empty id segments before the 8-id cap; only empty segments → 400", async () => {
    const res = await get(`?ids=${FUNC},,,,,,,,,${REQ},&locale=ja`);
    expect(res.status).toBe(200);
    expect(((await res.json()) as Body).terms.map((t) => t.id)).toEqual([FUNC, REQ]);
    const commas = await get("?ids=,,,&locale=ja");
    expect(commas.status).toBe(400);
    expect(await commas.json()).toEqual({ error: "ids required" });
  });

  it("accepts 8 ids and rejects 9 with 400", async () => {
    const eight = [FUNC, NONFUNC, REQ, UNKNOWN, FUNC, NONFUNC, REQ, UNKNOWN];
    expect((await get(q(eight))).status).toBe(200);
    const res = await get(q([...eight, FUNC]));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "at most 8 ids" });
  });

  it("skips ids that are not termId-shaped or not in the dictionary, and repeats", async () => {
    const res = await get(q(["../etc/passwd", FUNC.toUpperCase(), `${FUNC}x`, UNKNOWN, "", REQ, FUNC, REQ]));
    expect(res.status).toBe(200);
    const body = (await res.json()) as Body;
    expect(body.terms.map((t) => t.id)).toEqual([REQ, FUNC]);
  });

  it("returns an empty list when no id is usable", async () => {
    const res = await get(q(["nope", UNKNOWN]));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ terms: [] });
  });

  it("400 without ids or with a missing / unknown locale", async () => {
    expect((await get("?locale=ja")).status).toBe(400);
    expect((await get("?ids=&locale=ja")).status).toBe(400);
    expect((await get(`?ids=${FUNC}`)).status).toBe(400);
    expect((await get(`?ids=${FUNC}&locale=fr`)).status).toBe(400);
    expect((await get(`?ids=${FUNC}&locale=JA`)).status).toBe(400);
  });

  it("500 when the dictionary or the unit index cannot be loaded; the log names the error type only", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    dictHolder.current = Promise.reject(new TypeError("ENOENT /secret/path"));
    let res = await get(q([FUNC]));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "dictionary unavailable" });
    expect(log).toHaveBeenCalledWith("[sensei-terms-error]", JSON.stringify({ error: "TypeError" }));

    dictHolder.current = Promise.resolve(dict);
    indexHolder.current = Promise.reject(new RangeError("bad /secret/index"));
    res = await get(q([FUNC]));
    expect(res.status).toBe(500);
    expect(log).toHaveBeenLastCalledWith("[sensei-terms-error]", JSON.stringify({ error: "RangeError" }));
    expect(JSON.stringify(log.mock.calls)).not.toContain("/secret/");
  });

  it("imports no LLM SDK and no owner gate", () => {
    const src = readFileSync(path.resolve(__dirname, "../route.ts"), "utf-8");
    expect(src).not.toMatch(/from "(ai|@ai-sdk\/[^"]+)"/);
    expect(src).not.toContain("isOwnerRequest");
  });
});
