#!/bin/zsh
# $1 commit, $2 units (comma), $3 tag, $4 target (vercel | workers | prod; 省略時 = vercel、H7 で prod に変える)
# D-213: 本番は prod-smoke.mjs (新単元 × 3 locale の HTML GET のみ)。Playwright 全項目は local :3150 で担保
# 配置の完了待ち (S154 H6):
#   vercel          : commit status (combined) が pending でなくなるまで。branch push の "Canceled by Ignored Build Step"
#                     も success になる (= 配置されていない) ので、Vercel 対象は main の push のときだけ使う
#   workers / prod  : Cloudflare Workers Builds の check run "Workers Builds: itlearn" が success になるまで。
#                     check run は build の終了時にだけ現れることがある (S154 6701ac43 は started = completed) ので
#                     「無い」= build 中か watch paths で skip (D-212)。20 分待って無ければ exit 1 (docs だけの push には使わない)
N=<SCRATCH>
T=${4:-vercel}
cd /Volumes/DevSSD/Project/IT-Passport-Learning
case $T in
  vercel)
    for i in {1..60}; do s=$(gh api repos/hakupao/it-passport-learning/commits/$1/status --jq .state); [ "$s" != pending ] && break; perl -e 'select(undef,undef,undef,20)'; done
    echo "vercel $s" ;;
  workers|prod)
    s=absent
    for i in {1..60}; do
      s=$(gh api repos/hakupao/it-passport-learning/commits/$1/check-runs --jq '[.check_runs[] | select(.name == "Workers Builds: itlearn")][0] | if . == null then "absent" elif .status != "completed" then "pending" else .conclusion end' 2>/dev/null)
      # gh の失敗 (network・rate limit) は空 → 期限 (20 分) まで待ち続ける (Rule D LOW-4)
      [ -z "$s" ] && { echo "gh error (retry)"; s=absent; }
      [ "$s" != absent ] && [ "$s" != pending ] && break; perl -e 'select(undef,undef,undef,20)'
    done
    echo "cloudflare $s" ;;
  *) echo "unknown target $T"; exit 2 ;;
esac
[ "$s" = success ] || exit 1
node $N/prod-smoke.mjs $2 --target $T > $N/$3-prod-e2e.log 2>&1; echo "exit $?"
tail -1 $N/$3-prod-e2e.log
