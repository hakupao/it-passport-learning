# H3 — Cloudflare Worker (所有者用 API のみ) (writer 記録)

2026-11-11 S154、branch `hosting-cf`、writer = oh-my-claudecode:executor (opus)、未 commit。Rule D 待ち (本書は writer の自己記録で PASS 判定ではない)。**attempt 2** (security-reviewer の HIGH-1 開放リダイレクト + LOW 4 件の修正) は §9 — §2-3 の `next` 検査の記述は §9 で置き換え。
**[実測]** はこの機械 (macOS arm64、Node v26.13.0) の数字。Cloudflare / Upstash の本番 endpoint には一度も接続していない (deploy・login・secret 設定なし)。

## 1. 何をしたか

| ファイル | 内容 |
|---|---|
| `apps/web/wrangler.jsonc` | name `itlearn`、main `worker/index.ts`、`compatibility_date: "2026-10-30"`、`compatibility_flags: ["nodejs_compat"]`、`assets: { directory: "./out", binding: "ASSETS", not_found_handling: "404-page", run_worker_first: ["/api/*"] }` (html_handling は既定 auto-trailing-slash)。`observability` は **入れない** (§2-9) |
| `apps/web/worker/index.ts` | `fetch(request, env)`。`/api/learning` GET・PUT、`/api/quiz/feedback` GET・POST、`/api/owner` GET。他の `/api/*` → 404 JSON、既知 path の他 method (HEAD・OPTIONS を含む、§2-10) → 405 + `Allow`、handler の想定外の例外 → 500 (log は error 名だけ)。`/api/*` の全応答に `Content-Security-Policy` (= `contentSecurityPolicy(false)`、`lib/export/headers.ts` を import、文字列の重複なし)・`Cache-Control: no-store`・`X-Robots-Tag: noindex`。`/api/*` 以外 (Worker が呼ばれた場合のみ) → `env.ASSETS.fetch(request)` (404 page) |
| `src/lib/learning/syncRoute.ts`・`src/lib/quiz/feedbackRoute.ts` | `route.dev.ts` の本体を **移動** (中身は不変、下の §2-6 の log 1 点を除く)。`app/api/**/route.dev.ts` は re-export + `runtime`/`dynamic` だけ。`next dev` と Worker が同じ関数を実行する (複製なし) |
| `src/lib/ownerActivation.ts` + `src/app/api/owner/route.dev.ts` | 有効化 `GET /api/owner?key=&next=` (§2-3)。`next dev` にも同じ route |
| `src/lib/ownerLegacy.ts` + `[locale]/layout.tsx` の `<head>` | 旧 `?owner_key=` の転送 script (§2-4) |
| `src/lib/owner.ts` | 冒頭コメントのみ (有効化の入口の説明) |
| `worker/testing/fakeUpstash.ts` | Upstash REST の in-memory 模倣 (§6) |
| `worker/testing/routeTarget.ts` + `vitest.config.ts` | 既存の route テスト 4 本を Worker でも実行 (§4) |
| `worker/local/wrangler.jsonc` + `worker/local/assets/404.html` | local 専用: 1 ファイルの assets で本物の Worker を `wrangler dev` (§6) |
| `scripts/local-cf.ts`・`scripts/fake-upstash.ts`・`scripts/worker-cpu-bench.ts` | local の静的配信 + `/api` proxy、fake Upstash の HTTP 化、CPU 計測 |
| `e2e/learning-owner.spec.ts`・`e2e/sensei.spec.ts` | `becomeOwner` を `/api/owner` に、有効化 4 件を追加、`next start` の記述を更新 (H1-5 review_carry) |
| `.gitignore`・`eslint.config.mjs` | `.wrangler/`・`/worker-dist/`・`.dev.vars*` |

## 2. 決めたこと (Rule D で確認してほしい点)

1. **`run_worker_first: ["/api/*"]` + binding `ASSETS`** — docs (下の §8) の配列形。`*` は深い一致、`!` で除外、上限 100。他の全ての要求は静的 asset のまま (Worker 要求 0)。
2. **env は `process.env`** — lib (`owner.ts`・`syncStore.ts`・`feedback.ts`) が `process.env` を読むので、`nodejs_compat` + compat date ≥ 2025-04-01 (`nodejs_compat_populate_process_env` が既定 on) で Worker の vars / secrets が `process.env` に入る仕組みを使い、lib を変えない。**[実測]** workerd (`wrangler dev` 4.160) で `/api/owner`・`/api/learning`・`/api/quiz/feedback` が `.dev.vars` の値で動いた。`env` 引数は ASSETS だけに使う。
   - Upstash: `@upstash/redis` の `"."` export (= `nodejs.mjs`) は `fetch` だけを使う (node: import なし)。既定 `cache: "no-store"` は compat date 2024-11-11 以降の workerd で受け付ける。**[実測]** workerd から fake の REST に `/pipeline` (auto-pipelining) と `/multi-exec` で到達、v1/v2 の GET・PUT・feedback POST/GET が期待どおり。`@upstash/redis/cloudflare` への切替は不要と判断。
   - secret 名: `OWNER_KEY`、`KV_REST_API_URL` + `KV_REST_API_TOKEN` (または `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`、両方あれば UPSTASH_* が優先 — 既存の lib の順位)。H4 で `wrangler secret put`。repo には入れない。
