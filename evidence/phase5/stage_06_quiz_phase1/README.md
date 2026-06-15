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
