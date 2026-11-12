#!/bin/zsh
# $1 commit, $2 units (comma), $3 tag, $4 target (workers | prod; 省略時 = prod、S154 H7 から)
# 2026-11-12 D-228: Vercel project を削除 (D-226 の戻し道は無い) → vercel 対象 (commit status 待ち) を削除
# D-213: 本番は prod-smoke.mjs (新単元 × 3 locale の HTML GET のみ)。Playwright 全項目は local :3150 で担保
# 配置の完了待ち (S154 H6):
#   workers / prod  : Cloudflare Workers Builds の check run "Workers Builds: itlearn" が success になるまで。
#                     check run は build の終了時にだけ現れることがある (S154 6701ac43 は started = completed) ので
#                     「無い」= build 中か watch paths で skip (D-212)。20 分待って無ければ exit 1 (docs だけの push には使わない)
#                     D-227 (S154): preview build も同じ名前の check run を付ける。成功した preview は summary の build link が
#                     `/previews/<branch>/builds/` (本番は `/production/builds/` + Version ID) なので除外し、残りの最新 1 本を見る
#                     (deploy 前に失敗した preview は `/production/builds/` で区別できない — S154 a6c6f4aa)。
#                     branch は main へ `git merge --no-ff` で入れ、本番の sha に preview の check run を載せない。
N=<SCRATCH>
T=${4:-prod}
cd /Volumes/DevSSD/Project/IT-Passport-Learning
case $T in
  workers|prod)
    s=absent
    for i in {1..60}; do
      s=$(gh api repos/hakupao/it-passport-learning/commits/$1/check-runs --jq '[.check_runs[] | select(.name == "Workers Builds: itlearn" and ((.output.summary // "") | contains("/previews/") | not))] | if length == 0 then "absent" elif any(.[]; .status != "completed") then "pending" else (sort_by(.started_at) | last | .conclusion) end' 2>/dev/null)
      # gh の失敗 (network・rate limit) は空 → 期限 (20 分) まで待ち続ける (Rule D LOW-4)
      # 4xx (例: 未 push の sha) は --jq があっても error JSON が stdout に出る → 既知の値以外は gh error 扱い (S154 Rule D L-2)
      case "$s" in success|failure|cancelled|timed_out|action_required|neutral|skipped|stale|absent|pending) ;; *) echo "gh error (retry)"; s=absent ;; esac
      [ "$s" != absent ] && [ "$s" != pending ] && break; perl -e 'select(undef,undef,undef,20)'
    done
    echo "cloudflare $s" ;;
  *) echo "unknown target $T"; exit 2 ;;
esac
[ "$s" = success ] || exit 1
node $N/prod-smoke.mjs $2 --target $T > $N/$3-prod-e2e.log 2>&1; echo "exit $?"
tail -1 $N/$3-prod-e2e.log
