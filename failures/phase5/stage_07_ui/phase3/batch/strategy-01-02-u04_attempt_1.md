# strategy-01-02-u04 — attempt 1 (jp-rejected)

- 日期: 2026-10-29 (S138 第 7 批 b07、workflow `d9e6216` = D-205)
- 输入: run_tag `b07-u04-a1`、Workflow run `wf_c030288f-85a`、manifest (prep S138、4 用語)。
- 产物 (gitignored): `.../strategy-01-02-u04/parts/b07-u04-a1/` (jp.r0 / jp.r1)、journal 退避 `.../strategy-01-02-u04/journal.b07-u04-a1.jsonl`。
- 技术判定: `jp-rejected`、validate 0、JP 審査 2 輪とも REVISE (#1 medium 2 low 5 → #2 medium 1 low 5)。用量 subagent ≈ 362k token、6.7 分。
- 业务判定 (阻止の指摘、題文は引用しない):
  - #1 (r0): medium ×2 = 回帰分析の図 caption・総表で説明変数・目的変数が定義前使用 / 相関と因果の表が相関係数・散布図・正負の相関を定義前使用 (観点 3)。
  - #2 (r1): medium 相関と因果の hook が相関を「向きを問わない関係」と言い、同用語の図・detail・考点・要点の「向き」(正負) と同じ語が逆の意味で食い違う (観点 7 / D-204 hook)。
  - 改稿の退行: #2 は r0 から存在する hook か改稿で変わったかは未確認 (#1 は hook を指摘せず)。
- 下一 attempt 的输入: attempt 2 = `jp.r1` (sha `21efb024…`) + jp-review #2 を種 (D-201 §0-2)。
