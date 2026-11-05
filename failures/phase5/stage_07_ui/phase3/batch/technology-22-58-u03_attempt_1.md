# technology-22-58-u03 — attempt 1 (jp-rejected)

- 日期: 2026-11-05 (S142 第 17 批 b17、workflow `d9e6216` = D-205)
- 输入: run_tag `b17-u03-a1`、Workflow run `wf_bed3efb3-755`、manifest (prep S142、7 用語、35 題)。
- 产物 (gitignored): `.../technology-22-58-u03/parts/b17-u03-a1/` (jp.r0 / jp.r1)、journal 退避 `.../technology-22-58-u03/journal.b17-u03-a1.jsonl`。
- 技术判定: `jp-rejected`、validate 0、JP 審査 2 輪とも REVISE (#1 medium 3 + low 12、#2 medium 3 + low 8)。用量 subagent ≈ 457k token、15.6 分。
- 业务判定 (阻止の指摘、題文は引用しない):
  - #1 medium 3 (r1 で解消): ESSID「暗号化には関わらない」の言い切り (WPA2-PSK では SSID が鍵生成のソルト) / メッシュ Wi-Fi の既存 SVG が直列で網目に見えない / SSID 未定義。
  - #2 medium 3: Wi-Fi Direct の総表「親機が要らない」が detail・図「一方が親機の役を兼ねる」と矛盾 / Wi-Fi Direct = アドホックと読める考点 / ゲスト ESSID を分けるだけで内部を遮断できるという因果 (2022r04-q068・2018h30h-q100 では通信制限が別設定)。high 0。
  - 型: 網羅的な言い切り、欄どうしの範囲、題にない因果。
- 下一 attempt 的输入: attempt 2 = `jp.r1` (sha `04190f53…`) + jp-review #2 を種 (D-201 §0-2)。
