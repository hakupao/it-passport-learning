# 项目当前状态 / Project Live State

> **本文件 = "当前累计状态"的真相源**。Session 日志是历史档案（append-only）；本文件是当下事实快照。两者关系由 **D-028** 锁定。
>
> **更新规则**: 每场 session 结束前 Claude 必须 sync 到本文件（per **D-027** 第 5 条）。

| 字段 | 值 |
|---|---|
| 最后更新 | **2026-06-02 Session 79 — G4 Phase A 実行完了。pilot 3節点の per-topic 規劃 pass → 統合 ToC。3/3 Rule D PASS。**実行=Claude Code Workflow `wf_9dacedbb-06f` (pipeline: plan=general-purpose/opus → review-and-repair=code-reviewer/opus, 別 subagent_type=Rule D, repair最大3R, ultracode, 外部API不使用 D-132)**。結果: strategy-02-04 知的財産権=3u(8/5/5)/PASS-r1 / management-11-29 サービスマネジメントシステム=5u(全5)/PASS-r2(CONCERNS→修復) / technology-16-43 システムの構成=4u(6/6/6/7)/PASS-r2。計 12 unit / 68 用語。独立確定性検算: term 過不足0・捏造0・重複0・サイズ全5〜8。badge=全63節点分位(低頻<27.7≤標準<39.7≤頻出)。産出: `unit_index.pilot.json` + `.planning/*` + `evidence/stage_04_toc_pilot/{toc_pilot.md,audit.md}`。**次=ユーザー ToC ゲート審査 (D-128-A)、承認後 Phase B 正文生成。** |
| 当前阶段 | **Phase 5 Stage 4 実行中。Phase A(ToC)+B(日語+翻訳) pilot 完了。12 unit 三語 (`_jp/_zh/_en`, 68語×3) + 19図。Rule D 日語12/12・翻訳11+1。Rule A 日語15/15正確・翻訳8/8忠実。日語ゲート承認済。**三語ゲート(Phase B pilot 最終)提出→ユーザー審査待ち**。承認後 全量(63 topic)** |
| 锁定决策 | **132** (D-001 ~ D-132) |
| Open Questions | OQ-01 + OQ-02 (Phase 1 carryover, low priority) |
| 次セッション | **三語ゲート → 全量 (63 topic)**: ① ユーザーが `evidence/phase5/stage_04_content_jp/{sample_trilingual.md,sample_jp.md,audit.md}` + `units/*.json`(三語) + `figures/*.svg` を審査 → Phase B pilot 完了判定。承認 → ② **全量**: Phase A 規劃(残60 topic, `stage4-phaseA-planning.workflow.mjs` を全 topic 入力で)→ToC ゲート→Phase B 日語(`...content-jp...`)→ゲート→翻訳(`...translate...`)→マージ。session 分割 (~12〜18h workflow, 定額 D-132)。**全量前に translator prompt へ「日式借词回避・中国本土標準 IT 用語」指針+例を追加** (pilot Rule A 学び)。残フォロー(非ブロック): low17題 / q065=answer ウ。微小実装決定は session-79。再利用可スクリプト: assemble-planning-input / phaseA-planning.workflow / merge-toc / phaseB-fixtures / phaseB-content-jp.workflow / assemble-units / render-figures / phaseB-translate.workflow / merge-translations / ruleA-audit(jp,translation)。 |

---

## Phase 5: 基于 IPA 官方源的 AI 教科書

### 方向 (D-108)

放弃教科書提取路线（Stage 8-11），转向 IPA 官方源 + AI 生成三语教科書。

| 数据源 | 版本 | 用途 |
|--------|------|------|
| シラバス | Ver.6.5 (2026-01-08) | 知識树骨架 |
| 過去問題 | FY2009~FY2026 (29回, 2900 題) | 题库 + 考点参考 |
| 試験要綱 | Ver.5.5 | 考试元信息 |
| IT用語集 | Ver.5.1 | 官方术語規範 |

### Stage 进度

