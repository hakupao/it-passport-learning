# H1-5 失敗記録 — local の静的配信を `wrangler dev` で立てられなかった (環境)

- 日時: 2026-11-11 Session 154、branch `hosting-cf` (未 commit)、writer = oh-my-claudecode:executor (opus)
- 入力: `out/` (16,194 ファイル、export + postexport 済み)、scratchpad の assets-only 設定 (`assets.directory = out`、`not_found_handling: "404-page"`、`html_handling: "auto-trailing-slash"`)、wrangler 4.156.0 (homebrew)、Node v26.13.0、macOS。
- 試行と結果:
  1. `npx wrangler dev --port 3150 -c wrangler.jsonc` (stdout/stderr を file へ): `_redirects` 17 規則・`_headers` 3 規則の parse までは成功 (`✨ Parsed 17 valid redirect rules.` / `Parsed 3 valid header rules.`)、その後 `Error: spawn EBADF` (esbuild の service 起動、`ensureServiceIsRunning`) で終了。
  2. 同 + `< /dev/null`: 同じ。
  3. `ESBUILD_WORKER_THREADS=0`: `spawnSync …/@esbuild/darwin-arm64/bin/esbuild EBADF`。
  4. `ulimit -n 10240`: 同じ EBADF + `ERR_IPC_CHANNEL_CLOSED`。
  - 対照: 1 ファイルだけの assets dir では起動した (compat date の上限 2026-10-30 の注意のみ)。esbuild 単体 (`transformSync`) も動く。→ 16k ファイルの assets dir を見張る状態で子 process を spawn すると失敗する、この機械の wrangler 4.156 / Node 26 の問題と判断 (原因の特定はしていない)。
- 技術判定: FAIL (環境)。コード・出力物の不具合ではない (parse された規則数は postexport の出力と一致)。
- 業務判定: e2e の配信を止める理由にはしない。代わりに scratchpad の小さな静的 server (`static-server.mjs`、Node http) で `_redirects` / `_headers` / auto-trailing-slash / 404-page / 既定 Cache-Control + ETag を模して実行。模していない点は `evidence/phase5/hosting/H1-5_export.md` §6。
- 次の attempt への入力: H4 (Cloudflare preview) で本物の asset 配信を確認する。local で wrangler を使う場合は wrangler 4.160 以上 (update available と表示) か Node 22/24 で再試行。
