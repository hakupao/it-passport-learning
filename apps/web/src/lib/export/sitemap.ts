// D-217 H1-5 — sitemap.xml from the exported pages: every out/<locale>/**.html that is crawlable
// (no `<meta name="robots" content="noindex">`, not under a robots.txt Disallow of the `*` group),
// as its canonical URL — which must be the page's own path on SITE_ORIGIN (checked here, so a page
// without its canonical fails the build). Over 50,000 URLs → sitemap-N.xml + a sitemap index.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { SITE_ORIGIN } from "../seo/site.ts";
import { LOCALES } from "./prune.ts";

export const SITEMAP_LIMIT = 50_000;

/** `Disallow:` values of the `User-agent: *` group. */
export function robotsDisallows(robots: string): string[] {
  const out: string[] = [];
  let inStar = false;
  let lastWasAgent = false;
  for (const raw of robots.split("\n")) {
    const line = raw.replace(/#.*/, "").trim();
    if (!line) continue;
    const [k, ...v] = line.split(":");
    const key = k!.trim().toLowerCase();
    const val = v.join(":").trim();
    if (key === "user-agent") {
      inStar = lastWasAgent ? inStar || val === "*" : val === "*";
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (inStar && key === "disallow" && val) out.push(val);
  }
  return out;
}

/** A robots prefix match (no wildcards are used in robots.txt; `?` is literal). */
export function disallowed(urlPath: string, disallows: readonly string[]): boolean {
  return disallows.some((d) => urlPath.startsWith(d));
}

export function pagePathOf(relHtml: string): string {
  return "/" + relHtml.split(path.sep).join("/").replace(/\.html$/, "");
}

const CANONICAL = /<link rel="canonical" href="([^"]*)"\/?>/g;
const NOINDEX = /<meta name="robots" content="[^"]*noindex/;

export type PageInfo = { path: string; canonical: string[]; noindex: boolean; hreflangs: number };

export function readPage(outDir: string, relHtml: string): PageInfo {
  const html = readFileSync(path.join(outDir, relHtml), "utf-8");
  return {
    path: pagePathOf(relHtml),
    canonical: [...html.matchAll(CANONICAL)].map((m) => m[1]!),
    noindex: NOINDEX.test(html),
    hreflangs: (html.match(/<link rel="alternate" hrefLang="/g) ?? []).length,
  };
}

export function localeHtmlFiles(outDir: string): string[] {
  const out: string[] = [];
  const walk = (rel: string): void => {
    for (const e of readdirSync(path.join(outDir, rel), { withFileTypes: true })) {
      const r = path.join(rel, e.name);
      if (e.isDirectory()) walk(r);
      else if (e.name.endsWith(".html")) out.push(r);
    }
  };
  for (const l of LOCALES) {
    out.push(`${l}.html`);
    if (existsSync(path.join(outDir, l))) walk(l);
  }
  return out.sort();
}

function urlset(urls: readonly string[]): string {
  const body = urls.map((u) => `<url><loc>${u}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function buildSitemaps(urls: readonly string[], limit = SITEMAP_LIMIT): Record<string, string> {
  if (urls.length <= limit) return { "sitemap.xml": urlset(urls) };
  const files: Record<string, string> = {};
  const names: string[] = [];
  for (let i = 0; i * limit < urls.length; i++) {
    const name = `sitemap-${i + 1}.xml`;
    files[name] = urlset(urls.slice(i * limit, (i + 1) * limit));
    names.push(name);
  }
  files["sitemap.xml"] =
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    names.map((n) => `<sitemap><loc>${SITE_ORIGIN}/${n}</loc></sitemap>`).join("\n") +
    `\n</sitemapindex>\n`;
  return files;
}

export type SitemapResult = { pages: number; listed: number; noindex: number; disallowed: number; files: string[] };

/** Checks every page's canonical + hreflang, then writes the sitemap file(s) into outDir. */
export function writeSitemap(outDir: string): SitemapResult {
  const disallows = robotsDisallows(readFileSync(path.join(outDir, "robots.txt"), "utf-8"));
  const urls: string[] = [];
  const bad: string[] = [];
  let noindex = 0;
  let blocked = 0;
  const pages = localeHtmlFiles(outDir);
  for (const rel of pages) {
    const p = readPage(outDir, rel);
    const want = SITE_ORIGIN + p.path;
    if (p.canonical.length !== 1 || p.canonical[0] !== want) bad.push(`${p.path}: canonical ${JSON.stringify(p.canonical)}`);
    if (p.hreflangs !== 4) bad.push(`${p.path}: ${p.hreflangs} hreflang links (want ja/zh/en/x-default)`);
    if (p.noindex) noindex++;
    else if (disallowed(p.path, disallows)) blocked++;
    else urls.push(want);
  }
  if (bad.length) throw new Error(`canonical check failed on ${bad.length} pages:\n${bad.slice(0, 20).join("\n")}`);
  const files = buildSitemaps(urls);
  for (const [name, xml] of Object.entries(files)) writeFileSync(path.join(outDir, name), xml);
  return { pages: pages.length, listed: urls.length, noindex, disallowed: blocked, files: Object.keys(files) };
}
