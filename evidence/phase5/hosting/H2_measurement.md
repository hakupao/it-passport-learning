# H2 実測 — OQ-22 (過去問詳細・用語詳細の出し方) A / B

2026-11-11 S154、branch `hosting-cf`、H1-4 作業ツリー (未 commit) の上で計測。Next.js 15.5.18 `next build --turbopack`、`.next` を削除してから clean build。
**[実測]** はこの機械で測った数字、**[推定]** は実測値と Next のソースから計算した数字、**[未検証]** は H4 で確かめる項目。

## 1. 計測の方法

- A 版: `practice/q/[qid]` と `glossary/[termId]` の `force-dynamic` を外し、`generateStaticParams` (全 2,900 題、辞典の全 1,395 語) と `dynamicParams = false` を一時的に追加 → clean build → `.next/server/app` を数えた → 2 ファイルを commit 済みの状態へ戻した (`git diff` 差分 0 を確認) → H1-4 の状態で build し直した。
- `output: 'export'` はまだ有効にしていない (H1-5)。export 後の `out/` のファイル数は、`.next` の prerender 出力と Next のソースから推定した値。

## 2. build の実測 [実測]

| | H1-4 (詳細 2 系統は動的のまま) | A 版 (詳細も事前生成) |
|---|---|---|
| `next build` の時間 (`/usr/bin/time` の real、clean) | 9.7 s (再計測 10.2 s) | 20.0 s (n=1) |
| 生成したページ数 (`Generating static pages`) | 1,396 | 14,281 |
| `/[locale]` の HTML | 957 + `_not-found` 1 | 957 + 1 + q 8,700 + 用語 4,185 = 13,843 |

注: A 版の 1 回目の build は Google Fonts の取得失敗 (`next/font/google`、網路の一時的な失敗) で止まった。同じ内容で再実行して成功した。失敗の log は scratchpad に残してある。コードが原因の失敗ではない。

## 3. A 版で増えるファイル (`.next/server/app`) [実測]

| 系統 | `.html` | `.rsc` (export では `.txt`) | `.meta` | segment ファイル | HTML 合計 | RSC 合計 | 最大の 1 ファイル |
|---|---|---|---|---|---|---|---|
| `practice/q/[qid]` (2,900 × 3) | 8,700 | 8,700 | 8,700 | 0 | 486.8 MiB | 318.9 MiB | html 78 KiB / rsc 52 KiB |
| `glossary/[termId]` (1,395 × 3) | 4,185 | 4,185 | 4,185 | 0 | 183.0 MiB | 135.4 MiB | html 89 KiB / rsc 55 KiB |
| 他のページ (H1-4 の 957 + `_not-found`) | 958 | 958 | 959 | 0 | 106.8 MiB | 68.2 MiB | — |
| `/data/**` (H1-2) | — | — | 435 | — | body 435 個、37.5 MiB | | |

- 詳細ページ 1 枚の大きさ: 例 `ja/practice/q/2026r08-q001.html` は 59,740 B、gzip で 16,590 B。
- segment ファイル (`.segments/`) は 0。`clientSegmentCache` は無効。
- `.meta` は `next start` が使う。`output: 'export'` では出力されない。
- 配信元の他のファイル: `public/` 549 個 (内 `quiz-figures` 543 個、34 MiB)、`.next/static` 407 個 (12 MiB)。

## 4. `output: 'export'` の `out/` (サイト全体) [推定]

Next 15.5.18 の export が 1 ページあたりに出すもの (install 済みの `node_modules/next/dist/export/index.js` 642 行 = app page ごとに `<route>.txt`、659〜671 行 = `.segments` があるときだけ segment ファイル、`dist/export/routes/app-page.js` 98 行 = RSC を `.rsc` に書き、export でそれを `.txt` に写す; `dist/client/components/router-reducer/fetch-server-response.js` 99〜101 行 = 遷移時に URL へ `.txt` を付ける、117 行 = `text/plain` を Flight とみなす、123〜128 行 = それ以外か 200 でなければ `doMpaNavigation`):

- `<path>.html`: 本文。
- `<path>.txt`: RSC payload。client router の画面遷移と prefetch は、URL の末尾に `.txt` を付けて取りに行く。
- `__next.*.txt`: segment ごとの prefetch ファイル。`.segments` があるときだけ出る。今の設定では 0。
- `.txt` が無い場合: 応答が 404 か Flight 以外なので、router は `doMpaNavigation` で通常のページ読み込みに切り替える。画面遷移は壊れず、遅くなるだけ (全ページ再読込)。ソースで確認した。実際の動作は **[未検証]**。prefetch のたびに 404 の要求が出る (Workers では asset 要求なので無料)。

| | A (詳細も HTML) | A' (A から詳細の `.txt` を build 後に削除) | B (詳細 = locale ごとの殻 1 枚) |
|---|---|---|---|
| ページ (`.html`) | 13,843 | 13,843 | 957 + 1 + 殻 2 × 3 = 964 |
| RSC (`.txt`) | 13,843 | 958 | 964 |
| `/data/**` | 435 | 435 | 435 + 用語詳細用の新しい分割 約 48 (16 shard × 3、推定) |
| `public/` + `_next/static` + favicon 等 | 約 958 | 約 958 | 約 958 |
| **合計ファイル数** | **約 29,080** | **約 16,190** | **約 3,370** |
| Cloudflare Free の 20,000 ファイル / version に対して | **超過 (約 +9,080)** | 余り約 3,800 (19 %)。題目・用語が増えると減る | 余り約 16,600 (83 %) |
| 25 MiB / ファイルに対して | 最大 89 KiB、問題なし | 同左 | 最大は `/data` の題目ファイル (H1-2 で計測済み、上限より十分小さい) |
| 配置する容量 (非圧縮) | 約 1.35 GiB (HTML 777 MiB + RSC 523 MiB + data・public・static 84 MiB) | 約 0.91 GiB | 約 0.25 GiB |