| Stage | 内容 | Status |
|-------|------|--------|
| 1 | シラバス構造化提取 (Claude vision) | ✅ **Session 65 完成** |
| 2 | 過去問全量提取 (~2900 題) | ✅ **Session 66-67 完成** — 2,860題 (98.6%) |
| 2.5 | OCR 品質修復 + 全量 AI 審査 | ✅ **Session 68-69 完了** — P0-P3修復 + 29套全量AI審査 (935修正, 60題補録, 452図表更新) → 2,900題 29/29×100q |
| 2 補完 | ページマッピング + 図表裁剪 + 検証 + **FAIL修復** | ✅ **Session 70-71 完了** — 502図裁剪 → FAIL 96件を再推定で修復 (93修復+3降格) |
| 2.6 | **データ実測審核** (新視点+外部源で正確度を CI 付き実測) | ✅ **Session 72-73 完了** — 図表(単問16+共有図16群groups.json)+has_figure整合110+Phase C CI(critical 17/100, 母集団≈12%, answer_keys 100%) |
| 2.7 | **全量 stem/choices 源照合・修復** (Phase C 発見の garble≈12%除去) | ✅ **Session 74 完了** — 全2900スキャン→603候補→521修復(double-blind+3way, Rule A 95%)。再CI 残存≈5% |
| 2.7b | **hi-dpi/多ページ二次修復** (残存71フラグ) | ✅ **Session 75 完了 (D-125)** — 300dpi分帯+N/N+1+double-blind→71→10残存(0.34%)。confirmed 20/figure_inherent 15/cleared 28。Rule A監査 N=31(answer映射核験) |
| 3 | 知識マッピング (過去問 → シラバス节点) | ✅ **Session 76 完了 (G3, D-126)** — 2,900題 double-pass(95.9%一致)+tie-break+Rule A N=20(妥当率100%)。gap 0/63、enriched question_bank、invariant不変 |
| 3.5 | **後置クリーン** (low-conf 重判 + 語彙核心語補完) | ✅ **Session 77 完了 (D-127)** — 補词4 / 重判59(↑42低減: low59→17) / terms清洗17 / Rule A N=20(改判6是認, 補词4正[審計duplicate誤判をbackup証伪]) |
| 4 | AI 教科書生成 (三语详细讲解 + 图解) | 🔄 **Session 79 Phase A+B pilot 完了** — 12 unit **三語** (`_jp/_zh/_en`,68語×3)+19図。Rule D 日語12/12・翻訳11+1、Rule A 日語15/15・翻訳8/8。日語ゲート承認。**三語ゲート待ち** → 全量(63 topic) |
| 5 | コードベース整理 | ✅ **Session 63 完成 (提前执行)** |
| 6 | Web App 数据統合 | ⏸ |

Plan: `docs/phase5/PLAN.md`

---

## 基础设施现状 (保留)

| 组件 | 状态 | 说明 |
|------|------|------|
| Next.js 15 app | ✅ 运行中 | `apps/web/` |
| AI Tutor | ✅ Phase 4 完成 | `/api/tutor` + DeepSeek V4 pro / Anthropic Sonnet 4.6 |
| Quiz 系统 | ✅ | Phase 2 QuizExplain + self-report |
| Glossary 系统 | ✅ | Phase 2 悬浮卡 |
| Chat 系统 | ✅ | Phase 2 `/api/chat` |
| i18n 三语 | ✅ | ja / zh / en via next-intl |
| Middleware firewall | ✅ | Basic Auth (D-097) |

---

## Session 63 重构变更摘要

### 新决策

| ID | 内容 |
|----|------|
| **D-110** | Phase 5 提取脚本统一使用 TypeScript，移除 Python 工具链（**D-132 精緻化**: LLM は Claude Code 経路、外部 Anthropic SDK/API は不使用; TS/JS は機械スクリプトのみ）|
| **D-111** | 保留 apps/web/ monorepo 结构，删除 packages/ |
| **D-112** | 历史文档激进归档 — Phase 1-3 session logs + Phase 1 ADRs → `docs/archive/` |
| **D-113** | Stage 5 清理提前到 Session 63 执行（不等 Stage 4） |

### 删除清单

- `packages/extractor/` — Phase 1 OCR pipeline (全部)
- `pyproject.toml` + `uv.lock` — Python 工具链配置
- `scripts/` 旧 Python 脚本 (stage9/10 等)
- `apps/web/src/app/[locale]/book/` — Book 路由 (含 chapter/[nn])
- `apps/web/src/components/Chapter*.tsx` / `Book*.tsx` / `SelectionToolbar.tsx` / `ParagraphTranslate.tsx`
- `apps/web/src/components/shells/*/GamifiedBook.tsx` / `RetroBook.tsx` / `TerminalBook.tsx`
- `apps/web/src/lib/book/` — chapterScope + progressStore 迁移到 `lib/data/`，translatePrompt 删除
- `apps/web/e2e/book.spec.ts`
- `apps/web/_fixtures/` — Phase 1 test fixtures

