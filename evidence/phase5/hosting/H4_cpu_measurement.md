# H4 / D-224 — 同期 CPU の実測 (preview `itlearn.bojiang.workers.dev`、2026-11-12)

## 読み方
- Cloudflare GraphQL Analytics `workersInvocationsAdaptive` (scriptName `itlearn`、分単位、cpuTime は µs)。wrangler の OAuth token を pipe で渡し、表示・保存していない。Workers Logs / tail は OFF のまま (URL に key が載るため、H3_worker.md §2-9)。
- 記録の大きさ: Upstash `STRLEN learn:owner:v2` = **445 byte** (v1 = 0)。値は読んでいない。

## 結果 (UTC、Worker 起動分のみ = `/api/*`)

| 分 | 要求 | subreq | p50 ms | max ms | 直前の新 version |
|---|---|---|---|---|---|
| 00:44 | 4 | 0 | 2.3 | 9.7 | local deploy (Upload) |
| 02:02 | 2 | 2 | 8.8 | 14.5 | 02:01:49 Secret Change |
| 02:03 | 6 | 10 | 3.0 | 7.6 | — |
| 02:07 | 1 | 2 | 26.2 | 26.2 | 02:05:42 Git build deploy |
| 02:09 | 6 | 10 | 3.0 | 14.0 | 02:09:06 Secret Change (OWNER_KEY rotate) |
| 02:10 | 10 | 21 | 2.9 | 5.6 | — |
| 02:11 | 7 | 14 | 3.6 | 8.3 | — |

errors = 0、status はすべて success (1102 なし)。

## 判定
- 10 ms を超えたのは 3 分だけで、いずれも **新 version の直後の最初の要求** (isolate の起動・bundle の評価)。[訂正 02:18] 新 version なしの 02:18 にも max 13.6 ms (p50 6.1 ms) — 冷えた isolate 全般で起きる (`H4_preview_checks.md` 補足)。errors 0。定常の p50 は約 3 ms、max 8.3 ms。
- 記録が 445 byte と小さいため merge / encode の負荷はほぼ 0。H3 の local bench (PUT 全量は 250〜300 KB で 10 ms) までは 約 600 倍の余裕。
- **D-224 の結論: Free のまま (H3 §5 の選択肢 D「様子見」)**。ユーザー判断が要る「10 ms 近く / 超」には当たらない (超過は起動時だけ、エラー 0)。
- 監視: H6 で運用手順に「月 1 回 `STRLEN learn:owner:v2` と上の GraphQL で p50 / max / errors を見る、記録が 200 KB を超えたら A (Workers Paid) か B (分割) をユーザーへ」を入れる。

## 付記
- OWNER_KEY は会話に一度表示されたため、02:09:06 に rotate 済 (ユーザー、新 key は `~/.config/itp-owner/key` のみ)。
