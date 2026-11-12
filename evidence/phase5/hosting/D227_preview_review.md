# D-227 previews block / prod-e2e の preview 除外 — Rule D

- 対象: `dbaa0368` (robots、verifier opus **PASS**、変異 m1〜m5 検出・`*` group byte 不変) / `db8b5bad`・`0da201f3` (previews block・prod-e2e、code-reviewer opus **PASS**、HIGH 0 / MEDIUM 0 / LOW 4)。
- 確認: Cloudflare docs「The `previews` block is required, but it can be empty」「Previews do not inherit production settings」、`wrangler deploy --dry-run` = ASSETS のみ、jq 実 commit 3 + 合成 7 件、`zsh -n` 0、vitest 1474。

| ID | 内容 | 対応 |
|---|---|---|
| L-1 | `sort_by(.started_at)` で null (queued) が先に並び、古い完了 run を採り得る | 未完了の run が 1 本でもあれば pending、全完了時のみ最新を採る |
| L-2 | 4xx の error JSON が stdout に出て `s` に入る (コメントと不一致) | 既知の値以外は gh error として再試行 |
| L-3 | deploy 前に失敗した preview は区別不可、`/previews/` は文書化されていない実装 | 受容 (`--no-ff` 運用、DEPLOY に明記) |
| L-4 | DEPLOY §2-2 の記述が古い | 実地の注記を条件リストの後に追記 |
