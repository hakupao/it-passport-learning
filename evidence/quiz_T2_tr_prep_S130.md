# T2: 訳層照合 (段 3、方式 D) の入力準備 — ⑤-2 population 16 exam (S130)

D-150 §4 段 3 の照合対象として、⑤-2 (S118 波 1〜3 + U3a〜U11) で jp 層を源照合した population を準備した。この段階は 0 token で、data 層には書き込んでいない。

## 範囲

- 16 exam: 2015h27a / 2016h28a / 2016h28h / 2017h29a / 2017h29h / 2018h30a (wave1-3)、2018h30h (U3a)、2019h31h (U3b)、2019r01a (U4)、2020r02o (U5)、2021r03 (U6)、2022r04 (U7)、2023r05 (U8)、2024r06 (U9)、2025r07 (U10)、2026r08 (U11)
- 母数は `evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json` の population 1208 題 (1600 − excluded 392)
- 除外したもの
  - excluded 392 題: X track が是正中のため。T3 で扱う
  - A2b (S127) で照合済の 223 題 (`data/ip/quiz/.phase2/a2b_targets_S127.json`)
  - T1 と重なる題: 0 (T1 は別の 13 exam)
- **対象 985 題**。985 = 1208 − 223 で、機械照合で集合が一致することを確かめた
- 図ありの題は 56 (workflow は画像を使わない)

## BASE の選定

- 選んだ BASE は **`b74ec5e`**。⑤-2 で最初に jp を変えた data commit `ce3e31e` (S118 波 1〜3 核験 + 是正) の親にあたる
- 字義どおりに「U0 の直前」を取ると `17c0213` (S118 の最終 commit) になる。ただし U0 (S119) は脚本の改修 unit で、data commit がない。しかも波 1〜3 の jp 是正 `ce3e31e` は U0 より前にある。`17c0213` を BASE にすると、波 1〜3 の是正が jp_history から落ちる
- `b74ec5e` の data 層 (questions.json / translations) は、⑤-2 母数確定 commit `734697d` と同じ (`734697d..b74ec5e` に data commit はない)
- 前例との整合
  - A2b の対象抽出では、波 1〜3 の差分を `ce3e31e^` → `ce3e31e` で取っていた
  - U2 の Rule D でも、差分の起点を `ce3e31e^` としていた (`evidence/quiz_full52_ruleD_U2_S121.md`)

## jp_history

- 脚本は `scripts/quiz-tr-targets-S130.mjs t2`。T1 と同じ脚本に track 設定 (`TRACKS.t1` / `t2`) を加えた
- **t1 の回帰**: 書き換え後の脚本で t1 を作り直し、旧出力と照合した。jp_history / touched_by / unit / sources は 1298 題すべて一致し、差は 0 だった
- 抽出の仕方は T1 と同じ
  - BASE `b74ec5e` と HEAD `170e767` の jp 表示層を比べ、`normStr` 非等価な field だけを正味の差分として載せた
  - `touched_by` は BASE..HEAD の data commit を 1 本ずつ見て求めた
- 結果: **jp_history ありは 5 題 / 5 field**。BASE → HEAD で変わった題は自明な変更を含めて 226 題あるが、⑤-2 / A2a で jp を変えた題はすべて A2b の 223 題に入っていて、T2 から除かれている。残ったのは A2b より後の A4 / A5 の変更だけ

| id | field | touched_by |
|---|---|---|
| `2015h27a-q087` | stem | A4@5bac5f9 (中問前文の埋め込み) |
| `2015h27a-q091` | stem | A4@5bac5f9 |
| `2015h27a-q092` | stem | A4@5bac5f9 |
| `2015h27a-q094` | stem | A4@5bac5f9 |
| `2016h28h-q010` | stem | A5@3404902 |

## prep

```
node scripts/quiz-tr-targets-S130.mjs t2
node scripts/quiz-tr-prep-S127.mjs t2 data/ip/quiz/.phase2/t2_targets_S130.json --batch-size 5 --model sonnet --pass sn
```

- targets: `data/ip/quiz/.phase2/t2_targets_S130.json` (写しを `evidence/phase5/stage_06_quiz_fidelity/t2_targets_S130.json` に置いた)
- manifest: `data/ip/quiz/.phase2/t2_tr_input.json` (985 samples、jp_history あり 5)
- 小 manifest: `data/ip/quiz/.phase2/t2_tr_batches/` (batch_001〜batch_197。batch_size 5 なので **197 agent**)
- **workflow args: `data/ip/quiz/.phase2/t2_tr_workflow_args.json`**
  - model sonnet、pass sn
  - out_path `evidence/phase5/stage_06_quiz_fidelity/t2_tr_fidelity_sn.json`
  - parts_dir `data/ip/quiz/.phase2/trparts/t2_sn`
- exam_sets 形式 (`[[exam, [除外 qnum]], …]`、16 exam。除外 = population excluded ∪ A2b 照合済) を workflow と同じ規則で展開すると、args の `ids` 985 件と順序まで含めて完全に一致した。16 exam はいずれも q001〜q100 が揃っている
- 見込み: A2b の実績 11.8k/題 を当てはめると、985 題で約 11.6M token

## 確認 (sanity)

- 全 985 題を機械照合した。照合したのは次の 2 組で、不一致は **0**、訳の stem が空の題も 0 だった
  - manifest の jp と現行の出荷層 (stem は `stem_jp_clean` 優先で、無ければ `stem_jp`。choices は `choices_jp`)
  - zh / en と translations sidecar の stem / 各 choices
- jp_history の `new_jp` と manifest の jp も比べた。不一致は 0
- 作業ツリーには T1 fixer による未 commit の変更があるが、13 exam の translations / explanations だけで、T2 の 16 exam のファイルは HEAD と同一
- 3 題を抽出して目視し、jp / zh / en とも現行値と一致した: `2015h27a-q087` (A4 stem)、`2016h28h-q010` (A5 stem)、`2026r08-q002` (履歴なし、choices zh も一致)
- 集合の確認: T2 と T1、T2 と A2b、T2 と excluded の積はいずれも 0
