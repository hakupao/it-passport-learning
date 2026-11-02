# b10 本番 e2e — flaky 1 件 (40 passed + 1 flaky)

- 日期: 2026-11-02 (S140)、main `dafb6f1`、配備確認後すぐ実行。
- 输入: `TEXTBOOK_E2E_UNITS` = technology-22-60-u01〜u05、`e2e/textbook-v2.spec.ts` + `e2e/textbook.spec.ts`。
- 技术判定: `textbook-v2.spec.ts:316` (/en の単語分断、S140 新規) の 1 回目が `page.goto` で 30 s タイムアウト (technology-22-60-u03 /en)。retry は 3.5 s で通過。検査値の不一致ではない。
- 业务判定: 製品の表示欠陥ではない。配備直後の初回アクセスの遅さと見るが、推定であり未確認。5 単元を順に開くので timeout を共有する点が新規テストの弱さ。
- 下一 attempt 的输入: なし (retry で通過)。再発したら当該テストに `test.setTimeout` を足す。
