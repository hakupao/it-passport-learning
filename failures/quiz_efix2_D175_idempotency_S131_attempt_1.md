# S131 efix2 attempt 1 — D-175 の訳語入替えが冪等でなかった (Rule B)

- 入力: `scripts/quiz-fidfix-S131-efix2.mjs` の初版。D-175 (zh: dual = 双重系统 / duplex = 双工系统) を、対象 5 題 (2009h21a-q086 / 2012h24a-q057 / 2013h25a-q047 / 2014h26h-q056 / 2015h27a-q082) の zh field に単一 pass の正規表現で入れ替える (双工系统 ↔ 双重系统、双机系统 → 双工系统 ほか)
- 産物: `--apply` 1 回目は正しく適用された (置換 46 箇所、事後確認の corpus 全体照合 PASS)。データに誤りはない
- 技術判定: **FAIL (冪等ゲート)**。適用後の dry-run 再実行で `2009h21a-q086: D-175 置換数 8 (expected 10) — abort`。入替えは対合 (2 回当てると元に戻る) なので、subN の「出現 0 回なら skip」では冪等にならず、再実行すると適用済みの訳語を元に戻してしまう。置換数の固定 assert (D175_EXPECT) が、書き込む前に止めた
- 業務判定: データは無傷 (assert で中断、dry-run のため書込みなし)。2 回目の `--apply` を誰かが実行していた場合は訳語が元に戻っていた
- 次の attempt の入力: 題ごとの final note (generate_result の key_guard.note_jp) に MARK `fidfix-S131-efix2` があれば、その題の D-175 は適用済みとして題ごと skip する。修正後の dry-run は applied 0 / skipped 145
