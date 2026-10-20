# S130 解説内容監査 PILOT — 入力準備 (prep)

- 生成: `node scripts/quiz-expl-audit-prep-S130.mjs --n 100 --seed 130 --exclude-audited`
- 出力: `data/ip/quiz/.phase2/eaudit_pilot_input.json` (samples[] = quiz-phase2-ruleA-prep と同形 + exam_id / stem_source / figure_type / choice_figure_pngs)
- workflow args: `data/ip/quiz/.phase2/eaudit_pilot_workflow_args.json` = `{input_path, items:[{id, has_figure}]}` (100 items) → `scripts/quiz-phase2-ruleA.workflow.mjs`
- 決定性: seed **130**, PRNG mulberry32。同 seed で 2 回実行し input md5 一致 (`e529561bfac72bc45ced6ed0a19c8258`)。

## 母数

| 項目 | 値 |
|---|---|
| corpus (questions.json) | 2900 |
| 解説欠落 | 0 |
| 既監査 id (ruleA_result_*.json 25 本、audits[] + 本文中に現れる id の和集合) | 634 |
| 母数 population | **2266** (figure 162 / plain 2104) |
| 抽出 | **100** (figure **30** = 30.0% / plain 70)、29 exam 全てから ≥2 題 |

## 層化規則

- 層 = exam × has_figure。figure 枠 = round(100×0.3) = 30、plain 枠 = 70。
- 各枠を「その層に候補が残る exam」へ均等配分、余りは seeded shuffle で選んだ exam へ +1、層の不足分は他 exam に再配分。層内は id 昇順 → seeded shuffle → 先頭 k 題。
- figure 層は 12 exam にしか候補が無い (既往 Rule A が多くの exam で全 figure を監査済のため。17 exam は figure 母数 0)。plain は 29 exam 全て。

## 表示層の確認

- stem_jp = `translations/<exam>.json` の `stem_jp_clean` (非空時) else `questions.json` stem_jp — `apps/web/src/lib/quiz/quizModel.ts:120` と同規則。100 題中 68 題が stem_jp_clean。
- choices_jp = `questions.json` choices_jp (選択肢に clean 上書き層は無い = 表示層そのもの)。
- 中問: 抽出 100 題中 14 題が `chumon_groups.json` のメンバー、14/14 で表示 stem に組の前文 probe(jp) を含む (前文は stem_jp_clean 側に統合済)。
- 図: figure_page_png = `source.figure_page_image ?? page_image` (D-145)、跨ページ 8 題は question_page_png も併記。全参照 PNG の実在を確認 (欠落 0)。選択肢図 (choice_figures) を持つ題は今回の抽出に 0 (該当 10 題はいずれも既監査 or 非抽出)。抽出と既監査 id の重複 0、重複 id 0。

## 注意 (既監査集合の不完全さ)

S102 の 3 本 (`ruleA_result_S102_2023r05/2024r06/2026r08.json`) は audits[] を持たない要約形式で、本文の id は low_issues 等の 20 個だけ。note によれば S102 は各 exam の **全 figure** + suspect + plain 9 題 (各 24 題) を監査済。したがって今回 figure 抽出のうち次の 8 題は S102 で監査済の可能性が高い (当時から本文が変わった題もありうるので再監査自体は無害): 2023r05-q041 / q048 / q063, 2024r06-q046 / q085, 2026r08-q050 / q057 / q074。「未監査のみ」を厳密にしたい場合は 3 exam の figure 層を除外して再生成すること (script は指示どおりの 634 id 定義のまま)。

## Strata (exam × has_figure)

