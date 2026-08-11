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

---

## 解決 (2026-08-11 / Session 111 §5) — 追記のみ、上記本文は改変せず

**Status: RESOLVED**

S98 時点では questions.json 側のみ「ウ→イ」に是正し、`data/ip/exams/answer_keys.json`
(公式解答冊子の抽出物) は **ウ のまま据え置いていた** — 公式解答冊子の画像を持たず、
推測で公式記録を書き換えないという方針のため。この片側是正が S110/S111 で
「answer_keys ↔ questions 交叉核対の唯一の未解決 mismatch」として残っていた。

### 決着に用いた材料

1. `pages/2009h21a/page-35.png` 問91 部分をユーザーへ提示 (stem・表・選択肢)。
   OCR ではなく**原ページ画像そのもの**を見せて判断を仰いだ。
2. 引当計算 100 − 80 − 10 = 10 ⇒ イ。優先注文先行 (100 − 10 − 80) でも同じ 10。
   **ウ = 14 は表のどの数からも導出不能**。
3. **系統的オフセットの否定**: 同一ページ下半の q92 (請求処理) を独立に解いて
   90,000 = イ を得、answer_keys と一致することを確認。88–90 / 93–94 も一致。
   ⇒ 91 は孤立した 1 セルの抽出誤り。

### 実施した是正

`data/ip/exams/answer_keys.json` → `2009h21a.answers["91"]` を **ウ → イ**。

### 事後 invariant

**answer_keys ↔ questions の交叉核対 = 2900 問中 mismatch 0**。

### 追加の教訓 (S98 の教訓に足すもの)

S98 の教訓は「入力の correct_answer を無条件に信頼するな」だった。S111 で足りないものが分かった:
**是正の宛先が「派生物」か「公式記録の抽出物」かで、必要な裏づけの水準が違う。**
派生物 (questions.json) は源からの実検算で直せる。公式記録の抽出物 (answer_keys.json) は
源が別 (解答冊子) なので、実検算だけでは根拠が足りず、**人間の確認まで保留するのが正しい**。
S98 が片側だけ直して片側を保留したのは、迷いではなく正しい判断だった。
足りなかったのは「保留した側を追跡し、決着させる導線」の方。

### 是正は手編集でなく tracked script として残した

`.gitignore` の `/data/ip/*` により **`data/ip/exams/answer_keys.json` は untracked**
(raw exams 系は著作権・容量でローカル保持。`data/ip/quiz/questions.json` は tracked)。
手で直すと git から見えず、clone し直しや再抽出で黙って失われる。

→ 是正は **`scripts/answerkey-fix-S111-2009h21a-q091.mjs`** (tracked、冪等、期待値ガード付き)。
実行後に answer_keys ↔ questions 交叉核対を自走し、mismatch があれば exit 1。
S110 の `quiz-keyfix-S110.mjs` と同じ流儀。

**gitignored なデータへの是正は、必ず tracked な再実行可能スクリプトの形で残すこと。**
