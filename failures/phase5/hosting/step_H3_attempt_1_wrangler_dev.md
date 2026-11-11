# H3 失敗記録 — `wrangler dev` 4.160 でも 16k ファイルの out/ を配信できなかった (環境) + `.env.local` の自動読込

- 日時: 2026-11-11 Session 154、branch `hosting-cf` (未 commit)、writer = oh-my-claudecode:executor (opus)
- 入力: `apps/web/wrangler.jsonc` (H3、assets = `out/` 16,194 ファイル、`run_worker_first: ["/api/*"]`、main = `worker/index.ts`)、wrangler **4.160.0** (scratchpad に npm で導入、homebrew の 4.156 ではない)、Node v26.13.0、macOS arm64。`HOME` は scratchpad (ログイン情報なし)、`WRANGLER_SEND_METRICS=false`。
- 試行: `cd apps/web && wrangler dev --port 3151 --ip 127.0.0.1 --var OWNER_KEY:… --var KV_REST_API_URL:http://127.0.0.1:3161 --var KV_REST_API_TOKEN:fake-token`
- 結果: H1-5 と同じ `Error: spawn EBADF` (esbuild の service、`ensureServiceIsRunning`) → `fatal error: all goroutines are asleep - deadlock!` で終了。要求は 1 件も処理されていない (Ready に到達せず)。
- **別の危険 (今回は実害なし)**: 起動時の表示が `Using secrets defined in .env.local` — wrangler は config と同じ dir の `.env*` を自動で読む。`apps/web/.env.local` には本番 Upstash の `KV_REST_API_URL` / `KV_REST_API_TOKEN` 等が入っている。`--var` と `.env.local` のどちらが勝つかは確認していない。Worker が要求を処理する前に落ちたため本番 Upstash への接続は起きていない (fake の log にも、wrangler の log にも `/api` 要求 0)。
- 技術判定: FAIL (環境; 4.156 → 4.160 で改善なし)。
- 業務判定: local e2e の道を変える。成功した代替 (H3 で採用):
  1. Worker は **1 ファイルの assets dir** の設定 `apps/web/worker/local/wrangler.jsonc` で `wrangler dev` (本物の workerd、Ready、`process.env` の注入と `@upstash/redis` の動作を確認)。この dir には `.env*` が無く、env は同 dir の `.dev.vars` (gitignore、fake の値のみ) から来る。
  2. `out/` は `apps/web/scripts/local-cf.ts` (H1-5 の静的 server を TS 化 + `/api/*` を 1 へ proxy) が配信。
  3. Upstash は `apps/web/scripts/fake-upstash.ts` (in-memory の REST 模倣)。
- 次の attempt への入力: `apps/web` 直下で `wrangler dev` を動かさない (`.env.local` を読む)。H4 で wrangler を使うときも、`apps/web` 直下の `wrangler deploy` は `.env.local` を **upload しない** か (dev 専用の読込のはず) を docs で確認してから。`--dry-run` は `.env.local` の有無に関係なく upload しない。