| exam | pop fig | pop plain | sampled fig | sampled plain |
|---|---|---|---|---|
| 2009h21a | 21 | 79 | 2 | 2 |
| 2009h21h | 22 | 78 | 2 | 3 |
| 2010h22a | 29 | 71 | 3 | 3 |
| 2010h22h | 28 | 72 | 2 | 3 |
| 2011h23a | 0 | 67 | 0 | 3 |
| 2011h23tokubetsu | 23 | 77 | 4 | 2 |
| 2012h24a | 1 | 65 | 1 | 2 |
| 2012h24h | 0 | 67 | 0 | 2 |
| 2013h25a | 1 | 71 | 1 | 2 |
| 2013h25h | 3 | 64 | 3 | 3 |
| 2014h26a | 0 | 63 | 0 | 3 |
| 2014h26h | 0 | 72 | 0 | 3 |
| 2015h27a | 2 | 66 | 2 | 2 |
| 2015h27h | 2 | 62 | 2 | 2 |
| 2016h28a | 0 | 72 | 0 | 2 |
| 2016h28h | 0 | 72 | 0 | 2 |
| 2017h29a | 0 | 72 | 0 | 2 |
| 2017h29h | 0 | 72 | 0 | 3 |
| 2018h30a | 0 | 76 | 0 | 3 |
| 2018h30h | 0 | 72 | 0 | 3 |
| 2019h31h | 0 | 72 | 0 | 2 |
| 2019r01a | 0 | 75 | 0 | 2 |
| 2020r02o | 0 | 76 | 0 | 3 |
| 2021r03 | 0 | 75 | 0 | 2 |
| 2022r04 | 0 | 74 | 0 | 2 |
| 2023r05 | 10 | 82 | 3 | 2 |
| 2024r06 | 9 | 85 | 2 | 3 |
| 2025r07 | 0 | 72 | 0 | 2 |
| 2026r08 | 11 | 83 | 3 | 2 |

## Sample list (N=100)

