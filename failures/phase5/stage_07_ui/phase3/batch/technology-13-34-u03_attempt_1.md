# technology-13-34-u03 — attempt 1 (rejected)

- 日期: 2026-11-06 (S147、workflow `dde96567` = D-208 + D-209 + D-210)
- 输入: run_tag `b49-u03-a1`、Workflow run `wf_47e62eee-56c`、seed: なし。
- 产物 (gitignored): `.../technology-13-34-u03/parts/b49-u03-a1/`、journal 退避 `.../technology-13-34-u03/journal.b49-u03-a1.jsonl`。
- 技术判定: rejected。審査: jp-review #1 REVISE low 11 + medium 1/jp-review #2 REVISE low 8 + medium 1。378k token / 8.1 分。
- 业务判定 (high / medium、審査の detail_jp 全文):
  - jp-review #1 medium `terms[0].fig.data.cols[2] / terms[0].detail_jp / terms[5].detail_jp` (観点3 定義してから使う): 「散布図」が最初の用語である相関係数の図の列見出し「散布図の点の並び」と detail の「点は直線に沿って並ぶ」、さらに回帰分析の detail「散布図の点の並びに最もよく合う直線」で説明なしに使われている。散布図がどんな図かを述べる文 (「2 つの変数を縦軸と横軸にとった散布図」) は最後の用語である相関分析の detail まで出てこない。前提単元 u02 (平均値〜偏差値) も散布図を扱っていないため、初学者は相関係数の図にある「点」が何なのかを読み取れない。
  - jp-review #2 medium `terms[0].analogy_jp` (観点7 (D-204: 比喩の像が同じ用語の考点の否定する内容を運ぶ)): 比喩は「二人三脚の息の合い方に点数を付ける」で始まる。点数の像では +1 が最良、−1 が最低になり、0 は中くらいの息の合い方に見える。そのため「負の値ほど関係が弱い (息が合っていない)」と読める。ところが同じ用語の考点 points[1] は「関係の強さは絶対値で比べる。−0.8 は +0.3 よりも関係が強い」と言っており、比喩の像が運ぶ順序 (−1 < 0 < +1 で良さが並ぶ) と食い違う。しかも二人三脚で片方が前に出てもう片方が下がるのは失敗の場面なので、−1 を「そろった動き」とする 2 文目とも噛み合わない。0 (無関係) にあたる像も無い。
- 下一 attempt: 最後の part + 審査 #2 を種 (D-207 に従い判定)。
