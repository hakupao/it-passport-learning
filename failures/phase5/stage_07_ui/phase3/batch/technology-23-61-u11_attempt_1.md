# technology-23-61-u11 — attempt 1 (jp-rejected)

- 日期: 2026-11-05 (S142 第 16 批 b16、workflow `d9e6216` = D-205)
- 输入: run_tag `b16-u11-a1`、Workflow run `wf_6c6b8b9f-ef3`、manifest (prep S142、8 用語)。
- 产物 (gitignored): `.../technology-23-61-u11/parts/b16-u11-a1/` (jp.r0 / jp.r1)、journal 退避 `.../technology-23-61-u11/journal.b16-u11-a1.jsonl`。
- 技术判定: `jp-rejected`、validate 0、JP 審査 2 輪とも REVISE (#1 medium 2 + low 10、#2 high 1 + medium 3 + low 11)。用量 subagent ≈ 441k token、12.9 分。
- 业务判定 (阻止の指摘、題文は引用しない):
  - #1 medium 2 (r1 で解消): スミッシングの「入口が替わっただけ」が不正アプリの差を消す / APT の総表が対象を組織に限る (one・2026r08-q096 は組織や個人)。
  - #2 high: フィッシングの考点 2 と key_points[3] が 2012h24h-q066 の判断項目 a・b・c を同じ順で言い直す (D-198 (iii))。medium 3: SE 対策を「人と手順の側」に限るが図・考点は物の対策も挙げる / フィッシングの入口をメールに限り (引用題は「電子メールなど」)、スミッシングとの包含関係と食い違う / トラッシングの考点に「ネットワークを使わないので」という題にない一般則。
  - 型: 引用題の判断項目の流用 (D-198 (iii))、限定の追加。r1 の改稿で high が新たに出た (改稿が次の不合格を作る)。
- 下一 attempt 的输入: attempt 2 = `jp.r1` (sha `77d513e7…`) + jp-review #2 を種 (D-201 §0-2)。
