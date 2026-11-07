#!/bin/sh
# Vercel "Ignored Build Step" (vercel.json ignoreCommand). exit 0 = skip build, exit 1 = build.
# Skips only when every file changed since the last deployed commit is under
# docs/, evidence/, failures/ or a repo-root *.md (D-212). Any doubt => build.
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
