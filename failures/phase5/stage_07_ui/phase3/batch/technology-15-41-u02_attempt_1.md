# technology-15-41-u02 — attempt 1 (rejected)

- 日期: 2026-11-06 (S147、workflow `dde96567` = D-208 + D-209 + D-210)
- 输入: run_tag `b43-u02-a1`、Workflow run `wf_374349da-a78`、seed: なし。
- 产物 (gitignored): `.../technology-15-41-u02/parts/b43-u02-a1/`、journal 退避 `.../technology-15-41-u02/journal.b43-u02-a1.jsonl`。
- 技术判定: rejected。審査: jp-review #1 REVISE low 8 + medium 2/jp-review #2 REVISE low 8 + medium 1。383k token / 9.8 分。
- 业务判定 (high / medium、審査の detail_jp 全文):
  - jp-review #1 medium `terms[1].points[2].text_jp` (D-198 (iii) / D-208 書き方 11 (d)): 引用題 2011h23tokubetsu-q069 は穴埋め題で、空欄 a・b に入る語がハイバネーションとスタンバイの組。題文はそれぞれを『作業状態を補助記憶装置に保存して電源を切る』『作業状態を主記憶装置に記憶して省電力モードへ移る』で識別させている。この考点は、空欄の 2 語をそのまま組にして、それぞれの保存先 (主記憶 / 補助記憶) という題文の識別要素とともに言い直している (順序を入れ替えただけ)。D-209 の除外 (両側を正の定義で述べた対比) も、空欄の語と比較の相手の組まで再現している場合は (d) に当たる。数値・主体名の流用はないので medium。
  - jp-review #1 medium `terms[3].one_jp / terms[4].one_jp / terms[5].one_jp / overview_rows[3..5].one_line_jp` (観点 1 事実 / 観点 7 欄同士の整合): DDR3・DDR4・DDR5 を『DRAM の規格の第 3 世代』『第 4 世代の DRAM 規格』などと言い切っているが、DRAM の規格には DDR 方式より前の世代 (DDR 以前の SDRAM など) もあり、第 3〜5 世代なのは DDR SDRAM の系列の中での番号である。DDR3 の detail は『DDR … DDR3 はその 3 代目』と DDR 系の中の世代として正しく限っており、一句話・総表の範囲と食い違う。初学者が『DRAM 規格は DDR3 から数えて 3 番目』のように誤って覚えるおそれがある。
  - jp-review #2 medium `terms[2].points[1].text_jp` (D-198 (iii) / D-208 書き方 11 (b)): 引用題 2016h28h-q072 は題文に特徴を 2 つ並べて、それに当たる装置を選ばせる分類型の題 (題文「機械的な可動部分が無く, 電力消費も少ない」)。考点の「駆動部品が要らず、消費電力も少ない」は、この 2 つの特徴を同じ組・同じ順で並べ、「〜も少ない」という形まで同じにして言い直している。前半の「フラッシュメモリに記録」は一般的な定義だが、後半は題の判断材料をそのまま並べた形になっている。数値や固有の場面は使っていないので medium とする。
- 下一 attempt: 最後の part + 審査 #2 を種 (D-207 に従い判定)。
