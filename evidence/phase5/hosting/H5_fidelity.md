# H5 — 静的版 (out/) と現行版 (main、server 描画) の本文一致 (Rule A) + local の Playwright 全体 + 関門

> PLAN_hosting_migration.md §2 H5 / §5 (textbook 全件 diff + 他ページ 30 件 = 10 / 言語)。
> 機械比較の全結果: `H5_fidelity.json`。比較に使った道具 (再実行用): `H5_tools/`。
> 実施: S154、executor (opus)。preview / production / workers.dev には一切触れていない。

## 結論

- **real regression 0 件**。textbook 735 ページ (244 単元 × 3 言語 + 目次 3) と抽出 30 件 (+ 補足 27 件) の差分はすべて「設計どおり (expected)」に分類できた。分類できない差分 0。
- 本文の差はすべて **L4 の内容修正** (main は L4 より前の 1956a486) に由来する。証明: main の**コード**に hosting-cf の `data/ip`・`apps/web/messages` を載せて build し直した対照 (基線 2) では、差のあった textbook 120 ページ・抽出 39 件・記録入り 12 件・解答後 9 件の本文差が **すべて 0**。
- Playwright 全体 (local 静的配信 :3150 + Worker + fake Upstash): **159 passed / 0 failed / 2 skipped** (flaky 0)。
- 関門: tsc 0 errors、lint 0、vitest 133 files / 1,496 passed、`scan:out` PASS、`lang-leak-scan --gate` PASS。

## 1. 構成

| 役 | 中身 |
|---|---|
| 基線 1 (現行版) | `git worktree add /Volumes/DevSSD/Project/itp-h5-main main` (main = 1956a486)。`PUPPETEER_SKIP_DOWNLOAD=true pnpm install --frozen-lockfile` → `next build --turbopack` → `next start -p 3160 -H 127.0.0.1`。`.env.local` は置かない (KV_* / OWNER_KEY も env から外して起動)。公開ページは全て描画できた |
| 基線 2 (対照) | 同じ worktree で `git checkout hosting-cf -- data/ip apps/web/messages` → build → `next start :3160`。L4 の内容変更を差し引くための対照。比較後 `git checkout main -- data/ip apps/web/messages` で戻し、基線 1 を build し直して抽出を再実行 |
| 候補 (静的版) | hosting-cf 87c8c2d6 で `pnpm build` (fresh、`out/` 16,195 ファイル) → `node scripts/local-cf.ts --out out --port 3150 --api http://127.0.0.1:3152` |
| Worker | **`wrangler dev` は本 step で禁止**のため、`worker/index.ts` を esbuild で bundle し Node の http に載せた (`H5_tools/worker-node.mjs`、:3152、env は fake: `OWNER_KEY=local-owner-key`、`KV_REST_API_URL=http://127.0.0.1:3161`)。workerd ではなく Node の V8 で動く点が H3 §9-4 との差 (handler のコードは同一) |
| fake Upstash | `node scripts/fake-upstash.ts --port 3161` |

- **data の扱い (指示との差)**: 指示は「main checkout の `data/` を symlink で読み取り専用に見せる」だったが、app が読む `data/ip/quiz`・`data/ip/textbook` は git 管理下 (718 ファイル) で worktree に main の版が出る。gitignore の `data/ip/exams|sources|syllabus` 等は main の runtime が読まない (next.config.ts の除外対象) → **symlink は不要**で、main の data をそのまま使った (= 本当の現行版の内容)。書き込みが無いことの確認: 作業前に scratchpad に marker を作り、終了後 `find data -newer marker -type f` = **0 件** (main checkout)。worktree の `git status --short` も終了時 0 件。
- port: 3150 / 3152 / 3160 / 3161 のみ (3000 不使用)。全て PID で停止し、`lsof` で空きを確認済。

## 2. 比較の方法

- Playwright chromium、viewport 1280×900、locale ja-JP。各ページを両側で読み込み 2 つの mode で抽出:
  - **js** (hydration 後): `load` 後、network が 600 ms 静かになるまで待つ (上限 12 s、抽出 30 件は最低 1.2 s)。
  - **nojs** (`javaScriptEnabled:false` = 生 HTML の本文)。
