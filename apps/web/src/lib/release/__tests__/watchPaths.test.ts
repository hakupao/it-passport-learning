// S154 H6 — the D-212 rule as Cloudflare build watch paths (lib/release/watchPaths).
import { execFileSync } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { EXCLUDE_PATHS, matchesRule, needsBuild } from "../watchPaths";

describe("matchesRule", () => {
  it("follows Cloudflare's wildcard rules", () => {
    expect(matchesRule("*", "anything/at/all")).toBe(true);
    expect(matchesRule("docs/*", "docs/phase5/PLAN.md")).toBe(true); // deep paths too
    expect(matchesRule("docs/*", "apps/web/docs/x.md")).toBe(false);
    expect(matchesRule("RETROSPECTIVE*", "RETROSPECTIVE_hosting.md")).toBe(true);
    expect(matchesRule("*.md", "apps/web/README.md")).toBe(true);
    expect(matchesRule("README.md", "README.md")).toBe(true);
    expect(matchesRule("README.md", "apps/web/README.md")).toBe(false);
  });
});

describe("needsBuild (D-212 on Workers Builds)", () => {
  it("skips docs / evidence / failures / root docs only", () => {
    expect(needsBuild(["docs/STATE.md", "evidence/phase5/hosting/_progress.json", "failures/x.md"])).toBe(false);
    expect(needsBuild(["CLAUDE.md", "AGENTS.md", "README.zh-CN.md", "RETROSPECTIVE_hosting.md"])).toBe(false);
  });

  it("builds when any app, data or script path is in the set", () => {
    expect(needsBuild(["docs/STATE.md", "apps/web/src/app/layout.tsx"])).toBe(true);
    expect(needsBuild(["data/ip/textbook/units/strategy-01-01-u01.json"])).toBe(true);
    expect(needsBuild(["scripts/lang-leak-scan.ts"])).toBe(true);
    expect(needsBuild(["pnpm-lock.yaml"])).toBe(true);
    expect(needsBuild(["apps/web/README.md"])).toBe(true); // not a root .md (Vercel's D-212 rule is root only)
  });

  it("always builds for 0 files, 3,000+ files or 20+ commits, like Cloudflare", () => {
    expect(needsBuild([])).toBe(true);
    expect(needsBuild([""])).toBe(true);
    expect(needsBuild(Array.from({ length: 3000 }, (_, i) => `docs/${i}.md`))).toBe(true);
    expect(needsBuild(["docs/STATE.md"], 20)).toBe(true);
    expect(needsBuild(["docs/STATE.md"], 19)).toBe(false);
  });

  it("covers every tracked root *.md (a new root .md must be added here and in the dashboard)", () => {
    const repo = path.join(__dirname, "../../../../../..");
    const rootMd = execFileSync("git", ["-C", repo, "ls-files", ":(glob)*.md"], { encoding: "utf-8" })
      .split("\n")
      .filter(Boolean);
    expect(rootMd.length).toBeGreaterThan(0);
    for (const f of rootMd) expect(EXCLUDE_PATHS.some((r) => matchesRule(r, f)), f).toBe(true);
  });

  it("agrees with Vercel's D-212 script on the pattern classes it shares", () => {
    // vercel-ignore-build.sh: skip iff every path matches ^(docs/|evidence/|failures/|[^/]+\.md$)
    const vercel = (fs: string[]) => !fs.every((f) => /^(docs\/|evidence\/|failures\/|[^/]+\.md$)/.test(f));
    for (const set of [["docs/a.md"], ["evidence/x.json", "README.md"], ["apps/web/x.ts"], ["data/ip/a.json"]]) {
      expect(needsBuild(set), set.join(",")).toBe(vercel(set));
    }
  });
});
