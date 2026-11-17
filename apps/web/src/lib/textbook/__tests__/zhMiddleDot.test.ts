// S164 D-238 (OQ-25, W3C clreq): in zh the 间隔号「·」(U+00B7) is kept only inside transliterated foreign personal names
// and where the text shows the dot itself as a symbol (“·” = AND / Morse dot, √2·s = multiplication). Coordinate items
// take 顿号「、」 (reviewed classification: evidence/phase5/hosting/oq25/classify_{tb,quiz}.json). Covers every zh string
// of the textbook units, unit_index.json and zh_terms.json, and the quiz explanations / translations sidecars.
// A regenerated or new「·」 list (e.g.「财务·资产」) turns this red; a new foreign name goes into NAMES after review.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const DATA = path.resolve(__dirname, "../../../../../../data/ip");
const NAMES = [
  "亨利·甘特", "约翰·博伊德", "埃里克·斯托尔特曼", "爱德华·塔夫特", "约翰·鲁格", "蒂姆·伯纳斯-李", "迈克尔·波特",
  "杰弗里·摩尔", "约翰·维恩", "乔治·布尔", "林纳斯·托瓦兹", "威廉·吉布森", "克莱顿·克里斯坦森", "唐纳德·诺曼",
];
const SYMBOLS = ["“·”", "√2·s"];
const allowed = (s: string) => [...NAMES, ...SYMBOLS].reduce((t, a) => t.split(a).join(""), s);

function zhStrings(o: unknown, p: string, inZh: boolean, out: [string, string][]) {
  if (typeof o === "string") { if (inZh) out.push([p, o]); return; }
  if (Array.isArray(o)) o.forEach((x, i) => zhStrings(x, `${p}[${i}]`, inZh, out));
  else if (o && typeof o === "object")
    for (const [k, v] of Object.entries(o)) zhStrings(v, p ? `${p}.${k}` : k, inZh || k === "zh" || k.endsWith("_zh"), out);
}
const jsonFiles = (dir: string) => readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => path.join(dir, f));

describe("zh middle dot · (D-238)", () => {
  it("the allowlist removes only names and symbols", () => {
    expect(allowed("亨利·甘特提出")).toBe("提出");
    expect(allowed("财务·资产")).toContain("·");
  });

  it("no zh string uses · outside foreign names / the dot as a symbol", () => {
    const files = [
      ...jsonFiles(path.join(DATA, "textbook/units")),
      path.join(DATA, "textbook/unit_index.json"),
      ...jsonFiles(path.join(DATA, "quiz/explanations")),
      ...jsonFiles(path.join(DATA, "quiz/translations")),
    ];
    const bad: string[] = [];
    for (const f of files) {
      const out: [string, string][] = [];
      zhStrings(JSON.parse(readFileSync(f, "utf-8")), "", false, out);
      for (const [p, s] of out) if (allowed(s).includes("·")) bad.push(`${path.basename(f)} ${p}: ${s.slice(Math.max(0, s.indexOf("·") - 15), s.indexOf("·") + 15)}`);
    }
    const zt = JSON.parse(readFileSync(path.join(DATA, "textbook/zh_terms.json"), "utf-8"));
    const vals: [string, string][] = [];
    zhStrings({ terms: zt.terms, per_unit: zt.per_unit }, "", true, vals);
    for (const [p, s] of vals) if (allowed(s).includes("·")) bad.push(`zh_terms ${p}: ${s}`);
    expect(bad).toEqual([]);
  });
});
