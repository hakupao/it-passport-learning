#!/bin/zsh
# D-201 §2-5 Gates 五項 + IPA 閘 (S141 #30 を再構成)
cd /Volumes/DevSSD/Project/IT-Passport-Learning/apps/web
npx tsc --noEmit >/dev/null 2>&1; echo "tsc $?"
pnpm exec eslint --ignore-pattern 'playwright-report/**' >/dev/null 2>&1; echo "eslint $?"
pnpm exec vitest run 2>&1 | grep -E "Tests +[0-9]"
npm run build >/dev/null 2>&1; echo "build $?"
echo "ipa $(find .next -name '*.nft.json' -exec grep -lE 'data/ip/(exams|sources|syllabus)/' {} + | wc -l) nft $(find .next -name '*.nft.json' | wc -l)"
cd ../..
node --no-warnings scripts/textbook-v2-batch-order.mjs --check | tail -1
node --no-warnings scripts/textbook-unit-minutes-build.mjs --check | tail -1
node --test scripts/*.test.mjs 2>&1 | grep -E "^ℹ (tests|pass|fail)"
