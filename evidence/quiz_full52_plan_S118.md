# ⑤-2 full52 全量掃引 — 母数と 8 波計画 (S118)

Locked by user §31 (`docs/discussion/2026-09-07-session-118.md:222`): 16 exam × 100 問から
**既に双 pass (gp+cr) 済の題を除外** → 8 波 × 2 exam、各波 gp/cr → machdiff → fidfix → 別 type reviewer → commit。
population/wave 定義は `evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json`
(生成器: `/private/tmp/.../scratchpad/build_population.mjs`、4 lane を deterministic に union)。

## ⚠ 母数の食い違い (要確認)

STATE.md / S118 §31 は除外を **241 + 40 + 80 = 361** と素算している。実際に union すると:

| 計算 | 値 | 差の理由 |
|---|---|---|
| 素算 (STATE.md/§31 記載) | 361 | A-scope 241 + pilot B-sample 40 + ⑤-3 80、重複を引いていない |
| dedup (A∩⑤-3 の重複除去、B-note 含めず) | **351** | 2015h27a/2018h30a/2020r02o/2026r08 の 4 exam で A と ⑤-3 が計 10 問重複 (源が同じ s7x 問を再抽出したため) |
| dedup + B-note (本ファイルの採用値) | **392** | S117 ①の note 起点掃引で **実際に gp+cr workflow が走った** 9 exam・41 問 (2019r01a3+2016h28h13+2018h30h9+2025r07 3+2015h27a 1+2016h28a 3+2018h30a 3+2019h31h 1+2017h29h 5) も「完了済み双 pass」であり、literal な除外基準 (「既に双 pass 済」) を満たす |

本ファイルは **392 除外 / 1208 母数** を採用 (B-note も除外する方が「再核験は無駄」という §31 の趣旨に忠実)。
361 のみで行きたい場合は `full52_population_S118.json` の `excluded[].reason` から `note_scan_B_double_pass` を除いて qnums を作り直せば良い (A-scope の `s7x_A_scope_double_pass` と ⑤-3 の `stage5_3_stratified_double_pass` の union は 351、そこに pilot B-sample を足すと 391 [2019r01a/2024r06 に重複なし] … と exam ごとに変わるので、**主 context に採否の最終確認を推奨**)。

## 1. exam ごとの母数

| exam | total | excluded | remaining | 除外の内訳 (lane: n) |
|---|---:|---:|---:|---|
| 2015h27a | 100 | 32 | 68 | A:14, B-note:1, ⑤-3:20 (A∩⑤-3 重複 3) |
| 2016h28a | 100 | 16 | 84 | A:13, B-note:3 |
| 2016h28h | 100 | 34 | 66 | A:21, B-note:13 |
| 2017h29a | 100 | 8 | 92 | A:8 |
| 2017h29h | 100 | 15 | 85 | A:10, B-note:6 (A∩B-note 重複 1) |
| 2018h30a | 100 | 33 | 67 | A:13, B-note:3, ⑤-3:20 (A∩⑤-3 重複 3) |
| 2018h30h | 100 | 30 | 70 | A:21, B-note:9 |
| 2019h31h | 100 | 13 | 87 | A:12, B-note:1 |
| 2019r01a | 100 | 48 | 52 | A:25, B-note:5 (A∩B-note 重複 2), B-sample:20 |
| 2020r02o | 100 | 40 | 60 | A:22, ⑤-3:20 (A∩⑤-3 重複 2) |
| 2021r03 | 100 | 12 | 88 | A:12 |
| 2022r04 | 100 | 25 | 75 | A:25 |
| 2023r05 | 100 | 9 | 91 | A:9 |
| 2024r06 | 100 | 28 | 72 | A:8, B-sample:20 |
| 2025r07 | 100 | 20 | 80 | A:17, B-note:3 |
| 2026r08 | 100 | 29 | 71 | A:11, ⑤-3:20 (A∩⑤-3 重複 2) |
| **合計** | 1600 | **392** | **1208** | |

出所 (lane ごと、`full52_population_S118.json` の `source_file` と同一):
- **A** (s7x A-scope): `data/ip/quiz/.phase2/s7x_fidelity_input_<exam>.json` (`scripts/quiz-s7x-fidelity-prep.mjs` で `question_bank.json` の `stem_resourced_s7x|choices_resourced_s7x` から決定的に再生成可)。16 exam 合計 241 (S117 §5a の実測と一致)。
- **B-note** (note 起点掃引、実際に gp+cr workflow が走った分のみ): `docs/discussion/2026-09-06-session-117.md` — 2019r01a: L209,221-222 / 2016h28h: L319 / 2018h30h: L381 / 2025r07: L382 / 2015h27a: L383 / 2016h28a: L444 / 2018h30a: L445 / 2019h31h: L446 / 2017h29h: L491。2022r04・2020r02o・2021r03・2017h29a・2023r05・2026r08 は notescan 候補はあったが **workflow 未実行** (既に是正済と目視確認のみ、L321,493) → 除外に含めていない。
- **pilot B-sample**: `data/ip/quiz/.phase2/sample_fidelity_input_2019r01a.json` / `..._2024r06.json` (2019r01a/2024r06 のみ)。
- **⑤-3 層化抽検**: `evidence/phase5/stage_06_quiz_fidelity/sample_S118_5-3.json` (2015h27a/2018h30a/2020r02o/2026r08 のみ、各 20 問)。