| id | fig | figure_type | stem source | key |
|---|---|---|---|---|
| 2009h21a-q037 |  |  | questions.stem_jp | ウ |
| 2009h21a-q044 | Y | flowchart | stem_jp_clean | ア |
| 2009h21a-q077 |  |  | stem_jp_clean | イ |
| 2009h21a-q097 | Y |  | stem_jp_clean | ウ |
| 2009h21h-q007 | Y | table | stem_jp_clean | イ |
| 2009h21h-q041 |  |  | questions.stem_jp | ア |
| 2009h21h-q043 |  |  | stem_jp_clean | ウ |
| 2009h21h-q049 |  |  | questions.stem_jp | ウ |
| 2009h21h-q072 | Y | diagram | stem_jp_clean | イ |
| 2010h22a-q006 |  |  | questions.stem_jp | ア |
| 2010h22a-q040 |  |  | stem_jp_clean | ウ |
| 2010h22a-q054 |  |  | questions.stem_jp | ウ |
| 2010h22a-q068 | Y | table | stem_jp_clean | エ |
| 2010h22a-q077 | Y | table | stem_jp_clean | イ |
| 2010h22a-q092 | Y | table | stem_jp_clean | イ |
| 2010h22h-q009 |  |  | stem_jp_clean | イ |
| 2010h22h-q037 |  |  | stem_jp_clean | ア |
| 2010h22h-q054 |  |  | questions.stem_jp | ウ |
| 2010h22h-q082 | Y | diagram | stem_jp_clean | ア |
| 2010h22h-q094 | Y | diagram | stem_jp_clean | ア |
| 2011h23a-q023 |  |  | questions.stem_jp | ア |
| 2011h23a-q039 |  |  | questions.stem_jp | ウ |
| 2011h23a-q076 |  |  | questions.stem_jp | ウ |
| 2011h23tokubetsu-q005 |  |  | stem_jp_clean | ウ |
| 2011h23tokubetsu-q018 | Y | chart | stem_jp_clean | イ |
| 2011h23tokubetsu-q049 |  |  | stem_jp_clean | ア |
| 2011h23tokubetsu-q078 | Y | table | stem_jp_clean | エ |
| 2011h23tokubetsu-q093 | Y | flowchart | stem_jp_clean | ア |
| 2011h23tokubetsu-q095 | Y | table | stem_jp_clean | イ |
| 2012h24a-q019 |  |  | stem_jp_clean | エ |
| 2012h24a-q043 |  |  | questions.stem_jp | エ |
| 2012h24a-q088 | Y | shared | stem_jp_clean | ウ |
| 2012h24h-q013 |  |  | stem_jp_clean | イ |
| 2012h24h-q082 |  |  | questions.stem_jp | ア |
| 2013h25a-q041 |  |  | stem_jp_clean | ウ |
| 2013h25a-q054 |  |  | stem_jp_clean | イ |
| 2013h25a-q096 | Y | shared | stem_jp_clean | ウ |
| 2013h25h-q003 |  |  | questions.stem_jp | イ |
| 2013h25h-q058 |  |  | questions.stem_jp | エ |
| 2013h25h-q073 |  |  | stem_jp_clean | ア |
| 2013h25h-q094 | Y | shared | stem_jp_clean | ウ |
| 2013h25h-q098 | Y | shared | stem_jp_clean | エ |
| 2013h25h-q100 | Y | shared | stem_jp_clean | ア |
| 2014h26a-q014 |  |  | stem_jp_clean | ア |
| 2014h26a-q025 |  |  | stem_jp_clean | エ |
| 2014h26a-q073 |  |  | stem_jp_clean | ウ |
| 2014h26h-q005 |  |  | questions.stem_jp | エ |
| 2014h26h-q053 |  |  | questions.stem_jp | エ |
| 2014h26h-q078 |  |  | stem_jp_clean | エ |
| 2015h27a-q006 |  |  | questions.stem_jp | ウ |
| 2015h27a-q063 |  |  | questions.stem_jp | イ |
| 2015h27a-q090 | Y | shared | stem_jp_clean | イ |
| 2015h27a-q096 | Y | shared | stem_jp_clean | イ |
| 2015h27h-q055 |  |  | stem_jp_clean | イ |
| 2015h27h-q060 |  |  | questions.stem_jp | エ |
| 2015h27h-q093 | Y | shared | stem_jp_clean | ウ |
| 2015h27h-q097 | Y | shared | stem_jp_clean | イ |
| 2016h28a-q090 |  |  | questions.stem_jp | ウ |
| 2016h28a-q098 |  |  | stem_jp_clean | イ |
| 2016h28h-q031 |  |  | stem_jp_clean | ア |
| 2016h28h-q072 |  |  | stem_jp_clean | エ |
| 2017h29a-q063 |  |  | questions.stem_jp | ウ |
| 2017h29a-q076 |  |  | questions.stem_jp | エ |
| 2017h29h-q006 |  |  | stem_jp_clean | エ |
| 2017h29h-q030 |  |  | stem_jp_clean | イ |
| 2017h29h-q096 |  |  | questions.stem_jp | ウ |
| 2018h30a-q026 |  |  | stem_jp_clean | ウ |
| 2018h30a-q068 |  |  | stem_jp_clean | イ |
| 2018h30a-q078 |  |  | stem_jp_clean | ウ |
| 2018h30h-q026 |  |  | stem_jp_clean | ア |
| 2018h30h-q080 |  |  | stem_jp_clean | ウ |
| 2018h30h-q090 |  |  | questions.stem_jp | エ |
| 2019h31h-q006 |  |  | questions.stem_jp | ウ |
| 2019h31h-q033 |  |  | stem_jp_clean | イ |
| 2019r01a-q054 |  |  | stem_jp_clean | エ |
| 2019r01a-q098 |  |  | questions.stem_jp | イ |
| 2020r02o-q052 |  |  | stem_jp_clean | ウ |
| 2020r02o-q057 |  |  | stem_jp_clean | イ |
| 2020r02o-q094 |  |  | stem_jp_clean | イ |
| 2021r03-q011 |  |  | questions.stem_jp | エ |
| 2021r03-q084 |  |  | stem_jp_clean | エ |
| 2022r04-q033 |  |  | stem_jp_clean | ア |
| 2022r04-q054 |  |  | stem_jp_clean | ウ |
| 2023r05-q014 |  |  | stem_jp_clean | ア |
| 2023r05-q041 | Y | diagram | stem_jp_clean | ウ |
| 2023r05-q048 | Y | table | stem_jp_clean | エ |
| 2023r05-q063 | Y | table | stem_jp_clean | イ |
| 2023r05-q070 |  |  | questions.stem_jp | ア |
| 2024r06-q030 |  |  | questions.stem_jp | エ |
| 2024r06-q046 | Y | table | stem_jp_clean | エ |
| 2024r06-q063 |  |  | questions.stem_jp | ア |
| 2024r06-q064 |  |  | stem_jp_clean | イ |
| 2024r06-q085 | Y | code | stem_jp_clean | エ |
| 2025r07-q075 |  |  | stem_jp_clean | ウ |
| 2025r07-q093 |  |  | questions.stem_jp | ウ |
| 2026r08-q010 |  |  | questions.stem_jp | エ |
| 2026r08-q040 |  |  | questions.stem_jp | ア |
| 2026r08-q050 | Y | table | stem_jp_clean | ウ |
| 2026r08-q057 | Y | table | stem_jp_clean | ウ |
| 2026r08-q074 | Y | table | stem_jp_clean | ア |

