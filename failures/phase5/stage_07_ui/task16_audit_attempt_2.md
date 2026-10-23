# Stage 7 Phase 1 — Task 16 Rule A attempt 2 (証拠不十分 → 不採用)

- 日期: 2026-10-23 (S132)
- 输入: attempt 1 の修正 commit `ffccf12` (choiceLayout: 非 CJK 不可断行串 ≥ 6 码点 → list; CSS `min-width:0; overflow-wrap:anywhere` 兜底)。
- 产物: implementer の全量走査 = 2900 题 × ja/zh「5800/5800、溢出 0」(scratchpad、未入库)、q059 重拍。
- 技术判定: q059 は list に変わり遮挡なし。fidelity 0 diff。
- 业务判定 (Rule D 審査 oh-my-claudecode:code-reviewer): **PASS とせず**。
  1. 走査は兜底 ON で実施 → 文字は構造上溢出し得ず、規則の不足を検出できない。兜底 OFF で再走査すると row4 のうち 7 题 (2014h26h-q068 / 2014h26h-q083 / 2018h30a-q005 / 2015h27a-q007 / 2019r01a-q095 / 2022r04-q088 / 2025r07-q071) が溢出、兜底 ON では「JS/ON」「BC/P」「A→B→/C」のように語中で折れる。原因: 码点数では →①× 等の全角幅字形・pairs の键徽标・￥(U+FFE5、UAX#14 PR) を過小評価。
  2. 「5800」に中問の非先頭成员 約 300 面が含まれるが、`?ids=<非先頭>` は組の先頭を描画するため実際には未走査 (審査側が翻页補走査: 397/400 面、溢出 0)。
  3. 訳文表示時 (zh/en) の row4 では英語訳が語中で折れる (en 331 面以上、zh 44 面以上)。
- 下一 attempt 的输入: choiceLayout を幅推定に変更 (ASCII ≈0.55em、その他の非 CJK ≈1em、pairs 键徽标を加算、U+FFE0–FFEE を CJK 類から除外、開き括弧/閉じ句読点の禁則を連続串に算入)、訳文表示中は list に退避、判定 = 兜底 OFF の全量走査で row4 溢出 0 + 中問は翻页して全成员を走査。
