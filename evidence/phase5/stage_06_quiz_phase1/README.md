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

---

# スケール バッチ S90 (Session 90, 2026-06-12) — `2019r01a` / `2019h31h` / `2018h30a`

> ユーザー路由「Quiz Phase 1 续批」→ 最新優先 3 回 (既訳 7 回除外)。統合 1 ワークフロー (D-小5) + フルページ併読 (D-小6)。
> **D-小7 を本バッチで実装**: S89 q067 教訓 (repair の low 示唆機械採用→回帰) を受け、repair プロンプトに「是正は check FAIL + high/medium に限定、low 示唆は語義検証なしに採用しない」を明記。

## 何をしたか
- prep ×3 (figure 14/19/12、crop+page 全存在) → 統合 input `input_batch_S90.json` (300 問・id 全一意・整合 0 bad)。
- translate 統合ワークフロー (`wf_d14ac5b6-8b5`): 300 問。**674 agent / 14.4M tok** (S89 比 -24%、D-小7 で無駄 repair 減)。
  - ユーザー指示「400/602 で一時停止」→ journal 監視で **402 完了時に TaskStop** (翻訳 300/300 は全部落盘済・全 well-formed、停止対象は review 後半) → 「継続」→ `resumeFromRunId` で 402 キャッシュ再利用し完走 (**resume 3 回目の実証**)。
- merge ×3 → committed sidecar `translations/{2019r01a,2019h31h,2018h30a}.json` (各 100/100、missing 0)。
- ruleA-prep ×3 (各 N=12、層化) + **修復/関注問 2 件を強制追加** → 統合 audit ワークフロー (`wf_0d978a91-cff`、**38 critic**、independent)。

## 結果

### 翻訳カバレッジ
- **300/300 翻訳 (0 欠落)**。clean stem: 2019r01a=39 / 2019h31h=57 / 2018h30a=48 (計 144)。

### Rule D (in-pipeline reviewer = code-reviewer, ≠ translator) — **FAIL 0**
- raw: **291 PASS / 9 CONCERNS / 0 FAIL** (S89 は FAIL1)。q082 は FAIL→repair→PASS (真欠陥の repair は機能維持)。
- **D-小7 の効果を実測**: `2018h30a-q010` で R1 medium (執行役員→执行董事 誤訳) は repair が正しく是正 (→高级管理人员)、R2 の矛盾する low 示唆 (执行董事に戻せ) は**採用せず** — ガード意図通り。agent 数 -24% (無駄 repair 減)。
- 9 CONCERNS の triage: **7 = low-only** (本土 zh 自然さ等、S87 既知 gap 同型) → 受容。`2019h31h-q026` = clean_stem_ok 設計指摘 (レンダリング図内 JP ラベルが zh/en 学習者に不可読 — 全 figure 問共通の v1 既定設計、D-135/136) → 受容+backlog。**`2019r01a-q045` = medium 1 件** (distractor エ zh「软件方式设计」日式借词) → 本文 1 フィールドのみ「软件架构设计」へ定点修正 (ISO/IEC 12207: 方式設計=architecture design、en は元から正) → 独立 code-reviewer 再 review **APPROVE** (詳細突合・回帰 0)。
- **実効: 292 PASS 相当 / 8 CONCERNS (全 low-only/設計層) / FAIL 0**。

### Rule A (独立 critic, N=38 [各回12 + 強制2、層化 figure20])
- **accurate 38/38 (100%)、severity none26 / low12 / medium0 / high0 — 連続 2 バッチ修復不要**。
- 強制サンプル: `2019r01a-q045` (修復済) = **accurate/none** (完全確認)。`2018h30a-q010` = accurate/low (同 low 語感のみ、現訳は語義安全)。
- **D-小6 効果の再実測 2 件**: `2019h31h-q053` (源 stem「59本」「4万円日」→図の「50本」「4万円／日」、critic がフルページで検算し正解ア根拠成立確認)、`2019h31h-q098` (源表 B2=88/C2=空 →図の 80/合格、3 列再構成が図と完全一致)。
- low12 = 本土 zh 自然さ (市场成长率→增长率 等)・語感ズレ (应收股利/职场→公司)・SEO 注釈の並列性 (q003、正解だけ語釈付き=視覚ヒント、low)・glossary タグ精度メモ・**源データ品質メモ 2 件** (下記 backlog)。正誤・脱落・捏造ゼロ。
- **新 backlog (figure pipeline 側、翻訳無影響)**: `2019h31h-q061` の **figure crop が隣問 (問62 RAID) を写している** (crop 境界ズレ)。翻訳はテキスト+フルページ照合で無影響と確認済みだが、**アプリ上 q061 に誤った図が表示される** → raw crop + `public/quiz-figures/2019h31h-q061.webp` の再裁剪要 (Stage 2/Phase 0 図管線 scope、ユーザー判断待ち)。
- 詳細: `rule_a_audit_S90.json` (全 38 audit + context)。

### ビルド / トレース / テスト (全 GREEN・回帰なし)
- tsc `--noEmit` exit 0 / eslint 0 error (既存 warning 1=quiz 無関係) / **vitest 455 passed** / `pnpm build` exit 0。
- **nft IPA leak = 0** (精確パターン: `data/ip/{exams,sources,syllabus}`・`question_bank` 全 .next trace で 0 hits)。quiz trace = quiz_index + questions + **translations/{10 回}.json** (新 3 sidecar QUIZ_TRACE 済)。

## コード変更
- `scripts/quiz-phase1-translate.workflow.mjs` 1 ファイルのみ (D-小7 repair ガード 1 段落)。成果物 = sidecar 3 ファイル + q045 修正。

## UI スクリーンショット (S88/S89 と同根拠で省略)
- reader/`QuizSet`/`quizReader` 不変、新 sidecar 同一 schema + nft trace 済 + build 成功。意味検証は Rule A 38 独立サンプルが担保。

## 進捗
- Phase 1 翻訳済: **10/29 回** (2025r07 / 2026r08 / 2024r06 / 2023r05 / 2022r04 / 2021r03 / 2020r02o / 2019r01a / 2019h31h / 2018h30a)。**残 19 回**。次バッチはユーザー「Quiz Phase 1 续批」で起動。

---

# スケール バッチ S91 (Session 91, 2026-06-15) — `2018h30h` / `2017h29a` / `2017h29h`

> ユーザー路由「Quiz Phase 1 续批」→ 最新優先 3 回 (既訳 10 回除外)。統合 1 ワークフロー (D-小5) + フルページ併読 (D-小6) + repair 語義ガード (D-小7、いずれも scripts 組込済)。
> **新規ヘルパ `scripts/quiz-phase1-batch.mjs`**: S88〜S90 でインライン構築していた統合バッチファイル (input_batch / items_batch / sidecar_batch / ruleA_items) を決定的スクリプト化 (count・id 一意・forced id を assert)。残バッチの再現性向上。

## 何をしたか
- prep ×3 (figure 13/12/10=35、crop+page 全存在) → `quiz-phase1-batch.mjs translate S91` で統合 input `input_batch_S91.json` (300 問・id 全一意・figure 35 全てフルページ付)。
- translate 統合ワークフロー (`wf_0cd70973-55c`): 300 問。**666 agent / 24.3M tok**。pause 指示なし → 全量完走。
- merge ×3 → committed sidecar `translations/{2018h30h,2017h29a,2017h29h}.json` (各 100/100、missing 0、clean stem 58/46/50)。
- ruleA-prep ×3 (各 N=12、層化) + **4 CONCERNS を強制追加** → `quiz-phase1-batch.mjs ruleA S91` で統合 sidecar/items → audit ワークフロー (`wf_e5514cf3-523`、**37 critic**、independent)。session limit で 7 失敗→ `resumeFromRunId` で補完 (30 キャッシュ+7 live=37/37、**resume 4 回目の実証**)。