## 2. 波計画 (8 波 × 2 exam、exam_id 昇順)

| wave | exam 1 | exam 2 |
|---|---|---|
| 1 | 2015h27a | 2016h28a |
| 2 | 2016h28h | 2017h29a |
| 3 | 2017h29h | 2018h30a |
| 4 | 2018h30h | 2019h31h |
| 5 | 2019r01a | 2020r02o |
| 6 | 2021r03 | 2022r04 |
| 7 | 2023r05 | 2024r06 |
| 8 | 2025r07 | 2026r08 |

## 3. 各波の実行コマンド (主 context が波ごとに実行)

`qnums` は `full52_population_S118.json` の当該 exam `qnums` 配列 (remaining) をそのままカンマ区切りにする。例 (wave 1):

```
node scripts/quiz-fidelity-prep-any.mjs 2015h27a full52 "1,2,3,4,5,7,9,11,12,13,17,18,19,20,21,23,25,27,30,32,33,34,35,36,37,38,39,40,41,42,43,44,45,47,50,51,52,53,56,57,58,59,60,62,63,65,66,68,69,70,73,74,76,77,78,79,80,81,82,84,87,88,91,92,93,94,97,99"
node scripts/quiz-fidelity-prep-any.mjs 2016h28a full52 "1,2,3,4,5,6,7,8,10,11,12,14,15,16,17,18,19,20,21,22,23,26,27,28,29,30,31,33,34,35,36,37,38,39,40,42,43,44,45,46,47,48,49,50,51,52,53,55,56,57,59,61,62,63,65,66,67,68,69,70,71,72,76,77,78,79,80,83,84,85,86,87,88,89,90,91,92,94,95,96,97,98,99,100"
```

(残り 7 波も同じパターン、`full52_population_S118.json` の `qnums` から機械生成する。手打ちしない。)

各 exam の prep 後、Workflow `scripts/quiz-s7x-fidelity.workflow.mjs` を **gp と cr の 2 回**:

```
Workflow({
  script: "scripts/quiz-s7x-fidelity.workflow.mjs",
  params: {
    input_path: "data/ip/quiz/.phase2/full52_fidelity_input_<exam>.json",
    exam_id: "<exam>",
    qnums: [<remaining qnums 配列>],
    agent_type: "general-purpose"       // 1 回目
    // agent_type: "pr-review-toolkit:code-reviewer"  // 2 回目、別 subagent_type (Rule D)
  }
})
```

その後:

```
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/full52_fidelity_input_<exam>.json <gp_result.json>
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/full52_fidelity_input_<exam>.json <cr_result.json>
```

→ fidfix (三層 + zh/en + 解説 + D-143 final note、`NOTE_PRUNE`/`BOOL` 常設) → 別 type reviewer (Rule D) → commit。

**`quiz-fidelity-prep-any.mjs` の qnums 引数**: `spec.split(",").map(parseInt)` を `Set` にするだけ (`scripts/quiz-fidelity-prep-any.mjs:26`)。件数上限のコードは無い — 60〜92 件 (本計画の最大は 2017h29a の 92 件) を渡しても動く。存在しない qnum は warning のみで無視 (`⚠ N qnums not found`)、exit しない。

## 4. ⑤-4 scope-out backlog: 16 exam 外 (2009h21a〜2015h27h) の非 R8a/R8c 命中

`data/ip/quiz/.phase2/choice_defect_S118.json` (generated_at 2026-09-07T08:17:36Z) の `hits[]` を
`rule ∉ {R8a, R8c}` かつ `exam_id ∉ 16-exam` でフィルタ: **38 hits / 20 distinct 問 / 10 exam** (13 exam 中 3 [2009h21h, 2010h22a, 2013h25a] は 0)。R8a/R8c はこのファイルで決定的削除対象 (FP 0) なので対象外、R8b はこの表に残す (検索式実読が要る、FP 10%)。

| exam | 問数 | id:rule |
|---|---:|---|
| 2009h21a | 1 | q018:R2a/R3 |
| 2009h21h | 0 | — |
| 2010h22a | 0 | — |
| 2010h22h | 3 | q008:R3, q040:R3, q063:R3 |
| 2011h23a | 1 | q021:R8b |
| 2011h23tokubetsu | 3 | q029:R2b/R3, q052:R8b, q060:R8b |
| 2012h24a | 2 | q070:R3, q074:R6b |
| 2012h24h | 1 | q069:R8b |
| 2013h25a | 0 | — |
| 2013h25h | 1 | q069:R8b |
| 2014h26a | 1 | q052:R7d |
| 2014h26h | 4 | q003:R8b, q020:R8b, q057:R3, q071:R2b |
| 2015h27h | 3 | q042:R3, q074:R8b, q100:R3 |
| **合計** | **20** | |

これらは full52 掃引の射程外 (16 exam に含まれない) — 別途「実読 lane」として backlog 登録 (§31 (5) の指示どおり)。
