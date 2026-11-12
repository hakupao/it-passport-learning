# H6 Rule D 審査 (code-reviewer opus、writer = executor opus、2026-11-12)

**判定 PASS (HIGH 0 / MEDIUM 0 / LOW 7 + minor 1、OQ 2)。** 対象 = `f25a1943`・`d7843d5e` (H6_ops.md の表と DEPLOY_cloudflare.md §2-3・§5・§6-8・§9・§10)。LOW はすべて修正 (commit `chore(web): s154 H6 — Rule D LOW 修正`)。

| # | 指摘 | 処置 |
|---|---|---|
| LOW-1 | `needs-build.ts` の `git diff --name-only` は rename をまとめるため、`apps/web/src/keep.ts → docs/keep.ts` が新パスだけ (= docs のみ = skip) に見える | `git diff --no-renames --name-only` に。`prePushHook.test.ts` に移動のテスト (CLI = `build`、hook が check を実行)。修正前の needs-build.ts でこのテストが落ちることを確認 (stash で戻して 1 failed) |
| LOW-2 | `prod-smoke.mjs` の引数: `--target=x` 不可、未知の `--` flag を単元名として扱う | `node:util` `parseArgs` (strict、positional 1 個だけ)。`--target x` / `--target=x`、units の前後どちらでも。未知 flag・余分な positional・`constructor` 等の prototype 名は exit 2。テスト 2 本 |
| LOW-3 | fetch が転送を追うため、30x の先が良い頁なら PASS になる | `redirect: 'manual'`、30x は `status 30x` で失敗。テスト (ja だけ 307 → 2/3、exit 1)。注: Vercel の本番でも単元頁は 200 の直接応答の想定 (S153・S154 の smoke は転送を追う版で PASS)。もし Vercel で 30x が出れば smoke が目に見えて落ちる (黙って通らない) |
| LOW-4 | `prod-e2e.sh` で `gh api` が失敗すると空文字 → absent でも pending でもなく即 break | 空なら `gh error (retry)` を出し absent として 20 分の期限まで待ち続ける (stderr は捨てる) |
| LOW-5 | `cf-monitor.ts`: 非 JSON の応答で例外の本文が出うる、GraphQL の `message` は入力を反映しうる | `r.json()` を catch して固定文言、GraphQL error は件数と `extensions.code` だけ |
| LOW-6 | DEPLOY §6-8 の H7 切替一覧の漏れ | 追加: `prodSmoke.test.ts` の既定 target テスト、batch-tools `README.md` 20 行目。新 §6-9「Vercel を止めた後の片付け」: `apps/web/vercel.json`・`vercel-ignore-build.sh` + `vercelIgnoreBuild.test.ts`、`scripts/quiz-feedback.mjs` 16・61 行の `vercel env pull` 注記、root `README.md` 9・85・133 行、`prod-smoke.mjs` の Vercel 例外 |
| LOW-7 | `gates.sh` の IPA 閘は hosting-cf ではすでに空振り (`ipa 0 nft 0`) | DEPLOY §6-8 に明記: H7 まで hosting-cf 上では `pnpm check:release` を IPA 閘とする |
| minor | `prePushHook.test.ts` の `if (mode)` で mode 検査が空振りしうる | 条件を外し常に 100755 を断言 |

| OQ | 内容 | 処置 |
|---|---|---|
| OQ-1 | preview builds を有効にすると preview も同じ名前 `Workers Builds: itlearn` の check run を付けるかもしれない (prod-e2e は名前だけで判定) | DEPLOY §6 の事前確認に追加: 有効化するなら最初の preview の check run の summary (`/production/builds/` か) で区別を確かめ、必要なら prod-e2e に検査を足す。OFF のままなら影響なし |
| OQ-2 | Upstash は Vercel Marketplace の統合か (Vercel project 削除で DB が消えるか) | repo の記録で確認: S126 session log (2026-10-19) — DB は Vercel Marketplace の統合 `upstash-kv-orange-fence` として作成・project `web` に接続、前の統合 `upstash-kv-gray-ridge` は Uninstalled 時に接続先 DB が消えていた。→ **消える可能性あり**。DEPLOY §6 の事前確認に: Vercel を止める前に DB の所有を確認、Vercel 管理なら移管を確かめるか project を削除せず停止に留める。D-100 は repo 内に該当 ADR が見つからず (decisions/ は D-108 以降、docs/archive は無い)、S126 と D-149 (「既存 Upstash Redis (Vercel KV)」) を根拠にした。外部には問い合わせていない |

Gates (修正後、apps/web): `tsc --noEmit` 0、`pnpm lint` 0、`vitest run` 137 files / 1,526 tests 全通過。live の呼出・push・wrangler なし。
