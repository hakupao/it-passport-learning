// C20 (S162, D-233 rule 3 / D-234): quiz zh quotes are “” with ‘’ only inside a “”, as in the textbook (C26) and the UI —
// no 「」『』 in any zh string of the explanations (correct / distractors / points) or of the translations sidecar
// (stem / choices); quotes balanced, ‘ never at depth 0, no “ inside a “. Regeneration that brings back 「」 turns this red.
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const QUIZ = path.resolve(__dirname, "../../../../../../data/ip/quiz");
type L3 = { zh?: string };
type Entry = { stem?: L3; choices?: Record<string, L3>; correct?: L3; distractors?: Record<string, L3>; points?: L3[] };
const docs = (dir: string) =>
  readdirSync(path.join(QUIZ, dir)).filter((f) => f.endsWith(".json")).sort()
    .map((f) => JSON.parse(readFileSync(path.join(QUIZ, dir, f), "utf-8")).questions as Record<string, Entry>);

function quoteProblems(s: string): string[] {
  const bad: string[] = [];
  if (/[「」『』]/.test(s)) bad.push("「」/『』");
  const st: string[] = [];
  for (const ch of s) {
    if (ch === "“") { if (st.length) bad.push("“ nested"); st.push("”"); }
    else if (ch === "‘") { if (!st.length) bad.push("‘ at depth 0"); if (st.length >= 2) bad.push("depth 3"); st.push("’"); }
    else if (ch === "”" || ch === "’") { if (st.pop() !== ch) bad.push(`unbalanced ${ch}`); }
  }
  if (st.length) bad.push("unclosed");
  return bad;
}

describe("quiz zh quotes (C20)", () => {
  it("the checker itself", () => {
    expect(quoteProblems("正确答案是“イ”，即“只有‘赞成’时”")).toEqual([]);
    expect(quoteProblems("正确答案是「イ」")).toContain("「」/『』");
    expect(quoteProblems("‘a’")).toContain("‘ at depth 0");
    expect(quoteProblems("“a“b””")).toContain("“ nested");
    expect(quoteProblems("“a‘b‘c’’”")).toContain("depth 3");
  });
  it("explanations and translations zh use “” (‘’ nested only), no 「」『』", () => {
    const bad: string[] = [];
    const check = (id: string, where: string, s?: string) => { if (typeof s === "string") for (const p of quoteProblems(s)) bad.push(`${id} ${where}: ${p}`); };
    let n = 0;
    for (const qs of docs("explanations")) for (const [id, q] of Object.entries(qs)) {
      n++;
      check(id, "correct", q.correct?.zh);
      for (const [k, o] of Object.entries(q.distractors ?? {})) check(id, `d:${k}`, o.zh);
      (q.points ?? []).forEach((o, i) => check(id, `p:${i}`, o.zh));
    }
    let nTr = 0;
    for (const qs of docs("translations")) for (const [id, q] of Object.entries(qs)) {
      nTr++;
      check(id, "stem", q.stem?.zh);
      for (const [k, o] of Object.entries(q.choices ?? {})) check(id, `c:${k}`, o?.zh);
    }
    expect(n).toBe(2900);
    expect(nTr).toBe(2900);
    expect(bad).toEqual([]);
  });
});
