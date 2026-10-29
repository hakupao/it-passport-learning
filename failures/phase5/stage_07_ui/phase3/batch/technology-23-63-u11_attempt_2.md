# technology-23-63-u11 — attempt 2 (jp-rejected)

- 日期: 2026-10-29 (S138 第 3 批 b03)
- 输入: run_tag `b03-u11-a2`、Workflow run `wf_46b9c0b7-f86`、種 = `parts/b03-u11-a1/technology-23-63-u11.jp.r1.json` (sha `74fd5a64…`) + jp-review #2 (attempt 1)。
- 产物 (gitignored): `.../technology-23-63-u11/parts/b03-u11-a2/` (jp.r0 / jp.r1)、journal 退避 `.../technology-23-63-u11/journal.b03-u11-a2.jsonl`。
- 技术判定: `jp-rejected`、validate 0、JP 審査 2 輪とも REVISE (#1 medium 4 → #2 {"medium":1,"low":9})。用量 subagent ≈ 392k token、8.0 分。
- 业务判定 (阻止の指摘、題文は引用しない):
  - #1 (r0 = 種の改稿版、a1 #2 の写し high は解消): medium サーバ証明書の考点が「確かめられるのは運営者のサーバであること」の 1 点に絞られ、2010h22a-q080 の正解 (偽サイトでない + 経路の盗み見なし) の片方を落として誤答を支える (観点 9) / medium PKI 考点「使えなくなった証明書を失効」が期限切れと読める (観点 1、2025r07-q087) / medium 検証のたどる向きとトラストアンカー「起点」の向きが goals・図・hook で食い違う (観点 3/7) / medium pairs[0]「決まり方」行の誤った二分 (観点 7)。
  - #2 (r1): medium 1 — 検証成功の条件を「トラストアンカーに着けば成功」とだけ言い切り、途中証明書の有効期限・失効を落として他欄と食い違う (観点 1/7、detail・図ラベル・caption・key_points の 4 箇所)。
  - q080 の考点は a1 #1 (前提を両方書け) → a1 #2 (写し high) → a2 #1 (片方に絞ると誤答支持) と往復した。high は a2 で 0、medium 2→1 / 4→1。
- 下一 attempt 的输入: D-201 §0-3 停止規則 (同一単元 2 attempt 未過) → Fable 諮問 → ユーザー判断。
