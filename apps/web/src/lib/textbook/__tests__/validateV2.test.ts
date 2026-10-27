// Stage 7 Phase 3 Task 6 (D-196 §0-9 / §0-11 / §0-13, D-195) — the shared v2
// validator: the hand-written sample unit (management-10-27-u03, every figure
// kind) passes against the real unit_index + questions; breaking one thing at a
// time gives exactly one error with that check's code.
import { readFileSync } from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { loadBaseQuestions } from "../../quiz/quizReader";
import { loadReaderIndex, loadUnit } from "../reader";
import type { TextbookUnitV2 } from "../types";
import { BANNED_PHRASES, hookLines, introOf, v2Context, validateV2, type V2Context, type V2Issue } from "../validateV2";

const SAMPLE = JSON.parse(
  readFileSync(path.join(__dirname, "..", "__fixtures__", "v2-sample.json"), "utf-8"),
) as TextbookUnitV2;

let ctx: V2Context;
beforeAll(async () => {
  const [index, questions, v1] = await Promise.all([loadReaderIndex(), loadBaseQuestions(), loadUnit(SAMPLE.unit_id)]);
  ctx = v2Context(index as never, questions, SAMPLE.unit_id, v1.terms)!;
});

const clone = (): TextbookUnitV2 => structuredClone(SAMPLE);

/** Issues after `mutate` on a fresh copy of the sample. */
function issuesAfter(mutate: (u: TextbookUnitV2) => void): V2Issue[] {
  const u = clone();
  mutate(u);
  return validateV2(u, ctx);
}

function expectOne(mutate: (u: TextbookUnitV2) => void, code: string): void {
  const issues = issuesAfter(mutate);
  expect(issues, JSON.stringify(issues, null, 1)).toHaveLength(1);
  expect(issues[0]!.code).toBe(code);
}

const term = (u: TextbookUnitV2, name: string) => u.terms.find((t) => t.term === name)!;

describe("v2Context", () => {
  it("is built from unit_index (title + headwords) and the question bank", () => {
    expect(ctx.index.topic_id).toBe("management-10-27");
    expect(ctx.index.category).toBe("management");
    expect(ctx.index.terms).toEqual(["プロジェクトリスクマネジメント", "リスクの対応策", "回避", "軽減", "受容", "転嫁"]);
    expect(ctx.questions.get("2016h28a-q042")?.topic_id).toBe("management-10-27");
  });

  it("is null for a unit missing from the index", async () => {
    const [index, questions] = await Promise.all([loadReaderIndex(), loadBaseQuestions()]);
    expect(v2Context(index as never, questions, "nope-00-00-u01")).toBeNull();
  });
});

describe("validateV2 — the sample unit", () => {
  it("has 0 issues", () => {
    expect(validateV2(clone(), ctx)).toEqual([]);
  });

  it("covers every figure kind and both step / widget modes", () => {
    const kinds = SAMPLE.terms.map((t) => t.fig?.kind).filter(Boolean).sort();
    expect(kinds).toEqual(["compare", "flow", "network", "svg", "table", "tree"]);
    const modes = new Set(SAMPLE.terms.map((t) => t.fig?.mode));
    expect(modes).toEqual(new Set(["static", "steps", "widget"]));
  });
});

describe("validateV2 — compat derivation helpers", () => {
  it("introOf joins the stripped goals into one paragraph", () => {
    expect(introOf(["**A**を言える", "Bを選べる。"], "jp")).toBe("Aを言える。Bを選べる。");
    expect(introOf(["Name **A**", "Pick B."], "en")).toBe("Name A. Pick B.");
  });

  it("hookLines = 「headword: hook」 for the hooked terms, in unit order", () => {
    expect(hookLines(SAMPLE, "zh")).toEqual(SAMPLE.summary.memory_hooks_zh);
    expect(hookLines(SAMPLE, "jp")[0]).toBe("プロジェクトリスクマネジメント: 「リスク」はまだ起きていないこと。起きたら「問題」になる。");
  });
});

