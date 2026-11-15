# S157 (続) — AI SDK 家族 + zod の更新 (依存監査の残り)

> 出典: S157 What's Next 4 (`zod` ≥4.6.6・`@ai-sdk/provider-utils` ≥4.0.33)。道具: `s158_tools/` (`realkey158.mjs` = D-182 実 key の駆動、`rv3check.mjs` = rv2 の残りの再検査)。実 key の結果: `s158_realkey.json`。
> ファイル名の s158 は作業の区切り (session は 157 の続き)。

## 1. 変更 (`apps/web/package.json`、全て exact 指定)
| package | 前 | 後 |
|---|---|---|
| `ai` | ^6.0.185 (6.0.185) | 6.0.216 |
| `@ai-sdk/react` | ^3.0.187 | 3.0.218 (`ai` を 6.0.216 に exact 固定) |
| `@ai-sdk/anthropic` | ^3.0.78 | 3.0.90 |
| `@ai-sdk/deepseek` | ^2.0.35 | 2.0.42 (src からの import なし、bundle に入らない) |
| `zod` | ^4.4.3 | 4.6.7 |

- 版の選び方: 4 package が同じ `@ai-sdk/provider@3.0.12`・`@ai-sdk/provider-utils@4.0.33`・`@ai-sdk/gateway@3.0.140` を使う最小の組 (2026-06-27〜29 公開)。provider-utils ≥4.0.33 を初めて満たす版。最新 (ai 6.0.332 等) は採らない (§4)。
- exact 指定の理由: caret だと pnpm が最新へ浮き、`@ai-sdk/react` の exact `ai` と 2 系統になる。
- 解決の確認 (`pnpm why --prod`): `zod` 4.6.7・`ai` 6.0.216・`provider-utils` 4.0.33・`provider` 3.0.12・`gateway` 3.0.140 が各 1 版。repo 全体の `zod@3.25.76` は root devDependency の mermaid-cli → puppeteer → chromium-bidi 経由 (HEAD から既存、app に入らない)。
- lockfile: 54 行 / 54 行。package 項目の増減は上の 5 + gateway・provider・provider-utils のみ、他は root devDep `@anthropic-ai/sdk@0.98.0` の peer 表記 `(zod@4.4.3)` → `(zod@4.6.7)`。

## 2. zod の確認
- app のコードで zod を使うのは `src/lib/sensei/zodJitless.ts` の `z.config({ jitless: true })` だけ (threadStore・historyStore は zod を使わない)。zod は AI SDK 内部で API 応答の検証に使われる。
- 4.6.7 の `v4/core/util.js:218` `allowsEval` は `globalConfig.jitless` で probe を飛ばす (コメントも「strict CSPs report the caught `new Function`」)。`schemas.js:1194` の object の JIT も `jitless` で切れる。
- 4.5・4.6 の release notes = 機能追加 (`z.compile()`・`.validate()`・`fromJSONSchema` の検査追加 等) と性能・メモリ修正。破壊的変更の記載なし。`z.compile()` は明示的に呼んだときだけ。

## 3. 検証
| 項目 | 結果 |
|---|---|
| `pnpm build:cf` | exit 0、`out/` 16,189 |
| `pnpm scan:out` (rule c 込み) | exit 0 |
| tsc / lint | 0 / 0 |
| vitest | 132 files / 1,474 passed |
| Worker bundle (esbuild、`worker/index.ts`) | HEAD と **byte 一致** (Worker は AI SDK / zod を import しない → D-224 の CPU 実測に影響なし) |
| `out/` 比較 (基線 = HEAD `c008e251` の新しい build、`rv2.mjs`) | 共通 html/txt 14,802。rv2 の指摘 14 (en の textbook 6 単元 ×2 + ja/zh browse.html) を `rv3check.mjs` (行番号を T 行の直後でも正規化) で再検査 → **全て same**。差 = RSC の行番号が 1 ずれた (module 数の変化) ことと、browse の push 分割 (S157 と同じ)。script の外の markup は textbook 6 頁で完全一致 |
| local Playwright (:3150 静的 + 本物の CSP、`csp.spec.ts` が sensei の自由質問・用語 panel を fake Anthropic で送信し violation 0 を確認) | **158 passed / 0 failed / 2 skipped** (`--list` 160 = 全件) |
| D-182 実 key (local :3150、本物の CSP、Anthropic のみ。DeepSeek の key は無く未確認 — src で未使用) | 自由質問 /ja/sensei: POST 1・200・5.7 s・回答 452 字 (表と覚え方まで描画)。用語 panel (2進数): POST 1・200・5.2 s・379 字。**CSP violation 0・console error 0** (両方) |

## 4. 依存監査 (`pnpm audit --prod`)
| | critical | high | moderate | low | 計 |
|---|---|---|---|---|---|
| S157 後 | 0 | 9 | 3 | 1 | 13 |
| 本変更後 | 0 | 8 | 3 | **0** | 11 |

残り 11 は全て `next` 15.5 経由の build 時依存 (`postcss@8.4.31` 4・`sharp@0.34.5` 3・`nanoid` 2・`source-map-js` 1・`postcss-selector-parser` 1)。Next 16 待ち。

## 5. 却下した案
- AI SDK を最新 (ai 6.0.332 / anthropic 3.0.142) へ: 約 150 patch 分の挙動変化 (stream・error の形) を browser 直結の sensei で負う理由がない。目的は advisory の解消。
- pnpm `overrides` で provider-utils だけ ≥4.0.33 に: 6.0.185 系と組で検証されていない組合せになる。
- zod を caret のまま: AI SDK の peer 範囲で別の版に解決される余地を残す。(Rule D LOW-3 で訂正: zod 4 の globalConfig は `globalThis.__zod_globalConfig` にあり、4.x の複数 copy 間では jitless が共有される。本当の危険は zod 3 が app の graph に混ざること。exact・単一版の結論は同じ)

## 6. Rule D
- code-reviewer (opus、別 subagent) = **PASS** (HIGH 0 / MEDIUM 0 / LOW 5)、`s158_review.md`。bundle の chunk で zod 4.6.7・AI SDK 各版の印が 1 回ずつ、`Function("")` probe は jitless 判定の直後の 1 か所のみ、旧 thread の読込みは型差 (optional 追加のみ) で影響なし。
- LOW-1 (ai ≥6.0.200 で出力なしの stream 終了が `NoOutputGeneratedError` → 英語の原文が `other` で出る): **修正** — `errors.ts` で `network` に分類、`errors.test.ts` に赤→緑の試験 (RetryError 包み込みも)。
- LOW-2 (exact pin で patch が自動で入らない、dependabot 等なし): STATE に更新規則を記載 (4 package を組で、`pnpm why` で単一版を確認)。
- LOW-3 (§5 の理由が強すぎ): §5 を訂正。
- LOW-4 (zod 4.5+ の `z.compile` は jitless を見ない): `zodJitless.ts` に「使わない」注記。
- LOW-5 (PLAN_stage6_ai_sensei.md の版記述が古い): 歴史文書のため変更しない。
