# technology-23-62-u04 — attempt 1 (jp-rejected)

- 日期: 2026-10-29 (S138 第 4 批 b04、D-204 後の workflow `0b3bc55`)
- 输入: run_tag `b04-u04-a1`、Workflow run `wf_48ed5fc8-e74`、manifest (prep S138、8 用語)。
- 产物 (gitignored): `.../technology-23-62-u04/parts/b04-u04-a1/` (jp.r0 / jp.r1)、journal 退避 `.../technology-23-62-u04/journal.b04-u04-a1.jsonl`。
- 技术判定: `jp-rejected`、validate 0、JP 審査 2 輪とも REVISE (#1 medium 3 → #2 {"high":2,"medium":2,"low":9})。用量 subagent ≈ 420k token、18.0 分。
- 业务判定 (阻止の指摘、題文は引用しない):
  - #1 (r0): medium 継続的改善の hook「C = 点検表に印」が考点 (手順どおりの監視は D) の否定側 = **D-204 観点 7 の新規定で初検出** / medium インシデント図の順序 (報告 → 評価 → 初動) と考点「まず切り離してから報告」が食い違う / medium 安全管理措置の定義 (個人データ) と考点・quiz の範囲 (ISMS 一般の管理策) が合わない。
  - #2 (r1): **high 2** — 継続的改善の考点で D の例 3 つが引用題の場面を qids 順に縮めたもの (D-198 (iii)) / プライバシーポリシーの考点前半が 2011h23tokubetsu-q030 の題文を 1〜2 字ずつ置換しただけ (12 字閾値の回避) / medium 「第三者による評価は C」が正解肢の要素そのもの / medium 図 caption 2 文。
  - 退行の型: #1 で hook の C/D を正すため考点に具体例を足した結果、引用題の場面の列挙になった (加筆による写し)。プライバシーポリシーの写しは r0 から存在 (#1 未検出)。
- 下一 attempt 的输入: attempt 2 = `jp.r1` (sha `c45f6b58…`) + jp-review #2 を種 (D-201 §0-2)。
