# Stage 2.6 — 抽样深核 監査記録 (L1/L2/L4/L5/L-ext)

> Rule D: 監査は read-only `explore` エージェント（抽出時の general-purpose とは別 type）。各 qid は原本ページ画像を視覚 Read して判定。
> マトリクス: `stage_026_defect_matrix.csv`。生データ: `data/ip/exams/.tmp/s026/phaseB_findings.json`。

## Phase B — センサスフラグ + 既知シード深核（53 qid）

15 套バッチ・15 並列エージェント（opus 4 / sonnet 11）で原本照合。

### 結果サマリ

- 監査 **53 qid** → **欠陥 35（critical 27 / minor 8）**、no-defect 18（連問共有図の誤検出）。
- defect_class 内訳: figure_missing 13・has_figure_orphan 13・stem_contamination 4・duplicate_extraction 2・figure_ref_mismatch 2・stem_choice_mismatch 1。

### A. 内容欠陥（学習内容が誤る = 最重要）

| qid | class | 判定 | アクション |
|---|---|---|---|
| `2018h30h-q008` | **duplicate_extraction** | stem が q006(非機能要件)の複製。真の問8=**マイナンバー取扱い**(page-05)。完全に誤った内容 | 要全文再抽出（**新欠陥類**・flag） |
| `2018h30h-q100` | **duplicate_extraction** | stem が q010(著作権)の複製。真の問100=**無線LAN/ESSID**(page-43、図表あり) | 要全文再抽出+has_figure=true（flag） |
| `2015h27h-q094` | stem_choice_mismatch | choices イ`B2÷(1-B1)` が正答 エ`B2/(1-B1)` と実質同義。原本イは別式の OCR ミス疑い | 要原本再照合（flag） |
| `2009h21a-q099` | stem_contamination | 真 stem=請求書/図参照回数。問100+表計算仕様+注意事項が付着 | recover_stem（確実） |
| `2010h22h-q045` | stem_contamination | 真 stem=内部統制(page-20)。記録は表紙注意事項 | recover_stem + demote（確実） |
| `2011h23tokubetsu-q045` | stem_contamination | 真 stem=WBS作成目的(page-16) | recover_stem + demote（確実） |
| `2018h30h-q001` | stem_contamination(minor) | 真 stem=市場浸透。表紙 prefix 付着 | recover_stem（確実） |

→ **duplicate_extraction は既知シードに無かった新欠陥類**。Stage 2 抽出/ページマッピングに「別問題の本文を別 qid に複製」する系統バグが存在した証拠。収束未達（loop-until-no-new-class により追加ラウンド要）。

### B. 図表欠陥（21 critical + minor）

- **固有図が原本にあるのに未裁剪/未フラグ（add_figure / fix_has_figure_true）**: q061,q064,q072,q085,q090(2010h22a) / q098(2013h25a) / q087,q092,q096,q099(2014h26a) / q085,q089(2015h27a) / q089(2015h27h)。— Session70-71 の図裁剪が**漏らした実図**。
- **連問共有図（中問前文ページの図を sibling が参照）**: 多数（2009h21a-q097,q099 / 2009h21h-q089,q093 / 2012h24a 全6 / 2011h23tokubetsu-q097）。→ **スキーマ判断要**（共有図をどう表すか＝架構決定、ユーザー裁決）。
- **誤 has_figure フラグ（demote, minor）**: 2010h22h-q099 / 2019r01a-q096 / 2021r03-q001 / 2024r06-q053。テキスト問題を図ありと誤判定。

### C. 連問共有図の誤検出（no-defect 18）

L4 の figref_no_figure_flag の多くは「設問が前ページ中問前文の共有図を参照しているだけ」で、has_figure=false は正当。2013h25a/2013h25h/2015h27a/2015h27h の大半。→ L4 単体では大問構造を区別できないことが判明（系統的に良性）。

## 未確定・要追跡（Phase C へ繰越）

- `2015h27h-q085`: stem の表名「社員表/部署表」が原本図1の表名「ICカード登録表」等と不一致の疑い → 別連問混入の可能性、要追跡。
- duplicate_extraction の**全量再スキャン**（同回内に留まらない複製の有無）。

## Phase C（次段）— 予定

層化ランダム N≈100（L1 再解答 + L2 跨字段整合）、L5 数値題、L-ext 外部交叉 ~30、duplicate_extraction 全量再スキャン。critical 欠陥率 + 95%CI を算出。
