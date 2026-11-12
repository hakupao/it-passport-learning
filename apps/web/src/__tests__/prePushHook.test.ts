// S154 H6 (D-225 Rule D LOW-1) — .githooks/pre-push run for real in a temp git repo. The hook and
// scripts/needs-build.ts (+ lib/release/watchPaths.ts) are copied in; check:release is stubbed through
// ITP_CHECK_RELEASE_CMD, so the real 88 s build never runs here.
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const WEB = path.join(__dirname, "../..");
const REPO = path.join(WEB, "../..");
const Z = "0".repeat(40);

let tmp = "";
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = "";
});

function git(...a: string[]): string {
  return execFileSync("git", ["-C", tmp, ...a], { encoding: "utf-8" }).trim();
}
function commit(file: string, body = String(Math.random())): string {
  mkdirSync(path.dirname(path.join(tmp, file)), { recursive: true });
  writeFileSync(path.join(tmp, file), body);
  git("add", "-A");
  git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", file);
  return git("rev-parse", "HEAD");
}

/** Temp repo with the hook and the watch-path CLI; returns the base commit. */
function sandbox(): string {
  tmp = mkdtempSync(path.join(os.tmpdir(), "pre-push-"));
  git("init", "-q");
  for (const f of [".githooks/pre-push", "apps/web/scripts/needs-build.ts", "apps/web/src/lib/release/watchPaths.ts"]) {
    mkdirSync(path.dirname(path.join(tmp, f)), { recursive: true });
    copyFileSync(path.join(REPO, f), path.join(tmp, f));
  }
  return commit("README.md", "base");
}

function hook(lines: string[], check = "echo CHECK_RAN") {
  const r = spawnSync("sh", [path.join(tmp, ".githooks/pre-push"), "origin", "git@example.invalid:x.git"], {
    cwd: tmp,
    input: lines.map((l) => l + "\n").join(""),
    encoding: "utf-8",
    env: { PATH: process.env.PATH ?? "", HOME: tmp, ITP_PROD_BRANCH: "prod", ITP_CHECK_RELEASE_CMD: check } as unknown as NodeJS.ProcessEnv,
  });
  return { code: r.status, out: r.stdout + r.stderr };
}
const line = (sha: string, remote: string, branch = "prod") => `refs/heads/x ${sha} refs/heads/${branch} ${remote}`;

describe(".githooks/pre-push", () => {
  it("ignores pushes to other branches", () => {
    const base = sandbox();
    const head = commit("apps/web/src/a.ts");
    const r = hook([line(head, base, "feature")]);
    expect(r.out).not.toContain("CHECK_RAN");
    expect(r.code).toBe(0);
  });

  it("lets a docs-only push through without check:release", () => {
    const base = sandbox();
    commit("docs/STATE.md");
    const head = commit("evidence/phase5/x.json");
    const r = hook([line(head, base)]);
    expect(r.out).toContain("docs-only");
    expect(r.out).not.toContain("CHECK_RAN");
    expect(r.code).toBe(0);
  });

  it("runs check:release for an app-relevant push of HEAD on a clean tree", () => {
    const base = sandbox();
    const head = commit("data/ip/textbook/units/u.json");
    const r = hook([line(head, base)]);
    expect(r.out).toContain("CHECK_RAN");
    expect(r.code).toBe(0);
  });

  it("refuses the push when check:release fails", () => {
    const base = sandbox();
    const head = commit("apps/web/src/a.ts");
    const r = hook([line(head, base)], "echo CHECK_RAN; exit 3");
    expect(r.out).toContain("CHECK_RAN");
    expect(r.out).toContain("push refused");
    expect(r.code).toBe(1);
  });

  it("refuses without running the check when the pushed commit is not HEAD", () => {
    const base = sandbox();
    const pushed = commit("apps/web/src/a.ts");
    commit("apps/web/src/b.ts");
    const r = hook([line(pushed, base)]);
    expect(r.out).toContain("HEAD is");
    expect(r.out).not.toContain("CHECK_RAN");
    expect(r.code).toBe(1);
  });

  it("refuses without running the check on a dirty tree (tracked or untracked)", () => {
    const base = sandbox();
    const head = commit("apps/web/src/a.ts");
    writeFileSync(path.join(tmp, "apps/web/src/new.ts"), "x");
    const r = hook([line(head, base)]);
    expect(r.out).toContain("uncommitted or untracked");
    expect(r.out).not.toContain("CHECK_RAN");
    expect(r.code).toBe(1);
  });

  it("checks a new remote branch (zero sha) and an unknown remote sha, skips a deletion", () => {
    sandbox();
    const head = commit("docs/only.md");
    expect(hook([line(head, Z)]).out).toContain("CHECK_RAN");
    expect(hook([line(head, "1".repeat(40))]).out).toContain("CHECK_RAN");
    const del = hook([`(delete) ${Z} refs/heads/prod ${head}`]);
    expect(del.out).not.toContain("CHECK_RAN");
    expect(del.code).toBe(0);
  });

  it("is committed executable", () => {
    const mode = execFileSync("git", ["-C", REPO, "ls-files", "-s", ".githooks/pre-push"], { encoding: "utf-8" });
    // Before the first commit the index may not have it yet; once tracked it must be 100755.
    if (mode) expect(mode.split(" ")[0]).toBe("100755");
  });
});
