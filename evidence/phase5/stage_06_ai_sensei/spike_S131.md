# D-179 Task 13 — BYOK ブラウザ直結 spike (S131, 2026-10-21)

- 方法: 一時ページ `apps/web/src/app/[locale]/spike-byok/page.tsx` (commit しない、終了後削除)。`next dev --turbopack -p 3100`、Origin = `http://localhost:3100`。AI SDK `ai@6.0.184`、`@ai-sdk/deepseek@2.0.35` (`createDeepSeek({ apiKey })`)、`@ai-sdk/anthropic@3.0.78` (`createAnthropic({ apiKey, headers: { "anthropic-dangerous-direct-browser-access": "true" } })`)、`streamText` + `fullStream`、`maxRetries: 0`、`maxOutputTokens: 200`。
- key はタブの React state のみ。localStorage・ログ・結果 JSON に入れない。

## 1. 無効 key (主 context が Playwright で実施、key 不要)

| provider | model | 結果 | 所要 | エラー文 |
|---|---|---|---|---|
| DeepSeek | deepseek-v4-flash | 401 本文をブラウザで読めた (= 実 POST の CORS 通過) | 229〜379 ms | `AI_APICallError: Authentication Fails, Your api key: ****-key is invalid (request_id: …)` |
| Anthropic | claude-haiku-5-5 | 401 本文をブラウザで読めた (= 実 POST の CORS 通過) | 937 ms | `AI_APICallError: invalid x-api-key` |

所見:
- 両 provider とも、ブラウザからの実 POST が CORS で止まらず、エラー本文まで JS から読める。
- DeepSeek のエラー文は key の末尾 4 文字を伏字付きで返す (`****-key`)。本実装ではエラー文をそのまま画面に出してもよいが、ログ・同期・送信には載せない。
- `onError` と fullStream の `error` part が同じエラーを 2 回届ける → 本実装ではどちらか一方で拾う。

## 2. 有効 key (ユーザーが本機ブラウザで実施) — 結果待ち

### 2a. Anthropic 流式 (ユーザー実施 2026-10-22T00:48Z、ユーザーの本機ブラウザ)

| 項目 | 値 |
|---|---|
| model | claude-haiku-5-5 |
| ok | true (errors 0) |
| 最初の stream part | 11 ms |
| 最初の text | 1002 ms |
| 合計 | 1848 ms |
| text chunk 数 | 43 (逐次表示を確認) |
| usage | input 33 / output 175 / total 208、cache read 0 / write 0 (短い prompt で cacheControl なし → 想定どおり) |
| 出力 | 日本語 3 文の説明、`maxOutputTokens: 200` 付近で途中終了 |

所見: Anthropic はブラウザ直結で実 POST + streaming とも成立。`usage.inputTokenDetails` と `providerMetadata.anthropic.usage.raw` の両方から cache の数値が取れる。

### 2b. Anthropic prompt cache (ユーザー実施 2026-10-22T00:59Z)

system message (長い参照文) に `providerOptions.anthropic.cacheControl = { type: "ephemeral" }`、同一 messages を 3 秒間隔で 2 回送信。

| 回 | input 計 | noCache | cache write | cache read | output (うち thinking) | 最初の text | 合計 |
|---|---|---|---|---|---|---|---|
| #1 | 15722 | 25 | 15697 (ephemeral_5m) | 0 | 87 (43) | 1951 ms | 2082 ms |
| #2 | 15722 | 25 | 0 | 15697 | 32 (0) | 980 ms | 1054 ms |

所見:
- ブラウザ直結でも cacheControl が効く。2 回目は prefix 全量が cache read、最初の text は 1951 → 980 ms。
- 参照文は見積り ≈6k token に対し実測 15697 token (見積り誤り。本実装の context 予算は usage の実測で決める)。
- claude-haiku-5-5 は指示なしでも thinking を出すことがある (#1 で 43 token)。出力上限を決めるときは thinking 分を含めて見る。
- cache 数値は `usage.inputTokenDetails.cacheReadTokens / cacheWriteTokens` で provider 共通に取れる。

### 2c. DeepSeek 有効 key — 未検証 (ユーザー判断で skip)

- 実 POST の CORS 通過と 401 本文の読み取りは §1 で確認済み。streaming・首字遅延・自動 cache (`providerMetadata.deepseek.promptCacheHitTokens`) は未検証。Phase 4 実装時に確認する。

## 結論

| 項目 | Anthropic | DeepSeek |
|---|---|---|
| ブラウザから実 POST (CORS) | ✅ | ✅ |
| エラー本文の読み取り | ✅ (`invalid x-api-key`) | ✅ (key 末尾 4 文字を伏字で含む) |
| streaming | ✅ 43 chunk、首字 ≈1.0 s | 未検証 |
| prompt cache | ✅ write → read 15697 token | 未検証 |

- D-179 決定 4 (BYOK ブラウザ直結) は Anthropic で成立を確認。失敗した provider はないため `failures/` への記録はなし (Rule B 対象外)。DeepSeek は「未検証」のまま Phase 4 計画に持ち越す。
- 後片付け: 一時ページ削除、dev server (port 3100) 停止、`git status` に残骸なし (下記コマンドで確認)。
