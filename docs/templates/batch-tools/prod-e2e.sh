#!/bin/zsh
# $1 commit, $2 units (comma), $3 tag
# D-213: 本番は prod-smoke.mjs (新単元 × 3 locale の HTML GET のみ)。Playwright 全項目は local :3150 で担保
N=<SCRATCH>
cd /Volumes/DevSSD/Project/IT-Passport-Learning
for i in {1..60}; do s=$(gh api repos/hakupao/it-passport-learning/commits/$1/status --jq .state); [ "$s" != pending ] && break; perl -e 'select(undef,undef,undef,20)'; done
echo "vercel $s"
[ "$s" = success ] || exit 1
node $N/prod-smoke.mjs $2 > $N/$3-prod-e2e.log 2>&1; echo "exit $?"
tail -1 $N/$3-prod-e2e.log
