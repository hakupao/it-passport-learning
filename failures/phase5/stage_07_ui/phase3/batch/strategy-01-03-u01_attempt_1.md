# strategy-01-03-u01 — attempt 1 (jp-rejected)

- 日期: 2026-11-04 (S142 第 12 批 b12、workflow `d9e6216` = D-205)
- 输入: run_tag `b12-u01-a1`、Workflow run `wf_03eec8f3-991`、manifest (prep S142、4 用語)。
- 产物 (gitignored): `.../strategy-01-03-u01/parts/b12-u01-a1/` (jp.r0 / jp.r1)、journal 退避 `.../strategy-01-03-u01/journal.b12-u01-a1.jsonl`。
- 技术判定: `jp-rejected`、validate 0、JP 審査 2 輪とも REVISE (#1 medium 1、#2 medium 2 + low 4)。用量 subagent ≈ 372k token、10.6 分。
- 业务判定 (阻止の指摘、題文は引用しない):
  - #1 medium (r1 で解消): 原価の一句話・総表の定義 (用意するための費用 / 売上高から最初に引く費用) が、同じ用語の考点 (2010h22a-q026、総原価 = 製造原価 + 営業費) の範囲と食い違う (観点 7)。
  - #2 medium 2: 原価の図が売上原価・棚卸高の計算表なのに、それらの定義は図の後の detail にしかない / 営業利益の段階図 caption が営業外・特別損益・法人税等を定義前に使う (観点 3 定義してから使う)。high 0。
  - 型: 定義前の使用 (図が detail より前に来る骨格 one → 図 → detail で、図に新しい語を載せる)。#1 の範囲修正で原価一般に寄せた結果、図 (売上原価) との対応が切れた = 改稿で足した変更が次の不合格を作る (S139 と同型)。
- 下一 attempt 的输入: attempt 2 = `jp.r1` (sha `2f5906d9…`) + jp-review #2 を種 (D-201 §0-2)。
