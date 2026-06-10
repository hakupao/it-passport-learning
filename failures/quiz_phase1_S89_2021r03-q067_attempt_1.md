# Failure archive — Quiz Phase 1 S89: 2021r03-q067 attempt 1 (FAIL)

- **日付**: 2026-06-10 (Session 89)
- **工程**: Quiz Phase 1 翻訳 batch S89 (`wf_f492c4f7-038`)、translate.workflow repair ラウンド
- **入力**: `data/ip/quiz/.phase1/input_batch_S89.json` id=2021r03-q067 (figure 問、ISMS セキュリティ特性 a/b 組合せ、正解=ア)
- **産物 (欠陥)**: `quiz_phase1_S89_2021r03-q067_attempt_1_defective.json` (本ディレクトリに保存)

## 技術判定

ワークフロー機構は正常 (translate→review 2R 完走、StructuredOutput 整形 OK)。

## 業務判定 (FAIL)

**repair 誘発の回帰**。経緯:
1. R1 翻訳: ダミー選択肢 ウ/エ の a 項「保全性」を zh「保全性」/ en「Preservability」と訳出 → R1 reviewer は low (日式借词疑い) で CONCERNS、改善案として「保护性」を**誤って示唆**。
2. repair: translator が示唆を採用 → zh「保护性」/ en「Protectiveness」に改変。
3. R2 reviewer (別インスタンス) が FAIL 判定: 保全≠保護、「保护性/Protectiveness」は原文に無い捏造語。姉妹問 2020r02o-q087 は「保全性」を漢字保持しており内部不整合。正解アは不変 (ウ/エ は distractor) だが全選択肢忠実訳の原則違反。

## 次 attempt への入力

- ウ/エ の a 項のみピンポイント是正: zh「保护性」→「保全性」(姉妹問前例に倣い漢字保持)、en「Protectiveness」→「Preservation」。
- **en は Maintainability 不可** (同問 b 項の 保守性=Maintainability と衝突するため)。
- stem・他選択肢・stem_jp_clean は R2 reviewer が忠実と確認済み、触らない。

## 教訓

- reviewer の low 示唆 (改善案) を repair で機械採用すると、distractor 用語の意味的区別 (保全/保護) を壊しうる。repair は「指摘された欠陥の是正」に限定し、low の任意改善案は採用前に語義検証が要る。
