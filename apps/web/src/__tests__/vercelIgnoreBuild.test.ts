// D-212 / D-217 H0-2 — the Vercel "Ignored Build Step" script. exit 0 = skip, exit 1 = build.
// Runs the real script with a stubbed environment against this repo's history.
import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "vitest";

const SCRIPT = path.join(__dirname, "../../scripts/vercel-ignore-build.sh");

function run(env: Record<string, string>): number {
  // Only PATH plus the stubbed variables: no inherited VERCEL_* from the shell.
  const childEnv: Record<string, string> = { PATH: process.env.PATH ?? "", ...env };
  const r = spawnSync("sh", [SCRIPT], { env: childEnv as unknown as NodeJS.ProcessEnv, encoding: "utf-8" });
  return r.status ?? -1;
}

const REPO = path.join(__dirname, "../../../..");
const git = (...args: string[]): string => execFileSync("git", ["-C", REPO, ...args], { encoding: "utf-8" }).trim();

// A commit that changed app code, and its parent: diff between them is app-relevant.
const appCommit = git("log", "-1", "--format=%H", "--", "apps/web/src/middleware.ts");
const appParent = git("rev-parse", `${appCommit}^`);

describe("vercel-ignore-build.sh", () => {
  it("skips every branch other than main, even with app changes (H0-2)", () => {
    expect(
      run({ VERCEL_GIT_COMMIT_REF: "hosting-cf", VERCEL_GIT_PREVIOUS_SHA: appParent, VERCEL_IGNORE_TARGET: appCommit }),
    ).toBe(0);
  });

  it("builds main when app code changed", () => {
    expect(
      run({ VERCEL_GIT_COMMIT_REF: "main", VERCEL_GIT_PREVIOUS_SHA: appParent, VERCEL_IGNORE_TARGET: appCommit }),
    ).toBe(1);
  });

  it("builds main when there is no previous deployment sha", () => {
    expect(run({ VERCEL_GIT_COMMIT_REF: "main" })).toBe(1);
  });

  it("builds when the branch is unknown (local run, no Vercel env)", () => {
    expect(run({ VERCEL_GIT_PREVIOUS_SHA: appParent, VERCEL_IGNORE_TARGET: appCommit })).toBe(1);
  });
});
