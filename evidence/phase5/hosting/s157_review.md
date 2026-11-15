# S157 — Next 15.5.18 → 15.5.29 bump + public/ svg 削除: Rule D independent review

Reviewer: verifier lane (writer = 別 agent / main session)。読取りと実行のみ、書いたのはこのファイルだけ。commit / push / :3000 起動なし。
対象: HEAD b356abd8 に対する未 commit 作業ツリー (`apps/web/package.json`、`pnpm-lock.yaml`、`apps/web/public/{file,globe,next,vercel,window}.svg` 削除、`apps/web/src/lib/export/outScan.ts` + test)。

## Verdict: **PASS** (0 HIGH、0 MEDIUM、5 LOW)

## Checks (reviewer が新しく実行)

| # | check | command / method | result |
|---|---|---|---|
| a1 | lockfile の範囲 | `git diff pnpm-lock.yaml` を `15\.5\.(18\|29)` を含まない `+/-` 行だけに絞る | 残りは integrity 行 (next 系 12 package) と pointer 移動 4 行だけ: `@napi-rs/wasm-runtime` の `@emnapi/runtime 1.10.0→1.11.3`、`semver 7.8.0→7.8.6` ×3 (puppeteer の browsers / typescript-estree / is-bun-module)。package entry の追加・削除は next 系のみ |
| a2 | pointer の移動先が HEAD に既存か | `git show HEAD:pnpm-lock.yaml \| grep` | `@emnapi/runtime@1.11.3` (l.271/5492)、`semver@7.8.6` (l.4782/10310) とも HEAD に既にある。新規 package なし |
| a3 | integrity の正しさ | `npm view next@15.5.29 dist.integrity` | `sha512-93AMsz…gCluiw==`。lockfile と一致。`node_modules/next/package.json` version = 15.5.29 |
| b | svg 参照 | repo 全体 `grep -rnIE "(file\|globe\|next\|vercel\|window)\.svg"` (node_modules/.next/out/.git/data/.source/.wrangler 除外)。加えて `src/app` / `worker` / `next.config.ts` / `wrangler.jsonc` の `icons:` / `manifest` / `openGraph` / `.svg`、build 前後両 out/ の html/txt/js/css 全文 | 当たりは evidence / session log / 新 test fixture の言及のみ。layout に `metadata.icons` なし、app icon は `src/app/favicon.ico` のみ。両 out/ のどのファイルも 5 svg を参照しない。`public/` の残りは `quiz-figures/`、`robots.txt` |
| c0 | before/after の出所 | `_next/static` 内の version 文字列 | out_before = `15.5.18` のみ、apps/web/out = `15.5.29` のみ。比較対象は本物 |
| c1 | 件数 | `find -type f \| wc -l` | 16,194 → 16,189 (差 = 5 svg)、`_next/static` 405 → 405、hash を潰した static path の差は chunk 3 個の名前だけ |
| c2 | root / 非 HTML ファイル | `cmp`、`diff -rq -x _next` | `_headers`、`_redirects`、`sitemap.xml`、`robots.txt`、`favicon.ico`、`index.html` は byte 同一。`data/`、`quiz-figures/` 差 0。html/txt 以外で違うのは消えた 5 svg だけ |
| c3 | 24 差分 + 対照の抜取り (16 件) | reviewer 自作 `rv.mjs` (cmp-out.mjs 不使用): `<head>` の meta/title/link、script 外の全 tag 列 (属性込み)、可視テキスト、RSC 行 (`__next_f.push` を JSON.parse して連結 → 行 ID・`$L` 参照・`I[n,` を正規化してソート) | 全件 head 同一・tag 列同一・可視テキスト同一。24 差分側の実体は「RSC の行順」ではなく **重複排除の後方参照先**: `localeCookie: "$13:props:localeCookie"` ↔ `"$15:…"` (literal `{"name":"NEXT_LOCALE","sameSite":"lax"}` をどの行が持つかが入れ替わる)。browse ページは literal の位置が変わり +44 byte |
| c4 | 全ツリー意味比較 | `rv2.mjs`: 共通の html/txt **14,802 件全部**で、上記 RSC 正規化 + `localeCookie` 後方参照を literal に解決して比較。html は script を潰した markup 全体も比較 | RSC 意味差 **0**。markup 差 2 件 (`ja/zh/practice/browse.html`) の中身は build-id コメントと `<script>` 1 個増のみ。原因 = RSC の push 分割が 39 → 40 (サイズ増で境界がずれた)。src 付き script 数は 11 = 11 |
| c5 | CSP | `out/_headers` | `script-src 'self' 'unsafe-inline'` (hash 方式でない) で前後同一。inline script の中身変化で CSP が壊れる経路なし |
| d1 | outScan unit | `cd apps/web && npx vitest run src/lib/export` | 5 files / 30 tests passed |
| d2 | scan 実物 | `pnpm -s scan:out:ci` (after out/) | exit 0、`"pass": true`、total 16,189 |
| d3 | negative | `node scripts/scan-out.ts <out_before> --no-ipa-sources` | exit 1、rule (a) 5 件 = 5 svg そのもの。他の finding なし。許可規則の削除で svg が確実に落ちることを実物で確認 |
| d4 | test の意味 | diff 読み | `vercel.svg` を ok 配列から外し bad 配列へ。`checkPaths(bad)` の結果が `bad` と完全一致することを assert しているので「vercel.svg が unexpected path」と言っている通りに検査している。`file/globe/next/window.svg` は test にないが、規則は 1 本の正規表現ごと消えたので 1 名で代表して十分 |
| g1 | tsc / lint | `npx tsc --noEmit -p .`、`pnpm lint` | exit 0 / exit 0 |
| g2 | vitest 全体 | `npx vitest run` | 132 files / 1,474 passed |
| g3 | audit | `pnpm audit --prod` / `pnpm audit` | prod: 13 (high 9 / moderate 3 / low 1、critical 0) — writer の数字と一致。next 自体の advisory 0。全体 (dev 込み) は 69 (critical 1 = dompurify、root の `@mermaid-js/mermaid-cli` 経由、今回の変更と無関係) |

