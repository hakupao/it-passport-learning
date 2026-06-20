# Quiz Phase 1.5 (stem 源再構成) — Batch S98-B1 audit

> Session 98 (2026-06-20) / D-138. 路由词「Phase 1.5 全量」= 全 29 回 scale の第 1 バッチ。
> 範囲: 9 回 (2026r08 / 2025r07[nonfig のみ] / 2024r06 / 2023r05 / 2022r04 / 2021r03 / 2020r02o / 2019r01a / 2019h31h)。
> パイプライン: prep(全 at-risk) → batch combiner → reconstruct.workflow → 各 exam merge → 回帰 → 独立 Rule A → 検証。

## スコープ
- at-risk 143 (figure 127 / nonfig 16)。**2025r07 図題 16 は pilot 済 commit `c66f72e` → combiner が stem_<id>.json 存在で自動 skip** → 実再構成 **127** (figure 111 / nonfig 16)。
- 写審分離 (Rule D): writer=`general-purpose` ≠ in-pipeline checker=`oh-my-claudecode:critic` ≠ Rule A auditor=`oh-my-claudecode:code-reviewer` ≠ 裁決=主 context。

## reconstruct (WF `wf_96c93629-fae`、272 agent / 11.7M tok / ~56 分)
- **127/127 done、PASS 126 / CONCERNS 1 / FAIL 0**。changed 49 (実質訂正) / 78 既に忠実。
- **derived_answer == correct_answer = 127/127** (キー不一致 0、S97 figkey「keys clean」と整合)。
- 多ラウンド repair: q003 (FAIL→PASS)・q067 (FAIL→PASS、稼働率 0.98/0.99→0.8/0.9)・q043 (FAIL→PASS、作業D 29→20 名) ほか CONCERNS→PASS 5 件。Rule B 失敗 archive: `failures/quiz_phase1.5_S98_2022r04-q043_attempt_1{.md,_defective.json}`・`..._2024r06-q067_attempt_1.md`。

### CONCERNS 1 = 2024r06-q057 — 主 context 図実読で裁決 (最高権威パス、D-138)
- crop `2024r06-q057.png` を実読。**再構成 stem = 図のデータ表と逐セル一致** (header `暗号方式`/`鍵の特徴`/`鍵の安全な配布`/`暗号化／復号の相対的な処理速度`、行a=異なる鍵/容易/c、行b=同一鍵/難しい/d)。intro は `暗号化方式`、表 header は `暗号方式` を正しく区別。
- **答案 ウ = 正** (図の選択肢表 ウ = a:公開鍵 / b:共通鍵 / **c:遅い / d:速い**、データ表ロジック [公開鍵=遅い=c, 共通鍵=速い=d] と整合)。
- **CONCERNS の真因 = 上流 `choices_jp` の c/d 列腐敗** (corpus ウ=「c:速い/d:遅い」だが図 ウ=「c:遅い/d:速い」、4 択全ての速度列が図と swap)。**stem でもキーでもなく choices の問題** → choices トラック backlog (D-138 stem scope 外)。Rule A auditor が独立に同一指摘 (corroboration)。

## 回帰 (pilot 学び⑧ = 解答選択肢表の混入)
- 全 127 の stem_jp_clean/zh/en を `\|\s*[アイウエ]\s*\|` で走査 → **初回 1 件 leak: `2020r02o-q041`** (組合せ問の ア/イ/ウ/エ 表が stem に混入、3 語とも)。
- **根因**: reconstruct.workflow の `nonfigBlock` に「選択肢表を含めない」指示が欠落 (figureBlock のみ保持)、かつ in-pipeline CHECK_SCHEMA に `no_choice_table_leak` チェック無し。
- **是正 (B2-B4 恒久対策)**: ① nonfigBlock に選択肢表除去指示を追加 ② CHECK_SCHEMA に `no_choice_table_leak` (required) 追加 + checkPrompt に検証項目#5 追加。q041 を stem 削除→再 reconstruct (hardened、WF `wf_e1de499c-943`) → PASS・選択肢表除去確認 → 再 merge。
- **再走査 = 0 leak** (全 127、3 語)。

## merge (各 exam、決定的、translations サイドカーの stem フィールドのみ更新)
- 9 回すべて **missing 0**。updated 計 143 (2025r07=17 は pilot 16 再適用 [idempotent] + q034)。
- D-138-B: `stem_jp_clean` + `stem.{zh,en}` のみ書込。choices / answer keys / questions.json / quiz_index / figure 不変。reader/UI コード不変。

## 独立 Rule A (WF `wf_9634d6c4-06f`、auditor=code-reviewer ≠ critic ≠ writer、N=19)
- 層化 19 (figure 14 / nonfig 5、changed 17、強制 6 = q057/q043/q067/q003/q034/q041)。
- **faithful 19/19、severity none 14 / low 5 / medium 0 / high 0、choice-table-leak 0、key-mismatch 0**。
- low 5 は全て answer-neutral な字面/文体観察 (q061 zh/en 複数化明確化・q041 en 冠詞 placeholder・q057 choices c/d backlog 指摘・q098 表本体復元 [射影問で answer-neutral]・q055 zh 解釈補足・q034 数値修復の整合確認)。実質欠陥 0。

## 検証 (コード/file-set 不変 → 全バッチ同一、B1 で full 実行)
- tsc 0 / eslint 0 err (既存 warning 1 = `tTerm`) / **vitest 463 passed** / build exit 0。
- **nft IPA leak = 0** (粗 hits 3 = `data/ip/{exams,sources,syllabus}/**/*` の outputFileTracingExcludes グロブ文字列が required-server-files.json にエコーされた偽陽性。`.nft.json` トレース manifest に exams/sources/syllabus の実トレース依存 0 を確認)。

## backlog (choices トラック、D-138 stem scope 外、要ユーザー判断)
- **`2024r06-q057` choices_jp c/d 列腐敗** (4 択全て速度列 swap、図と不一致)。答案 ウ は正 (図の選択肢表 ウ と整合) だが配信 choices 文面が誤 → 図どおり再点検推奨。S97 の「非キー選択肢汚染」track に追加。
- 既存 (S96/S97): q096/q078/q077 ほか。Phase 2 (解析) に choices-fidelity を fold する案あり。

## 成果物
- translations サイドカー stem 更新 9 回 (committed)。
- scripts 新規: `quiz-phase1.5-batch.mjs` / `quiz-phase1.5-ruleA-prep.mjs` / `quiz-phase1.5-ruleA.workflow.mjs`。workflow hardening: `quiz-phase1.5-reconstruct.workflow.mjs` (no_choice_table_leak)。
- evidence: `S98-B1/{ruleA_result,ruleA_samples,items_batch}.json` + 本ファイル。Rule B: `failures/quiz_phase1.5_S98_*`。
