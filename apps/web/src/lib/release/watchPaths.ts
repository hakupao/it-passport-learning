// D-212 on Cloudflare (S154 H6): does a change set need a production build?
// Mirrors the Workers Builds "build watch paths" typed into the dashboard (docs/phase5/DEPLOY_cloudflare.md
// §2-3): include `*`, exclude the rules below. Cloudflare's matching (developers.cloudflare.com
// workers/ci-cd/builds/build-watch-paths): excludes are removed first, a build runs iff any remaining path
// matches an include; `*` matches zero or more characters and may stand alone or at the start / end of a
// rule; a rule without `*` is an exact path. Paths are repo-relative (as `git diff --name-only` prints).
// Change this list and the dashboard together.
export const EXCLUDE_PATHS = [
  "docs/*",
  "evidence/*",
  "failures/*",
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  "README.zh-CN.md",
  "RETROSPECTIVE*",
] as const;
export const INCLUDE_PATHS = ["*"] as const;

export function matchesRule(rule: string, file: string): boolean {
  if (rule === "*") return true;
  const head = rule.startsWith("*");
  const tail = rule.endsWith("*");
  const core = rule.slice(head ? 1 : 0, tail ? -1 : undefined);
  if (head && tail) return file.includes(core);
  if (tail) return file.startsWith(core);
  if (head) return file.endsWith(core);
  return file === core;
}

/**
 * True when a push with these changed files triggers a build. Like Cloudflare, a push with 0 changed
 * files, 3,000+ changed files or 20+ commits always builds (watch paths are ignored).
 */
export function needsBuild(files: readonly string[], commits = 1): boolean {
  const changed = files.filter((f) => f !== "");
  if (changed.length === 0 || changed.length >= 3000 || commits >= 20) return true;
  return changed
    .filter((f) => !EXCLUDE_PATHS.some((r) => matchesRule(r, f)))
    .some((f) => INCLUDE_PATHS.some((r) => matchesRule(r, f)));
}
