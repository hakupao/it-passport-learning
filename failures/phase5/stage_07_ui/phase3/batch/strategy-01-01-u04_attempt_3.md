# strategy-01-01-u04 — attempt 3 (jp-rejected)

- 日期: 2026-11-06 (S146、workflow `dde96567` = D-208 + D-209 + D-210)
- 输入: run_tag `b21-u04-a3`、Workflow run `wf_4fea2ffa-0aa`、seed = a2 `jp.r1` + jp-review #2 (ユーザー「种子 a3」)。
- 产物 (gitignored): `.../strategy-01-01-u04/parts/b21-u04-a3/`、journal 退避 `.../strategy-01-01-u04/journal.b21-u04-a3.jsonl`。
- 技术判定: `jp-rejected`。審査: jp-review #1 REVISE medium 1 + low 8 / jp-review #2 REVISE medium 2 + low 6。
- 业务判定 (high / medium、審査の detail_jp 要約):
  - jp-review #1 medium `terms[5].points[0].text_jp`: 考点の後半「計画の文書そのものはBCPと呼ぶ」は、BCP を「文書」に限っている。しかし引用題 2015h27a-q007 で BCP に当たる対策 a は、代わりのプロセスを用意すること (文書ではない) であり、題はこれを BCP と分類している。さらに同じ単元の goals_jp[2] (「備えの内容を定めた計画か、それに沿って備えを整え保ち続ける活動か」)、pairs[1].rows[0].b_jp (「計画に沿って備えを整え」)、BCM 図 steps[1] (「備えを…実際に整える」) は「備えを整える
  - jp-review #2 medium `terms[5].points[0].text_jp`: 2015h27a-q007 は対策 a・b に当たる用語の組 (a=BCP, b=BCM) を選ばせる組合せ題。考点は 1 文目で a の判断項目 (別の拠点が互いの生産をバックアップするプロセスを準備する) を「非常時に使う代わりの手段や手順」と一般化し、2 文目で b の判断項目 (切換えを円滑にするために定期的に試験運用と見直しを行う) を「機能するかを訓練や点検で確かめ、見直し続ける」と言い直している。題と同じ a→b の順で、判断項目の組 (BCP=a / BCM=b) と語 (切換え→「切り替え方」、見
  - jp-review #2 medium `goals_jp[2] / pairs[1].rows[0].b_jp / terms[5].points[0].text_jp ↔ terms[5].one_jp / overview_rows[5].one_line_jp / terms[5].fig / pairs[1].rows[1].b_jp`: BCM の one_jp・総表・図 (第 1 段「分析・BCP の策定」)・対比表の「主な中身」の行は、BCM に BCP の策定を含めている。一方、学習目標 3 は「備えの中身を決める計画か、決めた備えを保ち確かめ続ける活動か」で分けると教え、対比表「何か」の行と exam 考点も BCM を「その計画が機能するかを確かめ、見直し続ける活動」に限っている。学習目標の基準で分けると、策定 (備えの中身を決める作業) は BCM に入らないことになり、同じ用語の one_jp と範囲が食い違う。
- 下一 attempt: a4 = a3 `jp.r1` + jp-review #2 を種 (D-207 に従い判定)。
