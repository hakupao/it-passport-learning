// D-217 H3 — OWNER_LEGACY_REDIRECT_SCRIPT (the inline <head> script for the old `?owner_key=` link),
// run against a fake window: a page with the param stops loading and is replaced by
// /api/owner?key=…&next=<the same page without the param>; any other page is left alone.

import { describe, expect, it } from "vitest";

import { DEFAULT_NEXT, safeNextPath } from "@/lib/ownerActivation";
import { OWNER_LEGACY_REDIRECT_SCRIPT } from "@/lib/ownerLegacy";

function run(href: string): { replaced: string[]; stopped: number } {
  const replaced: string[] = [];
  const win = { stop: () => void win.stopped++, stopped: 0 };
  const location = { href, replace: (u: string) => void replaced.push(u) };
  new Function("window", "location", OWNER_LEGACY_REDIRECT_SCRIPT)(win, location);
  return { replaced, stopped: win.stopped };
}

describe("OWNER_LEGACY_REDIRECT_SCRIPT", () => {
  it("forwards the key and the page (query without owner_key, hash) to /api/owner, after window.stop()", () => {
    const { replaced, stopped } = run("https://itlearn.example/ja/glossary?a=1&owner_key=k%20%26x#t");
    expect(stopped).toBe(1);
    expect(replaced).toHaveLength(1);
    const u = new URL(replaced[0]!, "https://itlearn.example");
    expect(u.pathname).toBe("/api/owner");
    expect(u.searchParams.get("key")).toBe("k &x");
    expect(u.searchParams.get("next")).toBe("/ja/glossary?a=1#t");
    // what the Worker then accepts as `next`
    expect(safeNextPath(u.searchParams.get("next"), u.origin)).toBe("/ja/glossary?a=1#t");
  });

  it("owner_key=logout and an empty key are forwarded too (the Worker decides)", () => {
    expect(run("https://h.example/zh?owner_key=logout").replaced[0]).toBe("/api/owner?key=logout&next=%2Fzh");
    expect(run("https://h.example/en/quiz?owner_key=").replaced[0]).toBe("/api/owner?key=&next=%2Fen%2Fquiz");
  });

  it("a page without owner_key: no stop, no navigation", () => {
    for (const href of ["https://h.example/ja", "https://h.example/ja/practice?ids=x&owner=1", "https://h.example/ja#owner_key=1"]) {
      expect(run(href), href).toEqual({ replaced: [], stopped: 0 });
    }
  });

  it("safeNextPath default is /ja", () => {
    expect(DEFAULT_NEXT).toBe("/ja");
  });
});
