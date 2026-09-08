# Rule B — S123 U3b 2019h31h precrop attempt 1 (失敗、脚本修正で解消)

- **入力**: `node scripts/quiz-fidelity-prep-any.mjs 2019h31h u3b <87 qnums> --precrop` (脚本 = S119 U0 版、HEAD cbac3ea)。
- **産物**: manifest は 87/87 生成されたが **question_crop_png 0/87** (40 ページ全て `page_mismatch: detected 0`)。calib ログ `head=170 body=210`。
- **技術判定**: 見出しモードの較正が exam 全体の「行の最左インク x」の行数首位を採るため、2019h31h では (a) 問N 見出しの左縁が奇数/偶数ページで 140/150 に揺れて票が割れ、(b) 表・図枠の左縁 170 が 9 ページ × 220〜470 行で首位となり、head=170 → 見出し 0 検出。2018h30h は見出し 140 が一様で顕在化しなかった。
- **業務判定**: 実害なし (crop 無し = agent が源ページ全体を読む安全側劣化)。ただし予算 (画像 Read 回数) と U1 で実証した crop の読取精度を失うため、run 前に修正した。
- **次 attempt の入力**: 較正を「bucket が 14〜150 行載るページ数の投票」に変更 (`HEAD_PAGE_ROWS_LO/HI`)。2019h31h → head=150 (30p)、83/87 cropped (page-37 は 3/4 で安全側 skip)。回帰: 2018h30h 69/70・2015h27a 90/100 の crop PNG が md5 で byte 同一。q062 / q015 の crop を主 context が目視。S123 log §1。
