#!/bin/sh
# Vercel "Ignored Build Step" (vercel.json ignoreCommand). exit 0 = skip build, exit 1 = build.
# Skips (1) any branch other than main, (2) on main, only when every file changed since the last deployed commit is under
# docs/, evidence/, failures/ or a repo-root *.md (D-212). Any doubt => build.
# D-217 H0-2: only main deploys on Vercel. Other branches (the Cloudflare migration
# branch hosting-cf) would each build a preview that spends quota and adds a crawlable host.
ref="${VERCEL_GIT_COMMIT_REF:-}"
if [ -n "$ref" ] && [ "$ref" != "main" ]; then
  echo "branch $ref is not main -> skip build"; exit 0
fi
base="${VERCEL_GIT_PREVIOUS_SHA:-}"
target="${VERCEL_IGNORE_TARGET:-HEAD}"
[ -n "$base" ] || { echo "no previous sha -> build"; exit 1; }
git cat-file -e "$base^{commit}" 2>/dev/null || { echo "previous sha not in clone -> build"; exit 1; }
files=$(git diff --name-only "$base" "$target") || { echo "git diff failed -> build"; exit 1; }
[ -n "$files" ] || { echo "no changed files -> build"; exit 1; }
if printf '%s\n' "$files" | grep -qvE '^(docs/|evidence/|failures/|[^/]+\.md$)'; then
  echo "app-relevant change -> build"; exit 1
fi
echo "docs/evidence-only change -> skip build"; exit 0
