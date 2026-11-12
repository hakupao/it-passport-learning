// D-217 H1-6 / D-225 — the out/ scan CLI (scripts/scan-out.ts) run for real against a temp tree:
// without --no-ipa-sources it fails closed when the IPA sources are missing; with the flag only rule (c)
// is skipped (loudly), and a planted (a) / (b) / (e) violation still fails.
// The script is copied to <tmp>/apps/web/scripts/ (src + messages symlinked) so its repo root is <tmp>,
// which has no data/ip — the local IPA sources of this checkout are never read.
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { headersFile } from "@/lib/export/headers";

const WEB = path.join(__dirname, "../..");

let tmp = "";
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = "";
});

/** <tmp>/apps/web with the script, a clean out/ (2 files) and no data/ip. */
function sandbox(): { web: string; out: string } {
  tmp = mkdtempSync(path.join(os.tmpdir(), "scan-out-cli-"));
  const web = path.join(tmp, "apps/web");
  mkdirSync(path.join(web, "scripts"), { recursive: true });
  copyFileSync(path.join(WEB, "scripts/scan-out.ts"), path.join(web, "scripts/scan-out.ts"));
  symlinkSync(path.join(WEB, "src"), path.join(web, "src"));
  symlinkSync(path.join(WEB, "messages"), path.join(web, "messages"));
  const out = path.join(web, "out");
  mkdirSync(out);
  writeFileSync(path.join(out, "_headers"), headersFile({ analytics: false }));
  writeFileSync(path.join(out, "ja.html"), '<!doctype html><html lang="ja"><body>ok</body></html>\n');
  return { web, out };
}

function scan(web: string, ...args: string[]) {
  const r = spawnSync(process.execPath, ["--no-warnings", "scripts/scan-out.ts", "out", ...args], {
    cwd: web,
    encoding: "utf-8",
  });
  let report: { pass: boolean; findings: Record<string, number | string> } | undefined;
  try {
    report = JSON.parse(r.stdout);
  } catch {
    report = undefined;
  }
  return { status: r.status, stderr: r.stderr, report };
}

describe("scan-out.ts without --no-ipa-sources (fail closed)", () => {
  it("exits 2 when the IPA source dirs are missing", () => {
    const { web } = sandbox();
    const r = scan(web);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/IPA source dir missing: .*data\/ip\/exams — rule \(c\) cannot run, refusing to pass/);
  });

  it("exits 2 when the source dirs exist but hold no files", () => {
    const { web } = sandbox();
    for (const d of ["exams", "sources", "syllabus"]) mkdirSync(path.join(tmp, "data/ip", d), { recursive: true });
    const r = scan(web);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/no IPA source files \(json 0, pdf 0\) — refusing to pass/);
  });
});

describe("scan-out.ts --no-ipa-sources (CI, D-225)", () => {
  it("passes a clean out/ with rule (c) reported as skipped, loudly", () => {
    const { web } = sandbox();
    const r = scan(web, "--no-ipa-sources");
    expect(r.status).toBe(0);
    expect(r.stderr).toContain("RULE (c) SKIPPED (--no-ipa-sources)");
    expect(r.stderr).toContain("pnpm check:release");
    expect(r.report?.pass).toBe(true);
    expect(r.report?.findings).toEqual({ a: 0, b: 0, c: "skipped", d: 0, e: 0 });
  });

  it("still fails on an unexpected path (a)", () => {
    const { web, out } = sandbox();
    mkdirSync(path.join(out, "data/ip/exams"), { recursive: true });
    writeFileSync(path.join(out, "data/ip/exams/x.json"), "{}");
    const r = scan(web, "--no-ipa-sources");
    expect(r.status).toBe(1);
    expect(r.report?.findings.a).toBeGreaterThan(0);
    expect(r.report?.findings.c).toBe("skipped");
  });

  it("still fails on a forbidden key (b)", () => {
    const { web, out } = sandbox();
    mkdirSync(path.join(out, "data/quiz"), { recursive: true });
    writeFileSync(path.join(out, "data/quiz/index.json"), JSON.stringify({ source_note: "x" }));
    const r = scan(web, "--no-ipa-sources");
    expect(r.status).toBe(1);
    expect(r.report?.findings.b).toBeGreaterThan(0);
  });

  it("still fails on a beacon the CSP does not allow (e)", () => {
    const { web, out } = sandbox();
    writeFileSync(
      path.join(out, "ja.html"),
      '<html><script defer src="https://static.cloudflareinsights.com/beacon.min.js"></script></html>',
    );
    const r = scan(web, "--no-ipa-sources");
    expect(r.status).toBe(1);
    expect(r.report?.findings.e).toBe(1);
  });
});
