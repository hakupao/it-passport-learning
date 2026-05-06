# 项目当前状态 / Project Live State

> **本文件 = "当前累计状态"的真相源**。Session 日志是历史档案（append-only，记录每一步如何达成）；本文件是当下事实快照。两者关系由 **D-028** 锁定。
>
> **更新规则**: 每场 session 结束前 Claude 必须 sync 到本文件（per **D-027** 第 5 条「关 session 前自检」）。读者优先读本文件。

| 字段 | 值 |
|---|---|
| 最后更新 | 2026-05-06 (Session 08 ⏳ **In progress** — Step 6 起手, user 选 (a) 直接开) |
| 当前阶段 | **实施阶段 (Phase 1)** — Step 0~5 ✅; Step 6 子步 6.0-6.3 ✅ (Stage 2 scaffold + 50-page real run + audit), 6.4 (Stage 3) 待启动 |
| Phase 1 状态 | 设计 ✅ + 实施 Step 0~5 ✅ + Step 6.0~6.3 ✅ (Stage 2 scaffold + 50/50 PASS classify + step_02_audit.md) |
| 已锁定决定数 | **73** (D-001 ~ D-073，含 D-071 v1.1 修订) |
| 未决问题数 | **3** open（详见 §4），40 closed |
| GitHub repo | **https://github.com/hakupao/it-passport-learning** (Public, main, head **`decfa90`**) |
| 下一会话 | (本会话进行中) Session 08 子步 6.3 等 user 开门 → Stage 2 真跑 50 pages |

---

## 1. 项目概览

构建一个**资格考试三语学习内容工厂**。第一目标书：

> 《【令和６年度】 いちばんやさしい ITパスポート 絶対合格の教科書＋出る順問題集》(高桥京介)

**核心动机**: 非母语技术学习者卡在日语片假名/平假名的字形识读，而**不是**概念理解。三语对照（日/中/英）+ `kana_helper` 字段 = 直击痛点。

**愿景路线图**:

```
Phase 1: 三语化内容工厂 (本次锁定)
   ↓
Phase 2 (A): 个人备考工具
Phase 3 (B): Web App 题库/学习站
Phase 4 (C): AI 学习助手
   ↓
Phase 5: cert-extractor 通用框架（任意资格教材）
```

---

## 2. Phase 1 当前架构（已锁）

### 2.1 技术栈

- 主语言: **Python 3.11+** (D-024)
- Phase 3 前端: TypeScript / Next.js 或 Astro（Phase 3 才决定，通过文件契约解耦）
- 包管理 / 测试 / 日志: 留 Topic #7 决定

### 2.2 形态：三层 Hybrid (D-023)

```
Layer 3: YAML pipeline 配置 (pipelines/itpassport-r6.yaml)
   ↓ 解析
Layer 2: CLI (cert-extractor run / ocr / inspect ...)
   ↓ 调用
Layer 1: Python 库 (cert_extractor)
   ↓ 实例化
Layer 0: 插件实现 (plugins/source/, plugins/ocr/, ...)
```

GUI **不在 v1**，Phase 3 再考虑。

### 2.3 4 轴可插拔 (D-021)

| 轴 | v1 内置 | 占位接口（v2+ 实现） |
|---|---|---|
| Source Reader | `epub_image` | `pdf` / `txt` / `html` / `docx` / `markdown` |
| OCR Engine | `mistral` | `claude_vision` / `paddle` / `olmocr` / `tesseract` |
| Translator | `claude_sonnet_46` | `gpt` / `gemini` / `deepl` |
| Exporter | `json` / `markdown` / `sqlite` | `anki` / `notion` / `csv` |

### 2.4 数据模型

- **三语** (D-009): 每个文本字段 = `{jp, zh, en}`
- **Hybrid 锚点** (D-022): 每实体保留 `page` + `block_id` + `section_path`
- **Cert-agnostic** (D-010): `cert_id` 顶层区分；`itpassport_r6` 是首个
- **kana_helper** 字段 (D-012): 难读片假名词附 `{surface, reading, zh_concept}`

