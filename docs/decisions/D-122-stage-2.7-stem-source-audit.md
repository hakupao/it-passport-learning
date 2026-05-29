# D-122 — Stage 2.7「全量 stem/choices 源照合・修復」新設 + Stage 3 ゲート再設定

**状態**: Locked
**日付**: 2026-05-29 (Session 73)
**文脈**: Stage 2.6 Phase C で系統的 stem/choices 欠陥を実測した直後

---

## 背景

Stage 2.6 Phase C（N=100 層化 + L5 + L-ext + 対抗式 adjudication、Rule D）の実測結果:

- **answer_keys.json（IPA 公式）は 100% 信頼できる**（誤答案キー 0 件。L-ext の q073「ウ」は公式 PDF 実読で ア=正しいと確認、PDF 行ずれ誤読だった）。
- **stored stem/choices に系統的 OCR garble が残存** = 確定 critical **17/100**、Wilson95 **10.9–25.5%**、層化後**母集団 ≈12%（≈360 題）**。Session 68-69 のクリーンアップで取り切れていない。calc/figure/表 に集中（fig_or_calc 21.4% vs text 9.1%）。
- **q085 型「自己整合的だが別問題」内容不一致**は **L1L2 が偽陰性**（自洽に解けてしまう）。確実な検出は **stored stem/choices vs 源ページの直接照合のみ**。

→ question_bank は Stage 3（知識マッピング）/ Stage 4（教科書生成）の真相源。garbled/誤内容 stem は下流の学習コンテンツを毒する。答案キーは健全だが**表示テキストが ≈12% 破損**。

## 決定

**Stage 2.7「全量 stem/choices 源照合・修復」を新設し、その完了を Stage 3 開始の新ゲートとする**（ユーザー選択: 全量 stored-vs-source 照合 → 欠陥のみ修復）。

### スコープ

1. **全 2,900 題**で「保存 stem/choices」vs「源ページ画像」を vision 照合（Rule D: read-only `explore`／`code-reviewer`、抽出 general-purpose 不使用）。
2. 各題を分類: `clean` / `ocr_garble(minor|critical)` / `content_mismatch`(q085 型) / `choices_garble`。**OCR garble も plausible-but-wrong も両方捕捉**（これが全量照合を選んだ理由）。
3. **critical フラグのみ**源ページから正しい stem/choices を**再転写・修復**（backup + `*_corrupted_backup` 温存、`stem_resourced_s7x` フラグ。answer_keys は真相源として不変）。minor garble は triage 記録（ユーザー判断）。
4. 修復は writer/reviewer 分離（Rule D）。N サンプル独立監査（Rule A）。

### コスト前提（ユーザー受容済）

- ~2,900 vision agent（バッチ、並列上限 ~12-16）。重い・長時間。answer_keys は触らない。
- 効率化: 先に**テキスト・ヒューリスティック garble スコアラ**（無料・全量）で明白な garble を即時フラグ → 母集団 garble 率の速報 + vision 照合のクロスチェックに使う（ただし q085 型は vision 照合でのみ捕捉、ヒューリスティックに依存しない）。

### Stage 3 開始ゲート（D-119 を更新）

D-119 の 4 条件に加え:
5. **Stage 2.7 完了**: 全量源照合済 + critical 欠陥修復済 + 修復後の再サンプル CI が許容水準（ユーザー受容）。

## 却下した代替案

- **サンプル17件のみ修復 + CI 受容で Stage 3**: 母集団 ≈360 題の garbled stem が Stage 4 教科書を毒する。却下。
- **高リスク層のみ（fig/calc/表）**: text 問題の ~9% garble と q085 型 content_mismatch を取り逃す。却下。
- **answer_keys 再抽出**: 不要（公式 PDF で 100% 確認済）。

## 影響

- 新スクリプト群（heuristic garble scorer + 全量 vision 照合オーケストレーション + 再転写 apply）。
- Stage 3 は本ゲート通過まで開始しない。
- 副次記録: 試験ID接尾辞規約 **h=春(haru) / a=秋(aki)**（IPA PDF タイトルで確認）。表示ラベル付与時に注意（question_bank に era 非保存のため現データ欠陥ではない）。
