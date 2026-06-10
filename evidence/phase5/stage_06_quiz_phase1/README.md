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

---

# スケール バッチ S88 (Session 88, 2026-06-09) — `2026r08` / `2024r06` / `2023r05`

> ユーザー路由「Quiz Phase 1 续批」→ 最新優先 3 回 (既訳 2025r07 除外)。pilot 後の初回スケール。
> 効率化: translate を 300 問**統合 1 ワークフロー**で実行 (id グローバル一意のため merge は exam スコープで安全)。committed sidecar は per-exam (tested フォーマット維持)。

## 何をしたか
パイプラインは pilot と同一 (prep → translate.workflow → merge → ruleA-prep → ruleA.workflow)。
- prep ×3 (figure PNG 存在 fail-fast 検証 → 全存在)、統合 input `input_batch_S88.json` (300 問・id 全一意・整合 0 bad)。
- translate 統合ワークフロー (`wf_1024ac47-207`): 300 問、writer(general-purpose,opus) → reviewer(code-reviewer,opus) 2R。**658 agent / 16.9M tok**。
  - 途中ユーザー要請で 200 done 付近 (batch-tr=211) で一旦停止 → `resumeFromRunId` でキャッシュ再利用し残 89 問を完走 (resume の実証)。
- merge ×3 → committed sidecar `translations/{2026r08,2024r06,2023r05}.json` (各 100/100、missing 0)。
- ruleA-prep ×3 (各 N=12、層化) → 統合 audit ワークフロー (`wf_cb730e23-47b`、36 critic、independent)。

## 結果

### 翻訳カバレッジ
- **300/300 翻訳 (0 欠落)**。clean stem: 2026r08=48 / 2024r06=39 / 2023r05=56 (計 143)。

### Rule D (in-pipeline reviewer = code-reviewer, ≠ translator)
- **298 PASS / 2 CONCERNS** (意味保持、軽微)。多数の CONCERNS→PASS repair (1R)。

### Rule A (独立 critic, N=36 [各回12, 層化 figure21])
- 原監査: **accurate 35/36**、severity none19 / low16 / **high1**。
- **high 1 = `2026r08-q072`** (clean_stem_faithful=false): figure 問の `stem_jp_clean` で "口座" 表の実在列「口座種別」脱落+列順改変、zh/en へ伝播。**正解イは不変** (FK 依存鎖保持)。
  - 修復: writer(general-purpose) を figure crop + **page-35.png (権威源)** で再 dispatch → 正 4 列に是正。独立 critic 再監査 = **ACCEPT** (accurate/none/clean_stem_faithful=true)。
  - Rule B archive: `failures/quiz_phase1_S88_2026r08-q072_attempt_1{.md,_defective.json}`。
- **実効 (修復後): accurate 36/36 (100%)、severity none19 / low16 / high0**。
- low16 = 自然さ (第三方/关系/磁盘镜像 等の本土 zh 微調余地)・figure クロップ観察 (翻訳でなく figure パイプライン側、scope 外)・説明的グロス (累加法/maximin 等の妥当な補足)・FP法 正規化。**いずれも正誤・脱落・捏造なし** (session-87 既知 gap と同型)。
- 詳細: `rule_a_audit_S88.json` (全 36 audit + `post_fix_reaudit` + `effective`)。

### ビルド / トレース / テスト (全 GREEN・回帰なし)
- tsc `--noEmit` exit 0 / eslint 0 error (既存 warning 1=quiz 無関係) / **vitest 455 passed** (S87 ベースライン維持) / `pnpm build` exit 0。
- **nft IPA leak = 0**: quiz route trace = `quiz_index.json` + `questions.json` + `translations/{2023r05,2024r06,2025r07,2026r08}.json` のみ。raw IPA (exams/sources/syllabus/pages/figures/question_bank) は全 .next trace で 0。
  - 新 3 sidecar が next.config QUIZ_TRACE で正しく trace 済 (確実デプロイ)。

## コード変更
- **なし** (reader/UI/next.config は S87 Phase 1 で完成済)。本バッチの成果物は **data の sidecar 3 ファイル + q072 修正のみ**。

## UI スクリーンショット (本バッチは省略・根拠)
- reader/`QuizSet`/`quizReader` は S87 から不変 = pilot で三語描画実証済。新 sidecar は同一 schema (merge 検証通過) + nft trace 済 + build 成功。
- **意味検証は Rule A 36 独立サンプル** (実際の翻訳内容を JP源/図と照合) が担保 = スクリーンショットより強い。よって本スケールバッチでは新規 screenshot を省略。

## 進捗
- Phase 1 翻訳済: **4/29 回 (2025r07 pilot + 2026r08/2024r06/2023r05)**。残 25 回。次バッチはユーザー「Quiz Phase 1 续批」で起動。

---

# スケール バッチ S89 (Session 89, 2026-06-10) — `2022r04` / `2021r03` / `2020r02o`

> ユーザー路由「Quiz Phase 1 续批」→ 最新優先 3 回 (既訳 4 回除外)。S88 と同じ統合 1 ワークフロー方式 (D-小5)。
> **D-小6 を本バッチで実装**: S88 の fix-checklist (figure 問は crop だけでなく full page を併読すべき) を prep + 3 prompt に組込み。

