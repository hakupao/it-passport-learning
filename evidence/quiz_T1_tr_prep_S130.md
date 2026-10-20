# T1: 訳層照合 (段 3、方式 D) の入力準備 — B track 13 exam (S130)

D-150 §4 段 3。S128〜S129 の B track で jp 層を源照合した 13 exam について、jp 表示層 (= 正) と zh / en を照合するための入力を作った。この段階では 0 token で、data 層には書き込んでいない。

## 範囲

- exam (unit): 2015h27h (B1) / 2014h26h (B2) / 2014h26a (B3) / 2013h25h (B4) / 2013h25a (B5) / 2012h24h (B6) / 2012h24a (B7) / 2011h23tokubetsu (B8) / 2011h23a (B9) / 2010h22h (B10) / 2010h22a (B11) / 2009h21h (B12) / 2009h21a (B13)。計 1300 題
- 除外: A2b (S127) で照合済の **2 題** (`2012h24a-q042` [A2a jp 是正] / `2015h27h-q070` [⑤-2 jp 是正])。除外リストは `data/ip/quiz/.phase2/a2b_targets_S127.json` から取った
- **対象 1298 題** / 13 exam。図ありの題は 280 (workflow は画像を使わない)

## jp_history の作り方

- 脚本: `scripts/quiz-tr-targets-S130.mjs`。形は `quiz-a2b-targets-S127.mjs` の出力と同じ (schema `a2b_targets/1`)
- 比較した 2 点: BASE = `3aeec07` (B1 `6c1f38e` の親) と HEAD = `5556309`。比べたのは jp 表示層で、stem は `stem_jp_clean` を優先し、無ければ `stem_jp`。choices は `choices_jp`。いずれも `git show` で読んだ
- 載せる条件: field が `normStr` 非等価に変わったもの。旧 jp → 新 jp は**正味の差分**で、途中に入った A3 / A4 / A5 の jp 変更 (同じ 13 exam にかかるもの) も含む。空白や引用符の字種だけが変わった field は載せていない (自明な変更を含めると 278 題、計上は 201 題)
- 各 entry の内容:
  - `touched_by`: その field を normStr 非等価に変えた commit (`unit@commit`)。BASE..HEAD の data commit を 1 本ずつ親と比べて求めた。全 254 field で 1 本以上見つかった
  - `unit`: `touched_by` に出てくる unit (例 `B2` / `A4` / `A4+B6`)
  - 題単位の `unit`: その exam の B unit
- 内訳: B unit 単独 173 field、A3 / A4 / A5 単独 69 field (うち A4 [中問前文の埋め込み] 43 field)、複合 12 field (計 254)

| unit | 題 | jp 是正あり |
|---|---:|---:|
| B1 2015h27h | 99 | 17 |
| B2 2014h26h | 100 | 19 |
| B3 2014h26a | 100 | 13 |
| B4 2013h25h | 100 | 11 |
| B5 2013h25a | 100 | 19 |
| B6 2012h24h | 100 | 17 |
| B7 2012h24a | 99 | 18 |
| B8 2011h23tokubetsu | 100 | 17 |
| B9 2011h23a | 100 | 15 |
| B10 2010h22h | 100 | 15 |
| B11 2010h22a | 100 | 15 |
| B12 2009h21h | 100 | 11 |
| B13 2009h21a | 100 | 14 |
| **計** | **1298** | **201 (254 field)** |

## prep

```
node scripts/quiz-tr-targets-S130.mjs
node scripts/quiz-tr-prep-S127.mjs t1 data/ip/quiz/.phase2/t1_targets_S130.json --batch-size 5 --model sonnet --pass sn
```

- targets: `data/ip/quiz/.phase2/t1_targets_S130.json` (写しを `evidence/phase5/stage_06_quiz_fidelity/t1_targets_S130.json` に置いた)
- manifest: `data/ip/quiz/.phase2/t1_tr_input.json`。1298 samples、うち jp_history ありが 201
- 小 manifest: `data/ip/quiz/.phase2/t1_tr_batches/`。batch_001〜batch_260 で、batch_size 5 → **260 agent**
- **workflow args: `data/ip/quiz/.phase2/t1_tr_workflow_args.json`**
  - model sonnet、pass sn
  - out_path: `evidence/phase5/stage_06_quiz_fidelity/t1_tr_fidelity_sn.json`
  - parts_dir: `data/ip/quiz/.phase2/trparts/t1_sn`
- 見込み: A2b の実績 11.8k/題 から 1298 題で約 15.3M token。ただし jp_history に A4 の前文が入る題は、1 題あたりが重くなる

## 確認 (sanity)

- **全 1298 題を機械照合した**。manifest の jp を現行の出荷層と比べた (stem は `stem_jp_clean` を優先し無ければ `stem_jp`、choices は `choices_jp`)。zh / en は現行の translations sidecar の stem と各 choices と比べた。不一致は **0**。zh / en の stem が空の題も 0
- jp_history の `new_jp` と manifest の jp 該当 field を比べた。不一致は 0
- 抽出して目で見た 3 題では、jp / zh / en とも現行値と一致した: `2009h21a-q005` (B13: choice.ア / イ)、`2012h24a-q094` (A4: stem)、`2015h27h-q100` (A4: stem)
