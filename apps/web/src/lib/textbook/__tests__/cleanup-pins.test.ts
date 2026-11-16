// Stage 7 Phase 3c (D-215, S153) — direct edits outside the merge path. A later merge --write of these units
// re-assembles titles / the v1 figure from manifest.v1 and would silently revert them: this test makes that red.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const TB = path.resolve(__dirname, "../../../../../../data/ip/textbook");
const unit = (id: string) => JSON.parse(readFileSync(path.join(TB, "units", `${id}.json`), "utf-8"));
const index = () => JSON.parse(readFileSync(path.join(TB, "unit_index.json"), "utf-8")) as { topics: { units: { unit_id: string; title_zh: string }[] }[] };

describe("D-215 direct edits stay in place", () => {
  it("C3 technology-14-39-u01: the <p> tag figure uses ASCII angle brackets (svg + mermaid)", () => {
    const u = unit("technology-14-39-u01");
    const m = u.terms[1].figure.mermaid as string;
    expect(m).not.toMatch(/[〈〉]/);
    expect(m).toContain("#lt;p#gt;");
    expect(m).toContain("#lt;/p#gt;");
    const svg = readFileSync(path.join(TB, "figures", "technology-14-39-u01-t01.svg"), "utf-8");
    expect(svg).not.toMatch(/[〈〉]/);
    expect(svg).toContain("&lt;p&gt;");
    expect(svg).toContain("&lt;/p&gt;");
  });

  it("C10 strategy-04-13-u02: title_zh says 商业化 (事業化), in the unit and in unit_index.json", () => {
    const want = "创新理论与商业化的三道关口";
    expect(unit("strategy-04-13-u02").title_zh).toBe(want);
    const iu = index().topics.flatMap((t) => t.units).find((x) => x.unit_id === "strategy-04-13-u02");
    expect(iu?.title_zh).toBe(want);
  });

  it("C8 technology-23-63-u10: title_zh says 生物特征认证 (生体認証, as the body), in the unit and in unit_index.json", () => {
    const want = "生物特征认证与认证精度指标";
    expect(unit("technology-23-63-u10").title_zh).toBe(want);
    expect(index().topics.flatMap((t) => t.units).find((x) => x.unit_id === "technology-23-63-u10")?.title_zh).toBe(want);
  });

  it("C4 management-09-26-u04: the Scrum tree has the Increment node (Scrum Guide 2020 artifact) in all three languages", () => {
    const root = unit("management-09-26-u04").terms[0].fig.data.root as { children: { id: string; label: Record<string, string> }[] };
    const inc = root.children.find((c) => c.id === "increment");
    expect(inc?.label).toEqual({ jp: "インクリメント (完成した成果)", zh: "增量（完成的成果）", en: "Increment (finished result)" });
  });

  it("C11 (D-216): the 40 edited units keep their new challenge_questions (a merge --write would bring back the v1 ones)", () => {
    const applied = JSON.parse(
      readFileSync(path.resolve(__dirname, "../../../../../../evidence/phase5/stage_07_ui/phase3/cleanup/C11_applied.json"), "utf-8"),
    ) as Record<string, { after: string[]; removed: string[] }>;
    expect(Object.keys(applied)).toHaveLength(40);
    for (const [id, a] of Object.entries(applied)) {
      const ch = unit(id).challenge_questions as string[];
      expect(ch, id).toEqual(a.after);
      for (const q of a.removed) expect(ch, `${id} ${q}`).not.toContain(q);
    }
  });

  it("C18: no unit's title_zh / unit_summary_zh uses ASCII , : ; ( ) ! ? (full-width is the corpus norm), in units and unit_index.json", () => {
    const ascii = /[,:;()!?]/;
    const bad: string[] = [];
    for (const f of readdirSync(path.join(TB, "units")).filter((x) => x.endsWith(".json"))) {
      const u = JSON.parse(readFileSync(path.join(TB, "units", f), "utf-8"));
      for (const k of ["title_zh", "unit_summary_zh"]) if (ascii.test(u[k])) bad.push(`${f} ${k}: ${u[k]}`);
    }
    for (const iu of index().topics.flatMap((t) => t.units)) if (ascii.test(iu.title_zh)) bad.push(`index ${iu.unit_id}: ${iu.title_zh}`);
    expect(bad).toEqual([]);
  });

  // L4-d (D-230, W3C clreq §5.1): zh「・」(U+30FB, JIS) → 顿号「、」. Allowed: inside [[jp:…]] (Japanese names), inside
  // the （…）/ (…) Japanese original that compatText derives from a mark (derived fields only), and the Gantt figure
  // symbol (the figure whose legend defines 「・无工作」). Titles are direct edits (a merge --write would revert them).
  // Rule D MEDIUM-1: the parenthesis exemption is limited to derived fields — a kana test would also match ・ itself.
  it("L4-d: no zh field of any unit or of unit_index.json uses ・ outside Japanese names / the Gantt symbol", () => {
    const DERIVED = /(^|\.)(terms\[\d+\]\.(definition|explanation|memory_hook)|overview\.intro|summary\.(key_points|memory_hooks))_zh(\[\d+\])?$/;
    const strip = (s: string, p: string) => {
      const t = s.replace(/\[\[jp:[^\]]*\]\]/g, "");
      return DERIVED.test(p) ? t.replace(/[（(][^（()）]*[）)]/g, "") : t;
    };
    const bad: string[] = [];
    const walk = (o: unknown, p: string, where: string) => {
      if (typeof o === "string") {
        if (/(_zh|\.zh)(\[\d+\])?$/.test(p) && strip(o, p).includes("・")) bad.push(`${where} ${p}: ${o.slice(0, 60)}`);
      } else if (Array.isArray(o)) o.forEach((x, i) => walk(x, `${p}[${i}]`, where));
      else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) walk(v, p ? `${p}.${k}` : k, where);
    };
    for (const f of readdirSync(path.join(TB, "units")).filter((x) => x.endsWith(".json"))) {
      const u = JSON.parse(readFileSync(path.join(TB, "units", f), "utf-8"));
      for (const t of u.terms ?? []) if (JSON.stringify(t.fig?.data?.cols ?? []).includes("・无工作")) t.fig = null; // the Gantt symbol (Rule D LOW-5: found by its legend, not by position)
      walk(u, "", f);
    }
    walk(index(), "", "index");
    expect(bad).toEqual([]);
  });

  // C19a (S158): in zh the annotation parentheses are full-width （ ） (corpus 10,067 vs 119). ASCII ( ) around Chinese stays
  // only where it is syntax — math grouping, predicate logic, pseudo-code. C19b (S158) moved the 18 zh_terms headwords too.
  // The reviewed list is evidence/phase5/hosting/c19_table.json; a new ASCII gloss like「HR (人事)」turns this red.
  it("C19b: no zh_terms.json value uses ASCII ( ) (the headwords take （ ）, like the rest of the table)", () => {
    const zt = JSON.parse(readFileSync(path.join(TB, "zh_terms.json"), "utf-8")) as Record<string, unknown>;
    const bad: string[] = [];
    const walk = (o: unknown, k: string): void => {
      if (typeof o === "string") { if (k !== "note" && /[()]/.test(o)) bad.push(o); }
      else if (o && typeof o === "object") for (const [kk, v] of Object.entries(o)) walk(v, kk);
    };
    walk(zt, "");
    expect(bad).toEqual([]);
  });

  it("C19a: ASCII ( ) around Chinese in zh text only for math / logic / pseudo-code", () => {
    const KEEP = new Set([
      // math grouping
      "1 − 变动成本率", "1 − 变动成本率（[[jp:変動費率]]）", "1 − 销售毛利率", "固定成本（[[jp:固定費]]） + 目标利润",
      "订货间隔（[[jp:発注間隔]]） + 采购周期（[[jp:調達期間]]）",
      // predicate logic (technology-13-35-u03) and pseudo-code (technology-14-37-u01 / u03)
      "咪咪", "咪咪, 小花", "对象", "猫(x) → 动物(x)", "猫(x) ∧ 白(x)", "条件", "变量的变化方式", "参数", "接收的值", "整数型: 名称",
    ]);
    const DERIVED = /(^|\.)(terms\[\d+\]\.(definition|explanation|memory_hook)|overview\.intro|summary\.(key_points|memory_hooks))_zh(\[\d+\])?$/;
    const bad: string[] = [];
    const walk = (o: unknown, p: string, where: string) => {
      if (typeof o === "string") {
        if (!/(_zh|\.zh)(\[\d+\])?$/.test(p) || DERIVED.test(p)) return;
        const t = o.replace(/\[\[jp:[^\]]*\]\]/g, (m) => "J".repeat(m.length));
        const st: number[] = [];
        for (let i = 0; i < t.length; i++) {
          if (t[i] === "(") st.push(i);
          else if (t[i] === ")" && st.length) {
            const a = st.pop()!;
            const inner = o.slice(a + 1, i);
            if (/[一-鿿]/.test(t.slice(a + 1, i)) && !KEEP.has(inner)) bad.push(`${where} ${p}: (${inner})`);
          }
        }
      } else if (Array.isArray(o)) o.forEach((x, i) => walk(x, `${p}[${i}]`, where));
      else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) walk(v, p ? `${p}.${k}` : k, where);
    };
    for (const f of readdirSync(path.join(TB, "units")).filter((x) => x.endsWith(".json"))) walk(JSON.parse(readFileSync(path.join(TB, "units", f), "utf-8")), "", f);
    expect(bad).toEqual([]);
  });

  // C24 (S158): no space between a full-width ） and a Chinese character in any zh field (corpus 4,469 vs 4); spaces
  // around operators (「） + 」「） − 」) are formula spacing and stay.
  it("C24: no zh field has a space between ） and a Chinese character", () => {
    const bad: string[] = [];
    const walk = (o: unknown, p: string, where: string) => {
      if (typeof o === "string") {
        // Rule D (c24_review) LOW: also the content shapes that produced it —「）** 汉」and a keyword + JP gloss「**X** [[jp:Y]] 汉」.
        if (/(_zh|\.zh)(\[\d+\])?$/.test(p) && /）(\*\*)? [一-鿿]|\*\* ?\[\[jp:[^\]]+\]\] [一-鿿]/.test(o)) bad.push(`${where} ${p}`);
      } else if (Array.isArray(o)) o.forEach((x, i) => walk(x, `${p}[${i}]`, where));
      else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) walk(v, p ? `${p}.${k}` : k, where);
    };
    for (const f of readdirSync(path.join(TB, "units")).filter((x) => x.endsWith(".json"))) walk(JSON.parse(readFileSync(path.join(TB, "units", f), "utf-8")), "", f);
    walk(index(), "", "index");
    expect(bad).toEqual([]);
  });

  it("C18 technology-23-62-u01: unit_summary_zh no longer calls 手続き 手续", () => {
    expect(unit("technology-23-62-u01").unit_summary_zh).not.toContain("手续");
  });

  // C25 (S159, D-231): in zh, no space at a **keyword** edge when both neighbours are Han / kana / Chinese punctuation
  // (incl. `**X** [[jp:Y]]`). Kept: Han–Latin spaces, and keywords that are formulas — exactly the 8 edges below
  // (the space is the only delimiter left once compatText drops the **). Bare [[jp:]] neighbours are C25b, not pinned here.
  it("C25: no zh keyword edge has a space between Chinese characters (formula keywords excepted)", () => {
    const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー，。、；：？！“”‘’《》（）【】「」『』…—～]/u;
    const HK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]/u;
    const KEEP = [
      "strategy-01-03-u02 terms[3].one_zh 销售单价 × 销售量",
      "strategy-01-03-u02 terms[4].one_zh 变动成本 ÷ 销售额",
      "strategy-01-03-u02 terms[4].one_zh 变动成本 ÷ 销售额",
      "strategy-01-03-u03 goals_zh[1] 资产 = 负债 + 净资产",
      "strategy-01-03-u03 goals_zh[1] 资产 = 负债 + 净资产",
      "strategy-01-03-u03 terms[0].detail_zh 资产 = 负债 + 净资产",
      "strategy-01-03-u03 key_points_zh[1] 资产 = 负债 + 净资产",
      "strategy-01-03-u03 key_points_zh[1] 资产 = 负债 + 净资产",
    ];
    const bad: string[] = [];
    const kept: string[] = [];
    const walk = (o: unknown, p: string, where: string) => {
      if (typeof o === "string") {
        if (!/(_zh|\.zh)(\[\d+\])?$/.test(p) || !o.includes("**")) return;
        const seg = o.split("**"); // well-formed (v2-corpus gate): odd segments are keywords
        for (let i = 1; i < seg.length - 1; i += 2) {
          const key = seg[i] ?? "";
          const before = seg[i - 1] ?? "";
          const after = seg[i + 1] ?? "";
          const open = / $/.test(before) && CJK.test(before.at(-2) ?? "") && HK.test(key[0] ?? "");
          const gloss = /^ \[\[jp:/.test(after) && CJK.test(key.at(-1) ?? "") && HK.test(after[6] ?? "");
          const close = /^ [^[]/.test(after) && CJK.test(key.at(-1) ?? "") && HK.test(after[1] ?? "");
          for (const e of [open, gloss, close]) {
            if (!e) continue;
            if (/[=＝+＋−－×÷]/.test(key)) kept.push(`${where} ${p} ${key}`);
            else bad.push(`${where} ${p} «${key}»`);
          }
        }
      } else if (Array.isArray(o)) o.forEach((x, i) => walk(x, `${p}[${i}]`, where));
      else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) walk(v, p ? `${p}.${k}` : k, where);
    };
    for (const f of readdirSync(path.join(TB, "units")).filter((x) => x.endsWith(".json")).sort()) walk(unit(f.replace(/\.json$/, "")), "", f.replace(/\.json$/, ""));
    expect(bad).toEqual([]);
    expect(kept.sort()).toEqual([...KEEP].sort());
    // the one unmarked exception of D-231 (Rule D L3(c))
    expect(unit("strategy-01-01-u06").terms[1].hook_zh).toContain("”来管理");
    expect(unit("strategy-01-01-u06").terms[1].hook_zh).not.toContain("” 来管理");
  });
});