### 文档归档

- Session logs 1-52 + Phase 1 stage worksheets → `docs/archive/sessions/`
- Phase 1 ADRs (D-005 ~ D-081) → `docs/archive/decisions/`
- Phase 2/3/4 PLANs → `docs/archive/plans/`
- Release notes → `docs/archive/release-notes-legacy/`
- Validation → `docs/archive/validation/`

### 配置更新

- `.gitignore` — 精简，移除 Python 段落
- `CLAUDE.md` / `AGENTS.md` — 反映新结构
- `package.json` — 更新描述
- Nav 组件 — 移除 Book tab (3 themes)
- 首页重定向 — `/book` → `/quiz`

---

## 历史沿革 (Legacy Summary)

| Phase | 时间 | 内容 | Tag |
|-------|------|------|-----|
| Phase 1 | Sessions 1-26 | OCR + LLM content extraction pipeline | `phase1-ship-2026-05-19` |
| Phase 2 | Sessions 27-47 | Next.js web app (chat/quiz/glossary/AI) | `phase2-α-ship-2026-05-21` |
| Phase 3 | Sessions 48-52 | Book reader + progress tracking | `phase3-α-ship-2026-05-22` |
| Phase 4 | Sessions 53-58 | AI tutor (Module A-C done, D pending) | `phase4-α-ship-2026-05-23` |
| Stage 8-10 | Sessions 59-61 | 全书蓝图 + 内容重建 + 图片裁切 | **abandoned per D-108** |
| **Phase 5** | Session 62~ | **IPA 官方源 AI 教科書** | **current** |

### 决策历史

