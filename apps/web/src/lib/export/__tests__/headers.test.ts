// D-181 §0-8 / D-217 H1-5 — the static production CSP, now in out/_headers (was next.config
// headers(), which an export does not apply). The expected strings are written out here so the test
// does not share the constants it checks.
import { describe, expect, it } from "vitest";

import nextConfig from "../../../../next.config";
import { headersFile } from "../headers";

const EXPECTED_CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://api.anthropic.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
const EXPECTED_CSP_ANALYTICS =
  "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com/beacon.min.js; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://api.anthropic.com https://cloudflareinsights.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

/** Parse _headers into rules: pattern → [name, value][] (Cloudflare's format: unindented URL, indented headers). */
function parse(file: string): Map<string, [string, string][]> {
  const rules = new Map<string, [string, string][]>();
  let cur: [string, string][] | null = null;
  for (const line of file.split("\n")) {
    if (!line.trim() || line.startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      expect(rules.has(line), `duplicate rule ${line}`).toBe(false);
      cur = [];
      rules.set(line, cur);
      continue;
    }
    const m = /^\s+([A-Za-z-]+):\s(.+)$/.exec(line);
    expect(m, line).not.toBeNull();
    cur!.push([m![1]!, m![2]!]);
  }
  return rules;
}

describe("out/_headers (lib/export/headers)", () => {
  for (const analytics of [false, true]) {
    describe(analytics ? "with a Web Analytics token" : "without a token", () => {
      const file = headersFile({ analytics });
      const rules = parse(file);

      it("sets the §0-8 CSP once, on /*", () => {
        expect(rules.get("/*")).toEqual([["Content-Security-Policy", analytics ? EXPECTED_CSP_ANALYTICS : EXPECTED_CSP]]);
        const csp = [...rules.values()].flat().filter(([k]) => k.toLowerCase() === "content-security-policy");
        expect(csp).toHaveLength(1);
      });

      it("caches /_next/static/* for a year, immutable — and sets Cache-Control nowhere else (a second rule would be comma-joined)", () => {
        expect(rules.get("/_next/static/*")).toEqual([["Cache-Control", "public, max-age=31536000, immutable"]]);
        const cc = [...rules.entries()].filter(([, hs]) => hs.some(([k]) => k.toLowerCase() === "cache-control"));
        expect(cc.map(([p]) => p)).toEqual(["/_next/static/*"]);
      });

      it("marks every *.workers.dev host noindex and nothing else", () => {
        expect(rules.get("https://:name.:subdomain.workers.dev/*")).toEqual([["X-Robots-Tag", "noindex"]]);
        const robots = [...rules.entries()].filter(([, hs]) => hs.some(([k]) => k === "X-Robots-Tag"));
        expect(robots).toHaveLength(1);
      });

      it("stays within Cloudflare's limits (≤ 100 rules, ≤ 2,000 chars a line)", () => {
        expect(rules.size).toBeLessThanOrEqual(100);
        for (const l of file.split("\n")) expect(l.length).toBeLessThanOrEqual(2000);
      });
    });
  }

  it("next.config sets no headers() (an export would ignore them) and exports statically only in production", () => {
    expect(nextConfig.headers).toBeUndefined();
    expect(nextConfig.output).toBeUndefined(); // vitest runs with NODE_ENV=test → the dev / test shape
  });
});
