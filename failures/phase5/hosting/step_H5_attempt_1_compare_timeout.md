# step H5 attempt 1 — 本文比較の 1 回目 (networkidle 待ち) を中止

- **入力**: textbook 735 ページの比較 (`H5_tools/compare.mjs` の初版、`waitUntil: "networkidle"`、上限 45 s、並列 4)。基線 main (:3160) / 候補 out/ (:3150)。
- **産物**: 75 / 735 で中止 (結果ファイルは未出力、後の再実行で上書き)。
- **技術判定**: FAIL (道具側)。main の page は `@vercel/analytics`・`speed-insights` の script を読みに行き、local では middleware が `/_vercel/*` を `/ja/_vercel/…` へ転送し続けるため network が静かにならず、main 側の読込が毎回 timeout 近くまで待つ (全件で 1 時間超の見込み)。同じ回の試行 3 ページでは、JS 無効の context で TreeWalker の filter callback が呼ばれず nojs の抽出が 0 件になる不具合も見つけた。
- **業務判定**: 製品の不具合ではない (比較道具の待ち方と抽出方法の問題)。比較結果は 1 件も採用していない。
- **次の attempt への入力**: 両側で `**/_vercel/**` を abort (候補には元から無い; D-220 の expected 差として meta.scripts で記録)、`load` + 自前の静穏判定 (600 ms、上限 12 s)、TreeWalker は filter なしで祖先を手で判定。→ attempt 2 で 735 ページ完走 (`evidence/phase5/hosting/H5_fidelity.md`)。
