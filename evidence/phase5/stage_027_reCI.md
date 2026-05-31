# Stage 2.7 — 再CI（D-122 ゲート条件5：修復後の残存欠陥率実測）

## 方法
- 修復後データから **非候補（untouched）40題** を層化ランダム抽出（seed 20260531）。
- 独立 general-purpose+Opus でブラインド再読み → stored と機械 diff（stem<0.72 / choice<0.70 で乖離フラグ）。
- 乖離 = 元スキャンが見逃した可能性（false-negative）→ **主ループで実ページ裁定**。

## 結果
- 機械 diff 乖離: **4/40 = 10.0%**（Wilson95 4.0–23.1%）。全て stem 一致・choices のみ乖離。
- **主ループ実ページ裁定**:
  | id | 判定 |
  |---|---|
  | 2016h28a-q044 | 偽アラーム（印刷=stored正、再CIブラインドがイ/ウ入替誤り） |
  | 2012h24a-q033 | 偽アラーム（印刷イ「過不足」=stored正、再CIブラインド「適不適」誤り） |
  | 2011h23a-q087 | 偽アラーム（stored正、再CIブラインドが複数choiceで paraphrase 誤り） |
  | 2018h30a-q090 | **真の見逃し**（印刷エ「雑多な…関係がない」≠ stored「親族…関係がある」）。但し正答はウ(CAPTCHA)で**不変**。`s027_choice_anomaly`+`s027_fn_recI`フラグ |
- **真の false-negative ≈ 1/40 = 2.5%**（Wilson95 ~0.4–13%、distractor 語句のみ・答え不変）。
- 重要: 再CIブラインド自身が3/4で stored より不正確 → **元の double-blind（2読み一致）の方が単一読みより正確**を実証。単一ブラインドの choice-level recall は不完全だが、double-blind + reconcile で担保されている。

## 残存欠陥率（census + 再CI）
- 既知未解決: 62 `s027_unresolved` + 8 `s027_choice_anomaly` ≈ **2.4%**（answer_keys 不変）。
- 推定 subtle-choice false-negative（untouched）: ~2.5%（distractor 語句中心、答え不変）。
- **合計残存 ≈ 5%、全て answer-key 保存**。content_mismatch（別問題化）/ 致命的 garble（stage4 を毒する主因）は除去済。

## ゲート判定（D-122 条件5）
- 修復前 ~12-15% critical（content_mismatch + 致命 garble）→ 修復後 残存 ≈5%（subtle choice 中心、答え不変）。
- 主毒（stem 別問題化・致命 garble）は除去。残りは distractor 語句・表/式 choices の二次課題。
- **ユーザー受容待ち** → 受容で Stage 3 開始可。