- D-001 ~ D-053: Phase 1 设计 + 实施 (archived)
- D-054 ~ D-093: Phase 2 设计 + 实施
- D-094 ~ D-101: Phase 3
- D-102 ~ D-107: Phase 4 + Stage 8-10
- D-108 ~ D-109: Phase 5 方向転換 + 数据目录
- **D-110 ~ D-113: Session 63 全量重构**
- **D-114 ~ D-118: Session 64 教科書設計（導航 + ユニット架构 + 記憶フック + 排列規則 + JSON Schema）**
- **D-119: Session 71 Stage 2.6 データ実測審核 + Stage 3 ゲート（分層審核 / 外部源許可 / 確実即修・曖昧帰档）**
- **D-120: Session 72 連問共有図「グループ共有図モデル」新設（group_id + groups メタ、sibling は複製せず参照）**
- **D-121: Session 72 duplicate_extraction 系統バグ確認（4件収束）+ 修復方針（PDF再抽出+answer_keys正答復元）+ choice_swap/choice_ocr 新類**
- **D-122: Session 73 Stage 2.7「全量 stem/choices 源照合・修復」新設（Phase C で stem garble≈12%・q085型内容不一致発見、answer_keys は100%健全）。Stage 3 ゲートに追加。**
- **D-123: Session 74 Stage 2.7 を多段パイプライン化（改良scan→scan先行ゲート→欠陥のみ独立検証→検証済のみ適用→再CI）。パイロットで単一パス検出＋即転写適用が不可信（ハルシネーション/プレースホルダ/group見逃し）と実証、却下。scan は印刷文を先に逐語転写。**
- **D-124: Session 74 Stage 2.7 検出を「Opus ブラインド転写→機械的diff」に確定。3パイロットで真因=モデルと実証（default explore は dense日本語OCR不可でエコー/ハルシネーション、Opus は既存173dpi画像で正確）。stored非開示でエコー不能、NFKC+バイグラム類似度で候補抽出（high recall、精度は検証段で担保）。**
- **D-125: Session 75 Stage 2.7b hi-dpi/多ページ二次パス方式を確定。300dpi分帯クロップ（整页高dpiは無効）+ ページN/N+1レンダ + double-blind(explore/code-reviewer) + bank規約正規化(問NN/〔分類〕/図ブロック剥離) + figure_inherent明示分類 + Rule A逐字監査(答案字母映射核験)。残71→10(0.34%)、全answer保存。教訓: NFKC+strip類似度は句読点/記号に盲目→独立逐字監査が機械の盲点を埋める。**
- **D-126: Session 75 Stage 3 知識マッピング設計を確定（ユーザー問答）。二層粒度(小分類primary + 用語tags) / 基数 primary+secondary[](1主+0〜2関連) / 検証=双盲(異subagent_type)+coverage分析。syllabus_refs を `[]`→{primary_topic, secondary_topics[], terms[], confidence, mapping_status} に。invariants 不変。実装は G3。ADR: `D-126-stage-3-knowledge-mapping-design.md`。**
- **D-128〜132: Session 78 Stage 4 (AI 教科書生成) 実行設計を確定。D-128 二段式生成(Phase A 規劃→ToCゲート→Phase B 内容)+pilot-first(3跨類節点)。D-129 全工程 Opus、三語=日語権威源→二次翻訳。D-130 per-topic LLM 規劃 pass(概念依存+頻度)→廉価 ToC ゲート。D-131 即時チェック=term題池/チャレンジ=節点抽样・頻度=題数分位・難度は捏造せず(年度+term跨度)・図解二軌(Mermaid新図 + Stage2原裁剪図を `figure_index.json` 索引附加し溯源)。規模更正(330〜530→~180〜240 unit)。 D-132 実行チャネル: 全 LLM 工作は Claude Code(subagents/Workflow/ultracode, `model=opus`)で実行、外部 Anthropic API/Message Batches API 不使用(ユーザー Max plan・定額; D-128-C Batches 案撤回, D-129 effort は Claude Code 構成, D-110 SDK 条項を精緻化)。ADR: `D-128〜132-*.md`。**
- **D-127: Session 77 Stage 3.5「Stage 3 後置クリーン」を新設（ユーザー選択、G4 前置の任意品質クリーン）。3.5a low-conf 59題を Opus+figure で跨段高精度重判（昇格可なら confidence↑、依然 low は入档、subagent_type 既存4段と相異=Rule D）。3.5b 語彙ギャップ19語を甄别し核心考点語4のみ knowledge_tree へ補完（サービスデスク/セキュリティパッチ/アジャイル/組込みシステム、仮想サーバ等は不補、term 1413→1417 文字列級挿入）。term計数 1413 は総出現数で正(当初「1391修正」案は Set去重の誤判定で撤回)。invariants 不変、バックアップ `.pre-s035`、Rule A/B/D 適用。ADR: `D-127-stage-3.5-post-mapping-cleanup.md`。**

---

## Session 64 新决策

| ID | 内容 |
|----|------|
| **D-114** | 学習路径組織方式 — 双軌導航：シラバス官方树为主导航 + テクノロジ→マネジメント→ストラテジ 推荐路径 |
| **D-115** | 学習ユニット内容架构 — 5~8 用語/~15 min 为原子单位，四段结构（概要→用語講解→まとめ→チャレンジ），深度嵌入即時チェック + AI Tutor |
| **D-116** | 記憶フック「○○といえば××」为每个用語的标准配置 |
| **D-117** | ユニット内用語排列 — 概念依赖优先 + 出題頻度辅助排序 |
| **D-118** | Stage 4 输出 JSON Schema — unit_index.json + units/{id}.json，Quiz 引用不内嵌，三语 `_jp/_zh/_en` 平铺 |

---

## Session 65 Stage 1 完成

### 产出物

| 文件 | 大小 | 内容 |
|------|------|------|
| `data/ip/syllabus/knowledge_tree.json` | 67 KB | 完整シラバス树: 3 categories / 9 大分類 / 23 中分類 / 63 topics / **1,413 用語** |
| `data/ip/syllabus/exam_meta.json` | 1.2 KB | IT Passport 考试元信息 (120分/100問/IRT/合格基準) |
| `data/ip/syllabus/official_glossary.json` | 1.6 KB | 考试用語規約 (記号/言語/表計算仕様) |

### Rule A 审核

N=10 独立抽检 (code-reviewer agent)，**10/10 PASS**。证据: `evidence/phase5/stage_01_audit.md`

---

## Session 66 Stage 2 過去問全量提取

### 产出物

