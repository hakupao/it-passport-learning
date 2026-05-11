# 项目当前状态 / Project Live State

> **本文件 = "当前累计状态"的真相源**。Session 日志是历史档案（append-only，记录每一步如何达成）；本文件是当下事实快照。两者关系由 **D-028** 锁定。
>
> **更新规则**: 每场 session 结束前 Claude 必须 sync 到本文件（per **D-027** 第 5 条「关 session 前自检」）。读者优先读本文件。

| 字段 | 值 |
|---|---|
| 最后更新 | 2026-05-11 (**Session 12 in progress — D-078 Stage 7 export v1 design locked**. 4 open Q posed → user answered (Q1=JSON+MD / Q2=per-page / Q3=sidecar polish_items / Q4=dual-gate) → proposal → user 2-override (ASCII `[JP]/[ZH]/[EN]` markers + full D1-D13 Gate A) → D-078 ADR written. Step 6.10 implementation plan in place: TDD scaffold 6.10.1-6.10.6 → user-gated dry-run 6.10.7 → user sample-review 6.10.8 → closure 6.10.9. All-deterministic; no LLM cost.) |
| 当前阶段 | **实施阶段 (Phase 1)** — Step 0~5 ✅; Step 6.0~6.9 ✅; **Step 6.10 Stage 7 export — design ✅ (D-078); implementation pending**; 6.11 / 6.12 pending |
| Phase 1 状态 | 设计 ✅ + Step 0~5 ✅ + Step 6.0~6.8 PASS post Plan-B + Step 6.9 Stage 6 ✅ CLOSED (clean baseline 0 FAIL) + **Step 6.10 Stage 7 design ✅ (D-078 ADR locked): per-page JSON+MD with sidecar polish_items, ASCII language markers, dual gate (full D1-D13 + Stage 7 contract check), CLI `export-trilingual`, target ≥ 40 new tests = suite ≥ 364 pass**. Ready for TDD scaffolding 6.10.1+. |
| 已锁定决定数 | **78** (D-001 ~ D-078；Session 12 新增 D-078 — Stage 7 export v1 design; amends D-008 by scoping v1 to JSON+MD) |
| 未决问题数 | **3** open（详见 §4），40 closed |
| GitHub repo | **https://github.com/hakupao/it-passport-learning** (Public, main, head `50e8d1b` Session-10 close. Session 11 commits pending: worksheet + Stage A snapshot + Session 11 log + Stage B post-dispatch artifacts.) |
| 下一会话 | **Session 12 (current)** — Stage 7 export design D-078 ✅ locked; **next entry point = Step 6.10.1 TDD scaffold** (schema.py + tests, deterministic, no LLM cost); 详见 §5 |

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

## 5. 下一步 / Resume Instructions (current = **Session 11 in progress, Stage B dispatched, awaiting completion + user retro**)

### Session 11 progress (2026-05-11) — **Step 6.9 Stage 6 ✅ CLOSED**

- ✅ Stage A user retro worksheet → 3-Q sign-off (Q1=D / Q2=✓ / Q3=✓)
- ✅ Stage A JSON snapshot: `evidence/.../stage6_review_stageA_rerun2.json` (23KB)
- ✅ Stage B dispatched → halted at page_042 safety FAIL (32/40 audited)
- ✅ Stage B JSON snapshot: `evidence/.../stage6_review_stageB.json` (99KB)
- ✅ Stage B root-cause: both FAILs = detector FPs (page_19 D7 + page_42 D5)
- ✅ Stage B retro worksheet → 5-Q sign-off (Q1=A / Q2=A / Q3=A / Q4=B / Q5=✓)
- ✅ Detector fixes (D5 regex + D7 subset-difference + D9 → INFO) + 4 regression tests
- ✅ Full unit test suite: 324/324 pass (320 base + 4 new)
- ✅ Stage B rerun #2 → 40/40 audited, 21 PASS / 18 WARN / 1 real FAIL (page_22 LLM-caught hallucination); evidence snapshot 133KB
- ✅ Closure worksheet Q1 = B (user hand-edited page_022 entity[2].rows[1][1].en, removed "Activities")
- ✅ Hand-edit documented: `evidence/.../page_022_hand_edit_2026-05-11.md`
- ✅ Stage B rerun #3 → 40/40 audited, **22 PASS / 18 WARN / 0 FAIL**, safety=False, overall=WARN; evidence snapshot 135KB
- ✅ `evidence/.../step_06_audit.md` updated with full Stage B narrative + closure summary + known polish items + sign-off table populated through "Final" row
- ✅ STATE.md synced this turn (per D-027 §3)
- ✅ Session 11 log §7 covers all phases of Stage 6 closure

**Cumulative dry-run shadow cost (post Step 6.9 closure)**: $47.44 + $37.67 = **$85.11 shadow / $0.05 Mistral real / $0 Anthropic real (max-plan OAuth)**

### Step 6.10 Stage 7 export — next entry point (Session 12)