## 追記: CALIBRATION 入力 ecal (batched workflow 用)

- workflow: `scripts/quiz-expl-audit.workflow.mjs` (AUDIT_SCHEMA・核験観点・agentType `pr-review-toolkit:code-reviewer` は quiz-phase2-ruleA と同じ。batch_size 題を 1 agent が担当し、題ごとの part file を `parts_dir/<id>.json` に書く。BATCH_SCHEMA = `{audits:[AUDIT…]}`。入力は ids / items / exam_sets のどれでもよい。has_figure=true の題では figure_png・figure_page_png に加え、あれば choice_figure_pngs・question_page_png も Read させる)
- 生成: `node scripts/quiz-expl-audit-prep-S130.mjs --ids-from data/ip/quiz/.phase2/eaudit_pilot_workflow_args.json --batch-size 5 --out-prefix ecal --label ecal --model sonnet`
- 出力: `data/ip/quiz/.phase2/ecal_input.json`、`data/ip/quiz/.phase2/ecal_batches/batch_001..020.json` (5 題ずつ、ids 順)、args `data/ip/quiz/.phase2/ecal_workflow_args.json`
- ids = pilot の 100 題と同一、順序も同じ (`ruleA_result_S130_eaudit_pilot.json` の audits の id 集合とも一致)。batch を連結した id 列も args.ids と一致。
- 検証: stub の agent/parallel/log で workflow 本体を実行した → 20 agent・100/100 題・missing 0。prompt 内の batch パスと id 列が一致していることも確認。
- 経過: 2 回目の作業で prep script を拡張したあと、確認のため pilot を再生成した。その時点では `ruleA_result_S130_eaudit_pilot.json` が既に保存されていたため、既監査は 734 id になっていた。その結果、抽出結果が変わった版で `eaudit_pilot_input.json` / `eaudit_pilot_workflow_args.json` を一度上書きしてしまった。直後に、pilot 結果の 100 id を `--ids-from` で与えて同じ 2 本を作り直した (ids 一致を確認済)。ただし中身 (解説・表示層) は再生成時点のデータで、pilot 実行時点とは異なる可能性がある。

## 追記: TARGETED 入力 etgt (figure 全数 + 計算・論理・手順系)

- 生成: `node scripts/quiz-expl-audit-prep-S130.mjs --targeted --exclude-audited --exclude-s102-figures --n 200 --seed 130 --out-prefix etgt` (2 回実行して args の md5 が一致: `d3ed1f776492665b7881b12362494aee`)
- 出力: `data/ip/quiz/.phase2/etgt_input.json` (pilot と同形式 + 選定理由 `target_reason`)、args `data/ip/quiz/.phase2/etgt_workflow_args.json` = `{input_path, items[200]}` → `scripts/quiz-phase2-ruleA.workflow.mjs` (1 題 1 agent、opus)
- 既監査の除外: `ruleA_result_*.json` 27 本 (S130 の eaudit_pilot / ecal_sonnet を含む) に出てくる id の和集合 = 734 個を除いた。
- S102 の除外: 先に挙げた 8 題は pilot に含まれているので、上の 734 個で既に除外済み。さらに `--exclude-s102-figures` で、2023r05 / 2024r06 / 2026r08 の has_figure 問を全て除いた。S102 の note は「全 figure を監査済」としており、現在の figure 数 (14 / 14 / 13) は S102 の記録と一致する。この追加除外は 22 題。
- 母数 2144 (figure 110)。

| 層 | 母数 / 候補 | 採用 |
|---|---|---|
| (1) figure (未監査の全数、上限 200 は超えず cap 不要) | 110 | **110** (選択肢図問 3 題: 2009h21a-q048 / 2010h22a-q066 / 2010h22h-q088 を含む。図と設問が別ページの題 8) |
| (2) non-figure でキーワードに 1 つ以上ヒット | 113 | **90** |
| 計 | | **200** (28 exam。2017h29a は (2) の候補が 0) |

