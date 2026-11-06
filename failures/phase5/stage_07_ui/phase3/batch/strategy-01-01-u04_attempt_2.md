# strategy-01-01-u04 — attempt 2 (jp-rejected)

- 日期: 2026-11-06 (S146、workflow `dde96567` = D-208 + D-209 + D-210)
- 输入: run_tag `b21-u04-a2`、Workflow run `wf_8d1222bb-3a0`、seed = a1 `jp.r1` + jp-review #2。
- 产物 (gitignored): `.../strategy-01-01-u04/parts/b21-u04-a2/`、journal 退避 `.../strategy-01-01-u04/journal.b21-u04-a2.jsonl`。
- 技术判定: `jp-rejected`。審査: jp-review #1 REVISE medium 1 + low 9 / jp-review #2 REVISE medium 1 + low 8。
- 业务判定 (high / medium、審査の detail_jp 要約):
  - jp-review #1 medium `terms[6].points[1].text_jp / terms[6].one_jp / terms[6].fig.steps[2].caption_jp / overview_rows[6].one_line_jp / overview_rows[6].extra_jp[1]`: リスクアセスメント自体の役割が欄によって食い違う。one_jp・図の「評価」step・総表 one_line は、この取組み自体が「対応の優先度を判断する」としている (JIS Q 31000 のリスク評価とも合う)。一方 mix 考点と総表 extra[1] は「備えの優先度を判断する材料を出す取組み」とし、優先度の判断は取組みの外 (後の計画側) で行うように読める。同じ総表の行の中でも one_line は「判断する取組み」、extra は「判断する材料」で割れている。初学者は、優先度の判断がアセスメントに含
  - jp-review #2 medium `terms[6].points[1].text_jp`: mix 考点は「その判断の結果を使って何にどう備えるかを定めた計画が**BCP**である」と、リスクアセスメントの結果に基づく備えの計画を BCP と言い切っている。だが同じ用語の detail_jp は、評価結果は回避・低減・移転・受容の対応選択につながり、BCP の材料に「も」なる (= 使い道の一つ) と書いており食い違う。BCP 自身の one_jp も「重要業務を止めないか、早く再開する」ための計画と範囲を限っている。この考点のとおり定義すると、リスク評価をもとにした防火対策や保険の計画まで BCP に入
- 下一 attempt: a3 = a2 `jp.r1` + jp-review #2 を種 (D-207 に従い判定)。