- 本文 = `<main>` 内の text node を順に (script / style / noscript / template を除く、空白を 1 個に正規化、空は捨てる)。chrome = `<main>` 外の body。text node 列で LCS diff (hunk) + 全連結の一致 (`mainJoinedEqual`、分割位置だけの差を見分ける)。meta (title / canonical / robots / description / hreflang / 外部 script / status / 最終 URL) も比較。
- main 側の `/_vercel/insights|speed-insights` は local では落ち着かない (middleware が `/ja/_vercel/…` へ転送し続ける) ため両側で abort した (候補側には元から無い)。
- 分類 (`H5_tools/classify.mjs`): 単元 JSON・`unit_index.json`・`messages/<locale>.json` が main..hosting-cf で変わっていて、削除側の文字列が main の源に、追加側が branch の源に存在 → `expected:L4`。文字列照合で置けなかったものは目視して手で分類 (下表)。最終的に未分類 0。

## 3. textbook 全件 (244 単元 × 3 言語 + 目次 3 = 735 ページ)

単元一覧は `out/ja/textbook/*.html` (244) と main の `unit_index.json` (244) が完全一致。

| 項目 | js | nojs |
|---|---:|---:|
| 本文 text node 列が完全一致 | 615 / 735 | 615 / 735 |
| 本文の全連結が一致 (分割位置だけの差を含む) | 728 / 735 | 728 / 735 |
| chrome 一致 | 735 / 735 | 3 / 735 |
| 取得失敗・status 差 | 0 | 0 |

差のあった 120 ページ (zh 76・en 44・**ja 0**) の hunk 分類:

| 分類 | js | nojs | 説明 |
|---|---:|---:|---|
| expected: L4 内容 (同文、分割位置のみ) | 192 | 192 | L4-c の `[[jp:]]` 付け (例 zh「封装在日语里叫“カプセル化”」の カプセル化 が別 span に)。全連結は一致 |
| expected: L4 内容 (文言の変更) | 43 | 43 | L4-b の zh 日本語語彙置換・en の hook 修正等。削除側 = main の源、追加側 = branch の源に存在 |
| expected: L4 内容 (手で分類) | 1 | 1 | zh/strategy-05-14-u05 の見出し「个人番号（My Number）」→「个人编号（My Number）」: term_zh (cade606e) から合成される文字列で単純照合に掛からない |
| expected: meta.title (手で分類) | 1 | 1 | zh/strategy-02-05-u03 の title「我的编号法」→「个人编号法」(unit_index.json の title_zh、L4) |
| expected: chrome (nojs のみ) | — | 732 | main の streaming SSR が LocaleSwitcher (日 / 中 / EN) を fallback と `<div hidden id="S:0">` の 2 回出力、静的版は fallback 1 回 (`BAILOUT_TO_CLIENT_SIDE_RENDERING`)。表示は同じ、JS 有りでは一致 |
| real regression | **0** | **0** | |

- **基線 2 (main のコード + branch の内容) との再比較**: 差のあった 120 ページ全てで js・nojs とも本文完全一致、js の chrome 一致、title 差 0。→ 本文差は全部 L4 由来で、配信方式 (D-217〜D-225) による本文の変化は 0。

全ページ共通の meta 差 (全て expected):
- canonical / hreflang: 候補のみにある (`https://itlearn.bojiangz.com/...`、ja/zh/en/x-default) — H1-5 (PLAN §2 H1 項 5、0ddfbbae)。
- 外部 script: main の `/_vercel/insights/script.js`・`/_vercel/speed-insights/script.js` が候補に無い — D-220 (Vercel analytics 除去)。**Cloudflare beacon は token 未設定の local build では出ない**ので本 step では未確認 (H4 preview / H7 で確認する項目のまま)。

## 4. 抽出 30 件 (seed 20261115、10 / 言語) + 補足

