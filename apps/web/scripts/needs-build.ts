// S154 H6 — would Workers Builds build a push of <from>..<to>? (D-212 rule, lib/release/watchPaths).
// Prints `build` or `skip` and exits 0; exits 2 when git cannot answer (callers treat that as build).
// Used by .githooks/pre-push.
//   node scripts/needs-build.ts <from-sha> <to-sha>
import { execFileSync } from "node:child_process";

import { needsBuild } from "../src/lib/release/watchPaths.ts";

const [from, to] = process.argv.slice(2);
if (!from || !to) {
  console.error("usage: node scripts/needs-build.ts <from-sha> <to-sha>");
  process.exit(2);
}
try {
  const git = (...a: string[]) => execFileSync("git", a, { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
  const files = git("diff", "--name-only", `${from}..${to}`).split("\n");
  const commits = Number(git("rev-list", "--count", `${from}..${to}`).trim());
  console.log(needsBuild(files, commits) ? "build" : "skip");
} catch {
  console.error(`needs-build: git could not diff ${from}..${to}`);
  process.exit(2);
}
