// D-217 H1-3 — no file under /[locale] reads the URL query on the server or redirects on it: the
// query is read in the browser (PracticeRoute / MockRoute / RecordFromUrl / ReviewLauncher, with
// useSearchParams under Suspense), so every page depends on its path params only and can be
// prerendered (H1-4). notFound() for an invalid locale / path id stays allowed. Comments are
// stripped first (the headers explain what moved where).
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const LOCALE_DIR = path.resolve(__dirname, "..");

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "__tests__" ? [] : sources(p);
    return /\.tsx?$/.test(e.name) ? [p] : [];
  });
}

/** The source without // line comments and block comments (strings in these files hold neither). */
function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

describe("/[locale] reads no query on the server", () => {
  const files = sources(LOCALE_DIR);

  it("finds the route files", () => {
    expect(files.length).toBeGreaterThanOrEqual(15);
  });

  it("no searchParams, no redirect / permanentRedirect import or call", () => {
    for (const f of files) {
      const src = code(readFileSync(f, "utf-8"));
      const rel = path.relative(LOCALE_DIR, f);
      expect(src, rel).not.toMatch(/searchParams/i);
      expect(src, rel).not.toMatch(/\b(redirect|permanentRedirect)\b/);
    }
  });

  it("the comment stripper keeps code (sanity)", () => {
    expect(code('const a = "x"; // searchParams\n/* redirect */ b()')).toBe('const a = "x"; \n b()');
  });
});
