# strategy-06-19-u01 — attempt 1 (jp-rejected)

- 日期: 2026-11-05 (S145 第 19 批 b19、workflow `67579767`、D-209 適用後)
- 输入: run_tag `b19-u01-a1`、Workflow run `wf_f3ac1bc3-45c`、seed なし。
- 产物 (gitignored): `.../strategy-06-19-u01/parts/b19-u01-a1/` (jp.r0 / jp.r1)、journal 退避 `.../strategy-06-19-u01/journal.b19-u01-a1.jsonl`。
- 技术判定: `jp-rejected`、validate 0、JP 審査 2 輪とも REVISE (#1 medium 6 + low 8、#2 medium 2 + low 10)、high 0。用量 subagent ≈ 453k token、15.4 分。
- 业务判定:
  - #1 medium 6 (r1 で解消): E-R図 考点が業務プロセスのモデリングの題 (2024r06-q007) を引き E-R図 の分類と食い違う / DFD 考点が 2019r01a-q009 の題文の枠と判断項目 b→c の順をなぞる (D-209 分類型の免除は枠と順序まで再現のため非該当) / BPMN 考点に例示図の区画ラベル「業務群」を持ち込み detail と食い違う / BPR 考点の「全社的な」限定 (D-205) と目的の組の同順なぞり / RPA 考点が 2 つの正解肢の例の列挙を同組同順で流用 / RPA 対比の「AI = 規則を学ぶ技術」が広すぎる。
  - #2 medium 2: E-R図 考点が組合せ題 2010h22a-q031 の空欄の語と比較相手の組 {業務プロセスモデル=DFD, データモデル=E-R図} を再現 (D-209 ただし書きどおり (iii)、pairs と重複) / アクティビティ図は区画を分けて描くと言い切る (前提外し、detail の条件付きとずれる)。
- 下一 attempt: a2 = a1 `jp.r1` + jp-review #2 を種。
