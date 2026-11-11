# D-217 — 配信方式: 止血 → 静的化 → Cloudflare (静的出力 + 小 Worker) (OQ-21 の処置)

- 状態: **LOCKED** (2026-11-11 Session 154、ユーザー「同意，按照你的建议来」→ Claude 推奨案)
- 関連: OQ-21 (本決定で CLOSE)、D-212 (docs のみは build しない)、D-213 (本番確認は HTML smoke)、D-148 (owner gate)、D-206 (自動投入)、D-110 (TypeScript のみ)
- 部分 supersede (第 2 段の完了時): D-212 の `vercel.json` ignoreCommand、D-213 の確認対象ホスト、S131 の IPA 漏洩 gate の定義 (`.nft.json`)。完了までは現行のまま有効。

## 背景
Vercel Hobby の告警 (2026-11-11): Fluid Active CPU 4 時間の 90%。超過すると project が停止する。

実測 (S154、ダッシュボード Usage、**直近 30 日の移動窓** 10-11〜11-10):

| 項目 | 使用 | 上限 |
|---|---|---|
| Fluid Active CPU | 3h 36m | 4h |
| CDN Requests | 883K | 1M |
| Fast Origin Transfer | 7.82 GB | 10 GB |
| Function Invocations | 614K | 1M |

- 関数呼出 / 日 (`/v2/usage`): 10 月中旬 100〜200 → 10-28 116K、11-02 70K、11-06 63K、11-08 68K → 11-09 以降 4〜5K。
- 山の内訳: (a) 当方の旧 prod Playwright (cache hit が多い日、D-213 で廃止済)、(b) HTML のみを取る自動取得 (11-08 は毎時 約 4,300 件で一定)。
- Firewall の直近 24 時間: User-Agent 上位 = MJ12bot 1.7K / HeadlessChrome 422 / SERankingBacklinksBot 419 / node 318 (当方の prod-smoke) / SemrushBot 203。`/robots.txt` と `/ja/robots.txt` への要求あり (robots は無く、middleware が `/ja/robots.txt` へ転送して 404 を毎回描画していた)。Bot Protection = Inactive。
- コード側の原因: `[locale]` 配下 12 route が `force-dynamic` (owner cookie `itp_owner` の読取と一部 `searchParams`)。middleware が全ページ要求で走り、Vercel では middleware も Active CPU に計上される。クロール面が広い (過去問 2,900 × 3 言語、browse の query 付き URL)。

## 決定
3 段で進める。各段は前の段が本番で確認できてから始める。

### 第 0 段 — 止血 (S154、即時)
1. `apps/web/public/robots.txt` を置く: 検索エンジンには本文を開く (textbook・glossary・過去問は許可、ユーザー方針「Google に索引されたい」)。`*` は api・個人ページ (record / settings)・セッション URL (`/{locale}/practice?…` = 取得のたびに新しい seed / run へ転送され上限が無い、`/{locale}/mock/run`) を Disallow。`/practice`・`/practice/q/<id>`・`/practice/browse/<topic>` は許可。被リンク / SEO 監査系クローラ (MJ12bot・SemrushBot・SERankingBacklinksBot 等 7 UA) は全面 Disallow — **第 2 段の完了まで**の一時措置で、静的配信になったら外す。
2. middleware の matcher から `robots.txt` を外す (静的ファイルとして返し、関数も middleware も動かさない)。
3. Vercel Firewall: robots を守らない取得が残る場合に限り、User-Agent 指定の拒否 rule を足す。Bot Protection の一括 challenge は当方の prod-smoke (UA `node`) を止めるおそれがあるため既定では使わない。
4. 本番への Playwright 実行は引き続き禁止 (D-213)。移動窓のため、10-26〜11-08 の山が抜ける 11 月下旬までは投入回数も絞る。

### 第 1 段 — 動的要因の除去 (Vercel 上で実施・計測)
1. owner 判定を server の cookie 読取から client 側 (小さな endpoint への問い合わせ) へ移し、ページから `cookies()` を無くす。
2. `searchParams` に依存する route は client 側で query を読む形にする。
3. `sitemap.xml` を出す (索引のため)。正規 URL のみ (query 付き URL は入れない)。`/practice/mistakes` は `robots: { index: false }` (個人ページ、crawler には空の一覧)。
4. `force-dynamic` を外し、`generateStaticParams` で事前生成する (textbook 単元・一覧、glossary、today、practice の入口)。
5. middleware を `/` の locale 転送と `?owner_key=` だけに絞る。
6. 効果は同じ計器 (Fluid Active CPU、Function Invocations) で確認する。

### 第 2 段 — Cloudflare へ移設 (静的出力 + 小 Worker)
1. Next.js `output: 'export'` で静的出力し、Cloudflare Workers の静的 asset として配信する (asset 要求は無料・無制限で Worker を起動しない)。
2. 実行時の fs 読取 8 モジュールを build 時の読取へ移す。
3. 過去問詳細・用語詳細は 1 ページずつ事前生成しない: ページの殻 + 取得する JSON 分割 (Free は 20,000 ファイル / version。2,900 題 × 3 言語 × 2 ファイルだけで 17,400)。
4. API 4 本 (`learning` / `quiz/feedback` / `quiz/questions` / `sensei/terms`) + owner endpoint を 1 つの Worker にする。学習記録の Upstash Redis REST はそのまま使う。Worker は 1 要求 CPU 10 ms の範囲に収める (大きな JSON を要求ごとに parse しない)。
5. 付随: CSP を `_headers` 相当へ移す / `@vercel/analytics`・`@vercel/speed-insights` を外す / IPA 漏洩 gate を新しい出力物に対して定義し直す / D-206 自動投入・D-212・`prod-smoke.mjs` を新ホストへ合わせる / 独自ドメインの切替は最後、Vercel 側は切替確認後まで残す。

各段の開始時に PLAN (`docs/phase5/PLAN_hosting_migration.md`) を起こし、Tier 3 の evidence / failures / Rule D を適用する。第 1 段・第 2 段の設計細目は D-019 に従い開始時に問いから始める。

## 却下
- **OpenNext で Cloudflare に SSR のまま移設**: Free は 1 要求 CPU 10 ms・100,000 要求 / 日。事前生成ページも Worker 経由 (incremental cache) と読め、数 MB の JSON を parse する SSR は収まらない見込み。実行時に repo の fs が無い。
- **vinext**: Cloudflare 推奨だが beta。
- **Vercel のまま静的化だけ**: 第 1 段として採用するが終点にはしない。4 時間の枠と middleware の計上は残り、当方の投入でも枠を使う。
- **Vercel Pro (有料)**: ユーザー方針 = 無料が望ましい、他 project は Cloudflare。
- **Bot Protection の一括有効化のみ**: 当方の prod-smoke を止めるおそれ、原因 (動的描画) は残る。

## 根拠 (2026-11-11 取得)
- Cloudflare Workers limits / static assets billing / Builds limits / pricing (developers.cloudflare.com): Free = CPU 10 ms、100,000 要求 / 日、Worker 64 MiB (非圧縮)、20,000 ファイル / version・25 MiB / ファイル、asset 要求は無料・無制限、Builds 3,000 分 / 月・同時 1。
- OpenNext Cloudflare (opennext.js.org/cloudflare、/caching)、Cloudflare Next.js guide。
- Vercel Fluid compute pricing、Active CPU の最適化 guide (middleware も Active CPU 計上)。
- Next.js static exports (cookies / proxy / headers / redirects / Request 依存 Route Handler / `generateStaticParams` 無しの動的 route は不可)、middleware matcher の例 (`robots.txt` を除外する形)。