- キーワード (表示 stem に対する部分一致): 求め / 幾つ / いくら / 幾ら / 何% / 何％ / 何円 / 何時間 / 何日 / 何件 / 何個 / 何ビット / 何バイト / 流れ図 / 擬似言語 / 関数 / 式 / セル / 表計算 / 論理式 / 真理値 / 処理手順 / アルゴリズム / 期待値 / 損益 / 利益 / 原価 / 稼働率 / MTBF。
  - 指示に対して追加したもの: 「幾ら」(いくら の漢字表記) と全角の「何％」。
  - 「式」は 方式 / 形式 / 株式 / 様式 / 正式 / 儀式 / 図式 / 書式 / 旧式 / 新式 / 一式 / 式典 を数えない。「セル」は キャンセル / セルフ / セールス を数えない。
- 並べ順: 異なり語数の降順 → 出現回数の降順 → seed 130 の shuffle 順。採用した 90 題の異なり語数の内訳は 1 語: 64 / 2 語: 14 / 3 語: 7 / 4 語: 1 / 5 語: 3 / 6 語: 1。
- 注意: 1 語だけのヒットには定義問も混ざる (例: 「損益計算書を説明したもの」)。部分一致の限界である。
- 確認: 既監査との重複 0。参照する PNG は全て実在。

