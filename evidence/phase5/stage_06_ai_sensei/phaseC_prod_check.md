# D-181 Phase C — 本番確認 (2026-10-22、main 500b5cd の deploy 後)

## 1. 配信
- `GET /api/sensei/terms?locale=ja&ids=,,,` → 400 (deploy 前 404)。`/ja/sensei` 200。

## 2. 本番 e2e (既定対象 = 本番、`--retries=0`)
- **60 passed / 0 failed** (2.2 分)。Phase A・B 分 + 用語・unit 入口、csp (用語・unit・/sensei で実際に送信)、自由質問 (一致あり / なし、再開で system 逐字一致、terms 失敗時の通知、最初の質問がない thread、zh の後続 sense の綴り)。

## 3. 実 key での本番確認 (D-182)
| 項目 | 用語詳細 (機能要件) | 自由質問 (/ja/sensei) |
|---|---|---|
| 質問 | 機能要件と非機能要件はどう見分ければいいですか？ | ファイアウォールとIDSとIPSの違いを教えてください |
| POST | 1 | 1 |
| `/api/sensei/terms` | 呼ばない (錨点は server 側) | 1 回、3 id (ファイアウォール・IDS・IPS)、200、ブラウザ向け `cache-control: public` (Vercel が s-maxage を外す想定どおり)、`x-vercel-cache: MISS` |
| 完了まで | 8977 ms | 7475 ms |
| 回答 | 教材の定義で見分け方を説明。教材に例がない非機能要件は「教材にない一般的な補足」と明示 | 3 者の役割と遮断の有無を表で比較、覚え方、教材にない WAF は「今回の教材にない」と明示 |
| CSP violation / console error | 0 / 0 | 0 / 0 |

判定: Phase C 本番 PASS。