Stage 6 carried forward as "known polish items" (all WARN-level, non-blocking):

- D6 choice_marker_inconsistent ×3 pages (rs=7) → Stage 7 export normalizes zh+en → A/B/C/D, jp keeps ア/イ/ウ/エ
- LLM L3 translation_unfaithful WARN clusters (page_022 ストラテジ→Strategy tautology, page_038 circular EN, suffix inconsistency) → Stage 5 prompt v2 polish item
- D7 numeric_inconsistent WARN ×22 leaves (style/subset only, no conflict) → Stage 5 / Stage 7 normalization candidate
- D11 kana_helper_missing INFO ×11 leaves → Stage 4.5 backfill
- D13 run-level INFO ×2 (g_022 / g_028 glossary surface-concept split) → Stage 4.5 glossary self-consistency

Stage 7 export contract reminders:

- Refuse UNTRANSLATED leaves (D-076 envelope)
- Refuse `answer_index == -1` (D-076 envelope)
- Normalize choice markers (D6 rs=7 carry-forward from Stage 6)
- Document known polish items in release notes for first GitHub Release tag

### Session 10 close summary — Stage 6 scaffold + Stage A 0-FAIL baseline ✅

### Session 10 close summary — Stage 6 scaffold + Stage A 0-FAIL baseline ✅

**D locked**: D-077 — Stage 6 audit reviewer LLM (two-pass deterministic + LLM, two-tier verdict, repair_stage tagging, Stage A 5-page → Stage B 40-page; amends D-063 retry semantics). ADR: `docs/decisions/D-077-stage6-audit-reviewer.md`. Session log: `docs/discussion/2026-05-07-session-10.md`.

**Memory**: new `feedback_quality_over_cost.md` (default to highest-quality / safest design option; do not pre-frame around shadow cost — user feedback Session 10 起手).

**3 commits this session**:
- `39b8710` — Stage 6 audit reviewer scaffold (D-077 + 5 modules + 4 test files + 103 unit tests)
- `a624f28` — D5/D7 false-positive fixes from Stage A retro (D5 short-circuit on 0-question pages; D7 circled-numeral normalization)
- `162aebb` — D7 numeric_inconsistent severity heuristic (FAIL only on real conflict; WARN on style/paraphrase)

**3 LLM dispatches** (Stage A 5-page audit, total 36 calls, $8.42 shadow / $0 billed):
- Stage A #0: surfaced D5+D7 FPs; halted on page_045 safety FAIL
- Stage A re-run #1: D5 fixed, 2 D7 strict FAILs persist
- Stage A re-run #2: 0 FAILs / 5 WARN, clean baseline ready for Stage B

**Stage A re-run #2 result** (current `audit/stage6_review.json`): overall=WARN, safety_failed=False, P/W/F=0/5/0, repair_stage="5". Real catches verified: F-CHOICE-MARKER (page_043 D6) + LLM Phase 2 circular-definition (page_038) + LLM idiomatic 自我完结型 (page_043).

### Next sub-steps for Session 11

| # | Action | LLM ($)? | Status |
|---|---|---|---|
| 6.9.1~6.9.5 | Stage 6 scaffold + 320 unit tests | no | ✅ done (Session 10) |
| Stage A #0/#1/#2 | 5-page audit verification (3 dispatches) | yes ($8.42 shadow) | ✅ done (Session 10) |
| 6.9.7 | Stage A user retro worksheet + 3-Q sign-off | no | ✅ done |
| 6.9.8 | Stage B 40-page audit dispatch (halt) | yes ($7.56 / $0 billed) | ✅ partial (halt @ page_042) |
| 6.9.8a | Stage B user retro worksheet + 5-Q sign-off | no | ✅ done (A/A/A/B/✓) |
| 6.9.8b | Detector fixes (D5 regex + D7 subset + D9 INFO) + 4 regression tests | no | ✅ done (324/324 pass) |
| 6.9.8c | Stage B rerun #2 (full 40-page after fix) | yes ($10.95 / $0 billed) | ✅ done (21/18/1, 1 real LLM-caught FAIL) |
| 6.9.8d | Closure worksheet Q1 = B → user hand-edit page_022 + documented | no | ✅ done |
| 6.9.8e | Stage B rerun #3 (after hand-edit) | yes ($10.75 / $0 billed) | ✅ done (22/18/0 clean) |
| **6.9.9** | **Stage 6 closure — step_06_audit.md narrative + sign-off + STATE sync** | no | ✅ **done — Stage 6 CLOSED** |
| **6.10 design** | **Stage 7 export v1 design — D-078 ADR** (per-page JSON+MD, sidecar polish_items, ASCII markers, dual-gate D1-D13+contract, CLI `export-trilingual`) | no | ✅ done (Session 12, 2026-05-11) |
| 6.10.1 | `schema.py` (Pydantic envelopes + IndexEntry + PolishItem + ReleaseGateResult) + tests | no | ⏸ next entry point (TDD) |
| 6.10.2 | `normalizers.py` (choice_marker_normalize + untranslated_scan) + tests | no | ⏸ |
| 6.10.3 | `gates.py` (Gate A full D1-D13 wrapper + Gate B contract self-check) + tests | no | ⏸ |
| 6.10.4 | `emitters.py` (page_json + page_md + index + polish_items + readme) + tests | no | ⏸ |
| 6.10.5 | `runner.py` (Stage7Export orchestrator) + CLI subcommand `export-trilingual` + tests | no | ⏸ |
| 6.10.6 | Scaffold `evidence/.../step_07_export.md` pre-run snapshot | no | ⏸ |
| 6.10.7 | Dry-run on existing 40-page output (Gate A + Gate B both PASS) | no | ⏸ user-gated |
| 6.10.8 | User sample-reviews page_006.json + page_006.md + polish_items.json | — | ⏸ |
| 6.10.9 | Step 6.10 closure (`step_07_export.md` write-up + STATE sync) | — | ⏸ |
| 6.11 | 全本 579-page Plan-C + GitHub Release (per D-046) | yes (Stages 1-6) | ⏸ |
| 6.12 | Phase 1 RETROSPECTIVE.md (per 规则 C) | no | ⏸ |

