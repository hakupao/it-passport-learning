# technology-16-43-u01 — attempt 1 (rejected)

- 日期: 2026-11-06 (S147、workflow `dde96567` = D-208 + D-209 + D-210)
- 输入: run_tag `b37-u01-a1`、Workflow run `wf_2f51a107-c36`、seed: なし。
- 产物 (gitignored): `.../technology-16-43-u01/parts/b37-u01-a1/`、journal 退避 `.../technology-16-43-u01/journal.b37-u01-a1.jsonl`。
- 技术判定: rejected。審査: jp-review #1 REVISE low 6 + medium 2/jp-review #2 REVISE low 5 + medium 1。372k token / 9.2 分。
- 业务判定 (high / medium、審査の detail_jp 全文):
  - jp-review #1 medium `terms[2].detail_jp (2 文目)` (観点 7 欄同士の整合 / 観点 4 D-198 (iii) 場面設定の流用): 並列処理の one_jp・overview_rows[2]・pairs[1] は「処理を分けて複数の CPU (または複数台) で同時に実行する」と範囲を定めているのに、detail の 2 文目は「CPU と出力装置のように独立して動く装置どうしでも、一方が前の仕事を出力している間にもう一方が次の仕事を計算すれば全体が早く終わる」と、CPU と入出力装置が重なって動くこと (処理を分割して複数 CPU に割り当てるのではない) も並列処理に含めている。定義の範囲が他欄と食い違う。またこの文は 2013h25h-q057 の題文の設定 (1 台の CPU と 1 台の出力装置が独立して動作し、前のジョブの出力中に次のジョブの CPU 処理を進める) をそのままなぞっている (数値は流用していないので high ではない)。
  - jp-review #1 medium `challenge_questions[3] (2018h30a-q094)` (観点 1 確認題が単元に合っているか): 2018h30a-q094 は「バッチ処理の説明として適切なもの」を問う題で、正解の概念 (一定期間・一定量のデータをまとめて一括処理) は本単元のどの欄でも扱っていない。本単元と関わるのは誤答肢の 1 つだけで、学習者は本単元を読んでも正解を選べない。
  - jp-review #2 medium `terms[5].fig (steps[1]〜[3].caption_jp / data.nodes)` (観点 7 欄同士の整合 / 観点 3 初学者): Webシステム の段階図は ブラウザ→Webサーバ→アプリケーションサーバ→データベースサーバ の 3 層構成を、例であることを示さずに Web システムの動きそのものとして描いている (step 2「業務の処理を後ろのサーバに頼む」を無条件に言い切る)。一方 detail_jp は「規模の大きなシステムでは、例えば…役割ごとにサーバを分けることがある」と任意の構成として述べ、one_jp も「Webサーバとの要求と応答」で定義している。初学者には、Web システムは必ず 3 種のサーバを持つと読め、one / detail と定義の範囲が食い違う。
- 下一 attempt: 最後の part + 審査 #2 を種 (D-207 に従い判定)。
