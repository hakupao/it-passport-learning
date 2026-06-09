# D-136 — Quiz Phase 1 (翻訳 backfill) 実行設計 = pilot-first / サイドカー保存 / vision三語クリーン / 教科書term束縛

> Session 87 (2026-06-09) / Phase 5 Stage 6 / Status: **LOCKED**
> 親: D-135 (Quiz sub-stage 架構、Phase 1=翻訳 backfill を規定)、D-134 (配信)
> 関連: D-128〜132 (Stage-4 生成パターン)、D-129-C (日語固定源→二次翻訳)、D-132 (LLM=Claude Code 経路)、D-019 (slow pace 設計問答)

## 文脈

D-135 で Quiz Phase 1 = 「2900×{zh,en} stem+choices を預生成・バッチ・各バッチ Rule A・増量 backfill」と架構を確定済。本 ADR は **実装レベルの実行設計**を確定する (Stage 4 の D-128〜132 と同格)。

Phase 0 の現状 (Session 86):
- `data/ip/quiz/questions.json` = 純粋 JP projection (翻訳フィールド無し)。`scripts/build-quiz-corpus.mjs` は**冪等で raw bank から上書き再生成**する。
- figure 問 467 のうち **243 問が stem に図 OCR garble 混入** (図＋選択肢が stem に混ざる)。非 figure 問の `|` は 19 問 (大半が正当な表)。
- 教科書 unit は三語 term (`term/term_zh/term_en` + `definition_*`、1417 語、Stage 4 で生成済) を保持。

D-019 設計問答 (Session 87、ユーザー回答=全 4 推奨案):

## 決定

### D-136-A — cadence = pilot-first
- **パイロット = 1 回分 `2025r07` (令和7年度、100Q、figure 16・garble 12)**。最新=現行シラバス代表、garble 被覆が厚く vision+JP-clean パスを stress。
- パイロットで検証: pipeline / サイドカー schema / reader merge / UI 三語切替 (exam-mode 完全被覆 + topic-mode 部分被覆=JP fallback 挙動) / Rule A / Rule D。
- **ゲート** (Rule A N-sample + Rule D APPROVE + UI 検証 + 証拠) → ユーザー GO → 残 28 回 / 2800 問を batched Workflow でスケール。
- 理由: 5800 翻訳単位は Stage-4 量級。schema/garble/figure/term-binding のミスを全量投入前に de-risk (D-128 pilot-first 規律踏襲)。

### D-136-B — 保存 = サイドカー + reader-time merge
- 翻訳は **`data/ip/quiz/translations/<exam_id>.json`** に保存 (exam 単位=自然なバッチ境界、Stage 4 の per-unit `.planning/translation_*` 踏襲)。
- エントリ (per question): `{ id, stem: {zh,en}, choices: {ア:{zh,en},イ:…,ウ:…,エ:…}, stem_jp_clean? }`。`stem_jp_clean` は figure 問で図 garble 除去後の JP (非 figure 問は省略=既存 stem_jp が clean)。
- **`build-quiz-corpus.mjs` は無改修** (純粋 JP projection を維持)。**`quizReader.ts` が read 時に join** (questions.json + translations/*.json → 三語 QuizQuestion)。
- corpus 再生成で翻訳が消えない (純粋性維持) + 増量 backfill が自然 (shard が landed 次第 reader が拾う=D-135「JP 先上线/増量回填」)。
- `translations/` は `data/ip/quiz/` 配下 = D-134 の `!/data/ip/quiz/` で un-gitignore (派生 corpus の一部、committed)。

### D-136-C — figure 問 = vision 補助の三語クリーン
- **figure 問 (467、パイロット 16)**: 翻訳 agent に**図画像** (`apps/web/public/quiz-figures/<id>.webp`) を渡す。生成: 図 OCR garble 除去済の **clean `stem_jp`** (正当な表は保持) + stem zh/en + choices zh/en。図は別途描画されるため stem に混入した図内容を剥離。
- **非 figure 問 (2433、パイロット 84)**: text-only 翻訳 (stem_jp は既に clean、zh/en のみ生成)。
- 却下: zh/en のみ追加 (JP 学習者が garble を見続ける + garbled JP を翻訳源にする精度懸念)。

### D-136-D — 用語 = 教科書 term + Stage4 zh 方針で束縛
- 翻訳プロンプトに注入: (a) Stage 4 の**本土 zh 用語方針** block (成果物→交付物 / 妥当性確認→确认 / 稼働→运行 等、`stage4-phaseB-translate.workflow.mjs` の文言を再利用) + (b) 各問の **topic_id → 教科書 unit の三語 term** (jp/zh/en) を glossary として提示。
- quiz と教科書で訳語一致 (D-135 Phase 3 の topic別quiz→unit埋込に効く)。

## パイプライン (Stage 4 踏襲)

`pipeline(questions, translateStage, reviewStage)` を Workflow で:
- **translate**: `general-purpose` (opus)。figure 問は vision、term glossary 注入。サイドカー schema で StructuredOutput。
- **review (Rule D)**: `oh-my-claudecode:code-reviewer` (opus、≠translator)、忠実度核験、最大 2 ラウンド repair (Stage-4 同型)。figure 問は reviewer も図を見る。
- **Rule A**: バッチ毎に独立 N-sample 監査 (別 workflow、`critic`/`code-reviewer`、N=12 for pilot、figure+非figure 層化)。
- 全 LLM=Claude Code 経路 (D-132、外部 API 不使用)。

## 却下した代替案

| 案 | 却下理由 |
|----|---------|
| 全量一気翻訳 | schema/garble/figure ミスが全量波及・再翻訳コスト高 (D-136-A) |
| questions.json に inline 翻訳 | build-quiz-corpus 再生成で消える・projection 純粋性喪失 (D-136-B) |
| zh/en のみ追加 (JP garble 残置) | JP 学習者が garble 視認・翻訳源が garbled (D-136-C) |
| glossary 束縛なし独立翻訳 | quiz/教科書で訳語ブレ (D-136-D) |

## 影響

- 新規: `scripts/quiz-phase1-translate.workflow.mjs` (Workflow)、`scripts/quiz-phase1-ruleA.workflow.mjs` (Rule A)、`data/ip/quiz/translations/<exam_id>.json` (サイドカー)。
- 改修: `apps/web/src/lib/quiz/quizModel.ts` (QuizQuestion に optional zh/en + `stem_jp_clean`、`localized` 活用)、`quizReader.ts` (translations join)、`QuizSet.tsx` (locale で三語表示・JP fallback)、i18n (必要時)。
- 無改修: `build-quiz-corpus.mjs` (純粋 JP projection)。
- invariants: raw bank / questions.json (JP projection) 不変。translations は新規サイドカー。

## 段階 (Phase 1 内部)

| Step | 内容 | 完了条件 |
|------|------|---------|
| 1 | schema + reader merge + model 拡張 (TDD) | tsc/eslint/vitest green、JP fallback 動作 |
| 2 | translate Workflow (vision/term-binding/writer-reviewer) | パイロット 2025r07 translations 生成 |
| 3 | Rule A N=12 独立監査 + Rule D 独立 review | 忠実度 PASS、写審分離 |
| 4 | UI 三語検証 + 証拠 | 全ページ 200、screenshots、`evidence/phase5/stage_06_quiz_phase1/` |
| 5 | **ゲート → GO 後** 残 28 回スケール | 全 2900 三語・各バッチ Rule A |
