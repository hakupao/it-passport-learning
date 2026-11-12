# RETROSPECTIVE — 配信移設 (Vercel → Cloudflare 静的出力 + 小 Worker) + 三言語混入検査

> Rule C。対象 = D-217〜D-226、計画 `docs/phase5/PLAN_hosting_migration.md` の Track H (H0〜H8) と Track L (L1〜L5)。
> 期間: 2026-11-11 (S154、OQ-21 登録) 〜 2026-11-12 06:25 UTC (H7 完了)。記録: `docs/discussion/2026-11-11-session-154.md`、evidence `evidence/phase5/hosting/` (`_progress.json`・`trace.jsonl`・`audit_matrix.md`)、failures `failures/phase5/hosting/` (9 件 + log 1)。

## 結果
- 本番 `itlearn.bojiangz.com` は Cloudflare Workers (静的 asset `out/` + `/api/*` だけの Worker) から配信。切替後の prod smoke 30/30 (canonical 込み)、Web Analytics 設定後 6/6。Vercel project は pause (旧 host 503)、削除はしていない (D-226)。
- `out/` = 16,194 ファイル (Free 上限 20,000、余り 3,806 = 19%)。過去問詳細・用語詳細も HTML で事前生成し、2 系統の `.txt` 12,885 を export 後に削除 (D-223 = A′)。
- 内容の同一性 (H5、Rule A): textbook 735 ページ全件 + 抽出 30 (+ 補足 30。`H5_fidelity.md` の結論行は「27」だが内訳は 6 + 3 + 12 + 9 = 30) で real regression 0。差分はすべて L4 の内容修正に由来することを対照基線 (main のコード + 新データ) で証明。local Playwright 159 passed / 0 failed / 2 skipped。
- 所有者 Worker の CPU (D-224): preview・本番とも errors 0、定常 p50 約 3 ms。記録は 445 byte。
- 三言語混入: L4 で zh の日本語語彙・UI 文言・hook の `[[jp:]]` を修正 (fidelity 基線の変化 319 欄 = 承認集合と多 0・少 0)。L5 で恒久関門 (`lang-leak-scan --gate`、許可 522 項目 / 659 当たり、位置指定) を `build:cf` の先頭に入れた。

## 保留下来的做法
- **審査の種類を変えた独立 Rule D が、書き手のテストを通った欠陥を止めた**。robots.txt の緩和版の crawl trap (`/practice?…` が取得ごとに新しい seed へ転送、step_00)、H1-2 の解説塊が「JP + ページ言語」だけで言語切替時に日本語が `lang="en"` で出る (H1-2 attempt 1)、H3 の開放リダイレクト 7 形 (writer の 15 種のテストは全通過、security-reviewer が正規化後の `//` を発見)、L5 の許可リスト再生成が新しい混入を吸い込む (M-2)、L4 の「担当者→负责人」が同じ欄の既存「负责人」と衝突 (H-1)。いずれも verifier / critic / security-reviewer / code-reviewer を役割で使い分けた結果。
- **対照基線で「差分の原因」を分けた** (H5)。main と branch を比べるだけでは L4 の内容修正と配信変更の回帰が混ざる。main のコードに新データを載せた基線 2 を作り、本文差がすべて 0 になることで回帰 0 を示せた。
- **関門が自分の書き込みを止める作りにした**。L4 第 2 回施工 attempt 1 は、許可していない派生欄 (`summary.memory_hooks_zh`) の変化で工具が units を書かずに止まった → 全復元 → 許可リストに足して attempt 2。欄単位の全量比較 (承認置換の順適用と逐字一致) と組み合わせ、データ修正を機械的に証明した。
- **数字を測ってからユーザーに選んでもらった**。H2 は詳細ページを実際に生成してファイル数 (A 約 29,080 / A′ 約 16,190 / B 約 3,370) を出し、D-223 はその数字で決まった。D-224 も「Free で実記録を測ってから」にし、実測で Free 継続が確定した。
- **branch + preview で完結させ、本番は 1 回で切り替えた** (D-218)。Vercel 本番は切替まで robots.txt 以外不変。戻し方 (DNS 値・戻し先 deployment・`vercel project resume`) を切替前に記録した (D-226、`H7_cutover.md`)。
- **三言語検査を切替前の関門にし、そのまま毎 build の関門にした** (Track L)。一回の掃除で終わらせず、`build:cf` の第 1 段にしたので以後の内容 push も通る。

