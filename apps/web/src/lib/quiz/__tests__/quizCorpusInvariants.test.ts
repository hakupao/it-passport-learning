// S117 (backlog ⑥): the committed quiz corpus must satisfy the deterministic invariants in
// scripts/quiz-keys-crosscheck.mjs (questions ↔ explanations ↔ translations ↔ quiz_index, plus
// the D-142 banned zh terms). Layer B (raw answer_keys / question_bank / by_year) is gitignored,
// so this test runs the committed-only layer; the full check is the local gate
// `node scripts/quiz-keys-crosscheck.mjs`.
import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "../../../../../..");
const SCRIPT = path.join(REPO_ROOT, "scripts/quiz-keys-crosscheck.mjs");

describe("quiz corpus invariants (scripts/quiz-keys-crosscheck.mjs)", () => {
  it("committed data passes layer A (A1–A6)", () => {
    const r = spawnSync(process.execPath, [SCRIPT, "--committed-only"], { encoding: "utf-8" });
    // stderr は node の ExperimentalWarning 等で非空になり得るので、判定は exit code と stdout で行う
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(r.stderr).not.toMatch(/problem\(s\)/);
    expect(r.stdout).toMatch(/all invariants hold \(A1–A6\)/);
  });
});
