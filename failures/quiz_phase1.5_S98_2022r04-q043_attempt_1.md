# FAILURE ARCHIVE — quiz_phase1.5 S98 / 2022r04-q043 / attempt 1

Rule B archive. Defective product preserved at
`quiz_phase1.5_S98_2022r04-q043_attempt_1_defective.json`.

## 入力
- 問: 2022r04-q043 (figure / アローダイアグラム CPM 問題)
- raw_stem: 「…作業 D に当初29名が割り当てられているとき…」(OCR)
- current_clean: 同上「当初29名」
- 権威源 (figure_page_png): `/Users/bojiangzhang/MyProject/IT-Passport-Learning/data/ip/exams/pages/2022r04/page-20.png`
- correct_answer: エ (=5)

## 産物 (attempt 1 = 差し戻し対象)
- stem_jp_clean / zh / en すべて「当初29名 / 最初分配了29名 / 29 people」を採用。
- changed=false, change_summary_jp=「忠実、変更なし」。

## 技術判定
- 図のアローダイアグラム値 (A=5,C=5,B=10,D=10,E=4,F=4) は照合済みだが、
  **stem 本文に埋め込まれた数値「当初◯名」を源と逐項照合していなかった** (検証の死角)。

## 業務判定 (FAIL)
- 権威源 page-20.png を 3倍拡大して逐字照合した結果、本文は明確に
  「作業 D に**当初20名**が割り当てられているとき」= **20名**。
  OCR が 20→29 を誤読していた。
- CPM 検算でも 20名 が正であることを確認:
  - 元の総工期 = max(A+C=10, B=10) → +D=10 = 20日。D は臨界。
  - B が2日遅延 → 合流ノード到達 12日。20日厳守には D を 8日に短縮。
  - D = 20名×10日 = 200人日。200/8 = 25名。追加 = 25−20 = **5名 = エ**。再現 OK。
  - 誤値 29名 では 290/8=36.25→37名、追加8名となり エ を再現できず supports_key 不成立。
- よって changed=false は誤り。value-correction (29→20) が必須。

## 次 attempt 入力 (= attempt 2 で実施)
1. stem_jp_clean の「当初29名」→「当初20名」へ是正。
2. zh「最初分配了29名」→「最初分配了20名」、en「29 people」→「20 people」へ同期。
3. changed=true、change_summary_jp に value-correction (本文埋め込み数値 29→20 を図照合で是正) を明記。
4. derived_answer=エ (CPM 再現)。
5. 派生 corpus 側 (この stem_*.json) で是正。上流 raw_stem/current_clean の OCR 誤読は派生で吸収。

## fix-checklist 追加 (横展開)
- **figure 問では本文に埋め込まれた数値も源 (フルページ) と逐項照合する**。
  図中の表/ダイアグラム値だけ照合して本文数値を未照合にすると drift を見逃す。
