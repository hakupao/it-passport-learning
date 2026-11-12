# H7 Rule D 審査 — 69b5daf5 (DEPLOY §6-8) + 7f0658cf (§6-9)

- reviewer: oh-my-claudecode:code-reviewer (opus)、writer: oh-my-claudecode:executor (opus)
- **判定 PASS** (HIGH 0 / MEDIUM 2 / LOW 7)
- 審査側の実行: tsc 0 / lint 0 / vitest 136 files 1522 passed、sed 置換後の `zsh -n` 0、pre-push `sh -n` 0、`needs-build.ts` 実履歴 (02cbf55b..7f0658cf = build、b9fa77d2..02cbf55b = skip)。local-e2e・本番・wrangler・.env.local は不使用。

| ID | 重さ | 内容 | 対応 |
|---|---|---|---|
| M-1 | MEDIUM | local-e2e.sh: 服務未起動でも続行、終了コードが e2e の失敗を反映しない (最終行 grep) | 修正 (後続 commit) |
| M-2 | MEDIUM | `PLAYWRIGHT_BROWSERS_PATH` (~/.zshrc、親 dir だけ検査) が存在しない dir を指す | repo 側で早期失敗の検査を追加。browser の install はユーザー判断 |
| L-1 | LOW | cleanup の kill 直後の lsof 誤報 | `wait` を追加 |
| L-2 | LOW | 試点単元を `$1` に渡すとテスト名重複 | 冒頭で拒否 + README |
| L-3 | LOW | tsc/eslint/vitest 失敗が e2e を止めない | 修正 |
| L-4 | LOW | esbuild は wrangler 経由の間接依存 | README に明記 |
| L-5 | LOW | DEPLOY §5 本文 141 行が H7 前の記述 | 修正 |
| L-6 | LOW | playwright.config の Basic Auth / LLM cost 注釈、feedback.ts の「Vercel KV」 | 注釈修正 (PLAN は履歴で不変) |
| L-7 | LOW | pre-push の既定 `main` が未テスト | テスト追加 |

INFO: push 前に未追跡の failures ファイルを commit (hook は作業木 clean を要求)。
- 修正 commit: abfe7ecf (M-1・M-2・L-1〜L-7 全件、tsc 0 / lint 0 / vitest 1523、早期終了の 9 経路を scratchpad で確認。server 起動後の M-1 経路は未実走)
