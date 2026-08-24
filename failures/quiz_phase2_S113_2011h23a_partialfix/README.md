# 失敗記録 (Rule B) — S113 / 2011h23a: 「部分是正が無是正より悪い状態を作った」

- **日付**: 2026-08-24 (Session 113、Phase 2 batch 11)
- **分類**: 是正スコープの取り残し (連鎖断裂)。**成果物の損失なし・出荷前に捕捉**。
- **捕捉者**: 独立再核験 (別 subagent_type `feature-dev:code-reviewer`、Rule D 2 巡目)

## 何が起きたか

Rule A / trsweep が挙げた medium 4 件を `quiz-phase2-explfix2-S113-2011h23a.mjs` で是正した。
そのパッチ自体が、**同じクラスの欠陥 (連鎖断裂) を新たに 2 件作った**。

### 残件A — q099 項目番号

| 経路 | explfix2 後の状態 |
|---|---|
| translations `stem_jp_clean` (JP 表示) | ✅ (1)(2)(3) |
| questions.json `choices_jp` | ✅ (1)(2)(3) |
| translations `choices.{zh,en}` | ✅ (1)(2)(3) |
| 解説 correct/distractors/points ×3言語 | ✅ (1)(2)(3) |
| **translations `stem.zh` / `stem.en`** | ❌ **①～③ のまま** |

→ zh/en 学習者には「①～③ を並べよ」と表示されるのに、選択肢は (1)(2)(3)。

### 残件B — q069 成績ラベル (こちらがより悪い)

explfix2 は **`correct.en` だけ**を「grade A/B/C/F」→ 源ラベル「優/良/可/不可」に戻した。結果:

| 経路 | explfix2 後の状態 |
|---|---|
| 解説 `correct.en` | 優/良/可/不可 |
| **解説 `distractors.イ/エ.en`** | ❌ grade A / grades B, C and F のまま |
| **設問 `stem.en` の表** | ❌ A / B / C / F のまま |

→ **解説が語るラベルが、en 学習者が見る表のどこにも存在しない**状態。
是正前は「A/B/C/F で全体が一貫していた (ただし列記号 B/C/D と衝突)」のに対し、
部分是正後は「一貫性も失い、衝突も残った」= **無是正より悪化**。

## なぜ起きたか

1. 是正対象を「Rule A / trsweep が名指ししたフィールド」に限定してしまった。
   検証者は自分が読んだ範囲を報告するのであって、**波及範囲の全経路を列挙してくれるわけではない**。
2. 表示経路が多い (jp clean / zh stem / en stem / choices ×3 / 解説 3ブロック ×3言語 = 15+)。
   そのうち 1 つでも漏らすと断裂するが、**漏れは「直した箇所を見る」検証では見えない**。
3. S112 q004 で同じ教訓 (「用語是正は設問レコード全体をスコープにせよ」) を得ていたのに、
   チェックリスト化しておらず、実行時に思い出さなかった。

## どう直したか

`quiz-phase2-explfix3-S113-2011h23a.mjs` (15 フィールド)。
q069 は「en 表の他要素 (人名・科目名) が英訳済み」という方針に合わせ、
成績も意味で英訳 **Excellent / Good / Pass / Fail** に統一 (A/B/C/F は成績体系の置換かつ
列記号と衝突、CJK 残置は表内で不一貫)。correct.en も同語へ揃え直した。

## 次回への申し送り (fix-checklist 追加項)

- **表示テキストを生成後に触ったら、是正スコープは全経路**:
  `stem_jp_clean` / `stem.zh` / `stem.en` / `choices_jp` / `choices.{zh,en}` /
  解説 `correct.{jp,zh,en}` / `distractors[].{jp,zh,en}` / `points[].{jp,zh,en}`。
- **検証者への依頼文を変える**: 「直した箇所が正しいか」ではなく
  **「直し残した経路が無いか」**を問う形にする (本件はそう依頼したので捕まった)。
- 是正スクリプトの最後に **canary assert** を置く (本件では explfix2 に
  「①②③ が 0 件」assert を入れていたが、対象を解説ファイルに限定していたため
  translations の stem をチェックしていなかった = assert のスコープも同じ罠を踏む)。
