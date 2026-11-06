# strategy-02-04-u02 — attempt 3 (jp-rejected、停止規則 2 回目)

- 日期: 2026-11-06 (S146 第 20 批 b20)
- 输入: run_tag `b20-u02-a3`、Workflow run `wf_a5ffe526-99a`、seed = a2 `jp.r1` (sha256 `54f7329ca432…`) + jp-review #2 (ユーザー判断「种子 a3 + 改考点」)。
- 产物 (gitignored): `.../strategy-02-04-u02/parts/b20-u02-a3/` (jp.r0 / jp.r1)、journal 退避 `.../strategy-02-04-u02/journal.b20-u02-a3.jsonl`。
- 技术判定: `jp-rejected`、validate 0、JP 審査 2 輪とも REVISE (#1 medium 1、#2 medium 1 + low 8)、high 0。用量 subagent ≈ 330k token、7.4 分。
- 业务判定:
  - ボリュームライセンス考点 (a1〜a2 の停止原因) は解消 (a3 の 2 輪で指摘なし)。
  - 限定提供データ `terms[0].points[2]` の除外範囲が 3 輪連続で同じ箇所: a2 #2「改正前文言を版なし」→ a3 r0 で除外条件を削除 → #1「定義が広すぎ、2024r06-q010 誤答エを否定できない」(fix: 版を特定しない言い方で「営業秘密は含まれない」を戻す) → r1「営業秘密に当たらないもの」→ #2「改正後文言を版なし、引用題正解イ (改正前文言) と除外範囲がずれる」(fix: 削除を優先、残すなら版を明記)。
  - 審査 instance 間で fix の方向が逆 (#1 = 戻せ、#2 = 削除優先)。改正をまたぐ定義を引用題 (改正前) に結び付けた exam 考点で、D-205 (版の明記) と観点 5 (引用題の正解との一致) と観点 9 (限定条件の落ち) が同時に満たしにくい型。
- 判定: 同じ箇所の再指摘 → **停止規則** (D-207 第 3 attempt も未過)。
- 下一 attempt: ユーザー「先问 Fable 再定」→ Fable 諮問 → D-210 (`dde96567`) → a4 = a3 `jp.r1` + jp-review #2 を種 (`wf_3c4959a7-e58`)。