3. **有効化 = Worker の path `/api/owner`** (`run_worker_first` は query を見ないため)。`?key=<OWNER_KEY>` → `itp_owner` = sha256 hex (`HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=31536000`) + `itp_owner_hint=1` (HttpOnly なし、同じ属性)。`key=logout` → 両方 `Max-Age=0` + `Expires=1970` で削除。誤り・空・欠落、`OWNER_KEY` 未設定 → 何も設定しない。全て **307** で `next` へ。`Referrer-Policy: no-referrer` を付ける (redirect 後の要求に key 付きの元 URL を Referer として持たせない)。
   - ~~attempt 1 の~~ `next` の検査 (`safeNextPath`、**正規化前の文字列だけを見ていたため HIGH-1、§9 で修正**): `/` で始まり `//` で始まらない、`\` と制御文字 (tab・改行等、ブラウザが `/\x`・`/<tab>/x` を `//x` と読む) を含まない、`new URL(next, origin)` の origin が同じ、`/api` 配下でない。不合格は `/ja`。残った `owner_key` param は落とす。Location は同一 origin の絶対 URL (middleware.dev.ts と同じ形)。
4. **旧 `?owner_key=` (任意のページ)** — 静的ページに届くので、`[locale]/layout.tsx` の `<head>` の inline script が `window.stop()` → `location.replace("/api/owner?key=…&next=<同じページ、param なし、hash 付き>")`。理由: H1-1 / H7 の手順 (「`?owner_key=` を 1 回開き直す」) と既存のブックマークをそのまま使える。key は自 origin の Worker にしか送られない。`location.replace` で key 付き URL は履歴に残らない (307 も履歴に入らない)。`window.stop()` で以後の読込 (body 末尾の `defer` の Web Analytics beacon、画像、font) を止める。CSP は `'unsafe-inline'` 済みで変更不要。
   - 残る露出 (受容): (a) script より前に `<head>` で要求が始まる同一 origin の `async` chunk 9 本と CSS 4 本は、Referer に key 付き URL を持つ (自 origin の静的 asset への要求のみ、Cloudflare の asset 配信は Worker を通らず log も残らない)。(b) 静的 HTML の要求自体の URL に key が入る (Cloudflare 側の HTTP log 等の扱いは H4 で確認)。推奨の入口は `/api/owner?key=…` を直接開くこと (H7 の手順もこちらに)。
   - 却下: 全 navigation を Worker に通す (`run_worker_first: true` = 全ページが Worker 要求、10 万 / 日を消費、D-217 の目的に反する)。旧形式の廃止 (H7 で owner が 1 回だけ新形式を開けば足りるが、既存の手順・ブックマークを壊す利点がない)。
   - `next dev` では従来どおり middleware が `?owner_key=` を先に処理する (script は何もしない)。
5. **CSP は `contentSecurityPolicy(false)`** — Worker は build 時の analytics token を持たず、API 応答は beacon を読まないので最も厳しい形。
6. **feedback の失敗 log を error 名だけに (挙動の変更 1 点)** — 元の `route.dev.ts` は `err.message` を log していたが、`UpstashError` の message は `command was: [...]` で送信コマンド (= feedback record と note) を含み、parse error は応答 body を含む。課題の「record・cookie・error body を log しない」に合わせ `/api/learning` と同じ `{ method, error: err.name }` にした (Worker と `next dev` の両方)。既存テスト (tag の検査) は不変で PASS、Worker テストで `command was`・note・body が log に無いことを固定。
7. **非 navigation の asset 未命中** — docs (static-site-generation) は「Worker があると navigation 以外の未命中は Worker を起動する」。**[実測]** local workerd では `run_worker_first` 配列のとき `/missing.txt` (`Sec-Fetch-Mode: cors` / `no-cors` / なし) は Worker を起動しなかった (local の trace の span 0、404 page を返す)。H4 の preview で Workers Logs の要求数を確認 (H1-5 review_carry「Worker がある時の asset 未命中が Worker 要求になるか」)。起動された場合も `ASSETS.fetch` で 404 page を返す (CPU ≈ 0)。
8. **wrangler は devDependency に入れていない** — homebrew 4.156 でも `run_worker_first` 配列と dry-run は動くが、local dev は §6 の構成が必要。H4 で配置方法を決めるときに版 (≥ 4.160) を `package.json` に固定するかを決める (`$schema` を config に入れていないのはこのため)。
9. **`observability` (Workers Logs) は wrangler.jsonc に入れない** — local の workerd の trace は invocation ごとに `url.full` を保存し、`/api/owner?key=<OWNER_KEY>` の key がそのまま入った ([実測] local の span)。本番で有効にすると key が Cloudflare の log 保存に残る。CPU 時間の読み方 (dashboard の Metrics、一時的に有効化して計測後に無効化 + key の rotate、URL を記録しない設定の有無) は H4 で docs を確認して決める。`wrangler tail` も URL を表示するので、有効化を tail 中に行わない。
10. **HEAD / OPTIONS は 405 (Next との差、意図的)** — Next の route handler は HEAD を GET で、OPTIONS を `Allow` 付きで自動応答するが、Worker は 405 + `Allow` にした (所有者 API を HEAD で叩く client はなく、CORS も使わない)。GET・PUT・POST の挙動 (状態 code・検査順・上限・v1/v2・merge・log) は同じ関数なので同一。

