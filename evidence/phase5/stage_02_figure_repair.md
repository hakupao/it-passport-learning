# Stage 2 補完 — 図表 FAIL 96 件の修復 (Session 71 / Item 3)

**日付**: 2026-05-29
**入力**: `data/ip/exams/figures/_fails_canonical.json`(96 件の唯一 FAIL、Item 1 で確定）
**目的**: Session 70 の図表裁剪で FAIL となった図表を、源ページから bbox を再推定して再裁剪し、全件 PASS 化する。

---

## 結論

| 指標 | 値 |
|------|------|
| 対象 FAIL 図表 | **96 件** |
| 修復成功（再裁剪 PASS） | **93 件** |
| 図表なしと判定し降格（has_figure=false） | **3 件** |
| 未解決 | **0 件** |

96 = 93 修復 + 3 降格。残課題ゼロ。

---

## 手法：主ループ編成 + workflow 並列ビジョン（複数ラウンド loop-until-dry）

各ラウンドで以下を回した：

```
ESTIMATE (workflow, 並列 vision agent, general-purpose)
   各 agent が源ページ PNG を視覚的に読み、図表の位置を分数 bbox で再推定 + is_figure を独立判定
   ↓ 主ループ：程序的余白を加えて確定的に裁剪（PIL）→ staging
VERIFY (workflow, 並列 independent agent, explore ≠ estimator → Rule D)
   各 agent が「新切り出し」と「源ページ」を見比べ PASS/FAIL + 具体的修正指示
   ↓ FAIL は verifier の指示を次ラウンドの入力に carry-over（old_bbox=前ラウンド推定値）
```

**Rule D 遵守**: writer（推定）= `general-purpose`、reviewer（検証）= `explore`、最終監査 = `code-reviewer`。3 種の異なる subagent_type で自己検証を排除。

### ラウンド別実績

| ラウンド | 入力 | 推定 | 検証 PASS | 検証 FAIL | 累積 PASS |
|---------|------|------|-----------|-----------|-----------|
| 1 | 96 | 92 figure + 4 no-fig | 70 | 22 | 70 |
| 2 | 22(FAIL) | 21 figure + 1 no-fig | 12 | 9 | 82 |
| 3 | 8(FAIL、q069 除く) | 8 figure | 4 | 3 | 86 |
| 手動 | 7 | — | 自検 + 最終監査 | — | 93 |

- ラウンド毎に「上端截断（表ヘッダ行の欠落）」が系統的に残存 → agent はテーブル上端を過小評価する傾向。verifier の具体的 y1 指示で補正。
- 程序的余白を round1=3%、round3=4.5% と増加させたが、最終 7 件は agent でも収束せず手動修正。

### 手動修正 7 件（agent 自検後、最終監査で独立検証）

| ID | 種別 | 内容 |
|----|------|------|
| 2009h21h-q097 | **跨ページ** | 表は源ページではなく前ページ page-42 に在った（page-43 にマッピング誤り）→ source 訂正 + page-42 から裁剪 |
| 2014h26h-q061 | **跨ページ** | 組合せマトリクス表は page-24 に在った（page-23 にマッピング誤り）→ source 訂正 + page-24 から裁剪 |
| 2021r03-q069 | 位置誤り | bbox が表の下方の空白域を指していた（表は y≈0.34-0.53、下半分は白紙）→ 位置上方修正 |
| 2023r05-q008 | 位置誤り | ページに大量の余白があり estimate/verify 双方が表位置を下方に誤認 → ink-scan で y≈0.48-0.65 と特定 |
| 2010h22h-q011 | 表頭截断 | 「単位 億円」ラベルが上端欠落 → y1 引き上げ |
| 2011h23a-q026 | 表頭截断 | 「売上個数」ヘッダ行が欠落 → y1 引き上げ |
| 2025r07-q072 | 表頭截断 | ヘッダ行+ア/イ行が欠落 → y1 引き上げ |

**跨ページ問題**: is_figure=false 判定 5 件のうち 2 件（q097, q061）が実はマッピング誤りで隣接ページに図表在り、3 件（q063, q090, q029）が真の図表なし。全 5 件を独立 agent で確認済。

### 降格 3 件（独立 agent 確認済、has_figure=false）

| ID | 理由 |
|----|------|
| 2010h22a-q063 | データ正規化の目的を問う純概念問題。ページに図表なし。 |
| 2012h24h-q090 | 〔研修受講状況〕は (1)(2)(3) の箇条書きテキストであり罫線表ではない。 |
| 2017h29a-q029 | PPM 評価軸の純テキスト 4 択。図表なし。 |

---

## データ反映（finalize, 確定的）

- `question_bank.json`: 93 件に figure_path / figure_bbox_pct(実使用値) / `figure_repaired=true`、3 件を has_figure=false 化。跨ページ 2 件は source.page_image を訂正（`figure_source_corrected=true`）。
- `by_year/*.json`: 26 ファイル同期。
- 旧（不良）切り出し 96 枚を `figures/_rejected/` に退避（Rule B 精神、削除せず温存）。降格 3 枚は `_rejected/*.demoted.png`。
- 検証後: 総 2,900 題、空答案 0、has_figure かつ figure_path 欠落＝16（**本修復対象外の既存課題**、後述）。

### finalize 後の整合性チェック（全て期待値一致 ✓）

```
総題数 2900 / figure_repaired 96 / demoted 3 / source_corrected 2 / 空答案 0 / path無bbox 0
figures/*.png 499 (502 − 3 降格) / _rejected 99 (96 + 3 降格)
```

---

## Rule A/D 最終独立監査

N=15（手動 7 全件 + workflow 検証済から 5 抽出 + 降格 3 全件）を `code-reviewer` agent（推定・検証とは別 subagent_type）で監査。

**結果**: 15 件中 **14 PASS / 1 FAIL**（`audit_results_figure_repair.json` 参照）。

- 手動 7 件・抽出 5 件・降格 3 件、すべて切り出し/降格判定の正しさを独立確認。
- **1 FAIL = `2011h23a-q026`** は**図表切り出し自体は正しい**が、監査者が「stem_jp が示す内容（損益分岐点の棒グラフ）と切り出した図（売上個数分布表）が不一致」と指摘 → 調査の結果、**stem_jp / figure_description が別問題の内容に汚染された既存データバグ**と判明。元ページ page-11 で問26 の真の設問は「商品Aの売上個数分布から最低必要在庫を問う」問題であり、切り出した売上個数分布表・選択肢(87/88/92/93)・正答(ウ=92)はすべて正しい。
- **対応**: q026 の `stem_jp` と `figure_description` を page-11 の実内容に訂正（原文は `stem_jp_corrupted_backup` に温存、`stem_corrected_s71=true`）。図表は変更不要。
- 実質的に 15/15 の図表切り出し・降格判定はすべて正しく、加えて監査が stem 汚染バグ 1 件を発見・修正した。

> **派生課題**: q026 の汚染 stem は「損益分岐点(売上高1000/変動費500/固定費300)」という別問題の内容だった。同種の stem 汚染が他にも存在する可能性があり、stem×choices×figure の整合性監査を別途検討すべき（次セッション候補）。

---

## 残課題（本修復の対象外、次セッションへ）

**has_figure=true だが figure_path 欠落の 16 件**（本 96 FAIL とは 0 重複の既存問題、STATE「Next #2: has_figure 不一致」に該当）:

```
2009h21a-q093, q097, q099 / 2009h21h-q089, q093 / 2010h22a-q061, q064 /
2010h22h-q045 / 2011h23tokubetsu-q045 / 2012h24a-q085, q088, q096 /
2013h25a-q098 / 2019r01a-q096 / 2021r03-q001 / 2024r06-q053
```

これらは Session 70 で has_figure=true とされたが figure_path が付かなかった題。図表抽出 or 降格の判定が必要。

---

## 成果物・スクリプト

| ファイル | 用途 |
|---------|------|
| `scripts/repair-figures-prep.mjs` | ラウンド毎の manifest + per-figure 入力 + ids 生成（round>1 は前ラウンド推定値+verifier指示を carry-over） |
| `scripts/repair-figures-crop.mjs` | 推定 bbox に程序的余白を加え staging へ確定的裁剪 + verify-manifest 生成 |
| `scripts/repair-collect.mjs` | ラウンド検証結果を集約（PASS 累積 / FAIL 次ラウンドへ） |
| `scripts/repair-figures-finalize.mjs` | question_bank + by_year へ確定反映、旧図を _rejected へ退避 |
| `data/ip/exams/.tmp/repair/` | 全中間生成物（manifest / estimates / verify_results / crop_report / accumulated_pass / specials / finalize_input、gitignored） |
| `data/ip/exams/figures/_rejected/` | 旧不良切り出し 96 + 降格 3（Rule B 温存） |

**技術メモ**: workflow runtime では `args` が JSON 文字列として渡るため、スクリプト先頭で `JSON.parse` ガードが必須（`const A = typeof args==='string' ? JSON.parse(args) : args`）。