抽出 (`H5_tools/sample.mjs`): 各言語で today / 練習入口 / 模試入口 / 用語一覧 / 用語詳細 (1,395 から 1) / browse 一覧 / browse 詳細 (63 topic から 1) / 記録 / 設定 / AI 先生。補足 (30 件の外): 問題詳細 ×2・練習 session (`?ids=` 3 題、順序固定) ×1 / 言語。

判定は 3 層: (a) 本文の機械 diff (基線 1・基線 2)、(b) viewport の screenshot を両側で取り byte 比較、(c) 候補の screenshot を contact sheet (`H5_tools/sheet-{ja,zh,en}.png`) で 1 枚ずつ目視。

| # | id | path | js 本文 vs 基線 1 | 差の分類 | vs 基線 2 | 画像 byte 一致 (基線 2) | 目視 | 判定 |
|---|---|---|---|---|---|---|---|---|
| 1 | ja-01-today | /ja | 一致 | — | 一致 | 一致 | 今日の学習・3 用語・進み具合 | PASS |
| 2 | ja-02-practice-entry | /ja/practice | 一致 (nojs は差: 下注 ※1) | ※1 | 一致 | 一致 | 出題範囲・分野一覧 | PASS |
| 3 | ja-03-mock-entry | /ja/mock | 一致 | — | 一致 | 一致 | ランダム 100・過去 1 回分 | PASS |
| 4 | ja-04-glossary-list | /ja/glossary | 一致 | — | 一致 | 一致 | 用語集 1395・検索欄 | PASS |
| 5 | ja-05-glossary-detail | /ja/glossary/t4421b847a515456c | 一致 | — | 一致 | 一致 | 業務監査・関連過去問 8 | PASS |
| 6 | ja-06-browse-list | /ja/practice/browse | 一致 | — | 一致 | 一致 | 分野・年度表 | PASS |
| 7 | ja-07-browse-detail | /ja/practice/browse/technology-19-51 | 一致 | — | 一致 | 一致 | インタフェース設計・問題表 | PASS |
| 8 | ja-08-record | /ja/record | 一致 | — | 一致 | 一致 | 空の記録 (0 / 2900) | PASS |
| 9 | ja-09-settings | /ja/settings | 一致 | — | 一致 | 一致 | 試験日・上限・表示言語 | PASS |
| 10 | ja-10-sensei | /ja/sensei | 一致 | — | 一致 | 一致 | API key 欄・会話一覧 | PASS |
| 11 | zh-01-today | /zh | 差 3 hunk | L4 (正答率→正确率、分野→大类: L4-a 06453728・73ef1646) | 一致 | 一致 | 今天的学习 | PASS |
| 12 | zh-02-practice-entry | /zh/practice | 差 2 | L4 (分野→大类) + ※1 | 一致 | 一致 | 练习・出题范围 | PASS |
| 13 | zh-03-mock-entry | /zh/mock | 差 1 | L4 (三分野→三大类) | 一致 | 一致 | 模拟考试 | PASS |
| 14 | zh-04-glossary-list | /zh/glossary | 差 2 | L4 (我的编号法・个人番号 → 个人编号…) | 一致 | 一致 | 术语表 | PASS |
| 15 | zh-05-glossary-detail | /zh/glossary/tf0854d5a1ad8f57b | 一致 | — | 一致 | 一致 | レコード・相关真题 12 | PASS |
| 16 | zh-06-browse-list | /zh/practice/browse | 差 2 + title | L4 (按分野→按大类、title も) | 一致 | 一致 | 按大类・年度浏览 | PASS |
| 17 | zh-07-browse-detail | /zh/practice/browse/technology-19-50 | 差 2 | L4 (分野→大类、正答率→正确率) | 一致 | 一致 | 情報デザイン・问题表 | PASS |
| 18 | zh-08-record | /zh/record | 差 2 | L4 (正答率→正确率) | 一致 | 一致 | 学习记录 | PASS |
| 19 | zh-09-settings | /zh/settings | 一致 | — | 一致 | 一致 | 设置 | PASS |
| 20 | zh-10-sensei | /zh/sensei | 一致 | — | 一致 | 一致 | AI 老师 | PASS |
| 21 | en-01-today | /en | 一致 | — | 一致 | 一致 | Today's study | PASS |
| 22 | en-02-practice-entry | /en/practice | 一致 (nojs ※1) | ※1 | 一致 | 一致 | Practice・Scope | PASS |
| 23 | en-03-mock-entry | /en/mock | 一致 | — | 一致 | 一致 | Mock exam | PASS |
| 24 | en-04-glossary-list | /en/glossary | 一致 | — | 一致 | 一致 | Glossary | PASS |
| 25 | en-05-glossary-detail | /en/glossary/t2bc131d4d821a7d5 | 一致 | — | 一致 | 一致 | MACアドレス | PASS |
| 26 | en-06-browse-list | /en/practice/browse | 一致 | — | 一致 | 一致 | Browse by field or exam | PASS |
| 27 | en-07-browse-detail | /en/practice/browse/technology-18-49 | 一致 | — | 一致 | 一致 | ハードウェア・Questions | PASS |
| 28 | en-08-record | /en/record | 一致 | — | 一致 | 一致 | Learning record | PASS |
| 29 | en-09-settings | /en/settings | 一致 | — | 一致 | 一致 | Settings | PASS |
| 30 | en-10-sensei | /en/sensei | 一致 | — | 一致 | 一致 | AI Tutor | PASS |

