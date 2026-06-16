# Failure archive — S94 `2013h25a-q052` choices.ウ REGRESSION (a wrong "fix", caught + reverted)

> Rule B (失敗 attempt 归档不删). Batch S94 (Session 94, 2026-06-16). Exam 2013h25a, 問52 (テクノロジ, 稼働率/availability, figure 問). correct_answer = ア = 0.07 (不変、全 attempt で正解 key 影響なし).

This is the most instructive failure of the batch: **the translation was correct, two independent reviewers wrongly flagged it, the main context applied a wrong "fix" (regression), and only a third independent verifier + direct high-res figure read caught and reverted it.**

## 入力 (source of truth)
- JP 源 `choices_jp.ウ` = `0.18` (← **これ自体が上流 OCR garble**: 図は 0.10、0→8 誤認)。
- 権威 figure: `pages/2013h25a/page-18.png` の選択肢行 = `ア 0.07 / イ 0.09 / ウ 0.10 / エ 0.45` (主 context が高解像度 crop で直接実読確認)。
- crop `figures/2013h25a-q052.png` = **stem + 図1/図2 のみ、選択肢を含まない**。

## 産物 (attempts)
| attempt | choices.ウ (zh/en) | 技術判定 | 業務判定 |
|---|---|---|---|
| **1 translator (元訳)** | `0.10` | in-pipeline reviewer: **CONCERNS→FAIL** (「input 0.18 と乖離」と誤認) | **実は正** (figure=0.10、translator が figure 正値を産出していた) |
| **2 主 context fix** | `0.18` | Rule A 監査 critic「figure(crop+page-18)=0.18、0.10 は捏造」を採用し是正 | **REGRESSION** (正値 0.10 を誤値 0.18 に改悪) |
| **3 revert (最終)** | `0.10` | 独立検証 critic が page-18 を 8x 実読し figure=0.10 と反証 → 主 context が crop+page-18 を直接実読確認 | **正** (元訳に復帰、figure 整合) |

## 技術判定 (root cause)
1. **上流 OCR garble**: `choices_jp.ウ` = 0.18 (図は 0.10)。
2. **translator は正しかった**: figure を見て (または計算整合で) 0.10 を産出。だが in-pipeline reviewer は「input 0.18 と違う」として FAIL (input を権威と誤認 = D-小6 違反)。
3. **Rule A 監査 critic がハルシネーション**: 「crop 図が 0.18 を示す」と主張したが、crop には選択肢が無い。critic が見ていない値を「見た」と報告。
4. **主 context が critic を鵜呑み**: figure を自分で実読せず 0.10→0.18 に是正 = 回帰。
5. **独立検証 critic + 主 context 直接実読が捕捉**: Rule D (写審分離) の第3独立パス + fixer 自身の figure 実読で反証 → revert。

## 業務判定
- 正解 ア=0.07 は全 attempt で不変 (回答 key 影響ゼロ)。defect は distractor ウ のみ。
- ただし「正値を誤値に改悪」は学習コンテンツの忠実度を損なう純粋な回帰であり、見逃せば公式過去問と異なる選択肢を配信していた。

## 下一 attempt 输入 (lesson / fix-checklist 追記)
- **figure-value を変える fix は、Rule A critic の figure 主張を鵜呑みにせず、fixer (主 context) が figure フルページを高解像度 crop で直接実読して確認せよ** (D-小6 を fixer にも適用)。
- **特に fix が translator 産出値から AWAY に動く時は要警戒**: translator が input と違う値を出している場合、translator が figure 是正済みの可能性がある (input ではなく figure と突き合わせよ)。
- **crop と full-page を区別せよ**: 選択肢は crop に無く full-page にのみ在ることが多い。「crop が選択肢を示す」という監査主張は即疑え。
- 上流: `choices_jp.ウ`=0.18 は OCR garble → backlog (corpus fix で 0.10 にすれば JP/zh/en 三語整合)。

defective snapshot (attempt 2 の誤 fix): `quiz_phase1_S94_2013h25a-q052_regression_defective.json`
