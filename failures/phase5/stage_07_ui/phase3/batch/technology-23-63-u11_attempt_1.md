# technology-23-63-u11 — attempt 1 (jp-rejected)

- 日期: 2026-10-29 (S138 第 3 批 b03、D-203 後の workflow)
- 输入: run_tag `b03-u11-a1`、Workflow run `wf_47ae61b4-b26`、manifest (prep S138、8 用語)。
- 产物 (gitignored): `.../technology-23-63-u11/parts/b03-u11-a1/` (jp.r0 / jp.r1)、journal 退避 `.../technology-23-63-u11/journal.b03-u11-a1.jsonl`。
- 技术判定: `jp-rejected`、validate 0、JP 審査 2 輪とも REVISE (#1 medium 2 + low 7 → #2 {"high":1,"medium":1,"low":9})。用量 subagent ≈ 395k token、10.1 分。
- 业务判定 (阻止の指摘、題文は引用しない):
  - #1 (r0): medium トラストアンカー/信頼の基点の考点「中間証明書は信頼の基点ではない」が無条件で、同単元の他欄 (「多くの場合」ルート証明書が担う・役割の名前) と食い違う (観点 7) / medium サーバ証明書の考点が 2010h22a-q080 の前提 (SSL/TLS 接続中 + 証明書が運営者のもの) の片方を落とし、証明書確認だけで暗号化まで判断できると言い切る (観点 9)。
  - #2 (r1): **high** 改稿で #1 の修正案どおり前提を両方書いた結果、2010h22a-q080 の場面設定と判断項目 a/b/c を丸ごと再現 (D-198 (iii) 場面・列挙の流用、12 字連続一致に届かず validate は通過) / medium サーバ証明書の考点後半が 2018h30h-q057 の誤答肢を順に否定するだけで事実を述べない (観点 2)。
  - 退行の型: 審査 #1 の修正案 (題の前提を両方書け) に従った結果 D-198 写しになった = 修正案自体が写しを誘導。
- 下一 attempt 的输入: attempt 2 = `jp.r1` (sha `74fd5a64…`) + jp-review #2 を種 (D-201 §0-2)。