## 3. gates [実測]

| gate | 結果 |
|---|---|
| `pnpm tsc --noEmit` (worker・scripts を含む: tsconfig の `**/*.ts`) | 0 errors |
| `pnpm lint` | 0 |
| `pnpm vitest run` | **132 files / 1,477 passed / 0 failed** (project `unit` + `worker-routes`) |
| export build (clean、`pnpm build`) | 20.4 s、`out/` = **16,194 ファイル** (H1-5 と同数)。Worker のコードは `out/` に入らない (`find out -name '*worker*'` 0、`out/api` なし)。HTML に入る差分は `<head>` の転送 script のみ |
| `pnpm scan:out` | **PASS** (a 0 / b 0 / c 0 / d 0 / e 0) |
| Worker bundle (`wrangler deploy --dry-run --outdir worker-dist`、4.160) | **239,797 B / gzip 38,379 B** (wrangler 表示 234.18 KiB / gzip 37.47 KiB)。Worker の大きさの上限 (Free 3 MB 圧縮後と記憶、ADR D-217 の一次資料は 64 MiB 非圧縮 — どちらでも 2 % 未満) に十分収まる。**login 不要を確認**: `HOME` を空の scratchpad にし `CLOUDFLARE_API_TOKEN`・`CLOUDFLARE_ACCOUNT_ID` を外しても成功、`--dry-run: exiting now.`。bundle の import 文 0 (自己完結) |
| Playwright owner specs (§6 の local 構成) | **37 passed / 0 failed** (1.4 分) — `learning-owner.spec.ts` 8 (既存 4 + 新規 4)、`learning.spec.ts` 6 (H1-5 で失敗していた `/api/learning` 403 を含む)、`sensei.spec.ts` 23 (owner の part 7 を含む) |
| Playwright **全体** (同じ local 構成、`E2E_OWNER_KEY` あり、retries 1) | **158 passed / 0 failed / 2 skipped** (2.5 分、flaky 0)。skip は H1-5 と同じ既存の条件 skip (`textbook.spec.ts:109` v1 単元なし、`:271` 幅広 v1 図なし)。H1-5 の唯一の失敗 (`learning.spec.ts:209` の `/api` 404) は解消。配信 log 26,102 要求: 200 26,060 / 304 23 / 307 11 / 403 6 / 404 2 (= glossary.spec が期待する不正 id 2 件のみ) |
| `worker-routes` が本当に Worker を通る検査 (植え込み) | `handleApi` を一時的に 418 を返すように変えると `--project worker-routes` は 41 / 52 FAIL (残り 11 は handler を呼ばない lib の直接テスト)、`--project unit src/app/api` は 52 / 52 PASS → 元に戻した。恒久の守り: `route.test.ts` に「worker のとき X-Robots-Tag = noindex、dev のとき無し」の 1 件 |
| `next dev` (:3160、OWNER_KEY 付き・Upstash 空) | `/api/owner` 307 + 2 cookie、`/api/learning` 403 / 503、`/api/quiz/feedback` 503、`?owner_key=` → middleware の 307 (移動後も dev は不変) |

注: wrangler の dry-run 表示は「Read 16229 files」(`find -type f` は 16,194、dir は 36)。dir を数えている可能性。20,000 の上限には余裕があるが、H4 の実 upload で Cloudflare 側の数を確認。

## 4. テスト