describe("validateV2 — one broken thing → one error", () => {
  it("schema_version", () => expectOne((u) => void ((u as { schema_version: string }).schema_version = "x"), "schema"));

  it("invariants: title, headword order, term_zh, unit id (fatal: nothing else is checked)", () => {
    expectOne((u) => void (u.title_jp = "別の題"), "invariant");
    expectOne((u) => void (u.title_en = "Other"), "invariant");
    expectOne((u) => void (u.terms = [u.terms[1]!, u.terms[0]!, ...u.terms.slice(2)]), "invariant");
    expectOne((u) => void u.terms.pop(), "invariant");
    expectOne((u) => void (u.terms[2]!.term_zh = "避免"), "invariant");
    expectOne((u) => void (u.topic_id = "management-10-28"), "invariant");
    expectOne((u) => void (u.category = "strategy"), "invariant");
  });

  it("missing translation", () => {
    expectOne((u) => void delete (u.terms[0] as Partial<TextbookUnitV2["terms"][0]>).detail_zh, "missing");
    expectOne((u) => void (u.goals_en = u.goals_en.slice(1)), "missing");
    expectOne((u) => void (term(u, "回避").points[0]!.text_en = " "), "missing");
  });

  it("analogy / hook: all three languages or none", () => {
    expectOne((u) => {
      const t = term(u, "回避");
      t.analogy_zh = "";
    }, "missing");
    expectOne((u) => {
      const t = term(u, "回避");
      delete t.hook_en;
      t.memory_hook_en = "";
      u.summary.memory_hooks_en.splice(2, 1);
    }, "missing");
  });

  it("malformed inline markup (compat check skipped for that field)", () => {
    expectOne((u) => void (u.terms[0]!.one_jp = `**${u.terms[0]!.one_jp}`), "markup");
    expectOne((u) => void (u.goals_jp[0] = "[[jp:未閉合"), "markup");
  });

  it("analogy is plain text (it doubles as the compat field)", () => {
    expectOne((u) => void (term(u, "回避").analogy_jp = "**落石**が心配な道を通らず、別の道に変えるようなものです。"), "markup");
  });

  it("compat field ≠ stripInline(new field)", () => {
    expectOne((u) => void (u.terms[1]!.definition_jp = "別の定義。"), "compat");
    expectOne((u) => void (u.terms[1]!.explanation_en = "Changed. Twice."), "compat");
    expectOne((u) => void (term(u, "回避").memory_hook_zh = "x"), "compat");
    expectOne((u) => void (u.overview.intro_jp = "x"), "compat");
    expectOne((u) => void (u.summary.key_points_zh[0] = "x"), "compat");
    expectOne((u) => void (u.summary.memory_hooks_jp = u.summary.memory_hooks_jp.slice(1)), "compat");
    expectOne((u) => void (term(u, "回避").inline_quiz = []), "compat");
    expectOne((u) => void (term(u, "回避").inline_fallback = true), "compat");
  });

  it("compat figure: v1 shape for an svg fig, null otherwise", () => {
    expectOne((u) => void (u.terms[0]!.figure = null), "compat");
    expectOne((u) => void (u.terms[0]!.figure!.svg_path = "figures/other.svg"), "compat");
    expectOne((u) => void (term(u, "回避").figure = { mermaid: "", svg_path: "figures/x.svg", rendered: true }), "compat");
  });

  it("pairs: both terms in the unit, a before b (shown after the later term), a key row", () => {
    expectOne((u) => void (u.pairs[0] = { ...u.pairs[0]!, a: "軽減", b: "回避" }), "pair");
    expectOne((u) => void (u.pairs[0]!.b = "保険"), "pair");
    expectOne((u) => void u.pairs[0]!.rows.forEach((r) => (r.key = false)), "pair");
  });

  it("exam points cite questions of this topic", () => {
    expectOne((u) => void delete term(u, "受容").points[0]!.qids, "point");
    expectOne((u) => void (term(u, "受容").points[0]!.qids = ["0000x-q999"]), "point");
  });

  it("fig: closed registry, allowed mode, data shape", () => {
    expectOne((u) => void ((term(u, "受容").fig as { kind: string }).kind = "pie"), "fig");
    expectOne((u) => void ((term(u, "受容").fig as { mode: string }).mode = "steps"), "fig");
    expectOne((u) => {
      const f = term(u, "受容").fig as { data: { rows: { cells: unknown[] }[] } };
      f.data.rows[0]!.cells.pop();
    }, "fig");
    expectOne((u) => void ((u.terms[0]!.fig as { data: { path: string } }).data.path = "../../etc/passwd"), "fig");
  });

  it("steps: 3〜4, captions in all three languages, valid state", () => {
    expectOne((u) => void (term(u, "回避").fig as { steps: unknown[] }).steps.pop(), "fig");
    expectOne((u) => void ((term(u, "回避").fig as { steps: { caption_en: string }[] }).steps[1]!.caption_en = ""), "fig");
    expectOne((u) => void ((term(u, "回避").fig as { steps: { state: { show: number } }[] }).steps[2]!.state.show = 4), "fig");
    expectOne((u) => void ((term(u, "リスクの対応策").fig as { steps: { state: { depth: number } }[] }).steps[0]!.state.depth = 0), "fig");
  });

  it("network: acyclic and connected", () => {
    expectOne((u) => void (term(u, "軽減").fig as { data: { acts: unknown[] } }).data.acts.push({ from: "4", to: "1", days: 1 }), "fig");
    expectOne((u) => void (term(u, "軽減").fig as { data: { nodes: string[] } }).data.nodes.push("5"), "fig");
    expectOne((u) => void ((term(u, "軽減").fig as { data: { acts: { days: number }[] } }).data.acts[0]!.days = -1), "fig");
  });

  it("展開 is 2〜3 sentences", () => {
    expectOne((u) => {
      const t = term(u, "回避");
      t.detail_jp += "三つ目の文です。四つ目の文です。";
      t.explanation_jp = t.detail_jp;
    }, "sentences");
    expectOne((u) => {
      const t = term(u, "回避");
      t.detail_en = "Only one sentence here.";
      t.explanation_en = t.detail_en;
    }, "sentences");
  });

  it("要点 has 3〜5 items", () => {
    expectOne((u) => {
      for (const l of ["jp", "zh", "en"] as const) {
        u[`key_points_${l}`] = u[`key_points_${l}`].slice(0, 2);
        u.summary[`key_points_${l}`] = u.summary[`key_points_${l}`].slice(0, 2);
      }
    }, "key-points");
  });

  it("quiz: resolvable, same topic, the question's terms include the term", () => {
    const setQuiz = (u: TextbookUnitV2, ids: string[]) => {
      const t = term(u, "受容");
      t.quiz = ids;
      t.inline_quiz = ids;
    };
    expectOne((u) => setQuiz(u, ["0000x-q999"]), "quiz");
    expectOne((u) => setQuiz(u, ["2009h21a-q001"]), "quiz"); // strategy topic
    expectOne((u) => setQuiz(u, ["2011h23a-q038"]), "quiz"); // same topic, terms lack 受容
  });

  it("challenge_questions: resolvable and same topic", () => {
    expectOne((u) => void u.challenge_questions.push("0000x-q999"), "challenge");
    expectOne((u) => void u.challenge_questions.push("2009h21a-q001"), "challenge");
  });

  it("D-195 §9 banned phrasing", () => {
    expect(BANNED_PHRASES.jp.length).toBeGreaterThan(0);
    expectOne((u) => {
      const t = term(u, "回避");
      t.detail_jp = "計画や方式を変えて、リスクが起きる状況そのものを作らないようにします。この違いをしっかり理解しておきましょう。";
      t.explanation_jp = t.detail_jp;
    }, "banned");
    expectOne((u) => {
      const t = term(u, "回避");
      t.detail_zh = "通过改变计划或方式，从根本上不制造风险发生的情境。考试中会考查这一点。";
      t.explanation_zh = t.detail_zh;
    }, "banned");
    expectOne((u) => {
      const t = term(u, "回避");
      t.detail_en = "You change the plan so the risk never arises. Make sure to understand this point.";
      t.explanation_en = t.detail_en;
    }, "banned");
  });

  it("D-195 §9: three or more of the unit's headwords listed in one sentence", () => {
    expectOne((u) => {
      u.key_points_jp[1] = "回避・軽減・転嫁はどれもリスクに働きかける。";
      u.summary.key_points_jp[1] = u.key_points_jp[1];
    }, "listing");
  });

  it("D-195 §6: a memory hook that restates the definition", () => {
    expectOne((u) => {
      const t = term(u, "回避");
      t.hook_jp = "回避といえばリスク要因を取り除く対応";
      t.memory_hook_jp = t.hook_jp;
      u.summary.memory_hooks_jp[2] = `回避: ${t.hook_jp}`;
    }, "hook");
  });

  it("overview rows follow the unit's terms; extra cells match the columns", () => {
    expectOne((u) => void u.overview_rows.pop(), "overview");
    expectOne((u) => void u.overview_rows[0]!.extra_zh.push("x"), "overview");
  });

  it("lang_status and overview metadata", () => {
    expectOne((u) => void (u.lang_status.zh = "pending"), "meta");
    expectOne((u) => void (u.overview.est_minutes = 0), "meta");
  });
});
