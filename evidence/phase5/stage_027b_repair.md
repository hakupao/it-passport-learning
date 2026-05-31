# Stage 2.7b — hi-dpi / multi-page 二次修復（残存 71 フラグ）

> Session 75 (2026-05-31)。D-122/D-123/D-124 + **D-125**。Tier 3 / Rule A / Rule D。
> 対象: Stage 2.7 が残した **62 `s027_unresolved` + 9 `s027_choice_anomaly` = 71 題**（answer_keys は終始不変）。

## 根本原因（着手前の診断で実証）

71 題を当前値 vs backup で全量診断し、欠陥を分類:

| 種別 | 主因 |
|---|---|
| **回帰 2 題**（q099-2014 / q086-2015a）| Stage 2.7 の 3-way escalate が choices を**空に上書き**（backup には実内容あり）|
| **跨ページ** | choices が次ページ(N+1)に溢れる中問。page-unit scan が空 choices を生む（実証: 2015h27a-q086 の IF 式選択肢は p38 にあり、stem の p37 には無い）|
| **表/式 choices** | 173dpi では IF 式・表が潰れる。**300dpi 整ページは無効**（Claude vision は ~1.15MP に downsample、173dpi と同等）→ **分帯クロップ必須** |
| **figure-choices** | 選択肢自体がグラフ/図（stored は説明文）。文字転写の対象外 → 誤って転写すると再汚染 |

## 手法（D-125）

1. **prep** (`stage027b-prep.mjs`): 各題の源ページ N と **N+1** を pdftoppm で **300dpi** レンダ → `-x/-y/-W/-H` で 3 帯（top/mid/bot, ~45%×overlap）にクロップ（127 ページ × 4 画像 = 508 枚）。stored 非開示の blind manifest を生成。
2. **double-blind** (`stage027b-blind.workflow.mjs`): 71 題 × **2 独立レーン**（A=`explore` / B=`code-reviewer`, ともに Opus, Rule D）。各レーンが hi-dpi 帯を Read して printed stem/choices を逐語転写＋分類（text_question / figure_choices / figure_in_stem）。stored 非開示でエコー不能。8 並列上限（= 単一 workflow + WAVE=4）でレート制限回避。142 reads 成功。
3. **reconcile** (`stage027b-reconcile.mjs`): A↔B 一致（≥0.62）かつ stored 否定（<0.82 or 空）→ confirmed。**bank 規約に正規化**（stem_jp は 問NN/〔分類〕/インライン図ブロックを持たない＝2,532 clean stem で確認 → 前缀剥離）。
4. **apply** (`stage027b-apply.mjs --commit`): `.pre-s027b` backup + 履歴鎖（`*_corrupted_backup`=原値温存 / `*_s027b_prev`）。不変量厳守。
5. **Rule A 監査** (`stage027b-audit.workflow.mjs`, N=31, `general-purpose` lane = 盲読/apply と別系統): hi-dpi 帯 vs 適用テキスト + **答案字母映射核験**（choice swap 後も correct_answer が正答を指すか）。
6. **post-audit** (`stage027b-postaudit.mjs --commit`): 監査が見つけた欠陥のうち**双盲が裏付ける**ものだけ修正、裏付け無し（インライン表）は再フラグ。

## 結果

### reconcile（71 題の処置）

| 処置 | 件数 | 意味 |
|---|---|---|
| confirmed 修復 | **20** | stem 13 / choices 11（content_mismatch 9 + ocr_garble 11）|
| figure_inherent | **15** | 選択肢=図形。stored 説明文を保持（文字転写せず）|
| cleared | **28** | 双盲が stored を裏付け＝保守的フラグの偽陽性 |
| still_unresolved | **8** | レーン不一致/未検出 → フラグ保持 |

- 回帰 2 題（q099/q086a）は double-blind が実選択肢を**復元**（backup 復元より良、句読点 bleed も除去）。
- 前缀剥離で confirmed 23→20（3 件は前缀のみの偽修復 → cleared へ）、unresolved 17→8（図描述の措辞差が消解）。

### Rule A 監査（N=31: confirmed 20 + cleared 7 + figure_inherent 4）

| verdict | 件数 |
|---|---|
| match | 23 |
| minor_diff | 4（trivial・答案不変）|
| mismatch | 4 |
| **answer_consistent=false** | **1**（q025-2015h27h）|

- **適用した 20 修復は answer_consistent 20/20**。mismatch/minor は**未変更フィールド**（既存欠陥）か trivial。
- 監査が捕捉した真の欠陥（機械 reconcile の盲点）:
  - **q025-2015h27h（critical）**: figure-choices 題だが stored 選択肢が**別問題（情報セキュリティ）のもの**。answer 字母不整合。→ 双盲の DFD 図説明で置換、answer ア が正答へ正しく映射（修復）。
  - **q090-2010**: choices `2.000/3.400` → `2,000/3,400`（NFKC+strip が句読点を無視 → 機械では不可視）。双盲一致で修復。
  - **q089-2010 choices**: `発生顔度`→`発生頻度` + 末尾 `〔ストラテジ〕` 除去。双盲一致で修復。
  - **q087-2015a**: `いずれかーー方`→`いずれか一方`（一 が ーー に化け）。定点置換。
  - **q099-2014 / q091-2012h24h**: stem インライン表 garble（顧客名↔社員名 / 申込日 8月7日↔9月2日）。双盲の表ソース無 → 再フラグ（答案不変）。

## 最終データ状態（post-audit 後）

| 指標 | 値 |
|---|---|
| 残存フラグ（unresolved+anomaly）| **10 = 0.34%**（修復前 71=2.45% から低減。うち inline-table garble 2）|
| figure_inherent（再分類）| 15 |
| s027b 修復 | stem 14 / choices 14 |
| 空 stem / 空 choices / 欠 answer | **0 / 0 / 0** |
| correct_answer / answer_keys / figure / group | **不変** |

backup: `question_bank.json.{pre-s027b, pre-s027b2}` + `by_year/*.{pre-s027b,pre-s027b2}`。

## 教訓（D-125 / 次段へ）

1. **NFKC+strip 類似度は句読点・記号に盲目**: comma↔period、一↔ーー、$ 有無は sim に出ず escalate されない。**独立 Rule A 監査（逐字読み）が機械の盲点を埋める唯一の保険**。
2. **figure_inherent は「stored が問題に関連する」検証が必要**: q025 は cross-question choice swap が figure-choice に偽装。「図形だから保持」は stored 妥当性を前提にしてはいけない。
3. **跨ページは N-1 も要る場合がある**: q088-2012 は stem が前ページ(N-1)。今回 N/N+1 のみレンダ → 未検出。残 still_unresolved の一因。
4. **300dpi 整页は無意味、分帯クロップが本質**（再確認）。
5. 残 10 題（figure-stem 描述 + inline-table）は per-question 手当てが必要だが**答案保存・主毒除去済**。Stage 3 をブロックしない。
