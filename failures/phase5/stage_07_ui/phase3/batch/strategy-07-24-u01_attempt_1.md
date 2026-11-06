# strategy-07-24-u01 — attempt 1 (rejected)

- 日期: 2026-11-06 (S147、workflow `dde96567` = D-208 + D-209 + D-210)
- 输入: run_tag `b36-u01-a1`、Workflow run `wf_86322899-4a7`、seed: なし。
- 产物 (gitignored): `.../strategy-07-24-u01/parts/b36-u01-a1/`、journal 退避 `.../strategy-07-24-u01/journal.b36-u01-a1.jsonl`。
- 技术判定: rejected。審査: jp-review #1 REVISE low 7 + medium 1/jp-review #2 REVISE low 9 + medium 1。404k token / 9.9 分。
- 业务判定 (high / medium、審査の detail_jp 全文):
  - jp-review #1 medium `key_points_jp[0] / terms[1].fig.steps[0].caption_jp` (観点 1 網羅的な言い切り / 観点 9 限定条件): 要点 1 は「調達は RFI → RFP → 提案書の評価 → 発注先の決定と契約、の順に進む」と、図の step 1 も「まず RFI で…集める」と、RFI をすべての調達で必ず通る段階として言い切っている。しかし同じ単元の引用題のうち、調達の手順を図で示す 2010h22h-q004 と 2011h23tokubetsu-q004 の流れには RFI が入っていない (要求事項・要件仕様書の策定から始まり RFP の作成へ進む)。RFI と RFP の両方を出す場面を述べた題 (2014h26h-q007) は、ある会社の事例として書かれている。題のデータが支えるのは「RFI を行うなら RFP より前」という順序であり、「調達は必ず RFI から始まる」ではない。初学者が RFI を必須の段階と覚えてしまう。
  - jp-review #2 medium `key_points_jp[0] (関連: goals_jp[1]、terms[1].fig)` (D-198 (iii) / D-208 書き方 11 (b)): 確認題にも入っている 2014h26a-q024 は、判断項目 a「RFP の提示」・b「委託契約の締結」・c「委託先の決定」・d「提案書の評価」を正しい順に並べさせる題で、正解は a→d→c→b。key_points_jp[0] の「RFP を示した後は、提案書の評価、発注先の決定と契約の順に進む」は、この 4 項目を一揃いにして正解の順に言い直している (「提案書の評価」は題の語と同じ。「発注先の決定」は「委託先の決定」の言い換え)。goals_jp[1] の「RFP を示してから提案書を評価し、発注先を決めて契約する」と RFP の段階図 (n2〜n4) も同じ並びを繰り返しているので、本文が実質的に並べ替え題の答えの一覧になっている。調達の流れはこの topic の中心なので、流れを教えること自体は正当。問題は、題の判断項目と同じ一揃いの並びを 3 箇所で再現している点にある。
- 下一 attempt: 最後の part + 審査 #2 を種 (D-207 に従い判定)。
