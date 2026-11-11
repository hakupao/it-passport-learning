// D-217 H1-5 — sitemap.xml + the per-page canonical check.
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { buildSitemaps, disallowed, robotsDisallows, writeSitemap } from "../sitemap";

const ORIGIN = "https://itlearn.bojiangz.com";

function page(p: string, opts: { noindex?: boolean; canonical?: string | null } = {}): string {
  const canon = opts.canonical === undefined ? ORIGIN + p : opts.canonical;
  const rest = p.replace(/^\/(ja|zh|en)/, "");
  return (
    `<html><head>${opts.noindex ? '<meta name="robots" content="noindex"/>' : ""}` +
    (canon === null ? "" : `<link rel="canonical" href="${canon}"/>`) +
    ["ja", "zh", "en", "x-default"].map((l) => `<link rel="alternate" hrefLang="${l}" href="${ORIGIN}/${l === "x-default" ? "ja" : l}${rest}"/>`).join("") +
    "</head></html>"
  );
}

function site(pages: Record<string, string>, robots: string): string {
  const root = mkdtempSync(path.join(tmpdir(), "sitemap-"));
  for (const [rel, html] of Object.entries(pages)) {
    mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    writeFileSync(path.join(root, rel), html);
  }
  writeFileSync(path.join(root, "robots.txt"), robots);
  return root;
}

const ROBOTS = "User-agent: MJ12bot\nDisallow: /\n\nUser-agent: *\nDisallow: /api/\nDisallow: /ja/record\nDisallow: /ja/practice?\n\nSitemap: x\n";

describe("sitemap", () => {
  it("reads only the * group's Disallow lines", () => {
    expect(robotsDisallows(ROBOTS)).toEqual(["/api/", "/ja/record", "/ja/practice?"]);
    expect(disallowed("/ja/record", robotsDisallows(ROBOTS))).toBe(true);
    expect(disallowed("/ja/practice", robotsDisallows(ROBOTS))).toBe(false);
  });

  it("lists crawlable pages by canonical URL; leaves out noindex and Disallowed pages", () => {
    const root = site(
      {
        "ja.html": page("/ja"),
        "ja/practice.html": page("/ja/practice"),
        "ja/practice/q/2009h21a-q054.html": page("/ja/practice/q/2009h21a-q054"),
        "ja/practice/mistakes.html": page("/ja/practice/mistakes", { noindex: true }),
        "ja/record.html": page("/ja/record"),
        "zh.html": page("/zh"),
        "en.html": page("/en"),
        "404.html": "<html></html>",
      },
      ROBOTS,
    );
    const r = writeSitemap(root);
    expect(r).toMatchObject({ pages: 7, listed: 5, noindex: 1, disallowed: 1, files: ["sitemap.xml"] });
    const xml = readFileSync(path.join(root, "sitemap.xml"), "utf-8");
    const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual([`${ORIGIN}/en`, `${ORIGIN}/ja`, `${ORIGIN}/ja/practice`, `${ORIGIN}/ja/practice/q/2009h21a-q054`, `${ORIGIN}/zh`]);
  });

  it("fails when a page's canonical is missing or not its own path", () => {
    for (const canonical of [null, `${ORIGIN}/ja/other`]) {
      const root = site({ "ja.html": page("/ja"), "zh.html": page("/zh", { canonical }), "en.html": page("/en") }, ROBOTS);
      expect(() => writeSitemap(root)).toThrow(/canonical check failed/);
    }
  });

  it("splits into a sitemap index over the limit", () => {
    const files = buildSitemaps(["a", "b", "c"], 2);
    expect(Object.keys(files).sort()).toEqual(["sitemap-1.xml", "sitemap-2.xml", "sitemap.xml"]);
    expect(files["sitemap.xml"]).toContain("<sitemapindex");
    expect(files["sitemap.xml"]).toContain(`<loc>${ORIGIN}/sitemap-2.xml</loc>`);
  });
});
