# Evidence — Quiz Phase 1 (翻訳 backfill) pilot `2025r07`

> Session 87 (2026-06-09) / Phase 5 Stage 6 / D-136
> パイロット = `2025r07` (令和7年度、100Q、figure 16)。ゲート用証拠。

## 1. 何をしたか

D-135 Phase 1 = 過去問 stem+choices を JP→zh/en 預生成翻訳 (増量 backfill)。D-136 で実行設計を確定し、**パイロット 1 回分 (2025r07, 100Q)** を翻訳・検証した。

パイプライン (Stage-4 踏襲、全 LLM=Claude Code/opus、D-132):
1. `scripts/quiz-phase1-prep.mjs` — 派生 corpus + 教科書 glossary + figure PNG パスから翻訳 input を生成。
2. `scripts/quiz-phase1-translate.workflow.mjs` — `pipeline(translate[general-purpose] → review[code-reviewer] 2R)`。figure 問は図画像を Read して vision-clean、教科書 term glossary 束縛、本土 zh 用語方針。**writer ≠ reviewer (Rule D)**。read-by-id モード。
3. `scripts/quiz-phase1-merge.mjs` — per-question `tr_*.json` (choices 配列) を検証してサイドカー `data/ip/quiz/translations/2025r07.json` (choices オブジェクト) に決定的組立。
4. `scripts/quiz-phase1-ruleA-prep.mjs` + `quiz-phase1-ruleA.workflow.mjs` — N=12 層化独立監査 (**critic** = translator/reviewer と別 subagent_type)。

保存 (D-136-B): `quizReader.ts` が read 時に questions.json + translations/*.json を join。`build-quiz-corpus.mjs` 無改修 (純粋 JP projection)。サイドカー dir 不在=全 JP fallback。

## 2. 結果

### 翻訳カバレッジ
- **100/100 翻訳 (0 欠落)**。stem zh/en + choices zh/en 全問。
- **clean stem 49/100** (figure 問の図再構成 + 非 figure 問の OCR 誤字修正)。

### Rule D (in-pipeline reviewer = code-reviewer, ≠ translator)
- **99 PASS / 1 CONCERNS** (q039 = アジャイル穴埋め問の訳の自然さ軽微指摘、意味保持)。
- 8 問が CONCERNS→PASS の repair 1 ラウンドで是正。

### Rule A (独立 critic, N=12 層化 [figure 8 / cleaned 8])
- **accurate 12/12 (100%)、severity none×10 + low×2、medium/high=0**。
- 全 check (faithful_zh / faithful_en / terminology_ok / clean_stem_faithful) = true。
- low 2: q062 (穴埋めトークン「的」残存、意味・正誤無影響) / q065 (en 構文・zh 括弧併記、無影響)。
- 詳細: `rule_a_audit_2025r07.json`。

### vision-clean の価値実証 (q026)
- raw OCR 表が**完全破損** (図に無い「発注/入荷」、誤日付・誤金額) → translator が**図から表を完璧に再構成** (受注/売上計上/現金回収)。正解 ウ=2,300 整合。独立 critic も図一致を確認。
- 図比較: 本評価の根拠は session-87 ログ + figure `data/ip/exams/figures/2025r07-q026.png`。

### UI 三語レンダリング (dev server, runtime)
- `/{ja,zh,en}/quiz?mode=exam&id=2025r07` 全 **200**。
- zh: 应收账款(q026)/敏捷模型(q039)/**交付物**(Stage4 term 方針) 描画。en: accounts receivable / Agile model / subcontract。
- ja: q026 display JP = clean stem (`発注` garble 消失=clean が上書き、`受注` 表示)。
- screenshots: `quiz_phase1_{ja,zh,en}_2025r07.png` (exam set 三語、viewport)。q026 図+再構成表の検証は Rule A (critic 図一致確認) + session-87 ログの図比較を参照。

### ビルド / トレース / テスト
- `pnpm build` exit 0。**nft IPA leak = 0** (quiz route trace = quiz_index.json + questions.json + translations/2025r07.json のみ、exams/sources/syllabus/textbook=0)。
- `next.config.ts` QUIZ_TRACE に `translations/*.json` を明示追加 (29 回分の確実デプロイ)。
- tsc clean / eslint 0 / **vitest 455 passed** (+9 Phase1 helper: mergeTranslation/localizedStem/localizedChoices)。

## 3. 実装中の精緻化 (D-136-C 拡張、ゲート判断対象)

- **clean-JP を非 figure 問にも拡張**: D-136-C は figure 問の図 garble 除去に scope していたが、**非 figure 問の stem にも OCR 誤字** (「a こ c」「挙げけた」等) を発見。翻訳が源を解釈する以上、誤字のみ修正した `stem_jp_clean` を非 figure 問にも生成 (意味厳守)。session-86「stem garble は翻訳で自然解消」の原意に合致。Rule A で clean_stem_faithful=12/12 true。
- **既知の軽微 gap (v1 許容)**:
  - clean-JP は translator 裁量 → 軽 garble 問で未生成あり (q003 型、zh/en は clean)。
  - `choices_jp` は JP ノイズ (「[表]」等) 残存可能。**zh/en choices は clean** (訳でノイズ除去)。
  - q039 CONCERNS 1 件 (穴埋め訳の自然さ、意味保持)。

## 4. ゲート (D-136-A, ユーザー GO 待ち)

パイロット品質 = Rule A 100% accurate / Rule D 99% PASS / UI 三語動作 / build・nft・tests green。
→ **残 28 回 / 2800 問のスケールはユーザー GO**。スケール時は各回バッチで同パイプライン + 各回 Rule A N-sample。