**30 / 30 PASS** (vs 基線 1 の js 本文: 一致 23、L4 由来の差 7; vs 基線 2: 30 / 30 一致)。

補足 (30 件の外、全て PASS):

| id | path | 結果 |
|---|---|---|
| ja/zh/en-x1・x2 問題詳細 (6) | /ja/practice/q/2010h22a-q052 ほか (`samples-paths.json`) | js 本文一致 (基線 1・2)、画像 byte 一致。詳細ページは解説を初めから表示 (D-223 A′ の詳細 HTML) |
| ja/zh/en-x3 練習 session (3) | /ja/practice?ids=2013h25a-q052,2011h23tokubetsu-q019,2026r08-q081 ほか | js 本文一致、画像 byte 一致 (nojs は ※1) |
| **記録入り** (12) | today / 練習入口 / 記録 / session × 3 言語、同じ `itp:learn:v2` (15 題の解答 + 読了 2 単元、`H5_tools/genseed.ts`) を両側に init script で注入 | js 本文: 基線 1 と 9 / 12 一致、差 3 件は zh の L4 文言 (正答率→正确率・分野→大类); 基線 2 と 12 / 12 一致 |
| **解答後** (9) | 問題詳細 ×2・session ×1 / 言語で key「1」(= ア) を押し、解答欄が出てから解説の取得を待って抽出 | 基線 1・2 とも 9 / 9 本文一致。session では解説 (静的版は `/data/**` の解説 shard から取得) が両側同一 (H1-2 attempt 1 の失敗箇所)。問題詳細は参照表示で押下は何も記録しない (仕様どおり、両側同じ) |

※1 **expected (D-217 H1-3)**: 練習の入口と session は query 依存の処理を browser 側に移したため、静的 HTML (nojs) は読込 1 行 (「問題を読み込んでいます…」/「正在读取题目…」/「Loading the questions…」) だけ、main は server が全体を描画。JS 有り (hydration 後) は完全一致。H1-3 LOW-3 で受容済 (Googlebot は JS を実行)。この型の nojs 差は 12 件 (抽出・補足 6 = 練習入口 3 + session 3、記録入り 6 = 同じ組合せ)。他に nojs の chrome 差 4 件 (問題詳細) は §3 と同じ LocaleSwitcher の streaming 二重出力。
※ 記録 (`/record`) は main でも client 描画 (nojs は両側とも見出しのみ) で、nojs 差なし。

## 5. Playwright 全体 (local 静的配信)

