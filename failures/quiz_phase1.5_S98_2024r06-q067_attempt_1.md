# FAILURE ARCHIVE — quiz Phase 1.5 S98 / 2024r06-q067 / attempt 1

- **Date filed**: 2026-06-20
- **Step**: Stage 6 Quiz Phase 1.5 figure stem 源再構成 (id=2024r06-q067)
- **Verdict (prior round)**: FAIL → REJECT

## 入力 (defective)
上流 `raw_stem` corpus に値ドリフトが混入していた:

> Webサーバの稼働率はともに**0.98**とし，データベースサーバの稼働率は**0.99**とすると，…

current_clean=null（未生成）、stem_corrupted_backup=null。
attempt 1 はこの 0.98/0.99 を権威源照合せず採用し、changed=false（「誤りなし」）で出力した。

## 産物 (defective)
- stem_jp_clean に 0.98/0.99 を温存。
- zh/en も 0.98/0.99 を温存。
- changed=false / change_summary_jp=「忠実、変更なし」（虚偽）。

## 技術判定
JSON 形式は valid。schema 準拠。表示は破綻なし。

## 業務判定 (FAIL)
独立検証で 4 check 全 FAIL:
- source_faithful FAIL: 権威源 page-30 は **0.8 / 0.9**。0.98/0.99 は源と不一致。
- supports_key FAIL: 0.98/0.99 では 1-(1-0.98)^2 × 0.99 = 0.9896 ≈ 0.99 となり選択肢に無く、correct_answer=ウ(0.86) を支えない。
- trilingual_consistent FAIL: jp「小数第3位を四捨五入」に対し既存 zh/en current_tr は「小数点后第2位/2 decimal places」とラウンディング表現がズレ。
- no_fabrication FAIL: 0.98/0.99 は源に無い捏造値。

## 根因
上流 `raw_stem` 由来の値ドリフト（OCR/抽出時に 0.8→0.98、0.9→0.99 と桁が混入したと推定）。派生 corpus だけでなく原 corpus 汚染。

## 次 attempt 入力 (是正方針)
1. figure_page_png (page-30) を逐語照合し **0.8 / 0.9** に是正。
2. 検算: 1-(1-0.8)^2 = 0.96（Web 並列）→ 0.96 × 0.9 = 0.864 → 小数第3位四捨五入 = **0.86 = ウ**（correct_answer 一致）。
3. zh/en も 0.8/0.9 に追随是正。ラウンディング表現を jp「小数第3位を四捨五入」に合わせ「四舍五入到小数点后第2位 / rounded to 2 decimal places」（0.864→0.86 は実質小数第3位を丸めて2桁に収める＝同義）に統一点検。
4. changed=true / change_summary_jp に「raw_stem 値ドリフト(0.98/0.99→0.8/0.9)是正、源逐語一致」を明記。
5. 原 corpus の他問数値ドリフト有無も別途点検推奨（本 attempt の責務範囲外、申し送り）。