| id | fig | target_reason |
|---|---|---|
| 2009h21a-q007 |  | keywords:幾ら |
| 2009h21a-q012 | Y | figure |
| 2009h21a-q013 | Y | figure |
| 2009h21a-q017 | Y | figure |
| 2009h21a-q036 | Y | figure |
| 2009h21a-q039 | Y | figure |
| 2009h21a-q048 | Y | figure |
| 2009h21a-q054 | Y | figure |
| 2009h21a-q060 | Y | figure |
| 2009h21a-q062 | Y | figure |
| 2009h21a-q069 | Y | figure |
| 2009h21a-q070 |  | keywords:幾ら|期待値 |
| 2009h21a-q089 | Y | figure |
| 2009h21a-q090 | Y | figure |
| 2009h21a-q091 | Y | figure |
| 2009h21a-q092 | Y | figure |
| 2009h21a-q093 | Y | figure |
| 2009h21a-q094 | Y | figure |
| 2009h21a-q095 |  | keywords:求め|式|セル|表計算|利益|原価 |
| 2009h21a-q096 |  | keywords:式|セル|表計算|利益|原価 |
| 2009h21a-q098 | Y | figure |
| 2009h21a-q099 | Y | figure |
| 2009h21a-q100 | Y | figure |
| 2009h21h-q014 |  | keywords:何個|利益 |
| 2009h21h-q016 |  | keywords:損益 |
| 2009h21h-q021 | Y | figure |
| 2009h21h-q027 | Y | figure |
| 2009h21h-q037 | Y | figure |
| 2009h21h-q048 | Y | figure |
| 2009h21h-q057 | Y | figure |
| 2009h21h-q061 | Y | figure |
| 2009h21h-q062 | Y | figure |
| 2009h21h-q066 | Y | figure |
| 2009h21h-q070 |  | keywords:幾ら|稼働率 |
| 2009h21h-q071 | Y | figure |
| 2009h21h-q080 | Y | figure |
| 2009h21h-q082 | Y | figure |
| 2009h21h-q087 | Y | figure |
| 2009h21h-q089 | Y | figure |
| 2009h21h-q090 | Y | figure |
| 2009h21h-q091 | Y | figure |
| 2009h21h-q092 | Y | figure |
| 2009h21h-q095 | Y | figure |
| 2009h21h-q096 | Y | figure |
| 2009h21h-q097 | Y | figure |
| 2009h21h-q098 | Y | figure |
| 2009h21h-q099 |  | keywords:何時間 |
| 2009h21h-q100 |  | keywords:何時間 |
| 2010h22a-q008 | Y | figure |
| 2010h22a-q018 | Y | figure |
| 2010h22a-q019 | Y | figure |
| 2010h22a-q023 | Y | figure |
| 2010h22a-q026 |  | keywords:原価 |
| 2010h22a-q031 | Y | figure |
| 2010h22a-q045 | Y | figure |
| 2010h22a-q046 | Y | figure |
| 2010h22a-q048 | Y | figure |
| 2010h22a-q061 | Y | figure |
| 2010h22a-q064 | Y | figure |
| 2010h22a-q065 | Y | figure |
| 2010h22a-q066 | Y | figure |
| 2010h22a-q069 |  | keywords:幾ら |
| 2010h22a-q072 | Y | figure |
| 2010h22a-q079 | Y | figure |
| 2010h22a-q080 | Y | figure |
| 2010h22a-q084 | Y | figure |
| 2010h22a-q085 | Y | figure |
| 2010h22a-q086 | Y | figure |
| 2010h22a-q087 | Y | figure |
| 2010h22a-q089 | Y | figure |
| 2010h22a-q090 | Y | figure |
| 2010h22a-q091 | Y | figure |
| 2010h22a-q093 | Y | figure |
| 2010h22a-q094 | Y | figure |
| 2010h22a-q095 | Y | figure |
| 2010h22a-q097 | Y | figure |
| 2010h22a-q099 |  | keywords:求め|何時間 |
| 2010h22a-q100 |  | keywords:求め |
| 2010h22h-q002 | Y | figure |
| 2010h22h-q004 | Y | figure |
| 2010h22h-q005 | Y | figure |
| 2010h22h-q006 |  | keywords:求め|式|損益 |
| 2010h22h-q011 | Y | figure |
| 2010h22h-q021 | Y | figure |
| 2010h22h-q026 | Y | figure |
| 2010h22h-q028 |  | keywords:利益 |
| 2010h22h-q035 | Y | figure |
| 2010h22h-q040 |  | keywords:表計算 |
| 2010h22h-q050 | Y | figure |
| 2010h22h-q051 |  | keywords:表計算 |
| 2010h22h-q055 | Y | figure |
| 2010h22h-q057 | Y | figure |
| 2010h22h-q061 | Y | figure |
| 2010h22h-q067 | Y | figure |
| 2010h22h-q070 | Y | figure |
| 2010h22h-q073 |  | keywords:セル |
| 2010h22h-q075 | Y | figure |
| 2010h22h-q076 | Y | figure |
| 2010h22h-q077 | Y | figure |
| 2010h22h-q079 | Y | figure |
| 2010h22h-q085 | Y | figure |
| 2010h22h-q088 | Y | figure |
| 2010h22h-q089 | Y | figure |
| 2010h22h-q090 | Y | figure |
| 2010h22h-q091 | Y | figure |
| 2010h22h-q092 | Y | figure |
| 2010h22h-q095 | Y | figure |
| 2010h22h-q097 | Y | figure |
| 2010h22h-q100 | Y | figure |
| 2011h23a-q006 |  | keywords:何円|利益 |
| 2011h23a-q009 |  | keywords:損益|利益 |
| 2011h23tokubetsu-q004 | Y | figure |
| 2011h23tokubetsu-q010 | Y | figure |
| 2011h23tokubetsu-q015 | Y | figure |
| 2011h23tokubetsu-q019 |  | keywords:利益 |
| 2011h23tokubetsu-q026 | Y | figure |
| 2011h23tokubetsu-q048 | Y | figure |
| 2011h23tokubetsu-q056 | Y | figure |
| 2011h23tokubetsu-q059 | Y | figure |
| 2011h23tokubetsu-q062 | Y | figure |
| 2011h23tokubetsu-q069 | Y | figure |
| 2011h23tokubetsu-q070 | Y | figure |
| 2011h23tokubetsu-q071 |  | keywords:稼働率|MTBF |
| 2011h23tokubetsu-q072 | Y | figure |
| 2011h23tokubetsu-q073 | Y | figure |
| 2011h23tokubetsu-q083 | Y | figure |
| 2011h23tokubetsu-q090 | Y | figure |
| 2011h23tokubetsu-q094 | Y | figure |
| 2011h23tokubetsu-q096 |  | keywords:何円|関数 |
| 2011h23tokubetsu-q097 | Y | figure |
| 2011h23tokubetsu-q098 | Y | figure |
| 2011h23tokubetsu-q099 | Y | figure |
| 2011h23tokubetsu-q100 | Y | figure |
| 2012h24a-q042 |  | keywords:幾つ |
| 2012h24a-q079 |  | keywords:幾ら |
| 2012h24a-q100 |  | keywords:求め |
| 2012h24h-q025 |  | keywords:式|利益 |
| 2012h24h-q069 |  | keywords:式|論理式 |
| 2012h24h-q070 |  | keywords:幾ら|稼働率|MTBF |
| 2013h25a-q006 |  | keywords:求め|式|利益 |
| 2013h25a-q089 |  | keywords:損益 |
| 2013h25h-q009 |  | keywords:何個|損益 |
| 2013h25h-q053 |  | keywords:アルゴリズム |
| 2013h25h-q076 |  | keywords:何個 |
| 2014h26a-q007 |  | keywords:利益 |
| 2014h26a-q070 |  | keywords:幾つ |
| 2014h26h-q019 |  | keywords:利益 |
| 2014h26h-q044 |  | keywords:流れ図 |
| 2014h26h-q069 |  | keywords:何時間|MTBF |
| 2014h26h-q096 |  | keywords:求め |
| 2015h27a-q015 |  | keywords:何個 |
| 2015h27h-q054 |  | keywords:求め |
| 2015h27h-q059 |  | keywords:処理手順 |
| 2015h27h-q095 |  | keywords:セル|表計算|損益|利益 |
| 2015h27h-q096 |  | keywords:幾ら|セル|表計算|損益|利益 |
| 2016h28a-q009 |  | keywords:何個|利益 |
| 2016h28a-q017 |  | keywords:式 |
| 2016h28a-q034 |  | keywords:利益 |
| 2016h28a-q047 |  | keywords:稼働率 |
| 2016h28a-q061 |  | keywords:式 |
| 2016h28h-q019 |  | keywords:利益 |
| 2016h28h-q032 |  | keywords:幾つ |
| 2016h28h-q040 |  | keywords:求め |
| 2017h29h-q009 |  | keywords:求め |
| 2017h29h-q050 |  | keywords:幾つ |
| 2017h29h-q062 |  | keywords:式 |
| 2018h30a-q016 |  | keywords:求め|何日|式|利益|原価 |
| 2018h30h-q015 |  | keywords:何個 |
| 2018h30h-q033 |  | keywords:求め |
| 2018h30h-q045 |  | keywords:求め |
| 2018h30h-q075 |  | keywords:幾つ |
| 2019h31h-q013 |  | keywords:利益 |
| 2019h31h-q025 |  | keywords:求め|何%|利益 |
| 2019h31h-q043 |  | keywords:求め |
| 2019r01a-q089 |  | keywords:表計算 |
| 2020r02o-q002 |  | keywords:求め |
| 2020r02o-q034 |  | keywords:求め|式|利益 |
| 2020r02o-q097 |  | keywords:何個 |
| 2021r03-q007 |  | keywords:アルゴリズム |
| 2021r03-q009 |  | keywords:利益 |
| 2021r03-q029 |  | keywords:求め|式|利益 |
| 2022r04-q008 |  | keywords:求め |
| 2022r04-q030 |  | keywords:求め|式|利益 |
| 2022r04-q037 |  | keywords:幾つ |
| 2023r05-q022 |  | keywords:式 |
| 2023r05-q045 |  | keywords:求め |
| 2023r05-q054 |  | keywords:幾つ |
| 2024r06-q014 |  | keywords:式 |
| 2024r06-q020 |  | keywords:利益 |
| 2024r06-q038 |  | keywords:何時間|稼働率 |
| 2024r06-q058 |  | keywords:表計算 |
| 2024r06-q069 |  | keywords:何バイト |
| 2024r06-q078 |  | keywords:処理手順 |
| 2024r06-q083 |  | keywords:幾ら |
| 2025r07-q005 |  | keywords:原価 |
| 2025r07-q094 |  | keywords:稼働率 |
| 2026r08-q012 |  | keywords:流れ図 |
| 2026r08-q067 |  | keywords:求め |
| 2026r08-q079 |  | keywords:求め |
| 2026r08-q091 |  | keywords:関数 |