## 5. 比較表

| 項目 | A: 詳細も HTML で事前生成 | B: browser で読む殻 1 枚 |
|---|---|---|
| ファイル数 (`out/` 全体) | [推定] 約 29,080 → **Free の 20,000 を超えて配置できない**。`.txt` を消す後処理 (A') をすれば約 16,190 | [推定] 約 3,370 |
| 内訳 q / 用語 | html + rsc: [実測] 17,400 / 8,370。export では `.rsc` が 1 対 1 で `.txt` になる [推定、上のソースによる]。A' では 8,700 / 4,185 | [推定] 3 + 3 の HTML と同数の txt。データは既存の `/data` (q は 0 個追加、用語は約 48 個追加) |
| 容量 | [実測] q html+rsc 805.7 MiB、用語 318.4 MiB | [推定] 増分は 1 MiB 未満 + 用語データ |
| build 時間 | [実測] 20.0 s、n=1 (H1-4 は 9.7 / 10.2 s、n=2) | [推定] 約 10 s (H1-4 と同程度) |
| 配置 (upload) 時間 | [未計測] 初回 約 1.35 GiB。wrangler は hash が同じファイルを送らないので、2 回目以降は変わったファイルだけになる | [未計測] 初回 約 0.25 GiB |
| SEO | 本文が HTML にあるので索引されやすい。題目 1 問ごとに title と本文がある | 本文は JS で描画される。Googlebot は JS を実行するが、title・meta を client で設定する必要があり、索引の速さと確実さは A より落ちる。他の検索エンジンには見えにくい |
| URL | 今と同じ `/xx/practice/q/<id>`、`/xx/glossary/<termId>` | 下の 6 節の方式による |
| 実装の手間 | 小 (`generateStaticParams` 2 か所)。ただし Free に収めるには A' の後処理が要り、画面遷移が通常読込になる (prefetch 404 も出る)。題目が増えると上限に近づく | 中: 殻のページ 2 つ、URL から id を読む処理、用語詳細のデータ (senses・図 SVG・関連題目) の新しい分割、title・canonical の client 設定、e2e の更新 |
| 内容を直したとき | 再 build → 変わったページだけ再配置 | 再 build → `/data` の変わったファイルだけ再配置 |

## 6. B の場合: static export で殻が URL から id を得る方法 [推定・未検証]

今ある内部 link: 単元ページ → 用語 (ja の単元 HTML だけで `/ja/glossary/t…` が 1,417 個)、用語詳細 → 過去問、領域ページ → 過去問、模試の結果 → 過去問、用語 chip → 用語。外部 (検索結果・被リンク) も `/xx/practice/q/<id>` 形式で来る。

| 方式 | 中身 | 既存 URL | 良い点 | 問題点 |
|---|---|---|---|---|
| B1 rewrite で殻を返す | 殻を別の path (例 `out/xx/practice/q-shell.html`) に置き、`_redirects` に `/xx/practice/q/* /xx/practice/q-shell 200` (locale × 2 系統 = 6 規則、dynamic 上限 100 内)。殻は `usePathname()` で id を読む | **変わらない** | link も索引もそのまま使える | Cloudflare docs (developers.cloudflare.com/workers/static-assets/redirects、2026-11-11 取得): 200 の proxy は自サイト内の相対 URL なら可、redirect は既存 asset より常に優先、splat は 1 個、static 2,000・dynamic 100 規則まで。したがって殻は rewrite 対象の外に置く必要がある (同じ path 配下だと自分も rewrite される)。`.txt` 要求も殻の HTML になり → 通常読込に切り替わる (動作はする)。存在しない id も 200 で返るので、殻の中で 404 表示と `noindex` が要る。**[未検証]** `/xx/practice/q-shell` 用に build した殻を別の URL で配ったとき、App Router が hydration 不一致や URL の差し替えを起こさないか (H4 で要確認、不可なら B2)。用語も同じ形 |
| B2 query | `/xx/practice/q?id=<id>` の 1 ページ | 変わる。`_redirects` で `/xx/practice/q/:id → ?id=:id` を 301 | rewrite が不要。static export でそのまま動く (useSearchParams + Suspense) | 正規 URL が変わる (索引の移し替え、canonical、robots の `practice?` 規則との整理)。全 link を書き換える |
| B3 hash | `/xx/practice/q#<id>` | 変わる (301 で `#` 付きへ) | サーバー側に何も要らない | fragment は索引されないので、詳細ページが検索から消える。採用しにくい |
| B4 混合 | ja だけ (または q だけ) A、他は B1 | 一部変わらない | SEO を ja に集中できる | 2 方式を保守する。ファイル数は ja の q で約 +5,800 |

## 7. 判断材料のまとめ

- A をそのまま採ると Free の 20,000 ファイルを超える ([推定] 約 29,080)。A を採るなら A' (`.txt` を消す後処理) が必須で、余りは約 3,800 しかない。Workers Paid でも 1 version 20,000 ファイルの上限は同じかどうかは確認していない (D-217 の根拠は Free の値)。
- B は余りが大きい ([推定] 約 3,370 / 20,000)。URL を変えないなら B1 (rewrite)。`_redirects` の 200 proxy は docs で可と確認済み、殻を別 URL で配ったときの hydration は [未検証]。
- upload 時間はこの機械では測れない (Cloudflare に配置していない)。H4 の preview で測る。
