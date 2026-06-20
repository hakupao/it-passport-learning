# FAILURE ARCHIVE — quiz Phase 1.5 S98-B3 / 2014h26a-q093 / 不正 JSON (stem 閉じ括弧欠落)

- **Date filed**: 2026-06-21 (Session 98, Batch S98-B3)
- **Step**: Stage 6 Quiz Phase 1.5 (D-138) figure stem 源再構成 → merge

## 失敗内容 (defective product)
reconstruct writer が `stem_<id>.json` を出力する際、`"stem": { "zh":..., "en":... }` オブジェクトの**閉じ括弧 `}` を脱落**。結果、`"en"` の後にカンマが続き `changed`/`change_summary_jp`/`derived_answer` が `stem` オブジェクトの property として吸収され、外側オブジェクトが閉じず EOF で JSON parse 失敗:

> `2014h26a-q093: unparseable recon (Expected ',' or '}' after property value in JSON at position 2751 (EOF))`

merge が validation error で停止 (該当問のみ、他 24 問は正常 merge)。

## 技術判定
構造的 JSON 破損 (閉じ括弧 1 個欠落)。**内容 (stem_jp_clean / stem.zh / stem.en / derived_answer) は完全で破損なし**。

## 業務判定
内容は figure 忠実 (得点分布表ワークシート、第1文『採点結果入力のワークシートに』訂正・複写元『セルB40』訂正・図表題訂正・行42 復元、derived イ=key)。欠陥は直列化のみ。

## 是正
主 context が `"en": "...results"` の後に `\n  },` を挿入し `stem` オブジェクトを閉じる構造修復 (内容 0 改変)。JSON valid 確認 → 再 merge 成功 (updated 25, missing 0)。Phase 1 q091 / Phase 2 q082 と同型の直列化修復。

## 教訓 (fix-checklist)
- writer の JSON_SAFE 指示は生 `"` 対策だが、**ネストオブジェクトの閉じ括弧脱落**は別系統の直列化失敗。merge の validation (unparseable 検出) が網兜となり stem 内容は無傷で回収可能。
- merge は per-question で fail-loud (1 問の不正で全体停止せず該当問のみ報告) のため、構造修復後の単一再 merge で回復できる。
