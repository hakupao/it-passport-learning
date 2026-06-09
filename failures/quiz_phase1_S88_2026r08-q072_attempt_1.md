# Failure 記録 — Quiz Phase 1 S88 `2026r08-q072` clean-stem 表再構成エラー (Session 88, Rule B)

> 区分: 翻訳欠陥（figure 問の `stem_jp_clean` 表再構成ミス、独立 Rule A が捕捉→修復済）。
> 原欠陥データ: `failures/quiz_phase1_S88_2026r08-q072_attempt_1_defective.json`（上書き前の tr を温存）。

## 入力
- 問題: `2026r08-q072`（関係データベースのデータ追加順序、figure 問、正解=イ）。
- raw `stem_jp`: 表本体が OCR で完全脱落（`口座 「 顧客 取引明細 「`）。3 表の中身は figure/page にのみ存在。
- figure crop: `data/ip/exams/figures/2026r08-q072.png`（1217×709、上端クロップ疑い）。
- 権威源: `data/ip/exams/pages/2026r08/page-35.png`（full page）。

## 産物（欠陥あり = attempt 1）
- translate workflow（`wf_1024ac47-207`）の translator(general-purpose) が figure から 3 表を再構成。
- うち **"口座" 表を 3 列に誤構成**: `口座番号 | 顧客番号 | 残高`。
  - 実在列 **「口座種別」を完全脱落**。
  - 列順も改変（原典 `口座番号 → 口座種別 → 残高 → 顧客番号` に対し顧客番号を 2 番目へ移動）。
- 誤った表が zh（`账户编号|客户编号|余额`）/ en（`Account Number|Customer Number|Balance`）stem にそのまま伝播。
- in-pipeline reviewer(code-reviewer) は PASS（figure 問の reviewer も crop 依存で見逃し）。

## 技術判定
- translator が参照したのは figure crop のみ（プロンプトは figure_png のみ提示）。crop が上端クロップで「口座種別」ヘッダ行が画像外だった可能性が高い。
- crop に写る範囲だけで表を「閉じて」しまい、欠落列に気付かず 3 列で確定（捏造ではなく不完全情報による脱落）。
- merge の構造検査（非空 zh/en・4 letter）は通過（**構造 ✓ だが意味 ✗**＝規則 A の「構造検査 ≠ 意味検査」を再実証）。

## 業務判定
- **正解イは不変**: FK 依存鎖（顧客→口座→取引明細）は残存列で導出可能、脱落した「口座種別」は非キー属性で挿入順に無関係。よって設問の解答可否は崩れていない。
- ただし**表示される表が源図と不一致**（列欠落＋列順違い）＝学習素材として不正確。severity=high（clean_stem_faithful=false）。
- **独立 Rule A critic（N=36、別 subagent_type）が単独で捕捉**（in-pipeline reviewer は見逃し）→ 写審分離＋独立監査の価値を再実証（S81/S84 と同型）。

## 修復（attempt 2 = 実施済・受理）
- writer(general-purpose, opus) を再 dispatch。**figure crop + page-35.png（権威 full page）の両方を Read**させ、critic の所見（正 4 列）を ground truth として再構成。
- 結果: `口座番号(主キー) | 口座種別 | 残高 | 顧客番号(外部キー)` の 4 列・正順に是正。zh（账户类别）/en（Account Type）も是正。choices・本文論理・正解イは不変。
- 独立 critic（`oh-my-claudecode:critic`、a7ada6a8）が **page-35.png で 3 表を再照合 → ACCEPT**（accurate=true / severity=none / clean_stem_faithful=true、新欠陥なし）。
- 再 merge → `data/ip/quiz/translations/2026r08.json` に反映。

## 学び（fix チェックリストへ）
- **figure 問の clean-stem 生成時は crop だけでなく full page を併読すべき**（crop の上端/端クロップで列・ヘッダ欠落のリスク）。S85 fix チェックリストに追加候補。
- 既存 prep は figure crop のパスのみ注入。今後 figure 問が多いバッチでは crop クロップ健全性 or full-page 併読を検討（backlog）。critic は page を自発参照して捕捉したが、translator 側にも page を渡せば一次防止になる。