### 2.5 Pipeline (D-008 + D-011)

```
0. Unpack EPUB → raw/pages/page_NNN.jpg
1. OCR (Mistral) → ocr/page_NNN.md
2. Page Classify (Claude Sonnet) → 标签
3. Hard-page Re-OCR (Claude Vision, 条件触发) → cleaned MD
4. Structure (Claude) → entities (chapters/sections/terms/questions/tables/figures)
4.5 Glossary 抽取 + 锁定 (在翻译前!)
5. Trilingual Translation (Claude, glossary-constrained)
6. Audit (per 规则 A)
7. Export → JSON + JSONL + Markdown + SQLite
```

### 2.6 插件机制 (D-025 + D-026)

- 内部: `@register_<axis>("<name>")` 装饰器 + 自动扫描 `plugins/`
- 第三方: Python `entry_points`（Phase 5 生态用）
- 版本化: 库 semver + 插件 `__cert_extractor_min_version__` 单行声明

### 2.7 OCR 选型 (D-005 + D-006 + D-007)

- 主: **Mistral OCR** (Scale plan, $1/1k pages)
- 难页复核: **Claude Sonnet 4.6 Vision (1M ctx)**

---

## 3. 工程纪律

### 3.1 用户硬规则 (per User CLAUDE.md `<personal_operating_principles>`)

- **A** — 语义抽检 (>50% 压缩或改写必须 N 样本独立抽检)
- **B** — 失败归档不删
- **C** — Retro 强制
- **D** — Writer/Reviewer 分离

### 3.2 讨论操作守则 (D-027)

1. 决定即写入
2. 待定即列入
3. 状态变更即同步
4. Live state vs Historical journal 分离 (本文件 vs session 日志)
5. 关 session 前自检

### 3.3 追溯结构 (Topic #2 ✅ 闭合，全部组件就位)

| 文件 / 目录 | 角色 | 状态 |
|---|---|---|
| `docs/STATE.md` (本文件) | Live state 真相源 | ✅ D-028 已建 |
| `docs/discussion/YYYY-MM-DD-session-NN.md` | Session 编年体日志 | ✅ session-01 (closed) + session-02 (in progress) |
| `docs/discussion/README.md` | 讨论规约 + 操作守则 | ✅ 已建 |
| `docs/decisions/D-NNN-slug.md` | 重大决定 ADR | ✅ 8 条 ADR 已写完 (D-005/008/013/016/021/022/023/024) |
| `docs/decisions/README.md` | ADR 规约 | ✅ 已建 |
| `docs/templates/evidence-template.md` | 抽检证据模板 | ✅ D-030 已建 |
| `docs/templates/failure-template.md` | 失败 attempt 模板 | ✅ D-032 已建 |
| `docs/templates/retrospective-template.md` | Phase 收尾复盘模板 | ✅ D-033 已建 |
| `evidence/` | 抽检证据落点 (per 规则 A) | ⏳ 进入 Phase 1 实施时建 |
| `failures/` | 失败 attempt 归档落点 (per 规则 B) | ⏳ 进入 Phase 1 实施时建 |
| `RETROSPECTIVE.md` | Phase 1 收尾复盘 | ⏳ Phase 1 收尾时由模板拷贝 |

---

## 4. 当前未决问题（open）

| OQ | 问题 | 归 Topic |
|---|---|---|
| OQ-01 | Phase 1 实际要支持的源类型优先级（v1 后） | Topic #1 收尾后开放 |
| OQ-02 | OCR 引擎抽象的更细颗粒度（部分覆盖） | Topic #1 后续 |
| OQ-05 | A/B/C 三个 Phase 的具体形态 + 启动顺序 | Topic #8 |

（已闭合的 OQ-04/06/07/08~39 详见 session-01~06 日志 §3-4）

