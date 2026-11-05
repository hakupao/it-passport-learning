# technology-23-61-u12 — attempt 1 (jp-rejected)

- 日期: 2026-11-05 (S142 第 16 批 b16、workflow `d9e6216` = D-205)
- 输入: run_tag `b16-u12-a1`、Workflow run `wf_3bb87e0a-64c`、manifest (prep S142、6 用語)。
- 产物 (gitignored): `.../technology-23-61-u12/parts/b16-u12-a1/` (jp.r0 / jp.r1)、journal 退避 `.../technology-23-61-u12/journal.b16-u12-a1.jsonl`。
- 技术判定: `jp-rejected`、validate 0、JP 審査 2 輪とも REVISE (#1 medium 2 + low 6、#2 medium 1 + low 8)。用量 subagent ≈ 373k token、10.1 分。
- 业务判定 (阻止の指摘、題文は引用しない):
  - #1 medium 2 (r1 で解消): クリプトジャッキングの比喩 (延長コードで電気だけ取る) が「他人の機器の計算能力を使う」の逆の像 (D-204)。「ボット」がプログラムと機器で揺れる (観点 7)。
  - #2 medium: DoS の手口を「ふだんの利用と同じ形の通信を集中させる」と言い切り、引用題 (2013h25h-q052 等) が支持する「量」より狭い限定を作る。detail の例の列挙が q052 正解肢の例示と同じ 2 項目 (D-205 / 観点 9 / D-198 (iii) 近接)。high 0。
  - 型: 題の例示を一般の要件に格上げ、比喩の像、用語の指示対象の揺れ。
- 下一 attempt 的输入: attempt 2 = `jp.r1` (sha `54c13c6d…`) + jp-review #2 を種 (D-201 §0-2)。
