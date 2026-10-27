# Stage 7 OQ-13 — 本番 e2e 1 回目 (1 件失敗、再現せず)

- 日期: 2026-10-27 (S134)
- 输入: main `0bb90f4` (OQ-13 / D-194: `8dde396`〜`d4eb6f6`) を push、Vercel status success 後、本番 alias に対し `pnpm exec playwright test --retries=0` 全量。
- 产物: 107 passed / **1 failed** = `e2e/practice.spec.ts:379` 「practice ja: one column — choices one per line, explanation under them at the face's width (OQ-13)」(4.1m)。
- 技术判定: 失敗内容 (assert / 値) は **未保存** — controller が `| tail -15` で出力を切り、直後の単独再実行で `test-results/` も上書きされた。原因は特定できていない。
- 再現試行: 同 test 単独 `--repeat-each=3` 6/6 (OQ-13 2 件)・`--repeat-each=20` 20/20、`practice.spec.ts` 全体 `--repeat-each=2` 20/20、全量 2 回目 (`--reporter=list`、完全ログ保存) **108/108**。すべて本番。
- 业务判定: 機能は本番で仕様どおり (2 回目全量 PASS + 本番截図 4 枚を controller 目視)。ただし本 test は本番で flaky の可能性あり (候補: 本番の遅延下で scroll 収束判定 `toPass` の 200ms 2 点一致が scroll 開始前に成立 → h2 viewport 断言で失敗、または初回 Vercel cold start)。
- 下一 attempt 的输入: 本番 e2e は今後 `--reporter=list` で全ログを scratchpad に保存してから要約する (tail で切らない)。再発時はその assert 値で原因を確定し、必要なら収束判定を「scrollY > 0 かつ 2 点一致」にする。
