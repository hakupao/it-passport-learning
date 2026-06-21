# FAILURE ARCHIVE — quiz Phase 1.5 S98-B4 / 2011h23a-q100 / correct_answer 取り違え (イ→ウ)

- **Date filed**: 2026-06-21 (Session 98, Batch S98-B4)
- **Step**: Stage 6 Quiz Phase 1.5 (D-138) figure stem 源再構成 → derived≠key 検出 + 主 context 図実読・検算
- **Verdict**: writer derived_answer=ウ ≠ 入力 correct_answer=イ → 主 context が page-43 表1 を crop+3x 実読し期待値計算で裁決 = **入力 key 誤り**

## 失敗内容 (defective input)
上流入力の **correct_answer が「イ」(ダイレクトメール)**。図 (page-43 問100 表1) + 設問定義 (予想利益 = 効果金額の期待値 − 費用、確率 大0.2/中0.5/小0.3、最大の販売促進策を選ぶ) から導かれる正解は **「ウ」(電子メール)**。

## 表1 (page-43、crop+3x 実読、単位 百万円)
| 販売促進策 | 費用 | 大 | 中 | 小 | 予想利益 (大×0.2+中×0.5+小×0.3−費用) |
|---|---|---|---|---|---|
| ア 商品発表会兼商談会への招待 | 7 | 15 | 12 | 6 | 10.8−7 = **3.8** |
| イ ダイレクトメール (入力 key) | 6 | 15 | 10 | 5 | 9.5−6 = **3.5** |
| ウ 電子メール | 3 | 10 | 8 | 5 | 7.5−3 = **4.5** ← 最大 |
| エ 電話 | 5 | 12 | 10 | 5 | 8.9−5 = **3.9** |

**最大予想利益 = ウ (電子メール) 4.5** → 正解ウ。入力 key イ (3.5) は最大でない。

## 技術判定
stem 再構成は図と逐セル忠実 (current_clean 採用、表全行・全値・条件文・確率一致)。source_faithful / no_fabrication / no_choice_table_leak / trilingual_consistent すべて true。JSON valid。

## 業務判定
**入力 correct_answer が誤り (answer-affecting、上流 Stage 2 欠陥)**。stem (Phase 1.5 成果物) は健全。**D-138 は answer key を変更しないため key は不変** → key トラック backlog (要ユーザー判断)。`2015h27h-q100` (B2)・`2009h21a-q091` (B4) に続く**本 session 3 件目の確定 bad key**。

## 教訓
S97 figkey 監査 (40/247 図題抽様、strict 坏键率 0/40) はこの種を捕捉できなかった (q100 は図題だが非抽様)。**figure 問でも 40-sample では bad key を取りこぼす — Phase 2 key-guard を全問 (図+非図) に効かせ、図から keyed answer を再導出できない問を flag するのが必須**。writer の derived_answer が key と独立 (honest derivation) のとき surface するが、writer が key に寄せると surface しない (cf. q092) → 独立 critic + 主 context 高倍率実読の多段が adjudication に必須。
