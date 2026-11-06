# strategy-01-01-u04 — attempt 1 (jp-rejected)

- 日期: 2026-11-06 (S146、workflow `dde96567` = D-208 + D-209 + D-210)
- 输入: run_tag `b21-u04-a1`、Workflow run `wf_be695bb3-438`、seed なし。
- 产物 (gitignored): `.../strategy-01-01-u04/parts/b21-u04-a1/`、journal 退避 `.../strategy-01-01-u04/journal.b21-u04-a1.jsonl`。
- 技术判定: `jp-rejected`。審査: jp-review #1 REVISE medium 2 + low 11 / jp-review #2 REVISE medium 1 + low 8。
- 业务判定 (high / medium、審査の detail_jp 要約):
  - jp-review #1 medium `terms[5].points[1].text_jp / terms[5].one_jp / terms[5].fig / pairs[1].rows[1] / overview_rows[5].one_line_jp`: BCM の考点 2 (qid 2021r03-q052) は「設備や情報の予備を整える対策も BCM の活動に含まれる」と言うが、同じ用語の one_jp・段階図 (分析→BCP の策定→教育・訓練→点検・見直し)・総表・対比表の BCM「主な中身」(策定、教育・訓練、点検・見直しの繰り返し) は、どれも計画の策定・訓練・見直しだけを BCM の範囲として示している。しかも対比表は「代わりの手段」を BCP 側の中身に置くので、表のとおりに読む学習者は予備の確保を BCP の中身として分け、BCM の活動とは見ない
  - jp-review #1 medium `terms[6].points[1].text_jp`: mix 考点は、リスクアセスメントを「どのリスクにどれだけ備えるかを決める評価の段階」と言い切る。一方 detail_jp は評価の結果が対応の選択につながり「BCP で何にどれだけ備えるかを決める材料」になるとし、key_points[4]・goals[2] も「土台」としている (= 備えの量を決めるのは後続の対応・計画側)。考点だけがアセスメント自体に「決める」役を持たせており役割の範囲が食い違う。また同じ用語の図・detail はアセスメントを特定・分析・評価の 3 段階とするのに、考点はアセスメント全体を
  - jp-review #2 medium `terms[5].points[1].text_jp`: 2021r03-q052 は全項目正解型 (判断項目 a〜c = 備えの物的・技術的な対策、d = 「復旧手順の訓練を実施する」、正解 = 全部)。考点は「BCP で定めた備えを…整えておく対策も、人が復旧の手順を身に付ける訓練も、BCM の活動に含まれる」で、a〜c を一括りの『対策』に、d を『復旧の手順…訓練』に置き換え、題と同じ順 (対策群 → 訓練) で並べ、「〜も〜も含まれる」で『全部が当たる』という正解の形まで再現している。d の語句 (復旧手順 + 訓練) も残っている。判断項目の組と順をそのまま言
- 下一 attempt: a2 = a1 `jp.r1` + jp-review #2 を種 (D-207 に従い判定)。
