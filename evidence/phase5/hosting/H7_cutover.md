# H7 — 本番切替 (2026-11-12、D-226)

ユーザー承認: H7 開始・Vercel は切替後すぐ停止 (削除しない)・pre-push hook 有効化 (session 154「H7 開始」)。

## 手順と結果 (UTC)

| # | DEPLOY §6 | 実施 | 結果 |
|---|---|---|---|
| 1 | Vercel の退避 | 戻し先 deployment `web-buu8bm52m-bojiangs-projects.vercel.app` を控えた。Vercel の Git 連携を解除 (merge で Vercel が build しないように) | 解除後の main push で Vercel の build なし |
| 2 | Production branch | Cloudflare Workers Builds → Branch control を `hosting-cf` → `main` | — |
| 3 | merge + push | `main` を `075aca3a` へ fast-forward、push (pre-push hook = `check:release` exit 0) | check run `Workers Builds: itlearn` success (04:24:54)。workers.dev smoke 18/18 |
| 4 | Custom domain | DNS `itlearn` CNAME (Vercel 向け) を削除 → Worker の Custom domain `itlearn.bojiangz.com` を追加 | 解決先 104.21.91.47 / 172.67.166.186 (Cloudflare) |
| 5 | 切替後の smoke | `prod-smoke.mjs --target prod` (D-213、HTML のみ) | **30/30** (200・title・生記法なし・canonical = `https://itlearn.bojiangz.com/<l>/textbook/<unit>`)。`/` → 302 `/ja`。ページに noindex なし。`/api/learning` 403 + `X-Robots-Tag: noindex`。`robots.txt` に Sitemap 行、`sitemap.xml` の URL は全て `itlearn.bojiangz.com` |
| 5b | 所有者の再有効化 | ユーザーが `~/.config/itp-owner/key` から本番 domain で `/api/owner?key=…` を開いた (key は会話に出ていない) | 04:40 に Worker 6 要求・Upstash subrequest 6・errors 0、p50 3.2 ms / max 12.6 ms (冷えた isolate、H4 と同じ傾向)。H5 LOW-6 (本番での実同期) 済 |
| 7 | Vercel 停止 | ユーザーが `vercel project pause web` (対話確認が要るため本人が実行) | 旧 host `web-mu-sandy-78.vercel.app/ja` → **503** (05:41)。project・統合 `upstash-kv-orange-fence` は残す (OQ-2、D-226) |

## 戻し方 (D-226)
1. `vercel project resume web`
2. Worker の Custom domain `itlearn.bojiangz.com` を外す
3. DNS `itlearn` CNAME `ffd3d815e6bd8a52.vercel-dns-017.com.` (DNS only、TTL 10 分) を戻す
4. Vercel 側で戻し先 deployment を promote (Git 連携は解除済なので手動)

## 未了 (H7 の残り)
- §6-6 WAF rate limit (`/api/*`、zone `bojiangz.com`、Free は 1 rule) と Web Analytics (D-220)
- §6-8 運用の既定の切替 commit、§6-9 Vercel の片付け
- §9-2 watch paths の基準 (最初の内容のみの push)、§7-6 asset 数 (dashboard の build log)
