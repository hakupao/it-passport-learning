# strategy-03-10-u01 — attempt 1 (jp-rejected)

- 日期: 2026-11-06 (S146、workflow `dde96567` = D-208 + D-209 + D-210)
- 输入: run_tag `b30-u01-a1`、Workflow run `wf_59bfe0f4-56e`、seed なし。
- 产物 (gitignored): `.../strategy-03-10-u01/parts/b30-u01-a1/`、journal 退避 `.../strategy-03-10-u01/journal.b30-u01-a1.jsonl`。
- 技术判定: `jp-rejected`。審査: jp-review #1 REVISE medium 1 + low 9 / jp-review #2 REVISE medium 1 + low 7。
- 业务判定 (high / medium、審査の detail_jp 要約):
  - jp-review #1 medium `terms[5].fig`: カスタマージャーニーマップの図 (figures/strategy-03-10-u01-t01.svg) は「認知→興味・関心→比較・検討→購入→利用→継続・推奨」の段階を矢印でつないだだけの流れ図。一方 one_jp はこの用語を「段階ごとに、行動・考え・感情と接点を時間の順に書き出した図」と定義し、detail_jp も「段階ごとの感情の浮き沈みを並べる」と説明している。定義の中心である段階ごとの行動・感情・接点の行が図にないため、初学者には単なる購買段階の流れ (購買行動モデル) に見え、マップそのものの形が
  - jp-review #2 medium `pairs[0].rows[1]`: UX の one_jp は「実際に使ったり、使う場面を思い描いたりすることで人に生じる」として、まだ使っていない人の想定上の利用も含めている (2020r02o-q018 の正解も利用場面の想定を含む)。ところが対比表の「体験する人」行は UX を「利用者」、CX を「顧客 (購入前の見込み客を含む)」とし、購入前の人を含むことを CX だけの違いとして示している。これでは UX は実際の利用者に限られると読め、同じ表の rows[0] a_jp「(想定を含む)」や one_jp と範囲が食い違う。
- 下一 attempt: a2 = a1 `jp.r1` + jp-review #2 を種 (D-207 に従い判定)。
