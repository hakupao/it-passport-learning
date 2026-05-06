# IT Passport Learning — 三语学习内容工厂

> 把一本日语资格考试教材转化为日中英三语学习内容的内容工厂。**Phase 1 = cert-extractor：一个 OCR 驱动、术语表约束、可插拔的翻译 pipeline。**

[![状态: 设计期](https://img.shields.io/badge/status-%E8%AE%BE%E8%AE%A1%E6%9C%9F-lightgrey)](docs/STATE.md)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-%E5%BE%85%E5%AE%9A-lightgrey)](#license--许可)

> 🇬🇧 English version: [README.md](README.md)

---

## ⚠️ 当前状态

**设计阶段，尚未进入实施。代码暂未开始。** 两场设计 session ([01](docs/discussion/2026-05-06-session-01.md) / [02](docs/discussion/2026-05-06-session-02.md)) 已产出 **53 条锁定决定 (D-001 ~ D-053)**，覆盖项目范围 / 架构 / 仓库布局 / 构建工具 / 测试 / Git 政策 / 运行时数据布局。设计期闭合后才进入实施。

要看当前最新状态，先读 **[`docs/STATE.md`](docs/STATE.md)**。

---

## 为什么做这个项目

非母语日语技术考试学习者，卡住的不是**概念**（CPU / TCP/IP / ROI / 等等），而是**假名 / 汉字字形识读**。一旦看过一次 `アクセシビリティ → accessibility → 可访问性`，这个词就记住了。本项目把一本 ITパスポート 教材转成结构化、三语对照、术语锁定的数据集，让所有同样处境的人都能复用。

Phase 1 锁定的目标书仅作为**输入引用** —— 原书内容**不**入版本控制 / 不分发（详见 [License / 许可](#license--许可)）。

---

## Phase 1 一图概览

```
EPUB（扫描图）
   │
   ▼
[ Source Reader（可插拔）]
   │
   ▼
[ OCR — Mistral OCR (主) / Claude Vision (难页)]
   │
   ▼
[ 页面分类 → 难页复核 → 结构化抽取 ]
   │
   ▼
[ 术语表锁定 (terms_glossary.json) ]
   │
   ▼
[ 三语翻译 (Claude，受术语表约束) ]
   │
   ▼
[ 抽检（按规则 A 抽样）]
   │
   ▼
output/
  ├── itpassport.json
  ├── itpassport.jsonl
  ├── itpassport.db
  └── markdown/
```

四轴可插拔: Source Reader / OCR Engine / Translator / Exporter（见 `docs/decisions/D-021-four-axis-pluggable.md`）。

---

## 路线图

| Phase | 目标 | 状态 |
|-------|------|--------|
| **1** | `cert-extractor` Python pipeline (本 repo 核心) | 🚧 设计期 |
| 2 | 个人备考工具 (CLI / Anki / Obsidian — 待定) | ⏳ 后续 |
| 3 | Web 应用 (Next.js 或 Astro — 待定) | ⏳ 后续 |
| 4 | AI 学习助手 (基于三语数据集的 RAG) | ⏳ 后续 |
| 5 | 通用化到任意资格教材 | ⏳ 后续 |

---

## 仓库结构（已锁定，详见 D-034 ~ D-053）

```
.
├── pyproject.toml              # uv workspace 根（hatchling 后端）
├── uv.lock                     # 必 commit（reproducibility）
├── packages/
│   └── extractor/              # cert-extractor 包
│       ├── pyproject.toml
│       ├── src/cert_extractor/
│       └── tests/
│           ├── _fixtures/      # MANIFEST + mini_sample.epub
│           ├── unit/
│           ├── integration/
│           └── e2e/
├── pipelines/                  # YAML pipeline 配置
├── docs/                       # 设计文档 / 决定 / session 日志
│   ├── STATE.md                # ← live state（从这里开始读）
│   ├── discussion/             # 按 session 编年体日志
│   ├── decisions/              # 重大决定 ADR
│   └── templates/              # 证据 / 失败 / 复盘 模板
├── apps/                       # 留给 Phase 3+
├── evidence/                   # 规则 A 抽检证据（commit；实施期建）
├── failures/                   # 规则 B 失败归档（commit；实施期建）
└── data/                       # 运行时 pipeline 产物 — gitignored
    └── <cert_id>/runs/<run_id>/
        ├── raw/ ocr/ classified/ cleaned/
        ├── structured/ glossary/ translated/
        └── output/             # 走 GitHub Release + git tag 发版
```

---

## 文档导航

| 想知道...... | 读这里 |
|---|---|
| 项目当前状态 | **`docs/STATE.md`** |
| 某个决定为什么这么定 | session 日志中搜 `D-NNN`，或重大决定的 ADR (`docs/decisions/`) |
| 讨论历史 | `docs/discussion/`（按 session 一文件） |
| 操作守则 | `docs/discussion/README.md` (D-027) |
| ADR 规约 | `docs/decisions/README.md` (D-029) |
| 证据 / 失败 / 复盘 模板 | `docs/templates/` (D-030 / D-032 / D-033) |

---

## 工程纪律 (Tier 3)

本项目遵循维护者 `~/.claude/CLAUDE.md` 中的四条硬规则：

| 规则 | 要求 |
|------|------|
| **A — 语义抽检** | 任何步骤压缩率 / 改写率 > 50%，必须做 N 样本独立抽检，证据存 `evidence/`。 |
| **B — 失败归档不删** | 所有失败 attempt 归档到 `failures/<stage>/<attempt-id>.md`，绝不删除。 |
| **C — 复盘强制** | 每个 Phase 收尾前必写 `RETROSPECTIVE.md`，至少三段：保留做法 / 必须补上的缺口 / 关键决策复盘。 |
| **D — 审阅隔离** | Writer agent 和 Reviewer agent 不能是同一 `subagent_type`，禁止同 context 自审。 |

---

## 新 contributor / 新 Claude session 阅读指南

1. **30 秒**: `docs/STATE.md`
2. **5 分钟**: `docs/discussion/2026-05-06-session-01.md`（项目立项 + Phase 1 架构）
3. **5 分钟**: `docs/discussion/2026-05-06-session-02.md`（仓库布局 + 工具链）
4. **按需**: `docs/decisions/` 中的 ADR

repo 根还有一份项目级 **`CLAUDE.md`**，是给未来在本 repo 工作的 Claude session 的特定指引。

---

## License / 许可

License **暂时延迟**到 Phase 1 有可运行代码时再加（预期 MIT）。

目标教材本身的著作权属其出版社及作者，本仓库**只引用书目**，**不**入任何原书内容到 git history（见 `.gitignore` + D-045，详见 `docs/discussion/2026-05-06-session-02.md`）。

---

## 作者

由项目所有者维护 —— 等代码落地后欢迎通过 GitHub Issues 反馈 / 提问。
