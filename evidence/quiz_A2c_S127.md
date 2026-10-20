# A2c — 段 2 抽検: ⑤-2 母数内の数字含有題 60 題の再源照合 (S127、D-150 §4 段 2)

- 母集団: ⑤-2 母数 (pop) のうち表示 jp に数字を含む題 212 題。標本 60 題 (exam 比例・最大剰余、seed 20261020、mulberry32 + Fisher-Yates)。生成 `scripts/quiz-a2c-sample-S127.mjs`、リスト `evidence/phase5/stage_06_quiz_fidelity/a2c_targets_S127.json` (⑤-2 判定 DISCREPANT 5 / CLEAN 55 を併記)。
- 実行: run `wf_ee2680a9-bdd` (Sonnet 5 gp 単 pass、多 exam、precrop 53/60)、**60/60、3,324,994 token / 2.0 分**、UNREADABLE 0。結果 `evidence/phase5/stage_06_quiz_fidelity/a2c_fidelity_multi_sn.json`。

## 結果
| 項目 | 値 |
|---|---|
| CLEAN / DISCREPANT | 57 / 3 |
| 差分 | 9 件、全 cosmetic |
| **数字の相違** | **0 / 60 題** |
| machdiff | same 298 / AGENT_MISSED 2 / VERDICT_CONFLICT 0 |

- DISCREPANT 3 題はいずれも **描画補助** (表示層が図の視覚要素を文字で補っている箇所): `2017h29a-q020` 表行頭「（網掛け）」×3 / `2019h31h-q082` 経路①②の箇条書き化 / `2021r03-q070` 矢印の向きの括弧書き (ア〜エ、正解肢ア含む)。いずれも源に無い注記だが、図を見ない学習者向けの補足で誤りではない → **是正しない** (U10 `q072 [ a ]` / U11 `q072 (主キー)` と同じ扱い)。
- machdiff MISSED 2 は既知型の偽陽性: `2015h27a-q009` (問文の配置差、波 1 の段落分割型) / `2019h31h-q082` (前文の配置差、U11 q074 型)。

## 判断
- 数字の欠陥 0/60 → rule of three で母集団 (212 題) の数字欠陥率の 95% 上限 ≈ 5%。⑤-2 で jp は源照合済であり、追加の全量源照合 (残り 152 題、≈ 840 万 token) の期待収量は小さい。
- **推奨: A2c 全量は実施しない**。数字の誤読は斜線ゼロ型 (⑨(2)) が主で、これは excluded / 13 exam 群 (B track の再抄写) 側に残る。
- 是正なし → データ変更なし。Rule D 対象の是正は無い (本 evidence と標本リストのみ)。
