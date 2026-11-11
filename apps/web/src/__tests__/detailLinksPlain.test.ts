// D-223 細目 (H1-5) — the two detail families ship without their RSC payloads (.txt), so nothing may
// reach them through the Next client router: no <Link> (i18n or next/link) whose href is a detail
// path, no router.push / replace / prefetch to one. They go through <DetailLink> (a plain <a>) or
// detailNavigate (location.assign / replace). Static scan of src/ (tests excluded, comments stripped);
// the e2e side (H1-5 / H5) checks that a click into a detail page requests no .txt.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { isDetailPath, localeHref } from "@/lib/seo/detailLinks";

const SRC = path.resolve(__dirname, "..");

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "__tests__" || e.name === "fonts" ? [] : files(p);
    return /\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) ? [p] : [];
  });
}

function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

const DETAIL_LITERAL = String.raw`[\`"'](?:/(?:ja|zh|en))?/(?:practice/q|glossary)/`;
const LINK_TO_DETAIL = new RegExp(String.raw`<Link\b[^>]*\bhref=\{?\s*` + DETAIL_LITERAL);
const ROUTER_TO_DETAIL = new RegExp(String.raw`router\.(?:push|replace|prefetch)\(\s*` + DETAIL_LITERAL);

describe("detail links are plain navigations (D-223)", () => {
  const all = files(SRC);

  it("scans the components", () => {
    expect(all.length).toBeGreaterThan(100);
    expect(all.some((f) => f.endsWith(path.join("components", "app", "DetailLink.tsx")))).toBe(true);
  });

  it("no <Link> and no client-router call targets a detail path", () => {
    const hits: string[] = [];
    for (const f of all) {
      const src = code(readFileSync(f, "utf-8"));
      if (LINK_TO_DETAIL.test(src) || ROUTER_TO_DETAIL.test(src)) hits.push(path.relative(SRC, f));
    }
    expect(hits).toEqual([]);
  });

  it("the patterns catch the old forms (the scan is not vacuous)", () => {
    expect(LINK_TO_DETAIL.test("<Link href={`/practice/q/${id}`} className={x}>")).toBe(true);
    expect(LINK_TO_DETAIL.test('<Link href={`/glossary/${c.id}`} locale={locale} prefetch={false}>')).toBe(true);
    expect(ROUTER_TO_DETAIL.test("router.push(`/practice/q/${id}`)")).toBe(true);
    expect(LINK_TO_DETAIL.test("<Link href={`/practice/browse/${x.id}`}>")).toBe(false);
    expect(LINK_TO_DETAIL.test('<Link href="/glossary" locale={locale}>')).toBe(false);
  });

  it("isDetailPath / localeHref", () => {
    expect(isDetailPath("/practice/q/2009h21a-q054")).toBe(true);
    expect(isDetailPath("/glossary/t00219f657aedbb32")).toBe(true);
    expect(isDetailPath("/glossary")).toBe(false);
    expect(isDetailPath("/practice/browse")).toBe(false);
    expect(isDetailPath("/practice/q/a/b")).toBe(false);
    expect(isDetailPath("/practice?ids=x")).toBe(false);
    expect(localeHref("zh", "/practice/q/2009h21a-q054")).toBe("/zh/practice/q/2009h21a-q054");
    expect(localeHref("ja", "/")).toBe("/ja");
  });
});
