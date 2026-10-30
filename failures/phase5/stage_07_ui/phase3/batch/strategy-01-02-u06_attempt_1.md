# strategy-01-02-u06 — attempt 1 (jp-rejected)

- 日期: 2026-10-30 (S138 第 8 批 b08、workflow `d9e6216` = D-205)
- 输入: run_tag `b08-u06-a1`、Workflow run `wf_f18c435d-01b`、manifest (prep S138、7 用語)。
- 产物 (gitignored): `.../strategy-01-02-u06/parts/b08-u06-a1/` (jp.r0 / jp.r1)、journal 退避 `.../strategy-01-02-u06/journal.b08-u06-a1.jsonl`。
- 技术判定: `jp-rejected`、validate 0、JP 審査 2 輪とも REVISE (#1 medium 1、#2 medium 2)。用量 subagent ≈ 395k token、9 分。
- 业务判定 (阻止の指摘、題文は引用しない):
  - #1 medium (r0、r1 で解消): クロス集計表の detail が「割合に直すとグループ間で比べられる」と分母を特定せず、直後の考点「全体の合計で割ると構成比」と並べると全体合計で割ってもグループ比較ができると読める (観点 7 / 観点 3)。
  - #2 medium ①: 複合グラフの考点が「移動合計の折れ線は季節による増減がならされる」と、合計期間が 1 年 (季節の 1 周期) を覆うという条件なしに言い切る (観点 9 限定条件の脱落、D-205 系の観点 9)。
  - #2 medium ②: 複合グラフの図が「棒 = 量 / 折れ線 = 変化」の 2 枝 tree で one・detail の言い直し (飾りの図、D-195 §2)、かつ複合グラフ = 棒 + 折れ線に限られると読める (観点 7)。
  - 型: ① は改稿で足した因果説明 (「ならされる」) が前提条件を落とした一般化 — b07 u02 の「改稿で足した対比が事実誤り」と同系 (改稿加筆の主張の検証不足)。② は図の選び方。
- 下一 attempt 的输入: attempt 2 = `jp.r1` (sha `cc4ee620…`) + jp-review #2 を種 (D-201 §0-2)。
