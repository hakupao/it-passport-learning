# S158 Rule D review — AI SDK 家族 + zod の exact 更新

- reviewer: `oh-my-claudecode:code-reviewer` (writer とは別 agent・別 context)
- 対象: HEAD `c008e251` に対する未 commit 差分 `apps/web/package.json` / `pnpm-lock.yaml` (54+/54-)
  - ai ^6.0.185→6.0.216、@ai-sdk/react ^3.0.187→3.0.218、@ai-sdk/anthropic ^3.0.78→3.0.90、@ai-sdk/deepseek ^2.0.35→2.0.42、zod ^4.4.3→4.6.7
- writer evidence: `s158_ai_sdk_zod.md`、`s158_realkey.json`、`s158_tools/`
- 判定: **PASS (APPROVE)** — HIGH 0 / MEDIUM 0 / LOW 5 (+ 情報 2)

## a) 依存グラフ — PASS
- `pnpm why zod --prod`: "Found 1 version of zod" = 4.6.7。anthropic 3.0.90・deepseek 2.0.42・gateway 3.0.140・provider-utils 4.0.33・ai 6.0.216・react 3.0.218 が全て同じ zod を指す。
- `apps/web/node_modules/{zod,ai,@ai-sdk/react,@ai-sdk/anthropic}` の symlink 先 = それぞれ `zod@4.6.7`・`ai@6.0.216_zod@4.6.7`・`@ai-sdk+react@3.0.218_…_zod@4.6.7`・`@ai-sdk+anthropic@3.0.90_zod@4.6.7`。
- 上流の固定: `@ai-sdk/react@3.0.218` deps = `ai: 6.0.216`・`provider-utils: 4.0.33` (exact)、`ai@6.0.216` deps = gateway 3.0.140・provider 3.0.12・provider-utils 4.0.33 (exact)、anthropic 3.0.90 = provider 3.0.12・provider-utils 4.0.33 (exact)。組として整合。
- 実 bundle (`out/_next/static/chunks`、22:44 build = 本変更込み):
  - zod の版 marker `major:4,minor:6,patch:7` は全 chunk 中 **1 個** (`25d1b9a12dffe4be.js`、sensei の dynamic chunk)。
  - AI SDK の版文字列は同 chunk に `"6.0.216"`・`"4.0.33"`・`"3.0.90"`・`"3.0.140"` が各 1 個。旧版文字列なし。
  - `allowsEval` の probe (`Function("")`) は同 chunk に 1 箇所だけ、直前に `nV.jitless` 判定。`g5.config({jitless:!0})` も同 chunk 内。
- `node_modules/.pnpm` に旧版 (zod@4.4.3・ai@6.0.185 等) の dir が残るが、どこからも link されていない (情報、無害)。

## b) zod 4.6.7 の jitless — PASS
- `v4/core` で `Function` を生成する箇所 (grep):
  1. `util.js:218-229` `allowsEval` — `globalConfig.jitless` で即 `false` (4.4.3 と同じ構造)。
  2. `doc.js:32-35` `Doc.compile()` — 呼び元は `schemas.js:1190` の `$ZodObjectJIT` のみ。`schemas.js:1194` `jit = !globalConfig.jitless`、`:1211` で `jit && fastEnabled(=allowsEval) && ctx.async===false` のときだけ。jitless で到達しない。
  3. **新規** `compile.js:151-188` `compileFn` (4.5/4.6 の AOT compile) — 呼び元は `compile()` / `compileValidator()` / compile.js 内部 (`:1615` record key) と、`core.js:105-108` の global `postProcessor` (= `import "zod/compile"` で設置)。jitless の判定は無いが、**明示的に `z.compile()` か `zod/compile` を import した時だけ**。
  4. `schemas.js:2556-2574` の `new F(...)` は `F = inst.constructor` (schema class) で Function ではない。
