// D-217 — public/robots.txt: search engines may crawl the content. The temporary backlink-crawler block
// (stage 0.1, "until static") was removed after the Cloudflare static cutover (S154).
// The file is static (no function, no middleware); these checks pin its intent.
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { routing } from "@/i18n/routing";

const text = readFileSync(path.join(__dirname, "../../public/robots.txt"), "utf-8");

/** Parse into groups: each group = its user-agents + its Disallow paths. */
function groups(src: string): Array<{ agents: string[]; disallow: string[] }> {
  const out: Array<{ agents: string[]; disallow: string[] }> = [];
  let cur: { agents: string[]; disallow: string[] } | null = null;
  let inRules = false;
  for (const raw of src.split("\n")) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const m = /^([A-Za-z-]+):\s*(.*)$/.exec(line);
    if (!m) throw new Error(`unparseable robots.txt line: ${raw}`);
    const key = (m[1] ?? "").toLowerCase();
    const value = m[2] ?? "";
    if (key === "user-agent") {
      if (!cur || inRules) {
        cur = { agents: [], disallow: [] };
        out.push(cur);
        inRules = false;
      }
      cur.agents.push(value);
    } else if (key === "sitemap") {
      // a non-group record (RFC 9309 §2.2.4); checked on its own below
    } else if (key === "disallow") {
      if (!cur) throw new Error("Disallow before any User-agent");
      cur.disallow.push(value);
      inRules = true;
    } else {
      throw new Error(`unexpected robots.txt field: ${m[1]}`);
    }
  }
  return out;
}

describe("public/robots.txt (D-217)", () => {
  const gs = groups(text);
  const star = gs.find((g) => g.agents.includes("*"));

  it("blocks no crawler from the whole site (the backlink-crawler group was removed once static, D-217 stage 0.1)", () => {
    expect(gs.filter((g) => g.disallow.includes("/"))).toEqual([]);
  });

  it("has exactly one group: *", () => {
    // A crawler that matches a named group ignores `*` (RFC 9309 §2.2.1), so a stray named group
    // (say Googlebot) could hide content without touching the `*` rules.
    expect(gs.map((g) => g.agents)).toEqual([["*"]]);
  });

  it("keeps every crawler off the API and the per-user pages in all locales", () => {
    expect(star).toBeDefined();
    const want = ["/api/"];
    for (const locale of routing.locales) {
      // `practice?` = session URLs (query string): each fetch redirects to a fresh seed / run, an
      // unbounded space of per-request pages. `mock/run` renders a 100-question exam per request.
      for (const seg of ["record", "settings", "practice?", "mock/run"]) want.push(`/${locale}/${seg}`);
    }
    // Exact set: anything more would hide content from search engines.
    expect([...star!.disallow].sort()).toEqual(want.sort());
  });

  it("leaves the textbook, glossary and past-question pages crawlable for search engines", () => {
    // robots.txt rules are prefix matches, so test real paths rather than rule text.
    const blocked = (p: string): boolean => star!.disallow.some((d) => d !== "" && p.startsWith(d));
    for (const locale of routing.locales) {
      for (const p of ["", "/textbook", "/textbook/x", "/glossary", "/glossary/x", "/practice", "/practice/q/x", "/practice/browse/x"]) {
        expect(blocked(`/${locale}${p}`), `/${locale}${p}`).toBe(false);
      }
      expect(blocked(`/${locale}/mock`)).toBe(false);
      expect(blocked(`/${locale}/practice?topic=x&n=10&order=rand`)).toBe(true);
      expect(blocked(`/${locale}/mock/run?exam=x`)).toBe(true);
      expect(blocked(`/${locale}/record`)).toBe(true);
      expect(blocked(`/${locale}/settings`)).toBe(true);
    }
    expect(blocked("/api/learning")).toBe(true);
  });

  it("names the sitemap on the production origin (D-217 H1-5)", () => {
    const lines = text.split("\n").filter((l) => /^sitemap:/i.test(l));
    expect(lines).toEqual(["Sitemap: https://itlearn.bojiangz.com/sitemap.xml"]);
  });
});