> **里程碑**:
> - **Phase 1 设计阶段彻底收尾**: Topic #1~#7 ✅ 全闭合（D-001~D-073, 7 独立 ADR）
> - **Phase 1 实施 gate ✅ 解锁**: 等 user 显式 "开始实施" 切阶段
> - 剩余 3 OQ 全在 Phase 1 范围外（Topic #1 后续 / Topic #8 Phase 2-4）

---

## 5. 下一步 / Resume Instructions (current = between Session 07 closed at Step 5 PASS & Session 08 not started)

**Session 01-07 全已闭合**。Phase 1 设计 + 实施起手 + Stage 1 dry-run + Stage B 用户 retro PASS 全部完成。**Phase 1 Step 6 (stage 2-7 + 全本) 是 Session 08 第一题**。

**Session 07 关键产物 (HEAD `652b09e`)**:
- 9 commits: design baseline (`6d4035c`) → phase switch (`c6c3660`) → 包骨架 (`bd6b0c7`) → 核心模块 + 77 tests (`841f5b9`) → 内置 plugins + dry-run CLI + 92 tests (`5c2251c`) → state/log sync (`98f2a63`) → mistralai import fix (`140ce34`) → Step 5 evidence (`4a3958c`) → Session 07 close (`652b09e`)
- 92 unit tests pass
- 50 pages 真实 OCR 数据 + Stage B PASS evidence 落盘 (`evidence/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/step_01_audit.md`)
- 累计成本: $0.05 (Mistral) + $0 (Anthropic max plan)

**Session 08 起手 user 三选**:
- **(a) 直接开 Step 6** — Claude 从 stage 2 page classify 一路实施到 stage 7 + 全本，撞 cap 就停等 user 决策
- **(b) 先升级 Anthropic 双轨** — 加 ANTHROPIC_API_KEY env 走 pay-as-you-go ~$30 全本，不撞 max plan 5h quota（per D-069 §2.4 零代码变更升级）
- **(c) 先复盘 dry-run OCR samples 调 prompt** — review `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/ocr/page_*.md`，针对 known 小问题（HTML entity / 表格化）调 stage 5 翻译 prompt 或 stage 4 structure prompt

### 已锁的仓库形态（D-034 ~ D-053，Topic #3 产物）

```
. (mono-repo, 单 git repo, 所有 Phase 1-5)
├── pyproject.toml                # 根: uv workspace 伞包 (D-038)
│                                 #     hatchling backend (D-036)
│                                 #     requires-python = ">=3.11,<4.0" (D-037)
│                                 #     [tool.uv.workspace] members=["packages/*"] (D-039)
│                                 #     [dependency-groups] dev=[...] (PEP 735)
│                                 #     [tool.pytest.ini_options] testpaths+markers (D-041,042)
├── uv.lock                       # 单根 lock (D-039)
├── README.md                     # ✅ 已建 (D-048)
├── README.zh-CN.md               # ✅ 已建 (D-048)
├── CLAUDE.md                     # ✅ 已建 (D-049, 项目级 Claude 指引)
├── .gitignore                    # ⏳ 关 session 时建 (per D-044/045/046/050)
├── packages/
│   └── extractor/
│       ├── pyproject.toml        # name="cert-extractor", hatchling, runtime deps
│       ├── src/cert_extractor/
│       │   ├── __init__.py
│       │   ├── pipeline.py
│       │   └── plugins/{source,ocr,translator,exporter}/
│       └── tests/                # 测试与 src 平级 (D-040)
│           ├── conftest.py
│           ├── _fixtures/        # 下划线防 pytest collect (D-043)
│           │   ├── MANIFEST.md
│           │   ├── mini_sample.epub      # commit
│           │   └── pages/                # gitignored
│           ├── unit/             # @pytest.mark.unit (D-042)
│           ├── integration/      # @pytest.mark.integration
│           └── e2e/              # @pytest.mark.e2e
├── apps/                         # 未来 Phase 3；暂不入 workspace glob
├── docs/                         # ✅ 已建（共享）
├── pipelines/                    # YAML 配置（共享）
├── package.json                  # 未来加 (pnpm workspace)
├── evidence/                     # 实施期建（规则 A，commit）
├── failures/                     # 实施期建（规则 B，commit）
└── data/                         # 实施期建（runtime，gitignore per D-050）
    └── <cert_id>/runs/<run_id>/
        ├── raw/ ocr/ classified/ cleaned/
        ├── structured/ glossary/ translated/
        └── output/                       # GitHub Release 发版 (D-046)
```

