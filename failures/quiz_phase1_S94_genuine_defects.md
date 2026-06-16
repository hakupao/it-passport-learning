# Failure archive — S94 genuine translation defects (q018, q096), caught by independent Rule A

> Rule B (失敗 attempt 归档不删). Batch S94 (Session 94, 2026-06-16). 独立 Rule A critic が捕捉 → surgical 是正 → 独立検証 critic 再検証 PASS。正解 key は両件不変。
> (q052 の REGRESSION は別ファイル `quiz_phase1_S94_2013h25a-q052_regression.md`)

## 1. `2012h24h-q018` — 専門用語誤訳 (high)
- 設問: 規模が小さい/単一事業/安定顧客に最適な組織構造。correct_answer = **イ = 職能別組織** (=functional organization)。
- **defect**: 正解選択肢イ の訳が zh `职务制组织` / en `Job-function organization`。
  - `职务` = post/duty ≠ `职能` = function。本土定訳は `职能制组织`。中国語学習者が選択肢イ を functional organization と認識できず、「小規模→機能別組織」の正答根拠が zh 側で繋がらない。
  - 根因: supply glossary が「機能別組織→职能制组织」と「職能別組織→职务制组织」を分裂 (同概念) → translator が分裂エントリを踏襲。
- **fix**: `choices.イ.zh` → `职能制组织`、`choices.イ.en` → `Functional organization` (S92 q025 の確証訳と一致)。他選択肢/stem 不変。
- **verify**: 独立 critic 再検証 = PASS (源照合・正解イ語義復元)。glossary 分裂は textbook glossary backlog。

## 2. `2013h25h-q096` — clean stem の figure 忠実度欠陥 (high)
- 設問: 表計算ワークシート、F14 の計算式を問う。correct_answer = **イ = C14*1.1** (E2 設定に非依存、不変)。
- **defect** (translator の clean stem 再構成):
  - E2 セル設定: clean = `"D2/D14"` を `E3〜E13` に複写。
  - figure (page-44, 主 context が高解像度実読): `"D2／D$14"` を `E3〜E14` に複写。
  - (1) **絶対行参照 `$14` 脱落** (D14 → 複写時に分母が相対化し誤計算)、(2) 複写範囲 E13 ≠ E14。$ は複写セマンティクスに必須。
- **fix** (stem_jp_clean / stem.zh / stem.en の 3 箇所): `D2/D14` → `D2/D$14`、`E3〜E13` → `E3〜E14`。
  - **glyph 決定**: figure は全角演算子 (／＋＊) だが、q096 の D2/F2/全選択肢が半角、かつ選択肢は上流 choices_jp 由来 (半角) で非変更。**問内一貫性を優先し E2 除算も半角 `/` に統一** ($14・E14 の意味修正は保持)。corpus に全角/半角の統一規約なし (2026r08 全角・2023r05 半角で混在実測、translator が figure 毎に選択)。
- **verify**: 独立 critic 再検証 = PASS (figure 照合・$14/E14 一致・正解イ不変) + 主 context が page-44 を直接高解像度実読し確認。
- choice ア (`C14*(D14*0.1)` vs figure `C14＋(D14＊0.1)`、＋→* の意味変化) は上流 choices_jp garble → backlog (本 fix 対象外)。

## 下一 attempt 输入 (lesson)
- glossary の同概念分裂エントリ (機能別/職能別→职能制/职务制) は translator 誤訳の温床 → textbook glossary 統一 backlog。
- repair-recovered (FAIL→PASS) の figure 問は in-pipeline reviewer の PASS を信用しすぎない: q096 は repair で PASS したが clean stem の $14 脱落が残存し、独立 Rule A が捕捉 (S88 q072 と同型、構造検査≠意味検査)。
