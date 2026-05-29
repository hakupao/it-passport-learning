# Stage 2.6 — 修復適用記録（内容欠陥）

> D-119（確実→即時修正・原値backup）+ D-121。Rule D: 修正(writer)と検証(reviewer)は別 lane・別 subagent_type。

## A. 確実欠陥 即時修復（`scripts/stage026-apply-clear-fixes.mjs`、ユーザー承認）

backup: `question_bank.json.pre-s026-clearfix`。原値 `stem_jp_corrupted_backup` / フラグ `*_corrected_s72` / `*_demoted_s72`。

| qid | 修復 | 検証 |
|---|---|---|
| 2009h21a-q099 | stem 復元（請求書/図参照回数） | — |
| 2010h22h-q045 | stem 復元（内部統制）+ has_figure 降格 | — |
| 2011h23tokubetsu-q045 | stem 復元（WBS作成目的）+ has_figure 降格 | — |
| 2018h30h-q001 | stem 復元（市場浸透、表紙prefix除去） | — |
| 2010h22h-q099 | figure_path 孤児切離し→`_rejected`（Rule B） | — |
| 2019r01a-q096 / 2021r03-q001 / 2024r06-q053 | has_figure 誤フラグ降格（テキスト問題） | — |

## B. 内容欠陥 修復（`scripts/stage026-apply-content-fixes.mjs`、D-121）

真値は原本ページから opus 転記員が一字転記（`true_content.json`）。`correct_answer` は answer_keys と既一致のため不変。backup: `question_bank.json.pre-s026-contentfix`、原値 `choices_jp_corrupted_backup` / `stem_jp_corrupted_backup`。句読点は bank 慣習 ，に正規化。

| qid | defect_class | 修復内容 |
|---|---|---|
| 2009h21a-q088 | duplicate_extraction | stem+choices を真の問88（DBロック/排他制御）へ |
| 2018h30h-q008 | duplicate_extraction | stem+choices を真の問8（マイナンバー a〜c）へ |
| 2018h30h-q100 | duplicate_extraction | stem+choices を真の問100（無線LAN/ESSID）へ + has_figure=true（裁剪待ち） |
| 2010h22a-q008 | duplicate_extraction | stem+choices を真の問8（初期投資回収, 表）へ + has_figure=true（裁剪待ち） |
| 2015h27a-q059 | choice_swap | ア↔イ逆転を解消（公式正答イが正しい選択肢を指すよう修正） |
| 2015h27h-q094 | stem_choice_mismatch | イ=`B2＊(1-B1)` / エ=`B2／(1-B1)`（＊/／取り違え修正） |
| 2022r04-q017 | choice_ocr | エ末尾の別問混入除去 |
| 2014h26a-q009 | choice_ocr | エ文字化け切断を全文へ |
| 2019r01a-q049 | choice_ocr | イ「プロトタイピング」切断を全文へ |

## Rule D 独立検証（code-reviewer × 2、opus、原本ページ照合）

- **duplicate_extraction 4 件**: 4/4 **PASS**（stem/choices/correct_answer すべて原本と整合）。
- **choice 修復 5 件**: 5/5 **PASS**（choices 原本一致 + 公式正答記号が正しい選択肢を指す）。
  - q059: ア↔イ逆転解消を確認、公式正答イ=バイオメトリクスの正しい特徴。
  - q094: ＊/／記号を高倍率クロップで確認、エ=B2／(1-B1)=損益分岐点公式として正しい。

→ **内容欠陥（学習内容が誤る系）は全件修復・独立検証済**。

## 残（図表フェーズ）

- `2018h30h-q100` / `2010h22a-q008`: has_figure=true へ復元済、`figure_pending_crop_s72=true`（D-120 図表フェーズで裁剪）。
