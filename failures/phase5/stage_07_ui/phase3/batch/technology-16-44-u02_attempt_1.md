# technology-16-44-u02 — attempt 1 (loc-rejected)

- 日期: 2026-11-06 (S146、workflow `dde96567` = D-208 + D-209 + D-210)
- 输入: run_tag `b29-u02-a1`、Workflow run `wf_c4b40ce9-ac8`、seed なし。
- 产物 (gitignored): `.../technology-16-44-u02/parts/b29-u02-a1/`、journal 退避 `.../technology-16-44-u02/journal.b29-u02-a1.jsonl`。
- 技术判定: `loc-rejected`。審査: jp-review #1 REVISE medium 1 + low 6 / jp-review #2 PASS low 7 / loc-review #1 REVISE medium 1 + low 9 / loc-review #2 REVISE medium 1 + low 6。
- 业务判定 (high / medium、審査の detail_jp 要約):
  - jp-review #1 medium `terms[1].hook_jp`: 記法が「Between は『故障と故障の間』で、その間はシステムが動いている」と言っている。故障を出来事として読むと、ある故障から次の故障までの間には修復の区間も入るので、「その間はずっと動いている」は正しくない。同じ用語の one は「修復して動き始めてから次に故障するまで」と区間を限っている。考点は「運用時間から修復時間の合計を差し引いて稼働時間だけにしてから割る」と、故障から故障までの時間に修復が含まれることを前提にしている。記法の像のまま覚えると、修復時間を引かずに割るという、考点が防ごうとしている誤りにつ
  - loc-review #1 medium `pairs[0].rows[0].label_en / a_en / b_en`: jp の行は「日本語名」で、略語 MTBF/MTTR の日本語名 (平均故障間隔 / 平均修復時間) を示す行。en は label_en を "Japanese name" としたまま、中身を英語の展開形 "Mean time between failures" / "Mean time to repair" にしている。英語読者には「日本語名」の欄に英語が入っている表になり、行の意味が成り立たない。
  - loc-review #2 medium `terms[3].points[0].text_zh`: jp の結論「運用時間全体に占める稼働時間の割合」が zh では「它表示运行时间在全部运行时间中所占的比例」になっている。運用時間 と 稼働時間 を両方「运行时间」と訳したため、「運行時間が全運行時間に占める割合」(= 常に 1) という同語反復に読める。この単元の考点の中心 (分母 = 稼働 + 修復、分子 = 稼働だけ) がこの文では伝わらない。
- 下一 attempt: a2 = B5 (JP はそのまま、訳だけ改稿): seed_loc = a1 `loc.r1` + loc-review #2 (`wf_0569f90c-608`)。
