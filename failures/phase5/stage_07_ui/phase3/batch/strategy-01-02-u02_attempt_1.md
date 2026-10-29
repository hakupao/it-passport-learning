# strategy-01-02-u02 — attempt 1 (jp-rejected)

- 日期: 2026-10-29 (S138 第 7 批 b07、workflow `d9e6216` = D-205)
- 输入: run_tag `b07-u02-a1`、Workflow run `wf_ad62ec6b-d23`、manifest (prep S138、5 用語)。
- 产物 (gitignored): `.../strategy-01-02-u02/parts/b07-u02-a1/` (jp.r0 / jp.r1)、journal 退避 `.../strategy-01-02-u02/journal.b07-u02-a1.jsonl`。
- 技术判定: `jp-rejected`、validate 0、JP 審査 2 輪とも REVISE (#1 medium 2 low 5 → #2 high 1 medium 1 low 5)。用量 subagent ≈ 348k token、7.2 分。
- 业务判定 (阻止の指摘、題文は引用しない):
  - #1 (r0): medium ×2 = ロジックツリー・系統図の exam 考点が引用題の記法 (矢印の連鎖・設問の約束) を持ち込み、用語そのものの事実を述べず、one・図と向きが逆に見える (観点 1/7、D-198 (iii) 近接)。
  - #2 (r1): high 系統図の考点 2 (改稿で新規) が「系統図は特性要因図と分解の向きが逆」と事実誤り (どちらも達成・発生側 → それを生む側へ分解、違いは対象と用途) / medium 管理図の比喩「線を超えた日だけ調べればよい」が detail・図・要点 (片側への連続も異常の兆し) を否定 (D-204 観点 7)。
  - 改稿の退行: #2 high は #1 の修正で書き直した考点で新規発生 (対比の加筆が事実誤り)。#2 medium は r0 から存在 (#1 見落とし)。
- 下一 attempt 的输入: attempt 2 = `jp.r1` (sha `a050640a…`) + jp-review #2 を種 (D-201 §0-2)。
