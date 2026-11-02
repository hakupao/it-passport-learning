# b10 local e2e — attempt 1 (159/160)

- 日期: 2026-11-02 (S140)
- 输入: `PLAYWRIGHT_BASE_URL=http://localhost:3150`、`TEXTBOOK_E2E_UNITS` = 試点 3 + technology-22-60-u01〜u05、全量。
- 产物: `apps/web/test-results/textbook-v2-v2-units-at-39-47e11-…/` (gitignored)。
- 技术判定: `e2e/textbook-v2.spec.ts:266` (390px) 失敗、retry も同値。`technology-22-60-u01 /ja 390px pair aspect column` 期待 ≥56、実測 30。
- 业务判定: 実欠陥。u01 pairs[0] の「例」行の IPv6 アドレス (折り返し不能) が幅を取り、観点列が 1 字 1 行、表は box より 5px はみ出す (実測 330.8 / 326)。OQ-17 の同族。
- 下一 attempt 的输入: `.pairTable td` に `overflow-wrap: anywhere` (狭幅のみ) + 回帰 e2e。内容は不変。
