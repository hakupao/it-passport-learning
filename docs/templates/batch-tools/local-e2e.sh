#!/bin/zsh
# 本地 gates + :3150 起動 + 截図 + e2e (pilot 3 + 本批)。$1 = 本批 unit ids (comma)、$2 = tag、$3 = shots 用 topic、$4 = shots 用 u リスト
S=<SCRATCH>
$S/gates.sh
cd /Volumes/DevSSD/Project/IT-Passport-Learning/apps/web
nohup pnpm exec next start -p 3150 > $S/next3150.log 2>&1 &
for i in {1..30}; do curl -s -o /dev/null -m 2 http://localhost:3150/ja && break; perl -e 'select(undef,undef,undef,1)'; done
echo "pid $(lsof -nP -iTCP:3150 -sTCP:LISTEN -t)"
mkdir -p $S/shots-$2; node $S/shots-tpl.mjs $S/shots-$2 $3 $4 2>&1 | tail -1
PLAYWRIGHT_BASE_URL=http://localhost:3150 TEXTBOOK_E2E_UNITS=management-10-27-u01,management-10-27-u02,management-10-27-u03,$1 pnpm exec playwright test > $S/$2-e2e.log 2>&1; echo "e2e exit=$?"
grep -E "^ +[0-9]+ (passed|failed|flaky|skipped)" $S/$2-e2e.log
