# C20 監査 42 題 + 仕分け 248 件 (S162、opus、読み取りのみ)

## 監査記録の無い 42 題 (critic opus × 3、exam ごと)
- 2023r05 15 題: 全 FAITHFUL、指摘 0 (計算依存の q013・q033・q043・q075〜q077 は stem と検算)。
- 2024r06 13 題: DRIFT 2 (low)。q041 correct = jp「正解は「イ」」を zh/en は結合点名「C」で答える (→ 対象)。q060 correct = zh/en が「矢印が指す」と図の描写を補足 (無害な補足 → 対象外)。
- 2026r08 14 題: 訳のずれ 0。jp-error 1 = q044 d.ウ (2分/件で数えると 290 分 → 85.5% → 86% = エ で、85% にならない → 対象、三語)。
  - 同 agent の「q044 の表示問題文が 98%/18%」は誤り: raw `questions.json` の stem_jp を見たもの。表示層の sidecar `stem_jp_clean` は 90%/10% (main session が確認)。

## 248 件の仕分け (analyst opus)
- 入力: 未処置 low のうち第 1 群 (triage_first72.md) に入らなかった、ずれ系の語を含む 248 件。現行データと照合。
- IN 15 項目 / OUT-gloss 22 / OUT-term 210 / OUT-jp 0 / GONE 1 (2009h21a-q071 zh d.ウ)。
- IN のうち弱め 5 (标准化采购・批准和确认・未来一周・一一对应・不能动用) も最小補丁は軽いので対象に残す (main 判断)。
- 2023r05-q097 points[1]: en だけ直す (zh は既に jp の含意どおり、jp は変えない)。

## 確定
`targets.json` = 32 項目 (main 15 + analyst 15 + audit42 2)。
