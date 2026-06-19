# Rule B 失敗アーカイブ — S96 `2010h22h-q002` 翻訳 REGRESSION (誤 fix → REVERT)

> Session 96 (2026-06-19) / Quiz Phase 1 バッチ S96 / 規則 B (失敗 attempt を削除せず archive)。
> 同型先例: **S94 `2013h25a-q052`** (Rule A 監査 critic の figure 主張を鵜呑みにした誤 fix を独立検証で捕捉 REVERT)。

## 何が起きたか

S96 Rule A 独立監査 (critic #1) が `2010h22h-q002` を **high / not-accurate** と判定:「選択肢イとウの zh/en 訳が相互に入れ替わっている (イ訳=低い+高い=JPウ、ウ訳=両方高い=JPイ)」。**主 context (fixer) はこれを『純粋なテキスト対応の問題、figure 不要』と誤って合理化し、figure を読まずに** 翻訳 イ↔ウ を swap した (= corpus `choices_jp` に合わせた)。

その後の独立再検証 (critic #2) が **figure (page-04) を実読**し、真因を特定:
- **corpus `choices_jp` 自体が figure と逆 (s7x 由来)**。LIVE: イ=「伸び率高く+利益率も高い」(both high) / ウ=「伸び率低いが+利益率高い」(low/high)。だが **印刷版 (page-04) は イ=low/high、ウ=both-high** (= `choices_jp_corrupted_backup` の内容が実は figure 忠実)。
- `figure_repaired:true` / `choices_resourced_s7x:true` の prior 自動「修復」が **figure 忠実な原文を anti-figure に swap** していた。`correct_answer` は イ のまま。
- → LIVE corpus では「正解イ」が「both high」を指すが、**graph は A社=低成長 (1000→1200=+20% vs B社 600→1200=+100%) + 高利益率 (2008: 480/1200=40% vs 430/1200≈36%)** = 「low growth, high margin」= 印刷版イ。LIVE は答案キー破壊。
- 元の翻訳 (イ=low/high) は **figure 忠実で正しかった**。主 context の swap は元訳を figure から AWAY に動かす **REGRESSION**。

## 主 context (fixer) による figure 実読 (D-小6)

critic を鵜呑みにせず page-04 を自分で crop+拡大実読:
- 印刷選択肢: **イ=「伸び率が低いが，…営業利益率は高い」(low/high)、ウ=「伸び率も…営業利益率も高い」(both high)、エ=両方低い**。
- graph: A社売上高 1000→1200 (+20%)、B社 600→1200 (+100%) → A社 伸び率 LOW。2008 営業利益 A社≈480 / B社≈430、売上高とも≈1200 → A社 利益率 40% > B社 36% → A社 margin HIGH。
- ∴ figure-correct = 「A社 低成長・高利益率」= 印刷版 **イ** = `correct_answer` イ。整合。

## 是正 (REVERT + 上流 corpus fix、drift-proof)

1. **翻訳 REVERT**: `tr_2010h22h-q002.json` の イ↔ウ を元へ swap-back → イ=「低于…较高」(low/high)、ウ=「都高于」(both high)。figure 忠実。
2. **上流 corpus fix**: raw bank `question_bank.json` の `choices_jp` イ↔ウ を figure 順へ swap-back → `build-quiz-corpus.mjs` 再生成。`questions.json` diff = 当該2選択肢のみ (2+/2−)、`correct_answer` イ 不変、quiz_index 不変。
3. **独立再検証** (critic #2 ≠ fixer): figure 実読で「印刷版イ=low/high」を確証し REVERT 方向を支持 (本 fix の prescription を提示)。
4. **検証**: tsc/eslint/vitest/build/nft (後続)。

## 教訓 (fix-checklist 追記)

- **S94 q052 教訓の再適用漏れ**: 「fix が translator 産出値から AWAY に動く時は figure を必ず fixer 自身が実読」を、q002 では「テキスト対応だから figure 不要」と誤って skip した。**choices_jp 自体が上流 (s7x) で破損しうるので、選択肢の『取り違え』指摘でも figure 実読は必須**。テキスト同士の一致 (translation vs corpus) は corpus が正である保証がない。
- **`choices_jp_corrupted_backup` は『corrupted』命名でも figure 忠実なことがある** (s7x が方向を誤った場合)。backup と LIVE が食い違う figure 問は figure 実読で裁定せよ。
- **写審分離 + 多段独立検証の複利**: critic #1 (corpus 基準で誤判定) → fixer 誤 fix → critic #2 (figure 実読で真相) で捕捉。S94 q052 と同じく第3パスが救った。

## ファイル

- `quiz_phase1_S96_2010h22h-q002_regression_defective.json` = swap 後 (defective) の tr スナップショット。
- 是正後の正は `data/ip/quiz/translations/2010h22h.json` (q002) + `data/ip/quiz/questions.json` (q002 choices_jp)。
