# S131 efix5 amend attempt 1 — 2021r03-q058 要点 2 en の置換が冪等でなかった (Rule B)

- 入力: `scripts/quiz-fidfix-S131-efix5.mjs` に Rule D 後の amend (N1: q058 要点 2 en を "Anti-passback is a record-based entry/exit control, not a physical barrier, that checks … to detect and deter tailgating; distinguish the two." に置き換え) を、efix5 初版の適用結果を from とする行として追加した版
- 産物: `--apply` は正しく適用された (applied 11、最終形の文は Rule D の提案文どおり)。データは無傷
- 技術判定: **FAIL (冪等ゲート)**。適用後の dry-run 再実行が applied 1。efix5 初版の行の一つは from が「to detect and deter tailgating; distinguish the two.」(短い末尾片) で、amend 後の最終形の末尾がちょうどこの文字列に戻るため、再実行のたびにこの行が当たってしまう
- 業務判定: dry-run のため書込みなし。2 回目の `--apply` を実行していた場合は、文が中間形に戻っていた
- 次の attempt の入力: q058 en の初版 2 行を 1 行にまとめる。from は HEAD の元の文全体 ("Anti-passback is a logical control that checks … ; distinguish the two.")、to は最終形にする。中間形を from とする amend 行は、中間状態から当てる場合のために残す。修正後の dry-run は applied 0 / skipped 80。HEAD の元の文が from と一致することも確認した
