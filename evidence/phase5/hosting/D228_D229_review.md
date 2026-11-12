# D-228 / D-229 Rule D 審査 — repo の片付け + 題目報告機能の削除

- reviewer: oh-my-claudecode:code-reviewer (opus)、writer: oh-my-claudecode:executor (opus) ×2 + 主 session (README・CLAUDE.md・docs)。依頼文 `subagent_prompts/D228_D229_review.md`。
- **判定 PASS-WITH-CHANGES** (HIGH 0 / MEDIUM 1 / LOW 5)。コードは意図どおり: 削除モジュールの残り参照なし、Worker `/api/quiz/feedback` 404 (テスト一覧に明示)、`QUESTION_ID_RE` は逐字一致で移動、`isJsonContentType` は feedback 専用だった、fakeUpstash の残り命令で learning は足りる、i18n 436 キー × 3 一致、canonical 検査は全対象で H6 の意図より厳しい。
- 審査側のゲート: tsc 0 / eslint 0 / vitest 132 files 1474 passed / lang-leak gate PASS。

| ID | 重さ | 内容 | 対応 |
|---|---|---|---|
| M-1 | MEDIUM | DEPLOY 冒頭注記が「`/api/quiz/feedback` は 503」(D-229 後は 404) | 修正 (見出しに D-229) |
| L-1 | LOW | `.env.local` に削除済 DB の鍵 6 件 → cf-monitor が exit 2 | ユーザー作業として依頼 (値は読まない) |
| L-2 | LOW | README の Storage・OWNER_KEY 行が Upstash 同期のまま | 中英とも D-228 注記 |
| L-3 | LOW | session log に実施・ゲート記録なし、STATE「進行中」 | 追記・更新 |
| L-4 | LOW | README の Vitest 件数が古い (1,264 / 110) | 1,474 / 132 に |
| L-5 | LOW | `.gitignore` の `.feedback/`・apps/web README の定型文 | 対応不要 |
