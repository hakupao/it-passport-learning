# technology-13-35-u03 — attempt 1 (rejected)

- 日期: 2026-11-06 (S147、workflow `dde96567` = D-208 + D-209 + D-210)
- 输入: run_tag `b41-u03-a1`、Workflow run `wf_c3b7cd87-be7`、seed: なし。
- 产物 (gitignored): `.../technology-13-35-u03/parts/b41-u03-a1/`、journal 退避 `.../technology-13-35-u03/journal.b41-u03-a1.jsonl`。
- 技术判定: rejected。審査: jp-review #1 REVISE low 6 + medium 1/jp-review #2 REVISE low 5 + medium 1。329k token / 6.2 分。
- 业务判定 (high / medium、審査の detail_jp 全文):
  - jp-review #1 medium `terms[3].hook_jp` (観点 7 欄同士の整合 (D-204: 記法の像が同じ用語の定義と食い違う)): one_jp・overview・goals・key_points はルールベースを「ルールに事実を当てはめて判断する方式」と定義しているのに、hook_jp は「データベースが事実をためておく所なら、ルールベースは『もし〜ならば〜』をためておく所」と、ルールの格納場所 (rule base = 知識ベース) として描いている。英語の rule-based (方式) と rule base (ルール集) を同じ像にまとめており、初学者がルールベースを『入れ物』と覚え、本文の『判断の方式』と食い違う。
  - jp-review #2 medium `challenge_questions[2]` (観点1: challenge_questions の題が単元に合っているか): 2010h22a-q083 は DVD-R の記憶容量と 1 文字 2 バイトから保存できるページ数を求める情報量の計算題で、この単元の内容 (述語論理・演繹/帰納推論・ルールベース = 記号的 AI) とは関係しない。同じ topic にあるというだけで載せており、単元末の確認問題として学習者を混乱させる。
- 下一 attempt: 最後の part + 審査 #2 を種 (D-207 に従い判定)。
