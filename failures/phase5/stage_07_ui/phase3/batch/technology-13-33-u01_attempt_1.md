# technology-13-33-u01 — attempt 1 (rejected)

- 日期: 2026-11-06 (S147、workflow `dde96567` = D-208 + D-209 + D-210)
- 输入: run_tag `b56-u01-a1`、Workflow run `wf_c07a9e06-b1f`、seed: なし。
- 产物 (gitignored): `.../technology-13-33-u01/parts/b56-u01-a1/`、journal 退避 `.../technology-13-33-u01/journal.b56-u01-a1.jsonl`。
- 技术判定: rejected。審査: jp-review #1 REVISE low 8 + medium 1/jp-review #2 REVISE low 7 + medium 1。368k token / 8.3 分。
- 业务判定 (high / medium、審査の detail_jp 全文):
  - jp-review #1 medium `terms[1].fig.steps[0]` (観点 3 図と文が噛み合うか / 観点 1 caption と図の一致 (FlowState: 最初の show 個を表示し最後を強調)): 段階図の第 1 step は show:2 なので「13 ÷ 2 = 6 余り 1」と「6 ÷ 2 = 3 余り 0」の 2 つが出て、強調されるのは 2 つ目 (6 ÷ 2) になる。ところが caption は「10進数の 13 を 2 で割り、商と余りを書く。」で 1 回目の割り算しか説明していない。強調される節点と caption が食い違い、最初の割り算は 1 度も単独で強調されない。figureSpec では show は 1 から使えるので、制約のせいでずれたわけではない。
  - jp-review #2 medium `terms[0].points[0].qids` (観点1 (exam 考点の qids の題がその点を問うているか) / 観点5): この考点の主張は「10進数の小数が2進数で有限桁に収まる条件」だけである。qids の 2012h24a-q066 (有限小数で表せる10進数を選ぶ題、正解 0.5) はこの主張を問うている。しかし 2010h22h-q052 は2進数の小数 1.101 を10進数に直す題 (正解 1.625) で、問うのは小数部の各桁の重みを足して値を読むことであり、有限桁に収まるかどうかは問うていない。考点は q052 が問う中身 (小数部の値の読み方) を言い切っておらず、引用題と考点の対応がずれている。
- 下一 attempt: 最後の part + 審査 #2 を種 (D-207 に従い判定)。