## 必须补上的缺口
- **STATE.md を H3〜H7 の間 更新しなかった** (D-027 §3 違反)。session log と `_progress.json` は毎 step 書いたが、STATE の「次セッション」は「H3 作業中」、锁定决策は 224 (D-225・D-226 未計上)、OQ-22 欄は「協議中」のまま本番切替まで進んだ。H8 で修正。→ step を閉じるたびに STATE の 3 欄 (当前阶段・锁定决策・次セッション) を触る。`_progress.json` は STATE の代わりにならない。
- **ユーザー判断の材料 (H2 資料) に誤りと未確認が残っていた**。誤り = 「prefetch の 404 は asset 要求なので無料」(Worker を置くと非 navigation の `.txt` 取得は Worker 要求を消費する)。未確認のまま = Workers Paid のファイル上限 (実際は 100,000)。どちらも H1-4 の審査で判明し、判断 (A′) には影響しなかったが、ユーザーに選んでもらう前に一次資料で埋められる「未確認」は埋める。
- **local で本物の asset 配信を再現できなかった**。`wrangler dev` が 16k ファイルで spawn EBADF (4.156・4.160 の 2 回)、e2e は自作の静的 server で代用し、asset 層の挙動 (auto-trailing-slash、`_redirects` の query 保持、同名ファイルとディレクトリ) は preview の curl で初めて確認した。加えて apps/web で `wrangler dev` を走らせると `.env.local` (本番 Upstash) を読む — Stage 7 retro の「e2e 手順が本番 Redis を読む」と同じ型の穴。
- **IPA 原本の混入検査 (規則 (c)) は CI で走らない**。Workers Builds の clone には gitignored な原本が無いため `--no-ipa-sources`。担保は local の pre-push hook (`check:release`) だけで、`core.hooksPath` は local 設定 (版管理されない)。新しい clone や別の機械からの push では効かない。
- **Worker CPU の余裕は大きくない**。445 byte の記録でも冷えた isolate では max 26.2 ms (Free の 10 ms 超、errors 0)。H3 の bench (local の Node V8 による代理指標からの推定) では、PUT 約 250〜300 KB・GET 約 400 KB で定常でも 10 ms に達する見込み。監視は `cf-monitor.ts` (月 1 回、200 KB でユーザーへ) のみ。
- **`/api/*` に rate limit が無い**。zone の rate limiting 枠 1/1 が既存規則で埋まっており、ユーザー判断で付けなかった。非所有者は 403、Worker 無料枠 10 万 / 日を超えても静的ページは無影響、という前提に依存する。
- **watch paths のパス基準が未確定**。docs だけの push が skip されることは確認済だが、repo root 基準か root directory (`apps/web`) 基準かは `apps/web` の外だけを変える最初の内容 push (D-206 の `data/ip/**` 等) まで分からない。root directory 基準なら内容 push が本番に出ない。
- **local の検証道具が環境と呼び方に脆い**。H5 の比較道具は main 側の `/_vercel/*` 転送ループで networkidle を待ち続けた (attempt 1)。H7 の新 `local-e2e.sh` は試点単元を `$1` に渡す誤りと `PLAYWRIGHT_BROWSERS_PATH` の不在 dir で初回失敗した (abfe7ecf で早期失敗と拒否を追加、env はユーザー判断で未解決)。道具は「待つ前に余計な要求を abort」「前提を最初に検査」を既定にする。
- **外部取得に依存した build が 2 回落ちた** (`next/font/google` の一時失敗、H1-3・H2)。H1-5 で font を同梱して解消したが、build を外部ネットワークに依存させない方針は最初から持っておく。

## 关键决策复盘
- **D-217 (3 段、ADR) は実測前に段取りまで lock した**。1 日のうちに D-218 (第 1 段を Vercel で行わない) と D-223 (詳細ページも事前生成、ADR の第 2 段 3 と逆) で本文の 2 箇所が覆った。方向 (静的化 → Cloudflare) は正しかったが、細目は「実測後に決める」と書いておけばよかった。ADR には実績節を追記し、覆った行に注記した。
- **D-218 直接 Cloudflare**: 正解。Vercel 上の中間段を省いたことで、移設のための本番投入は robots.txt (第 0 段) と切替だけで済み、移動窓の告警中に Vercel の枠を使わなかった。
- **D-223 A′**: 余り 3,806 ファイル ≒ 試験回 12 回分 (D-223 の見積)。年 2 回の追加なら数年は持つが、上限は来る。超えたら Workers Paid (100,000 ファイル) か B (詳細を browser 読込) を改めて選ぶ。代償の「詳細へは通常のページ読込」は H5 で壊れないことを確認済。
- **D-224 Free で実測**: 定常 p50 約 3 ms で Free を継続。冷えた isolate の超過は errors 0 で受容。記録が大きくなったときの判断 (Paid か D-190 の分片化) は先送りのまま。
- **D-225 Workers Builds**: push だけで本番に出る運用になり、手動 deploy は H4 の 1 回だけ。代わりに規則 (c) が CI から外れた (上の缺口)。Preview Builds は「H7 で決める」としたが H7 で決めておらず、OQ-23 に登録した。
- **D-226 Vercel は停止のみ・削除しない**: 戻し道を残し、Upstash (Vercel Marketplace 統合、S126) を壊さなかった。後始末の時期は OQ-24。
- **D-221・D-222 (三言語の方針、委任判断)**: hook も `[[jp:]]` にしたことで描画の `lang` が正しくなった。D-222 は審査で 3 点改訂 (担当者の訳し分け・指摘/试作は出現ごと・个人编号法) — 機械置換の方針は「同じ欄の既存語と衝突しないか」を先に見る。
- **WAF rate limit を付けない (ユーザー選択)**: 既存規則を動かさない判断は妥当。Worker 要求数は `cf-monitor.ts` で見る。

## 次 (移設後の残り)
- 本 retro の「缺口」の追従と H7 の carry は session-154 末尾「What's Next (H8 後)」と STATE「次セッション」に移した。ユーザー判断が要るものは OQ-23 (Preview Builds)・OQ-24 (Vercel project・Upstash 統合の後始末)。
