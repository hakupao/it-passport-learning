# Phase 5 PLAN — 基于 IPA 官方源的 AI 教科書 (D-108 locked)

> **Status**: 设计阶段 ✅ COMPLETE. Stage 1 实施待用户 gate.
>
> **References**: D-108 (Phase 5 direction), D-109 (data directory structure).

---

## §1 Stages

| # | Stage | Scope | 依赖 | Status |
|---|-------|-------|------|--------|
| 1 | シラバス構造化提取 | Download シラバス Ver.6.5 PDF → Claude vision 逐页提取 → `knowledge_tree.json`（大分類→中分類→小分類→用語 完整树）。同时提取試験要綱 → `exam_meta.json` + IT用語集 → `official_glossary.json` | — | ⏸ 待 gate |
| 2 | 過去問全量提取 | Download ~20 年 PDF（問題冊子 + 解答例）→ Claude vision 提取 → `question_bank.json`（~2000 題: 題幹 + 4 选项 + 正答 + 年度 + 出題番号） | — | ⏸ |
| 3 | 知識マッピング | AI 辅助将每道過去問映射到シラバス知識节点 → enriched `question_bank.json` with `syllabus_refs[]`。Rule A N-sample 抽检 | Stage 1 + 2 | ✅ **Session 76 (G3)** — 95.9%一致 / Rule A 妥当率100% / gap 0/63 |
| 3.5 | 後置クリーン (D-127) | low-conf 59題の Opus 跨段重判 + 語彙ギャップ核心語補完 (knowledge_tree)。G4 前置の任意品質クリーン (ユーザー選択) | Stage 3 | ✅ **Session 77** — 補词4 / 重判59(low59→17) / terms清洗17 / Rule A N=20妥当 |
| 4 | AI 教科書生成 | 对シラバス每个末端节点生成三语详细讲解（日主 + 中 + 英）。含例子、图解（Mermaid→SVG）。Pre-computed trilingual。分批生成，cap batch size。Rule A 每批抽检 | Stage 1 + 3 | 🔄 **Session 78 实行设计确定 (D-128〜131)** — Phase A (pilot ToC) 待ち |
| 5 | コードベース整理 | 打 tag 保存当前状态 → 删除废弃代码（Phase 1 pipeline / book reader / book routes / stage scripts）→ 更新 CLAUDE.md 项目描述 | Stage 4 数据就绪后 | ⏸ |
| 6 | Web App 数据統合 | 接入新数据源 → 适配 Quiz（過去問题库）/ Glossary（官方用語）/ 教科書阅读界面（シラバス树导航）→ 测试 → 部署 | Stage 5 | ⏸ |

**Note**: Stage 1 和 Stage 2 相互独立，可并行执行。

---

## §2 数据目录结构 (D-109)

```
data/ip/
├── sources/                    # 下载的 IPA 原始 PDF（gitignored）
│   ├── syllabus_ip_ver6_5.pdf
│   ├── youkou_ver5_5.pdf
│   ├── shiken_yougo_ver5_1.pdf
│   ├── ip_programming_sample.pdf
│   └── exams/
│       ├── 2025r07_ip_qs.pdf
│       ├── 2025r07_ip_ans.pdf
│       └── ...                 # ~40 files (20 years × 2 files)
├── syllabus/                   # Stage 1 提取结果
│   ├── knowledge_tree.json     # 完整シラバス树
│   ├── exam_meta.json          # 試験要綱提取
│   └── official_glossary.json  # IT用語集提取
├── exams/                      # Stage 2 提取结果
│   ├── question_bank.json      # 全量题库（~2000 题）
│   └── by_year/                # 按年度分文件（提取中间产物）
│       ├── 2025r07.json
│       └── ...
├── textbook/                   # Stage 4 AI 生成内容
│   ├── chapters/               # 按大分類组织
│   │   ├── strategy/           # ストラテジ系
│   │   ├── management/         # マネジメント系
│   │   └── technology/         # テクノロジ系
│   └── figures/                # 生成的图解（Mermaid→SVG）
└── output/                     # 最终装配输出
```

