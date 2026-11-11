// Stage 7 Phase 3c (D-215, S153) — direct edits outside the merge path. A later merge --write of these units
// re-assembles titles / the v1 figure from manifest.v1 and would silently revert them: this test makes that red.
import { readFileSync } from "node:fs";
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
});
