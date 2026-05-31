# D-125 — Stage 2.7b: hi-dpi / 多ページ二次パスの方式

> Status: **Locked** (Session 75, 2026-05-31)
> 関連: D-122（全量照合）, D-123（多段パイプライン）, D-124（Opus ブラインド+機械diff）
> 成果証拠: `evidence/phase5/stage_027b_repair.md`

## 文脈

Stage 2.7（D-122～124）後に **71 題が残存**（62 `s027_unresolved` + 9 `s027_choice_anomaly`）。
RETROSPECTIVE_stage2.7 の Gap 3/4 で「跨ページ choices」「表/式 choices」「hi-dpi per-question クロップ」を次段課題と予告していた。本決定でその二次パスの方式を確定する。

## 決定

Stage 2.7b を次のパイプラインで実施する:

1. **源は 300dpi の分帯クロップ**（pdftoppm `-x/-y/-W/-H`）。**整ページ高 dpi は無効**（Claude vision は ~1.15MP に downsample するため 173dpi と同等）。有効解像度はクロップでのみ上がる。
2. **ページ N に加え N+1 を必ずレンダ**。中問の choices は次ページに溢れる（page-unit scan が空 choices を生む主因）。
3. **double-blind（2 独立レーン）**: A=`explore` / B=`code-reviewer`、ともに `model:'opus'`。stored 非開示（エコー不能）。各レーンが分類（text / figure_choices / figure_in_stem）＋逐語転写。
4. **bank 規約に正規化してから判定**: `stem_jp` は 問NN・〔分類〕・インライン図ブロックを含まない（2,532 clean stem で確認）。転写から前缀/図ブロックを剥離して比較・保存。
5. **figure_inherent の明示分類**: 選択肢が図形の題は文字転写の対象外。stored 説明文を保持（再汚染防止）。**ただし stored が当該問題に関連することを監査で検証**（cross-question swap 検出のため）。
6. **Rule A 独立監査は逐字読み＋答案字母映射核験**を必須にする。

## 根拠

- **跨ページが残存欠陥の主因と実証**: 2015h27a-q086 の IF 式選択肢は p38 にあり、stored の page_number=37（stem ページ）だけ見た scan が選択肢を空に上書きしていた（回帰）。N+1 を与えれば double-blind が確実復元。
- **整ページ高 dpi の無効性**: 300dpi 整页（2148×3039≈6.5MP）も 173dpi（≈2.9MP）も等しく ~1.15MP に縮小される。分帯（1/3 ページ）で線形解像度 ~1.6×。
- **NFKC+strip 類似度の構造的盲点**: 句読点・記号を strip するため comma↔period(2.000↔2,000)、一↔ーー、$ 有無が sim に出ず、機械段では永久に escalate されない。**独立 Rule A 監査（逐字）だけが捕捉**（q090-2010 / q087-2015a が実例）。
- **figure-choices の罠**: q025-2015h27h は選択肢が DFD 図だが stored 説明文は別問題（情報セキュリティ）のもので、answer 字母が不整合だった。「図形だから保持」を stored 妥当性の前提にすると content_mismatch を見逃す。

## 却下した代替案

- **per-question bbox クロップ**: stem/choices の bbox が無く、確実な領域特定が困難。分帯（top/mid/bot）で十分な解像度向上を達成でき、実装も単純。→ 不採用。
- **整ページ 600dpi 再レンダ**: downsample で無効。コストだけ増える。→ 不採用。
- **monolithic な再 scan（全 2900）**: 残 71 のみが対象。全量再走は D-124 で完了済・不要。→ 限定スコープを採用。

## 結果

71 → confirmed 20 / figure_inherent 15 / cleared 28 / still_unresolved 8。post-audit で q025 等 4 件を双盲裏付けで追加修復、inline-table garble 2 件を再フラグ。**残存 10 題（0.34%）、全て answer 保存・主毒除去済**。answer_keys/correct_answer/figure/group 不変。

## 影響

- Stage 3（知識マッピング）はブロックされない（主毒除去済、残 10 は answer 不変）。
- 残 10 題（figure-stem 描述差 + inline-table garble + N-1 跨ページ）は将来の per-question 手当て対象（任意）。