- AI SDK 側: `ai@6.0.216`・`provider-utils@4.0.33`・`anthropic@3.0.90`・`react@3.0.218`・`gateway@3.0.140` の `dist` に `zod/compile`・`z.compile`・`.compile(`・`postProcessor`・`new Function`・`jitless` の参照 **0**。
- bundle には compile.js のコード (`zod.compile.invalid` 1 箇所、`p=Function; new p(...)`) が含まれる (`import { z } from "zod"` の namespace のため tree-shake されない) が、呼ばれない dead code。→ LOW-4。
- 補足: zod 4 の `globalConfig` は `globalThis.__zod_globalConfig` に置かれる (`core.js:135-136`、4.4.3 も `:72-73`)。よって 4.x 同士なら複数 instance でも jitless は共有される。→ LOW-3。

## c) changelog と使用 API — PASS
`node_modules/.pnpm/*/CHANGELOG.md` の 6.0.186–6.0.216 / react 3.0.188–3.0.218 / anthropic 3.0.79–3.0.90 / provider-utils 4.0.28–4.0.33 を読んだ。
- 型の直接比較 (旧 dist vs 新 dist の `.d.ts`): `APICallError` (provider 3.0.10→3.0.12) **同一**、`RetryError` **同一**、`UIMessage` **同一**、`AnthropicProviderSettings` **同一**。`UIMessagePart` の差は `input` が optional になった 2 箇所 (6.0.189) と tool approval の `signature?` 追加のみ = 全て追加的・optional。
- → `threadStore.ts`/`historyStore.ts` は `JSON.parse` + 自前検査で `validateUIMessages` 不使用。旧 thread の JSON は新型にそのまま適合する (必須 field の追加・改名なし)。**保存済み thread は読める**と判断 (confidence HIGH、型と store の実装から)。
- 影響しうる変更:
  - 6.0.203 b4b575a: `toUIMessageStream` の既定 `onError` が汎用文言へ。`browserTransport.ts` は `onError` を明示指定 (`formatSenseiError(toSenseiError(e, apiKey))`) → **影響なし**。
  - 6.0.200 14098e7 / 6.0.208 系: model stream が finish chunk も出力も無く終わると `NoOutputGeneratedError` の error part を stream に流す (`ai/dist/index.mjs:7884-7891`)。旧版は空の step で静かに終わっていた。→ LOW-1。
  - provider-utils 4.0.33 b30e43a: JSON 応答読み取りの上限 = `DEFAULT_MAX_DOWNLOAD_SIZE` 2 GiB (`index.mjs:432`)。Anthropic の error/JSON 応答には実質無関係。
  - anthropic 3.0.82 `fallbacks`・`claude-fable-5` 追加、3.0.86/3.0.90 は tool 使用時の並べ替え・delta 型修正。sensei は tool を使わない。`createAnthropic({ apiKey, headers, fetch })` の option 型は同一。
  - 6.0.188 `allowSystemInMessages` は `ToolLoopAgent` への追加 (streamText には既存)。sensei の system は `buildSenseiMessages` 経由で従来どおり。
  - その他 (SSRF guard・download・telemetry・tool approval・pruneMessages) は browser 直結 sensei の経路外。

