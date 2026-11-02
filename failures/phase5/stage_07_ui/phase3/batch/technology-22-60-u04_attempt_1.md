# technology-22-60-u04 — attempt 1 (jp-rejected)

- 日期: 2026-11-02 (S140 第 10 批 b10、workflow `d9e6216` = D-205)
- 输入: run_tag `b10-u04-a1`、Workflow run `wf_8d7512cd-eda`、manifest (prep S140、7 用語)。
- 产物 (gitignored): `.../technology-22-60-u04/parts/b10-u04-a1/` (jp.r0 / jp.r1)、journal 退避 `.../technology-22-60-u04/journal.b10-u04-a1.jsonl`。
- 技术判定: `jp-rejected`、validate 0、JP 審査 2 輪とも REVISE (#1 high 4 + medium 2、#2 high 1 + low 11)。用量 subagent ≈ 453k token、16.6 分。
- 业务判定 (阻止の指摘、題文は引用しない):
  - #1 high 4 (r1 で解消): 題の列挙・場面の流用 D-198 (iii) (2014h26a-q070 ヘッダの項目 / 2017h29a-q093 誤答肢の列挙 / 2021r03-q071 列挙の並び替え / 2023r05-q083 場面)。medium 2: ISDN の定義前使用、図 caption 2 文。
  - #2 high: オンラインストレージの detail が 2019h31h-q084 の正しい記述群を言い換えて並べた機能の列挙 (同題が同用語の quiz にも入る)。D-198 (iii)。
  - 型: 例の列挙の流用が主 (validate の字数一致では検出できない)。
- 下一 attempt 的输入: attempt 2 = `jp.r1` (sha `eade61c0…`) + jp-review #2 を種 (D-201 §0-2)。
