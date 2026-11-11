// H1-1 (D-217) — no page under /[locale] reads the owner cookie on the server: the owner flag is
// read in the browser (useOwner), so the pages can be prerendered as static HTML later (H1-4).
// The API routes keep their isOwnerRequest check (not covered here).
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const LOCALE_DIR = path.resolve(__dirname, "..");
const SRC = path.resolve(__dirname, "../../..");

/** Every non-test .ts / .tsx file under dir. */
function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "__tests__" ? [] : sources(p);
    return /\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) ? [p] : [];
  });
}

function pages(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "__tests__" ? [] : pages(p);
    return e.name === "page.tsx" ? [p] : [];
  });
}

describe("/[locale] pages read no owner cookie on the server", () => {
  const files = pages(LOCALE_DIR);

  it("finds the pages", () => {
    expect(files.length).toBeGreaterThanOrEqual(14);
  });

  it("no cookies() / next/headers / isOwner / OWNER_COOKIE in any page", () => {
    for (const f of files) {
      const src = readFileSync(f, "utf-8");
      const rel = path.relative(LOCALE_DIR, f);
      expect(src, rel).not.toMatch(/cookies\(|next\/headers|isOwner|OWNER_COOKIE/);
    }
  });

  it("no request-time cookie / header read anywhere a page can import from (layouts, components, hooks, lib, i18n)", () => {
    // A cookies() / headers() call in a layout or in a server component a page imports would make the
    // page dynamic again without touching any page.tsx (Rule D LOW-3). API routes are outside this scan.
    const dirs = ["app/[locale]", "components", "hooks", "lib", "i18n"].map((d) => path.join(SRC, d));
    const all = dirs.flatMap(sources);
    expect(all.length).toBeGreaterThan(100);
    for (const f of all) {
      const src = readFileSync(f, "utf-8");
      expect(src, path.relative(SRC, f)).not.toMatch(/from "next\/headers"|\bcookies\(\)|\bheaders\(\)/);
    }
  });
});
