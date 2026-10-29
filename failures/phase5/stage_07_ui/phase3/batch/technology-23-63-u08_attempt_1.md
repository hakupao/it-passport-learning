# technology-23-63-u08 — attempt 1 (jp-rejected)

- 日期: 2026-10-29 (S137 第 2 批 b02、D-203 適用後の workflow `fdda304`)
- 输入: run_tag `b02-u08-a1`、Workflow run `wf_414101aa-0d3`、manifest `data/ip/textbook/.planning/v2/technology-23-63-u08/manifest.json` (8 用語、47 題)。
- 产物 (gitignored): `.../technology-23-63-u08/parts/b02-u08-a1/` (jp.r0 / jp.r1)、journal 退避 `.../technology-23-63-u08/journal.b02-u08-a1.jsonl`。
- 技术判定: `jp-rejected`、validate 0、JP 審査 2 輪とも REVISE (#1 high 4 + medium 2 → #2 {"medium":1,"low":7})。用量 subagent ≈ 421k token、10.8 分。
- 业务判定 (阻止の指摘、題文は引用しない):
  - #1 (初稿 r0): high 写し 3 (D-198 (iii) 場面流用: リスクベース認証の考点 = 引用題正解肢の場面の言い直し / IC カードの考点 = 正解肢の要素を同順 / パスワードの考点 = 題の記述とほぼ全文一致 [カタカナ遮蔽で機械検査の 12 字に届かず]) + high 限定条件 (乱数表とマトリクス表をまとめ「使った値は次回通用しない」と無条件 — 乱数表は座標が同じなら同じ値) / medium 図の強調ノードと caption のずれ / medium アクセス制御・アクセス管理・認証の関係が未説明。
  - #2 (r1): medium 1 のみ — 乱数表・マトリクス表が未定義のまま OTP の考点に登場し、OTP の一種と読める (観点 3 / 7)。
  - 初稿の写し 3 件は「二段階で書く」(書き方 1) を守っていない型。改稿は #1 の 6 件を全て解消し新規 medium は 1 (D-203 の護欄後、退行なし)。
- 下一 attempt 的输入: D-201 §0-2 → jp.r1 + jp-review #2 を種に改稿 (run_tag `b02-u08-a2`)。
