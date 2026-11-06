# technology-21-56-u01 — attempt 1 (rejected)

- 日期: 2026-11-06 (S147、workflow `dde96567` = D-208 + D-209 + D-210)
- 输入: run_tag `b52-u01-a1`、Workflow run `wf_e902cfcc-908`、seed: なし。
- 产物 (gitignored): `.../technology-21-56-u01/parts/b52-u01-a1/`、journal 退避 `.../technology-21-56-u01/journal.b52-u01-a1.jsonl`。
- 技术判定: rejected。審査: jp-review #1 REVISE low 5 + medium 3/jp-review #2 REVISE low 6 + medium 1。443k token / 8.9 分。
- 业务判定 (high / medium、審査の detail_jp 全文):
  - jp-review #1 medium `terms[3].fig` (観点 3 (図と文が噛み合うか) / D-195 §2): 射影の図は元の表の列 (図書番号・書名・在庫数) を『行』として縦に並べ、残る列を key:true の行として強調している。pairs[1] の要の行は『選択=行 (横の並び) / 射影=列 (縦の並び)』で、この単元で一番大事な区別が行と列の向きなのに、射影の図では残る項目が横の行として光る。初学者が図から『射影でも行が残る』と読み取るおそれがあり、選択の図 (行が残る) と見分けにくい。
  - jp-review #1 medium `terms[1].points[0].text_jp / pairs[0].rows[0].a_jp / overview_rows[0].extra_jp[1]` (観点 1 (網羅的な言い切り) / 観点 7): 『挿入は行の数を 1 件増やし』『1 件増える』『行が 1 件増える』と、増える行数を 1 件に限って言い切っている。挿入 (INSERT) は 1 回の操作で複数行を加えることもでき、引用題にもこの限定を支持する題はない。挿入と更新の違いの要は『行が増えるか、増えないか』で、件数を限る必要はない。
  - jp-review #1 medium `pairs[0].rows[1].b_jp` (観点 7 (欄同士の整合: 限定が他欄と合わない)): pair では更新の対象を『条件で指定した既存の行』に限っているが、terms[1].detail_jp では『条件を付けずに実行すると、表のすべての行の値が書き換わる』と書いており、条件がなくても対象になる。対象の範囲が欄どうしで合っていない。
  - jp-review #2 medium `terms[4].fig (flow steps: nodes t1→t2→m→r)` (観点 3 (図と文の噛み合い) / 観点 1 (図の因果)): flow 図は FlowFig.tsx / figures.module.css でノード間に「→」(スマホでは「↓」) を描く直列の連鎖として表示される。このため図は「貸出表 → 図書表 → つなぐ → 一覧」と読め、貸出表が図書表へ変わる、または貸出表から図書表へ流れる手順のように見える。実際の 2 つの表は並列の入力で、one_jp・detail_jp・caption の「どちらの表にも図書番号の列がある」とも合わない。さらに step 1 (show:2) で強調される (focus) のは最後のノードの図書表だけなので、caption の「どちらの表にも」と強調の対象がずれる。初学者が結合を「表から表への変換手順」と誤解するおそれがある。
- 下一 attempt: 最後の part + 審査 #2 を種 (D-207 に従い判定)。
