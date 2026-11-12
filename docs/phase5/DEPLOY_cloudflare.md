# Cloudflare Workers Builds への配置手順 (D-225)

> 対象: Worker `itlearn` (`apps/web/wrangler.jsonc`)。push → Cloudflare 側で build + deploy (GitHub 連携)。
> 移設中の production branch = `hosting-cf` (→ https://itlearn.bojiang.workers.dev)、H7 で `main` に戻す。
> 根拠: D-225 (session 154)、`docs/phase5/PLAN_hosting_migration.md` §2 H4〜H7、`evidence/phase5/hosting/H3_worker.md` §9-5。
> Cloudflare docs の確認日: 2026-11-12 (Workers Builds の configuration・build watch paths・previews・rollbacks の各ページ、build image・Free の上限)。docs で確かめられなかった点は「未確認」と書き、§7-3 で実地に確かめる。
> この手順を始めたら local の `wrangler deploy` は使わない (H4 の version 5b3a802e が最後の local deploy)。

---

## 0. repo 側で用意済みのもの

| もの | 場所 | 役割 |
|---|---|---|
| wrangler `4.160.0` (固定) | `apps/web/package.json` devDependencies | deploy command の `npx wrangler deploy` がこの版を使う |
| Node `24.22.1` | `apps/web/.node-version` | build image に入っている版。root directory (`apps/web`) で読まれる |
| pnpm `11.1.3` | root `package.json` の `packageManager` | install する pnpm の版 |
| `pnpm build:cf` | `apps/web/package.json` | CI の build 一式 (下記)。途中で 1 つでも失敗すれば止まり、deploy されない |
| `pnpm check:release` | `apps/web/package.json` | push 前の local 検査。規則 (c) を含む全走査 (§5) |
| `esbuild` / `workerd` = `false` | `pnpm-workspace.yaml` の `allowBuilds` | pnpm 11 は未承認の build script があると install を失敗させるため明示 |

`pnpm build:cf` の中身 (順に実行、失敗で即停止):

1. `node --no-warnings ../../scripts/lang-leak-scan.ts --gate` — 三言語関門 (L5)
2. `vitest run --project unit src/lib/textbook/__tests__/v2-corpus.test.ts` — 教科書 corpus の検査 (L5 review: 関門と一緒に走らせる)
3. `pnpm build` — export build (`next build` + `scripts/postexport.ts`)
4. `node scripts/scan-out.ts out --no-ipa-sources` — `out/` 走査。**規則 (c) (IPA 原本の文の混入) だけ**を飛ばす。clone には IPA 原本 (gitignored) が無いため。飛ばしたことを log に大きく 2 回出し、報告の `findings.c` は `"skipped"`。規則 (a) (b) (d) (e) は通常どおり。

`--no-ipa-sources` を付けない `scan:out` は従来どおり、原本が無ければ exit 2 で落ちる (fail closed、`apps/web/src/__tests__/scanOutCli.test.ts`)。

---

## 1. Worker と GitHub をつなぐ

Cloudflare dashboard → **Workers & Pages** → `itlearn` → **Settings** → **Build** → **Git repository** → **Connect** → GitHub の repo `IT-Passport-Learning` を選ぶ (Cloudflare の GitHub App に、この repo だけを許可)。

Worker 名は `itlearn` のまま。`apps/web/wrangler.jsonc` の `"name": "itlearn"` と一致していないと build が失敗する。

---

## 2. Build の設定 (Settings → Build)

### 2-1. Build configuration

| 項目 | 入力する値 |
|---|---|
| **Root directory** | `apps/web` |
| **Build command** | `cd ../.. && pnpm install --frozen-lockfile && cd apps/web && pnpm build:cf` |
| **Deploy command** | `npx wrangler deploy` (既定値のまま) |
| **Non-production branch deploy command** (preview command) | `npx wrangler preview` (既定値のまま。preview build を有効にしたときだけ使われる。wrangler ≥ 4.135 が必要 → 4.160.0 で可) |

- install を build command の中で repo root から行うのは、lockfile と `pnpm-workspace.yaml` が root にあり、root directory (`apps/web`) で自動 install させると workspace として解決される保証がないため。そのため自動 install は §2-4 の `SKIP_DEPENDENCY_INSTALL=1` で止める。
- `--frozen-lockfile`: lockfile と `package.json` がずれていたら失敗させる (CI=true でも既定で frozen だが明示)。

### 2-2. Branch control

| 項目 | 値 |
|---|---|
| **Production branch** | `hosting-cf` (H7 で `main` に変える、§6) |
| **Enable non-production branch builds** (preview builds) | **オフを推奨** (H7 まで) |

preview builds をオフにする理由:

1. `main` には今 `apps/web/wrangler.jsonc` も `build:cf` も無い。オンにすると `main` への push のたびに preview build が走って必ず失敗し、build 時間 (Free 月 3,000 分、同時 1 本) を食う。
2. 外部から見える preview URL が増える (H0-2 で Vercel の branch preview を止めたのと同じ理由。docs: Version URL は有効にすると誰でも開ける)。
3. 秘密の扱いを別に決める必要がある: docs (Workers → Previews) では `wrangler preview` の Preview は production の変数・secret・binding を**引き継がない** (`previews` block と専用の secret 設定が要る)。今の `wrangler.jsonc` に `previews` は無いので、Preview では `/api/*` が秘密なし (403) で動くだけで本番データには触れないはずだが、実地では未確認。なお docs は、Worker Previews 導入前の**旧モデル**の Worker では preview が production の設定 (秘密を含む) を使うと書いている → preview を将来オンにする前に、dashboard で `itlearn` がどちらのモデルかを確認する (S154 Rule D LOW-2)。

D-225 の文言は「他 branch は preview build」だが、上の理由で H7 までは オフ (S154 ユーザー確認済み)。H7 で改めて決める。

### 2-3. Build watch paths

docs・evidence・failures だけの commit では build しない (Vercel の D-212 と同じ範囲)。

| 欄 | 値 (1 行に 1 つ) |
|---|---|
| **Include paths** | `*` |
| **Exclude paths** | `docs/*`<br>`evidence/*`<br>`failures/*`<br>`AGENTS.md`<br>`CLAUDE.md`<br>`README.md`<br>`README.zh-CN.md`<br>`RETROSPECTIVE*` |

- 判定 (docs): 変更されたパスのうち exclude に当たるものを先に除き、残りが include (`*`) に当たれば build。docs と code が混ざった commit は build される。`*` は 0 文字以上に一致し、規則の先頭か末尾にだけ置ける。
- docs の例外: 変更 0 ファイル、または 3,000 ファイル以上・20 commit 以上の push は watch paths を無視して必ず build する。
- パスの基準 (repo root か root directory か) は docs に明記が無い (例は repo root 基準に見える)。§7-3 の 7 で確認する。
- include を `apps/web/*` に絞らない理由: build は `scripts/` (関門)、`data/ip/quiz`・`data/ip/textbook` (corpus)、root の `package.json`・`pnpm-lock.yaml`・`pnpm-workspace.yaml` も読む。
- exclude に `*.md` を使わない理由: `*.md` は `apps/web/README.md` 等の深い階層にも当たる。Vercel の規則は「root の *.md」だけなので、root の 6 つを名前で書く。`RETROSPECTIVE*` は先頭一致なので root の `RETROSPECTIVE_*.md` だけに当たる。新しい root の .md を足したらここにも足す。

### 2-4. Build variables (Settings → Build → **Variables and secrets** = build 時だけ。runtime には渡らない)

| 名前 | 値 | 理由 |
|---|---|---|
| `SKIP_DEPENDENCY_INSTALL` | `1` | 自動 install を止め、build command の root での `pnpm install` だけにする |
| `PUPPETEER_SKIP_DOWNLOAD` | `true` | root devDependency の `@mermaid-js/mermaid-cli` → puppeteer の postinstall が browser を download し、clean install で失敗したため。site の build は browser を使わない (Mermaid → SVG は local の Stage 4 作業だけ)。local の install には影響しない |
| `NODE_VERSION` | 設定しない | `apps/web/.node-version` (`24.22.1`、build image に同梱の版) が使われる。効いていなければ (§7 で確認) ここに `24.22.1` を入れる |
| `CF_WEB_ANALYTICS_TOKEN` | 今は設定しない | D-220 の Web Analytics。token があるときだけ beacon と CSP の許可が入る (走査の規則 (e) が両者の一致を検査)。Web Analytics の site を作ったら (H7 の custom domain の後) 入れる |

ここには秘密を置かない (build log や build 産物に出うる)。runtime の秘密は §3。

---

## 3. Runtime の secret (Settings → **Variables & Secrets**)

3 件。すべて **Type = Secret** で入れる (Text にしない)。

| 名前 | 値 |
|---|---|
| `OWNER_KEY` | **新しく生成した 128 bit 以上の乱数**。Vercel の旧 key を流用しない。例: `openssl rand -base64 32 \| tr '+/' '-_' \| tr -d '='` (256 bit、URL にそのまま入る形) を password manager に保存してから貼る |
| `KV_REST_API_URL` | Upstash の REST URL (Vercel と同じ DB) |
| `KV_REST_API_TOKEN` | Upstash の REST token |

dashboard の代わりに CLI で入れる場合 (login 済みの端末、`apps/web` で、対話式で 1 件ずつ。値を引数や shell 履歴に残さない):

```sh
cd apps/web
pnpm exec wrangler secret put OWNER_KEY
pnpm exec wrangler secret put KV_REST_API_URL
pnpm exec wrangler secret put KV_REST_API_TOKEN
pnpm exec wrangler secret list   # 名前が 3 件だけあること
```

- secret が deploy をまたいで残ることは H4 以降の実地で確認する (§7-3 の 6。docs のページには明記が無い)。
- `wrangler.jsonc` に `vars` は無い。dashboard で Type = Text の変数は足さない (`keep_vars` 未設定時に deploy で上書きされるかは docs で未確認。秘密はすべて Secret で入れるので不要)。

---

## 4. 安全上の注意 (H3 §9-5)

1. **Observability (Workers Logs) は オフ のまま**。Settings → Observability で有効化しない。`wrangler.jsonc` に `observability` を書かないのは意図的 (`/api/owner?key=…` の URL が記録されるため)。
2. **Logpush・`wrangler tail` を使わない** (同じ理由)。D-224 の CPU 実測で一時的に使う場合は、終わったら オフ に戻し `OWNER_KEY` を作り直す。
3. **`.env*` は deploy に入らない**: Workers Builds は git clone から build するので gitignored の `.env.local` は存在しない (local の dry-run でも binding は `env.ASSETS` だけだった、§7)。
4. **WAF の rate limit は H7 で**: custom domain (zone `bojiangz.com`) ができてから、その zone の Security → WAF → Rate limiting rules に `/api/*` の 1 規則 (Free で使える範囲、IP ごと)。WAF 規則は zone に付くもので、自分の zone ではない workers.dev には置けない (と理解している。H7 で確認)。
5. Build log は Cloudflare の dashboard に残る。build command は秘密を出力しない (build variables にも秘密は無い)。

---

## 5. push 前の local 検査 (`pnpm check:release`)

CI では規則 (c) が走らないので、**production branch (今は `hosting-cf`、H7 後は `main`) へ app に関わる commit を push する前に毎回**、local で実行する:

```sh
cd apps/web
pnpm check:release
```

- 中身: 三言語関門 → v2-corpus → `pnpm build` → `pnpm scan:out` (規則 (c) を含む全走査。local の `data/ip/exams`・`sources`・`syllabus` と `pdftotext` を使う)。
- exit 0 のときだけ push する。docs・evidence・failures だけの commit (§2-3 で build されない) は不要。
- 所要時間 (2026-11-12、手元の Mac で実測): 計 88 s (うち全走査 58 s、原本の索引 7 s)。原本 PDF 61 本・規則 (c) 0 件で PASS。

---

## 6. H7 切替 (ユーザー確認の上で実施)

前提: Track L PASS、H5 PASS、`hosting-cf` の HEAD で `pnpm check:release` が exit 0。

1. **Vercel 側の退避**: 今の Vercel production deployment の ID を控える (戻し先)。`hosting-cf` を `main` に merge すると Vercel が `main` を build し直すので、merge の前に Vercel の Git 連携を外すか、build を止める方法を決めて実行する (H7 で確認)。
2. Cloudflare: Settings → Build → Branch control の **Production branch を `main`** に変える。
3. `hosting-cf` を `main` に merge して push (ユーザーの承認後) → Workers Builds が `main` を build + deploy。Deployments で成功を確認し、workers.dev で smoke (HTML のみ、D-213)。
4. Settings → **Domains & Routes** → Add → **Custom domain** = `itlearn.bojiangz.com`。zone `bojiangz.com` が Cloudflare の DNS にあることが条件。既存の Vercel 向け DNS record があると追加できないので、その record を外してから追加する (外した値は控えておく = 戻し用)。
5. 切替後: `prod-smoke` を `itlearn.bojiangz.com` に向けて実行。所有者は新しい `OWNER_KEY` で `/api/owner?key=…` を 1 回開き直す (H1-1 の hint cookie、旧 key は無効)。
6. WAF の rate limit (§4-4)。Web Analytics を使うなら site を作り `CF_WEB_ANALYTICS_TOKEN` を build variable に入れて再 build。
7. Vercel は 7 日程度残す (その間 Vercel 側は noindex、PLAN H7)。問題がなければ Vercel project を停止。

---

## 7. 確認済みの事項と、最初の実 build で確かめること

### 7-1. local での CI 模擬 (2026-11-12、writer の実測)

条件: 現 branch の clean worktree (`.env*` なし、IPA 原本なし)、空の HOME・空の pnpm store・空の puppeteer cache、`CI=true WORKERS_CI=1 PUPPETEER_SKIP_DOWNLOAD=true`。手元の Mac (Apple Silicon) で、**Node は 26.13.0** (24.22.1 は手元で用意できず未検証)。

| 段 | 時間 |
|---|---|
| `pnpm install --frozen-lockfile` (cold store、903 package) | 23 s |
| `pnpm build:cf` (関門 + v2-corpus + export build + 走査) | 55 s |
| `npx wrangler deploy --dry-run` | 3 s |
| 計 | 81 s |

- 結果: 関門 PASS、v2-corpus 5/5、`out/` 16,194 ファイル、走査 PASS (a・b・d・e = 0、c = skipped)、dry-run の binding は **`env.ASSETS` だけ** (Worker 235 KiB / gzip 38 KiB)。puppeteer は download を飛ばし cache は空のまま。
- `out/` は local の通常 build と同じ 16,194 パス (`_next/` を除く 15,789 パスは名前が完全一致。別の local build では `_next/` が 1 ファイル多い 16,195 だった — turbopack の chunk 分割の揺れと見られ未特定、上限 20,000 には影響なし)。wrangler dry-run は「Read 16229 files」と表示 (走査の数より 35 多い、理由は未確認)。build id を含まない 989 ファイル (`data/`・図・`_headers`・`_redirects`・sitemap 等) はバイト一致。build id を含む 14,800 ファイルは build id をそろえると 14,766 が一致、残り 34 は RSC payload の行順の違い (HTML 17 は表示テキスト一致)。

### 7-2. 所要時間と Free の上限

- Cloudflare の build 機は手元より遅いと見て 2〜4 倍、さらに clone と実 upload を足す。毎回 build id が変わるので HTML/TXT の約 14,800 ファイルが毎回 upload される (H4 の local deploy は全 16,159 ファイルで 89 s)。**見積 1 build ≈ 5〜8 分** (上限 20 分に対して余裕あり)。
- 月 3,000 分 ÷ 約 8 分 ≈ **月 370 build 程度**。app に関わる push を 1 日 10 回しても月 300 回弱で収まる。docs だけの commit は数えない (§2-3)。同時 1 本なので連続 push は順番待ちになる。

### 7-3. 最初の実 build (Git 起動) で確認すること

build log と dashboard で 1 つずつ確認する。

1. **Node の版**: log に Node 24.22.1 が使われていること (`.node-version` が root directory で読まれたか)。違えば build variable `NODE_VERSION=24.22.1`。
2. **pnpm の版**: install の最後の行が `using pnpm v11.1.3` であること。`SKIP_DEPENDENCY_INSTALL=1` のとき pnpm 自体が用意されるか未確認 — `pnpm: not found` なら build command の先頭に `corepack enable && ` を足す (Node 24 は corepack 同梱)。
3. **自動 install が止まっていること** (`SKIP_DEPENDENCY_INSTALL`)、puppeteer の行が `Skipping downloading browsers` であること。
4. **Linux 用の native package**: lockfile には `@next/swc-linux-x64-gnu`・`lightningcss-linux-x64-gnu`・`@tailwindcss/oxide-linux-x64-gnu`・`@img/sharp-linux-x64`・`@esbuild/linux-x64`・`@cloudflare/workerd-linux-64`・`@rolldown/binding-linux-x64-gnu` が載っている (手元は macOS なので実際の install は未検証)。
5. **関門の log**: `lang-leak gate: PASS`、v2-corpus 5 passed、`RULE (c) SKIPPED` の 2 行、走査の `"pass": true`。
6. **deploy の log**: binding が `env.ASSETS` だけ。Settings → Variables & Secrets の secret 3 件が残っていること。
7. **watch paths**: 次の docs だけの commit で build が起きないこと、`docs/` の深い階層 (例 `docs/phase5/…`) も `docs/*` で除外されること。
8. **所要時間**: dashboard の build 時間を記録し、§7-2 の見積と比べる (月の消費量の見直し)。
9. Observability が オフ のままであること (§4-1)。

---

## 8. 戻し方

| 状況 | 戻し方 |
|---|---|
| 新しい deploy が壊れている (Worker) | dashboard → **Workers & Pages** → `itlearn` → **Deployments** → 戻したい version の「…」→ **Rollback** (CLI: `pnpm exec wrangler rollback [version-id]`、直近 100 version から選べる)。docs: binding 先の資源 (Upstash 等) は変わらない。static assets も同じ version に戻るかは docs に明記が無い → 初回の rollback 時に HTML の build id で確認。その後、原因の commit を `git revert` して push (次の build で正しい版が出る) |
| build が失敗した | deploy されないので現行 version のまま。log を見て直して push |
| H7 の後、Cloudflare 側で解決できない (Vercel を残す 7 日間) | Worker の custom domain `itlearn.bojiangz.com` を外し、DNS を控えておいた Vercel 向け record に戻す。Vercel では控えた production deployment が使われていることを確認 (違えば Instant Rollback でそれに戻す) |

緊急時に Workers Builds が使えない場合だけ、手で deploy する (H3 §9-5 の 1〜2)。clean worktree には gitignore の IPA 原本 (`data/ip/exams`・`sources`・`syllabus`) が無く `check:release` が必ず exit 2 になるので、次の順で行う (S154 Rule D MEDIUM-1):
1. 主 checkout で、deploy する commit に対して `cd apps/web && pnpm check:release` を通す (規則 (c) 込み)。
2. `.env.local` の無い clean worktree (同じ commit) で `cd apps/web && pnpm build:cf && CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV=false pnpm exec wrangler deploy`。1 と 2 の commit が同じことを `git rev-parse HEAD` で確かめる。

Rollback と static assets: rollback ページには assets の扱いが書かれていないが、static assets の gradual rollouts ページは「version ごとに asset の file 名が異なる」と書き、問題時は前の version に戻すよう勧めている → assets は version に付いて戻ると読める (傍証)。初回の rollback 時に HTML の build id で確かめる。
