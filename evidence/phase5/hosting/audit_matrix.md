# Audit Matrix — 配信移設 (D-217〜) / 三言語混入検査

| Step | 名称 | 抽検 N | 样本来源 | 技術判定 | 業務判定 |
|:----:|------|:-----:|----------|:-------:|:-------:|
| H0-st0 | robots.txt (止血) | — (変換なし) | Rule D 3 回 | PASS | PASS (attempt 2 FAIL → `failures/phase5/hosting/step_00_attempt_1.md`) |
| L3 | 混入走査の分類 / 当たり以外 / hook | 30 / 60 / 10 | content 当たり 15 層の層別 (seed 20261111) / 非当たり各言語 20 (seed 20261112) / hook (seed 20261113) | PASS (走査器の実装誤りなし、当たりは全て規則どおりの文字種) | **要対処**: A = 真の混入 1/30 (zh.json「分野」、S86 修正の後退)、B = 1/60 (zh 解説「正解」; zh 1/20 95%CI 0.1〜24.9%、ja・en 0/20 上限 約 14%)、C = hook 10/10 は `[[jp:]]` 付け忘れ (約定の穴、混入ではない)。漢字だけの日本語混入は語表で定向検索が要る (「正解」112・「立案」約 15・「分野」12)。詳細 `L3_audit.md`・`L3_samples.json` |
| H1-2 | 公開データ切り出し | 全件機械比較 (2,900×3、解説 2,900×9) + 目視 10 + 5 | seed 20261111 / 20261112 | PASS | attempt 1 **FAIL** (解説の言語切替、`failures/phase5/hosting/step_H1-2_attempt_1.md`) → attempt 2 **PASS** |
| H5 | 静的版と現行版の本文一致 | textbook 全件 735 (244 単元×3 + 目次 3) + 30 (+ 補足 27) | 全件 / seed 20261115 (各言語 10: today・練習・模試・用語一覧/詳細・browse 一覧/詳細・記録・設定・AI 先生) | PASS (js・nojs の text node 機械 diff、未分類 0; Playwright 159 passed / 0 failed / 2 skipped) | **PASS — real regression 0**。基線 = main 1956a486 (L4 前): textbook 615/735 完全一致、差 120 頁 (zh 76・en 44) は全て L4 内容修正 (hunk 236 + title 1)、nojs の LocaleSwitcher 二重 732 は main の streaming 由来。対照 (main のコード + branch の data/messages) では差 0 (120/120)。30 件: 30/30 PASS (L4 由来の差 7、画像 byte 一致 30/30、目視 30/30)。記録入り 12・解答後 9 も一致。詳細 `H5_fidelity.md`・`H5_fidelity.json` |
