# Quiz Phase 1.5 (stem 源再構成) — Batch S98-B4 audit (最終バッチ)

> Session 98 (2026-06-21) / D-138. 全 29 回 scale の第 4 (最終) バッチ。
> 範囲: 5 回 (2011h23a / 2010h22a / 2010h22h / 2009h21a / 2009h21h)、141 問 (figure 121 / nonfig 20)。

## reconstruct (2 段 + transient fix)
- 初回 `wf_d43e9332-ef2`: daily cap (resets 03:00 JST) を recon 段階で直撃 → 11/141 のみ完了。
- resume `wf_d5ec2fb8-c87` (quota 回復後、skip-existing で残 130): 130 → **done 129、PASS 124 / CONCERNS 5**。1 件 `2009h21h-q062` が transient API 500 で recon 失敗。
- transient fix `wf_c0864a0e-34c`: q062 単独再走 → PASS (derived エ=key、忠実)。**合計 141/141 reconstruct 完了**。changed 42+。

## triage (主 context 図 crop+高倍率実読 + 独立 Rule A)

### 修正した stem (faithfulness 欠陥、答案不変)
- **`2010h22a-q086`** (Rule A medium、source_faithful=false): writer が figure と**逆方向**の語句変更 (「処理依頼/処理される」→「処理要求/処理できる」) を「OCR 是正」と誤称。backup + page-33 (auditor 6x 実読) が「処理依頼/処理される」を支持 → jp/zh/en を figure 通り復元 (受動「処理される/所处理/is processed」)。正解エ不変。Rule B archive。

### 確定 bad key 2 件 (HIGH、stem は忠実、D-138 stem scope 外、要ユーザー判断)
- **`2009h21a-q091`** (key=ウ、独立導出=イ): figure (page-35) の引当問。前日在庫100・仕入なし・注文 80/10/40。引当ロジック (FIFO でも優先先取りでも) → 11:00 注文への引当可能数 = 10 = **イ**。14 (ウ) を導く経路なし。**stored key ウ は誤 → イ**。主 context + 独立 auditor 一致。writer が `failures/..._2009h21a-q091_answerkey_mismatch.md` archive 済。
- **`2011h23a-q100`** (key=イ、独立導出=ウ): figure (page-43、crop+3x 実読) の販促費用効果表。予想利益 = 期待値 (大0.2/中0.5/小0.3) − 費用: ア3.8/イ3.5/ウ**4.5**/エ3.9 → 最大 = **ウ (電子メール)**。**stored key イ は誤 → ウ**。主 context 検算 + 独立 auditor 一致。`failures/..._2011h23a-q100_answerkey_mismatch.md` archive。

### CONCERNS (stem 忠実、別軸 backlog)
- **`2010h22a-q061`** (Rule A medium): stem は page-23 逐セル忠実 (key ウ 導出可)。だが **choices_jp.ウ/エ の式が破損** (外側 剰余(…,10) 欠落等) で日本語選択肢から key 非導出 → choices backlog (zh/en は正)。
- **`2010h22h-q077`** (FAIL→CONCERNS): writer が zh/en stem の直列/並列の意味反転 (「両方故障で停止=並列」誤訳→直列に是正) を修正。stem 忠実、derived イ=key。残 CONCERNS = **choices_jp ア/イ のグラフ説明文 swap** (既知 backlog、S96 登録済 `2010h22h-q077`)。
- **`2010h22a-q064`** (Rule A low): stem は page-24 忠実 (key エ 導出可)。choices_jp の回路図ラベル文が図と loose (字面不一致) → choices backlog。stem ACCEPT。
- **`2010h22h-q090`** (前バッチ change_summary で writer 申告): figure_png crop が隣問 (q091 のデータ表) を写す crop ミスマッチ → 図管線 backlog (S90 `2019h31h-q061` 型)。

## merge / 回帰
- 5 回 (q086 修復後の 2010h22a 再 merge 含む) すべて **missing 0** (updated 141)。choices/answer keys/questions.json/quiz_index/figure 不変。回帰 (選択肢表混入) = 全 141 **leak 0**。

## 独立 Rule A (WF `wf_533a51b7-a96`、auditor=code-reviewer ≠ critic ≠ writer、N=27、強制 8)
- **faithful 26/27** (raw)、severity none14/low8/medium3/high2、**leak 0**、keyMismatch 2 (q091/q100=bad key)。
- source_faithful=false 1 = `2010h22a-q086` (→ **修正済**)。**修正後の実効 stem 欠陥 0/27**。high 2 は両方 bad key (stem は忠実、key 軸)。

## 検証
- 修復後 sidecar JSON valid。diff は stem フィールドのみ。tsc/eslint/vitest/build/nft は最終バッチ commit 後に全 29 回 state で full 実行 (本 session 末尾 = STATE 参照)。

## backlog (D-138 stem scope 外、B4 追加分)
- **key (HIGH)**: `2009h21a-q091` (→イ=10)・`2011h23a-q100` (→ウ) = 確定 bad key (figure 導出 + 独立 auditor 一致)。S97 figkey 抽様 40/247 が捕捉できず。
- **choices**: `2010h22a-q061` (choices_jp 式破損、zh/en 正)・`2010h22h-q077` (choices ア/イ グラフ説明 swap、既知)・`2010h22a-q064` (回路図ラベル loose)。
- **図管線**: `2010h22h-q090` (figure_png crop が隣問を写す)。