- `worker/__tests__/worker.test.ts` (27 件): 本物の `@upstash/redis` client + fake REST (`fetch` を差し替え、base64 応答)。routing (404 ×6 path、405 ×6 method と Allow、`constructor` method、`/api` 外 → ASSETS、ASSETS なし → 404、例外 → 500 で message を log しない)、learning (403 ×4: cookie なし / 誤り / hint だけ / OWNER_KEY 空、503、GET 空 v1・v2、PUT v2・v1、v1 key の読込と非書込、400 ×4、corrupt 500 で書込なし・log に中身なし、Upstash 500 / 401 → 502 で log に record・body・token なし、network error → 502)、feedback (201 + MULTI/EXEC、GET 新しい順、空、403→503→400 の順、502 で note・`command was` を log しない)、有効化 (正しい key の cookie 属性、その cookie で `/api/learning` 200、誤り・空・欠落・hash を key に → cookie なし、OWNER_KEY 未設定、logout、open redirect 15 種 → `/ja`、encode された `//`、`owner_key` の除去、query の保持)。全 `/api` 応答で CSP・no-store・noindex を検査。
- **既存 route テストの移植**: `route.test.ts`・`v1ClientCompat.test.ts`・`v2ClientCompat.test.ts` (learning)・`route.test.ts` (feedback) は import を `routeTarget({ GET, PUT })` に変えただけで、vitest の project `worker-routes` (`ROUTE_TARGET=worker`) で **同じ全ケースが Worker の fetch 経由で** 再実行される (path と method で routing → 同じ lib handler、loader の mock はそのまま効く)。`worker/__tests__/routeTarget.test.ts` が「worker のとき本当に Worker が応答している (X-Robots-Tag がある、dev handler は呼ばれない)」を固定。
- `src/lib/__tests__/ownerLegacy.test.ts` (4 件): 転送 script を偽の window で実行 (stop → replace の URL、logout・空 key も転送、param のないページは何もしない、`#owner_key=` は対象外)。
- 植え込み確認: `safeNextPath` の制御文字・`\` の検査を消すと open-redirect のテストが FAIL することを確認後、元に戻した。

## 5. CPU (Free = 10 ms / 要求) [実測、local の代理指標]

`node scripts/worker-cpu-bench.ts --bundle worker-dist/index.js` — dry-run の bundle (upload されるコード) を Node 内で実行、`process.cpuUsage()` を fetch の前後で。Upstash は既製の応答 (GET = 保存記録の base64 REST 封筒を事前計算、SET = OK、body を parse しない) なので、計測区間は Worker 側の処理だけ (sha256、body 読取、JSON.parse、client の base64 decode + 自動 deserialize、parseRecord / mergeRecords / encodeRecord、SET コマンドと応答の JSON.stringify)。各 30 回 warm-up + 300 回、2 run (run 1 は背景の `scan:out` と時間が重なった — run 間の揺れの一因、run 2 は単独)。値は CPU ms (user+system、GC の補助 thread を含む) の p50 / p95 / max、wall は p50。数字は `evidence/phase5/hosting/H3_cpu_bench.json`。

| case | 記録 bytes | p50 (run1 / run2) | p95 | max | wall p50 | cold (初回) |
|---|---|---|---|---|---|---|
| `/api/owner` 有効化 | — | 0.05 / 0.05 | 0.18 / 0.23 | 0.32 / 0.56 | 0.05 | 3.4 |
| `/api/learning` 403 | — | 0.02 / 0.03 | ≤ 0.27 | ≤ 3.5 | 0.03 | 1.0 |
| GET ?v=2、typical 1,000 題 × 2 | 75,295 | 1.41 / 1.38 | 4.1 / 4.0 | 18.9 / 22.1 | 1.3〜1.4 | 13 |
| PUT 全量、typical | 75,295 | 4.25 / 3.35 | 8.2 / 5.6 | 48.6 / 51.6 | 2.7〜3.6 | 4.4〜5.8 |
| PUT delta 1 件、typical | 75,295 | 2.31 / 2.40 | 4.3 / 6.0 | 7.4 / 20.8 | 1.8〜2.2 | 2.5〜3.7 |
| GET ?v=2、**飽和** 2,900 題 × 10 (= ATTEMPTS_K、現在の題庫の最大) | 757,495 | **14.8 / 20.0** | 22.6 / 27.8 | 52.7 / 55.2 | 10.5〜18.9 | 11〜18 |
| GET v1、飽和 | 757,495 | 11.6 / 17.0 | 16.7 / 24.9 | 43.9 / 49.3 | 7.6〜14.5 | 14 |
| PUT 全量、飽和 | 757,495 | **26.2 / 28.8** | 60.1 / 64.0 | 66.2 / 67.6 | 19〜22 | 28〜34 |
| PUT delta、飽和 | 757,495 | **17.2 / 15.0** | 31.2 / 25.6 | 59.0 / 53.4 | 11〜13.5 | 23 |
| GET ?v=2、約 1 MiB (3,800 題 × 10、題庫の将来) | 989,695 | 14.8 / 11.1 | 22.0 / 21.8 | 41.9 / 39.7 | 9〜10.7 | 14〜18 |
| PUT 全量、約 1 MiB | 989,695 | 32.7 / 39.0 | 60.7 / 66.0 | 65.1 / 67.5 | 24〜25 | 34〜38 |
| PUT delta、約 1 MiB | 989,695 | 18.5 / 25.2 | 34.2 / 34.2 | 54.7 / 60.7 | 15〜16 | 35〜44 |

工程別 (飽和 757 KB、p50、jiti で lib を直接): REST 封筒 JSON.parse 0.24・base64 decode 0.56・記録の JSON.parse 1.72・parseRecord 1.96・mergeRecords 1.61・encodeRecord 1.12・JSON.stringify 1.54・SET コマンドの stringify 0.45・応答 v2 の encode+stringify 2.56 ms。→ Upstash client 固有の負担 (base64 等) は約 1 ms で、大半は記録の parse / 検査 / merge / 直列化そのもの。小手先の最適化では飽和時に 10 ms へ収まらない。**下限の目安**: 工程の和だけで飽和時 GET ?v=2 ≈ 7 ms、PUT ≈ 15 ms (stream・Request 等の Node 固有の負担を含まない数字) — これが Cloudflare 上でも残る最小の仕事量。

**判定 (報告、設計は変えていない)**: 有効化と 403 は桁違いに余裕 (≈ 0.05 ms)。**記録が大きくなると `/api/learning` は 10 ms を超える**: 線形に見て PUT 全量は約 250〜300 KB、GET は約 400 KB で local の p50 が 10 ms に達する見込み。飽和 (757 KB) では GET 約 15〜20 ms、PUT 約 15〜29 ms。local は代理指標 (Node の V8 ≠ Cloudflare の workerd と CPU、cpuUsage は GC thread も数える = wall の方が単一 thread の CPU に近く、wall でも飽和時は 10 ms 超)。Free の 10 ms を超えた要求は打ち切られ得る (エラーの形と許容の幅は docs で要確認、H4 で実地)。
- **所有者の実際の記録の大きさが鍵** — 本番 Upstash には触れていないので未知。H4 前に owner の browser で `localStorage.getItem("itp:learn:v2").length` を見れば (UTF-8 ≒ ASCII なので bytes とほぼ同じ) どの行に当たるか分かる。Vercel の log に `[learning-sync-size]` (768 KiB 超) が出ていれば飽和側。
- 選択肢 (ユーザー判断、PLAN §4 の「H3 で CPU 超過が分かった場合」):
  - (A) **Workers Paid (月 5 ドル)**: CPU 上限が大幅に上がる (既定 30 s / 要求と記憶 — 選ぶ前に pricing / limits の docs で確認)。コード変更なし。
  - (B) **同期の分割**: 記録を試験回 (または題の範囲) ごとの key に分け、GET / PUT は変わった shard だけ (client 側の差分送信は既に delta PUT がある)。1 要求の処理量が 1/29 程度になる。lib・client・保存形式の変更と移行が要る (D-190 の再設計)。
  - (C) **server の処理を減らす (部分的)**: GET ?v=2 は保存済みの canonical 文字列を検査後そのまま返す (encode+stringify 約 2.5 ms 減)、Upstash の base64 をやめる (`responseEncoding: false`、約 0.6 ms 減) 等。飽和時の PUT (merge が必須) は 10 ms 以下にならない見込み = 単独では不足。
  - (D) **様子見**: 記録が typical 程度 (< 200 KB) なら現状のまま Free で開始し、Workers Logs の CPU を監視、超え始めたら A か B。
- writer の推奨: H4 の preview で実記録の CPU を測ってから (D) か (A)。実記録が 300 KB を超えていれば (A) が最小の変更。

## 6. local の end-to-end (wrangler dev は全 out/ では起動しない)

- `wrangler dev` 4.160 (npm、scratchpad) でも 16k ファイルの `out/` で `spawn EBADF` → `failures/phase5/hosting/step_H3_attempt_1_wrangler_dev.md` (Rule B)。同時に、`apps/web` 直下で `wrangler dev` すると **`.env.local` (本番 Upstash の資格情報) を自動で読む** ことを確認 (要求処理前に落ちたので接続は発生していない) → local 用の config を別 dir に置いた。
- 採用した構成 (3 process、全て 127.0.0.1、:3000 不使用):
  1. `node scripts/fake-upstash.ts --port 3161` — Upstash REST の in-memory 模倣 (`worker/testing/fakeUpstash.ts`)。
  2. `cd worker/local && wrangler dev --port 3152 --ip 127.0.0.1` — **本物の Worker コードを本物の workerd で** (assets は 404.html 1 ファイル、同じ compat 設定)。env は `worker/local/.dev.vars` (gitignore): `OWNER_KEY=local-owner-key`、`KV_REST_API_URL=http://127.0.0.1:3161`、`KV_REST_API_TOKEN=fake-token`、`UPSTASH_DISABLE_TELEMETRY=1`。
  3. `node scripts/local-cf.ts --out out --port 3150 --api http://127.0.0.1:3152` — `out/` を asset 層の模倣で配信、`/api/*` を 2 へ proxy (Set-Cookie を全部、Location の origin だけ書換え: wrangler dev は Host を保たず自分の origin で Location を作るため)。log は `/api` の query を書かない (key を残さない)。
  - 実行: `PLAYWRIGHT_BROWSERS_PATH=~/Library/Caches/ms-playwright E2E_OWNER_KEY=local-owner-key PLAYWRIGHT_BASE_URL=http://127.0.0.1:3150 npx playwright test e2e/learning-owner.spec.ts e2e/learning.spec.ts e2e/sensei.spec.ts`
