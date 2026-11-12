#!/bin/zsh
# D-201 §2-5 Gates 五項 + IPA 閘 (S141 #30 を再構成)。S154 H7 から build + IPA 閘 = `pnpm check:release`
# (三言語関門 + v2-corpus + export build + out/ 走査 (規則 (c) = IPA 原本の混入を含む)、DEPLOY_cloudflare.md §5)。log = $S/check-release.log
S=<SCRATCH>
cd /Volumes/DevSSD/Project/IT-Passport-Learning/apps/web
npx tsc --noEmit >/dev/null 2>&1; echo "tsc $?"
pnpm exec eslint --ignore-pattern 'playwright-report/**' >/dev/null 2>&1; echo "eslint $?"
pnpm exec vitest run 2>&1 | grep -E "Tests +[0-9]"
pnpm check:release > $S/check-release.log 2>&1; echo "check:release $?"
cd ../..
node --no-warnings scripts/textbook-v2-batch-order.mjs --check | tail -1
node --no-warnings scripts/textbook-unit-minutes-build.mjs --check | tail -1
node --test scripts/*.test.mjs 2>&1 | grep -E "^ℹ (tests|pass|fail)"
