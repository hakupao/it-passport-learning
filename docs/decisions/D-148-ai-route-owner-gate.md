# D-148 — AI 経路 (chat / tutor / quiz explain) を owner 鍵で閉じる

- **Status**: Locked (Session 126, 2026-10-19、ユーザー「两个都做」)
- **Relates**: D-097 (firewall 記述)、D-132 (web runtime は外部 API を使う)、D-149 (同じ owner 鍵を feedback に流用)。

## 背景 — 事実 (S126 実測)
- 本番 (Vercel `bojiangs-projects/web`) に `DEEPSEEK_API_KEY` が Production で設定済。
- `/api/chat`・`/api/tutor`・`/api/quiz/explain` の POST に認証が無い。`src/middleware.ts` は `/api/` を素通しし、GET 説明文の「D-097 firewall: request must include Basic Auth header」は実装と不一致。空 body の POST は route 本体の 400 を返す (= 認証層に到達せず route まで届く)。正しい body なら DeepSeek を呼び費用が発生しうる。
- `src/lib/ai/cap.ts` の日次上限は silent-log (超過しても止めない)。
- ユーザー: 対話機能は現時点で開通しない。利用者は当面ユーザー本人のみ。

## 決定
1. **即時止血 (ユーザー操作)**: Vercel Production から `DEEPSEEK_API_KEY` を削除。
2. **コード層**: 環境変数 `OWNER_KEY` を新設。`?owner_key=<OWNER_KEY>` 付きで一度開くと httpOnly cookie (値は鍵の SHA-256、平文は持たない) を発行。3 AI 経路の POST は cookie が一致しない限り **503** を返し、LLM を呼ばない。`OWNER_KEY` 未設定時は全員拒否 (fail-closed)。
3. GET 説明文の firewall 記述を実装に合わせて訂正する。

## 却下した代替案
| 案 | 却下理由 |
|---|---|
| key 削除のみ | 将来 key を戻した瞬間に再び公開状態になる。コード側に門が無い |
| Basic Auth (D-097 記述どおり) | ブラウザの認証ダイアログが全ページ体験を損なう。feedback と鍵を共有しにくい |
| Vercel Deployment Protection | 公開サイト全体が閉じる (閲覧は公開のままにしたい)、プラン依存 |
| rate limit のみで公開維持 | ユーザーは開通しない方針。費用リスクが残る |

## 改訂 (S126、同日) — 対象を AI 5 経路に拡張
- 実装中に `/api/glossary/hover` と `/api/hello-ai` も同じ DeepSeek key で `streamText` を呼ぶ無認証経路と判明 (writer 指摘、Rule D reviewer MAJOR-1 で確認)。
- ユーザー「一起关掉」→ 決定 2 の門を **5 経路すべて** に適用。