- **模倣しているもの**: Upstash REST (POST の単発 / `/pipeline` / `/multi-exec`、Bearer token 検査、`Upstash-Encoding: base64` の応答、GET・SET・MGET・ZADD・ZRANGE [REV]、外部障害の 500 / 401)、Cloudflare の asset 層 (H1-5 と同じ: `_redirects`、`_headers`、auto-trailing-slash、404-page、既定 Cache-Control + ETag)、`run_worker_first` (`/api/*` を proxy する前段として)。**模倣していないもの**: Upstash の expiry・SET/ZADD の option・sync token・遅延・上限、Cloudflare の edge cache・圧縮・HTTP/2・本物の `run_worker_first` の判定 (local の workerd では単独で確認、§2-7)・CPU 上限の強制。
- 結果: 37 / 37 PASS。local-cf の log 6,169 要求 (200 6,128 / 304 23 / 307 13 / 403 5 / **404 0**)。`/api/owner` 13 (navigate 11)、`/api/learning` は hermetic な spec が `page.route` で横取りするため Worker に届いたのは 8 (403 ×5、round trip の PUT 200・GET 200 等)。fake Upstash に届いたのは round trip の `/pipeline` get ×5・set ×1。旧 `?owner_key=` のページ要求 1 件 → `/api/owner` → 元ページ (param なし) を確認、戻るで key 付き URL に戻らない。wrangler の **text log** に key は 0 件 (`GET /api/owner 307` の形で query を書かない) — ただし local の trace (observability の span) は `url.full` に `?key=…` を含んでいた → §2-9。
- **注意**: `learning-owner.spec.ts` の既存 4 件は hermetic (`page.route` で `/api/learning` を模擬) なので、Worker の同期そのものを通すのは新規の round trip 1 件と `learning.spec.ts` の 403 だけ。同期の中身は §4 の unit (同じ全ケースを Worker で) が担保。

