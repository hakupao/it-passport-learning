# Failure 記録 — Stage 3.5a apply が terms の樹外語過濾を省略 (Session 77, Rule B)

> 区分: 実装欠陥（部分失敗、データ修復可能）。重判結果自体は良好、terms 後処理のみ欠落。

## 入力
- 3.5a 重判 workflow（`wf_6fb3a415-d12`）の出力 59 mappings。各 mapping に mapper が付与した terms。
- 重判 prompt の terms 指示: 「index の用語リストから優先選択。**なければ題の核心語を最大3語**」。

## 産物（欠陥あり）
- `scripts/stage035-apply-rejudge.mjs` が mapper の terms をそのまま question_bank へ書込み。
- 結果: 17 重判題の terms に索引外造語（業務量/請求/売掛金/単価/値引率/CMMI/ワイルドカード 等）が混入。

## 技術判定
- apply は invariant（correct_answer 等）と非法 topic id は検証したが、**terms が knowledge_tree 由来か**は未検証。
- Stage 3 の reconcile（`stage03-reconcile.mjs`）は unknown_terms を索引照合で自動除去していた。当方の 3.5a パイプラインはこの過濾段を持たず、prompt の「なければ造る」指示と相まって造語が残留。

## 業務判定
- マッピングの primary/secondary/confidence は良好（Rule A で是認）。**terms のみ規則違反**（索引宣言「terms MUST be drawn from matched topic term lists」）。
- 影響: G4 用語講解で索引に無い語が tag され、用語リンクが切れる可能性。重大度: 中（primary は健全、terms は補助情報）。
- Rule A 監査（`wf_49b71ac7-9a5`）が体系的に検出 → 独立審計が機能した好例。

## 修復（次 attempt = 実施済）
- `scripts/stage035-clean-terms.mjs`: rejudged 題の terms を樹内語のみに過濾。非 rejudged 2841 題は Stage 3 清洗済のため対象外。
- 結果: 17 題清洗、8 題 terms 空（造語のみだった）、清洗後 全2900題で樹外 term 残存 0。invariant 不変。
- 証拠: `evidence/phase5/stage_035_audit.md`、`data/ip/exams/.tmp/s035/terms_clean_log.json`。

## 教訓
1. **再判パイプラインは Stage 3 の後処理（unknown_terms 過濾）を継承すべき**。新パイプラインで既存の正規化段を省くと退行する。
2. **prompt の「なければ造る」は索引制約と矛盾**。terms は「索引内のみ、無ければ空」が正しい（造語禁止）。将来の再判 prompt はこの制約を明示する。
3. **Rule A 入力に before/after 文脈を渡すべき**（補词監査の duplicate 誤判の教訓と対）。