## 何をしたか
- **D-小6**: `quiz-phase1-prep.mjs` が raw bank の `source.page_image` から figure 問に `figure_page_png` (原典フルページ ABS パス) を注入 (存在 fail-fast)。translate workflow の translator/reviewer prompt と ruleA workflow の critic prompt を「crop+フルページ両方 Read、**フルページが権威** (crop は端欠落しうる)、列脱落・列順改変禁止」に更新。
- prep ×3 (figure 16/8/13、crop+page 全存在) → 統合 input `input_batch_S89.json` (300 問・id 全一意・整合 0 bad)。
- translate 統合ワークフロー (`wf_f492c4f7-038`): 300 問、writer(general-purpose,opus) → reviewer(code-reviewer,opus) 2R。**658 agent / 18.9M tok**。
  - ユーザー指示「総量の半分で一時停止」→ 153 done (全 well-formed、2022r04=100/2021r03=53) で TaskStop → ユーザー「継続」→ `resumeFromRunId` でキャッシュ 153 再利用し残 147 完走 (**resume 2 回目の実証**)。
- merge ×3 → committed sidecar `translations/{2022r04,2021r03,2020r02o}.json` (各 100/100、missing 0)。
- ruleA-prep ×3 (各 N=12、層化) → 統合 audit ワークフロー (`wf_2d362fb8-b85`、36 critic、independent)。

## 結果

### 翻訳カバレッジ
- **300/300 翻訳 (0 欠落)**。clean stem: 2022r04=58 / 2021r03=62 / 2020r02o=62 (計 182)。

### Rule D (in-pipeline reviewer = code-reviewer, ≠ translator)
- **実効 299 PASS / 1 CONCERNS** (raw: 298 PASS / 1 CONCERNS / 1 FAIL)。
- **FAIL 1 = `2021r03-q067`**: **repair 誘発回帰**。R1 reviewer が distractor「保全性」の訳を low で指摘し「保护性」を誤示唆 → repair が採用 → R2 reviewer (別インスタンス) が捏造語 (保全≠保護) として正しく FAIL。
  - 修復: writer(general-purpose) ピンポイント是正 zh「保全性」(姉妹問 2020r02o-q087 前例の漢字保持) / en「Preservation」(b 項 保守性=Maintainability との衝突回避) → 独立 code-reviewer 再 review **PASS 6/6 check・回帰 0**。
  - Rule B archive: `failures/quiz_phase1_S89_2021r03-q067_attempt_1{.md,_defective.json}`。
  - 教訓: **reviewer の low 任意示唆を repair で機械採用すると語義区別を壊しうる**。repair は指摘欠陥の是正に限定すべき。
- **CONCERNS 1 = `2020r02o-q011`**: 翻訳は忠実 (2 reviewer 一致)。実体は上流 `choices_jp` の図→テキスト転写と図の矢印方向の不一致 (source 側、S87 q039 型 known gap)。正解エの訳は図 (権威) と整合し正誤判定保持 → 受容+backlog 記録。

### Rule A (独立 critic, N=36 [各回12, 層化 figure23])
- **accurate 36/36 (100%)、severity none25 / low11 / medium0 / high0** — pilot 以来初の修復不要バッチ (S88 は high1)。
- q067 (修復済を抽検) = accurate/low (ダミー語の訳語ニュアンスのみ、正誤不変)。q011 = accurate/low (上流転写問題の確認)。
- **D-小6 の効果が実測で確認**: 生 stem の OCR 誤数値をフルページ併読で正しく clean 化した事例が 3 件 — q050 (移動50秒/C18秒→図の60秒/10秒、検算で正解ア=223秒成立)、q074 (「5を格納」→図の「1を格納」)、q071 (D3=8,000→図の5,000)。**いずれも critic がフルページで検算し忠実確認**。
- low11 = 本土 zh 自然さ微調 (共通规则/经常利润 等)・表記スタイル (全角コロン)・解釈的グロス (independently/CountIf)・glossary スタレ残骸 (q070「表」, q043 非関連項目)・上流データ品質メモ。**いずれも正誤・脱落・捏造なし**。
- **scope 外メモ**: `2021r03-q095` で critic が公式 correct_answer=ウ(B,C) と図からの再計算 (エ=C のみ該当に見える) の食い違いを記録。翻訳は全選択肢を忠実訳出済 (訳ミスでの正誤崩れではない)。answer_keys は Stage 2 で 100% 検証済の公式キーであり改変しない。Phase 2 (解析預生成) で自然に再検算される → backlog 記録のみ。
- 詳細: `rule_a_audit_S89.json` (全 36 audit + context)。

### ビルド / トレース / テスト (全 GREEN・回帰なし)
- tsc `--noEmit` exit 0 / eslint 0 error (既存 warning 1=quiz 無関係) / **vitest 455 passed** (S88 ベースライン維持) / `pnpm build` exit 0。
- **nft IPA leak = 0**: 全 .next trace で `data/ip/{exams,sources,syllabus}`・`question_bank` = 0 hits (粗パターン 4 hits は Next.js 内部 `pages/` モジュールと自作 `data/ip/textbook/figures/*.svg` の誤検知と確認)。quiz trace = `quiz_index.json` + `questions.json` + `translations/{7 回}.json`。新 3 sidecar が QUIZ_TRACE で正しく trace 済。

## コード変更
- **scripts 3 ファイルのみ** (D-小6: prep の page 注入 + translate/ruleA workflow の prompt 増強)。reader/UI/next.config は S87 から不変。成果物 = sidecar 3 ファイル。

## UI スクリーンショット (S88 と同根拠で省略)
- reader/`QuizSet`/`quizReader` 不変、新 sidecar 同一 schema (merge 検証通過) + nft trace 済 + build 成功。意味検証は Rule A 36 独立サンプルが担保。

## 進捗
- Phase 1 翻訳済: **7/29 回 (2025r07 + 2026r08/2024r06/2023r05 + 2022r04/2021r03/2020r02o)**。残 22 回。次バッチはユーザー「Quiz Phase 1 续批」で起動。
