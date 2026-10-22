# D-181 Phase A — 本番確認 (2026-10-22、main 3e47c89 の deploy 後)

## 1. 配信
- `/ja/sensei` 200 (deploy 前 404)。`/ja/glossary` の応答ヘッダ: `x-vercel-cache: PRERENDER` (静的のまま) + CSP が §0-8 と一字一致:
  `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://api.anthropic.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`

## 2. 本番 e2e (既定対象 = 本番、`--retries=0`)
- **48 passed / 0 failed** (1.5 分)。csp 7 ページ + /ja/sensei、sensei (fake Anthropic、未応答の api.anthropic.com 要求で失敗する guard 付き)、quiz、glossary、learning、3 shell × 3 locale の 390px nav、keyboard Tab。

## 3. 実 key での本番確認 (D-182: key は repo 外ファイルから script が読み、出力前に置換)
- 手順 (ヘッドレス Chromium、1280×900): `/ja/quiz?mode=exam&id=2024r06` → `2024r06-q001` で ア (誤答) を選択 → 「AI 先生に聞く」→ パネル内 KeySettings に key を入力・保存 → 「なぜアは不正解で、エが正解なのですか？」を送信 → 回答完了 → reload。
- 結果:

| 項目 | 値 |
|---|---|
| 「考え中」が消えるまで (最初の text) | 1832 ms |
| 回答完了まで | 6171 ms |
| api.anthropic.com への要求 | POST × 1 (重複送信なし) |
| エラー表示 | なし |
| 回答 | 473 字。エ = MA の理由、誤答ア = BI/データマイニングの説明である理由、ア〜エの用語の切り分け、判断の手掛かり (「見込み顧客」)。自作問題なし |
| reload 後の thread | `{ anchorId: "2024r06-q001:ア", title: "令和6年度 ITパスポート試験 問1" }` |
| key が key 以外の localStorage 値に含まれるか | false |
| CSP violation | 0 |
| console error | 0 |

判定: Phase A 本番 PASS。