- 実行: `PLAYWRIGHT_BROWSERS_PATH=~/Library/Caches/ms-playwright E2E_OWNER_KEY=local-owner-key PLAYWRIGHT_BASE_URL=http://127.0.0.1:3150 npx playwright test` (chromium、workers 1、retries 1)。base URL は必ず local を指定 (config の既定は production のため)。
- 結果: **159 passed / 0 failed / 2 skipped / flaky 0** (2.5 分)。
  - skipped 2 = `textbook.spec.ts:109`・`:271` (v1 単元・幅広 v1 図が残っていない条件 skip、H1-5 と同じ)。
  - spec 別 passed: csp 16・detail-navigation 6・fonts 2・glossary 7・**learning-owner 9**・learning 6・legacy-links 10・mobile 4・mock 21・practice 14・record 3・sensei 23・settings 3・textbook 11・today 4。
- H1-5 (147 passed / 1 failed / 2 skipped) との差: H1-5 の失敗 `learning.spec.ts:209` (/api/learning 403) は Worker が無かったため → 今回は Worker ありで PASS。+9 = `learning-owner.spec.ts` (E2E_OWNER_KEY 指定で対象に入る、H3 で追加の feedback 実 POST を含む)、残り +2 は H1-5 の最終全体実行の後に追加された test (detail-navigation の戻る / 進む 1 件を含む; 合計 161 = 150 + 9 + 2)。H1-1 LOW-4 (learning-owner / learning を必ず実行) を満たす。
- 配信 log (本 step 全体、比較の読込を含む 170,713 要求): 200 170,666 / 304 23 / 307 13 / 403 6 / 415 1 / 201 1 / 404 3 / 5xx 0。404 = `/nope` (手動の 404 確認)・`/ja/glossary/..%2Fx`・`/ja/glossary/t0000000000000000` (glossary.spec が 404 を期待)。**詳細 2 系統の `.txt` 要求 0**、`/_vercel/*` 0。Worker の log: `/api/owner` 307 ×13、`/api/learning` GET 200 ×2・403 ×4・PUT 200 ×1・403 ×2、`/api/quiz/feedback` GET 200・POST 201・415 各 1。
- 404 ページ (H1-5 carry): `/nope` → HTTP 404、`out/404.html` に `<meta name="robots" content="noindex">`。root layout 素通しの既定 not-found (Vercel と同じ見た目) を確認。

## 6. 関門

| gate | 結果 |
|---|---|
| `pnpm tsc --noEmit` | exit 0 (0 errors) |
| `pnpm lint` | exit 0 |
| `pnpm vitest run` | 133 files / **1,496 passed** / 0 failed |
| `pnpm build` (fresh) | exit 0、`out/` 16,195 ファイル |
| `pnpm scan:out` | `"pass": true` (exit 0) |
| `node --no-warnings scripts/lang-leak-scan.ts --gate` | `lang-leak gate: PASS` |

## 7. 本 step で確認できなかったこと・残り

- Cloudflare Web Analytics beacon (token 未設定の local build) → H4 preview / H7。
- Worker は Node の V8 で動かした (workerd ではない)。workerd での挙動は H3 (wrangler dev) と H4 preview で確認済。
- PLAN H5 の残り: preview への `prod-smoke`、所有者の同期を実機で 1 回、Rule D (verifier opus + 別 subagent の preview 挙動) — 本 step (local) の範囲外。

## 8. 失敗・やり直し (Rule B)

- 記録: `failures/phase5/hosting/step_H5_attempt_1_compare_timeout.md`。

- 比較の 1 回目 (textbook、`networkidle` 待ち) は main 側が `/_vercel/*` の転送で network が静かにならず全件 45 s timeout になる見込み (25 件 / 数分) と分かり中止 → `/_vercel/**` を両側で abort + 自前の静穏判定に変更して再実行。比較道具の不具合で、製品コードの失敗ではない。
- 試行用の 3 ページ比較で nojs の抽出が 0 件になった (JS 無効の page では TreeWalker の filter callback が呼ばれない) → filter を使わない走査に変更。同上。