> Canonical pyproject.toml + tests + .gitignore + data 范例见 [`docs/discussion/2026-05-06-session-02.md`](discussion/2026-05-06-session-02.md) §4.1 + §4.2 + §4.3 + §4.5。

### Session 06 ✅ Closed — Topic #7 全闭合 ★ Phase 1 实施 gate 解锁

| Q | OQ | D 锁定 | 一行 spec |
|---|---|---|---|
| — | OQ-06 | (status) | ✅ user 答 max 20 plan ok |
| — | OQ-07 | (status) | ✅ user 答 Scale plan 升级了 |
| Q32 | OQ-35 | **D-069** | Claude Agent SDK + max plan via OAuth；零额外费用起步；**独立 ADR**: `docs/decisions/D-069-anthropic-via-agent-sdk.md` |
| Q33 | OQ-36 | **D-070** | Mistral Python SDK + 50 pages dry-run + user 审核 → 全本 |
| Q34 | OQ-37 | **D-071** | 软硬 cap 三档（wall-time/cost/fail count）+ WARN 等人决 + 重跑上限；**独立 ADR**: `docs/decisions/D-071-budget-cap-and-emergency-halt.md` |
| Q35 | OQ-38 | **D-072** | per-stage cost 进 evidence + run summary 写 cost.json |
| Q36 | OQ-39 | **D-073** | 单 chapter dry-run → user retro → 全本；与规则 C retro 对接；**独立 ADR**: `docs/decisions/D-073-phase1-launch-strategy.md` |

> 历史: Session 01-06 全闭合。Topic #1~#7 全 ✅。**Phase 1 设计阶段彻底收尾**。

### 接续动作（Session 07 起手 / 新 Claude 接手）

1. 读本文件 (`docs/STATE.md`) — 30 秒概览（注意 **Phase 1 实施 gate ✅ 解锁**）
2. 读 `docs/discussion/2026-05-06-session-06.md` §2 + §6（5 D + 关 session 总结 + §6.6 就绪状态总览）
3. 必要时读 7 份 ADR (`D-058` schema / `D-061` reviewer / `D-063` audit failure / `D-065` plugin loading / `D-069` Anthropic SDK / `D-071` budget cap / `D-073` Phase 1 启动)
4. 必要时回看 session-01~05 §2 + §6 复习 D-001~D-068
5. **当前位置**: Topic #7 ✅ 闭合 + **Phase 1 实施 gate 解锁**。Session 07 起手是 user 选择题:
   - **(1) 进入 Phase 1 实施**（design 阶段不写代码 → 解锁；起手实施 dry-run 单 chapter per D-073）
   - **(2) 保留设计阶段** 开 Topic #8 (Phase 2-4 形态) / Topic #9 (Phase 1 实施前 retro 触发条件)
6. 进 Session 07 时按 user 选择执行

---

## 6. 文件权威指南 / Where to Find What

| 想知道...... | 看这里 |
|---|---|
| 项目当前状态全貌 | **本文件 (`docs/STATE.md`)** |
| 某条决定为什么这么定 | session 日志（搜 `D-NNN`），重大决定还有 `docs/decisions/D-NNN-*.md` |
| 已经讨论过什么 | `docs/discussion/` 目录按日期排 |
| 操作守则 / 命名规范 | `docs/discussion/README.md` + `docs/decisions/README.md` |
| 抽检证据 | `evidence/` 实施期落点；模板见 `docs/templates/evidence-template.md` |
| 失败归档 | `failures/` 实施期落点；模板见 `docs/templates/failure-template.md` (D-032) |
| 用户硬规则 | User CLAUDE.md 的 `<personal_operating_principles>` |
