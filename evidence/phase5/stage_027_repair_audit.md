# Stage 2.7 — 修復適用 + Rule A 独立監査

> Session 74。D-122/D-123/D-124。全2900題ブラインドスキャン→候補603→全候補独立2nd検証→reconcile→確定419適用。

## 検証 + reconcile（double-blind）

- 全603候補に 2nd 独立 Opus ブラインド（Rule D `code-reviewer` lane、stored/1st-blind 非開示）。`_verify_master.json` 603/603。
- reconcile（`stage027-reconcile.mjs`, AGREE=0.62 / STORED_OK=0.82, double-blind 一致判定）:
  - **確定 419**（content_mismatch 200 + ocr_garble_critical 219、stem修復 230 + choices修復 299）
  - 偽陽性 20（blind の軽微誤読で stored は健全）
  - escalate 164（15 verify_not_found + 149 真3者相違＝最難 garble/表）

## 適用（`stage027-apply.mjs --commit`）

- 419題修復。backup `question_bank.json.pre-s027` + `by_year/*.pre-s027`、原値 `*_jp_corrupted_backup`、フラグ `stem/choices_resourced_s7x` + `s027_severity`。
- **不変**: correct_answer / answer_keys.json / figure_path / group_id / source（確認済）。空stem/空answer 0。

## Rule A 独立監査（N=20 層化、独立 general-purpose+Opus lane）

| verdict | 件数 | 意味 |
|---|---|---|
| match | **17 (85%)** | 適用テキストが印刷と忠実一致 |
| minor_diff | 2 (10%) | 同一問題・答え不変の軽微 artifact（q018 stem に英単語"while"混入 / q011 "部品Y"重複・末尾条件節欠落） |
| mismatch | **1 (5%)** | 2013h25h-q010 choice ウ がエと重複（正しいウ欠落）。答え自体は不変だが選択肢誤り |

→ **19/20 = 95% が「正問・答え正しい」**。stored の全壊状態（別問題/garble）からは大幅改善。残 ~5% は vision 再転写の choice レベル残存誤り。

## 機械検出した残存 anomaly（419中）

- 重複選択肢 6: 2010h22h-q095 / 2013h25a-q093 / 2013h25h-q010 / 2014h26a-q099 / 2015h27a-q086 / 2018h30a-q019
- 空選択肢 3: 2010h22h-q095 / 2014h26a-q099 / 2015h27a-q086（表画像選択肢系の可能性）
- stem 英単語混入 2: 2011h23tokubetsu-q100 / 2022r04-q096（+ 監査の 2017h29a-q018）

## 残課題

1. escalate 164（最難ケース、未修復）+ 上記 anomaly ~9 → 3rd読み多数決 or 主ループ視認で要解決。
2. 再サンプル CI（残存欠陥率の実測、D-122 ゲート条件5）。