### Session 09 + 09b summary (Step 6.8 Stage 5 ✅ post Plan-B)

**Session 09 (false-PASS, then user retro)**:
- 393 trilingual leaves, 6 retry attempts produced 0 untrans residue
- D-074 locked: Stage 5 prompt wrapper-clause
- Closed at PASS, but user retro caught architectural bugs (see Session 09b)

**Session 09b (Plan-B fix)**:
- User retro worksheet (`docs/discussion/2026-05-07-stage5-user-retro-worksheet.md`) + 3 review sub-files caught:
  - Stage 4 `answer_index` bug: page_043 had `[0,0,0,0,0]` should be `[2,2,2,3,2]`
  - Stage 5 `_glossary_lookup` jp-mutation: 10 leaves on 7 pages had `translated.jp != structured.jp`
  - Glossary content: ~10 entries needed translation polish
- D-075 locked: Stage 5 jp-preservation contract + regression test
- D-076 locked: Stage 4 answer-line parsing + envelope `-1` rejection + regression test
- Stage 4 re-run (40 pages) + page_043 re-OCR (vision_full → cleaned/) + glossary 13 patches + Stage 5 re-run (40 pages, opus, chunk=8) + 2 chunk=1 retries on stubborn pages + 2 hand-translations
- **Final: 382/382 leaves translated, 0 UNTRANSLATED, 0 jp mutations, 10/10 question.answer_index match ground truth**
- Cumulative dry-run shadow **$47.44** / $0.05 billed (max-plan OAuth = $0 Anthropic billed)
- 212 unit tests pass (197 base + 15 Plan-B regression guards)

**Open per Plan-B Decision**:
- F-MISTRAL-ANSWER-LINE-LOSS — Phase-2 Stage 3 heuristic enhancement
- F-CHOICE-MARKER — Stage 6 WARN + Stage 7 export normalize
- F-COP21 — partially mitigated by glossary patch; remainder defers to Stage 7
- 2 hand-translations awaiting user verbal sign-off (claude-drafted, doc'd in evidence)

### Next sub-steps (6.9 onwards)

| Sub-step | Content | State |
|---|---|---|
| 6.9 | Stage 6 audit reviewer LLM (per D-060/D-061/D-063) | ⏸ — next entry point |
| 6.10 | Stage 7 export (envelope + JSON/Markdown/SQLite, refuse UNTRANSLATED) | ⏸ |
| 6.11 | 全本 579 pages run (per D-073 Stage C) + GitHub Release (per D-046) | ⏸ |
| 6.12 | Phase 1 收尾 RETROSPECTIVE.md (per 规则 C) | ⏸ |

### Resume entry-point for Session 11

1. Read this file (`docs/STATE.md`) — top table + §5 "Next sub-steps".
2. Read `docs/discussion/2026-05-07-session-10.md` §2 + §6/§7/§8 (D-077 lock, 3 commits, Stage A iteration ledger, close summary).
3. Read `evidence/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/step_06_audit.md` Stage A re-run #2 section (clean baseline) — Session 11 picks up from this verdict.
4. Read `docs/decisions/D-077-stage6-audit-reviewer.md` only if needed for Stage B mechanics (§2.7 Stage B plan + §2.8 halt strategy).
5. Resume at **Step 6.9.8 — Stage B 40-page dispatch**. Command in `step_06_audit.md` "Stage B dispatch plan" section. **GATE**: user must explicitly authorize Stage B LLM dispatch ("go Stage B" / "授权 Stage B"). Stage A re-run #2 user retro is implicit per "下次再跑 Stage B" instruction; if user wants explicit retro on the 5 pages first, present `audit/stage6_review.json` summary before dispatching.

---

## 5b. Historical resume note (pre-Session-09)

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
