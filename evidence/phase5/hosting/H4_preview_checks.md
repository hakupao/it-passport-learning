# H4 — preview の手動点検 (H3_worker.md §7 / §9-5、2026-11-12 02:18 UTC)

対象 `https://itlearn.bojiang.workers.dev` (Workers Builds deploy、commit 6701ac43)。script = scratchpad `preview-check.sh` (key・cookie 値は表示しない。owner cookie は `~/.config/itp-owner/key` の sha256 を curl `-K -` で stdin から渡す)。

| # | 確認 | 結果 |
|---|---|---|
| §7-1 | secret の注入 | cookie なし `/api/learning?v=2` → 403、owner → **200** (445 B、0.55 s wall、keys a/s/u/v) — 503 ではない |
| §7-2 | CPU | `H4_cpu_measurement.md` |
| §7-3 | `run_worker_first` が `/api/*` だけ | 02:18 の Worker 要求 14 件 ≤ 送った `/api/*` 17 件 (adaptive 集計の標本化か分の境目で少なめ)。同じ時間に送った asset 要求 約 12 件 (ページ 4・`/_next` 1・`/data` 1・未命中 `/data/x-missing.json`・`/ja/no-such`・`.txt`・`/evil.com` 系) が数えられていれば 26 件以上になるので、**asset と asset 未命中は Worker を起動していない**。未命中 → 404 |
| §7-4 | 有効化 | Set-Cookie 2 本: `itp_owner` = `Path=/; Secure; SameSite=Lax; Max-Age=31536000; HttpOnly`、`itp_owner_hint` = 同じで HttpOnly なし。`Referrer-Policy: no-referrer`、`Cache-Control: no-store`。`key=logout` → 2 本とも `Max-Age=0` + Expires 1970、`/ja` へ 307 |
| §9-5-7 | open redirect | 誤 key で `next=` `/.//evil.com`・`/..//evil.com`・`/%2e//evil.com`・`/a/..//evil.com`・`//evil.com`・`https://evil.com` → すべて `<origin>/ja` (Set-Cookie 0)。正 key + `next=/.//evil.com` → `<origin>/ja`。`next=/%2F%2Fevil.com` → `<origin>/%2F%2Fevil.com` (自サイト内の path、さらに Cloudflare が `<origin>/evil.com` へ 307 → 404) |
| | path そのもの | `/%2F%2Fevil.com`・`//evil.com` → `<origin>/evil.com` (自サイト内) |
| §7-5 | `/api` の header | 403 応答に CSP (1 本だけ、二重なし)・`Cache-Control: no-store`・`X-Robots-Tag: noindex` |
| §9-5-7 | cross-site 書込 | `Sec-Fetch-Site: cross-site` の PUT learning / POST feedback → 403 |
| §9-5-7 | feedback の Content-Type | 非所有者 text/plain → 403 (owner 検査が先)、所有者 text/plain → **415** (書込なし) |
| cache | 既定 | ページ・`robots.txt`・`sitemap.xml`・`/data/*.json` = `public, max-age=0, must-revalidate`、`/_next/static/*.js` = `max-age=31536000, immutable`。workers.dev は全応答 `X-Robots-Tag: noindex` |
| H2 | 詳細の `.txt` | 404 (A′ どおり) |

## 未了 (H5 / H7 へ)
- §7-6 実 upload の asset 数: Workers Builds の log で確認 (dashboard)。H5 で読む。
- §9-5-6 WAF rate limit: custom domain (zone `bojiangz.com`) に付けるので H7。


## 補足 (CPU)
02:18 の 14 件は p50 6.1 ms / max 13.6 ms (新 version なし)。10 ms 超は deploy 直後だけでなく **しばらく使われなかった後の冷えた isolate** でも起きる。errors 0 は変わらず、D-224 の結論 (Free 継続) は維持。
