// D-181 §0-9 — GET /api/sensei/terms?ids=<id>,…&locale=<ja|zh|en>: the free question's
// term cards. Contract: at most 8 ids (else 400); ids that are not termId-shaped, or
// not in the dictionary, are skipped; repeated ids are returned once; cards come back
// in the requested order in the TermCard shape; a valid locale is required (400);
// no owner cookie is needed; nothing but the dictionary is read (no LLM, no network).
// The dictionary is a small fixture through the loader mock.

import { readFileSync } from "node:fs";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildDictionary, toTermCard, type Dictionary } from "@/lib/glossary/dictionary";
import { termId } from "@/lib/glossary/termId";
import type { ReaderIndex } from "@/lib/textbook/reader";
import type { TextbookUnit, UnitTerm } from "@/lib/textbook/types";

const { dictHolder } = vi.hoisted(() => ({
  dictHolder: { current: null as Promise<Dictionary> | null },
}));

vi.mock("@/lib/glossary/dictionaryReader", () => ({
  loadDictionary: () => dictHolder.current!,
}));

import { GET } from "../route";

const term = (jp: string, zh: string, en: string, def: string): UnitTerm => ({
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
});

const UNIT: TextbookUnit = {
  schema_version: "stage4-unit-v1-trilingual",
  unit_id: "management-08-25-u01",
  topic_id: "management-08-25",
  category: "management",
  title_jp: "u",
  title_zh: "u",
  title_en: "u",
  unit_summary_jp: "",
  unit_summary_zh: "",
  unit_summary_en: "",
  order_in_topic: 1,
  prerequisites: [],
  overview: { intro_jp: "", intro_zh: "", intro_en: "", freq_badge: "標準", est_minutes: 15 },
  terms: [
    term("機能要件", "功能需求", "Functional requirement", "func"),
    term("非機能要件", "非功能需求", "Non-functional requirement", "nonfunc"),
    term("要件定義", "需求定义", "Requirements definition", "req"),
  ],
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
};

const INDEX: ReaderIndex = {
  schema_version: "stage4-toc-v1",
  stats: { topics: 1, units: 1, terms: 3 },
  topics: [
    {
      topic_id: "management-08-25",
      category: "management",
      major: "開発技術",
      major_zh: "开发技术",
      major_en: "Development Technology",
      medium: "システム開発技術",
      medium_zh: "系统开发技术",
      medium_en: "System Development Technology",
      name_jp: "システム開発のプロセス",
      unit_order: ["management-08-25-u01"],
      units: [
        {
          unit_id: "management-08-25-u01",
          title_jp: "u",
          title_zh: "u",
          title_en: "u",
          node_freq_badge: "標準",
          term_count: 3,
        },
      ],
    },
  ],
};

const dict = buildDictionary(INDEX, [UNIT], []);
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
  fetchSpy = vi.spyOn(globalThis, "fetch");
});

afterEach(() => {
  expect(fetchSpy, "the route makes no network call").not.toHaveBeenCalled();
  vi.restoreAllMocks();
});

describe("GET /api/sensei/terms", () => {
  it("returns the TermCard of each id, in the requested order, without an owner cookie", async () => {
    const res = await get(q([NONFUNC, FUNC], "en"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/json; charset=utf-8");
    const body = (await res.json()) as { cards: unknown[] };
    expect(Object.keys(body)).toEqual(["cards"]);
    expect(body.cards).toEqual([
      {
        id: NONFUNC,
        term: "非機能要件",
        gloss: "Non-functional requirement",
        definition: "nonfunc(en)",
        memoryHook: "nonfunc-hook(en)",
        senseCount: 1,
        questionCount: 0,
      },
      toTermCard(dict.byId.get(FUNC)!, "en"),
    ]);
  });

  it("uses the requested locale's fields", async () => {
    const body = (await (await get(q([FUNC], "zh"))).json()) as { cards: { gloss: string; definition: string }[] };
    expect(body.cards.map((c) => [c.gloss, c.definition])).toEqual([["功能需求", "func(zh)"]]);
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
    const body = (await res.json()) as { cards: { id: string }[] };
    expect(body.cards.map((c) => c.id)).toEqual([REQ, FUNC]);
  });

  it("returns an empty list when no id is usable", async () => {
    const res = await get(q(["nope", UNKNOWN]));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ cards: [] });
  });

  it("400 without ids or with a missing / unknown locale", async () => {
    expect((await get("?locale=ja")).status).toBe(400);
    expect((await get("?ids=&locale=ja")).status).toBe(400);
    expect((await get(`?ids=${FUNC}`)).status).toBe(400);
    expect((await get(`?ids=${FUNC}&locale=fr`)).status).toBe(400);
  });

  it("500 when the dictionary cannot be loaded; the log names the error type only", async () => {
    dictHolder.current = Promise.reject(new TypeError("ENOENT /secret/path"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await get(q([FUNC]));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "dictionary unavailable" });
    expect(log).toHaveBeenCalledWith("[sensei-terms-error]", JSON.stringify({ error: "TypeError" }));
    expect(JSON.stringify(log.mock.calls)).not.toContain("/secret/path");
  });

  it("imports no LLM SDK and no owner gate", () => {
    const src = readFileSync(path.resolve(__dirname, "../route.ts"), "utf-8");
    expect(src).not.toMatch(/from "(ai|@ai-sdk\/[^"]+)"/);
    expect(src).not.toContain("isOwnerRequest");
  });
});
