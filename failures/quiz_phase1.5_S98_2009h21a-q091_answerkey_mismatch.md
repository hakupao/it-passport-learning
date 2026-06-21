# FAILURE ARCHIVE — quiz Phase 1.5 S98-B4 / 2009h21a-q091 / correct_answer 取り違え (ウ→イ)

- **Date filed**: 2026-06-21 (Session 98, Batch S98-B4)
- **Step**: Stage 6 Quiz Phase 1.5 (D-138) figure stem 源再構成
- **Verdict**: 前ラウンド in-pipeline critic = supports_key=false (FAIL) / 図・計算からの独立検算 = 入力 correct_answer 誤り

## 失敗内容 (defective input)
上流入力 `input_batch_S98-B4.json` の questions[id==2009h21a-q091] の **correct_answer が「ウ」(=14)**。
図 (figure_page_png: pages/2009h21a/page-35.png 問91) と計算から導かれる正解は **「イ」(=10)**。

- choices_jp: ア 7 / イ 10 / ウ 14 / エ 20
- 入力 correct_answer: 「ウ」(=14) ← 誤り
- 図・計算からの正解: 「イ」(=10)

## 技術判定
stem 再構成は図と逐セル完全一致 (prose・表ヘッダ 注文時刻/注文種別/注文数・3行 10:00/通常注文/80, 10:30/優先注文/10, 11:00/通常注文/40・条件 仕入なし/前日在庫100)。
source_faithful / no_fabrication / no_choice_table_leak / trilingual_consistent はすべて true。
JSON も valid。構造・忠実性は通過。

## 業務判定
**答案取り違え (supports_key 欠陥)**。引当 (在庫引当) 計算:

- 前日業務終了時 在庫 = 100、この日の仕入 = なし。
- 10:00 通常注文 80 を引当 → 残 100 − 80 = 20
- 10:30 優先注文 10 を引当 → 残 20 − 10 = 10
- 11:00 通常注文 40 → 残 10 しか引当できない。

⇒ 11:00 の注文に対して引当可能な数量 = **10 = 選択肢イ**。
入力 correct_answer「ウ」(=14) は図・計算のいずれからも導けない。derived_answer は「イ」。

## 是正 (下流投入前)
- 上流 `input_batch_S98-B4.json` (および派生 corpus) の correct_answer を **「ウ」→「イ」** に是正すること。
- バッチ生成 (translation/explanation) で同様の正答取り違えが他問にも波及していないか確認すること。
- 本不一致を Rule B に従い本ファイルにアーカイブ (削除禁止)。

## 教訓 (fix-checklist)
- supports_key check は stem 忠実性とは独立の軸。図・計算から正答を**実検算**し、入力 correct_answer と必ず突合する。
- 入力の correct_answer を無条件に信頼しない。garble 修復・stem 再構成が完璧でも、答案誤りは別系統の欠陥として残りうる。
