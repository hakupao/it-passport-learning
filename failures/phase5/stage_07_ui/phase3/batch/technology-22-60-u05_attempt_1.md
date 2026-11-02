# technology-22-60-u05 — attempt 1 (jp-rejected)

- 日期: 2026-11-02 (S140 第 10 批 b10、workflow `d9e6216` = D-205)
- 输入: run_tag `b10-u05-a1`、Workflow run `wf_6f122294-f3e`、manifest (prep S140、7 用語)。
- 产物 (gitignored): `.../technology-22-60-u05/parts/b10-u05-a1/` (jp.r0 / jp.r1)、journal 退避 `.../technology-22-60-u05/journal.b10-u05-a1.jsonl`。
- 技术判定: `jp-rejected`、validate 0、JP 審査 2 輪とも REVISE (#1 medium 2、#2 medium 1 + low 5)。用量 subagent ≈ 433k token、8.0 分。
- 业务判定 (阻止の指摘、題文は引用しない):
  - #1 medium 2 (r1 で解消): 図の step caption が 2 文 (D-195 §2、validate 未検査) / 総表の「セル」が定義前 (観点 3)。
  - #2 medium: challenge_questions[2] = 2011h23tokubetsu-q077 は単元の用語・本文にない概念を問い、本単元を読んでも解けない (観点 1、題数下限 3 の穴埋め)。validate は同 topic と題数しか見ない。
  - 型: 確認題の選び方 (批間候補 ⑤ と同型)、ここでは阻止級。high 0。
- 下一 attempt 的输入: attempt 2 = `jp.r1` (sha `522e1d93…`) + jp-review #2 を種 (D-201 §0-2)。