---

## §3 Stage 1 详细设计: シラバス構造化提取

### 输入

- シラバス Ver.6.5 PDF (952 KB, ~100+ pages)
- 試験要綱 Ver.5.5 PDF (1,000 KB)
- IT用語集 Ver.5.1 PDF (502 KB)

### 提取方法

Claude vision 逐页（或多页批量）读取 PDF，提取为结构化 JSON。

### knowledge_tree.json schema

```json
{
  "version": "6.5",
  "extracted_at": "ISO8601",
  "categories": [
    {
      "id": "strategy",
      "major": "ストラテジ系",
      "major_en": "Strategy",
      "major_zh": "战略",
      "subcategories": [
        {
          "id": "strategy-1",
          "medium": "企業と法務",
          "medium_en": "Corporate and Legal Affairs",
          "medium_zh": "企业与法务",
          "topics": [
            {
              "id": "strategy-1-1",
              "minor": "企業活動",
              "minor_en": "Corporate Activities",
              "minor_zh": "企业活动",
              "terms": [
                {
                  "term_jp": "経営理念",
                  "term_en": "management philosophy",
                  "term_zh": "经营理念"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### exam_meta.json schema

```json
{
  "exam_name": "ITパスポート試験",
  "duration_minutes": 120,
  "question_count": 100,
  "scoring": "IRT (1000-point scale)",
  "passing_total": 600,
  "passing_per_domain": 300,
  "domain_composition": {
    "strategy": { "approx_questions": 35 },
    "management": { "approx_questions": 20 },
    "technology": { "approx_questions": 45 }
  }
}
```

### Rule A

シラバス提取完成后，N=10 样本独立审核（code-reviewer agent）：随机抽取 10 个小分類节点，对照原 PDF 页面验证用語列表完整性 + 翻译准确性。

---

## §4 Stage 2 详细设计: 過去問全量提取

### 输入

- ~20 年 × 2 PDF（問題冊子 + 解答例）= ~40 files
- 每年 100 題（4 択問題）

### 提取方法

- 按年度分批，每年一个 Claude vision 调用批次
- 每题提取: 問題番号 / 題幹 / ア~エ 四选项 / 正答
- 含图的题目: 提取图的描述或 base64（视 PDF 质量决定）

### question_bank.json schema (per question)

```json
{
  "id": "2025r07-q042",
  "year": "令和7年度",
  "fiscal_year": 2025,
  "question_number": 42,
  "stem_jp": "問題文...",
  "choices_jp": {
    "ア": "選択肢A",
    "イ": "選択肢B",
    "ウ": "選択肢C",
    "エ": "選択肢D"
  },
  "correct_answer": "ウ",
  "has_figure": false,
  "figure_description": null,
  "syllabus_refs": []
}
```

### Rule A

全量提取后，N=20 样本独立审核（每年至少 1 题）：对照原 PDF 验证題幹 + 选项 + 正答的正确性。

---

## §5 Stage 3 详细设计: 知識マッピング (D-126, Session 75 / 実装 Session 76 ✅)

> **Status**: ✅ 完了 (G3, Session 76)。2,900 題 double-pass(95.9%一致) → tie-break(analyst) → reconcile → coverage(gap 0/63) → Rule A N=20(妥当率100%, 0 wrong) → apply。実施証拠: `evidence/phase5/stage_03_mapping.md`。

2,900 題 → `knowledge_tree.json`（63 小分類 / 1,413 用語）にマッピング。

### 设计决策 (D-126)

- **粒度 = 二层**: 小分類 primary + 用語 tags。
- **基数 = primary + secondary[]**: 主小分類 1 + 関連 0〜2。
- **检证 = 双盲 + coverage 分析**（D-125 流用、Rule D）。

### syllabus_refs schema（旧 `[]` を置換）

```json
"syllabus_refs": {
  "primary_topic": "tech-07-01",        // 小分類 id（主）
  "secondary_topics": ["tech-07-02"],   // 小分類 id（0〜2）
  "terms": ["主記憶", "キャッシュメモリ"], // 用語（0〜N）
  "confidence": "high|medium|low",
  "mapping_status": "agree|reconciled|escalated"
}
```

### 手法（G3 起動）

1. syllabus index 準備（63 小分類 + 配下用語、マッパーが Read する参照ファイル）。
2. double-pass: 1 題 2 独立マッパー（異 subagent_type, Rule D）→ {primary, secondary, terms, confidence}。バッチ。
3. reconcile: primary 一致→confirmed / 不一致→escalate。secondary/terms は和集合候補。
4. coverage 分析: 63 小分類別の被マッピング題数、0 題 gap 報告。
5. Rule A: N=20 層化独立監査（第3 subagent_type）。

输出: enriched `question_bank.json` + `by_year/*`。invariants（correct_answer/answer_keys/figure/group/source）不変。
ADR: `docs/decisions/D-126-stage-3-knowledge-mapping-design.md`。

---

## §6 Stage 4 详细设计: AI 教科書生成 (D-114~D-118, Session 64)

### 导航设计 (D-114)

双轨导航：シラバス官方树（自由跳转）+ 推荐路径（テクノロジ→マネジメント→ストラテジ）。

### 生成单元 (D-115)

**学習ユニット**（5~8 用語 / ~15 分钟）为原子生成单位。一个小分類拆分为多个ユニット。

四段结构：
1. **ユニット概要** — 一句话说明 + 出題頻度バッジ + 预计时间
2. **用語講解 × N** — 每个用語含：
   - 一行定義（~30-50 字）
   - やさしい解説（2-3 段，~150-300 字）
   - 身近な例え（类比/场景，~50-100 字）
   - 記憶フック「○○といえば××」(D-116)
   - 図解（Mermaid，约 30% 用語需要）
   - 即時チェック（1-2 道関連過去問，答错触发 AI Tutor）
3. **ユニットまとめ** — 記憶フック一覧 + 正答率サマリー
4. **チャレンジ問題** — 3-5 道混合難度過去問

### 用語排列 (D-117)

ユニット内：概念依赖优先（前置概念先）+ 同级按出題頻度高→低。

### 数字验证

~2,651 用語 / 5-8 per unit = ~330-530 ユニット × 15 min = ~82-132 小时（符合市面建议 100-200 小时）。

### 输出 Schema (D-118)

```
data/ip/textbook/
├── unit_index.json      # 全局索引 + learning_path[]
├── units/{id}.json      # 单ユニット完整内容
└── figures/             # Mermaid → SVG
```

- Unit ID: `{category}-{major_id}{minor_id}-u{nn}`（例: `tech-0701-u01`）
- Quiz 引用不内嵌: `inline_quiz` / `challenge_questions` 存 question_bank ID
- 三语平铺: `_jp` / `_zh` / `_en` 后缀
- 详细 schema 见 Session 64 log

### 三语策略

- 日语为主体（考试语言）
- 中文 + 英文完整翻译（pre-computed，非 real-time API）
- 每个字段用 `_jp` / `_zh` / `_en` 后缀平铺

### 质量控制

- 分批生成，每批 ~10 个ユニット
- 每批 Rule A N=3 独立审核
- Batch size capped（per memory: 长上下文衰减控制）

---

### 实行设计 (D-128~132, Session 78 / G4 起動時に確定)

D-114~118 は内容架构・導航 (高層)。Session 78 で「どう生成するか」を確定:

- **D-128 アーキテクチャ/実行**: 二段式 = **Phase A 規劃 (per-topic LLM → 全書 ToC)** → 廉価 ToC ゲート (ユーザー審査) → **Phase B 内容生成**。**pilot-first** (3 跨類節点: technology-16-43 / management-11-29 / strategy-02-04) で schema+質+吞吐+Rule A を検証してから全量。実行チャネル: **全工程 Claude Code (Workflow/subagents/ultracode, `model=opus`) — 外部 API 不使用 (D-132)**。pilot=小 workflow(3節点) / 全量=大 workflow(63 topic)。
- **D-129 モデル/三語**: 全工程 **Opus** (`model=opus` + ultracode、Claude Code 経路 D-132; API の effort/budget_tokens は不使用)。三語 = **日語権威源 → 二次翻訳** (一致性/可審計/官方術語忠実、pre-computed)。
- **D-130 単元分割/排列**: per-topic LLM 規劃 pass。入力 {topic, terms[], term 題頻, 前置概念} → 出力 = ユニット分割(5〜8語)+順序 (概念依存+頻度, D-117)。ToC 先行確定。
- **D-131 選題/頻度/図解**: 即時チェック=term 題池字符串匹配 / チャレンジ=節点抽样 / 出題頻度=題数分位 (頻出/標準/低頻) / 「混合難度」は捏造せず**年度+term 跨度**で定義。**図解二軌**: ① Mermaid 新図→SVG (`textbook/figures/`)、② Stage2 原裁剪図を `figure_index.json` で索引附加し溯源対照 (unit に `source_figures[]`)。
- **D-132 実行制約**: 全 LLM 工作は **Claude Code (Max plan)** — 外部 Anthropic API / Batches API 不使用。機械装配・図レンダは TS/JS スクリプト。コストは定額、見積りは**吞吐/耗時 + Max plan レート制限**。
- **規模更正**: D-115 の 330〜530 unit は旧推定語数 2,651 ベース。curated tree 1,417 → 実 **~180〜240 unit**。
- schema 拡張: unit に `generated_figures[]` + `source_figures[]`、全局 `figure_index.json`。

> 着手前確認 (Phase A): mmdc/mermaid-cli 工具链 (Phase B 図レンダ、本地 CLI)。**外部 Anthropic API は不使用 (D-132)** — 全 LLM は Claude Code 経路 (Workflow/subagents)。

---

## §7 Stage 5 & 6 概要设计

### Stage 5: コードベース整理

1. `git tag phase4-pre-cleanup-2026-MM-DD` 保存当前状态
2. 删除:
   - `packages/extractor/` (Phase 1 OCR pipeline)
   - `apps/web/src/app/[locale]/book/` (book routes)
   - `apps/web/src/components/Chapter*.tsx` + `Book*.tsx` + `SelectionToolbar.tsx` + `ParagraphTranslate.tsx`
   - `apps/web/src/lib/book/` (chapterScope, translatePrompt, progressStore)
   - 根目录 `stage*` / `scripts/stage*` 脚本
3. 更新 CLAUDE.md 项目描述
4. 更新 NavTabs（移除 Book tab）

### Stage 6: Web App 数据統合

1. 新数据层: シラバス树导航替代章节导航
2. Quiz: 接入過去問题库（替代现有教科書 quiz）
3. Glossary: 接入 IT用語集（替代或增强现有 glossary）
4. 教科書阅读界面: 按シラバス树结构组织 AI 生成内容
5. AI Tutor: 更新 SYSTEM prompt 引用新知識体系
6. 测试 + 部署 + Phase 5 tag

---

## §8 Tier 3 Evidence Convention

Per stage:
- `evidence/phase5/stage_NN_<topic>/` — audit results, design notes
- Rule A audits under `evidence/`
- Rule B failures under `failures/`
- Rule C retro at Phase 5 close: `RETROSPECTIVE_phase5.md`
- Rule D: writer ≠ reviewer for all audits

---

## §9 Gate Sequence

| Gate | Trigger | Action |
|------|---------|--------|
| **G1** Stage 1 | 用户 `开始 Stage 1` | シラバス + 試験要綱 + IT用語集 PDF 下载 & 提取 |
| **G2** Stage 2 | 用户 `开始 Stage 2` 或与 G1 并行 | 過去問 PDF 全量下载 & 提取 |
| **G3** Stage 3 | Stage 1 + 2 完成 | 知識マッピング |
| **G4** Stage 4 | Stage 3 完成 | AI 教科書生成（大量 LLM 调用） |
| **G5** Stage 5 | Stage 4 数据就绪 | 代码清理 |
| **G6** Stage 6 | Stage 5 完成 | Web App 統合 + 部署 |
