# strategy-05-14-u05 — attempt 2 (rejected)

- 日期: 2026-11-06 (S147、workflow `dde96567` = D-208 + D-209 + D-210)
- 输入: run_tag `b33-u05-a2`、Workflow run `wf_a6050ffd-ab8`、seed: a1 jp.r1 + jp-review #2。
- 产物 (gitignored): `.../strategy-05-14-u05/parts/b33-u05-a2/`、journal 退避 `.../strategy-05-14-u05/journal.b33-u05-a2.jsonl`。
- 技术判定: rejected。審査: jp-review #1 REVISE low 8 + medium 1/jp-review #2 REVISE low 5 + medium 1。345k token / 5.6 分。
- 业务判定 (high / medium、審査の detail_jp 全文):
  - jp-review #1 medium `terms[3].analogy_jp` (観点 1 事実 / 観点 7 欄同士の整合 (D-204 比喩の像)): 比喩が「いくつもの窓口に分かれて保管されている自分の書類に、同じ整理番号を付けて一つにまとめるようなもの」となっている。「一つにまとめる」は、個人の情報を一か所に集めて管理する像を伝える。マイナンバー制度は情報を一元管理せず、各機関が従来どおり分散して持ち、番号で照合・連携する仕組みであり、比喩の像は事実に合わない。同じ用語の detail (「正確に結び付ける」) や pairs (「同じ人の情報を結び付ける」) は連携を述べているのに、比喩だけが集約を述べており、欄同士でも像が食い違う。
  - jp-review #2 medium `terms[1].one_jp / overview_rows[1].one_line_jp ↔ terms[2].one_jp / terms[2].points[0] / pairs[0].rows[0]` (観点 7 欄同士の整合 (定義の範囲の食い違い)): 電子調達は one_jp で「国や自治体が物品・サービスを購入する調達手続」、総表で「行政が物品・サービスを購入する手続」と範囲を物品・サービスの購入に限っている。一方、電子入札は one_jp で「公共工事や物品調達の入札」と公共工事を含め、mix 考点と pairs[0] (「そのうち入札書の提出と開札の段階」) で電子入札は電子調達の一部だと言い切る。公共工事の入札が電子調達の範囲外に読めるため、「電子入札 ⊂ 電子調達」という包含関係が単元内で成り立たない。
- 下一 attempt: 最後の part + 審査 #2 を種 (D-207 に従い判定)。
