# T3: 訳層照合 (段 3、方式 D) の入力準備 — ⑤-2 excluded 392 題 (S130)

D-150 §4 段 3。対象は ⑤-2 の excluded 392 題で、S130 の X track (X1〜X4) が jp 層を源照合した。この段階は 0 token で、data 層には書き込んでいない。
**本 manifest は確認 (review) 用の版である。** T2 fixer による D-171 (zh/en の略語注の除去) が commit された後、launch の直前に作り直す (§再生成)。

## 範囲

- 対象は `evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json` の `exams[].excluded` で、16 exam・**392 題**。集合が excluded と完全に一致することを機械照合で確かめた
- T1 / T2 との積はいずれも 0
- A2b (S127) と重なるのは **`2015h27a-q089` の 1 題** (A2a で jp を是正し、A2b で照合済)。X1 で jp を源と照らし直したので、T3 に**含めた**。T1 / T2 では A2b 照合済を除いたが、T3 はこの点で扱いが異なる。除く場合は exam_sets の 2015h27a の除外 qnum に 89 を足す
- 図ありの題は 141 (workflow は画像を使わない)

| unit | commit | exam |
|---|---|---|
| X1 | a34c77a | 2015h27a 32 / 2016h28a 16 / 2016h28h 34 / 2017h29a 8 / 2017h29h 15 |
| X2 | 4630c9a | 2018h30a 33 / 2018h30h 30 / 2019h31h 13 / 2021r03 12 / 2023r05 9 |
| X3 | 402fb1d | 2019r01a 48 / 2020r02o 40 |
| X4 | dd49f9e | 2022r04 25 / 2024r06 28 / 2025r07 20 / 2026r08 29 |

## jp_history

- 脚本は `scripts/quiz-tr-targets-S130.mjs t3` で、`TRACKS.t3` を追加した。commit の unit を取る正規表現に `X\d+` と `T\d+` を加えた
- 加えた後に t1 / t2 を scratch に作り直し、既存の出力と比べた。jp_history / touched_by / unit / sources の差は 0
- 比較の起点と終点は BASE `eac8943` (= `a34c77a^`、T1 の data commit) と HEAD `dd49f9e`。normStr 非等価な field を正味の差分として取った。touched_by は commit を 1 本ずつ親と比べて求めた
- 結果は **jp_history あり 16 題 / 29 field**。自明な変更 (normStr で等しくなる引用符・読点・空白) まで含めると 59 題になる。X の commit メッセージにある「計上」には cosmetic も入っているので、ここの数より多い
  - X1: 8 題 / X2: 4 題 / X3: 1 題 / X4: 3 題
  - 主なもの: `2023r05-q059` ア〜エ (選択肢の偽列「会員 |」の除去)、`2022r04-q059` イ〜エ (表の見出し行)、`2023r05-q075` ア〜エ (`>=` → `≧`)、`2023r05-q086` ア〜エ (「共通鍵」→「共通」ほか)、`2015h27a-q090` イ〜エ (負号 → ASCII `-`)

## prep

```
node scripts/quiz-tr-targets-S130.mjs t3
node scripts/quiz-tr-prep-S127.mjs t3 data/ip/quiz/.phase2/t3_targets_S130.json --batch-size 5 --model sonnet --pass sn
```

- targets: `data/ip/quiz/.phase2/t3_targets_S130.json`。写しを `evidence/phase5/stage_06_quiz_fidelity/t3_targets_S130.json` に置いた
- manifest: `data/ip/quiz/.phase2/t3_tr_input.json`。392 samples で、jp_history ありは 16
- 小 manifest: `data/ip/quiz/.phase2/t3_tr_batches/`。batch_001〜batch_079 の **79 agent** (最後の 1 本は 2 題)
- **workflow args: `data/ip/quiz/.phase2/t3_tr_workflow_args.json`**
  - sonnet / sn
  - out_path: `evidence/phase5/stage_06_quiz_fidelity/t3_tr_fidelity_sn.json`
  - parts_dir: `data/ip/quiz/.phase2/trparts/t3_sn`
- exam_sets 形式 (除外 qnum = population 側) を workflow と同じ規則で展開した。結果は args の `ids` 392 件と、順序も含めて完全に一致する
- 見込みは 11.8k/題 × 392 ≈ 4.6M token

## 確認 (sanity)

- 全 392 題を、作業ツリーの現行ファイルと機械照合した。不一致は **0**。照合内容は次のとおり
  - manifest の jp を、出荷層の jp と比べた (stem は `stem_jp_clean` 優先で無ければ `stem_jp`、choices は `choices_jp`)
  - zh / en を、translations sidecar の stem / 各 choices と比べた
  - jp_history の `new_jp` を、manifest の jp と比べた
- 3 題 (`2023r05-q059`、`2022r04-q059`、`2020r02o-q003`) は jp / zh / en の stem と全 choices を個別に確かめ、一致した
- **注意**: 作業ツリーでは、translations の 27 exam に未 commit の変更がある (D-171 を適用中とみられる)。manifest の zh / en は作業ツリーから読むので、それを反映している。HEAD の sidecar と比べると **45 field / 25 題** が異なる (例 `2020r02o-q027` zh/en ア〜エ、`2026r08-q014`、`2017h29h-q003`)

## 再生成 (launch 前)

T2 fixer の commit が済んだら、次の 2 行を再実行する (どちらも冪等)。

```
node scripts/quiz-tr-targets-S130.mjs t3
node scripts/quiz-tr-prep-S127.mjs t3 data/ip/quiz/.phase2/t3_targets_S130.json --batch-size 5 --model sonnet --pass sn
```

- 再実行後に、本書の sanity を 3 点やり直す
  - 作業ツリーとの照合で不一致が 0 であること
  - 作業ツリーがクリーンで、HEAD と照合して 0 であること
  - exam_sets の展開が ids と一致すること
- exam_sets は id 集合だけで決まるので、D-171 では変わらない