## 7. H4 が preview で確認すること

1. secret 設定 (`OWNER_KEY`、`KV_REST_API_URL`/`TOKEN`) と `process.env` への注入 — `/api/learning` が 403 (cookie なし) → 有効化後 200 (503 でないこと)。
2. **CPU**: 所有者の実記録で `/api/learning` GET ?v=2 と PUT (全量・delta) を数回、Workers Logs の CPU 時間を読む。10 ms 近く / 超なら §5 の選択肢をユーザーへ。
3. `run_worker_first` が `/api/*` だけ: 通常のページ・`/data/*`・`/_next/*`・figure が Worker 要求に数えられない (Workers の Metrics の要求数)。asset 未命中 (非 navigation の fetch、例: 存在しない `/data/x.json`) が Worker を起動するか (§2-7)。
4. `/api/owner?key=…&next=/ja` の Set-Cookie 2 本と属性、`Referrer-Policy`、`key=logout`、open redirect (`next=//x`) が `/ja`。旧 `/ja/glossary?owner_key=…` の転送 (beacon token ありの build で `window.stop()` 後に beacon が送られないこと = H1-5 carry の beacon 確認と同時に)。
5. Worker 応答の header: CSP・`Cache-Control: no-store`・`X-Robots-Tag: noindex` (`/api/*` は custom domain でも noindex)。`_headers` の CSP が Worker 応答に二重に付かないこと (docs 上は付かない)。
6. 実 upload の asset 数 (wrangler 表示 16,229 と `find` 16,194 の差) と 20,000 の余り。
7. `wrangler deploy` を `apps/web` で実行するとき `.env.local` が upload されないこと (dev のみの読込のはず — docs で確認してから)。
8. Upstash への実接続の遅延 (wall) は CPU に入らないが、Worker からの往復で同期 UI の体感が変わらないか (同期 1 回)。
9. **log に key を残さない**: Workers Logs / Logpush / `wrangler tail` を使うなら `/api/owner?key=…` の URL が記録されるかを確認 (§2-9)。記録されたなら OWNER_KEY を rotate。

## 8. 参照した一次資料 (2026-11-11 取得)

- Wrangler configuration § Assets — https://developers.cloudflare.com/workers/wrangler/configuration/ (`run_worker_first: boolean | string[]`、`*` glob・`!` 除外・`/` か `!/` で始まる・上限 100、`html_handling` 既定 `auto-trailing-slash`、`not_found_handling` = `single-page-application` / `404-page` / `none`、`.dev.vars` / `.env` は config と同じ dir、`compatibility_date` は必須)
- Static assets binding — https://developers.cloudflare.com/workers/static-assets/binding/ (配列の例 `["/api/*", "!/api/docs/*"]`、`env.ASSETS.fetch()` には html_handling と not_found_handling が適用)
- Routing: Worker script — https://developers.cloudflare.com/workers/static-assets/routing/worker-script/ (配列で選択的 Worker-first、他は asset 優先のまま)
- Routing: SSG / 404 page — https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/ (`404-page` は最寄りの `404.html` を 404 で。Worker があると非 navigation の未命中は Worker を起動、navigation は compat date ≥ 2025-04-01 で起動しない)
- Node.js `process` — https://developers.cloudflare.com/workers/runtime-apis/nodejs/process/ (`nodejs_compat` + `nodejs_compat_populate_process_env` (compat date ≥ 2025-04-01 で既定) で vars・secrets が `process.env` に。2026-08-04 以降の compat date は `nodejs_compat` も既定)
- `@upstash/redis` 1.38.0 の配布物 (node_modules): `exports["."]` = `nodejs.mjs` (fetch のみ)、既定 `responseEncoding: "base64"`・`cache: "no-store"`・auto-pipelining (`/pipeline`)・`multi()` = `/multi-exec`、`UpstashError` の message に `command was: …` を含む

