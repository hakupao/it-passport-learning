# 项目当前状态 / Project Live State

> **本文件 = "当前累计状态"的真相源**。Session 日志是历史档案（append-only）；本文件是当下事实快照。两者关系由 **D-028** 锁定。
>
> **更新规则**: 每场 session 结束前 Claude 必须 sync 到本文件（per **D-027** 第 5 条）。

| 字段 | 值 |
|---|---|
| 最后更新 | **2026-05-27 Session 69 — Stage 2.5 全量 AI 審査完了** |
| 当前阶段 | **Phase 5 Stage 2.5 完了 → Stage 3 待開始** |
| 锁定决策 | **118** (D-001 ~ D-118) |
| Open Questions | OQ-01 + OQ-02 (Phase 1 carryover, low priority) |

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
| 3 | 知識マッピング (過去問 → シラバス节点) | ⏸ |
| 4 | AI 教科書生成 (三语详细讲解 + 图解) | ⏸ |
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
| **D-110** | Phase 5 提取脚本统一使用 TypeScript + Anthropic TS SDK，移除 Python 工具链 |
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

## Next (Session 70)

1. **Stage 3 開始**: 知識マッピング (過去問 2,900 題 → シラバス 1,413 用語)
