# FAILURE ARCHIVE — quiz Phase 1.5 S98-B2 / 2015h27a-q086 / 前置文 意味ドリフト

- **Date filed**: 2026-06-20 (Session 98, Batch S98-B2)
- **Step**: Stage 6 Quiz Phase 1.5 (D-138) figure stem 源再構成
- **Verdict**: in-pipeline critic = PASS (見逃し) / 独立 Rule A auditor (code-reviewer) = faithful=false, source_faithful=false, medium

## 失敗内容 (defective product)
再構成 writer が非figure系の前置文で raw_stem のドリフトを継承し、backup/源 (page-37) と乖離:

- **defective (再構成 jp)**: 「セルK204に質問項目の項目番号を入力すると，質問項目の評価が2以下だったアンケートの内容を**行ごとに**抽出し，アンケート抽出表中の同じ行に複写する。」
  - 指示語「その」脱落 / 抽出元「アンケート集計表から」削除 / 源に無い「行ごとに」を捏造。
- defective zh: 「将**逐行**抽取该问题项评价为2以下的问卷内容…」
- defective en: 「…are extracted **row by row** and copied…」

## 技術判定
JSON valid・merge 成功・回帰 (選択肢表混入) なし。構造的には通過。in-pipeline critic も PASS。

## 業務判定
**意味劣化 (faithfulness 欠陥)**。ただし答案非依存 (J3 ロジック・表引き軸は不変、正解ウは導出可能) のため medium。源 page-37 + stem_corrupted_backup の双方が権威表現「**その**質問項目の評価が2以下だったアンケートの内容を**アンケート集計表から**抽出し」を保持。raw_stem のみがドリフト版で、再構成が raw を採用したのが誤り (backup を優先すべきだった = 非figure marked の照合原則)。

## 是正 (次 attempt)
主 context が backup どおりに jp/zh/en の前置文を是正 (S98-B2 で適用済、merge 反映、正解ウ不変)。独立 Rule A auditor が page-37 を実読し訂正案を提示済。

## 教訓 (fix-checklist)
- 非figure marked 問で raw_stem と backup が食い違う場合、**意味を担う前置文は backup を権威とする** (garble 数字は修復値、意味語は backup)。今回 writer が raw のパラフレーズ「行ごとに」を採用し source 句「アンケート集計表から」を失った。
- in-pipeline critic は前置文の微細な意味ドリフト (答案非依存) を見逃しうる → **独立 Rule A の N-sample が網兜** (写審分離の価値再実証)。
