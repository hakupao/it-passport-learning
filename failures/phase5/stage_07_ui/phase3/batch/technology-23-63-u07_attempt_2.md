# technology-23-63-u07 — attempt 2 (jp-rejected)

- 日期: 2026-10-29 (S137 第 2 批 b02)
- 输入: run_tag `b02-u07-a2`、Workflow run `wf_9560fffd-1ac`、種 = `parts/b02-u07-a1/technology-23-63-u07.jp.r1.json` (sha `6f39bdd0…`) + jp-review #2 (attempt 1)。
- 产物 (gitignored): `.../technology-23-63-u07/parts/b02-u07-a2/` (jp.r0 / jp.r1)、journal 退避 `.../technology-23-63-u07/journal.b02-u07-a2.jsonl`。
- 技术判定: `jp-rejected`、validate 0、JP 審査 2 輪とも REVISE (#1 high 1 + medium 2 → #2 {"medium":3,"low":6})。用量 subagent ≈ 386k token、7.9 分。
- 业务判定 (阻止の指摘、題文は引用しない):
  - #1 (r0 = 種の改稿版): **high** 署名鍵の考点「秘密鍵と共通鍵は通信する当事者以外に知られてはならない」— 秘密鍵は通信相手にも知られてはならない (one・detail・pairs と矛盾、事実誤り。attempt 1 の指摘を直す過程で新たに生じた) / medium ディスク暗号化の比喩「書庫の扉に鍵」= アクセス制御の比喩で考点 (取り出せば入口の鍵は効かない) と逆 / medium デジタル署名の考点が引用題の前提「PKI において」を外して言い切り、同単元の自己署名証明書の考点と食い違う。
  - #2 (r1): ① ファイル暗号化・② ディスク暗号化の比喩が「書類/書庫」に置き換えただけで比喩の中で暗号化している (§6 定義の言い換え) / ③ 検証鍵の考点が one の言い直し + 「署名は送信者の鍵・暗号化は受信者の鍵」が図・pairs・key_points と 4〜5 回反復 (§9 / 観点 8)。
  - 改稿のたびに前回の medium は消えるが、改稿した箇所に新しい high / medium が生じる (attempt 1 #1→#2、attempt 2 #1→#2 とも別の箇所)。2 attempt × 2 輪 = 審査 4 回で一度も medium 0 に届かない。
- 下一 attempt 的输入: D-201 §0-3 停止規則 (同一単元 2 attempt 未過) → Fable 諮問 → ユーザー判断。
