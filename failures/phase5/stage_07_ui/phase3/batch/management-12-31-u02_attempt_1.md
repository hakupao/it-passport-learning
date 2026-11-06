# management-12-31-u02 — attempt 1 (jp-rejected)

- 日期: 2026-11-06 (S146、workflow `dde96567` = D-208 + D-209 + D-210)
- 输入: run_tag `b25-u02-a1`、Workflow run `wf_149c7426-063`、seed なし。
- 产物 (gitignored): `.../management-12-31-u02/parts/b25-u02-a1/`、journal 退避 `.../management-12-31-u02/journal.b25-u02-a1.jsonl`。
- 技术判定: `jp-rejected`。審査: jp-review #1 REVISE medium 2 + low 11 / jp-review #2 REVISE medium 1 + low 9。
- 业务判定 (high / medium、審査の detail_jp 要約):
  - jp-review #1 medium `terms[4].points[0].text_jp`: 第 2 文「経営者の依頼による監査なら、助言や勧告の相手も経営者である」は、2015h27a-q035 の題文の前提「ある企業の経営者から依頼され実施したシステム監査」と問い「助言及び勧告する相手」、正解ウ「経営者」を、前提→答えの組のままなぞった文になっている。一般原則 (助言・勧告も報告と同じく依頼者に向ける) ではなく、その題の場面設定 (依頼主体 = 経営者) を条件文の形で再現している。主体は役職名で固有名や数値ではないため high ではなく medium とした。
  - jp-review #1 medium `terms[5].hook_jp`: 「差し出すまでが監査人、受け取って動くのは相手」は、改善提案 (= 報告書に載るもの) を監査人から直接受け取るのが改善する側 (被監査部門) だという像になっている。しかし同じ単元の報告書の one・detail・points・hook・pairs は宛先を依頼者に限っており、引用題でも被監査部門の役割として「システム監査人から監査報告書を受領する」(2017h29h-q051 ウ)・「システム監査報告書の受理」(2017h29a-q050 エ) は誤答になっている。記法がデータの否定する受け渡しを運んでいる。
  - jp-review #2 medium `terms[5].hook_jp`: 記法が「監査人の役目は、直し方を示すところまでである」と、監査人の役目を改善提案で終わるように限っている。同じ単元のフォローアップの one_jp・detail・points (2013h25a-q038 エ、2019h31h-q055 エ、2024r06-q042 d) は、報告の後も監査人が改善の実施状況を確かめ、評価し、指導するとしている。key_points[0] と pairs[1] の「監査人がすること」の行もフォローアップを監査人の仕事としている。記法が運ぶ結論が、後の用語の定義・考点と食い違う。
- 下一 attempt: a2 = a1 `jp.r1` + jp-review #2 を種 (D-207 に従い判定)。
