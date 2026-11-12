#!/bin/zsh
# 本地 gates + 静的配信 :3150 起動 + 截図 + e2e (pilot 3 + 本批)。$1 = 本批 unit ids (comma)、$2 = tag、$3 = shots 用 topic、$4 = shots 用 u リスト
# S154 H7 (DEPLOY_cloudflare.md §6-8): export build に `next start` は無いので、本番と同じ形 (static assets + Worker) を local で組む
# (H5_fidelity.md の手順。`wrangler dev` は使わない):
#   :3150 = scripts/local-cf.ts (out/ を配信、/api/* を :3152 へ)、:3152 = worker/index.ts の esbuild bundle を Node で
#   (evidence/phase5/hosting/H5_tools/worker-node.mjs、env は fake: OWNER_KEY=local-owner-key)、:3161 = scripts/fake-upstash.ts。
# :3000 は使わない。3 つとも PID で停止 (trap、終了時・中断時とも)。
S=<SCRATCH>
R=/Volumes/DevSSD/Project/IT-Passport-Learning
for p in 3150 3152 3161; do
  lsof -nP -iTCP:$p -sTCP:LISTEN -t >/dev/null && { echo "port $p in use — stop it first"; exit 1; }
done
$S/gates.sh | tee $S/$2-gates.log
grep -q '^check:release 0$' $S/$2-gates.log || { echo "check:release failed — out/ not trusted, no e2e (log $S/check-release.log)"; exit 1; }
cd $R/apps/web
cp $R/evidence/phase5/hosting/H5_tools/worker-node.mjs $S/worker-node.mjs
pnpm exec esbuild worker/index.ts --bundle --format=esm --platform=node --log-level=warning --outfile=$S/worker.mjs || { echo "worker bundle failed"; exit 1; }
PU= PW= PC=
cleanup() {
  for p in $PC $PW $PU; do kill $p 2>/dev/null; done
  for p in 3150 3152 3161; do lsof -nP -iTCP:$p -sTCP:LISTEN -t >/dev/null && echo "port $p still in use"; done
}
trap cleanup EXIT
trap 'exit 130' INT TERM
node --no-warnings scripts/fake-upstash.ts --port 3161 > $S/upstash3161.log 2>&1 & PU=$!
node $S/worker-node.mjs 3152 > $S/worker3152.log 2>&1 & PW=$!
node --no-warnings scripts/local-cf.ts --out out --port 3150 --api http://127.0.0.1:3152 > $S/cf3150.log 2>&1 & PC=$!
for p in 3161 3152 3150; do
  for i in {1..30}; do lsof -nP -iTCP:$p -sTCP:LISTEN -t >/dev/null && break; perl -e 'select(undef,undef,undef,0.5)'; done
done
curl -s -o /dev/null -m 5 -w "ja %{http_code}\n" http://127.0.0.1:3150/ja
echo "pid upstash $PU worker $PW local-cf $PC"
mkdir -p $S/shots-$2; node $S/shots-tpl.mjs $S/shots-$2 $3 $4 2>&1 | tail -1
E2E_OWNER_KEY=local-owner-key PLAYWRIGHT_BASE_URL=http://127.0.0.1:3150 TEXTBOOK_E2E_UNITS=management-10-27-u01,management-10-27-u02,management-10-27-u03,$1 pnpm exec playwright test > $S/$2-e2e.log 2>&1; echo "e2e exit=$?"
grep -E "^ +[0-9]+ (passed|failed|flaky|skipped)" $S/$2-e2e.log
