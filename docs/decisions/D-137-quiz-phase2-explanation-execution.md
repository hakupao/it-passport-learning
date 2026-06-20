# D-137 — Quiz Phase 2 (解析預生成) 実行設計

> Session 97 (2026-06-20) / Phase 5 Stage 6 / Status: **LOCKED**
> 親: D-135 (Phase 2 = 預生成・預存・三語・batch・Rule A・Workflow+opus・Rule D)。兄: D-136 (Phase 1 翻訳実行)。
> 前提: Phase 1 翻訳 29/29 完了 (S96) + Phase 2 前 figure-key 体検 = clean (S97、坏键率 0/40)。

## 文脈

Phase 2 = 2900 問の **解析 (explanation)** を三語で**預生成・預存**。D-135 で骨格は確定済。本 ADR は実行詳細 (D-019 設計問答、ユーザー回答 4/4 = 推奨案)。

## 決定 (D-019 ユーザー回答)

### D-137-A 解析 schema = **標準**
各問の解析 = ① **correct** (正解がなぜ正しいか、図/論理から導出) ② **distractors** (各誤答肢=正解以外の3字母がなぜ誤りか) ③ **points** (1-2 個の考点要点)。三語 (jp/zh/en)。
- 却下: 精簡 (正解理由のみ=学習価値低)、リッチ (+难度+pitfall+unit_ref=Phase 3 で別途、今は scope 過大)。

### D-137-B 生成フロー = **JP 先生成 → 翻訳**
JP 解析を先に生成 → Rule A 不要だが in-pipeline review (JP 妥当性) → zh/en へ翻訳 → in-pipeline review (訳忠実度) → Rule A (独立 critic、最終三語)。
- 日本語権威源 (D-135 思想)、Stage-4 / Phase-1 と一致、写審分離を二段に適用。
- 却下: 一括三語生成 (Rule A が三語同時で重い、訳ブレ risk)。

### D-137-C key-guard = **内蔵・suspect フラグ + 照常生成 + バッチ末汇总**
JP 生成器は解析を書く前に **図/stem から正解を独立導出** し `key_guard{figure_derivable, derived_answer, matches_key, note_jp}` を出力。`matches_key=false` or `figure_derivable=false` → `suspect`。**suspect でも解析は keyed answer 前提で生成** (スループット維持)、バッチ末に suspect 一覧 → ユーザー+主 context が図実読で裁決 (q052 プロトコル)。
- S97 体検の残差 (95% 上限 ≤~22/247 の潜在誤キー) を「追加 vision 無し」で Phase 2 が自然捕捉 (cf. S89 q095)。
- 却下: 該題 halt (バッチ打断・手戻り)、自動 re-key (q002/q052 教訓=誤改キー risk 高)。

### D-137-D cadence = **pilot 2025r07 → ユーザー gate → batch-by-batch**
Phase 1 と同形。100 問 pilot で schema/品質/key-guard を確認 → ユーザー承認 → 「续批」式に 29 回へ scale。pilot は Phase 1 で全訳済のため既存翻訳を term 一致の参照に使える。

## 実装

- **データ層**: 解析サイドカー `data/ip/quiz/explanations/<exam>.json` (D-136-B 翻訳サイドカーと同型、read 時 merge、欠落=JP fallback で非表示)。`quizModel.ts` に `QuizExplanationEntry`/`mergeExplanation`、`quizReader.ts` に loader、UI は reveal 後に解析描画 (per-locale)、`next.config.ts` QUIZ_TRACE に explanations/*.json。
- **パイプライン** (Phase 1 scripts を踏襲): `quiz-phase2-prep.mjs` (input 構築、図フルページ併読 D-小6、既存訳+glossary 同梱) → Workflow `quiz-phase2-generate.workflow.mjs` (JP生成[general-purpose,opus]→review[code-reviewer]→翻訳[general-purpose]→review、key-guard 内蔵、repair≤2) → `quiz-phase2-merge.mjs` (決定的組立+suspect 一覧) → `quiz-phase2-ruleA-prep.mjs` + `quiz-phase2-ruleA.workflow.mjs` (独立 critic N-sample)。
- **Rule D**: 生成 general-purpose ≠ in-pipeline reviewer code-reviewer ≠ Rule A critic ≠ 主 context 裁決。
- **Rule A**: 各バッチ N-sample 独立抽検 (解析の正解妥当性+誤答説明+訳忠実度+key-guard 妥当)。

## 影響

- 新規コード: schema/reader/UI/test + scripts×5。questions.json / 翻訳サイドカー / figure は不変。
- 解析サイドカーは公開 repo へ (IPA 教育利用範囲、出典+改変明記、D-134)。commit はユーザー確認ゲート。
- Phase 3 (教科書 unit 埋込) は D-137-A の unit_ref を後日付与しても良い (今は scope 外)。

## 却下した代替案 (まとめ)

| 案 | 却下理由 |
|----|---------|
| 精簡解析 (正解理由のみ) | 学習価値低 (D-137-A) |
| リッチ解析 (难度/pitfall/unit_ref) | scope 過大、Phase 3 で兑现 (D-137-A) |
| 一括三語生成 | Rule A 重い・訳ブレ (D-137-B) |
| key-guard halt / 自動 re-key | バッチ打断 / 誤改キー risk (D-137-C) |
| pilot 飛ばし | schema 調整時の手戻り大 (D-137-D) |
