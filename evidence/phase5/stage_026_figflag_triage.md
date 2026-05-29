# Stage 2.6 — has_figure フラグ整合性審核（「110件」系統欠陥）

> Session 73。Phase A センサスが測っていなかった軸を全量再スキャンで発見 → vision 全量トリアージ → 修正。
> Rule D: トリアージは read-only `explore`（抽出 general-purpose とは別 lane）。Rule A: 全量 + 独立サンプル。

## 発見（センサス recall gap）

Phase A の L4 センサスは `strong_regex` で **stem の図参照**のみ判定し、**`has_figure` フラグ vs `figure_path` 実体の整合性**を測っていなかった。全量再スキャンで:

| 不整合軸 | 件数 |
|---|---|
| **has_figure=false かつ figure_path 設定済（ファイル実在）** | **110** |
| has_figure=true / path無 / group無（真の orphan） | 0 |
| has_figure=true / path有 / ファイル欠（broken） | 0 |
| group member の旧 has_figure=true（共有図依存） | 7（うち5 group-only / 2 own-subfigure） |

加えて strong_regex は `図の○○`（番号なし図参照）も取りこぼし（例: 図のアローダイアグラム）。これらは大半が上記110に含まれていた。

## トリアージ（vision 全量、N=117 = 110 flag + 7 orphan）

- 独立サンプル15件 → genuine 14 / spurious 1（93%）で「真の欠陥」確認 → ユーザー決定: **全110件 vision 精査**。
- 全量: main 101 agent（94 flag + 7 orphan）+ supp 10 + sample 15。重複9件の sample×main 一致 8/9（89%）。

| 分類 | 件数 | 処理 |
|---|---|---|
| genuine_figure + crop_ok | 73 | **has_figure=true**（`has_figure_fixed_s73`）。損益計算書/ワークシート/アローダイアグラム/JANコード表/図選択肢 等の実在表図。 |
| crop_quality_issue / genuine but crop_ok=false | 6 | 再裁剪（round3）→ verify → has_figure=true |
| spurious_crop | 31 | path 除去 + crop を `_rejected/` 退避（Rule B）。choices/疑似コードが本文に既出で冗長な crop。`figure_spurious_s73`。 |
| orphan has_own_subfigure | 2 | 固有図を裁剪（round3）→ has_figure=true（group_id も保持） |
| orphan group_only | 5 | has_figure=false（図は group 提供, group_id 保持）。`figure_group_only_s73`。 |

borderline 1件: `2010h22a-q015`（JANコード選択肢表）は sample=genuine / main=spurious。choices が本文既出のため spurious 採用（has_figure=false）。記録に留保。

## 適用結果（`scripts/stage026-apply-figflags.mjs --commit`）

- backup: `question_bank.json.pre-s026-figflags`。
- has_figure=true 設定 73 / spurious 除去+退避 31 / group_only 降格 5。by_year 27ファイル同期。
- 再スキャン: stale(has_fig=false+path+file) 残=6（= round3 再裁剪待ちのみ）、真 orphan 0、broken 0。total 2900 / 空答案0。
- has_figure=true 総数: 358(S69) → 462(S73)。

## 教訓

- センサスの strong_regex は **再現率**に盲点（フラグ↔実体整合・図の○○）。構造軸チェックは「全直積（has_figure × figure_path × file × stem参照）」で組むべき。→ RETROSPECTIVE に記載。
