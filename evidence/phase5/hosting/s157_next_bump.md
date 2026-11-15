# S157 — Next 15.5.18 → 15.5.29 + 未使用 `public/*.svg` 5 個の削除

> 出典: S154 H3 の carry (依存監査: Next 15.5.18 の critical 3、修正版 ≥ 15.5.28) と H5 の任意項目 (create-next-app 由来 svg 5 個)。
> 比較の全結果: `s157_out_compare.json`、道具: `s157_tools/cmp-out.mjs`。

## 1. 変更
| 対象 | 前 | 後 |
|---|---|---|
| `next` | 15.5.18 | **15.5.29** |
| `eslint-config-next` | 15.5.18 | 15.5.29 |
| `@next/eslint-plugin-next` | ^15.5.18 | ^15.5.29 |
| `pnpm-lock.yaml` | — | 59 行 / 59 行。新規・削除の package 項目は next 系 (`next`・`@next/env`・`@next/swc-*`・`@next/eslint-plugin-next`・`eslint-config-next`) のみ。他は既存版への参照の付け替え (`@emnapi/runtime` 1.10.0 → 1.11.3、`semver` 7.8.0 → 7.8.6、どちらも HEAD の lockfile に既にある版) |
| `apps/web/public/{file,globe,next,vercel,window}.svg` | 5 個 | 削除 (repo 全体で参照 0: `src` `e2e` `worker` `scripts` `messages` CSS を grep、`outScan.test.ts` の fixture だけ) |
| `src/lib/export/outScan.ts` | `public svg` の名前許可 rule | rule を削除 → 再び現れたら走査 (a) で finding |
| `outScan.test.ts` | `vercel.svg` を許可側 fixture に | 拒否側 fixture に移動 |

版の選択: 15.5.28 (2026-10-14、critical 1 + high 1) と 15.5.29 (2026-11-03、moderate 3) はどちらも security 修正だけの patch で、監査の `next` 項目はどちらでも全て消える。15.5.29 は 15.5.28 の修正を含み、追加分も security のみ (release notes で確認) なので 15.5.29。

## 2. 出力の比較 (`out/` 前後、Rule A 相当)
- 前 = HEAD (`b356abd8`) の `pnpm build`、後 = 本変更の `pnpm build:cf`。
- ファイル数 16,194 → **16,189** (差 = 削除した svg 5 個のみ、`onlyAfter` 0)。
- `_next/static/` 以外の共通 15,784 ファイル: byte 一致 984、正規化 (hash 付き asset 名・build id・RSC の module 番号 `I[n,`) 後に一致 15,760、残り **24** (12 頁 × html/txt)。
- 残り 24 の中身 (Rule D LOW-1 で訂正) = (1) RSC の重複排除で `NEXT_LOCALE` cookie object の実体を持つ行 (`$13:props:localeCookie` ⇄ `$15:…`) が入れ替わり、行の並びと `$L` 番号が変わった、(2) ja・zh の `practice/browse` で RSC の push 分割が 39 → 40 (+44 byte)。どちらも意味は同じ (審査側の独立比較で RSC の意味差 0)。**HTML の可見文字 (script/style/タグを除いた本文) の差 = 0 / 全 HTML**。12 頁は ja/zh/en の today・mock・sensei と一部の browse・mistakes で、言語ごとに揃っていない (en の browse・mistakes は一致) ので、版差ではなく流し出し順の揺れと判断。

## 3. 関門
| 関門 | 結果 |
|---|---|
| `pnpm build:cf` (gate:content + build + scan:out:ci) | exit 0、`Next.js 15.5.29 (Turbopack)` |
| `pnpm scan:out` (rule c を含む全走査) | exit 0、pass |
| tsc / lint | 0 / 0 |
| vitest | 132 files / 1,474 passed |
| local Playwright (:3150 静的 + :3152 Worker + :3161 fake Upstash) | §4 |

## 4. local Playwright
- 構成: H5 / local-e2e.sh と同じ 3 process (`scripts/local-cf.ts` :3150 が `out/` を配信、`worker/index.ts` の esbuild bundle を Node で :3152、`scripts/fake-upstash.ts` :3161)、`E2E_OWNER_KEY=local-owner-key`、`TEXTBOOK_E2E_UNITS` は既定 (試点 3 単元)。
- 結果: **158 passed / 0 failed / 2 skipped** (2.6 分、flaky 0)。同条件の `--list` = 160 tests / 16 files なので全件実行。終了後 3 port とも空き。

## 5. 依存監査 (`pnpm audit --prod`)
| | critical | high | moderate | low | 計 |
|---|---|---|---|---|---|
| 前 (15.5.18) | 3 | 13 | 10 | 1 | 27 |
| 後 (15.5.29) | **0** | 9 | 3 | 1 | 13 |

残り 13 = `next` 経由の build 時依存 (`postcss@8.4.31` 4、`sharp@0.34.5` 3 — next/image 不使用・static export、`nanoid` 2、`source-map-js` 1、`postcss-selector-parser` 1) と直接依存 (`zod` 1、`@ai-sdk/provider-utils` 1)。監査は clean ではない。件数は `--prod` の範囲 (dev 込みは 69、うち critical 1 = root の mermaid-cli 経由の dompurify、本変更と無関係)。`postcss@8.4.31`・`sharp@0.34.5` は next 15.5.x の固定版なので本範囲では消せない。zod / @ai-sdk は `src/lib/sensei/zodJitless.ts` があるため別に見る (新候補)。

## 6. Rule D
- verifier (opus、別 subagent) = **PASS** (HIGH 0 / MEDIUM 0 / LOW 5)、`s157_review.md`。独自比較 (`s157_review_tools/rv.mjs`・`rv2.mjs`) で共通 html/txt 14,802 件の `<head>`・tag/属性・可視文字・RSC の意味が同一、`_headers`・`_redirects`・sitemap・data・quiz-figures は byte 一致。旧 `out/` に新 scan をかけると svg 5 件だけが finding (逆向きの確認)。
- LOW-1 (差の説明) と LOW-3 (監査の範囲) は §2・§5 を訂正。LOW-2 (cmp-out.mjs の正規化が広い) は今回は審査側の比較で補完、再利用時は rv2.mjs を使う。LOW-4 (TypeScript 7 は 15.5.22 以降で拒否 → Next 16 と一緒に) は What's Next。LOW-5 (e2e は writer のみ) は writer の 158/0/2 を記録。