## d) テスト — PASS
- `npx vitest run src/lib/sensei src/lib/chat`: **15 files / 189 passed** (`zodJitless.test.ts` = `z.config().jitless === true` を含む)。
- `npx tsc --noEmit`: **exit 0**。
- `pnpm audit --prod`: **11** (nanoid 2・postcss 4・postcss-selector-parser 1・sharp 3・source-map-js 1)。zod・@ai-sdk/* は 0。writer の表と一致。
- Playwright・実 key・Worker byte 一致・out/ 比較は再実行していない (server 起動禁止の範囲。writer evidence の数値を採用)。

## e) exact pin の妥当性 — PASS
- 妥当。`@ai-sdk/react`・`ai`・`anthropic` が互いを exact で固定しているため、caret のまま lockfile を作り直すと `ai` と `@ai-sdk/react` 経由の `ai` が別版に分かれうる (S131 d35ea04「ai 6.0.185 一本化」と同じ問題)。exact で package.json と lock が自己説明的になる。
- repo 内で版を assert する test・script は無い (`git grep`)。言及は履歴文書のみ: `docs/phase5/PLAN_stage6_ai_sensei.md:9,59,102`、`docs/discussion/2026-10-21-session-131.md:118,124`、`evidence/phase5/stage_06_ai_sensei/*`。→ LOW-5。

## 指摘

[LOW-1] 出力ゼロで終わる stream の UI 表示が変わる
- File: `apps/web/src/lib/sensei/errors.ts:54-74` (`kindOf`)、`apps/web/src/lib/sensei/browserTransport.ts:49`
- Confidence: MEDIUM
- 内容: 6.0.200/6.0.216 では finish も出力も無く切れた stream が `NoOutputGeneratedError` ("No output generated. The model stream ended without a finish chunk.") を error part として流す。sensei では `[sensei:other] No output generated…` と英文の生 message が出る (旧版は空の回答)。key を含まないので安全上の問題は無く、空回答より良いとも言える。
- Fix (任意): `NoOutputGeneratedError.isInstance(e)` を `network` か専用 kind に寄せ、fake stream (finish chunk 無しで close) の unit test を 1 本足す。

[LOW-2] exact pin は patch の自動流入を止める
- File: `apps/web/package.json:19-24,36`
- Confidence: HIGH
- 内容: dependabot/renovate の設定は無い (`.github` に該当なし)。今後の advisory は手動の `pnpm audit` 頼み。
- Fix: STATE / What's Next に「AI SDK 家族は exact、更新は 4 package 同時・`pnpm why` で 1 版確認」を 1 行残す。

[LOW-3] evidence §5 の理由づけがやや強すぎる
- File: `evidence/phase5/hosting/s158_ai_sdk_zod.md` §5「jitless が別 instance に掛かると CSP violation が出る」、`apps/web/src/lib/sensei/zodJitless.ts:5-6`
- Confidence: HIGH
- 内容: zod 4 は `globalConfig` を `globalThis.__zod_globalConfig` に共有する (`zod/v4/core/core.js:135-136`、4.4.3 `:72-73`) ので、4.x の複数 copy でも jitless は効く。危険なのは zod 3 系や bundle 済みの別実装が入った場合。結論 (exact・1 版) は変わらない。
- Fix: evidence の記述を「4.x 同士は globalThis で共有されるが、1 版に保つ方が監査しやすい」程度に直す (任意)。

[LOW-4] zod 4.6 の AOT compile (`new Function`) が sensei chunk に dead code として入る
- File: `node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/compile.js:151-188`、`core.js:105-108`
- Confidence: HIGH (呼ばれないこと)
- 内容: jitless では止まらない経路だが、起動は `z.compile()` か `import "zod/compile"` のみ。src・AI SDK とも参照 0。将来 `z.compile` を使うと本番 CSP で violation になる。
- Fix: 必要なら `zodJitless.ts` の comment に「`z.compile` / `zod/compile` は使わない (jitless で止まらない)」を 1 行。

[LOW-5] 履歴文書の版記述が古くなる
- File: `docs/phase5/PLAN_stage6_ai_sensei.md:9,59` (`ai@6.0.185`・「3.0.78 は fallbacks 非対応」— 3.0.82 で対応)
- Confidence: HIGH
- 内容: 履歴としては正しいが、PLAN を現状の仕様と読むと誤解する。
- Fix: 任意。STATE か session log に版の更新を記録すれば十分。

情報:
- `out/_next/static/chunks/a6dad97d9634a72d.js` に `Function("return this")` (globalThis 取得の古典的 fallback)。`globalThis` がある browser では到達しない。本変更と無関係。
- 旧版の `.pnpm` dir が残存 (未 link)。`pnpm store prune` 等は任意。

## 良い点
- 「advisory を消す最小の整合した組」を provider-utils/provider/gateway の一致で選び、最新版への跳躍と `overrides` を理由付きで却下している。
- Worker bundle の byte 比較と out/ の semantic diff で影響範囲を閉じている。
- 本物の CSP 下の e2e と D-182 実 key (key は file 経由) の両方で sensei の経路を確認している。