| 文件 | 大小 | 内容 |
|------|------|------|
| `data/ip/exams/question_bank.json` | 2.3 MB | 29回統合: **2,677 題** (stem + choices + answer) |
| `data/ip/exams/answer_keys.json` | 57 KB | 29回 × 100 = **2,900 解答** (100% 正確) |
| `data/ip/exams/by_year/*.json` | 29 files | 年度別 JSON |
| `scripts/ocr-extract-questions.mjs` | — | Tesseract OCR 提取スクリプト |

### 提取統計 (final)

- 29 回試験: FY2009～FY2026 (58 PDF ダウンロード)
- **2,860 / 2,900 題抽出 (98.6%)**
- 解答正確率: 99.9% (2,858/2,860)
- **選択肢完全率: 100% (空選択肢ゼロ)**
- question_bank.json: 2.7 MB

### 提取方法

1. Tesseract OCR (v4, 4回のパーサ改善) → 題幹+解答の基盤データ
2. Claude vision (7並列 agent) → 564 空選択肢を PDF 視覚読取りで補完

証拠: `evidence/phase5/stage_02_audit.md`

---

## Session 68 Stage 2 OCR 品質修復

### 修復統計

| 修復類型 | 数量 |
|---------|------|
| P3 改行+ノイズ | 2,023 |
| P2 文字置換 (TIT→IT, 0SS→OSS, サーパ→サーバ 等) | 763 |
| P1 選択肢溢出切断 | 27 |
| P0 偽Q100/幽霊Q109 削除 | 20 |
| P0 Q1題幹 Claude vision 再抽出 | 13 |
| **合計** | **2,846** |

修復後: 2,840 題、切断題幹 0、幽霊題号 0、空答案 0、P2 残留 0

### 全量 AI 審査方案 (Session 69 で実行)

- 29 套 PDF → 画像変換 + ページマッピング
- 每套 5 分片 (10 ページ/片)、6 並行 agent
- 逐題: 画像 vs JSON 対照 → PASS / FIX
- 図表題: figure_description 追記
- 独立 reviewer 校験 (Rule D)

### 残存課題

- 数字 0↔9 誤認識: ~30+ (計算題に集中)
- 題幹-選択肢不整合: ~14 (2015h27h, 2022r04)
- 欠落問題: ~42 (図表題が主)
- 試験説明残留: 3

### 成果物

| ファイル | 内容 |
|---------|------|
| `scripts/fix-ocr-quality.mjs` | P2+P3+P1 一括修正 |
| `scripts/fix-p0-cleanup.mjs` | 偽Q100/幽霊Q109 除去 |
| `scripts/fix-p0-q1-patch.mjs` | Q1 vision パッチ |
| `evidence/phase5/stage_02_fix_report.md` | 修復証拠 |

---

## Session 69 Stage 2.5 全量 AI 審査完了

### 審査統計

| 指標 | 数値 |
|------|------|
| PDF 画像変換 | 29 PDF → 1,450 ページ PNG |
| 審査対象 | 3,038 題次 (29 agent 並行) |
| PASS | 1,784 (58.7%) |
| FIX 適用 | 935 件 |
| 欠落題補録 | 60 題 |
| 図表更新 | 452 件 |

### 修復後データ品質

| 指標 | 修復前 | 修復後 |
|------|--------|--------|
| 総題数 | 2,840 | **2,900** |
| 100題/套 | 0/29 | **29/29** |
| 空題幹 | 13 | **0** |
| 欠損選択肢 | 若干 | **0** |
| has_figure | ~220 | **358** |
| figure_description | ~0 | **266** |

### Rule D 独立審査

N=15 抽検 (code-reviewer agent, executor とは別): **12/15 PASS → CONDITIONAL PASS**
- 3 件の修正指摘を手動適用済
- 証拠: `evidence/phase5/stage_02_ai_review_audit.md`

### 成果物

| ファイル | 内容 |
|---------|------|
| `data/ip/exams/pages/` | 1,450 PNG |
| `data/ip/exams/reviews/*.json` | 29 審査レポート |
| `data/ip/exams/by_year/*.json` | 29 修正済 JSON (各 100 題) |
| `data/ip/exams/question_bank.json` | 統合 2,900 題 |
| `scripts/apply-ai-review.mjs` | AI 審査修正適用スクリプト |

---

## Session 70 Stage 2 補完

### 実施内容

