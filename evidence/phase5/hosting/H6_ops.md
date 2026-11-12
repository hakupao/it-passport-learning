# H6 — 運用の付け替え (writer = executor opus、2026-11-12、Rule D 待ち)

手順の正本は `docs/phase5/DEPLOY_cloudflare.md` (§2-3・§5・§6-8・§9・§10)。本書は検証の記録だけ。

| # | 項目 | もの | 検証 |
|---|---|---|---|
| 1 | smoke の対象ホスト + canonical (H5 LOW-2) | `docs/templates/batch-tools/prod-smoke.mjs` (`--target vercel\|workers\|prod\|<origin>`・env `SMOKE_TARGET`、既定 vercel → H7 で prod)。静的版の canonical は末尾 / なし (`out/ja/textbook/management-08-25-u01.html` で確認) | `prodSmoke.test.ts` 7 (既定 = Vercel で canonical を見ない、127.0.0.1 の fixture、良 3/3・末尾 / ・別ホスト・欠落・status・title・生記法・不明 target)。preview に 1 回だけ (D-213): `H6_smoke_workers.log` **30/30** (10 単元 × 3、canonical 検査あり) |
| 2 | D-212 の Cloudflare 版 | dashboard の watch paths (変更なし) と同じ規則を `apps/web/src/lib/release/watchPaths.ts` に | `watchPaths.test.ts` 6 (Cloudflare の wildcard 規則、0 / 3,000 / 20 commit の例外、tracked の root `*.md` 全部が除外、Vercel 規則との一致)。実地: `bc24d650` (docs + evidence のみ) = Cloudflare suite あり・check run 0 / `6701ac43` = `Workers Builds: itlearn` success。`c4fb70fa` は連携前 (suite は queued・0 だが証拠にしない)。**パスの基準 (repo root / root directory) は未確定** — `apps/web` の外だけを変える最初の push で確定 (DEPLOY §9-2) |
| 3 | D-206 の流れ | `prod-e2e.sh` 第 4 引数 (`vercel` 既定 / `workers` / `prod`)、Cloudflare は check run を待つ。H7 で切り替える項目を DEPLOY §6-8 に (smoke 既定・hook branch・gates.sh の nft 閘・local-e2e.sh の next start・playwright 既定 = Vercel 本番) | jq の判定式を `6701ac43` (→ success) と `bc24d650` (→ absent) で実行。zsh -n で構文 |
| 4 | 監視 (D-224) | `apps/web/scripts/cf-monitor.ts` + `lib/release/monitor.ts` (200 KB・errors・p50 ≥ 10 ms → ASK USER) | `monitor.test.ts` 5。実行 1 回 (読み取りのみ、Upstash は READ_ONLY token、CF token は stdin): 記録 445 B / v1 0 B、11-12 errors 0・p50 2.3〜3.1 ms・max 7.8〜26.2 ms → OK。誤 token → `HTTP 400` だけを表示 (exit 2) |
| 5 | LOW-1 pre-push hook | `.githooks/pre-push` (opt-in: `git config core.hooksPath .githooks`、未設定のまま) + `apps/web/scripts/needs-build.ts` | `prePushHook.test.ts` 8 (一時 repo: 他 branch・docs のみ → 素通り、app 変更 → check 実行 / 失敗で拒否、HEAD 不一致・dirty → check 前に拒否、新 branch・未知 sha → check、削除 → 素通り、mode 100755))。**実 path も 1 回** (install・push なし、`printf '<HEAD> … <origin/hosting-cf>' \| sh .githooks/pre-push`): 本 commit (apps/web を含む) → 本物の `pnpm -C apps/web check:release` が走り exit 0 (三言語関門 PASS・v2-corpus 5・走査 pass・規則 (c) 0)、83 s、作業木は clean のまま |

Gates (apps/web): `tsc --noEmit` 0、`pnpm lint` 0、`vitest run` 137 files / 1,522 tests 全通過 (修正 commit 後)。wrangler dev / deploy・dashboard の変更・push はしていない。:3000 不使用。