再実行していないもの: `build:cf` 本体と local Playwright (158 passed)。build は c0 の version 文字列と mtime (out/ 21:23、before 21:21) で out/ が 15.5.29 の新しい build であることを確認した。e2e は writer の記録を信用した。

## e) 15.5.19–15.5.29 release notes (`gh release view v15.5.NN -R vercel/next.js`)

| ver | 内容 | 本 app への影響 |
|---|---|---|
| .19 | FormData entries を落とさない | Server Actions 不使用。なし |
| .20 | `@next/swc-wasm-web` の publish のみ | なし |
| .21 | security: Server Actions DoS、middleware bypass (turbopack + single locale)、rewrites SSRF、image optimizer SVG DoS ほか | すべて Next server 実行時の話。prod は static export + 自前 Worker (worker/ に `next` import なし) なので該当なし |
| .22 | TypeScript >= 7.0 を拒否 | 現在 5.9.3 なので影響なし。将来 TS 7 に上げる時は Next 15.5.x が障害になる (LOW-4) |
| .23 | FlightClient に ReplyServer の traversal guard を移植 | **client 側 RSC 解析**に触れる唯一の変更。悪意ある payload 向けの guard で、正常 payload の挙動は変えない想定。client navigation (`.txt` 取得) は writer の e2e 158 passed で覆われる |
| .24/.25 | Windows / AVIF image optimizer RCE、AVIF 再有効化 | image optimizer 不使用 (static export)。なし |
| .26 | `next/og` hardening | `next/og` 不使用。なし |
| .27 | metadata image route、SSG/ISR cache poisoning (self-hosted) | server 実行なし。なし |
| .28 | image optimizer SVG RCE (critical)、Server Actions DoS | なし |
| .29 | self-hosted response injection、SVG rejection bypass、edge runtime HttpOnly cookie | なし |

build 出力 (c3/c4) に意味差がないことと整合する。15.5.29 を選んだことに異論なし (.28 → .29 の差は server 側 security 修正のみ、2026-11-03 公開で十分枯れている)。

## Findings

### HIGH
なし。

### MEDIUM
なし。

### LOW
1. **差分の説明が不正確** — `s157_next_bump.md` の「RSC payload の行順のみ」は実体と少し違う。実際は重複排除の後方参照先 (`$13` ↔ `$15:props:localeCookie`) の入替えと、browse 2 ページの push 分割 39→40。意味は同一 (c4)。記録の文言を直すだけでよい。
2. **cmp-out.mjs の正規化が広い** — `/_next/static/…` を全部 `X` にし、`"b":"…15 文字以上"` も潰し、可視テキスト比較は 24 差分にしか掛けない。今回は reviewer の独立比較 (c3/c4) で隠れた差がないことを確認したので結果は正しいが、tool 単体では chunk 参照の差替えや head の変化を見ない。次回再利用するなら head / tag 列 / RSC 意味比較を足すとよい。
3. **audit の範囲表記** — 27→13 は `--prod` の数字。表題に `--prod` とあるので誤りではないが、dev 込みでは 69 (critical 1、mermaid-cli 経由) が残る。残り 13 のうち `next>postcss@8.4.31` / `next>sharp@0.34.5` は next 15.5.x が固定しているので今回の範囲では消せない (writer の記述どおり)。
4. **TS 7 拒否** (.22) — 今は無害。TS 7 へ上げる計画が出たら Next 16 移行と組で考える必要がある、という将来メモ。
5. **再実行していない項目** — build:cf と Playwright e2e は reviewer が再実行していない (上記)。.23 の FlightClient 変更は client 側なので、e2e の結果が実質的な根拠になる。

## 結論
lockfile は next 系に閉じている (pointer 4 行は HEAD 既存の版)。svg はどこからも参照されない。out/ は 14,802 件の html/txt で RSC 意味差 0、head・markup・可視テキストも同一、`_headers`/`_redirects`/sitemap/data は byte 同一。outScan の変更は正しく、旧ツリーで 5 svg だけが落ちる negative も確認した。**PASS**。

reviewer の比較 script (非永続、scratchpad): `/private/tmp/claude-501/-Volumes-DevSSD-Project-IT-Passport-Learning/570ba3b3-9674-4231-aaaa-dff6282cc331/scratchpad/review/rv.mjs`、`/private/tmp/claude-501/-Volumes-DevSSD-Project-IT-Passport-Learning/570ba3b3-9674-4231-aaaa-dff6282cc331/scratchpad/review/rv2.mjs`