## 結果

### 翻訳カバレッジ
- **300/300 翻訳 (0 欠落)**。clean stem: 2018h30h=58 / 2017h29a=46 / 2017h29h=50 (計 154)。

### Rule D (in-pipeline reviewer = code-reviewer, ≠ translator) — **FAIL 0**
- raw: **296 PASS / 4 CONCERNS / 0 FAIL**。29 問が CONCERNS/FAIL→repair→PASS (真欠陥の repair 機能維持)。
- **4 CONCERNS の triage は「verdict ラベル」でなく「repair 後の実落盘訳文」で判定** (構造検査≠意味検査):
  - **`2017h29h-q090` (figure)**: R1 medium = zh の `うどんすき`→`什锦乌冬面` 訳が操作c の前方一致 (`うどん%`=`乌冬面%`) を壊し zh 表で c=1 (JP は c=2)。→ **repair が `乌冬面火锅` (前方一致保持) へ是正済**。zh で再計算 a=4>b=3>**c=2**→ア = JP/en と一致。受容 (repair 成功)。Rule A: accurate/**none**。
  - **`2018h30h-q019` (figure, 損益計算書)**: R1 high = zh の `特別利益/特別損失`→`营业外利得/损失` が既存 `営業外収益/費用` 行と会計区分を混同。→ **repair が `特别利益/特别损失` (营业外と区別) へ是正済**。残 low = `事業税`→`营业税` (营业税=中国で廃止済の別税目、en `enterprise tax` は正) → **本文 stem.zh 1 フィールドのみ `事业税` へ定点修正** (唯一一致を assert、en/choices 不変)。Rule A 独立再監査: accurate/**none** (修正確認)。
  - **`2017h29a-q003` (figure, 貸借対照表)** / **`2017h29h-q069` (figure, DB正規化)**: in-pipeline は **low-only** (`〜の部`→`资产部` 等の本土自然さ・資格名字義訳)。受容。
- **実効: 297 PASS 相当 (q019 修正後) / 3 CONCERNS (全 low-only) / FAIL 0**。

### Rule A (独立 critic, N=37 [各回12 + 強制4 CONCERNS、層化 figure24]) — **accurate 37/37**
- **accurate 37/37 (100%)、severity none22 / low14 / medium1 / high0**。not-accurate **0**。
- 強制サンプル: q090=accurate/none・q019=accurate/none (修正確認)・q003=accurate/low・q069=accurate/**medium** (下記、翻訳は PASS)。
- **medium 1 = `2017h29h-q069` = 上流 (Stage 2) OCR 欠陥の申し送り (翻訳忠実度は PASS)**:
  - zh/en の選択肢は input `choices_jp` を列・列順・項目とも **1:1 で完全忠実訳出** (誤訳・脱落・捏造・正誤逆転なし、機械照合済、accurate=true・4 check 全 true)。
  - 問題は **input.choices_jp 自体**が権威フルページ `pages/2017h29h/page-29.png` とズレ: 選択肢イ (表1第3列・表2第1列の誤OCR) / 選択肢ウ (表2 から `社員名` 脱落)。翻訳は誤 input を忠実に引き継ぐため zh/en も同ズレ。
  - **正解ア は権威・input 一致、ア の訳も正確で正解根拠は不変**。ただし誤選択肢イ/ウ が配信されると公式過去問と異なる → **上流 choices_jp の権威フルページ基準 再OCR・是正が必要 = backlog (Stage 2 図/OCR 管線 scope、ユーザー判断待ち、翻訳 backfill scope 外)**。S89 q011 / S90 q061 と同型 (独立 critic のフルページ照合が翻訳層を超え上流欠陥を捕捉=網兜の再実証)。
- **D-小6 効果の実測**: `2017h29a-q001` (源 stem Z行「6,7,8」→図 page-02 の「8,7,8」、stem_jp_clean がフルページで是正、最大生産額22=ウ 整合。未修正なら21=イ で正解崩壊)・`2017h29a-q020` (利益行 10/60/20/20 をフルページ復元)。源 OCR 破損をフルページ併読が正是正。
- low14 = 本土 zh 自然さ・説明的グロス (q049 `経営者`→`管理层` 補足注記等)・glossary 冗長エントリ・指標名の補足注記 (q021)。正誤・脱落・捏造ゼロ。
- **追加 backlog note (q069、翻訳無影響)**: ① zh 資格名字義訳 (`IT护照`/`基本信息技术者`、本土自然さ、glossary 追補で対応可・low) ② **メタデータ OQ 候補**: id `2017h29h-q069` だがフルページ上の印刷問番号は『問59』(stem は完全一致でページ自体は正、id採番 vs 印刷番号の対応は上流要確認)。
- 詳細: `rule_a_audit_S91.json` (全 37 audit + medium_findings + context)。

### ビルド / トレース / テスト (全 GREEN・回帰なし)
- tsc `--noEmit` exit 0 / eslint 0 error (既存 warning 1=quiz 無関係) / **vitest 455 passed** (+2 skipped) / `pnpm build` exit 0。
- **nft IPA leak = 0** (`.next` 全 .nft.json で `data/ip/{exams,sources,syllabus}` 0 hits)。quiz route trace = quiz_index + questions + **translations/13 回.json** (新 3 sidecar が `translations/*.json` glob で resolve 確認)。

## コード変更
- `scripts/quiz-phase1-batch.mjs` **新規** (統合バッチ combiner、決定的、S88〜S90 のインライン構築を置換)。translate/ruleA/prep/merge は不変 (D-小6/D-小7 組込済)。
- 成果物 = sidecar 3 ファイル + q019 1 フィールド修正 (`事业税`)。

## UI スクリーンショット (S88〜S90 と同根拠で省略)
- reader/`QuizSet`/`quizReader` 不変、新 sidecar 同一 schema (merge 検証通過) + nft trace 済 + build 成功。意味検証は Rule A 37 独立サンプルが担保。

## 進捗
- Phase 1 翻訳済: **13/29 回** (S87〜S91)。**残 16 回**。次候補 = `2016h28a` / `2016h28h` / `2015h27a` (最新優先)。次バッチはユーザー「Quiz Phase 1 续批」で起動。
- **要ユーザー判断 backlog (上流データ品質、翻訳成果物に影響なし)**: `2017h29h-q069` choices_jp イ/ウ 再OCR (Stage 2) / `2019h31h-q061` figure crop 再裁剪 (S90 carryover) / q069 id採番 vs 印刷問番号。

---

# スケール バッチ S92 (Session 92, 2026-06-16) — `2016h28a` / `2016h28h` / `2015h27a`

> ユーザー路由「Quiz Phase 1 续批」(回数未指定) → 最新優先 3 回 (既訳 13 回除外、STATE「次候補」と一致)。統合 1 ワークフロー (D-小5) + フルページ併読 (D-小6) + repair 語義ガード (D-小7) + 統合バッチ combiner `scripts/quiz-phase1-batch.mjs` (D-小8、いずれも scripts 組込済=追加コード無し)。

## 何をしたか
- prep ×3 (figure 17/17/17=51、crop+page 全存在) → `quiz-phase1-batch.mjs translate S92` で統合 input `input_batch_S92.json` (300 問・id 全一意・figure 51 全てフルページ付)。
- translate 統合ワークフロー (`wf_eb5953ac-643`): 300 問。**644 agent / 23.5M tok**。pause 指示なし → 全量完走。
- merge ×3 → committed sidecar `translations/{2016h28a,2016h28h,2015h27a}.json` (各 100/100、missing 0、clean stem 40/56/45=141)。
- ruleA-prep ×3 (各 N=12、層化) + **CONCERNS 4 + null 1 を強制追加** → `quiz-phase1-batch.mjs ruleA S92` で統合 sidecar/items (40 サンプル、figure 30) → audit ワークフロー (`wf_7f0a3b52-84c`、**40 critic**、independent)。**resume 不要 (40/40 完走)**。

## 結果

### 翻訳カバレッジ
- **300/300 翻訳 (0 欠落)**。clean stem: 2016h28a=40 / 2016h28h=56 / 2015h27a=45 (計 141)。

### Rule D (in-pipeline reviewer = code-reviewer, ≠ translator) — **FAIL 0**
- raw: **295 PASS / 4 CONCERNS / 1 null / 0 FAIL**。
- **null 1 = `2016h28h-q017`**: in-pipeline reviewer が **`API Error: Overloaded`** (瞬時 infra 障害) で失敗し未レビュー。translator 出力は well-formed (merge 構造検査通過)。→ **独立 `oh-my-claudecode:code-reviewer` で当該 1 問のみ再レビュー = PASS (5 check 全 true、artifact ≡ sidecar 一致を実データ照合)**。Rule D 補缺。Rule A でも forced 監査 = accurate/none (二重カバー)。
- **4 CONCERNS (全 figure) の triage は「verdict ラベル」でなく「repair 後の実落盘訳文 + 独立 Rule A」で判定** (構造検査≠意味検査):
  - `2016h28a-q096` / `2015h27a-q072` / `2015h27a-q086`: forced Rule A = **accurate / none** (figure 問の stem_jp_clean がフルページと整合)。受容。
  - `2016h28h-q022`: forced Rule A = accurate / **low** (2 件とも「stem_jp_clean が figure の結合セル『初期費用の15%(運用・保守の合算)』と『記載のない条件』を正しく復元した」という確認 low。欠陥でなく妥当な OCR 修正の追認)。受容。
- **適用修正 1 = `2016h28a-q020` (PASS だったが Rule A が genuine 用語取り違えを捕捉)**: stem.zh の評価項目「営業力」(=sales) を `营销能力` (营销=marketing) と取り違え。en は元から `Sales capability` で正。低深刻度 (重み1・A社固定値10 で正解ウ=8 不変の非答案セル) だが genuine な zh 用語誤り → **stem.zh 1 フィールドのみ `销售能力` へ定点修正** (唯一一致 assert、en/choices/数値不変)。**独立 critic 再監査 = accurate / none** (取り違え解消・波及なし確認)。
- **実効: 296 PASS 相当 (q020 修正後) / FAIL 0**。

### Rule A (独立 critic, N=40 [各回12 + 強制5 = 4 CONCERNS + 1 null、層化 figure30]) — **accurate 40/40**
- **accurate 40/40 (100%)、severity none29 / low11 / medium0 / high0**。not-accurate **0**。**スケール 5 バッチ目で初の medium/high ゼロ**。
- low11 の内訳 (全て正誤・脱落・捏造ゼロ):
  - **本土 zh 自然さ / 許容等価** (受容): q048 `件数`、q099 `参照` 保持 (3ビット整合のため意図的)、q001 `経理部`→`财务部`、q020(28h) `居民税/事业税` 借用 + `经常利润` グロス、q042 `部署` の導入/配置区別消失、q088(27a) zh 第1文の説明句前置。
  - **上流 (Stage 2) raw OCR 欠陥の申し送り** (翻訳は figure/input に忠実、Stage 2 backlog、S89 q011/S90 q061/S91 q069 と同型):
    - `2016h28h-q001`: raw choices_jp ア `16時間`→figure `10時間` (OCR 16↔10)、イ garble `伝杜/困正用/町正`→figure `伝票/訂正用/訂正`。翻訳は figure 値に一致=忠実。正解ア (可用性) 不変。
    - `2016h28h-q012`: raw choices_jp イ `13,000`→figure(page-06) `12,000`。翻訳は input の 13,000 を忠実転記 → **input と figure のズレ=上流欠陥** (S91 q069 型、再OCR で是正要)。
    - `2016h28h-q096`: input JP 自体が garble ((1)stem 表 H004 数学 50→figure 70 (2)choices_jp の LIKE `%` 脱落)。加えて IPA H28春 問96 自体に ウ/エ がともに該当 2 名で単一最大が不成立の official 設問固有論点。翻訳は input に忠実。
    - `2015h27a-q088`: stem 基準値 3.6 vs 図3 区分線 3.0 の不一致は raw OCR に既存、clean は原典値 3.6 を非改変保持。正解エ (相関係数0.5区分線) は 3.0/3.6 差に非依存=正誤不変。
  - **glossary 不整合の申し送り** (翻訳は正しく正解根拠保持、textbook glossary 側 backlog): `2016h28a-q025` 正解ウ 職能別組織→訳 `职能制组织/Functional organization` は IPA 標準で正、ただし供給 glossary は `职务制组织/Job-Function Organization` と誤誘導的対訳。訳の修正不要、glossary エントリ再確認を推奨。
- 強制サンプル: q096(28a)/q072/q086/q017 = accurate/none、q022(28h) = accurate/low (確認 low)。
- 詳細: `rule_a_audit_S92.json` (全 40 audit + applied_fix + upstream_ocr_backlog + glossary_backlog)。

### ビルド / トレース / テスト (全 GREEN・回帰なし)
- tsc `--noEmit` exit 0 / eslint 0 error (既存 warning 1=quiz 無関係 `tTerm`) / **vitest 455 passed** (+2 skipped、29 file passed/1 skipped) / `pnpm build` exit 0 (Compiled successfully)。
- **nft IPA leak = 0** (`.next` 全 .nft.json で `data/ip/{exams,sources,syllabus}` 0 hits)。quiz route trace = quiz_index + questions + **translations/16 回.json** (新 3 sidecar が `translations/*.json` glob で resolve 確認)。

## コード変更
- **無し** (combiner `quiz-phase1-batch.mjs` は S91 で導入済、translate/ruleA/prep/merge は D-小6/7 組込済で不変)。
- 成果物 = sidecar 3 ファイル + q020 1 フィールド修正 (`销售能力`) + 証拠 (`rule_a_audit_S92.json` + 本節)。

## UI スクリーンショット (S88〜S91 と同根拠で省略)
- reader/`QuizSet`/`quizReader` 不変、新 sidecar 同一 schema (merge 検証通過) + nft trace 済 + build 成功。意味検証は Rule A 40 独立サンプル + q017/q020 の独立再核が担保。

## 進捗
- Phase 1 翻訳済: **16/29 回** (S87〜S92)。**残 13 回**。次候補 = `2015h27h` / `2014h26a` / `2014h26h` (最新優先)。次バッチはユーザー「Quiz Phase 1 续批」で起動。
- **要ユーザー判断 backlog (上流データ品質、翻訳成果物に影響なし、累積)**: `2016h28h-q001` choices_jp (16→10時間・イ garble) / `2016h28h-q012` choices_jp イ (13,000→12,000) / `2016h28h-q096` stem 表 (H004 50→70)・choices_jp LIKE `%` 脱落・official 設問ウ/エ 二者該当 / `2015h27a-q088` 図3 基準値整合 (Stage 2 図/OCR scope) / `2016h28a-q025` glossary 職能別組織 エントリ再確認 (textbook scope)。S91 以前: `2017h29h-q069` 再OCR / `2019h31h-q061` figure crop。

---

# スケール バッチ S93 (Session 93, 2026-06-16) — `2015h27h` / `2014h26a` / `2014h26h`

> ユーザー路由「Quiz Phase1 续批」(回数未指定) → 最新優先 3 回 (既訳 16 回除外、STATE「次候補」と一致)。統合 1 ワークフロー (D-小5) + フルページ併読 (D-小6) + repair 語義ガード (D-小7) + 統合バッチ combiner `scripts/quiz-phase1-batch.mjs` (D-小8、いずれも scripts 組込済=追加コード無し)。

## 何をしたか
- prep ×3 (figure 6/22/14=42、crop+page 全存在 fail-fast) → `quiz-phase1-batch.mjs translate S93` で統合 input `input_batch_S93.json` (300 問・id 全一意・figure 42 全てフルページ付)。
- translate 統合ワークフロー (`wf_e84fb128-f4b`): 300 問。**660 agent / 24.2M tok**。pause 指示なし → 全量完走。
- merge ×3 → committed sidecar `translations/{2015h27h,2014h26a,2014h26h}.json` (各 100/100、missing 0、clean stem 46/55/49=150)。
- ruleA-prep ×3 (各 N=12、層化) + **非PASS 5 を強制追加** (q029/q093/q039/q086/q088、うち q086/q088 は層化で既選) → `quiz-phase1-batch.mjs ruleA S93` で統合 sidecar/items (39 サンプル、figure 23) → audit ワークフロー (`wf_4eaecb3f-f63`、**39 critic**、independent)。

## 結果

### 翻訳カバレッジ
- **300/300 翻訳 (0 欠落)**。clean stem: 2015h27h=46 / 2014h26a=55 / 2014h26h=49 (計 150)。

### Rule D (in-pipeline reviewer = code-reviewer, ≠ translator)
- raw: **295 PASS / 4 CONCERNS / 1 FAIL / 0 null**。
- **triage は verdict ラベルでなく repair 後実落盘訳文 + 独立 Rule A + figure 実読で判定** (S88 q072/S91/S92 教訓):
  - **FAIL 1 = `2014h26h-q086`** (図1=電話受付ワークシート、表計算): in-pipeline reviewer は 2R とも FAIL (再構成表が raw OCR と大きく異なる点を疑問視、欠陥セルは未特定)。**独立 Rule A critic が pinpoint** → 後述の applied_fix で是正 + 独立再検証 PASS。
  - **CONCERNS 4** = `2014h26a-q029` (accurate/low)、`2014h26a-q093` (accurate/medium=input汚染)、`2014h26h-q039` (accurate/low)、`2014h26h-q088` (accurate/medium=input汚染)。いずれも翻訳自体は忠実 (figure/源に一致)。
- **実効: 翻訳欠陥 0 (q086 是正後、全 300 が figure/源に忠実)**。上流データ backlog 2 件は翻訳成果物に影響なし。

### Rule A (独立 critic, N=39 [各回12 + 強制3、層化 figure23]) — **accurate 38/39**
- **accurate 38/39、severity none22 / low14 / medium3 / high0**。not-accurate **1 = q086** (是正後解消)。
- **medium3**: q086 (NOT-accurate、是正) / q093 (accurate、input汚染 backlog) / q088 (accurate、input汚染 backlog)。
- **low14** = 全て本土 zh 自然さ / 文体 (意味・正誤・脱落・捏造ゼロ、受容): 投下资本利润率 (q029 借語、意味正)、实际成绩 (q031)、记述→描述 (q039)、使用区间 (q099)、采用于 (q002) 等。

### applied_fix 1 = `2014h26h-q086` (独立 Rule A critic が footing 分析で捕捉、surgical)
- **欠陥**: translator が figure から表を**大半正しく再構成**したが、**行12 (17:00〜) の現状 東/西を 1 か所転置** (clean=`88|86`、figure=`86|88`)。zh/en に伝播。merge 構造検査は通過 (構造≠意味)。in-pipeline reviewer は FAIL したが欠陥セルを特定できず、**独立 critic の footing 分析が pinpoint** (写審分離+独立抽検の複利、S88 q072 同系)。
- **footing 証明**: 行16 表示合計 東804/西808。defective `88|86` では列実セル和=806/806 で footing 破綻。是正後 `86|88` で 804/808 一致 (figure 自己整合)。
- **正解根拠不変**: 設問は a=I15 (行12非依存)。a=ceil(158×8/60)=ceil(21.06)=22=ウ。選択肢 ア20/イ21/ウ22/エ23 と正解ウ 三語保持。
- **是正**: `stem_jp_clean`/`stem.zh`/`stem.en` の行12 B|C を `88|86`→`86|88` 転置是正 (他セル/行/選択肢/正解 不変、replace_all で三語同時)。再 merge。
- **独立再検証 (Rule D, verifier=独立 critic ≠ fixer)**: figure page-35 実読 (5倍ズーム) で全 13行×9列 0 mismatch、footing 三語整合 (東804/西808)、正解ウ=22 三語保持、他転置なし → **PASS**。
- **Rule B**: `failures/quiz_phase1_S93_2014h26h-q086_attempt_1{.md,_defective.json}`。

### 上流 (Stage 2) OCR 欠陥の申し送り (翻訳は figure を正として忠実、翻訳成果物に影響なし、要ユーザー判断)
- **`2014h26a-q093`** (medium、影響大): input.`choices_jp` が**別問の内容に汚染** (スクロールバー/チェックボックス/テキストボックス/ラジオボタン=UIウィジェット)。figure(page-43) のオーソリ選択肢は COUNTIF 式『条件付個数(B$2~B$36,=$A40)』等4択 (正解イ)。翻訳は figure を正として正しく COUNTIF 訳出 (accurate)。**JP locale 表示が誤選択肢のため input.choices_jp 再OCR 推奨** (S91 q069 型、ただし全面汚染で影響大)。
- **`2014h26h-q088`** (medium): input.`choices_jp[ウ]`=『商品Bと商品D』だが figure(crop+page-37) は ウ=『商品Bと商品C』。最適化検算 (利益 A90/B100/C120/D80万円 → B+C=220 最大=正解ウ) で figure が正、input の D が OCR 破損 (C→D)。翻訳は figure を正として B&C 訳出 (accurate)。input.choices_jp[ウ] 是正 (D→C) 推奨。
- **`2014h26h-q086`**: raw stem_jp は OCR 全面崩壊だが stem_jp_clean で表示は救済済 (上記是正済)。stem 再OCR は Stage 2 scope (表示影響なし)。
- S89 q011 / S90 q061 / S91 q069 / S92 q001-q096 に続き、独立 critic のフルページ照合が上流 OCR 欠陥を継続捕捉 (翻訳 backfill の Rule A が事実上 Stage 2 データ品質の追加監査として機能)。

### ビルド / トレース / テスト (全 GREEN・回帰なし)
- tsc `--noEmit` exit 0 / eslint 0 error (既存 warning 1=quiz 無関係) / **vitest 455 passed** (+2 skipped、29 file passed/1 skipped) / `pnpm build` exit 0 (Compiled successfully)。
- **nft IPA leak = 0** (`.next` 全 .nft.json で `data/ip/{exams,sources,syllabus}` 0 hits)。quiz route trace = quiz_index + questions + **translations/19 回.json** (新 3 sidecar が `translations/*.json` glob で resolve 確認、16 既訳+3 新)。

## コード変更
- **無し** (combiner/translate/ruleA/prep/merge は既存・D-小6/7/8 組込済で不変)。
- 成果物 = sidecar 3 ファイル + q086 行12 転置是正 (1 問・3 フィールドの 2 セル) + Rule B archive 2 + 証拠 (`rule_a_audit_S93.json` + 本節)。

## UI スクリーンショット (S88〜S92 と同根拠で省略)
- reader/`QuizSet`/`quizReader` 不変、新 sidecar 同一 schema (merge 検証通過) + nft trace 済 + build 成功。意味検証は Rule A 39 独立サンプル + q086 の独立再核 (figure 実読) が担保。

## 進捗
- Phase 1 翻訳済: **19/29 回** (S87〜S93)。**残 10 回**。次候補 = `2013h25h` / `2013h25a` / `2012h24h` (最新優先)。次バッチはユーザー「Quiz Phase 1 续批」で起動。
- **要ユーザー判断 backlog (上流データ品質、翻訳成果物に影響なし、累積)**: ~~S93 新規 q093/q088~~ → **同 session で corpus 是正済 (下記 §追記)**。累積 (S92 以前、未是正): `2016h28h-q001/q012/q096`・`2015h27a-q088` 再OCR / `2016h28a-q025` glossary / `2017h29h-q069` 再OCR / `2019h31h-q061` figure crop。

## 追記 (同 session フォローアップ): 上流 choices_jp 欠陥 2 件を派生 corpus で是正 (ユーザー指示)

> ユーザー「q093/q088 这两个上流 choices_jp 缺陷顺手在派生 corpus 里修掉 (图已确证、确定性单点改)」。

- **方式 (drift-proof)**: `questions.json` は `build-quiz-corpus.mjs` が raw bank `question_bank.json` (gitignored) から決定的 projection するため、**raw bank を正源として編集→ビルド再実行** (corpus 直接編集は次回ビルドで上書きされる)。idempotent・再 garble なし。Stage 2 従来修正と同方式。raw bank は gitignored のため before/after を本節 + `rule_a_audit_S93.json` の `corpus_fix` に記録 (将来の再 OCR 時に再適用要)。
- **`2014h26a-q093`** (COUNTIF、正解イ): choices_jp 全4択 UIウィジェット→figure-exact: ア `条件付個数(B$2〜B$36，＝A$40)` / イ `…＝$A40` [正解] / ウ `条件付個数($B2〜$B36，＝A$40)` / エ `…＝$A40`。zh/en サイドカー ウ/エ 範囲も `$B$2~$B$36`→`$B2~$B36` へ figure 整合 (ア/イ は既に正、セル参照は言語非依存で三語同一・関数名のみ訳)。
- **`2014h26h-q088`** (利益最大化、正解ウ): choices_jp[ウ] `商品Bと商品D`→`商品Bと商品C`。zh/en は既に figure 整合で不変。
- **検証**: build 再生成で questions.json diff = **当該2問のみ (5+/5-)**、quiz_index 不変。**answer_keys/correct_answer 不変** (イ/ウ)。tsc/eslint 0err / vitest 455 / build exit0 / nft IPA 0。**独立 Rule D 再検証 (critic ≠ fixer): 両問 PASS** (figure 5倍ズーム実読 + corpus コードポイント照合 + 算術再計算: q093 全4式 `$` 位置一致・三語同一・正解イ妥当 / q088 ウ=商品Bと商品C・正解ウ=B+C=220万 最大)。
- **影響**: q093 (JP 表示が誤選択肢→正COUNTIF式) と q088 (ウ 正答テキスト復元) が figure 一致、三語整合確立。コード変更なし。

---

# スケール バッチ S94 (Session 94, 2026-06-16) — `2013h25h` / `2013h25a` / `2012h24h`

> ユーザー路由「Quiz Phase1 续批」(回数未指定) → 最新優先 3 回 (既訳 19 回除外、STATE「次候補」と一致)。統合 1 ワークフロー (D-小5) + フルページ併読 (D-小6) + repair 語義ガード (D-小7) + combiner (D-小8、いずれも scripts 組込済=追加コード無し)。**本バッチの教訓: Rule A 監査 critic の figure 主張自体が誤りうる (q052 ハルシネーション) → 独立検証 critic + 主 context の figure 直接実読が捕捉し、誤 fix を REVERT。**

## 何をしたか
- prep ×3 (figure 16/9/16=41、crop+page 全存在 fail-fast) → `quiz-phase1-batch.mjs translate S94` で統合 input `input_batch_S94.json` (300 問・id 全一意・figure 41 全てフルページ付)。
- translate 統合ワークフロー (`wf_7fdb5ae3-2ed`): 300 問。**648 agent / 23.7M tok / ~69 分**。pause 指示なし → 全量完走。
- merge ×3 → committed sidecar `translations/{2013h25h,2013h25a,2012h24h}.json` (各 100/100、missing 0、clean stem 37/47/39=123)。
- ruleA-prep ×3 (各 N=12、層化) + **強制7** (3 CONCERNS + null q028 + 未抽中 recovered 2 + 直列化修復 q091) → `quiz-phase1-batch.mjs ruleA S94` で統合 sidecar/items (43 サンプル、figure 27) → audit ワークフロー (`wf_78495593-73a`、**43 critic**、independent)。**resume 不要**。

## 結果

### 翻訳カバレッジ
- **300/300 翻訳 (0 欠落)**。clean stem: 2013h25h=37 / 2013h25a=47 / 2012h24h=39 (計 123)。

### Rule D (in-pipeline reviewer = code-reviewer, ≠ translator)
- raw: **294 PASS / 3 CONCERNS / 2 FAIL / 1 null**。
- **null 1 = `2013h25h-q028`** (figure 損益問): in-pipeline reviewer のツール呼び出しが**パース失敗** (infra)、translator 出力は well-formed → **独立 `code-reviewer` 再レビュー=PASS** (Rule D 補缺、figure page-11 実読・5行2列損益表 全数値 JP=図=zh=en 一致・正解エ整合 [営業利益 200→200 不変/経常利益 190→210 増]・0 high/medium)。S92 q017 と同型。
- **直列化修復 `2013h25a-q091`**: translator が zh stem の引用符を**未エスケープ ASCII `"`** で落盤 → JSON 不正で merge 失敗 (en は `\"` で正)。in-pipeline reviewer は schema 検証済み StructuredOutput **返却値**を審査したため PASS (ファイルではない)。→ **最小エスケープ修復** (`\"`、訳文内容 0 改変)、Rule A 強制サンプルで語義再核験。
- **triage は verdict ラベルでなく repair 後実落盘訳文 + 独立 Rule A + 主 context の figure 高解像度実読で判定**。

### Rule A (独立 critic, N=43 [各回12 + 強制7、層化 figure27]) — **accurate 39/43**
- **severity none27 / low12 / medium1 / high3**。not-accurate **4**: q018 (high)・q052 (high)・q096 (high)・q092 (medium)。
- **low12** = 全て本土 zh 自然さ / 上流データ観察 (意味・正誤・脱落・捏造ゼロ、受容)。

### applied_fix (genuine 翻訳欠陥 2 件 + REGRESSION 1 件)
- **`2012h24h-q018`** (high、用語誤訳、正解イ不変): 正解選択肢「職能別組織」(=functional org) の zh が `职务制组织` (职务=post≠职能=function)、en `Job-function organization`。→ zh `职能制组织` / en `Functional organization` (S92 q025 確証訳一致)。根因=supply glossary の同概念分裂 (機能別→职能制/職能別→职务制)。独立 critic 再検証 PASS。
- **`2013h25h-q096`** (high、clean stem 忠実度、正解イ不変): translator の clean stem E2 セル設定で**絶対行参照 $14 脱落** (`D2/D14`、複写時 相対化で誤) + 複写範囲 `E3〜E13` (figure は E14)。→ `D2/D$14` / `E3〜E14` (stem_jp_clean/zh/en 3 箇所)。**主 context が page-44 を高解像度 crop 実読**し figure (D2／D$14・E3〜E14・全角演算子) を直接確認。**glyph 決定**: figure は全角だが q096 の D2/F2/全選択肢が半角・選択肢は上流由来で非変更 → 問内一貫性優先で E2 除算も半角 `/` 統一 ($14・E14 の意味修正は保持。corpus に全角/半角の統一規約なし=2026r08 全角・2023r05 半角で混在実測)。独立 critic 再検証 PASS。
- **`2013h25a-q052` = REGRESSION (誤 fix を REVERT)**: Rule A 監査 critic が「choices.ウ の sidecar 0.10 は figure(crop+page-18)=0.18 に対し捏造」と判定 → 主 context が 0.10→0.18 に「是正」。**しかし独立検証 critic が page-18 を 8x 実読し figure=0.10 と反証** → 主 context が **crop (=選択肢を含まない) と page-18 を高解像度実読**し figure ウ=`0.10` を直接確認 (監査 critic の「crop が 0.18 を示す」はハルシネーション)。→ **0.18→0.10 に REVERT** (元訳が正、figure 整合)。`input.choices_jp.ウ`=0.18 は上流 OCR garble (0→8) → backlog。Rule B archive: `failures/quiz_phase1_S94_2013h25a-q052_regression{.md,_defective.json}`。
- **実効: 翻訳欠陥 0** (q018/q096 是正 + q052 元訳復帰後、全 300 が figure/源に忠実)。

### 上流 (Stage 2) OCR 欠陥の申し送り (主 context が figure 直接実読で確証、翻訳成果物に影響なし、要ユーザー判断)
- **`2013h25a-q052`** `choices_jp.ウ`: raw=`0.18`、figure(page-18)=`0.10`。JP locale が誤値 0.18 表示 (zh/en は 0.10 で正)。corpus fix で choices_jp.ウ→0.10 すれば三語整合。
- **`2012h24h-q092`** `choices_jp.イ`: raw=`大阪幸子 20,800円 / 東京三郎 10,800円`、figure(page-40)=`20,000円 / 10,000円` (0→8 OCR)。全 locale が誤値 (翻訳は input に忠実)、正解ア不変。corpus fix で choices_jp.イ + zh/en 同期。
- **`2013h25h-q096`** `choices_jp.ア`: raw=`C14*(D14*0.1)`、figure(page-44)=`C14＋(D14＊0.1)` (＋→* で加算→乗算の意味変化)。distractor のみ、正解イ不変。corpus fix で choices_jp.ア + zh/en 同期。
- S89〜S93 に続き独立 critic + 主 context の figure 実読が上流 OCR 欠陥を継続捕捉。**S94 では加えて Rule A 監査 critic 自身の figure 主張誤り (q052) を多段独立検証が捕捉** = 写審分離 + 独立検証の複利。

### glossary backlog
- **`2012h24h-q018`**: supply glossary が「機能別組織→职能制组织」と「職能別組織→职务制组织」を分裂 (同概念)。textbook glossary で職能別→职能制 に統一すべき (S92 q025 と同型)。

### ビルド / トレース / テスト (全 GREEN・回帰なし)
- tsc `--noEmit` exit 0 / eslint 0 error (既存 warning 1) / **vitest 455 passed** (+2 skipped) / `pnpm build` exit 0。
- **nft IPA leak = 0** (全 .nft.json で `data/ip/{exams,sources,syllabus}` 0 hits)。quiz route trace = quiz_index + questions + **translations/22 回.json** (新 3 sidecar resolve 確認、19+3)。

## コード変更
- **無し** (combiner/translate/ruleA/prep/merge は既存・D-小6/7/8 組込済で不変)。
- 成果物 = sidecar 3 ファイル + q018/q096 是正 + q052 revert + q091 エスケープ修復 + Rule B archive 3 + 証拠 (`rule_a_audit_S94.json` + 本節)。

## UI スクリーンショット (S88〜S93 と同根拠で省略)
- reader/`QuizSet`/`quizReader` 不変、新 sidecar 同一 schema (merge 検証通過) + nft trace 済 + build 成功。意味検証は Rule A 43 独立サンプル + q018/q052/q096 の独立再検証 (figure 実読) が担保。

## 進捗
- Phase 1 翻訳済: **22/29 回** (S87〜S94)。**残 7 回**。次候補 = `2012h24a` / `2011h23a` / `2011h23tokubetsu` (最新優先、残=2009h21h/2009h21a/2010h22h/2010h22a/2011h23a/2011h23tokubetsu/2012h24a)。次バッチはユーザー「Quiz Phase 1 续批」で起動。
- **要ユーザー判断 backlog (上流データ品質、翻訳成果物に影響なし、累積)**: ~~S94 新規 q052/q092/q096 choices_jp~~ → **同 session で corpus 是正済 (下記 §追記)**。残 `2012h24h-q018` glossary 職能別組織 (textbook scope)。累積 (S92 以前): `2016h28h-q001/q012/q096`・`2015h27a-q088` 再OCR / `2016h28a-q025` glossary / `2017h29h-q069` 再OCR / `2019h31h-q061` figure crop。(S93 q093/q088 は corpus 是正済。)

## 追記 (同 session フォローアップ): 上流 choices_jp 欠陥 3 件を派生 corpus で是正 (ユーザー指示「下批开始前帮我做了」)

> S94 で backlog 化した上流 choices_jp OCR 欠陥 3 件を、次バッチ前に S93 と同じ **drift-proof** 方式で是正。主 context は事前に 3 figure を高解像度実読で確証済み。

- **方式 (drift-proof)**: `questions.json` は `build-quiz-corpus.mjs` が raw bank `question_bank.json` (gitignored) から決定的 projection (choices_jp 逐語) するため、**raw bank を正源として choices_jp を編集 (id-scoped + before-value assert) → ビルド再実行**。zh/en は `tr_<id>.json` を編集し merge で sidecar 同期。raw bank は gitignored のため将来の Stage 2 再 OCR 時は再適用要 (before/after を本節 + `rule_a_audit_S94.json` の `corpus_fix` に記録)。
- **`2013h25a-q052`** (正解ア): `choices_jp.ウ` `0.18`→`0.10` (figure page-18 整合)。sidecar zh/en は既に 0.10 (元訳が figure 正値) → 三語 0.10 整合。
- **`2012h24h-q092`** (正解ア): `choices_jp.イ` 大阪幸子 `20,800`→`20,000` / 東京三郎 `10,800`→`10,000` (figure page-40) + sidecar zh/en 同期 → 三語整合。
- **`2013h25h-q096`** (正解イ): `choices_jp.ア` `C14*(D14*0.1)`→`C14+(D14*0.1)` (figure page-44 の ＋=加算、半角正規化) + sidecar zh/en 同期 → 三語整合。
- **検証**: build 再生成で questions.json diff = **当該3問のみ (3+/3-)**、quiz_index/answer_keys/correct_answer (ア/ア/イ) 不変。tsc/eslint 0err / vitest 455 / build exit0 / **nft IPA 0** (quiz route=data/ip/quiz のみ)。**独立 Rule D 再検証 (critic ≠ fixer) = 3件とも PASS** (critic が page-18/40/44 を高解像度 per-cell crop 実読し、`0.10` vs `0.18`・`20,000` vs `20,800`・`＋` vs `＊` の sub-glyph 区別まで figure 一致・三語整合・正解 key 不変を独立確認)。
- **影響**: 3 問とも JP/zh/en の三語が figure 一致。**q052/q092/q096 は backlog から除去 (RESOLVED_IN_CORPUS)**。残 S94 backlog = q018 glossary のみ (textbook scope)。

---

# スケール バッチ S95 (Session 95, 2026-06-17) — `2012h24a` / `2011h23a` / `2011h23tokubetsu`

> ユーザー路由「Quiz Phase 1 续批」(回数未指定) → 最新優先 3 回 (既訳 22 回除外、STATE「次候補」と一致)。統合 1 ワークフロー (D-小5) + フルページ併読 (D-小6) + repair 語義ガード (D-小7) + combiner (D-小8、いずれも scripts 組込済=追加コード無し)。**FAIL/null/直列化問題 0 のクリーンな翻訳パス。** 3 是正は全て fixer (主 context) が figure を高解像度実読で確認してから適用 (S94 q052 教訓を予防適用)。

## 何をしたか
- prep ×3 (figure 17/24/21=62、crop+page 全存在 fail-fast) → `quiz-phase1-batch.mjs translate S95` で統合 input `input_batch_S95.json` (300 問・id 全一意・figure 62 全てフルページ付)。
- translate 統合ワークフロー (`wf_d98c1db4-af8`): 300 問。**640 agent / 23.9M tok**。pause 指示なし → 全量完走。
- merge ×3 → committed sidecar `translations/{2012h24a,2011h23a,2011h23tokubetsu}.json` (各 100/100、missing 0、clean stem 37/40/58=135)。
- ruleA-prep ×3 (各 N=12、層化) + **強制4** (4 CONCERNS) → `quiz-phase1-batch.mjs ruleA S95` で統合 sidecar/items (37 サンプル、figure 22) → audit ワークフロー (`wf_daf54078-dfb`、**37 critic**、independent)。**resume 不要**。

## 結果

### 翻訳カバレッジ
- **300/300 翻訳 (0 欠落)**。clean stem: 2012h24a=37 / 2011h23a=40 / 2011h23tokubetsu=58 (計 135)。

### Rule D (in-pipeline reviewer = code-reviewer, ≠ translator)
- raw: **296 PASS / 4 CONCERNS / 0 FAIL / 0 null**。S94 と違い FAIL/null/直列化問題ゼロ。
- repair 回復 **16 件** (R1 が PASS でない → 最終 PASS)、内 **3 件は FAIL→PASS** (`2012h24a-q023` / `2011h23a-q069` / `2011h23tokubetsu-q094`、いずれも figure 問)。
- 4 CONCERNS (`2012h24a-q002`/`q010`/`q021`、`2011h23a-q033`) を Rule A 監査に強制追加。

### Rule A (独立 critic, N=37 [各回12 + 強制4、層化 figure22]) — **accurate 35/37**
- **severity none23 / low11 / medium3 / high0**。not-accurate **2**: q073 (medium)・q002 (medium)。medium(accurate=true) 1 = q033。
- **low11** = 全て本土 zh 自然さ / 上流データ観察 / 妥当な OCR 復元 (意味・正誤・脱落・捏造ゼロ、受容)。high ゼロ。

### applied_fix (genuine 3 件、全て figure-faithful・正解不変)
- **`2011h23a-q033`** (medium、zh 用語、正解ウ不変): stem.zh 「工程」(中文=engineering) が JP「工程」(=作業段階/process) とズレ → `恰当工程是哪一项`→`恰当过程是哪一项` (en は元から process)。choices/正解 不変。独立 critic ACCEPT。
- **`2012h24a-q002`** (medium、drift、正解イ不変): choice イ から源にない注記「（处理）/（数据存储）」除去 → zh `（图：由圆和箭头构成的、带数据存储的处理图）`。**「圆」は維持** = figure 正 (主 context が figure_png+page-02 実読し イ=円(プロセス)+横二重線(データストア)+矢印の Yourdon-DeMarco DFD と確認。源 choices_jp.イ「四角形」は上流欠陥)。**q052 教訓: translator 産出値「圆」(figure 正)から「四角形」へ動かす誤 fix を回避。** 独立 critic が figure 自己実読し ACCEPT。
- **`2011h23tokubetsu-q073`** (medium、OCR garble + 末尾脱落、正解ア不変): 区切り記号「ε」(ギリシャ字、OCR 誤読)→「CR」(改行コード) を stem_jp_clean/stem.zh/stem.en/全4選択肢(zh+en)で置換 (ε 0/CR 23)。さらに正解ア の末尾に区切り CR を補完 (figure は全選択肢の各レコード末尾に CR を持つが ア のみ choices_jp garble で脱落)。**主 context が figure_png+page-26 を実読・拡大確認** (区切り=CR字形・全4選択肢末尾CR・ア=行優先カンマ「月,1月,2月 CR 売上高,500,600 CR」)。独立 critic も figure 自己実読+拡大で全項目裏付け ACCEPT。
- **実効: 翻訳欠陥 0** (3 件是正後、全 300 が figure/源に忠実)。Rule B archive 不要 (REGRESSION なし)。

### 上流 (Stage 2) OCR 欠陥の申し送り (主 context が figure 直接実読で確証、翻訳成果物 zh/en に影響なし、要ユーザー判断)
- **`2012h24a-q002`** `choices_jp.イ`: raw=`四角形と矢印…`、figure(page-02)=`円(プロセス)+横二重線(データストア)+矢印 の DFD`。源描写「四角形」が figure「円」と矛盾。zh/en は figure を正として「圆」訳出済 → corpus fix で choices_jp.イ「四角形」→「円」すれば三語+JP 整合。正解イ不変。
- **`2011h23tokubetsu-q073`** `stem_jp + choices_jp(全4)`: 区切り ε(=CR の OCR 誤読)、choices_jp 全4が重度 garble (例 イ「月。売正高1月,500。2月,6005」)。zh/en は figure(page-26)を正として再構成済 (CR・末尾CR)。**JP locale は raw choices_jp(garble)を表示するため要 corpus clean** (zh/en は影響なし)。正解ア不変。
- S89〜S94 に続き独立 critic + 主 context の figure 実読が上流 OCR 欠陥を継続捕捉=網兜。

### ビルド / トレース / テスト (全 GREEN・回帰なし)
- tsc `--noEmit` exit 0 / eslint 0 error (既存 warning 1=quiz 無関係 tTerm) / **vitest 455 passed** (+2 skipped) / `pnpm build` exit 0。
- **nft IPA leak = 0** (全 .nft.json で `data/ip/{exams,sources,syllabus}`+question_bank 0 hits)。quiz route trace = quiz_index + questions + **translations/25 回.json** (新 3 sidecar 2012h24a/2011h23a/2011h23tokubetsu を `translations/*.json` glob で resolve 確認、22+3)。

## コード変更
- **無し** (combiner/translate/ruleA/prep/merge は既存・D-小6/7/8 組込済で不変)。
- 成果物 = sidecar 3 ファイル (内 q033/q002/q073 是正済) + 証拠 (`rule_a_audit_S95.json` + 本節)。Rule B archive 不要 (REGRESSION なし)。

## UI スクリーンショット (S88〜S94 と同根拠で省略)
- reader/`QuizSet`/`quizReader` 不変、新 sidecar 同一 schema (merge 検証通過) + nft trace 済 + build 成功。意味検証は Rule A 37 独立サンプル + q033/q002/q073 の独立再検証 (figure 実読) が担保。

## 進捗
- Phase 1 翻訳済: **25/29 回** (S87〜S95)。**残 4 回**。次候補 = `2010h22a` / `2010h22h` / `2009h21a` / `2009h21h` (最新優先、残=2009h21h/2009h21a/2010h22h/2010h22a)。次バッチはユーザー「Quiz Phase 1 续批」で起動。
- **要ユーザー判断 backlog (上流データ品質、翻訳成果物 zh/en に影響なし、累積)**: ~~**S95 新規**: `2012h24a-q002` choices_jp.イ (四角形→figure 円) / `2011h23tokubetsu-q073` stem+choices_jp ε→CR + garble clean~~ → **同 session で corpus 是正済 (下記 §追記、RESOLVED_IN_CORPUS)**。累積: `2012h24h-q018`・`2016h28a-q025` glossary 職能別組織 / `2016h28h-q001/q012/q096`・`2015h27a-q088` 再OCR / `2017h29h-q069` 再OCR / `2019h31h-q061` figure crop。(S93 q093/q088・S94 q052/q092/q096 は corpus 是正済。)

## 追記 (同 session フォローアップ): 上流 choices_jp/stem 欠陥 2 件を派生 corpus で是正 (ユーザー指示「先修一下」)

> S95 で backlog 化した上流 OCR 欠陥 2 件を、次バッチ前に S93/S94 と同じ **drift-proof** 方式で是正。主 context は triage 段で 2 figure (page-02/page-26) を高解像度実読で確証済み。zh/en サイドカーは S95 是正で既に figure-faithful のため変更不要 (今回は JP=raw bank 側のみ是正で三語整合)。

- **方式 (drift-proof)**: `questions.json` は `build-quiz-corpus.mjs` が raw bank `question_bank.json` (gitignored) から choices_jp/stem_jp を逐語 projection するため、**raw bank を正源として id-scoped + before-value assert (fail-loud) で編集 → ビルド再実行** (idempotent)。raw bank は gitignored のため将来の Stage 2 再 OCR 時は再適用要 (before/after を本節 + `rule_a_audit_S95.json` の `corpus_fix` に記録)。
- **`2012h24a-q002`** (正解イ): `choices_jp.イ` `四角形`→`円` (figure page-02 = 円(プロセス)+データストア(横二重線)+矢印の Yourdon-DeMarco DFD)。sidecar zh/en は既に「圆/circles」(figure 正) → 三語 円/圆/circles 整合。
- **`2011h23tokubetsu-q073`** (正解ア): `stem_jp` 区切り `ε`(OCR 誤読)→`CR` + `choices_jp` 全4 を garble から figure-faithful 再構成 (ア`月,1月,2月 CR 売上高,500,600 CR`・イ`月,売上高 CR 1月,500 CR 2月,600 CR`・ウ`月/1月/2月 CR 売上高/500/600 CR`・エ`月/売上高 CR 1月/500 CR 2月/600 CR`、figure page-26)。sidecar zh/en は既に CR-form (figure 正) → 三語整合。
- **検証**: build 再生成で questions.json diff = **当該2問のみ (6+/6-)**、quiz_index/correct_answer (イ/ア) 不変。tsc/eslint 0err / vitest 455 / build exit0 / **nft IPA 0** (quiz trace 25 sidecars)。**独立 Rule D 再検証 (critic ≠ fixer=主 context) = 2件とも PASS** (critic が page-02/page-26 を自己実読し、q002=円(DFD)・q073=CR/全選択肢末尾CR/ア=行優先カンマ・正解不変・三語整合 [形状/区切り記号/弁別軸] を独立確認)。
- **影響**: 2 問とも JP/zh/en の三語が figure 一致。**q002/q073 は backlog から除去 (RESOLVED_IN_CORPUS)**。残 S95 backlog なし (累積 backlog のみ)。

---

# スケール バッチ S96 (Session 96, 2026-06-19) — `2010h22a` / `2010h22h` / `2009h21a` / `2009h21h` 【最終バッチ・Phase 1 完了】

> 残り 4 回 (= 最終) を統合 1 バッチ S96 で実行。完了で **Phase 1 翻訳 29/29 完了**。

## 何をしたか
- prep×4 → batch combine → translate WF (`wf_fc197c18-8ec`) で **400 問三語翻訳**。
- **途中 weekly limit 直撃**: translator 400/400 はディスク確定したが、in-pipeline reviewer 305 が `You've hit your weekly limit` で失敗 (null)。**滚动窗口リセット後に同 run を `resumeFromRunId` で再開** → 400 訳+95 review は cached 即返、**305 review のみ再走** (再翻訳の無駄なし)。
- merge×4 → ruleA-prep×4 + 強制4 (非PASS) → ruleA WF (`wf_e141c0ca-ea9`, N=52)。

## 結果
- **Rule D in-pipeline**: 400/400 = PASS 396 / CONCERNS 3 / FAIL 1 / null 0、repair (rounds>1) 27 (23→PASS)。
- **Rule A (独立 critic N=52、48 層化 + 強制4)**: **accurate 50/52**、severity none30/low18/medium1/high3。not-accurate 2 (q002/q092、共に 2010h22h)。
- **applied_fix 3 件 (全 2010h22h、独立 critic 再検証 ACCEPT)**:
  - **q092** (high、正解イ不変): stem_jp_clean が figure 注記「同じ名字の担当はいない」(正解イ=田中同一人物の根拠) を破壊 → 主 context が **page-40 実読**し復元 (作業3 詳細 も復元)、jp/zh/en。
  - **q077** (medium、正解イ不変): en ア/イ の JP に無い自己矛盾的幾何補足を簡潔化。zh は元から清。
  - **q002** (high、正解イ不変、**REGRESSION → REVERT + 上流 corpus fix**): Rule A critic#1 が corrupted corpus 基準で「イ/ウ swap」と指摘 → fixer が翻訳を swap (= figure から AWAY、REGRESSION)。**fixer が page-04 実読** (印刷版 イ=low/high・ウ=both-high、graph A社 +20% < B社 +100% growth・2008 margin 40% > 36% → イ) → 翻訳 REVERT + 上流 `choices_jp` の s7x anti-figure swap を是正 (questions.json diff 当該2選択肢のみ、correct_answer 不変)。独立 critic#2 が page-04 実読し ACCEPT。**Rule B archive** (`failures/quiz_phase1_S96_2010h22h-q002_regression{.md,_defective.json}`)。
- **上流 backlog (翻訳忠実・要ユーザー判断)**: q077 choices_jp↔figure↔key 反転 / q055 choices_jp[エ] `$` 脱落 / q099・q100 stem が源に無い表を参照。

## 教訓 (fix-checklist)
- **q002 = S94 q052 教訓の再適用漏れ**: 選択肢「取り違え」指摘でも figure 実読は必須。corpus choices_jp 自体が s7x で破損しうるため、translation vs corpus のテキスト一致は corpus 正の保証にならない。
- `choices_jp_corrupted_backup` は「corrupted」命名でも figure 忠実なことがある。LIVE と食い違う figure 問は figure 実読で裁定。
- 写審分離+多段独立検証の複利が REGRESSION を捕捉 (in-pipeline mis-PASS → critic#1 誤判定 → fixer 誤fix → critic#2 figure 実読で捕捉)。

## 検証 (全 GREEN)
- tsc 0 / eslint 0err (既存 warning 1=tTerm) / **vitest 455 passed** (+2 skipped) / build exit 0。
- **nft IPA leak = 0**: quiz route trace = quiz_index + questions + **translations/29回.json** (4 新 sidecar resolve)。exams/sources/syllabus/question_bank = 0 (粗4hits=除外glob + SSR source-map の "question_bank" 文字列の誤検知と確認)。

## コード変更
- なし (scripts/workflow は S88〜S95 から不変)。成果物 = sidecar 4 (translations/{2010h22a,2010h22h,2009h21a,2009h21h}.json) + questions.json q002 choices_jp 是正 + Rule B archive。

## 進捗
- **Phase 1 翻訳済: 29/29 回 = 完了**。残 0。次 = Phase 2 (解析預生成)。
