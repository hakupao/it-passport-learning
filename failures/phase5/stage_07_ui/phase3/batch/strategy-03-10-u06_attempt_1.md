# strategy-03-10-u06 — attempt 1 (jp-rejected)

- 日期: 2026-11-06 (S146、workflow `dde96567` = D-208 + D-209 + D-210)
- 输入: run_tag `b31-u06-a1`、Workflow run `wf_26c4915d-f8b`、seed なし。
- 产物 (gitignored): `.../strategy-03-10-u06/parts/b31-u06-a1/`、journal 退避 `.../strategy-03-10-u06/journal.b31-u06-a1.jsonl`。
- 技术判定: `jp-rejected`。審査: jp-review #1 REVISE medium 1 + low 8 / jp-review #2 REVISE medium 2 + low 5。
- 业务判定 (high / medium、審査の detail_jp 要約):
  - jp-review #1 medium `terms[1].one_jp / terms[1].fig.data.nodes[0].label.jp / terms[1].fig.steps[0].caption_jp`: 一句話が A/Bテストを「一部だけを変えた 2 つの案」を比べる手法と定義し、図 n1「一部を変えた 2 案を作る」と step 1 caption「比べたい部分だけを変えた」も同じ限定を置いている。しかし引用題 2022r04-q034 (正解 ア A/Bテスト) は新しく作ったデザインと従来のデザインのサイトを並行稼働させて比べる場面で、変更箇所を一部に限っていない。同じ用語の detail_jp は「変える箇所を絞ると…判断しやすい」と任意の工夫として書き、exam 考点も「2 つの版の Web ページなど」
  - jp-review #2 medium `terms[2].hook_jp`: 「ふだん耳にする『レコメン』『おすすめ』と同じ根の言葉」とあるが、「おすすめ (お勧め)」は和語で、英語 recommend とは語源が別。同じ根の言葉と言うのは事実の誤り。また略語として一般的なのは「レコメンド」で、「レコメン」という形も通用しているとは言いにくい。
  - jp-review #2 medium `terms[3].one_jp / terms[3].detail_jp`: overview_rows の一句話 (「ネットワークにつないだディスプレイで」)、exam 考点 (「ネットワーク経由で内容を届け」)、図の key 行 (「ネットワーク経由で切り替える」)、key_points (「離れた場所から切り替えられる」) は、どれもネットワーク接続を定義の中心に置いている。引用題 2019r01a-q090 の正解も、ネットワークに接続した表示機器による情報発信である。ところが one_jp ではネットワークに触れておらず、detail_jp は「ネットワークにつなぐと〜できる」と条
- 下一 attempt: a2 = a1 `jp.r1` + jp-review #2 を種 (D-207 に従い判定)。