1. **データ品質修正**: 空答案 28 題を `answer_keys.json` から回填 + 2025r07-q026 手動修正
2. **全量ページマッピング**: 二重チャネル（Tesseract OCR + Claude Vision 29 agent）→ 95.8% 一致率、Vision 採用
3. **図表裁剪**: 502 枚を bbox 座標で裁剪 → `data/ip/exams/figures/`
4. **JSON 回写**: 2,900 題に `source` (ページ溯源) + 493 題に `figure_path` / `figure_bbox_pct` / `figure_type`
5. **全量検証**: 502 枚全数を 13 バッチ agent で目視検証 → 400 PASS / 102 FAIL (20.3%)

### 成果物

| ファイル | 内容 |
|---------|------|
| `data/ip/exams/mappings/*_pages.json` | OCR マッピング (29 套) |
| `data/ip/exams/mappings/*_vision.json` | Vision マッピング (29 套) |
| `data/ip/exams/mappings/final/*.json` | merge 済最終マッピング (29 套) |
| `data/ip/exams/figures/*.png` | 裁剪済図表 (502 枚) |
| `data/ip/exams/figures/_all_fails.json` | 検証 FAIL 一覧 (102 件) |
| `scripts/build-page-mapping.py` | Tesseract OCR マッピング |
| `scripts/compare-and-merge-mappings.mjs` | 二重チャネル比対 |
| `scripts/crop-and-update.mjs` | 裁剪 + JSON 回写 |

---

## Session 71 Stage 2 補完完了（図表 FAIL 修復）

### 実施内容

1. **FAIL 計数調和 (Item 1)**: `_all_fails.json` の `total_fail:102` は誤り。`fails` 配列 97 件のうち 1 件重複 → **真の唯一 FAIL = 96 件**。証拠: `evidence/phase5/stage_02_fail_reconciliation.md` + canonical 清单 `figures/_fails_canonical.json`。
2. **Session 70 成果のコミット (Item 2)**: commit `7f85ca9`（STATE + session-70 ログ + 4 スクリプト）。
3. **図表 96 件修復 (Item 3)**: 主ループ編成 + workflow 並列ビジョンの多ラウンド方式。**93 修復 + 3 降格、未解決 0**。
   - ラウンド 1-3: ESTIMATE(general-purpose) → 確定的裁剪 → VERIFY(explore, Rule D) → loop-until-dry。86 件が自動収束。
   - 手動 7 件: 跨ページ誤マッピング 2 (q097→p42, q061→p24)、位置誤認 2 (q069, q008)、表頭截断 3 (q011, q026, q072)。
   - 降格 3 件: q063 / q090 / q029（真の図表なし、独立確認済）。
   - Rule A/D 最終監査 (code-reviewer, N=15): 14 PASS + 1 → q026 の **stem 汚染バグ**を発見し訂正（図表は正しかった）。
   - 証拠: `evidence/phase5/stage_02_figure_repair.md` + `audit_results_figure_repair.json`。

### データ最終状態

総 2,900 題 / 空答案 0 / figure_repaired 96 / has_figure(path付) 修復済。旧図 96 + 降格 3 を `figures/_rejected/` に温存 (Rule B)。

---

## Next (Session 72) — Stage 2.6 データ実測審核を実行

**Stage 3 の前に Stage 2.6 を完了させる**（D-119 ゲート）。ユーザー指示: 「遺留項ゼロまで実測してから Stage 3」。

実行仕様: **`docs/phase5/STAGE_2.6_AUDIT_PLAN.md`**（決定根拠 `docs/decisions/D-119-stage-2.6-data-audit.md`）。

要点:
1. **全量センサス**（L3 跨题汚染 / L4 図文引用 / L6 答案分布）を全 2,900 題に → フラグ triage。
2. **抽样深核**（L1 再解答逆検査 / L2 跨字段整合 / L5 数字 / L-ext 外部源交叉）を N≈100 層化 + 既知シードで → loop-until-no-new-class。
3. 欠陥は D-119 方針（確実→即時修+backup / 曖昧→帰档）。
4. ゲート 4 条件充足 → **Stage 3 開始**。

**既知シード**: has_figure 孤児 16 (`data/ip/exams/.tmp/repair/orphan_has_figure_no_path.json`) / 題幹-選択肢不整合 ~14 (@2015h27h,2022r04) / 0↔9 数字誤識 ~30 / q026 型 stem 汚染。