## 9. attempt 2 — Rule D (security-reviewer opus) FAIL への修正 [実測]

失敗記録: `failures/phase5/hosting/step_H3_attempt_1_open_redirect.md` (HIGH-1)。

### 9-1. HIGH-1 開放リダイレクト
- 原因: `safeNextPath` は生の文字列で `/` 始まり・`//` でない・`\` と制御文字なしを確かめたあと `new URL(raw, origin)` で正規化していた。WHATWG の正規化で `.`・`..`・`%2e` が畳まれ `/.//evil.com` → pathname `//evil.com` (origin は自サイトのまま検査を通る)。返した path 文字列を Location 作成で再び `new URL(…, origin)` に通すと `https://evil.com/` になった (検査した値と使った値が違う)。
- 修正 (`src/lib/ownerActivation.ts`): `safeNextUrl(raw, origin): URL` — (1) 生の文字列の検査は残す、(2) **正規化後の URL** に対して origin 一致・pathname が `//` で始まらない・`\` を含まない・`/api` / `/api/…` でない、を検査、(3) Location は検査済みの URL オブジェクトの `.href` をそのまま使い、文字列から再解析しない。`safeNextPath` は表示・テスト用に `safeNextUrl` から派生するだけ。
- テスト (`worker/__tests__/worker.test.ts`): 報告の 7 形 (`/.//evil.com`、`/..//evil.com`、`/%2e//evil.com`、`/.%2E//evil.com`、`/%2e%2e//evil.com`、`/a/..//evil.com`、`/ja/..//evil.com/x`) + 自前の 11 形 (`/././/evil.com`、`/%2E%2e/%2e%2E//evil.com`、query・hash 付き、`/.%2e//evil.com`、`/a/b/c/../../..//evil.com`、`../` ×300、`a/` ×200 + `../` ×200、`./` ×500、`/ja/../api/learning`、`/%2e%2e/api`、`/.\/evil.com`) → すべて Location = `<origin>/ja` (origin も別に検査)。encode された `/%2F%2Fevil.com`・`/%2f/evil.com`・`/%5c/evil.com`・`/%5C%5Cevil.com`・`/ja/%2F%2Fevil.com`・`/ja/..%2f..//evil.com` は pathname の文字として残るだけ (自サイト内、pathname が `//` で始まらない) を検査。
- **植え込み**: 正規化後の検査 1 行を消すと dot-segment のテストが FAIL (Received `https://itlearn.example//evil.com`) → 戻して PASS。
- workerd (`wrangler dev` 4.160、local 構成) でも 7 形すべて `http://127.0.0.1:3150/ja` を確認 (curl)。

### 9-2. LOW (同時に修正)
| 項目 | 実装 | テスト |
|---|---|---|
| CSRF の多層防御 | `src/lib/apiGuards.ts` `isCrossSiteWrite`: GET 以外で `Sec-Fetch-Site` があり `same-origin` でない → 403 `{ error: "cross-site request" }`。Worker の `handleApi` で **routing より前** (未知 path・405 の method も 403)、さらに共有 handler の PUT (learning)・POST (feedback) の先頭でも (`next dev` も同じ)。header が無い要求 (古い browser・curl) は通す (owner cookie の検査は従来どおり)。GET は対象外 (有効化リンクを他サイトから開く通常の navigation を壊さない) | route テスト (Worker と dev の両方で実行): cross-site / same-site / none → 403 で書込なし、same-origin と header なし → 通る、GET は影響なし。Worker テスト: 5 組の path × method が routing 前に 403、Upstash 呼出 0、cross-site の GET /api/owner は 307 |
| POST の Content-Type | feedback POST は media type が `application/json` (charset 等の parameter 可、大文字小文字無視) 以外 → **415** `{ error: "content-type must be application/json" }`。順序: cross-site 403 → owner 403 → 503 → **415** → 上限 400 → JSON / 項目 400 (既存の「403 は不正 body より先」を保つ)。415 を選んだ理由: 「形式は正しいが受け付けない媒体」で 400 (中身の誤り) と区別できる。client (`QuizFeedback.tsx`) は既に `Content-Type: application/json` を送る | なし / text/plain / text/plain;charset / form-urlencoded / multipart / `application/jsonx` → 415、非所有者 + text/plain → 403、Redis なし + text/plain → 503、`Application/JSON; charset=utf-8` → 201。e2e: page からの実 POST JSON → 201、text/plain → 415、一覧 200 |
| feedback の body 上限 | `readCappedBody` を `lib/apiGuards.ts` に移して `(request, maxBytes)` に (learning は 1 MiB のまま)。feedback は `FEEDBACK_MAX_BODY_BYTES = 8192` (正しい body は最大約 3.2 KB = note 1,000 字 × UTF-8 3 bytes + 項目) | ちょうど 8,192 bytes の正しい body → 201、8,193 → 400、Content-Length 8193 の申告 → 400、9 KB の余分な項目 → 400 |
| 植え込み | `isCrossSiteWrite` を常に false → 5 件 FAIL、`isJsonContentType` を常に true → 2 件 FAIL、上限を 1 MiB に → 2 件 FAIL (いずれも戻して PASS) | |

