# strategy-05-14-u09 — attempt 1 (rejected)

- 日期: 2026-11-06 (S147、workflow `dde96567` = D-208 + D-209 + D-210)
- 输入: run_tag `b34-u09-a1`、Workflow run `wf_b4a48240-69e`、seed: なし。
- 产物 (gitignored): `.../strategy-05-14-u09/parts/b34-u09-a1/`、journal 退避 `.../strategy-05-14-u09/journal.b34-u09-a1.jsonl`。
- 技术判定: rejected。審査: jp-review #1 REVISE low 10 + medium 2/jp-review #2 REVISE low 7 + medium 1。342k token / 7.5 分。
- 业务判定 (high / medium、審査の detail_jp 全文):
  - jp-review #1 medium `challenge_questions[2]` (観点1 (quiz / challenge_questions の題が単元に合っているか)): 2015h27h-q013 は SFA の目的を問う題 (正解ウ = 営業のノウハウ共有と営業活動の効率化) で、この単元の AI のリスクと社会的論点 (バイアス・ハルシネーション・ディープフェイク・責任論・トロッコ問題・オプトアウト) のどの用語とも関係しない。確認題の数を満たすための水増しに見え、学習者には単元と無関係な題が出る。
  - jp-review #1 medium `key_points_jp[0]` (観点7 (欄同士の整合) / 観点9 (引用題の支持しない限定)): 要点は「対策は学習前のデータの**点検**に置かれる」と対策を点検 (確認作業) に限っているが、同じ用語の detail は「データを集めて整える段階」、exam 考点は「学習に入る前のデータの準備全般」と述べ、範囲が合わない。引用題 2025r07-q008 の正解は判断項目すべてが適切で、確認だけでなくデータへの付与作業や除外といった準備作業も対策に含まれるため、「点検」への限定は正解が支持する範囲より狭い。
  - jp-review #2 medium `terms[4].hook_jp` (観点1 事実 / D-195 §6 (記憶フックは語源など定義と別の正しい手がかり)): 「トロッコ = 線路の分かれ目」は語の意味の誤り。トロッコは線路の上を走る小さな運搬車 (英語 truck に由来) で、分岐点の意味ではない。記憶フックが偽の語義を教えてしまう (分かれ目は思考実験の設定の一部であって語そのものの意味ではない)。
- 下一 attempt: 最後の part + 審査 #2 を種 (D-207 に従い判定)。
