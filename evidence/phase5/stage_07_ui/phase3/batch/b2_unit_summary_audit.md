# Task B2 — v1 unit_summary 制作メモ監査 (S135)

- 監査者: `oh-my-claudecode:verifier` opus (読み取りのみ)。対象 = v1 241 単元 × jp/zh/en = 723 条 (v2 の試点 3 単元は除外)。
- 方法: 規則走査 (順序/正準/canonical/頻度/term/D-\d+/schema/TODO/生成/分割/u\d\d/なお/NOTE 等、38 命中 = 全て誤検出) + 723 条の全件通読 + 三語照合。
- 結果: **整文削除すべき制作メモ 0 件** (`hits.json = []`)。全 summary が 1 文。既知の 1 件 (u03「正準な概念順」) は S135 lowfix で除去済。
- 語句レベルの境界 5 件 → `b2_unit_summary_borderline.json`。
  - 修正する (三語同時、その単元の一括書き直し時に B3 補正で): ① strategy-02-05-u02「u01 で定義した」(内部 id の露出 →「前ユニットで」) ② strategy-05-17-u01「本topicの土台ユニット」(構造語 → 削除)。
  - 残す: technology-15-41-u01「以降の全ユニットの土台」、technology-19-51-u02「残るタッチ動作」、technology-19-51-u04「補い」(学習者に通じる)。
- 範囲外: sections / glosses の制作メモは未走査。