### 9-3. `pnpm audit --prod` (apps/web、2026-11-11)
**27 件: critical 3 / high 13 / moderate 10 / low 1。** 全て既存の依存で、本 step の変更が増やしたものはない。
- `next` 15.5.18 (critical 3: Image Optimization API の RCE ×2 と Windows 上の自前 server の RCE、修正 ≥ 15.5.24 / ≥ 15.5.28。high 4・moderate 7: Server Actions の DoS / SSRF、rewrites の SSRF、cache 混同等、修正 ≥ 15.5.21〜15.5.28)。
- `next` 経由の `sharp` (< 0.35.5、libvips / libheif / librsvg、high 3)、`postcss` (high 2・moderate 2)、`nanoid` (high 2)、`source-map-js` (high 1)。
- `zod` < 4.6.6 (high 1、`@ai-sdk/*` 経由)、`@ai-sdk/provider-utils` < 4.0.33 (low)、`postcss-selector-parser` < 6.1.5 (moderate、`@tailwindcss/typography` 経由)。
- **影響の読み**: 静的 export (`out/`) になると Next の server 側 (Image Optimization・Server Actions・rewrites・ISR) は動かず、Worker の bundle (240,949 B) は lib のコードと `@upstash/redis` だけ (`zod`・`next` を含まない、bundle 内の `zod` 0 件)。sharp・postcss 等は build 時の道具。**ただし切替 (H7) までの Vercel 本番は Next 15.5.18 の server で動いている** — `next/image` は src で未使用 (grep で import 0) なので Image Optimization の 2 件の到達性は低いと読むが、Next を ≥ 15.5.28 に上げるかはユーザー判断 (本 step では依存を変えていない)。

### 9-4. gates (attempt 2) [実測]
| gate | 結果 |
|---|---|
| `pnpm tsc --noEmit` | 0 errors |
| `pnpm lint` | 0 |
| `pnpm vitest run` (unit + worker-routes) | **132 files / 1,490 passed / 0 failed** |
| export build (clean) + `pnpm scan:out` | build OK、`out/` 16,194 ファイル、走査 **PASS** (a〜e 0) |
| Worker bundle (dry-run 4.160) | 240,949 B / gzip 38,608 B、binding は `env.ASSETS` だけ |
| Playwright (local の 3 process 構成) | `learning-owner` + `learning` + `sensei` + `quiz` + `practice` = **51 passed / 0 failed**、その後に追加した feedback の実 POST を含む `learning-owner.spec.ts` 単独 **9 passed** |

### 9-5. H4 の配置チェックリスト (security-reviewer の指示、H4 で上から順に)
1. **`.env.local` を巻き込まない**: 配置は `.env.local` の無い clean checkout から行う (または `apps/web/.env.local` を一時的に repo の外へ移す)。さらに `CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV=false` を付けて wrangler を実行する。
2. `wrangler deploy --dry-run --outdir <dir>` で bindings 表示が **`env.ASSETS` だけ** (vars / secrets が並ばない) ことを確認。
3. secret は対話式の `wrangler secret put` で 1 件ずつ (shell 履歴・引数に値を残さない): `OWNER_KEY`、`KV_REST_API_URL`、`KV_REST_API_TOKEN`。`OWNER_KEY` は **新しく生成した 128 bit 以上の乱数** (例: 32 bytes を base64url) — Vercel 側の旧 key を流用しない。
4. `wrangler secret list` で 3 件の名前だけがあることを確認。
5. **observability / `wrangler tail` は off** のまま (`/api/owner?key=…` の URL が記録されるため、§2-9)。CPU の計測で一時的に使うなら、終了後に off + `OWNER_KEY` を rotate。
6. Cloudflare の WAF で `/api/*` に rate limit (Free で使える範囲の 1 規則、例: IP ごと 1 分 N 回) を設定。
7. preview での手動確認: §7 の 1〜9 に加え、`/api/owner?key=x&next=/.//evil.com` → Location が `<preview origin>/ja` (他の 6 形も 1〜2 個)、cross-site の PUT (`Sec-Fetch-Site: cross-site` を付けた curl) → 403、feedback の text/plain → 415。
