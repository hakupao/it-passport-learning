# 项目当前状态 / Project Live State

> **本文件 = "当前累计状态"的真相源**。Session 日志是历史档案（append-only，记录每一步如何达成）；本文件是当下事实快照。两者关系由 **D-028** 锁定。
>
> **更新规则**: 每场 session 结束前 Claude 必须 sync 到本文件（per **D-027** 第 5 条「关 session 前自检」）。读者优先读本文件。

| 字段 | 值 |
|---|---|
| 最后更新 | 2026-05-06 (Session 02 ✅ **Closed** — Topic #3 全闭合 + GH push 已执行) |
| 当前阶段 | 设计阶段（**未**进入实施；GitHub repo 已建并 push 首 commit `d50432e`） |
| Phase 1 状态 | Topic #1 ✅ + Topic #2 ✅ + **Topic #3 ✅** 已闭合（Q10-Q16 全锁）|
| 已锁定决定数 | **53** (D-001 ~ D-053) |
| 未决问题数 | **6** open（详见 §4），18 closed |
| GitHub repo | **https://github.com/hakupao/it-passport-learning** (Public, main, noreply email) |
| 下一会话 | **Session 03** — 进入 **Topic #4 (schema 深化)**；按慢节奏 (3a) 起手 |

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
| OQ-02 | OCR 引擎抽象的更细颗粒度（部分覆盖） | Topic #4 |
| OQ-04 | 抽检样本量 N 怎么定 | Topic #5 |
| OQ-05 | A/B/C 三个 Phase 的具体形态 + 启动顺序 | Topic #8 |
| OQ-06 | Anthropic API key 就绪状态 | Topic #7 |
| OQ-07 | Mistral Scale plan 升级状态 | Topic #7 |

（已闭合的 OQ-08~OQ-20 详见 session 日志 §4）

---

## 5. 下一步 / Resume Instructions (current = mid-Session 02)

**Session 01 已闭合**。**Session 02 — Topic #3 全闭合 ✅**: Q10-Q16 全锁；剩余 = 关 session 自检 + GH push。

### 已锁的仓库形态（D-034 ~ D-053）

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

### Session 02 进度

| Q | OQ | 状态 |
|---|---|---|
| Q10 | (D-034) | ✅ Session 01 |
| Q11 | (D-035) | ✅ Session 01 |
| Q12 | OQ-16 | ✅ Session 02 (D-036~D-039) |
| Q13 | OQ-17 | ✅ Session 02 (D-040~D-043) |
| Q14 | OQ-18 | ✅ Session 02 (D-044~D-046) |
| Q15 | OQ-19 | ✅ Session 02 (D-048~D-049 + 3 文件落盘) |
| Q16 | OQ-20 | ✅ **本场刚闭合** (D-050~D-053) — **Topic #3 完成** |

### 接续动作（如果新 Claude 中途接手 Session 02）

1. 读本文件 (`docs/STATE.md`) — 30 秒概览
2. 读 `docs/discussion/2026-05-06-session-02.md` §2 + §4.1~§4.5 — 看 D-036~D-053 已锁内容
3. 读 `docs/discussion/2026-05-06-session-01.md` §3 + §4 — 复习 D-001~D-035 + 全部 OQ
4. **当前位置**: Topic #3 全闭合。剩余动作（关 session 流程）:
   - 资料完整性自检（per D-027 第 5 条）
   - 写 session-02 §8 关 session 总结
   - 执行 GH push（per D-047）: git init → 写 .gitignore → 首 commit → `gh repo create --public` → push
5. 下一 Session 03 将进入 **Topic #4 (schema 深化)**

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
